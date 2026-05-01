import ContactForm from "./ContactForm";
import ContactInfoPanel from "./ContactInfoPanel";

export default function ContactFormSection() {
  return (
    <section className="bg-surface-off-white px-6 py-[80px] md:px-[60px]">
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-8 md:grid-cols-[1fr_420px] md:gap-12">
        <div className="reveal-left overflow-hidden rounded-[var(--radius-lg)] border border-line-light bg-white">
          <div className="border-b border-line-light px-8 py-7">
            <div className="text-[20px] font-[800] tracking-[-0.03em] text-content-primary">
              Send us a message
            </div>
            <div className="mt-1 text-[13px] font-[500] text-content-muted">
              We&apos;ll reply within 24 hours. For faster response, WhatsApp us
              directly.
            </div>
          </div>
          <div className="p-8">
            <ContactForm />
          </div>
        </div>

        <div className="reveal-right">
          <ContactInfoPanel />
        </div>
      </div>
    </section>
  );
}

