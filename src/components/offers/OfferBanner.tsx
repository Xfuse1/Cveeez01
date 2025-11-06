"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Tag, Clock, Sparkles } from "lucide-react";
import { getActiveOffers, type ServicePrice } from "@/services/pricing";
import { useRouter } from "next/navigation";

interface OfferBannerProps {
  userType?: 'seeker' | 'employer' | 'admin';
  language?: 'en' | 'ar';
}

export function OfferBanner({ userType = 'seeker', language = 'en' }: OfferBannerProps) {
  const [offers, setOffers] = useState<ServicePrice[]>([]);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadOffers();
  }, [userType]); // Re-fetch when userType changes

  const loadOffers = async () => {
    const activeOffers = await getActiveOffers();
    
    // Filter offers based on user type
    const filteredOffers = activeOffers.filter(offer => {
      // AI CV Builder is for seekers
      if (offer.serviceType === 'ai-cv-builder') {
        return userType === 'seeker' || userType === 'admin';
      }
      // View seeker profile is for employers
      if (offer.serviceType === 'view-seeker-profile') {
        return userType === 'employer' || userType === 'admin';
      }
      // View job details is for seekers
      if (offer.serviceType === 'view-job-details') {
        return userType === 'seeker' || userType === 'admin';
      }
      // Job posting is for employers
      if (offer.serviceType === 'job-posting') {
        return userType === 'employer' || userType === 'admin';
      }
      // Talent space and other services are for everyone
      return true;
    });
    
    setOffers(filteredOffers);
  };

  useEffect(() => {
    if (offers.length > 1) {
      const interval = setInterval(() => {
        setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
      }, 5000); // Change offer every 5 seconds
      return () => clearInterval(interval);
    }
  }, [offers.length]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleOfferClick = (offer: ServicePrice) => {
    // Navigate based on service type
    if (offer.serviceType === 'ai-cv-builder') {
      router.push('/services/ai-cv-builder');
    } else if (offer.serviceType === 'view-seeker-profile' || offer.serviceType === 'view-job-details') {
      // Already on jobs page, just scroll or show info
      return;
    } else {
      router.push('/services');
    }
  };

  if (dismissed || offers.length === 0) {
    return null;
  }

  const currentOffer = offers[currentOfferIndex];
  const daysLeft = currentOffer.offerValidUntil
    ? Math.ceil((currentOffer.offerValidUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/30 mb-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12" />
      
      <div className="relative p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Offer Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-primary text-primary-foreground">
                <Sparkles className="h-3 w-3 mr-1" />
                {language === 'ar' ? 'عرض خاص' : 'Special Offer'}
              </Badge>
              {currentOffer.offerPercentage && (
                <Badge variant="destructive" className="text-lg font-bold px-3 py-1">
                  {currentOffer.offerPercentage}% {language === 'ar' ? 'خصم' : 'OFF'}
                </Badge>
              )}
              {daysLeft !== null && daysLeft <= 7 && (
                <Badge variant="outline" className="border-orange-500 text-orange-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {language === 'ar' ? `${daysLeft} أيام متبقية` : `${daysLeft} days left`}
                </Badge>
              )}
            </div>

            {/* Offer Title */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground">
                {currentOffer.serviceName}
              </h3>
              {currentOffer.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {currentOffer.description}
                </p>
              )}
            </div>

            {/* Price Display */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl md:text-3xl font-bold text-primary">
                {currentOffer.currency} {currentOffer.offerPrice?.toFixed(2)}
              </span>
              <span className="text-lg text-muted-foreground line-through">
                {currentOffer.currency} {currentOffer.price.toFixed(2)}
              </span>
              {currentOffer.offerPercentage && (
                <span className="text-sm text-green-600 font-semibold">
                  {language === 'ar' 
                    ? `وفر ${(currentOffer.price - (currentOffer.offerPrice || 0)).toFixed(2)} ${currentOffer.currency}` 
                    : `Save ${currentOffer.currency} ${(currentOffer.price - (currentOffer.offerPrice || 0)).toFixed(2)}`}
                </span>
              )}
            </div>

            {/* Expiry Date */}
            {currentOffer.offerValidUntil && (
              <p className="text-xs text-muted-foreground">
                <Clock className="h-3 w-3 inline mr-1" />
                {language === 'ar' ? 'ينتهي في' : 'Expires on'} {formatDate(currentOffer.offerValidUntil)}
              </p>
            )}

            {/* CTA Button */}
           
          </div>

          {/* Dismiss Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Pagination Dots (if multiple offers) */}
        {offers.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {offers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentOfferIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentOfferIndex 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-primary/30 hover:bg-primary/50'
                }`}
                aria-label={`Go to offer ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
