const FAQ = [
  {
    q: "How do I know which course is right for my child?",
    a: "During the free trial class, your teacher will assess your child's current level — whether they can read Arabic letters, how fluently they recite, and their general comprehension. Based on this, they'll recommend exactly where to start. You don't need to guess.",
  },
  {
    q: "What age can my child start?",
    a: "Most students begin Noorani Qaida around ages 5–7, but it depends on readiness. Some children start earlier, some later. The free trial lets the teacher assess what your child can handle without stress.",
  },
  {
    q: "How many classes per week are recommended?",
    a: "It depends on the course and your goals. Noorani Qaida and Tajweed work well at 2–3 sessions per week. Quran Recitation typically runs at 3 per week. Hifz requires at least 5 — daily practice is essential for memorisation to stick. Your teacher will advise based on your child's pace and your family's schedule.",
  },
  {
    q: "What happens if my child falls behind?",
    a: "Your teacher will flag it to you directly — not at the end of the month, but that week. We don't let problems quietly compound. If a student is struggling with a concept, the teacher adjusts the pace, revisits the material, and lets parents know what extra practice at home would help. No child gets left behind silently here.",
  },
  {
    q: "Is there homework?",
    a: "Yes — short, targeted revision between classes makes a significant difference, especially for Tajweed and Hifz. Your teacher assigns specific verses or rules to practise, which students can see in their dashboard. Homework is never excessive — the goal is to reinforce what was covered in class, not add stress.",
  },
  {
    q: "Can my child take more than one course at a time?",
    a: "Yes. Islamic Studies and One-to-One classes are designed to run alongside the core recitation pathway. Some students also combine Quran Recitation with Tajweed. Your teacher will advise on what's realistic given your child's schedule and workload — we won't let you over-enrol to the point of burnout.",
  },
];

export default function CoursesFaqSection() {
  return (
    <section className="bg-surface-off-white px-6 py-[100px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="faq-header grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="reveal-left">
            <div className="section-chip inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] px-4 py-[6px] text-[11px] font-[700] tracking-[0.06em] text-brand-cyan-dark">
              Common questions
            </div>
            <h2 className="section-h2 text-[40px] font-[800] leading-[1.1] tracking-[-0.03em] text-content-primary md:text-[44px]">
              Questions about
              <br />
              <span className="text-brand-cyan">our courses.</span>
            </h2>
            <p className="section-sub mt-3 max-w-[520px] text-[16px] leading-[1.75] text-content-muted">
              Still unsure? The trial class is free — your teacher will assess your child and recommend the right course and starting point.
            </p>
          </div>

          <div className="faq-list reveal-right" id="faqList">
            {FAQ.map((item) => (
              <div key={item.q} className="faq-item mb-3 overflow-hidden rounded-[var(--radius-lg)] border border-line-light bg-white">
                <button type="button" className="faq-q flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                  <span className="faq-q-text text-[14px] font-[900] text-content-primary">
                    {item.q}
                  </span>
                  <span className="faq-icon inline-flex h-9 w-9 items-center justify-center rounded-full border border-line-light bg-surface-light text-content-muted">
                    +
                  </span>
                </button>
                <div className="faq-a hidden px-6 pb-6 text-[14px] leading-[1.75] text-content-muted">
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

