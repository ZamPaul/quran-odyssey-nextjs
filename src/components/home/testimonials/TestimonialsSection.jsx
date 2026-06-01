import TestimonialCard from "./TestimonialCard";

const TESTIMONIALS = [
  {
    featured: false,
    text: "My son finally enjoys Quran learning. He now looks forward to every class.",
    author: "Fatimah K.",
    meta: "UK",
  },
  {
    featured: true,
    text: "The structured system made all the difference. We finally see real progress.",
    author: "Ibrahim A.",
    meta: "Canada",
  },
  {
    featured: false,
    text: "From basic letters to fluent recitation in a few months — amazing teachers",
    author: "Mariam R.",
    meta: "USA",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-white px-6 py-[100px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="testimonials-header reveal-left mb-14">
          <div className="section-chip inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] px-4 py-[6px] text-[12px] font-[700] tracking-[0.06em] text-brand-cyan-dark">
            Parent Testimonials
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
