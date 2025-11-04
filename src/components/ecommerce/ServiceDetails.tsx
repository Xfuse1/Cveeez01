
"use client";

import type { DisplayService } from "@/types/service";
import Image from "next/image";
import placeholderImageData from "@/lib/placeholder-images.json";
import { CreationMethodCard } from "./CreationMethodCard";
import { CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/language-provider";
import { translations } from "@/lib/translations";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ServiceDetailsProps {
  service: DisplayService;
}

export function ServiceDetails({ service }: ServiceDetailsProps) {
  const { language } = useLanguage();
  const t = translations[language].ecommerce;
  const serviceImage = placeholderImageData.placeholderImages.find(
    (img) => img.id === service.imageId
  );
  const BackIcon = language === 'ar' ? ArrowRight : ArrowLeft;


  const creationMethods = [
    {
      type: "designer" as const,
      title: t.creationMethods.designer.title,
      price: service.prices.designer,
      features: t.creationMethods.designer.features,
      ctaText: t.creationMethods.designer.cta,
      href: "https://wa.me/201065236963",
      isPrimary: true,
    },
    {
      type: "ai" as const,
      title: t.creationMethods.ai.title,
      price: service.prices.ai,
      features: t.creationMethods.ai.features,
      ctaText: t.creationMethods.ai.cta,
      href: "/services/ai-cv-builder",
      isPrimary: false,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
        <div className="mb-8">
            <Button asChild variant="outline">
                <Link href="/ecommerce">
                    <BackIcon className="mr-2 h-4 w-4" />
                    {t.backButton}
                </Link>
            </Button>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* Left Column: Details */}
        <div className="space-y-6">
          {serviceImage && (
            <div className="relative h-64 w-full rounded-lg overflow-hidden shadow-lg">
              <Image
                src={serviceImage.imageUrl}
                alt={service.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                data-ai-hint={serviceImage.imageHint}
              />
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary font-headline">
            {service.title}
          </h1>
          <p className="text-lg text-muted-foreground">{service.description}</p>
          <div>
            <h2 className="text-xl font-bold mb-3">{t.featuresTitle}</h2>
            <ul className="space-y-2">
              {service.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Creation Methods */}
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">{t.creationTitle}</h2>
            {creationMethods.map((method) => (
                <CreationMethodCard key={method.type} method={method} />
            ))}
        </div>
      </div>
    </div>
  );
}
