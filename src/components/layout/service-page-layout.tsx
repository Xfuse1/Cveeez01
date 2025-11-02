"use client";
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import { Bot, ShoppingCart, LayoutDashboard, Sparkles, Briefcase, LucideIcon } from "lucide-react";

interface ServicePageLayoutProps {
  serviceKey: 'aiCvBuilder' | 'ecommerce' | 'userDashboard' | 'talentSpace' | 'jobBoard';
}

const serviceIcons: { [key: string]: LucideIcon } = {
  aiCvBuilder: Bot,
  ecommerce: ShoppingCart,
  userDashboard: LayoutDashboard,
  talentSpace: Sparkles,
  jobBoard: Briefcase,
};

export function ServicePageLayout({ serviceKey }: ServicePageLayoutProps) {
  const { language } = useLanguage();
  const t = translations[language].services;
  const service = {
    title: t[serviceKey as keyof typeof t],
    description: t[(serviceKey + 'Desc') as keyof typeof t],
  };
  const Icon = serviceIcons[serviceKey];

  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-lg">
              <Icon className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl font-headline mb-4 text-primary">
            {service.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{service.description}</p>
          <div className="prose dark:prose-invert max-w-none mt-12 mx-auto text-left">
            <p>More detailed content about this service will be available here soon. We are working on providing in-depth information, tutorials, and examples to help you get the most out of our {service.title.toLowerCase()} service.</p>
            <p>Please check back later for updates!</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
