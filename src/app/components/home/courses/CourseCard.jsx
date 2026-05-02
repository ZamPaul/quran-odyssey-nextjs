import React from "react";

const CourseCard = ({ c }) => {
  return (
    <div
      key={c.num}
      className={[
        "rounded-[var(--radius-lg)] border-[1.5px] border-neutral-200 bg-white p-7",
        "hover:-translate-y-[3px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.07)] transition-all ease-in-out duration-200",
        // `reveal-delay-${(idx % 3) + 1}`,
      ].join(" ")}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="text-[12px] font-[800] tracking-[0.16em] text-content-subtle">
          {c.num}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border-[2px] border-line-light bg-surface-cyan-tint text-brand-amber">
          {c.icon}
        </div>
      </div>

      <div className="text-[21px] font-[plus-eb] tracking-[-0.02em] text-content-primary">
        {c.title}
      </div>
      <p className="mt-2 text-[14px] leading-[1.75] text-content-muted">
        {c.text}
      </p>
      <div className="mt-5 apply-cyan-chip inline-flex rounded-full px-4 py-2 text-[13px] font-[plus-b]">
        <h2>{c.tag}</h2>
      </div>
    </div>
  );
};

export default CourseCard;
