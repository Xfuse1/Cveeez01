"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import heroImageData from '@/lib/placeholder-images.json';
import { useLanguage } from "@/contexts/language-provider";
import { translations } from "@/lib/translations";

export function Hero() {
  const { language } = useLanguage();
  const t = translations[language];
  const heroImage = heroImageData.placeholderImages.find(img => img.id === 'hero-background');

  return (
    <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center text-center text-white overflow-hidden">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          priority
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 p-4 max-w-4xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-headline leading-tight drop-shadow-lg">
          {t.hero.title}
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md">
          {t.hero.subtitle}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button asChild size="lg">
            <Link href="#pricing">
              {t.hero.viewPlans}
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="#services">
              {t.hero.discoverServices} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
