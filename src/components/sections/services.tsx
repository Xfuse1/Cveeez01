"use client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, ShoppingCart, LayoutDashboard, Sparkles, Briefcase } from "lucide-react";
import { useLanguage } from "@/contexts/language-provider";
import { translations } from "@/lib/translations";

export function Services() {
  const { language } = useLanguage();
  const t = translations[language];

  const serviceList = [
    {
      icon: Bot,
      title: t.services.aiCvBuilder,
      description: t.services.aiCvBuilderDesc,
    },
    {
      icon: ShoppingCart,
      title: t.services.ecommerce,
      description: t.services.ecommerceDesc,
    },
    {
      icon: LayoutDashboard,
      title: t.services.userDashboard,
      description: t.services.userDashboardDesc,
    },
    {
      icon: Sparkles,
      title: t.services.talentSpace,
      description: t.services.talentSpaceDesc,
    },
    {
      icon: Briefcase,
      title: t.services.jobBoard,
      description: t.services.jobBoardDesc,
    },
  ];

  return (
    <section id="services" className="py-12 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.services.title}</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {t.services.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceList.map((service, index) => (
            <Card key={index} className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 ease-in-out lg:last:col-start-2 xl:last:col-start-auto text-center">
              <CardHeader className="flex flex-col items-center gap-4">
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
