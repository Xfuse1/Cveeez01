export type CtaType = 'link' | 'whatsapp';
export type ServiceCategory = 'cv-writing' | 'career-dev' | 'job-search';

export interface Service {
  id: string;
  category: ServiceCategory;
  ctaType: CtaType;
  href: string;
  imageId: string;
}

// This extends the base service with translated text
export interface DisplayService extends Service {
  title: string;
  description: string;
  ctaText: string;
}

// Raw data structure for services.ts
export type ServiceData = Omit<Service, 'id'> & { id: string };
