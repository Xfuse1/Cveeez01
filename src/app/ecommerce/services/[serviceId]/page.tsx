
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getAllServices, type EcommerceService } from "@/services/ecommerce-services";
import { ServiceDetails } from "@/components/ecommerce/ServiceDetails";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useLanguage } from "@/contexts/language-provider";
import type { DisplayService } from "@/types/service";
import { Loader } from "lucide-react";

export default function ServicePage() {
  const params = useParams();
  const { language } = useLanguage();
  const { serviceId } = params;
  
  const [service, setService] = useState<EcommerceService | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadService();
  }, [serviceId]);

  const loadService = async () => {
    setLoading(true);
    try {
      const services = await getAllServices();
      // Match by href (e.g., /ecommerce/services/ats-cv matches serviceId 'ats-cv')
      const found = services.find((s) => 
        s.href === `/ecommerce/services/${serviceId}` || 
        s.id === serviceId
      );
      
      if (found) {
        setService(found);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error loading service:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading service...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">
            {language === 'ar' ? 'الخدمة غير موجودة' : 'Service Not Found'}
          </h1>
        </main>
        <Footer />
      </div>
    );
  }

  const displayService: DisplayService = {
    id: service.id || '',
    category: service.category,
    imageId: service.imageId,
    prices: {
      designer: service.priceDesigner,
      ai: service.priceAI,
    },
    ctaType: service.ctaType,
    href: service.href,
    title: language === 'ar' ? service.titleAr : service.titleEn,
    description: language === 'ar' ? service.descriptionAr : service.descriptionEn,
    features: language === 'ar' ? service.featuresAr : service.featuresEn,
    ctaText: language === 'ar' ? service.ctaTextAr : service.ctaTextEn,
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
