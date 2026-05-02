import TestimonialCard from "./TestimonialCard";

const TESTIMONIALS = [
  {
    featured: false,
    text: "My son refused to learn Quran with anyone. Three weeks in with Sister Aisha and he's asking me when his next class is. Whatever she's doing, it's working.",
    author: "Fatimah K.",
    meta: "UK · Parent of 9-year-old",
  },
  {
    featured: true,
    text: "We tried four different online tutors before Quran Odyssey. The difference is the structure. My daughter actually progresses — there's a plan, not just weekly sessions that go nowhere.",
    author: "Ibrahim A.",
    meta: "Canada · Parent of 11-year-old",
  },
  {
    featured: false,
    text: "Ustadh Hassan is incredible with my kids. They've gone from struggling with basic letters to reciting Surah Al-Mulk in four months. The booking system alone is worth it — no chasing anyone.",
    author: "Mariam R.",
    meta: "USA · Parent of two students",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-white px-6 py-[100px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="testimonials-header reveal-left mb-14">
          <div className="section-chip inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] px-4 py-[6px] text-[12px] font-[700] tracking-[0.06em] text-brand-cyan-dark">
            Parent voices
          </div>
          <h2 className="mt-4 text-[40px] font-[plus-eb] leading-[1.08] tracking-[-0.03em] text-content-primary md:text-[44px]">
            What families <span className="text-brand-cyan">actually say.</span>
          </h2>
        </div>

        <div className="testimonial-grid grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <TestimonialCard t={t} idx={idx} key={`testimonial_card_${idx}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
