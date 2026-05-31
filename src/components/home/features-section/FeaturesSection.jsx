"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── Feature Data ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: "gamified",
    icon: "🎮",
    label: "Gamified LMS",
    num: "Feature 01",
    tag: "Learning Platform",
    title: "Learning that feels like\na game — not a chore.",
    desc: "Our gamified LMS rewards every lesson, every streak, every milestone. Students earn XP, unlock badges, and climb leaderboards — motivation built into the platform itself.",
    bullets: [
      "XP points earned for every completed class and homework task",
      "Daily streak tracking with bonus XP for consistency",
      "Badges and certificates for Quran milestones — Juz completed, Surah mastered",
      "Weekly leaderboards to spark friendly competition between classmates",
    ],
    gradient: "linear-gradient(140deg, #daf4fb 0%, #c2eaf9 45%, #a8e0f6 100%)",
    accentDot: "#28b7d9",
    badge1: "🔥 12-day streak!",
    badge2: "🏆 #3 on this week's board",
  },
  {
    id: "animated",
    icon: "🎬",
    label: "Animated Lessons",
    num: "Feature 02",
    tag: "Weekly AI Lectures",
    title: "Learning that speaks\ntheir language.",
    desc: "Every week, a new animated AI character walks students through a Quran topic — Tajweed rules, Surahs, Islamic stories. Short, visual, and built for the way kids actually learn.",
    bullets: [
      "New episode every Sunday covering Tajweed rules or Quranic stories",
      "AI-generated characters kids genuinely connect with",
      "Perfectly timed at 5–8 minutes — optimal for young attention spans",
      "A supplement to live classes, never a replacement",
    ],
    gradient: "linear-gradient(140deg, #fff7e0 0%, #feeec4 45%, #fde5a6 100%)",
    accentDot: "#faa71a",
    badge1: "▶ Ep. 24 — Rules of Noon Sakinah",
    badge2: "📺 New episode every Sunday",
  },
  {
    id: "parental",
    icon: "👨‍👩‍👧",
    label: "Parental Control",
    num: "Feature 03",
    tag: "Parent Dashboard",
    title: "You'll always know\nexactly where they stand.",
    desc: "Weekly progress updates, not vague reassurances. You'll know exactly what Tajweed rule your child worked on this week, what they've mastered, and what needs attention.",
    bullets: [
      "Weekly written progress reports delivered directly to your email",
      "Full session history — attendance, duration, topics covered",
      "Teacher notes visible after every class",
      "Direct messaging channel open to your child's teacher",
    ],
    gradient: "linear-gradient(140deg, #eaeffe 0%, #d8e4fb 45%, #c6d8f8 100%)",
    accentDot: "#5b7fd4",
    badge1: "📊 Weekly report ready",
    badge2: "✅ 100% attendance this month",
  },
  {
    id: "teachers",
    icon: "👩‍🏫",
    label: "Qualified Teachers",
    num: "Feature 04",
    tag: "Our Educators",
    title: "Verified, qualified,\nand actually consistent.",
    desc: "Every teacher on Quran Odyssey is background-checked, interview-tested, and rated by real students. One teacher per student — no rotation, no strangers, no starting over.",
    bullets: [
      "Every teacher holds an Ijazah or equivalent Quran certification",
      "Background-checked and interview-screened before joining",
      "Average teacher rating of 4.97 / 5.0 across all subjects",
      "Gender preference respected — male or female teacher, your choice",
    ],
    gradient: "linear-gradient(140deg, #daf8f1 0%, #c2f2e8 45%, #a8ecde 100%)",
    accentDot: "#2dd4bf",
    badge1: "⭐ 4.97 avg. rating",
    badge2: "✓ Ijazah certified teachers",
  },
  {
    id: "live",
    icon: "🔴",
    label: "Live Sessions",
    num: "Feature 05",
    tag: "1-on-1 Classes",
    title: "One click to class.\nNo downloads needed.",
    desc: "Students join live 1-on-1 classes directly from their dashboard — one click, no confusion. Timezone-matched scheduling so bedtime and class time never compete.",
    bullets: [
      "Join class with one click directly from the student dashboard",
      "Scheduling across UK, USA, and Canadian timezones",
      "30-minute free trial — meet your teacher before committing",
      "Automatic WhatsApp reminder 30 minutes before every class",
    ],
    gradient: "linear-gradient(140deg, #e6ecfc 0%, #d0dafa 45%, #b8c8f8 100%)",
    accentDot: "#0d2840",
    badge1: "🟢 Live now — Tajweed · Week 7",
    badge2: "⏰ Reminder sent via WhatsApp",
  },
  {
    id: "duas",
    icon: "🤲",
    label: "Dua & Good Deeds",
    num: "Feature 06",
    tag: "Islamic Content",
    title: "Faith woven into\nevery part of learning.",
    desc: "Daily duas, hadiths, and good deeds reminders are built into the platform. Islamic character is not an afterthought — it's embedded in the student's daily routine.",
    bullets: [
      "Daily dua reminders personalised by age and learning stage",
      "Hadith of the week section visible in the student dashboard",
      "Good deeds tracker with full parent visibility",
      "Seasonal Ramadan and Eid challenges with special rewards",
    ],
    gradient: "linear-gradient(140deg, #e0f8eb 0%, #c8f0d8 45%, #b0e8c4 100%)",
    accentDot: "#22c55e",
    badge1: "🤲 Dua of the day ready",
    badge2: "🌙 Ramadan challenge active",
  },
];

// ─── SVG Illustrations ─────────────────────────────────────────────────────────
function GamifiedSVG() {
  return (
    <svg
      width="260"
      height="260"
      viewBox="0 0 260 260"
      fill="none"
      aria-hidden="true"
    >
      {/* Open book base */}
      <rect
        x="40"
        y="110"
        width="80"
        height="90"
        rx="6"
        fill="white"
        opacity="0.9"
      />
      <rect
        x="140"
        y="110"
        width="80"
        height="90"
        rx="6"
        fill="white"
        opacity="0.9"
      />
      <rect
        x="118"
        y="108"
        width="24"
        height="94"
        rx="4"
        fill="#0d2840"
        opacity="0.15"
      />
      {/* Book spine */}
      <rect x="126" y="105" width="8" height="98" rx="4" fill="#28b7d9" />
      {/* Book lines left page */}
      <rect
        x="54"
        y="128"
        width="52"
        height="4"
        rx="2"
        fill="#28b7d9"
        opacity="0.25"
      />
      <rect
        x="54"
        y="140"
        width="44"
        height="4"
        rx="2"
        fill="#28b7d9"
        opacity="0.18"
      />
      <rect
        x="54"
        y="152"
        width="48"
        height="4"
        rx="2"
        fill="#28b7d9"
        opacity="0.18"
      />
      <rect
        x="54"
        y="164"
        width="38"
        height="4"
        rx="2"
        fill="#28b7d9"
        opacity="0.18"
      />
      <rect
        x="54"
        y="176"
        width="44"
        height="4"
        rx="2"
        fill="#28b7d9"
        opacity="0.12"
      />
      {/* Book lines right page */}
      <rect
        x="154"
        y="128"
        width="52"
        height="4"
        rx="2"
        fill="#0d2840"
        opacity="0.2"
      />
      <rect
        x="154"
        y="140"
        width="44"
        height="4"
        rx="2"
        fill="#0d2840"
        opacity="0.15"
      />
      <rect
        x="154"
        y="152"
        width="48"
        height="4"
        rx="2"
        fill="#0d2840"
        opacity="0.15"
      />
      <rect
        x="154"
        y="164"
        width="38"
        height="4"
        rx="2"
        fill="#0d2840"
        opacity="0.15"
      />
      {/* Bottom book curve */}
      <path
        d="M40 196 Q80 210 130 206 Q180 210 220 196"
        stroke="#28b7d9"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      {/* XP Badge top right */}
      <rect x="170" y="58" width="60" height="34" rx="17" fill="#faa71a" />
      <text
        x="200"
        y="79"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="800"
        fontFamily="system-ui"
      >
        +50 XP
      </text>
      {/* Gold star */}
      <path
        d="M80 82 l4 8 9 1.5-6.5 6.5 1.5 9-8-4.5-8 4.5 1.5-9L67.5 91.5l9-1.5z"
        fill="#faa71a"
      />
      {/* Sparkles */}
      <path
        d="M40 75 l2 5 2-5 5-2-5-2-2-5-2 5-5 2z"
        fill="#28b7d9"
        opacity="0.8"
      />
      <path
        d="M212 90 l1.5 3.5 1.5-3.5 3.5-1.5-3.5-1.5-1.5-3.5-1.5 3.5-3.5 1.5z"
        fill="#faa71a"
        opacity="0.9"
      />
      <path
        d="M155 65 l1 2.5 1-2.5 2.5-1-2.5-1-1-2.5-1 2.5-2.5 1z"
        fill="#28b7d9"
        opacity="0.7"
      />
      <path
        d="M60 58 l1 2.5 1-2.5 2.5-1-2.5-1-1-2.5-1 2.5-2.5 1z"
        fill="#faa71a"
        opacity="0.7"
      />
      {/* Pencil */}
      <rect
        x="174"
        y="130"
        width="14"
        height="60"
        rx="3"
        transform="rotate(-30 174 130)"
        fill="#faa71a"
      />
      <rect
        x="178"
        y="127"
        width="14"
        height="12"
        rx="2"
        transform="rotate(-30 178 127)"
        fill="#faa71a"
        opacity="0.6"
      />
      <path d="M163 168 l5 -9 7 4z" fill="#0d2840" opacity="0.7" />
      {/* Progress bar at bottom */}
      <rect
        x="55"
        y="218"
        width="150"
        height="10"
        rx="5"
        fill="white"
        opacity="0.7"
      />
      <rect x="55" y="218" width="105" height="10" rx="5" fill="#28b7d9" />
      <text
        x="130"
        y="245"
        textAnchor="middle"
        fill="#0e6e8a"
        fontSize="11"
        fontWeight="700"
        fontFamily="system-ui"
      >
        Level Progress · 70%
      </text>
    </svg>
  );
}

function AnimatedSVG() {
  return (
    <svg
      width="260"
      height="260"
      viewBox="0 0 260 260"
      fill="none"
      aria-hidden="true"
    >
      {/* TV / Screen frame */}
      <rect
        x="40"
        y="60"
        width="180"
        height="130"
        rx="16"
        fill="white"
        opacity="0.85"
      />
      <rect
        x="52"
        y="72"
        width="156"
        height="106"
        rx="8"
        fill="#faa71a"
        opacity="0.12"
      />
      {/* Screen content - owl character */}
      <circle cx="130" cy="118" r="34" fill="#faa71a" opacity="0.2" />
      {/* Owl body */}
      <ellipse
        cx="130"
        cy="122"
        rx="22"
        ry="26"
        fill="#faa71a"
        opacity="0.85"
      />
      {/* Owl head */}
      <circle cx="130" cy="100" r="18" fill="#faa71a" />
      {/* Owl eyes */}
      <circle cx="122" cy="98" r="7" fill="white" />
      <circle cx="138" cy="98" r="7" fill="white" />
      <circle cx="122" cy="98" r="4" fill="#0d2840" />
      <circle cx="138" cy="98" r="4" fill="#0d2840" />
      <circle cx="124" cy="96" r="1.5" fill="white" />
      <circle cx="140" cy="96" r="1.5" fill="white" />
      {/* Owl beak */}
      <path d="M127 104 l3 4 3-4z" fill="#e8920a" />
      {/* Owl ears */}
      <path d="M115 88 l4-8 4 6z" fill="#faa71a" />
      <path d="M141 88 l4-8 4 6z" fill="#faa71a" />
      {/* Graduation cap */}
      <rect
        x="114"
        y="82"
        width="32"
        height="5"
        rx="2"
        fill="#0d2840"
        opacity="0.8"
      />
      <rect
        x="126"
        y="78"
        width="8"
        height="6"
        rx="1"
        fill="#0d2840"
        opacity="0.8"
      />
      <line
        x1="143"
        y1="84"
        x2="149"
        y2="92"
        stroke="#faa71a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="149" cy="93" r="3" fill="#faa71a" />
      {/* Play button overlay (subtle) */}
      {/* TV stand */}
      <rect
        x="115"
        y="190"
        width="30"
        height="8"
        rx="4"
        fill="white"
        opacity="0.5"
      />
      <rect
        x="100"
        y="196"
        width="60"
        height="6"
        rx="3"
        fill="white"
        opacity="0.4"
      />
      {/* "LESSON 1" badge on screen */}
      <rect
        x="60"
        y="78"
        width="60"
        height="20"
        rx="6"
        fill="#0d2840"
        opacity="0.7"
      />
      <text
        x="90"
        y="92"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="700"
        fontFamily="system-ui"
      >
        LESSON 1
      </text>
      {/* Sparkles */}
      <path
        d="M30 90 l2 5 2-5 5-2-5-2-2-5-2 5-5 2z"
        fill="#faa71a"
        opacity="0.7"
      />
      <path
        d="M220 80 l1.5 3.5 1.5-3.5 3.5-1.5-3.5-1.5-1.5-3.5-1.5 3.5-3.5 1.5z"
        fill="#faa71a"
        opacity="0.8"
      />
      <path
        d="M225 150 l1.5 3.5 1.5-3.5 3.5-1.5-3.5-1.5-1.5-3.5-1.5 3.5-3.5 1.5z"
        fill="#faa71a"
        opacity="0.6"
      />
      <path
        d="M35 160 l1.5 3.5 1.5-3.5 3.5-1.5-3.5-1.5-1.5-3.5-1.5 3.5-3.5 1.5z"
        fill="#28b7d9"
        opacity="0.7"
      />
      {/* Episode badge */}
      <rect
        x="60"
        y="215"
        width="140"
        height="28"
        rx="14"
        fill="white"
        opacity="0.8"
      />
      <text
        x="130"
        y="233"
        textAnchor="middle"
        fill="#e8920a"
        fontSize="12"
        fontWeight="700"
        fontFamily="system-ui"
      >
        🎬 Episode 24 · Now Playing
      </text>
    </svg>
  );
}

function ParentalSVG() {
  return (
    <svg
      width="260"
      height="260"
      viewBox="0 0 260 260"
      fill="none"
      aria-hidden="true"
    >
      {/* Dashboard card */}
      <rect
        x="30"
        y="50"
        width="200"
        height="160"
        rx="14"
        fill="white"
        opacity="0.9"
      />
      {/* Header row */}
      <rect
        x="42"
        y="64"
        width="80"
        height="10"
        rx="5"
        fill="#5b7fd4"
        opacity="0.4"
      />
      <rect
        x="42"
        y="80"
        width="120"
        height="7"
        rx="3.5"
        fill="#0d2840"
        opacity="0.15"
      />
      {/* Check badge */}
      <circle cx="208" cy="72" r="14" fill="#22c55e" opacity="0.15" />
      <path
        d="M201 72 l5 5 9-9"
        stroke="#22c55e"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Attendance progress ring */}
      <circle
        cx="68"
        cy="148"
        r="32"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="8"
      />
      <circle
        cx="68"
        cy="148"
        r="32"
        fill="none"
        stroke="#5b7fd4"
        strokeWidth="8"
        strokeDasharray="190"
        strokeDashoffset="19"
        strokeLinecap="round"
        transform="rotate(-90 68 148)"
      />
      <text
        x="68"
        y="145"
        textAnchor="middle"
        fill="#0d2840"
        fontSize="14"
        fontWeight="800"
        fontFamily="system-ui"
      >
        97%
      </text>
      <text
        x="68"
        y="158"
        textAnchor="middle"
        fill="#64748b"
        fontSize="9"
        fontFamily="system-ui"
      >
        Attendance
      </text>
      {/* Progress bars right side */}
      <text x="120" y="122" fill="#64748b" fontSize="10" fontFamily="system-ui">
        Tajweed Progress
      </text>
      <rect x="120" y="128" width="96" height="8" rx="4" fill="#e2e8f0" />
      <rect x="120" y="128" width="72" height="8" rx="4" fill="#5b7fd4" />
      <text x="120" y="148" fill="#64748b" fontSize="10" fontFamily="system-ui">
        Memorisation
      </text>
      <rect x="120" y="154" width="96" height="8" rx="4" fill="#e2e8f0" />
      <rect x="120" y="154" width="58" height="8" rx="4" fill="#22c55e" />
      <text x="120" y="174" fill="#64748b" fontSize="10" fontFamily="system-ui">
        Reading Fluency
      </text>
      <rect x="120" y="180" width="96" height="8" rx="4" fill="#e2e8f0" />
      <rect x="120" y="180" width="82" height="8" rx="4" fill="#faa71a" />
      {/* Report ready badge */}
      <rect
        x="42"
        y="215"
        width="176"
        height="28"
        rx="14"
        fill="white"
        opacity="0.85"
      />
      <text
        x="130"
        y="233"
        textAnchor="middle"
        fill="#5b7fd4"
        fontSize="12"
        fontWeight="700"
        fontFamily="system-ui"
      >
        📊 Weekly report delivered
      </text>
      {/* Floating envelope */}
      <rect
        x="188"
        y="48"
        width="38"
        height="28"
        rx="6"
        fill="#5b7fd4"
        opacity="0.15"
      />
      <path
        d="M188 52 l19 14 19-14"
        stroke="#5b7fd4"
        strokeWidth="1.5"
        opacity="0.5"
      />
    </svg>
  );
}

function TeachersSVG() {
  return (
    <svg
      width="260"
      height="260"
      viewBox="0 0 260 260"
      fill="none"
      aria-hidden="true"
    >
      {/* Profile card */}
      <rect
        x="50"
        y="40"
        width="160"
        height="180"
        rx="16"
        fill="white"
        opacity="0.9"
      />
      {/* Avatar circle */}
      <circle
        cx="130"
        cy="100"
        r="38"
        fill="linear-gradient(135deg, #2dd4bf, #28b7d9)"
      />
      <circle cx="130" cy="100" r="38" fill="#2dd4bf" opacity="0.3" />
      {/* Avatar person */}
      <circle cx="130" cy="90" r="16" fill="#0e6e8a" opacity="0.8" />
      <ellipse cx="130" cy="122" rx="24" ry="18" fill="#0e6e8a" opacity="0.6" />
      {/* Graduation cap on avatar */}
      <rect
        x="117"
        y="75"
        width="26"
        height="5"
        rx="2.5"
        fill="#0d2840"
        opacity="0.9"
      />
      <rect
        x="127"
        y="71"
        width="6"
        height="6"
        rx="1"
        fill="#0d2840"
        opacity="0.9"
      />
      <line
        x1="142"
        y1="78"
        x2="146"
        y2="85"
        stroke="#faa71a"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="146" cy="86" r="2.5" fill="#faa71a" />
      {/* Name */}
      <rect
        x="90"
        y="148"
        width="80"
        height="10"
        rx="5"
        fill="#0d2840"
        opacity="0.2"
      />
      <rect
        x="100"
        y="164"
        width="60"
        height="8"
        rx="4"
        fill="#2dd4bf"
        opacity="0.3"
      />
      {/* Stars */}
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M${82 + i * 20} 185 l2.5 5 5.5 0.8-4 3.9 1 5.5-5-2.5-5 2.5 1-5.5-4-3.9 5.5-0.8z`}
          fill="#faa71a"
        />
      ))}
      {/* Ijazah badge */}
      <rect
        x="68"
        y="210"
        width="124"
        height="28"
        rx="14"
        fill="#2dd4bf"
        opacity="0.2"
      />
      <text
        x="130"
        y="228"
        textAnchor="middle"
        fill="#0e6e8a"
        fontSize="12"
        fontWeight="700"
        fontFamily="system-ui"
      >
        ✓ Ijazah Certified
      </text>
      {/* Sparkles */}
      <path
        d="M38 80 l2 4.5 2-4.5 4.5-2-4.5-2-2-4.5-2 4.5-4.5 2z"
        fill="#2dd4bf"
        opacity="0.7"
      />
      <path
        d="M215 90 l1.5 3.5 1.5-3.5 3.5-1.5-3.5-1.5-1.5-3.5-1.5 3.5-3.5 1.5z"
        fill="#faa71a"
        opacity="0.8"
      />
      <path
        d="M210 160 l1.5 3.5 1.5-3.5 3.5-1.5-3.5-1.5-1.5-3.5-1.5 3.5-3.5 1.5z"
        fill="#2dd4bf"
        opacity="0.6"
      />
    </svg>
  );
}

function LiveSVG() {
  return (
    <svg
      width="260"
      height="260"
      viewBox="0 0 260 260"
      fill="none"
      aria-hidden="true"
    >
      {/* Main video call window */}
      <rect
        x="30"
        y="55"
        width="200"
        height="140"
        rx="14"
        fill="white"
        opacity="0.9"
      />
      {/* Video bg (student) */}
      <rect
        x="42"
        y="67"
        width="176"
        height="100"
        rx="8"
        fill="#c8daf8"
        opacity="0.5"
      />
      {/* Teacher avatar in main view */}
      <circle cx="130" cy="107" r="30" fill="#0d2840" opacity="0.2" />
      <circle cx="130" cy="95" r="14" fill="#0d2840" opacity="0.5" />
      <ellipse cx="130" cy="120" rx="20" ry="14" fill="#0d2840" opacity="0.4" />
      {/* Live red dot */}
      <circle cx="54" cy="76" r="5" fill="#ef4444" />
      <text
        x="64"
        y="80"
        fill="#0d2840"
        fontSize="10"
        fontWeight="700"
        fontFamily="system-ui"
        opacity="0.7"
      >
        LIVE
      </text>
      {/* Timer */}
      <rect
        x="178"
        y="68"
        width="34"
        height="16"
        rx="8"
        fill="#0d2840"
        opacity="0.5"
      />
      <text
        x="195"
        y="80"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontFamily="system-ui"
      >
        24:16
      </text>
      {/* Student pip video (bottom right) */}
      <rect
        x="172"
        y="140"
        width="36"
        height="24"
        rx="6"
        fill="#eaf8fc"
        opacity="0.9"
      />
      <circle cx="190" cy="148" r="6" fill="#28b7d9" opacity="0.4" />
      <ellipse cx="190" cy="158" rx="8" ry="5" fill="#28b7d9" opacity="0.3" />
      {/* Control bar */}
      <rect
        x="60"
        y="170"
        width="140"
        height="18"
        rx="9"
        fill="#0d2840"
        opacity="0.08"
      />
      {/* Control icons */}
      <circle cx="95" cy="179" r="6" fill="#ef4444" opacity="0.7" />
      <circle cx="115" cy="179" r="6" fill="#0d2840" opacity="0.15" />
      <circle cx="135" cy="179" r="6" fill="#0d2840" opacity="0.15" />
      <circle cx="155" cy="179" r="6" fill="#0d2840" opacity="0.15" />
      {/* Join button */}
      <rect
        x="68"
        y="210"
        width="124"
        height="30"
        rx="15"
        fill="#0d2840"
        opacity="0.85"
      />
      <text
        x="130"
        y="229"
        textAnchor="middle"
        fill="white"
        fontSize="12"
        fontWeight="700"
        fontFamily="system-ui"
      >
        ▶ Join Class Now
      </text>
      {/* WhatsApp reminder badge */}
      <rect
        x="185"
        y="45"
        width="58"
        height="22"
        rx="11"
        fill="#22c55e"
        opacity="0.2"
      />
      <text
        x="214"
        y="60"
        textAnchor="middle"
        fill="#22c55e"
        fontSize="10"
        fontWeight="700"
        fontFamily="system-ui"
      >
        WA ✓ Sent
      </text>
    </svg>
  );
}

function DuasSVG() {
  return (
    <svg
      width="260"
      height="260"
      viewBox="0 0 260 260"
      fill="none"
      aria-hidden="true"
    >
      {/* Crescent moon */}
      <path
        d="M155 50 a65 65 0 1 0 0 130 a50 50 0 1 1 0-130z"
        fill="#22c55e"
        opacity="0.2"
      />
      <path
        d="M155 60 a55 55 0 1 0 0 110 a40 40 0 1 1 0-110z"
        fill="#22c55e"
        opacity="0.15"
      />
      {/* Stars */}
      {[
        [60, 70],
        [90, 45],
        [185, 55],
        [215, 90],
        [200, 150],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y} l2 4.5 4.5 0.8-3.2 3.2 0.8 4.5-4.1-2-4.1 2 0.8-4.5-3.2-3.2 4.5-0.8z`}
          fill="#faa71a"
          opacity={0.5 + i * 0.07}
        />
      ))}
      {/* Hands (praying) */}
      <path
        d="M85 160 C85 130 95 115 110 110 L115 108 C120 106 122 110 120 116 L115 140"
        stroke="#22c55e"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M175 160 C175 130 165 115 150 110 L145 108 C140 106 138 110 140 116 L145 140"
        stroke="#22c55e"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M115 140 C115 150 120 155 130 155 C140 155 145 150 145 140"
        stroke="#22c55e"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      {/* Dua card */}
      <rect
        x="50"
        y="185"
        width="160"
        height="50"
        rx="12"
        fill="white"
        opacity="0.85"
      />
      <text
        x="130"
        y="205"
        textAnchor="middle"
        fill="#22c55e"
        fontSize="11"
        fontWeight="800"
        fontFamily="system-ui"
      >
        Dua of the Day
      </text>
      <rect
        x="64"
        y="210"
        width="132"
        height="7"
        rx="3.5"
        fill="#22c55e"
        opacity="0.2"
      />
      <rect
        x="80"
        y="222"
        width="100"
        height="7"
        rx="3.5"
        fill="#22c55e"
        opacity="0.15"
      />
      {/* Glow effect */}
      <circle cx="130" cy="115" r="50" fill="#22c55e" opacity="0.04" />
    </svg>
  );
}

const ILLUSTRATIONS = {
  gamified: <GamifiedSVG />,
  animated: <AnimatedSVG />,
  parental: <ParentalSVG />,
  teachers: <TeachersSVG />,
  live: <LiveSVG />,
  duas: <DuasSVG />,
};

// ─── Card Variants ─────────────────────────────────────────────────────────────
const cardVariants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, y: -16, transition: { duration: 0.22, ease: "easeIn" } },
};

const contentVariants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, delay: 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const illustrationVariants = {
  initial: { opacity: 0, scale: 0.92, x: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { duration: 0.45, delay: 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function ChevronIcon({ direction }) {
  const isLeft = direction === "left";
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={isLeft ? "M10 12L6 8l4-4" : "M6 4l4 4-4 4"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function FeaturesSection() {
  const [activeId, setActiveId] = useState(FEATURES[0].id);
  const foundIndex = FEATURES.findIndex((f) => f.id === activeId);
  const activeIndex = foundIndex === -1 ? 0 : foundIndex;
  const feature = FEATURES[activeIndex];
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < FEATURES.length - 1;

  function goPrev() {
    if (!canGoPrev) return;
    setActiveId(FEATURES[activeIndex - 1].id);
  }

  function goNext() {
    if (!canGoNext) return;
    setActiveId(FEATURES[activeIndex + 1].id);
  }

  const carouselArrowClass =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/95 text-content-primary shadow-[0_4px_24px_rgba(0,0,0,0.30)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 enabled:cursor-pointer enabled:hover:bg-white enabled:hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)] disabled:cursor-not-allowed disabled:opacity-35";

  return (
    <section className="bg-white px-6 py-[100px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        {/* ── Section Header ─────────────────────────────────────────────── */}
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 md:items-end">
          <div className="reveal-left">
            <div className="section-chip inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] px-4 py-[6px] text-[12px] font-[700] tracking-[0.06em] text-brand-cyan-dark">
              Why Quran Odyssey
            </div>
            <h2 className="mt-4 text-[40px] font-[plus-eb] leading-[1.08] tracking-[-0.03em] text-content-primary md:text-[44px]">
              Everything your child needs,{" "}
              <span className="text-brand-cyan">in one platform.</span>
            </h2>
          </div>
          <p className="reveal-right max-w-[520px] text-[16px] leading-[1.75] text-secondary-styling">
            We didn&apos;t patch together existing tools. We built every feature
            from scratch around one goal — a child who loves learning Quran and
            parents who can see the difference.
          </p>
        </div>

        {/* ── Tab Pills ──────────────────────────────────────────────────── */}
        <div className="reveal mb-8 flex flex-wrap gap-2">
          {FEATURES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveId(f.id)}
              className={[
                "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-[8px] text-[14px] font-[plus-b] transition-all duration-200",
                activeId === f.id
                  ? "border-brand-navy bg-brand-navy text-white shadow-[0_4px_14px_rgba(13,40,64,0.25)]"
                  : "border-line-light bg-white text-content-muted hover:border-line-default hover:text-content-primary",
              ].join(" ")}
            >
              {/* <span className="text-[14px]">{f.icon}</span> */}
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Feature Card + carousel arrows ─────────────────────────────── */}
        <div className="relative">
          {/* Mobile — controls above card */}
          <div className="mb-4 flex items-center justify-center gap-3 md:hidden">
            <button
              type="button"
              aria-label="Previous feature"
              disabled={!canGoPrev}
              onClick={goPrev}
              className={carouselArrowClass}
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              aria-label="Next feature"
              disabled={!canGoNext}
              onClick={goNext}
              className={carouselArrowClass}
            >
              <ChevronIcon direction="right" />
            </button>
          </div>

          <button
            type="button"
            aria-label="Previous feature"
            disabled={!canGoPrev}
            onClick={goPrev}
            className={`${carouselArrowClass} absolute top-1/2 left-3 z-10 hidden -translate-x-full -translate-y-1/2 md:flex`}
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            aria-label="Next feature"
            disabled={!canGoNext}
            onClick={goNext}
            className={`${carouselArrowClass} absolute top-1/2 right-3 z-10 hidden translate-x-full -translate-y-1/2 md:flex`}
          >
            <ChevronIcon direction="right" />
          </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="overflow-hidden rounded-[var(--radius-lg)]"
            style={{ background: feature.gradient }}
          >
            <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_1fr]">
              {/* Left — Content */}
              <motion.div
                variants={contentVariants}
                initial="initial"
                animate="animate"
                className="flex flex-col justify-center p-10 md:p-14"
              >
                {/* Feature number + tag */}
                <div className="mb-5 flex items-center gap-3">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: feature.accentDot }}
                  />
                  <span className="text-[12px] font-[800] uppercase tracking-[0.12em] text-content-muted">
                    {feature.num} · {feature.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mb-4 whitespace-pre-line text-[30px] font-[900] leading-[1.1] tracking-[-0.03em] text-content-primary md:text-[34px]">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mb-6 max-w-[420px] text-[15px] leading-[1.8] text-content-muted">
                  {feature.desc}
                </p>

                {/* Bullets */}
                <ul className="mb-8 space-y-3">
                  {feature.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-3 text-[14px] text-content-muted"
                    >
                      <span
                        className="mt-[3px] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-[900] text-white"
                        style={{ background: feature.accentDot }}
                      >
                        ✓
                      </span>
                      <span className="leading-[1.6]">{b}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/booking/trial"
                  className="inline-flex w-fit items-center gap-2 rounded-[var(--radius)] bg-brand-amber px-7 py-[13px] text-[14px] font-[900] text-brand-navy transition hover:-translate-y-[1px] hover:bg-brand-amber-dark"
                >
                  Book a Free Trial
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </motion.div>

              {/* Right — Illustration + Badges */}
              <motion.div
                variants={illustrationVariants}
                initial="initial"
                animate="animate"
                className="relative flex items-center justify-center p-10 md:p-14"
              >
                {/* Illustration */}
                <div className="relative flex items-center justify-center">
                  {ILLUSTRATIONS[feature.id]}

                  {/* Floating badge 1 — top right of illustration */}
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="absolute -right-4 top-0 flex items-center gap-2 rounded-full border border-white/60 bg-white px-4 py-2 text-[13px] font-[800] text-content-primary shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {feature.badge1}
                  </motion.div>

                  {/* Floating badge 2 — bottom left of illustration */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.42, duration: 0.4 }}
                    className="absolute -bottom-2 -left-4 flex items-center gap-2 rounded-full border border-white/60 bg-white px-4 py-2 text-[13px] font-[800] text-content-primary shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {feature.badge2}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
