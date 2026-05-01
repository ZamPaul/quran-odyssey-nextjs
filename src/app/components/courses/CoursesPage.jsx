import ScrollProgressBar from "../shared/ScrollProgressBar";
import PageClientEffects from "../shared/PageClientEffects";
import CtaSection from "../shared/CtaSection";
import Footer from "../shared/Footer";
import CoursesClientEffects from "./effects/CoursesClientEffects";
import CoursesHeroSection from "./hero/CoursesHeroSection";
import CoursesBreadcrumbBar from "./breadcrumb/CoursesBreadcrumbBar";
import FilterBar from "./filters/FilterBar";
import CourseCatalogSection from "./catalog/CourseCatalogSection";
import LearningPathwaySection from "./pathway/LearningPathwaySection";
import CoursesFaqSection from "./faq/CoursesFaqSection";

export default function CoursesPage() {
  return (
    <div className="flex flex-col">
      <ScrollProgressBar />
      <PageClientEffects />
      <CoursesClientEffects />
      <CoursesHeroSection />
      <CoursesBreadcrumbBar />
      <FilterBar />
      <CourseCatalogSection />
      <LearningPathwaySection />
      <CoursesFaqSection />
      <CtaSection />
      <Footer />
    </div>
  );
}

