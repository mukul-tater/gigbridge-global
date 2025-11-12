import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SuccessMetrics from "@/components/SuccessMetrics";
import FeaturedJobs from "@/components/FeaturedJobs";
import JobCategories from "@/components/JobCategories";
import InteractiveJobMap from "@/components/InteractiveJobMap";
import CountryInsights from "@/components/CountryInsights";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Dev Mode: Seed Data Button */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 z-50">
          <Link to="/seed-data">
            <Button 
              size="lg" 
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
              <Database className="mr-2 h-4 w-4" />
              Seed Demo Data
            </Button>
          </Link>
        </div>
      )}
      
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
