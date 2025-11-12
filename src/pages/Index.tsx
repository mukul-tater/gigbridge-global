import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SuccessMetrics from "@/components/SuccessMetrics";
import FeaturedJobs from "@/components/FeaturedJobs";
import JobCategories from "@/components/JobCategories";
import InteractiveJobMap from "@/components/InteractiveJobMap";
import CountryInsights from "@/components/CountryInsights";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <SuccessMetrics />
      <FeaturedJobs />
      <JobCategories />
      <InteractiveJobMap />
      <CountryInsights />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default Index;
