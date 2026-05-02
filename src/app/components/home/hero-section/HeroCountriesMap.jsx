import Image from "next/image";

const MARKERS = {
  canada: {
    x: 260,
    y: 250,
    labelX: -8.15,
    labelY: 37.96,
    label: "Canada",
    flag: "🇨🇦",
    tone: "cyan",
  },
  usa: {
    x: 370,
    y: 375,
    labelX: 22.4,
    labelY: 82.4,
    label: "USA",
    flag: "🇺🇸",
    tone: "amber",
  },
  uk: {
    x: 705,
    y: 265,
    labelX: 80.2,
    labelY: 39.8,
    label: "UK",
    flag: "🇬🇧",
    tone: "cyan",
  },
};

function Marker({ id, x, y, tone }) {
  const dotClass = tone === "amber" ? "fill-brand-amber" : "fill-brand-cyan";

  return (
    <g
      className={`map-marker map-marker-${id}`}
      transform={`translate(${x} ${y})`}
    >
      <circle className="map-marker-halo" cx="0" cy="0" r="46" />
      <circle
        className="map-marker-halo map-marker-halo-2"
        cx="0"
        cy="0"
        r="30"
      />
      <circle className={dotClass} cx="0" cy="0" r="9" />
      <circle className="fill-surface-white" cx="0" cy="0" r="4" />
    </g>
  );
}

function CountryPill({ x, y, flag, label, tone, className = "" }) {
  const border =
    flag === "🇬🇧"
      ? "border-brand-cyan/70"
      : flag == "🇺🇸"
        ? "border-brand-amber/70"
        : "border-red-500/70";

  return (
    <div
      className={[
        "absolute z-20 inline-flex rounded-[5px] items-center gap-2 bg-surface-white px-3 py-[7px] shadow-[0_14px_30px_rgba(0,0,0,0.06)] border-[0.5px]",
        border,
        className,
      ].join(" ")}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span
        className={`text-[16px] font-[plus-l] leading-none ${flag === "🇺🇸" ? "text-brand-amber" : flag === "🇬🇧" ? "text-brand-cyan" : "text-red-500"}`}
      >
        {flag}
      </span>
      <span className="text-[13px] uppercase leading-none font-[plus-r] tracking-[-0.01em] text-content-primary">
        {label}
      </span>
    </div>
  );
}

export default function HeroCountriesMap() {
  return (
    <div className="countries-map w-full relative">
      <div className="pointer-events-none absolute inset-0">
        <div className="countries-map-grid absolute inset-0 opacity-0" />
        {/* <div className="countries-map-glow absolute -left-24 -top-32 h-[420px] w-[420px] rounded-full" /> */}
      </div>

      <div className="relative px-5 pb-6 pt-6 sm:px-7">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="text-[12px] font-[800] uppercase tracking-[0.28em] text-brand-cyan">
            Students in 18+ countries
          </div>
          <span className="inline-flex opacity-0 items-center gap-2 rounded-full border border-line-light bg-surface-white px-3 py-1 text-[12px] font-[plus-eb] text-content-muted">
            <span className="country-dot h-[7px] w-[7px] rounded-full bg-brand-cyan" />
            Live now
          </span>
        </div>

        <div className="relative scale-[1.2] aspect-[16/9]">
          {/* <div className="pointer-events-none absolute inset-0 opacity-[0]">
            <Image
              src="/Frame.png"
              alt="
              fill
              sizes="(min-width: 1024px) 520px, 90vw"
              className="object-cover"
            />
          </div> */}

          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 960 540"
            fill="none"
            aria-hidden="true"
          >
            <path
              className="map-arc map-arc-cyan"
              d="M 370 375 C 410 320, 470 290, 520 280 S 640 250, 705 265"
            />
            <path
              className="map-arc map-arc-cyan"
              d="M 260 250 C 330 215, 440 220, 520 250 S 640 290, 705 265"
            />
            <path
              className="map-arc map-arc-amber"
              d="M 370 375 C 340 330, 305 300, 260 250"
            />

            {/* <Marker id="canada" {...MARKERS.canada} />
            <Marker id="usa" {...MARKERS.usa} />
            <Marker id="uk" {...MARKERS.uk} /> */}
          </svg>

          <CountryPill
            x={MARKERS.canada.labelX}
            y={MARKERS.canada.labelY}
            flag={MARKERS.canada.flag}
            label={MARKERS.canada.label}
            tone={MARKERS.canada.tone}
            className="map-pill map-pill-canada bg-red-400/10"
          />
          <CountryPill
            x={MARKERS.usa.labelX}
            y={MARKERS.usa.labelY}
            flag={MARKERS.usa.flag}
            label={MARKERS.usa.label}
            tone={MARKERS.usa.tone}
            className="map-pill map-pill-usa bg-amber-400/10"
          />
          <CountryPill
            x={MARKERS.uk.labelX}
            y={MARKERS.uk.labelY}
            flag={MARKERS.uk.flag}
            label={MARKERS.uk.label}
            tone={MARKERS.uk.tone}
            className="map-pill map-pill-uk bg-brand-cyan/10"
          />
        </div>
      </div>
    </div>
  );
}
