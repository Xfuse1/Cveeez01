
"use client";

import { useParams } from "next/navigation";
import { services as allServicesData } from "@/data/services";
import { ServiceDetails } from "@/components/ecommerce/ServiceDetails";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useLanguage } from "@/contexts/language-provider";
import { translations } from "@/lib/translations";
import type { Service, DisplayService } from "@/types/service";

export default function ServicePage() {
  const params = useParams();
  const { language } = useLanguage();
  const { serviceId } = params;

  const serviceData = allServicesData.find((s) => s.id === serviceId);

  if (!serviceData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Service Not Found</h1>
        </main>
        <Footer />
      </div>
    );
  }
  
  const t = translations[language].ecommerce.services[serviceData.id as keyof typeof translations[typeof language]['ecommerce']['services']];

  const displayService: DisplayService = {
    ...serviceData,
    title: t.title,
    description: t.description,
    features: t.features,
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <ServiceDetails service={displayService} />
      </main>
      <Footer />
    </div>
  );
}
