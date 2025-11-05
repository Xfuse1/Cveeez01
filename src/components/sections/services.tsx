
"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Bot, ShoppingCart, LayoutDashboard, Sparkles, Briefcase, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/language-provider";
import { useAuth } from "@/contexts/auth-provider";
import { translations } from "@/lib/translations";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Services() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const t = translations[language];

  const serviceList = [
    {
      icon: Bot,
      title: t.services.aiCvBuilder,
      description: t.services.aiCvBuilderDesc,
      href: "/services/ai-cv-builder",
    },
    {
      icon: ShoppingCart,
      title: t.services.ecommerce,
      description: t.services.ecommerceDesc,
      href: "/ecommerce",
    },
    {
      icon: LayoutDashboard,
      title: t.services.userDashboard,
      description: t.services.userDashboardDesc,
      href: "/services/user-dashboard",
    },
    {
      icon: Sparkles,
      title: t.services.talentSpace,
      description: t.services.talentSpaceDesc,
      href: "/talent-space",
    },
    {
      icon: Briefcase,
      title: t.services.jobBoard,
      description: t.services.jobBoardDesc,
      href: "/jobs",
    },
  ];

  const handleServiceClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    
    // Public routes that don't require authentication
    const publicRoutes = ['/ecommerce'];
    
    if (!user && !publicRoutes.includes(href)) {
      // If not logged in and route is protected, redirect to login
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
    } else {
      // If logged in, or route is public, navigate to the service
      router.push(href);
    }
  };

  return (
    <section id="services" className="py-12 md:py-24 bg-card text-center">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.services.title}</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {t.services.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {serviceList.map((service, index) => (
            <div key={index} onClick={(e) => handleServiceClick(e, service.href)} className="cursor-pointer group">
              <Card className="flex flex-col text-center bg-background/50 dark:bg-background/20 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:border-primary/50 hover:-translate-y-2 h-full">
                <CardContent className="p-8 flex-grow flex flex-col items-center justify-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-6 transition-transform duration-300 group-hover:scale-110">
                    <service.icon className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl mb-2">{service.title}</CardTitle>
                  <CardDescription className="flex-grow">{service.description}</CardDescription>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
