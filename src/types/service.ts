
export type CtaType = 'link' | 'whatsapp';
export type ServiceCategory = 'cv-writing' | 'career-dev' | 'job-search';

export interface ServicePrices {
  designer: number;
  ai: number;
}

export interface Service {
  id: string;
  category: ServiceCategory;
  imageId: string;
  prices: ServicePrices;
  ctaType?: CtaType; // Optional as it might not be needed for the details page data
  href?: string; // Optional for the same reason
}

// This extends the base service with translated text for display
export interface DisplayService extends Service {
  title: string;
  description: string;
  features: string[];
  ctaText?: string; // ctaText is for the card on the main ecommerce page
}

export interface CreationMethod {
  type: 'designer' | 'ai';
  title: string;
  price: number;
  features: string[];
  ctaText: string;
  href: string;
  isPrimary: boolean;
}
