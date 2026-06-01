import SectionHeader from "../shared/SectionHeader";
import StepCard from "./StepCard";

const STEPS = [
  {
    num: "1",
    title: "Choose a verified Quran teacher",
    text: "Select from qualified male and female Quran teachers based on availability, specialization, and ratings.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    num: "2",
    title: "Book a free trial class instantly",
    text: "No calls, no waiting. Schedule a 30-minute trial class in seconds with WhatsApp + email confirmation.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="4"
          width="18"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <line
          x1="16"
          y1="2"
          x2="16"
          y2="6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="8"
          y1="2"
          x2="8"
          y2="6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="3"
          y1="10"
          x2="21"
          y2="10"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    num: "3",
    title: "Start structured learning immediately",
    text: "Your child joins live classes through a simple dashboard — track progress, homework, and weekly improvement reports.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <polygon
          points="5 3 19 12 5 21 5 3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-white px-6 py-[100px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="reveal-left mb-14">
          <SectionHeader
            chip="The process"
            chipClassName="border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] text-brand-cyan-dark"
            title={
              <>
                Start your child’s
                <span className="text-brand-cyan"> Quran journey </span>in 3
                simple steps.
              </>
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEPS.map((s, idx) => (
            <StepCard s={s} idx={idx} key={`step_card_${idx}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
