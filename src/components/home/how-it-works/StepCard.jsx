import React from "react";

const StepCard = ({ s, idx }) => {
  return (
    <div
      key={s.num}
      className={[
        "rounded-[var(--radius-lg)] border-[1.5px] border-neutral-200 bg-surface-off-white p-8",
        "hover:-translate-y-[3px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.07)] transition-all ease-in-out duration-200",
        // `reveal-delay-${idx + 1}`,
      ].join(" ")}
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line-light bg-white text-[14px] font-[plus-eb] text-brand-navy">
          {s.num}
        </div>
      </div>

      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[12px] border border-line-light bg-surface-cyan-tint text-brand-cyan">
        {s.icon}
      </div>

      <div className="text-[1.5vw] font-[plus-eb] tracking-[-0.02em] text-content-primary">
        {s.title}
      </div>
      <p className="mt-2 text-[14px] leading-[1.75] text-content-muted">
        {s.text}
      </p>
    </div>
  );
};

export default StepCard;
