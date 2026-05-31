import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-brand-navy-dark px-6 py-8 md:px-[60px]">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center justify-between gap-3 md:flex-row">
        <div className="footer-copy text-[13px] font-[500] text-white/35">
          © 2026 Quran Odyssey. All rights reserved. Built by VISAITECH.
        </div>
        <div className="footer-brand text-[14px] font-[800] tracking-[-0.02em] text-white/70">
          {/* Quran <span className="text-brand-amber">Odyssey</span> */}
          <Link href={"/"}>
            <div className="relative w-[200px] h-[40px] ">
              <Image
                src={`${"/logo2.png"}`}
                width={100}
                height={50}
                alt="logo"
                className="object-cover select-none pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
              />
            </div>{" "}
          </Link>
        </div>
      </div>
    </footer>
  );
}
