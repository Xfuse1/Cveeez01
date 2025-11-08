"use client";

import { useState, useEffect } from 'react';
import { getActiveOffers, ServicePrice } from '@/services/pricing';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

const offerTranslations = {
  en: {
    specialOffers: 'Special Offers!',
    endsSoon: 'Ends on',
  },
  ar: {
    specialOffers: 'عروض خاصة!',
    endsSoon: 'ينتهي في',
  },
};

export function OfferBanner({ userType, language }: { userType: 'seeker' | 'employer', language: 'en' | 'ar' }) {
  const [offers, setOffers] = useState<ServicePrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = offerTranslations[language];

  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true);
      try {
        const activeOffers = await getActiveOffers();
        
        // Filter offers based on user type
        const filteredOffers = activeOffers.filter(offer => {
          // Seeker-specific services
          if (userType === 'seeker') {
            return ['view-job-details', 'ai-cv-builder', 'talent-space'].includes(offer.serviceType);
          }
          // Employer-specific services
          if (userType === 'employer') {
            return ['view-seeker-profile', 'job-posting'].includes(offer.serviceType);
          }
          return true;
        });
        
        setOffers(filteredOffers);
      } catch (error) {
        console.error("Failed to fetch offers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, [userType]);

  if (isLoading || offers.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 dark:bg-green-800/30 p-2 rounded-full">
            <Tag className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-green-800 dark:text-green-200">{t.specialOffers}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
              {offers.map(offer => (
                <div key={offer.id} className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white dark:bg-gray-700">
                    {offer.serviceName} - <span className="font-semibold ml-1">{offer.offerPercentage}% OFF</span>
                  </Badge>
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                    {offer.currency} {offer.offerPrice?.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    {offer.currency} {offer.price.toFixed(2)}
                  </span>
                  {offer.offerValidUntil && (
                    <p className="text-xs text-muted-foreground">
                      {t.endsSoon}: {new Date(offer.offerValidUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
