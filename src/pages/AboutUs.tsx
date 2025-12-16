import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Building2, Users, Target, Award } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
      <Header />
      <MobileBottomNav />
      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">About SafeWorkGlobal</h1>
            <p className="text-xl text-center text-muted-foreground max-w-3xl mx-auto">
              Connecting skilled workers with opportunities across the globe
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  SafeWorkGlobal is dedicated to bridging the gap between skilled workers and employers worldwide. 
                  We provide a secure, transparent platform that empowers workers to find meaningful employment 
                  while helping employers discover qualified talent.
                </p>
                <p className="text-muted-foreground">
                  With a focus on compliance, worker welfare, and fair employment practices, we're building 
                  the future of gig work.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-lg border text-center">
                  <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-2xl mb-2">500+</h3>
                  <p className="text-sm text-muted-foreground">Companies</p>
                </div>
                <div className="bg-card p-6 rounded-lg border text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-2xl mb-2">10K+</h3>
                  <p className="text-sm text-muted-foreground">Workers</p>
                </div>
                <div className="bg-card p-6 rounded-lg border text-center">
                  <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-2xl mb-2">5K+</h3>
                  <p className="text-sm text-muted-foreground">Jobs Posted</p>
                </div>
                <div className="bg-card p-6 rounded-lg border text-center">
                  <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-2xl mb-2">98%</h3>
                  <p className="text-sm text-muted-foreground">Satisfaction</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-12">
              <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">Worker First</h3>
                  <p className="text-muted-foreground">
                    We prioritize worker welfare, safety, and fair compensation in everything we do.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">Transparency</h3>
                  <p className="text-muted-foreground">
                    Clear terms, honest communication, and complete visibility throughout the process.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">Quality</h3>
                  <p className="text-muted-foreground">
                    We maintain high standards for both workers and employers on our platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
