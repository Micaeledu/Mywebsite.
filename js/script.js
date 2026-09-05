document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------------------------------------
     HERO BACKGROUND — satin ribbon shader
  --------------------------------------------- */
  const ribbonCanvas = document.getElementById("hero-ribbon");
  if (ribbonCanvas && !prefersReducedMotion && typeof window.createSatinRibbon === "function") {
    window.createSatinRibbon(ribbonCanvas, {
      background: "#F7F6F2",
      ribbonColor: "#4B3AF0",
      filamentColor: "#FF4B3E",
      bands: 3,
      speed: 40,
      ribbonWidth: 60,
      flow: 130,
      sheen: 85,
      filament: 100,
      hover: 150,
    });
  }

  /* ---------------------------------------------
     CTA BACKGROUND — same satin ribbon, dark variant
  --------------------------------------------- */
  const ctaRibbonCanvas = document.getElementById("cta-ribbon");
  if (ctaRibbonCanvas && !prefersReducedMotion && typeof window.createSatinRibbon === "function") {
    window.createSatinRibbon(ctaRibbonCanvas, {
      background: "#F7F6F2",
      ribbonColor: "#4B3AF0",
      filamentColor: "#FF4B3E",
      bands: 3,
      speed: 40,
      ribbonWidth: 60,
      flow: 130,
      sheen: 85,
      filament: 100,
      hover: 150,
    });
  }

  if (typeof gsap === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------
     HERO ENTRANCE (runs once, on load)
  --------------------------------------------- */
  const heroLines = gsap.utils.toArray(".hero-title .line");
  const heroExtras = [".tag-pill", ".hero-sub", ".hero .btn-whatsapp"];

  if (prefersReducedMotion) {
    gsap.set([...heroLines, ...heroExtras.map((s) => document.querySelector(s))], {
      opacity: 1,
      y: 0,
    });
  } else {
    gsap.set(".tag-pill", { opacity: 0, y: 10 });
    gsap.set(heroLines, { yPercent: 110 });
    gsap.set([".hero-sub", ".hero .btn-whatsapp"], { opacity: 0, y: 16 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(".tag-pill", { opacity: 1, y: 0, duration: 0.5 })
      .to(heroLines, { yPercent: 0, duration: 0.9, stagger: 0.08 }, "-=0.2")
      .to(".hero-sub", { opacity: 1, y: 0, duration: 0.6 }, "-=0.45")
      .to(".hero .btn-whatsapp", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4");
  }

  /* ---------------------------------------------
     GALLERY — pinned horizontal scroll (all screen sizes)
  --------------------------------------------- */
  const gallerySection = document.querySelector(".gallery-section");
  const galleryTrack = document.querySelector(".gallery-track");
  const galleryPin = document.querySelector(".gallery-pin");

  let mm = gsap.matchMedia();

  if (prefersReducedMotion) return;

  gallerySection.classList.add("js-pin-enabled");

  const getDistance = () =>
    Math.max(0, galleryTrack.scrollWidth - window.innerWidth);

  ScrollTrigger.create({
    trigger: galleryPin,
    start: "top top",
    end: () => "+=" + getDistance(),
    pin: true,
    scrub: 1,
    invalidateOnRefresh: true,
    animation: gsap.to(galleryTrack, {
      x: () => -getDistance(),
      ease: "none",
    }),
  });

  /* ---------------------------------------------
     BROWSER MOCK — subtle mouse tilt (fine pointer only)
  --------------------------------------------- */
  mm.add("(pointer: fine) and (min-width: 900px)", () => {
    const cards = gsap.utils.toArray(".project-card");
    const cleanups = [];

    cards.forEach((card) => {
      const mock = card.querySelector(".browser-mock");
      const setRotate = gsap.quickTo(mock, "rotate", {
        duration: 0.5,
        ease: "power3.out",
      });
      const setScale = gsap.quickTo(mock, "scale", {
        duration: 0.5,
        ease: "power3.out",
      });

      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        setRotate(relX * 6);
        setScale(1.02);
      };
      const onLeave = () => {
        setRotate(0);
        setScale(1);
      };

      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  });
});
