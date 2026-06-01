import Link from "next/link";
import SectionHeader from "../shared/SectionHeader";
import CartoonCard from "./CartoonCard";

const CARDS = [
  {
    state: "active",
    badge: "● This Week",
    episode: "Ep. 24",
    topic: "The Kids Corner — Story of “Four Important Angels in Islam”",
    desc: "Professor Hoot explains Izhar, Idgham, Iqlab and Ikhfa with memorable visual examples.",
    svg: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <path
          d="M34 75 Q34 50 60 48 Q86 50 86 75 L88 100 H32 Z"
          fill="rgba(250,167,26,0.08)"
          stroke="rgba(250,167,26,0.3)"
          strokeWidth="1.5"
        ></path>
        <circle
          cx="60"
          cy="36"
          r="20"
          fill="rgba(250,167,26,0.07)"
          stroke="rgba(250,167,26,0.35)"
          strokeWidth="1.5"
        ></circle>
        <path
          d="M40 36 Q40 20 60 18 Q80 20 80 36"
          fill="rgba(250,167,26,0.12)"
          stroke="rgba(250,167,26,0.4)"
          strokeWidth="1.5"
        ></path>
        <path
          d="M38 38 H82"
          stroke="rgba(250,167,26,0.4)"
          strokeWidth="1.5"
        ></path>
        <circle
          cx="52"
          cy="36"
          r="5"
          fill="white"
          stroke="rgba(250,167,26,0.3)"
          strokeWidth="1.5"
        ></circle>
        <circle
          cx="68"
          cy="36"
          r="5"
          fill="white"
          stroke="rgba(250,167,26,0.3)"
          strokeWidth="1.5"
        ></circle>
        <circle cx="52" cy="36" r="2.5" fill="#faa71a"></circle>
        <circle cx="68" cy="36" r="2.5" fill="#faa71a"></circle>
        <path
          d="M54 44 Q60 48 66 44"
          stroke="#faa71a"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        ></path>
      </svg>
    ),
  },
  {
    state: "past",
    badge: "Week 23",
    episode: "Ep. 23",
    topic: "The Kids Corner — Guide on “Wuzu Steps with Duas”",
    desc: "Scholar Star breaks down every ayah with meaning and context for young learners.",
    svg: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <ellipse
          cx="60"
          cy="72"
          rx="28"
          ry="30"
          fill="rgba(40,183,217,0.1)"
          stroke="rgba(40,183,217,0.35)"
          strokeWidth="1.5"
        ></ellipse>
        <path
          d="M32 72 Q18 60 22 48 Q30 56 38 64"
          fill="rgba(40,183,217,0.06)"
          stroke="rgba(40,183,217,0.25)"
          strokeWidth="1.5"
        ></path>
        <path
          d="M88 72 Q102 60 98 48 Q90 56 82 64"
          fill="rgba(40,183,217,0.06)"
          stroke="rgba(40,183,217,0.25)"
          strokeWidth="1.5"
        ></path>
        <circle
          cx="60"
          cy="42"
          r="22"
          fill="rgba(40,183,217,0.08)"
          stroke="rgba(40,183,217,0.35)"
          strokeWidth="1.5"
        ></circle>
        <path
          d="M44 26 L40 16 L50 22Z"
          fill="rgba(40,183,217,0.2)"
          stroke="rgba(40,183,217,0.4)"
          strokeWidth="1"
        ></path>
        <path
          d="M76 26 L80 16 L70 22Z"
          fill="rgba(40,183,217,0.2)"
          stroke="rgba(40,183,217,0.4)"
          strokeWidth="1"
        ></path>
        <circle
          cx="52"
          cy="40"
          r="8"
          fill="white"
          stroke="rgba(40,183,217,0.3)"
          strokeWidth="1.5"
        ></circle>
        <circle
          cx="68"
          cy="40"
          r="8"
          fill="white"
          stroke="rgba(40,183,217,0.3)"
          strokeWidth="1.5"
        ></circle>
        <circle cx="52" cy="40" r="4" fill="#28b7d9"></circle>
        <circle cx="68" cy="40" r="4" fill="#28b7d9"></circle>
        <circle cx="53" cy="38" r="1.5" fill="white"></circle>
        <circle cx="69" cy="38" r="1.5" fill="white"></circle>
        <path d="M57 48 L60 54 L63 48Z" fill="#faa71a"></path>
        <rect
          x="44"
          y="20"
          width="32"
          height="4"
          rx="1"
          fill="#faa71a"
          opacity="0.8"
        ></rect>
        <rect
          x="56"
          y="16"
          width="8"
          height="6"
          rx="1"
          fill="#faa71a"
          opacity="0.8"
        ></rect>
        <line
          x1="76"
          y1="22"
          x2="82"
          y2="30"
          stroke="#faa71a"
          strokeWidth="1.5"
          strokeLinecap="round"
        ></line>
        <circle cx="82" cy="31" r="2" fill="#faa71a"></circle>
      </svg>
    ),
  },
  {
    state: "past",
    badge: "Week 22",
    episode: "Ep. 22",
    topic: "The Kids Corner — Story about “Protection through Dua’s”",
    desc: "An illustrated journey through the foundations of faith — perfect for ages 6 to 10.",
    svg: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle
          cx="60"
          cy="44"
          r="24"
          fill="rgba(40,183,217,0.07)"
          stroke="rgba(40,183,217,0.3)"
          strokeWidth="1.5"
        ></circle>
        <path
          d="M36 70 Q36 55 60 53 Q84 55 84 70 L84 95 H36 Z"
          fill="rgba(40,183,217,0.07)"
          stroke="rgba(40,183,217,0.25)"
          strokeWidth="1.5"
        ></path>
        <circle
          cx="52"
          cy="42"
          r="5"
          fill="white"
          stroke="rgba(40,183,217,0.3)"
          strokeWidth="1.5"
        ></circle>
        <circle
          cx="68"
          cy="42"
          r="5"
          fill="white"
          stroke="rgba(40,183,217,0.3)"
          strokeWidth="1.5"
        ></circle>
        <circle cx="52" cy="42" r="2.5" fill="#28b7d9"></circle>
        <circle cx="68" cy="42" r="2.5" fill="#28b7d9"></circle>
        <path
          d="M54 52 Q60 56 66 52"
          stroke="#28b7d9"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        ></path>
        <path
          d="M46 25 L38 15 M74 25 L82 15"
          stroke="#faa71a"
          strokeWidth="1.5"
          strokeLinecap="round"
        ></path>
        <circle
          cx="38"
          cy="12"
          r="4"
          fill="none"
          stroke="#faa71a"
          strokeWidth="1.5"
        ></circle>
        <circle
          cx="82"
          cy="12"
          r="4"
          fill="none"
          stroke="#faa71a"
          strokeWidth="1.5"
        ></circle>
      </svg>
    ),
  },
  {
    state: "past",
    badge: "Week 21",
    episode: "Ep. 21",
    topic: "The Kids Corner — Story of “ZamZam Water”",
    desc: "Animated storytelling that brings the life of Prophet Musa to life for young hearts.",
    svg: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <ellipse
          cx="60"
          cy="65"
          rx="26"
          ry="28"
          fill="rgba(250,167,26,0.07)"
          stroke="rgba(250,167,26,0.25)"
          strokeWidth="1.5"
        ></ellipse>
        <circle
          cx="60"
          cy="38"
          r="20"
          fill="rgba(250,167,26,0.07)"
          stroke="rgba(250,167,26,0.3)"
          strokeWidth="1.5"
        ></circle>
        <rect
          x="44"
          y="24"
          width="32"
          height="10"
          rx="5"
          fill="rgba(40,183,217,0.2)"
          stroke="rgba(40,183,217,0.4)"
          strokeWidth="1"
        ></rect>
        <circle
          cx="52"
          cy="36"
          r="5"
          fill="white"
          stroke="rgba(250,167,26,0.3)"
          strokeWidth="1.5"
        ></circle>
        <circle
          cx="68"
          cy="36"
          r="5"
          fill="white"
          stroke="rgba(250,167,26,0.3)"
          strokeWidth="1.5"
        ></circle>
        <circle cx="52" cy="36" r="2.5" fill="#faa71a"></circle>
        <circle cx="68" cy="36" r="2.5" fill="#faa71a"></circle>
        <path
          d="M55 45 Q60 50 65 45"
          stroke="#faa71a"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        ></path>
        <path
          d="M34 65 Q20 58 24 46"
          fill="none"
          stroke="rgba(250,167,26,0.25)"
          strokeWidth="1.5"
        ></path>
        <path
          d="M86 65 Q100 58 96 46"
          fill="none"
          stroke="rgba(250,167,26,0.25)"
          strokeWidth="1.5"
        ></path>
      </svg>
    ),
  },
];

export default function CartoonLecturesSection() {
  return (
    <section className="bg-surface-off-white px-6 py-[100px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
          <div className="reveal-left">
            <SectionHeader
              chip="Weekly AI Lectures"
              chipClassName="border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] text-brand-cyan-dark"
              title={
                <>
                  Animated Quran lessons children
                  {/* <br /> */}
                  <span className="text-brand-cyan"> actually enjoy.</span>
                </>
              }
            />
          </div>
          <p className="section-sub reveal-right max-w-[520px] text-[16px] font-[400] leading-[1.75] text-content-muted">
            Every week, students learn Quran topics through interactive animated
            AI lessons designed to simplify Islamic concepts and improve
            retention.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          {CARDS.map((c, idx) => (
            <CartoonCard key={`cartoon_card_${idx}`} c={c} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
