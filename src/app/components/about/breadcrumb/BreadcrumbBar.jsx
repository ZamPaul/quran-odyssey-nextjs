import Link from "next/link";

export default function BreadcrumbBar() {
  return (
    <div className="border-y border-line-light bg-white">
      <div className="mx-auto flex w-full max-w-[1240px] items-center gap-2 px-6 py-4 text-[13px] font-[600] text-content-muted md:px-[60px]">
        <Link href="/" className="transition hover:text-content-primary">
          Home
        </Link>
        <span className="text-content-subtle">›</span>
        <span className="text-content-primary">About Us</span>
      </div>
    </div>
  );
}

