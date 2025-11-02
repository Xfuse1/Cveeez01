
"use client";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-provider";
import { translations } from "@/lib/translations";
import placeholderImageData from '@/lib/placeholder-images.json';

export function AboutUs() {
  const { language } = useLanguage();
  const t = translations[language].aboutUs;
  const aboutUsImage = placeholderImageData.placeholderImages.find(img => img.id === 'about-us-image');

  return (
    <section id="about" className="py-12 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-lg order-last md:order-first">
            {aboutUsImage && (
              <Image
                src={aboutUsImage.imageUrl}
                alt={aboutUsImage.description}
                fill
                className="object-cover"
                data-ai-hint={aboutUsImage.imageHint}
              />
            )}
          </div>
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.title}</h2>
            <p className="text-primary font-semibold">{t.subtitle}</p>
            <p className="text-muted-foreground">{t.p1}</p>
            <p className="text-muted-foreground">{t.p2}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
