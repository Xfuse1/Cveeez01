"use client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, ShoppingCart, LayoutDashboard, Sparkles, Briefcase } from "lucide-react";
import { useLanguage } from "@/contexts/language-provider";
import { translations } from "@/lib/translations";
import Link from "next/link";

export function Services() {
  const { language } = useLanguage();
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
      href: "/services/ecommerce",
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
      href: "/services/talent-space",
    },
    {
      icon: Briefcase,
      title: t.services.jobBoard,
      description: t.services.jobBoardDesc,
      href: "/services/job-board",
    },
  ];

  return (
    <section id="services" className="py-12 md:py-24 bg-card text-center">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.services.title}</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {t.services.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {serviceList.map((service, index) => (
            <Link href={service.href} key={index} className="block">
              <Card className="h-full hover:shadow-lg hover:-translate-y-1.5 transition-transform duration-300 ease-in-out text-center bg-background/50 dark:bg-background/20">
                <CardHeader className="flex flex-col items-center gap-4 p-6">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <service.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="font-headline">{service.title}</CardTitle>
                    <CardDescription className="mt-1">{service.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
