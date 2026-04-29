const ITEMS = [
  { num: "4.97", label: "Avg. teacher rating" },
  { num: "2,000+", label: "Students enrolled" },
  { num: "40+", label: "Qualified teachers" },
  { num: "18+", label: "Countries served" },
  { num: "97%", label: "Parent satisfaction" },
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
              <div className="text-[20px] font-[plus-eb] tracking-[-0.03em] text-content-primary">
                {item.num}
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
