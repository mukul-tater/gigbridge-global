import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Globe,
  Building2,
  Wrench,
  Zap,
  Flame,
  Droplets,
  Truck,
  Factory,
  Briefcase
} from "lucide-react";
import constructionIcon from "@/assets/construction-icon.png";
import electricianIcon from "@/assets/electrician-icon.png";
import welderIcon from "@/assets/welder-icon.png";

interface SubCategory {
  name: string;
  count: number;
  avgSalary: string;
  growth: string;
}

interface CategoryDetail {
  id: string;
  icon: any;
  title: string;
  description: string;
  longDescription: string;
  totalJobs: string;
  avgSalary: string;
  salaryRange: string;
  demand: "Very High" | "High" | "Medium";
  growth: string;
  topCountries: string[];
  skills: string[];
  subcategories: SubCategory[];
  requirements: string[];
  benefits: string[];
}

const categoryDetails: CategoryDetail[] = [
  {
    id: "construction",
    icon: constructionIcon,
    title: "Construction",
    description: "Building the future with infrastructure and residential projects",
    longDescription: "Construction professionals are in high demand globally as countries invest in infrastructure development, residential housing, and commercial buildings. This sector offers diverse opportunities from hands-on labor to project management roles.",
    totalJobs: "12,847",
    avgSalary: "$3,200/month",
    salaryRange: "$2,000 - $5,500",
    demand: "High",
    growth: "+15% annually",
    topCountries: ["Japan", "Germany", "UAE", "Singapore", "Australia"],
    skills: ["Masonry", "Concrete Work", "Blueprint Reading", "Safety Management", "Heavy Equipment"],
    subcategories: [
      { name: "Masonry & Bricklaying", count: 4521, avgSalary: "$2,800/mo", growth: "+12%" },
      { name: "Concrete Workers", count: 3214, avgSalary: "$3,000/mo", growth: "+18%" },
      { name: "Construction Managers", count: 2876, avgSalary: "$4,500/mo", growth: "+20%" },
      { name: "Site Supervisors", count: 2236, avgSalary: "$3,800/mo", growth: "+16%" }
    ],
    requirements: [
      "Physical fitness and stamina",
      "Safety certification (OSHA or equivalent)",
      "1-5 years experience depending on role",
      "Ability to read technical drawings"
    ],
    benefits: [
      "Visa sponsorship available",
      "Accommodation provided",
      "Health insurance",
      "Annual leave and flight tickets"
    ]
  },
  {
    id: "electrical",
    icon: electricianIcon,
    title: "Electrical",
    description: "Powering industries with expertise in electrical systems",
    longDescription: "Electrical workers are essential for industrial operations, renewable energy projects, and smart infrastructure development. The transition to renewable energy has created unprecedented opportunities in this field.",
    totalJobs: "8,234",
    avgSalary: "$3,800/month",
    salaryRange: "$2,500 - $6,000",
    demand: "Very High",
    growth: "+22% annually",
    topCountries: ["Norway", "Australia", "Canada", "Germany", "Netherlands"],
    skills: ["Electrical Wiring", "Panel Installation", "Troubleshooting", "Solar Systems", "Industrial Controls"],
    subcategories: [
      { name: "Industrial Electrician", count: 3105, avgSalary: "$4,000/mo", growth: "+24%" },
      { name: "Solar Panel Installer", count: 2234, avgSalary: "$3,600/mo", growth: "+30%" },
      { name: "Electrical Engineer", count: 1876, avgSalary: "$5,200/mo", growth: "+25%" },
      { name: "Maintenance Electrician", count: 1019, avgSalary: "$3,400/mo", growth: "+15%" }
    ],
    requirements: [
      "Licensed electrician certification",
      "Knowledge of electrical codes and standards",
      "3-7 years experience for senior roles",
      "Solar certification (for renewable energy roles)"
    ],
    benefits: [
      "High earning potential",
      "Career advancement opportunities",
      "International certifications recognized",
      "Growing demand in renewable sector"
    ]
  },
  {
    id: "welding",
    icon: welderIcon,
    title: "Welding",
    description: "Precision metalwork for industries worldwide",
    longDescription: "Welders are in critical demand across shipbuilding, pipeline construction, and heavy industry. Specialized welding certifications command premium salaries, especially in oil & gas and maritime sectors.",
    totalJobs: "6,521",
    avgSalary: "$4,100/month",
    salaryRange: "$2,800 - $6,500",
    demand: "High",
    growth: "+18% annually",
    topCountries: ["Qatar", "Russia", "South Korea", "UAE", "Singapore"],
    skills: ["MIG Welding", "TIG Welding", "Arc Welding", "Underwater Welding", "Pipeline Welding"],
    subcategories: [
      { name: "Pipeline Welders", count: 2431, avgSalary: "$5,200/mo", growth: "+22%" },
      { name: "Structural Welders", count: 1987, avgSalary: "$3,800/mo", growth: "+15%" },
      { name: "Underwater Welders", count: 876, avgSalary: "$6,500/mo", growth: "+25%" },
      { name: "Fabrication Welders", count: 1227, avgSalary: "$3,500/mo", growth: "+12%" }
    ],
    requirements: [
      "Welding certification (AWS or equivalent)",
      "2-5 years hands-on experience",
      "Knowledge of multiple welding techniques",
      "Ability to work at heights (for some roles)"
    ],
    benefits: [
      "Premium pay for specialized skills",
      "Project-based bonuses",
      "International travel opportunities",
      "Certification sponsorship"
    ]
  },
  {
    id: "plumbing",
    icon: "🔧",
    title: "Plumbing",
    description: "Essential services for residential and commercial systems",
    longDescription: "Plumbing professionals are needed for new construction, maintenance, and HVAC systems. The growing focus on water conservation and sustainable building practices has expanded opportunities in this traditional trade.",
    totalJobs: "5,432",
    avgSalary: "$2,900/month",
    salaryRange: "$2,000 - $4,500",
    demand: "Medium",
    growth: "+12% annually",
    topCountries: ["UK", "Ireland", "New Zealand", "Canada", "Australia"],
    skills: ["Pipe Fitting", "Drainage Systems", "HVAC", "Water Systems", "Gas Lines"],
    subcategories: [
      { name: "Master Plumbers", count: 1876, avgSalary: "$4,200/mo", growth: "+15%" },
      { name: "HVAC Technicians", count: 1654, avgSalary: "$3,400/mo", growth: "+18%" },
      { name: "Commercial Plumbers", count: 1234, avgSalary: "$3,100/mo", growth: "+10%" },
      { name: "Residential Plumbers", count: 668, avgSalary: "$2,500/mo", growth: "+8%" }
    ],
    requirements: [
      "Plumbing license or apprenticeship completion",
      "2-4 years experience",
      "Gas fitting certification (optional)",
      "Physical fitness"
    ],
    benefits: [
      "Stable employment",
      "Local and international opportunities",
      "Self-employment potential",
      "Growing green building market"
    ]
  },
  {
    id: "delivery-logistics",
    icon: "🚚",
    title: "Delivery & Logistics",
    description: "Fast-growing sector for supply chain and last-mile delivery",
    longDescription: "The e-commerce boom has created massive demand for delivery drivers, warehouse workers, and logistics coordinators. This sector offers flexible schedules and rapid employment opportunities.",
    totalJobs: "15,678",
    avgSalary: "$2,400/month",
    salaryRange: "$1,800 - $3,500",
    demand: "Very High",
    growth: "+28% annually",
    topCountries: ["Netherlands", "Belgium", "Denmark", "USA", "Germany"],
    skills: ["Driving License", "Route Planning", "Package Handling", "Customer Service", "Warehouse Operations"],
    subcategories: [
      { name: "Delivery Drivers", count: 7234, avgSalary: "$2,300/mo", growth: "+30%" },
      { name: "Warehouse Operators", count: 4321, avgSalary: "$2,400/mo", growth: "+25%" },
      { name: "Logistics Coordinators", count: 2876, avgSalary: "$3,200/mo", growth: "+28%" },
      { name: "Forklift Operators", count: 1247, avgSalary: "$2,600/mo", growth: "+22%" }
    ],
    requirements: [
      "Valid driving license (for driver roles)",
      "Clean driving record",
      "Forklift certification (for warehouse)",
      "Basic literacy and numeracy"
    ],
    benefits: [
      "Quick hiring process",
      "Flexible schedules available",
      "Performance bonuses",
      "Growth opportunities in management"
    ]
  },
  {
    id: "manufacturing",
    icon: "🏭",
    title: "Manufacturing",
    description: "Modern production facilities with automated systems",
    longDescription: "Manufacturing roles span from traditional assembly work to operating sophisticated CNC machines and robotics. Industry 4.0 has created demand for tech-savvy workers in smart factories.",
    totalJobs: "9,876",
    avgSalary: "$3,000/month",
    salaryRange: "$2,200 - $5,000",
    demand: "High",
    growth: "+14% annually",
    topCountries: ["Czech Republic", "Poland", "Slovakia", "Germany", "Japan"],
    skills: ["Machine Operation", "Quality Control", "Assembly", "CNC Programming", "Safety Protocols"],
    subcategories: [
      { name: "CNC Operators", count: 3421, avgSalary: "$3,800/mo", growth: "+18%" },
      { name: "Assembly Workers", count: 2987, avgSalary: "$2,500/mo", growth: "+12%" },
      { name: "Quality Inspectors", count: 2156, avgSalary: "$3,200/mo", growth: "+15%" },
      { name: "Production Supervisors", count: 1312, avgSalary: "$4,200/mo", growth: "+16%" }
    ],
    requirements: [
      "High school diploma or equivalent",
      "Technical training (for specialized roles)",
      "1-3 years experience",
      "Attention to detail"
    ],
    benefits: [
      "Shift allowances",
      "Overtime opportunities",
      "On-the-job training",
      "Career progression paths"
    ]
  }
];

const getDemandColor = (demand: string) => {
  switch (demand) {
    case "Very High":
      return "bg-red-500/10 text-red-600 border-red-200";
    case "High":
      return "bg-success/10 text-success border-success/20";
    case "Medium":
      return "bg-warning/10 text-warning border-warning/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function JobCategories() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">
              <TrendingUp className="h-3 w-3 mr-1" />
              52,588 Active Jobs
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Explore Job Categories
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover high-demand career opportunities across industries worldwide. 
              Filter by category to find the perfect role for your skills.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="text-2xl font-bold text-foreground">15,000+</p>
                    <p className="text-sm text-muted-foreground">Active Workers</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="text-2xl font-bold text-foreground">3,200+</p>
                    <p className="text-sm text-muted-foreground">Companies Hiring</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="text-2xl font-bold text-foreground">45+</p>
                    <p className="text-sm text-muted-foreground">Countries</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Tabs */}
      <section className="py-8 border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 lg:px-6">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
              <TabsTrigger value="all">All Categories</TabsTrigger>
              <TabsTrigger value="construction">Construction</TabsTrigger>
              <TabsTrigger value="electrical">Electrical</TabsTrigger>
              <TabsTrigger value="welding">Welding</TabsTrigger>
              <TabsTrigger value="plumbing">Plumbing</TabsTrigger>
              <TabsTrigger value="delivery-logistics">Delivery & Logistics</TabsTrigger>
              <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Category Details */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="space-y-12">
            {categoryDetails
              .filter(cat => selectedCategory === "all" || cat.id === selectedCategory)
              .map((category) => (
                <Card key={category.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {typeof category.icon === 'string' && category.icon.startsWith('/') ? (
                          <img src={category.icon} alt={category.title} className="h-16 w-16" />
                        ) : typeof category.icon === 'string' ? (
                          <div className="text-5xl">{category.icon}</div>
                        ) : (
                          <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Factory className="h-8 w-8 text-primary" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-2xl mb-2">{category.title}</CardTitle>
                          <CardDescription className="text-base">
                            {category.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={`${getDemandColor(category.demand)} border`}>
                        {category.demand} Demand
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    {/* Statistics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="h-4 w-4 text-primary" />
                          <p className="text-sm text-muted-foreground">Total Jobs</p>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{category.totalJobs}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <p className="text-sm text-muted-foreground">Avg. Salary</p>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{category.avgSalary}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <p className="text-sm text-muted-foreground">Growth Rate</p>
                        </div>
                        <p className="text-2xl font-bold text-success">{category.growth}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="h-4 w-4 text-primary" />
                          <p className="text-sm text-muted-foreground">Salary Range</p>
                        </div>
                        <p className="text-lg font-bold text-foreground">{category.salaryRange}</p>
                      </div>
                    </div>

                    {/* Long Description */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-3">About this Category</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {category.longDescription}
                      </p>
                    </div>

                    {/* Subcategories */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">Popular Subcategories</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.subcategories.map((sub, idx) => (
                          <Card key={idx} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-foreground">{sub.name}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  {sub.growth}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{sub.count} jobs</span>
                                <span className="font-semibold text-primary">{sub.avgSalary}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      {/* Top Countries */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Globe className="h-5 w-5 text-primary" />
                          Top Hiring Countries
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {category.topCountries.map((country, idx) => (
                            <Badge key={idx} variant="outline" className="text-sm">
                              {country}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Required Skills */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Wrench className="h-5 w-5 text-primary" />
                          Key Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {category.skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-sm">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-6">
                      {/* Requirements */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                        <ul className="space-y-2">
                          {category.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-primary mt-1">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Benefits */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                        <ul className="space-y-2">
                          {category.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-success mt-1">✓</span>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex gap-4 flex-wrap">
                      <Link to={`/jobs?category=${encodeURIComponent(category.title)}`}>
                        <Button size="lg">
                          View {category.title} Jobs
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                      <Link to="/auth">
                        <Button size="lg" variant="outline">
                          Create Job Alert
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
