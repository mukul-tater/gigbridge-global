import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SuccessMetrics from "@/components/SuccessMetrics";
import ProcessTimeline from "@/components/ProcessTimeline";
import FeaturedJobs from "@/components/FeaturedJobs";
import JobCategories from "@/components/JobCategories";
import InteractiveJobMap from "@/components/InteractiveJobMap";
import CountryInsights from "@/components/CountryInsights";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      
      {/* Dev Mode: Seed Data Button */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-20 right-4 z-40 md:bottom-4">
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
      <ProcessTimeline />
      <FeaturedJobs />
      <JobCategories />
      <InteractiveJobMap />
      <CountryInsights />
      <TestimonialsSection />
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
