
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/language-provider";
import type { CreationMethod } from "@/types/service";

interface CreationMethodCardProps {
  method: CreationMethod;
}

export function CreationMethodCard({ method }: CreationMethodCardProps) {
  const { language } = useLanguage();

  const formattedPrice = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
  }).format(method.price);
  
  const ctaText = `${method.ctaText} - ${formattedPrice}`;

  return (
    <Card className={`flex flex-col ${method.isPrimary ? 'border-primary ring-2 ring-primary bg-primary/5' : 'bg-card'}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{method.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-4xl font-extrabold text-center mb-6">
            {formattedPrice}
        </p>
        <ul className="space-y-3 text-sm">
            {method.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                </li>
            ))}
        </ul>
      </CardContent>
      <div className="p-6 pt-0">
         <Button asChild className="w-full" size="lg" variant={method.isPrimary ? 'default' : 'secondary'}>
            <Link href={method.href} target={method.href.startsWith('http') ? '_blank' : '_self'}>
                {ctaText}
            </Link>
        </Button>
      </div>
    </Card>
  );
}
