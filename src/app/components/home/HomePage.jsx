import ScrollProgressBar from "./ScrollProgressBar";
import HomeClientEffects from "./HomeClientEffects";
import HeroSection from "./hero-section/HeroSection";
import TrustBar from "./trust-bar/TrustBar";
import CoursesSection from "./courses/CoursesSection";
import HowItWorksSection from "./how-it-works/HowItWorksSection";
import CartoonLecturesSection from "./cartoon-lectures/CartoonLecturesSection";
import NumbersSection from "./numbers/NumbersSection";
import TeachersPreviewSection from "./teachers-preview/TeachersPreviewSection";
import TestimonialsSection from "./testimonials/TestimonialsSection";
import CtaSection from "./cta/CtaSection";
import Footer from "./footer/Footer";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* <ScrollProgressBar /> */}
      <HomeClientEffects />
      <HeroSection />
      <TrustBar />
      <CoursesSection />
      <HowItWorksSection />
      <CartoonLecturesSection />
      <NumbersSection />
      {/* <TeachersPreviewSection /> */}
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
