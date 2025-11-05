
import type { Service } from '@/types/service';

// This file now contains the core, non-translated data for each service.
// Translated content (title, description, features) is in /lib/translations.ts

export const services: Service[] = [
  {
    id: 'ats-cv',
    category: 'cv-writing',
    imageId: 'service-ats-cv',
    prices: { designer: 299, ai: 149 },
    ctaType: 'link',
    href: '/ecommerce/services/ats-cv',
  },
  {
    id: 'standard-cv',
    category: 'cv-writing',
    imageId: 'service-standard-cv',
    prices: { designer: 249, ai: 129 },
    ctaType: 'link',
    href: '/ecommerce/services/standard-cv',
  },
  {
    id: 'europass-cv',
    category: 'cv-writing',
    imageId: 'service-europass-cv',
    prices: { designer: 199, ai: 99 },
    ctaType: 'link',
    href: '/ecommerce/services/europass-cv',
  },
  {
    id: 'canadian-cv',
    category: 'cv-writing',
    imageId: 'service-canadian-cv',
    prices: { designer: 349, ai: 179 },
    ctaType: 'link',
    href: '/ecommerce/services/canadian-cv',
  },
  {
    id: 'cover-letter',
    category: 'cv-writing',
    imageId: 'service-cover-letter',
    prices: { designer: 179, ai: 89 },
    ctaType: 'link',
    href: '/ecommerce/services/cover-letter',
  },
  // The services below do not have a details page, so they don't need detailed pricing/features here.
  {
    id: 'portfolio',
    category: 'career-dev',
    imageId: 'service-portfolio',
    prices: { designer: 0, ai: 0 }, // Placeholder prices
    ctaType: 'whatsapp',
    href: 'https://wa.me/201065236963',
  },
  {
    id: 'linkedin-professional',
    category: 'career-dev',
    imageId: 'service-linkedin',
    prices: { designer: 0, ai: 0 }, // Placeholder prices
    ctaType: 'whatsapp',
    href: 'https://wa.me/201065236963',
  },
  {
    id: 'training-workshops',
    category: 'career-dev',
    imageId: 'service-training',
    prices: { designer: 0, ai: 0 }, // Placeholder prices
    ctaType: 'whatsapp',
    href: 'https://wa.me/201065236963',
  },
  {
    id: 'job-listings',
    category: 'job-search',
    imageId: 'service-job-listings',
    prices: { designer: 0, ai: 0 }, // Placeholder prices
    ctaType: 'link',
    href: '/jobs',
  },
  {
    id: 'translator',
    category: 'tools',
    imageId: 'service-translator',
    prices: { designer: 0, ai: 0 }, // Free service
    ctaType: 'link',
    href: '/translator',
  },
];
