import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SuccessMetrics from "@/components/SuccessMetrics";
import ProcessTimeline from "@/components/ProcessTimeline";
import FeaturedJobs from "@/components/FeaturedJobs";
import JobCategories from "@/components/JobCategories";
import InteractiveJobMap from "@/components/InteractiveJobMap";
import CountryInsights from "@/components/CountryInsights";
import TestimonialsSection from "@/components/TestimonialsSection";
import EmployerHomeSections from "@/components/EmployerHomeSections";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated, role, loading, profileLoading } = useAuth();
  const authResolving = loading || (isAuthenticated && profileLoading);
  const isEmployer = role === "employer";

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />

      {import.meta.env.DEV && (
        <div className="fixed bottom-20 right-4 z-40 md:bottom-4">
          <Link to="/seed-data">
            <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              <Database className="mr-2 h-4 w-4" />
              Seed Demo Data
            </Button>
          </Link>
        </div>
      )}

      <HeroSection />

      <ScrollReveal>
        <SuccessMetrics />
      </ScrollReveal>

      <ScrollReveal>
        <ProcessTimeline />
      </ScrollReveal>

      {/*
        Worker-centric sections (job listings, categories, job map) only make
        sense for guests and logged-in workers. Employers see employer-focused
        quick actions and value props instead. While auth is still resolving
        we render nothing here to avoid flashing the wrong content.
      */}
      {!authResolving && isEmployer ? (
        <ScrollReveal>
          <EmployerHomeSections />
        </ScrollReveal>
      ) : !authResolving ? (
        <>
          <ScrollReveal>
            <FeaturedJobs />
          </ScrollReveal>

          <ScrollReveal>
            <JobCategories />
          </ScrollReveal>

          <ScrollReveal>
            <InteractiveJobMap />
          </ScrollReveal>
        </>
      ) : null}

      <ScrollReveal>
        <CountryInsights />
      </ScrollReveal>

      <ScrollReveal>
        <TestimonialsSection />
      </ScrollReveal>

      <Footer />

      <MobileBottomNav />
    </div>
  );
};

export default Index;
