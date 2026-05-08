import React from "react";

const Node = ({ n, tone, badge, title, sub, highlight, primary }) => {
  const circleBg =
    tone === "amber"
      ? "linear-gradient(135deg, var(--brand-amber), var(--brand-amber-dark))"
      : tone === "navy"
        ? "linear-gradient(135deg, var(--bg-dark-blue), var(--brand-navy))"
        : tone === "cyan2"
          ? "linear-gradient(135deg, var(--brand-cyan), color-mix(in_srgb,var(--brand-cyan)_70%,white))"
          : "linear-gradient(135deg, var(--brand-cyan), var(--brand-cyan-dark))";

  return (
    <div className="pathway-node flex flex-col items-start gap-3">
      <div
        className="pn-circle flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-[900] text-white bg-brand-navy"
        // style={{ background: circleBg }}
      >
        {n}
      </div>
      <div
        className={[
          "pn-card bg-brand-cyan/30 w-full rounded-[var(--radius-lg)] border px-5 py-4",
          highlight
          ? ""
          : "",
            // ? "border-[color-mix(in_srgb,var(--brand-amber)_35%,transparent)] bg-white/10"
            // : "border-white/10 bg-white/5",
          primary
            ? "ring-1 ring-[color-mix(in_srgb,var(--brand-cyan)_35%,transparent)]"
            : "",
        ].join(" ")}
      >
        <div className="pn-num text-[11px] font-[800] uppercase tracking-[0.12em]">
          {badge}
        </div>
        <div className="pn-title mt-1 text-[16px] font-[plus-eb] tracking-[-0.02em]">
          {title}
        </div>
        <div className="pn-sub mt-1 text-[12px] font-[plus-b]">
          {sub}
        </div>
      </div>
    </div>
  );
};

export default Node;
