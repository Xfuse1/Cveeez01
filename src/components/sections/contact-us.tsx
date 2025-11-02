
"use client";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-provider";
import { translations } from "@/lib/translations";
import placeholderImageData from '@/lib/placeholder-images.json';
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, Globe, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ContactUs() {
  const { language } = useLanguage();
  const t = translations[language].footer;
  const contactUsImage = placeholderImageData.placeholderImages.find(img => img.id === 'contact-us-image');

  const contactInfo = [
    { icon: Phone, text: "+20 106 523 6963" },
    { icon: Mail, text: "cyeeez@cyeez.online" },
    { icon: Globe, text: "www.cveeez.com" },
  ];

  return (
    <section id="contact" className="py-12 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.contactUs}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">{t.contactInfo}</h3>
                <ul className="space-y-4">
                  {contactInfo.map((item, index) => (
                    <li key={index} className="flex items-center gap-4">
                      <item.icon className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Send us a message</h3>
                    <form className="space-y-4">
                        <Input placeholder="Your Name" />
                        <Input type="email" placeholder="Your Email" />
                        <Textarea placeholder="Your Message" />
                        <Button className="w-full">
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                        </Button>
                    </form>
                </CardContent>
            </Card>
          </div>
          <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
            {contactUsImage && (
              <Image
                src={contactUsImage.imageUrl}
                alt={contactUsImage.description}
                fill
                className="object-cover"
                data-ai-hint={contactUsImage.imageHint}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
