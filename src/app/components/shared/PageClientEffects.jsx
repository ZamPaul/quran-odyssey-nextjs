"use client";

import { useEffect } from "react";

function animateCounter(counterEl, target, durationMs = 1600) {
  let startTs = null;

  const step = (ts) => {
    if (startTs === null) startTs = ts;

    const progress = Math.min((ts - startTs) / durationMs, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    const value = Math.floor(eased * target);
    counterEl.textContent = value.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      counterEl.textContent = target.toLocaleString();
    }
  };

  requestAnimationFrame(step);
}

export default function PageClientEffects() {
  useEffect(() => {
    const progressEl = document.getElementById("scrollProgress");
    const navbarEl = document.getElementById("navbar");

    const onScroll = () => {
      if (progressEl) {
        const scrollable = document.body.scrollHeight - window.innerHeight || 1;
        const pct = (window.scrollY / scrollable) * 100;
        progressEl.style.width = `${pct}%`;
      }

      if (navbarEl) {
        navbarEl.classList.toggle("scrolled", window.scrollY > 40);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.1 }
    );

    document
      .querySelectorAll(".reveal,.reveal-left,.reveal-right")
      .forEach((el) => revealObserver.observe(el));

    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const statItem = entry.target;
          if (statItem.classList.contains("counted")) return;

          statItem.classList.add("counted");
          const counter = statItem.querySelector(".counter");
          const target = Number.parseInt(statItem.dataset.target || "0", 10);
          if (counter && target) animateCounter(counter, target);
        });
      },
      { threshold: 0.3 }
    );

    document
      .querySelectorAll(".stat-item[data-target]")
      .forEach((el) => statObserver.observe(el));

    const preventDefaultLinks = (e) => e.preventDefault();
    const hashLinks = Array.from(document.querySelectorAll('a[href="#"]'));
    hashLinks.forEach((a) => a.addEventListener("click", preventDefaultLinks));

    return () => {
      window.removeEventListener("scroll", onScroll);
      revealObserver.disconnect();
      statObserver.disconnect();
      hashLinks.forEach((a) =>
        a.removeEventListener("click", preventDefaultLinks)
      );
    };
  }, []);

  return null;
}

