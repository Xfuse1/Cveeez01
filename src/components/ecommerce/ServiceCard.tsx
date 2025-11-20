
"use client";

import type { DisplayService } from "@/types/service";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import placeholderImageData from '@/lib/placeholder-images.json';
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/language-provider";

interface ServiceCardProps {
  service: DisplayService;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { language } = useLanguage();
  const serviceImage = placeholderImageData.placeholderImages.find(img => img.id === service.imageId);

  const formattedPriceDesigner = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
  }).format(service.prices.designer);

  const formattedPriceAI = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
  }).format(service.prices.ai);

  const CtaButton = () => (
    <Button asChild className="w-full" variant={service.ctaType === 'whatsapp' ? 'secondary' : 'default'}>
      <Link href={service.href || '#'} target={service.ctaType === 'whatsapp' ? '_blank' : '_self'}>
        {service.ctaText}
        {service.ctaType === 'link' && <ArrowRight className="ms-2 h-4 w-4" />}
      </Link>
    </Button>
  );

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:border-primary/50 hover:-translate-y-1.5 h-full">
      {serviceImage && (
        <div className="relative h-48 w-full">
          <Image
            src={serviceImage.imageUrl}
            alt={service.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-ai-hint={serviceImage.imageHint}
          />
        </div>
      )}
      <CardHeader>
        <CardTitle>{service.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <CardDescription>{service.description}</CardDescription>
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-muted-foreground">{language === 'ar' ? 'مصمم محترف' : 'Professional Designer'}:</span>
            <span className="font-bold text-primary">{formattedPriceDesigner}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{language === 'ar' ? 'الذكاء الاصطناعي' : 'AI Builder'}:</span>
            <span className="font-bold text-primary">{formattedPriceAI}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <CtaButton />
      </CardFooter>
    </Card>
  );
}
