import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram, Phone, Mail, Globe } from 'lucide-react';
import { Logo } from '@/components/logo';

export function Footer() {
  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '#', label: 'About Us' },
    { href: '#', label: 'Our Team' },
    { href: '#', label: 'Contact Us' },
    { href: '#', label: 'Why Choose Us' },
  ];

  const services = [
    { href: '#', label: 'AI CV Builder' },
    { href: '#',label: 'E-commerce' },
    { href: '#', label: 'Talent Space' },
    { href: '#', label: 'Job Board' },
    { href: '#', label: 'User Dashboard' },
  ];

  const socialLinks = [
    { href: '#', icon: Facebook },
    { href: '#', icon: Twitter },
    { href: '#', icon: Linkedin },
    { href: '#', icon: Instagram },
  ];

  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col space-y-4">
            <Logo />
            <p className="text-sm">"We achieve your goals"</p>
            <p className="text-sm text-muted-foreground">"نحن نحقق أهدافك"</p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
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
            <h3 className="font-bold text-lg mb-4">Our Services</h3>
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
            <h3 className="font-bold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">+20 106 523 6963</span>
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
            © {new Date().getFullYear()} CVEEEZ. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
             <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
               <Link href="/refund-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Refund Policy
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
