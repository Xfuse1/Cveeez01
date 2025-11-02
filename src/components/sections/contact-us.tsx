
"use client";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-provider";
import { translations } from "@/lib/translations";
import placeholderImageData from '@/lib/placeholder-images.json';
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, Globe, Send, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { sendContactMessage } from "@/ai/flows/send-contact-message";

export function ContactUs() {
  const { language } = useLanguage();
  const t = translations[language].footer;
  const contactUsImage = placeholderImageData.placeholderImages.find(img => img.id === 'contact-us-image');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const contactInfo = [
    { icon: Phone, text: "+20 106 523 6963" },
    { icon: Mail, text: "cyeeez@cyeez.online" },
    { icon: Globe, text: "www.cveeez.com" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await sendContactMessage(formData);
      if (result.success) {
        toast({
          title: "Message Sent!",
          description: result.message,
        });
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message || "Could not send your message. Please try again later.",
      });
    }
    setIsLoading(false);
  };


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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input 
                          name="name"
                          placeholder="Your Name" 
                          value={formData.name}
                          onChange={handleInputChange}
                          required 
                        />
                        <Input 
                          name="email"
                          type="email" 
                          placeholder="Your Email" 
                          value={formData.email}
                          onChange={handleInputChange}
                          required 
                        />
                        <Textarea 
                          name="message"
                          placeholder="Your Message" 
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            {isLoading ? 'Sending...' : 'Send Message'}
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
