import ScrollProgressBar from "../shared/ScrollProgressBar";
import PageClientEffects from "../shared/PageClientEffects";
import CtaSection from "../shared/CtaSection";
import Footer from "../shared/Footer";
import ContactHeroSection from "./hero/ContactHeroSection";
import ContactBreadcrumbBar from "./breadcrumb/ContactBreadcrumbBar";
import ContactFormSection from "./form/ContactFormSection";
import ChannelsSection from "./channels/ChannelsSection";
import PresenceSection from "./presence/PresenceSection";

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      <ScrollProgressBar />
      <PageClientEffects />
      <ContactHeroSection />
      <ContactBreadcrumbBar />
      <ContactFormSection />
      <ChannelsSection />
      <PresenceSection />
      <CtaSection />
      <Footer />
    </div>
  );
}

