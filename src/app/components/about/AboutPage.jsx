import ScrollProgressBar from "../shared/ScrollProgressBar";
import PageClientEffects from "../shared/PageClientEffects";
import CtaSection from "../shared/CtaSection";
import Footer from "../shared/Footer";
import AboutHeroSection from "./hero/AboutHeroSection";
import BreadcrumbBar from "./breadcrumb/BreadcrumbBar";
import ProblemSection from "./problem/ProblemSection";
import StorySection from "./story/StorySection";
import PhilosophySection from "./philosophy/PhilosophySection";
import AboutNumbersSection from "./numbers/AboutNumbersSection";
import AboutTeachersSection from "./teachers/AboutTeachersSection";

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <ScrollProgressBar />
      <PageClientEffects />
      <AboutHeroSection />
      <BreadcrumbBar />
      <ProblemSection />
      <StorySection />
      <PhilosophySection />
      <AboutNumbersSection />
      <AboutTeachersSection />
      <CtaSection />
      <Footer />
    </div>
  );
}

