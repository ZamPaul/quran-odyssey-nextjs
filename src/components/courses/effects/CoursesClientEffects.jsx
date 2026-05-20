"use client";

import { useEffect } from "react";

export default function CoursesClientEffects() {
  useEffect(() => {
    const courseFilters = { level: "all", age: "all" };

    const applyFilters = () => {
      const cards = document.querySelectorAll(".course-card[data-level]");
      let count = 0;

      cards.forEach((card) => {
        const level = card.dataset.level || "";
        const age = card.dataset.age || "";
        const matchLevel = courseFilters.level === "all" || level === courseFilters.level;
        const matchAge = courseFilters.age === "all" || age.includes(courseFilters.age);
        const show = matchLevel && matchAge;
        card.style.display = show ? "" : "none";
        if (show) count += 1;
      });

      const countEl = document.getElementById("courseCount");
      if (countEl) countEl.textContent = String(count);
    };

    const filterChips = Array.from(document.querySelectorAll(".filter-chip"));
    const onChipClick = (chip) => {
      const type = chip.dataset.filter;
      const value = chip.dataset.value;
      if (!type || !value) return;

      courseFilters[type] = value;
      document
        .querySelectorAll(`[data-filter="${type}"]`)
        .forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      applyFilters();
    };

    filterChips.forEach((chip) => {
      chip.addEventListener("click", () => onChipClick(chip));
    });

    const levelChips = Array.from(document.querySelectorAll(".level-chip"));
    levelChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        levelChips.forEach((c) => c.classList.remove("selected"));
        chip.classList.add("selected");
        const lv = chip.dataset.levelFilter;

        const filterBar = document.getElementById("filterBar");
        if (filterBar) filterBar.scrollIntoView({ behavior: "smooth", block: "start" });

        window.setTimeout(() => {
          const target = document.querySelector(
            `[data-filter="level"][data-value="${lv}"]`
          );
          if (target instanceof HTMLElement) target.click();
        }, 600);
      });
    });

    const faqItems = Array.from(document.querySelectorAll(".faq-item"));
    faqItems.forEach((item) => {
      const btn = item.querySelector(".faq-q");
      if (!btn) return;
      btn.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        faqItems.forEach((i) => i.classList.remove("open"));
        if (!isOpen) item.classList.add("open");
      });
    });

    applyFilters();

    return () => {
      // DOM event listeners are bound via closures above; simplest cleanup is page-lifetime.
    };
  }, []);

  return null;
}

