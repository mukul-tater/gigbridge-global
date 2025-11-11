import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedJobs from "@/components/FeaturedJobs";
import JobCategories from "@/components/JobCategories";
import CountryInsights from "@/components/CountryInsights";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturedJobs />
      <JobCategories />
      <CountryInsights />
      <Footer />
    </div>
  );
};

export default Index;
