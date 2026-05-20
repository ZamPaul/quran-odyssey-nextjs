import React from "react";

const TestimonialCard = ({ t, idx, className }) => {
  return (
    <div
      key={t.author}
      className={[
        "testimonial-card rounded-[var(--radius-lg)] border-[1.5px] p-7 transition",
        t.featured
          ? "border-transparent bg-brand-navy text-white"
          : "border-neutral-300 bg-white hover:-translate-y-[3px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.07)]",
        // `reveal-delay-${idx + 1}`,
          "transition-all ease-in-out duration-200"
      ].join(" ")}
    >
      {!t.featured ? (
        <svg
          className="quote-icon mb-4 text-content-subtle"
          width="40"
          height="32"
          viewBox="0 0 40 32"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0 20V32h12V20H4C4 13.4 6.7 8.7 12 6L10 2C4 4.7 0 11.3 0 20zm20 0V32h12V20h-8c0-6.6 2.7-11.3 8-14l-2-4c-6 2.7-10 9.3-10 18z"
            fill="currentColor"
          />
        </svg>
      ) : null}

      <div className="stars mb-4 flex gap-1 text-brand-amber">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="star">
            ★
          </span>
        ))}
      </div>

      <p
        className={[
          "testimonial-text text-[14px] leading-[1.75]",
          t.featured ? "text-white/85" : "text-content-muted",
        ].join(" ")}
      >
        {t.text}
      </p>

      <div
        className={[
          "t-divider my-6 h-px w-full",
          t.featured ? "bg-white/10" : "bg-line-light",
        ].join(" ")}
      />

      <div
        className={[
          "t-author text-[14px] font-[800]",
          t.featured ? "text-white" : "text-content-primary",
        ].join(" ")}
      >
        {t.author}
      </div>
      <div
        className={[
          "t-meta mt-1 text-[12px] font-[600]",
          t.featured ? "text-white/40" : "text-content-subtle",
        ].join(" ")}
      >
        {t.meta}
      </div>
    </div>
  );
};

export default TestimonialCard;
