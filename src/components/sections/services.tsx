import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, ShoppingCart, LayoutDashboard, Sparkles, Briefcase } from "lucide-react";

export function Services() {
  const serviceList = [
    {
      icon: Bot,
      title: "AI CV Builder",
      description: "Generate professional, tailored CVs in minutes with our advanced AI.",
    },
    {
      icon: ShoppingCart,
      title: "E-commerce",
      description: "Purchase premium templates and career-enhancing services.",
    },
    {
      icon: LayoutDashboard,
      title: "User Dashboard",
      description: "Manage your profile, track applications, and access your resources.",
    },
    {
      icon: Sparkles,
      title: "Talent Space",
      description: "Showcase your skills and connect with a network of employers.",
    },
    {
      icon: Briefcase,
      title: "Job Board Portal",
      description: "Find and apply for your dream job from our aggregated listings.",
    },
  ];

  return (
    <section id="services" className="py-12 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Our Core Services</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            A comprehensive suite of tools to empower your career journey.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceList.map((service, index) => (
            <Card key={index} className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 ease-in-out lg:last:col-start-2 xl:last:col-start-auto">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-headline">{service.title}</CardTitle>
                  <CardDescription className="mt-1">{service.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
