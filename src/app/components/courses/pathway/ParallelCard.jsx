import React from "react";

const ParallelCard = ({ tone, title, sub, orangeTint }) => {
  const iconStroke =
    tone === "amber" ? "var(--brand-amber)" : "var(--brand-cyan)";
  const iconBg =
    tone === "amber"
      ? "color-mix(in_srgb,var(--brand-amber)_10%,transparent)"
      : "color-mix(in_srgb,var(--brand-cyan)_10%,transparent)";
  const iconBorder =
    tone === "amber"
      ? "color-mix(in_srgb,var(--brand-amber)_20%,transparent)"
      : "color-mix(in_srgb,var(--brand-cyan)_20%,transparent)";

  return (
    <div
      className={[
        "parallel-card flex items-center gap-4 rounded-[var(--radius-lg)] border border-white/10 bg-white/5 px-5 py-4",
        orangeTint
          ? "bg-[color-mix(in_srgb,var(--brand-amber)_10%,transparent)]"
          : "",
      ].join(" ")}
    >
      <div
        className="pc-icon flex h-10 w-10 items-center justify-center rounded-[12px] border"
        style={{ background: iconBg, borderColor: iconBorder }}
      >
        {tone === "amber" ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="8"
              r="4"
              stroke={iconStroke}
              strokeWidth="1.6"
            />
            <path
              d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
              stroke={iconStroke}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              stroke={iconStroke}
              strokeWidth="1.6"
            />
          </svg>
        )}
      </div>
      <div>
        <div className="pc-title text-[14px] font-[900] tracking-[-0.01em] text-white">
          {title}
        </div>
        <div className="pc-sub mt-1 text-[12px] font-[600] text-white/60">
          {sub}
        </div>
      </div>
    </div>
  );
}

export default ParallelCard;
