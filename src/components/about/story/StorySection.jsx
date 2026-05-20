export default function StorySection() {
  return (
    <section className="bg-white px-6 py-[100px] md:px-[60px]">
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
        <div className="story-pull reveal-left md:sticky md:top-[88px] md:self-start">
          <div className="section-chip inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] px-4 py-[6px] text-[12px] font-[700] tracking-[0.06em] text-brand-cyan-dark">
            Our origin
          </div>

          <div className="mt-6 overflow-hidden rounded-[var(--radius-lg)] border border-line-light bg-surface-off-white p-6">
            <p className="text-[16px] font-[800] leading-[1.55] tracking-[-0.02em] text-content-primary">
              “We built what we wished had existed{" "}
              <span className="text-brand-cyan">for our own children.”</span>
            </p>
            <div className="mt-4 text-[13px] font-[700] text-content-muted">
              — The Founding Team, 2022
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4 rounded-[var(--radius-lg)] border border-line-light bg-white p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy text-[14px] font-[900] text-white">
              QO
            </div>
            <div>
              <div className="text-[14px] font-[900] text-content-primary">
                The Quran Odyssey Team
              </div>
              <div className="text-[12px] font-[600] text-content-muted">
                Educators · Technologists · Parents
              </div>
            </div>
          </div>
        </div>

        <div className="story-content reveal-right">
          <p className="story-p mb-6 text-[15px] leading-[1.85] text-content-muted">
            Quran Odyssey didn&apos;t begin as a startup idea. It began as a
            frustration.{" "}
            <strong className="font-[700] text-content-primary">
              The founders had watched too many children — their own included —
              lose interest in Quran education not because of the Quran itself,
              but because of how it was being taught.
            </strong>{" "}
            Inconsistent teachers. Rigid timetables. Zero feedback for parents.
          </p>

          <div className="story-highlight-block mb-6 rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--brand-cyan)_20%,transparent)] bg-surface-cyan-tint p-6 text-[14px] font-[700] leading-[1.7] text-brand-cyan-dark">
            A family in Manchester with a child who goes to bed at 8pm. A family
            in Toronto with two working parents. A family in Dallas whose
            nearest mosque is forty minutes away.
          </div>

          <p className="story-p mb-6 text-[15px] leading-[1.85] text-content-muted">
            The existing solutions were built for a world where everyone lived
            in the same city, attended the same madrassa, and followed the same
            schedule. The Muslim diaspora in the West doesn&apos;t look like
            that.
          </p>

          <p className="story-p mb-6 text-[15px] leading-[1.85] text-content-muted">
            So we built something different. A platform designed from the ground
            up for{" "}
            <strong className="font-[700] text-content-primary">
              committed, dedicated teachers and the students who deserve
              consistency from them.
            </strong>{" "}
            One teacher per student. Flexible scheduling across timezones.
            Weekly progress updates that actually tell parents something.
          </p>

          <p className="story-p text-[15px] leading-[1.85] text-content-muted">
            The journey — the odyssey — belongs to the student. We just make
            sure the path is clear.
          </p>
        </div>
      </div>
    </section>
  );
}

