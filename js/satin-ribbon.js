/* Satin Ribbon — vanilla WebGL port (adapted from an Originkit component) */
(function () {
  var MAX_DPR = 2;
  var MAX_BANDS = 12;

  var VERT_SRC =
    "attribute vec2 a_pos;\n" +
    "void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }\n";

  var FRAG_SRC =
    "#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
    "precision highp float;\n" +
    "#else\n" +
    "precision mediump float;\n" +
    "#endif\n" +
    "uniform vec2  uRes;\n" +
    "uniform float uTime;\n" +
    "uniform vec2  uMouse;\n" +
    "uniform float uHover;\n" +
    "uniform vec3  uBg;\n" +
    "uniform vec3  uTint;\n" +
    "uniform vec3  uFilCol;\n" +
    "uniform float uBands;\n" +
    "uniform float uWidth;\n" +
    "uniform float uFlow;\n" +
    "uniform float uSheen;\n" +
    "uniform float uFilament;\n" +
    "float sat(float x) { return clamp(x, 0.0, 1.0); }\n" +
    "vec3 env(vec3 r) {\n" +
    "    float y = r.y * 0.5 + 0.5;\n" +
    "    vec3 c = mix(vec3(0.90, 0.925, 0.955), vec3(0.455, 0.520, 0.610), pow(sat(1.0 - y), 1.25));\n" +
    "    c = mix(c, vec3(1.0), pow(sat(1.0 - abs(r.y - 0.26) * 3.2), 3.0) * 0.95);\n" +
    "    c = mix(c, vec3(0.300, 0.355, 0.435), pow(sat(1.0 - abs(r.y + 0.42) * 2.6), 2.0) * 0.85);\n" +
    "    c = mix(c, vec3(0.80, 0.845, 0.90), pow(sat(1.0 - abs(r.y + 0.88) * 3.0), 2.0) * 0.5);\n" +
    "    return c;\n" +
    "}\n" +
    "void main() {\n" +
    "    float ar = uRes.x / max(uRes.y, 1.0);\n" +
    "    vec2 uv = gl_FragCoord.xy / uRes;\n" +
    "    vec2 p = (uv - 0.5) * vec2(ar, 1.0);\n" +
    "    float t = uTime * 0.16 * uFlow;\n" +
    "    vec3 L = normalize(vec3(\n" +
    "        mix(-0.55, 0.55, uMouse.x) * (0.35 + uHover * 0.65),\n" +
    "        mix(-0.45, 0.75, uMouse.y) * (0.35 + uHover * 0.65) + 0.35,\n" +
    "        0.82\n" +
    "    ));\n" +
    "    vec3 col = mix(uBg, uBg * 0.92, sat(uv.y * 0.9 + 0.05));\n" +
    "    col = mix(col, min(uBg * 1.06, vec3(1.0)), pow(sat(1.0 - length(p - vec2(-0.25, 0.22)) * 1.1), 2.0) * 0.5);\n" +
    "    for (int i = 0; i < " + MAX_BANDS + "; i++) {\n" +
    "        if (float(i) >= uBands) break;\n" +
    "        float fi = float(i);\n" +
    "        float ph = fi * 2.6;\n" +
    "        float amp = pow(0.86, fi);\n" +
    "        float py = 0.105 * sin(p.x * 2.15 + 0.6 + ph + t) + 0.185 * sin(p.x * 1.05 - 1.2 + ph * 0.7 - t * 0.6);\n" +
    "        float spacing = 0.62 / max(uBands - 1.0, 1.0);\n" +
    "        py += (fi - (uBands - 1.0) * 0.5) * spacing;\n" +
    "        float dpdx = 0.105 * 2.15 * cos(p.x * 2.15 + 0.6 + ph + t)\n" +
    "                   + 0.185 * 1.05 * cos(p.x * 1.05 - 1.2 + ph * 0.7 - t * 0.6);\n" +
    "        float w = uWidth * (0.190 + 0.070 * sin(p.x * 1.7 + 2.0 + ph)) * amp;\n" +
    "        float s = (p.y - py) / max(w, 1e-3);\n" +
    "        float cov = 1.0 - smoothstep(0.94, 1.0, abs(s));\n" +
    "        if (cov <= 0.001) continue;\n" +
    "        float sc = clamp(s, -1.0, 1.0);\n" +
    "        float nz = sqrt(max(1.0 - sc * sc, 0.0));\n" +
    "        vec2 T2 = normalize(vec2(1.0, dpdx));\n" +
    "        vec3 along = vec3(T2, 0.0);\n" +
    "        vec3 across = vec3(-T2.y, T2.x, 0.0);\n" +
    "        float na = 0.42 * sin(p.x * 6.5 + sc * 2.0 + ph) + 0.16 * sin(p.x * 17.0 - t * 3.0);\n" +
    "        vec3 N = normalize(across * sc + vec3(0.0, 0.0, 1.0) * nz + along * na);\n" +
    "        vec3 V = vec3(0.0, 0.0, 1.0);\n" +
    "        vec3 R = reflect(-V, N);\n" +
    "        vec3 base = env(R) * uTint;\n" +
    "        float spec = pow(sat(dot(reflect(-L, N), V)), 48.0);\n" +
    "        float sheen = pow(sat(1.0 - abs(dot(N, V))), 2.4);\n" +
    "        vec3 body = base * (0.86 + 0.18 * sat(dot(N, L)))\n" +
    "                  + vec3(1.0) * spec * 0.85 * uSheen\n" +
    "                  + vec3(0.98, 0.99, 1.0) * sheen * 0.16 * uSheen;\n" +
    "        float k = abs(sc);\n" +
    "        float fil = 0.0;\n" +
    "        fil += exp(-pow((k - 0.885) / 0.014, 2.0));\n" +
    "        fil += 0.70 * exp(-pow((k - 0.945) / 0.009, 2.0));\n" +
    "        fil += 0.45 * exp(-pow((k - 0.560) / 0.010, 2.0));\n" +
    "        fil += 0.30 * exp(-pow((k - 0.330) / 0.008, 2.0));\n" +
    "        fil *= uFilament;\n" +
    "        float lit = 0.35 + 0.65 * sat(dot(N, L));\n" +
    "        body += uFilCol * fil * lit * 1.15;\n" +
    "        body += mix(uFilCol, vec3(1.0), 0.45) * fil * spec * 1.4;\n" +
    "        body *= 0.86 + 0.30 * pow(sat(1.0 - k), 0.7);\n" +
    "        col = mix(col, body, cov * pow(0.92, fi));\n" +
    "    }\n" +
    "    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);\n" +
    "}\n";

  function parseColor(input, fb) {
    if (!input) return fb;
    var str = String(input).trim();
    if (str.charAt(0) === "#") {
      var hex = str.slice(1);
      if (hex.length === 3 || hex.length === 4) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      if (hex.length >= 6) {
        var r = parseInt(hex.slice(0, 2), 16);
        var g = parseInt(hex.slice(2, 4), 16);
        var b = parseInt(hex.slice(4, 6), 16);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r / 255, g / 255, b / 255];
      }
      return fb;
    }
    var m = str.match(/[\d.]+/g);
    if (m && m.length >= 3) {
      return [
        Math.min(255, parseFloat(m[0])) / 255,
        Math.min(255, parseFloat(m[1])) / 255,
        Math.min(255, parseFloat(m[2])) / 255,
      ];
    }
    return fb;
  }

  function clampN(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error("SatinRibbon shader:", gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function createSatinRibbon(canvas, opts) {
    opts = opts || {};
    var gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false });
    if (!gl) {
      console.error("SatinRibbon: WebGL unavailable");
      return function () {};
    }

    var vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return function () {};
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("SatinRibbon link:", gl.getProgramInfoLog(prog));
      return function () {};
    }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var posLoc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    var locs = {};
    function u(name) {
      if (!(name in locs)) locs[name] = gl.getUniformLocation(prog, name);
      return locs[name];
    }

    var v = {
      bg: opts.background || "#F7F6F2",
      tint: opts.ribbonColor || "#4B3AF0",
      fil: opts.filamentColor || "#FF4B3E",
      bands: Math.round(clampN(opts.bands != null ? opts.bands : 3, 1, MAX_BANDS)),
      speed: clampN(opts.speed != null ? opts.speed : 45, 0, 100) / 50,
      rw: clampN(opts.ribbonWidth != null ? opts.ribbonWidth : 60, 40, 220) / 100,
      flow: clampN(opts.flow != null ? opts.flow : 140, 0, 250) / 100,
      sheen: clampN(opts.sheen != null ? opts.sheen : 90, 0, 200) / 100,
      filament: clampN(opts.filament != null ? opts.filament : 110, 0, 200) / 100,
      hover: clampN(opts.hover != null ? opts.hover : 160, 0, 200) / 100,
    };

    var ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, on: 0, onTarget: 0 };

    var raf = 0;
    var last = performance.now();
    var clock = 0;
    var destroyed = false;

    function render(now) {
      if (destroyed) return;
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock = (clock + dt * v.speed) % 3600;

      var k = 1 - Math.exp(-6 * dt);
      ptr.on += (ptr.onTarget - ptr.on) * k;
      ptr.x += ((ptr.onTarget > 0 ? ptr.tx : 0.5) - ptr.x) * k;
      ptr.y += ((ptr.onTarget > 0 ? ptr.ty : 0.5) - ptr.y) * k;

      var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      var cw = canvas.clientWidth || 1200;
      var ch = canvas.clientHeight || 800;
      var bw = Math.max(1, Math.round(cw * dpr));
      var bh = Math.max(1, Math.round(ch * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      gl.viewport(0, 0, bw, bh);

      var bg = parseColor(v.bg, [0.969, 0.965, 0.949]);
      var tint = parseColor(v.tint, [0.294, 0.229, 0.941]);
      var fil = parseColor(v.fil, [1.0, 0.294, 0.243]);

      gl.uniform2f(u("uRes"), bw, bh);
      gl.uniform1f(u("uTime"), clock);
      gl.uniform2f(u("uMouse"), ptr.x, 1 - ptr.y);
      gl.uniform1f(u("uHover"), Math.min(1, ptr.on) * v.hover);
      gl.uniform3f(u("uBg"), bg[0], bg[1], bg[2]);
      gl.uniform3f(u("uTint"), tint[0], tint[1], tint[2]);
      gl.uniform3f(u("uFilCol"), fil[0], fil[1], fil[2]);
      gl.uniform1f(u("uBands"), v.bands);
      gl.uniform1f(u("uWidth"), v.rw);
      gl.uniform1f(u("uFlow"), v.flow);
      gl.uniform1f(u("uSheen"), v.sheen);
      gl.uniform1f(u("uFilament"), v.filament);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(render);
    }

    function track(e) {
      var r = canvas.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      ptr.tx = clampN((e.clientX - r.left) / r.width, 0, 1);
      ptr.ty = clampN((e.clientY - r.top) / r.height, 0, 1);
      ptr.onTarget = 1;
    }
    function onLeave() {
      ptr.onTarget = 0;
    }

    canvas.addEventListener("pointermove", track);
    canvas.addEventListener("pointerenter", track);
    canvas.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(render);

    return function destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", track);
      canvas.removeEventListener("pointerenter", track);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }

  window.createSatinRibbon = createSatinRibbon;
})();
