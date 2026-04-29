export default function SectionHeader({
  chip,
  title,
  subtitle,
  align = "left",
  className = "",
  chipClassName = "",
  titleClassName = "",
}) {
  return (
    <div
      className={[
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      ].join(" ")}
    >
      {chip ? (
        <div
          className={[
            "section-chip inline-flex items-center rounded-full border px-4 py-[6px] text-[12px] font-[700] tracking-[0.06em]",
            chipClassName,
          ].join(" ")}
        >
          {chip}
        </div>
      ) : null}

      <h2
        className={[
          "section-h2 text-[40px] font-[plus-eb] leading-[1.08] tracking-[-0.03em] text-content-primary md:text-[44px]",
          titleClassName,
        ].join(" ")}
      >
        {title}
      </h2>

      {subtitle ? (
        <p className="section-sub max-w-[520px] text-[16px] font-[plus-r] leading-[1.75] text-content-muted">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
