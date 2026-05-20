import Link from "next/link";

export default function ContactBreadcrumbBar() {
  return (
    <div className="bg-surface-light border-y border-line-light">
      <div className="mx-auto flex w-full max-w-[1240px] items-center gap-2 px-6 py-3 text-[13px] font-[600] text-content-muted md:px-[60px]">
        <Link href="/" className="transition hover:text-brand-cyan-dark">
          Home
        </Link>
        <span className="text-content-subtle">›</span>
        <span className="text-content-primary">Contact Us</span>
      </div>
    </div>
  );
}

