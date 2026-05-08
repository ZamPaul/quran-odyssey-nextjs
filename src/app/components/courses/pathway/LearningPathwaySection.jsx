import Node from "./Node";
import ParallelCard from "./ParallelCard";

export default function LearningPathwaySection() {
  return (
    <section className="relative overflow-hidden bg-white bg-brand-navy px-6 py-[100px] md:px-[60px]">
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-[2] mx-auto w-full max-w-[1240px]">
        <div className="pathway-header reveal">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
            <div>
              <div className="apply-cyan-chip font-[plus-eb] inline-flex items-center rounded-full px-4 py-[6px] text-[11px]">
                The journey
              </div>
              <h2 className="mt-4 text-[40px] font-[plus-eb] leading-[1.1] tracking-[-0.03em] md:text-[44px]">
                How our <span className="text-brand-cyan">courses connect.</span>
              </h2>
            </div>
            <p className="text-secondary-styling max-w-[520px] text-[16px] leading-[1.75]">
              Most students follow the core pathway — Qaida → Recitation → Tajweed → Hifz. Islamic Studies and private
              classes run alongside any stage. Your teacher helps you decide where to start.
            </p>
          </div>
        </div>

        <div className="pathway-track reveal mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Node n="1" tone="cyan" badge="Start here" title="Noorani Qaida" sub="Arabic alphabet & basic reading" primary />
          <Node n="2" tone="navy" badge="Core stage" title="Quran Recitation" sub="Fluency · Juz progression" />
          <Node n="3" tone="cyan2" badge="Refinement" title="Tajweed Rules" sub="Precision & beautiful recitation" />
          <Node n="4" tone="amber" badge="Pinnacle" title="Hifz Programme" sub="Full Quran memorisation" highlight />
        </div>

        <div className="reveal mt-6">
          <div className="parallel-label text-[12px] font-[800] uppercase tracking-[0.12em] text-white/35">
            Runs in parallel with any stage above
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ParallelCard
              tone="cyan"
              title="Islamic Studies"
              sub="Stories, pillars, character · Ages 6–14"
            />
            <ParallelCard
              tone="amber"
              title="One-to-One Private Classes"
              sub="Any subject · Fully custom · All ages"
              orangeTint
            />
          </div>
        </div>
      </div>
    </section>
  );
}



