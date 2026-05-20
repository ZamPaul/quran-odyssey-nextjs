import React from "react";
import Link from "next/link";
import Image from "next/image";

const CartoonCard = ({ c, idx }) => {
  return (
    <div
      key={c.episode}
      className={[
        "rounded-[var(--radius-lg)] border-[1.5px] p-6 transition-all ease-in-out duration-200",
        "hover:-translate-y-[3px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.07)]",
        c.state === "active"
          ? "bg-brand-cyan/5 border-brand-cyan"
          : "border-neutral-200",
        // `reveal-delay-${(idx % 3) + 1}`,
      ].join(" ")}
    >
      <div className="mb-4 flex items-center justify-between">
        <div
          className={[
            "rounded-[5px] border px-2 py-[3px] text-[11px] font-[plus-b] tracking-[0.06em]",
            c.state === "active"
              ? "border-[color-mix(in_srgb,var(--brand-cyan)_30%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] text-brand-cyan-dark"
              : "border-[0.1px] border-neutral-300 bg-surface-light text-content-muted",
          ].join(" ")}
        >
          {c.badge}
        </div>
        <div className="text-[12px] font-[800] tracking-[0.16em] text-content-subtle">
          {c.episode}
        </div>
      </div>

      <div
        className={`cartoon-character mb-5 flex py-5 w-full items-center justify-center rounded-[18px] bg-white border-[0.1px] ${c.state == "active" ? "border-brand-cyan" : "border-brand-amber"}`}
      >
        {/* <div className="h-10 w-10 rounded-full bg-[color-mix(in_srgb,var(--brand-cyan)_20%,transparent)]" /> */}
        <div className="flex items-center justify-center">{c.svg}</div>
      </div>

      <div className="text-[1.2vw] font-[plus-eb] tracking-[-0.02em] text-content-primary">
        {c.topic}
      </div>
      <p className="mt-2 font-[plus-r] text-[13px] leading-[1.7] text-content-muted">
        {c.desc}
      </p>

      <Link
        href="#"
        className="mt-5 inline-flex items-center gap-2 text-[13px] font-[700] text-brand-cyan-dark transition hover:text-brand-cyan"
      >
        Watch episode
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
};

export default CartoonCard;
