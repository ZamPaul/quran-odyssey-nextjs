const ITEMS = [
  { target: 4.97, decimals: 2, suffix: "", label: "Avg. teacher rating" },
  { target: 2000, suffix: "+", label: "Students enrolled" },
  { target: 40, suffix: "+", label: "Qualified teachers" },
  { target: 18, suffix: "+", label: "Countries served" },
  { target: 97, suffix: "%", label: "Parent satisfaction" },
];

export default function TrustBar() {
  return (
    <div className="border-y border-line-light bg-white">
      <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-center gap-12 px-6 py-8 md:flex-nowrap md:gap-6 md:px-[60px]">
        {ITEMS.map((item, idx) => (
          <div
            key={item.label}
            className="flex items-center gap-12 md:gap-12"
          >
            <div className="text-center">
              <div
                className="trust-bar-stat inline-flex items-baseline justify-center gap-0 text-[20px] font-[plus-eb] tracking-[-0.03em] text-content-primary"
                data-target={item.target}
                data-decimals={item.decimals}
              >
                <span className="counter tabular-nums">
                  {item.decimals
                    ? item.target.toFixed(item.decimals)
                    : item.target.toLocaleString()}
                </span>
                {item.suffix ? <span>{item.suffix}</span> : null}
              </div>
              <div className="text-[12px] font-[plus-r] text-content-muted">
                {item.label}
              </div>
            </div>
            {idx !== ITEMS.length - 1 ? (
              <div className="hidden h-8 w-px bg-line-light md:mx-8 md:block" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
