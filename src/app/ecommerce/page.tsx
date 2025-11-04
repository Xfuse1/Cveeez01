"use client";

import { useMemo } from 'react';
import { services as allServices } from "@/data/services";
import ServiceCard from "@/components/ecommerce/ServiceCard";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useLanguage } from "@/contexts/language-provider";
import { translations } from "@/lib/translations";
import type { DisplayService, ServiceCategory } from '@/types/service';

export default function EcommerceHomePage() {
  const { language } = useLanguage();
  const t = translations[language].ecommerce;

  const displayServices: DisplayService[] = useMemo(() => {
    return allServices.map(service => {
      const serviceT = t.services[service.id as keyof typeof t.services];
      return {
        ...service,
        title: serviceT.title,
        description: serviceT.description,
        ctaText: serviceT.cta,
      };
    });
  }, [language, t.services]);

  const categories = useMemo(() => {
    return allServices.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(displayServices.find(s => s.id === service.id)!);
      return acc;
    }, {} as Record<ServiceCategory, DisplayService[]>);
  }, [displayServices]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary font-headline">
            {t.pageTitle}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            {t.pageSubtitle}
          </p>
        </div>

        <div className="space-y-16">
          {Object.entries(categories).map(([category, services]) => (
            <section key={category}>
              <h2 className="text-3xl font-bold font-headline mb-8 text-center md:text-start">
                {t.categories[category as ServiceCategory]}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
