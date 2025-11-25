"use client";
import Link from 'next/link';
import { Facebook, Linkedin, Instagram, Phone, Mail, Globe } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import { usePathname } from 'next/navigation';

export function Footer() {
  const { language } = useLanguage();
  const t = translations[language];
  const pathname = usePathname();

  const getHref = (hash: string) => (pathname === '/' ? hash : `/${hash}`);

  const quickLinks = [
    { href: '/', label: t.footer.home },
    { href: getHref('#about'), label: t.footer.aboutUs },
    { href: getHref('#team'), label: t.footer.ourTeam },
    { href: getHref('#contact'), label: t.footer.contactUs },
    { href: getHref('#why-choose-us'), label: t.footer.whyChooseUs },
  ];

  const services = [
    { href: '/services/ai-cv-builder', label: t.footer.aiCvBuilder },
    { href: '/ecommerce', label: t.footer.ecommerce },
    { href: '/talent-space', label: t.footer.talentSpace },
    { href: '/jobs', label: t.footer.jobBoard },
    { href: '/services/user-dashboard', label: t.footer.userDashboard },
  ];

  const socialLinks = [
    { href: "https://www.facebook.com/cveeez.eg/", icon: Facebook },
    { href: "https://www.linkedin.com/company/cveez/", icon: Linkedin },
    { href: "https://www.instagram.com/cveeez0?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==", icon: Instagram },
  ];

  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col space-y-4">
            <Logo />
            <p className="text-sm">"{language === 'en' ? t.footer.tagline : t.footer.taglineAr}"</p>
            <p className="text-sm text-muted-foreground">"{language === 'ar' ? t.footer.tagline : t.footer.taglineAr}"</p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">{t.footer.quickLinks}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">{t.footer.ourServices}</h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.label}>
                  <Link href={service.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">{t.footer.contactInfo}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">‪+20 106 523 6963‬</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">cyeeez@cyeez.online</span>
              </li>
              <li className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">www.cveeez.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} CVEEEZ. {t.footer.rights}
          </p>
          <div className="flex items-center space-x-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t.footer.terms}
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t.footer.privacy}
            </Link>
            <Link href="/refund-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t.footer.refund}
            </Link>
            <div className="flex items-center space-x-3">
              {socialLinks.map((social, index) => (
                <Link key={index} href={social.href} className="text-muted-foreground hover:text-primary transition-colors">
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
