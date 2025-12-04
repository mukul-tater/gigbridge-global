import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Construction Worker",
      country: "Now in Japan",
      avatar: "RK",
      rating: 5,
      text: "I found my dream job in Japan through SafeWork. The visa process was smooth and the salary is exactly as promised. My family's life has completely changed!",
      placement: "Construction Manager",
      salary: "₹3,00,000/month"
    },
    {
      name: "Maria Santos",
      role: "Electrical Technician",
      country: "Now in Germany",
      avatar: "MS",
      rating: 5,
      text: "Within 3 weeks of signing up, I had 5 job offers from Germany. The platform made it easy to compare opportunities and choose the best fit for my skills.",
      placement: "Solar Panel Installer",
      salary: "₹3,30,000/month"
    },
    {
      name: "Ahmed Hassan",
      role: "Welder",
      country: "Now in UAE",
      avatar: "AH",
      rating: 5,
      text: "SafeWork Global connected me with a reputable company in Dubai. The accommodation and benefits are excellent. I recommend this to all skilled workers!",
      placement: "Pipeline Welder",
      salary: "₹2,75,000/month"
    },
    {
      name: "Chen Wei",
      role: "Manufacturing Operator",
      country: "Now in Poland",
      avatar: "CW",
      rating: 5,
      text: "Fast hiring process with minimal paperwork. I started my job in Poland within 6 weeks. The platform's support team helped me every step of the way.",
      placement: "Assembly Line Lead",
      salary: "₹2,20,000/month"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="h-4 w-4 fill-current" />
            4.9/5 from 12,000+ workers
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Success Stories from Around the World
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real workers who found life-changing opportunities through SafeWork Global
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-border">
              <div className="absolute top-4 right-4 text-primary/10">
                <Quote className="h-16 w-16" />
              </div>
              
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-warning fill-current" />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                  "{testimonial.text}"
                </p>

                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Placed as:</span>
                    <span className="text-xs font-medium text-foreground">{testimonial.placement}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Location:</span>
                    <span className="text-xs font-medium text-primary">{testimonial.country}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Salary:</span>
                    <span className="text-xs font-bold text-success">{testimonial.salary}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
