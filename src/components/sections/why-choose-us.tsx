
"use client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, Zap, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/language-provider";
import { translations } from "@/lib/translations";
import Image from "next/image";
import placeholderImageData from '@/lib/placeholder-images.json';

export function WhyChooseUs() {
  const { language } = useLanguage();
  const t = translations[language].whyChooseUs;
  const whyChooseUsImage = placeholderImageData.placeholderImages.find(img => img.id === 'why-choose-us-image');


  const features = [
    {
      icon: Target,
      title: t.features.ats.title,
      description: t.features.ats.description,
    },
    {
      icon: Zap,
      title: t.features.fast.title,
      description: t.features.fast.description,
    },
    {
      icon: ShieldCheck,
      title: t.features.professional.title,
      description: t.features.professional.description,
    },
  ];

  return (
    <section id="why-choose-us" className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.title}</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                 <div className="bg-primary/10 p-3 rounded-lg mt-1">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                <div>
                    <h3 className="text-lg font-bold font-headline">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
            </div>
             <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-lg">
               {whyChooseUsImage && (
                <Image
                    src={whyChooseUsImage.imageUrl}
                    alt={whyChooseUsImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={whyChooseUsImage.imageHint}
                />
                )}
             </div>
        </div>
      </div>
    </section>
  );
}
