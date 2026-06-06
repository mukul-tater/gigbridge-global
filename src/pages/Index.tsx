import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HomePlatformStats from "@/components/HomePlatformStats";
import WhySafeWork from "@/components/WhySafeWork";
import AgentComparison from "@/components/AgentComparison";
import SalaryProtectionSection from "@/components/SalaryProtectionSection";
import GlobalDestinations from "@/components/GlobalDestinations";
import HomeJobCategories from "@/components/HomeJobCategories";
import ProcessTimeline from "@/components/ProcessTimeline";
import FeaturedJobs from "@/components/FeaturedJobs";
import PlatformFeatures from "@/components/PlatformFeatures";
import HomeFooterCTA from "@/components/HomeFooterCTA";
import EmployerHomeSections from "@/components/EmployerHomeSections";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { loading, profileLoading, role, isAuthenticated } = useAuth();
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

      {!authResolving && isEmployer ? (
        <>
          <HomePlatformStats />
          <ScrollReveal>
            <ProcessTimeline />
          </ScrollReveal>
          <ScrollReveal>
            <EmployerHomeSections />
          </ScrollReveal>
        </>
      ) : !authResolving ? (
        <>
          <HomePlatformStats />

          <ScrollReveal>
            <WhySafeWork />
          </ScrollReveal>

          <ScrollReveal>
            <AgentComparison />
          </ScrollReveal>

          <ScrollReveal>
            <SalaryProtectionSection />
          </ScrollReveal>

          <ScrollReveal>
            <GlobalDestinations />
          </ScrollReveal>

          <ScrollReveal>
            <HomeJobCategories />
          </ScrollReveal>

          <ScrollReveal>
            <ProcessTimeline />
          </ScrollReveal>

          <ScrollReveal>
            <FeaturedJobs />
          </ScrollReveal>

          <ScrollReveal>
            <PlatformFeatures />
          </ScrollReveal>

          <ScrollReveal>
            <HomeFooterCTA />
          </ScrollReveal>
        </>
      ) : null}

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
