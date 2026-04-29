export default function ScrollProgressBar() {
  return (
    <div
      id="scrollProgress"
      className="fixed left-0 top-0 z-[999] h-[3px] w-0 transition-[width] duration-100"
      style={{
        background: "linear-gradient(90deg, var(--brand-cyan), var(--brand-amber))",
      }}
      aria-hidden="true"
    />
  );
}
