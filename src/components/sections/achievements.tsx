"use client";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, Smile } from "lucide-react";
import { useLanguage } from "@/contexts/language-provider";
import { translations } from "@/lib/translations";

export function Achievements() {
  const { language } = useLanguage();
  const t = translations[language];

  const stats = [
    {
      icon: Users,
      value: "+5800",
      label: t.achievements.successStory,
    },
    {
      icon: Smile,
      value: "97%",
      label: t.achievements.customerSatisfaction,
    },
    {
      icon: CheckCircle,
      value: "+100",
      label: t.achievements.partnerCompanies,
    }
  ];

  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4 text-center">
         <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.achievements.title}</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {t.achievements.subtitle}
          </p>
        </div>
        <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20">
          <CardContent className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center">
                  <stat.icon className="w-12 h-12 text-primary mb-4" />
                  <p className="text-4xl md:text-5xl font-extrabold text-foreground font-headline">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
