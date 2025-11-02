"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/language-provider";
import { translations } from "@/lib/translations";

export function Pricing() {
  const { language } = useLanguage();
  const t = translations[language];

  const plans = [
    {
      title: t.pricing.standard.title,
      price: "$29",
      description: t.pricing.standard.description,
      features: t.pricing.standard.features,
      cta: t.pricing.standard.cta,
      popular: false,
    },
    {
      title: t.pricing.pro.title,
      price: "$59",
      description: t.pricing.pro.description,
      features: t.pricing.pro.features,
      cta: t.pricing.pro.cta,
      popular: true,
      popularText: t.pricing.pro.popular,
    },
    {
      title: t.pricing.individual.title,
      price: "$99",
      description: t.pricing.individual.description,
      features: t.pricing.individual.features,
      cta: t.pricing.individual.cta,
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4 text-center">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.pricing.title}</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {t.pricing.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.title} className={`flex flex-col text-center ${plan.popular ? 'border-primary ring-2 ring-primary' : ''}`}>
              <CardHeader>
                {plan.popular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2"><span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-full">{plan.popularText}</span></div>}
                <CardTitle className="text-2xl font-headline">{plan.title}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-4 text-left">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>{plan.cta}</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
