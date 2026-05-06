import React from "react";
import Link from "next/link";

const CourseCard = ({ key, idx, c }) => {
  return (
    <div
      key={c.num}
      style={{background: c.gradient }}
      className={[
        "course-card flex flex-col overflow-hidden rounded-[var(--radius-lg)] border-[1.5px] border-neutral-200 bg-white transition-all duration-300 ease-in-out",
        c.featured ? "border-brand-amber" : "border-line-light",
        c.featured
          ? "hover:border-brand-amber-dark hover:shadow-[0_20px_56px_rgba(250,167,26,0.12)]"
          : "hover:border-brand-cyan hover:shadow-[0_20px_56px_rgba(40,183,217,0.10)]",
        "hover:-translate-y-1",
        // `reveal-delay-${(idx % 3) + 1}`,
      ].join(" ")}
      data-level={c.level}
      data-age={c.age}
    >
      <div className="flex items-center justify-between p-6 pb-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-line-light bg-surface-cyan-tint text-brand-navy-dark">
          <span className="text-[14px] font-[900]">{c.num}</span>
        </div>
        <div
          className={[
            "text-[12px] font-[900] tracking-[0.16em]",
            c.featured ? "text-brand-amber-dark" : "text-content-subtle",
          ].join(" ")}
        >
          {c.featured ? "FEATURED" : ""}
        </div>
      </div>

      <div className="p-6 pt-5">
        <div className="text-[1.7vw] font-[plus-eb] tracking-[-0.02em]">
          {c.title}
        </div>
        <p className="mt-2 text-[14px] leading-[1.75] text-content-muted">
          {c.desc}
        </p>

        <div className="mt-5 text-[12px] font-[800] uppercase tracking-[0.10em] text-content-subtle">
          What your child will achieve
        </div>
        <ul className="mt-3 space-y-2 text-[14px] text-content-muted">
          {c.outcomes.map((o) => (
            <li key={o} className="flex gap-2">
              <span className="mt-[3px] inline-flex h-4 w-5 items-center justify-center rounded-full bg-surface-cyan-tint text-brand-cyan-dark">
                ✓
              </span>
              <span className="leading-[1.6]">{o}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-2 text-[12.5px] font-[plus-b]">
          {c.info.map((i) => (
            <span
              key={i}
              className="rounded-full border-[0.1px] border-neutral-400 bg-surface-light px-3 py-2"
            >
              {i}
            </span>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {c.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border-[0.1px] border-neutral-400 bg-white px-3 py-2 text-[12.5px] font-[plus-eb]"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-6 w-full flex items-center justify-between">
          <Link
            href="#"
            className="w-[72%] inline-flex items-center gap-2 rounded-[var(--radius)] bg-brand-amber px-5 py-[11px] text-[14px] font-[plus-b] text-brand-navy transition hover:-translate-y-[1px] hover:bg-brand-amber-dark"
          >
            Enroll Now
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link
            href="#"
            className="w-[25%] rounded-[var(--radius)] border-[0.1px] border-neutral-400 bg-transparent px-4 py-[11px] text-[14px] font-[plus-b] text-content-primary transition hover:bg-surface-light"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
