
"use client";

import { Hero } from "@/components/sections/hero";
import { AboutUs } from "@/components/sections/about-us";
import { Services } from "@/components/sections/services";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { Achievements } from "@/components/sections/achievements";
import { Pricing } from "@/components/sections/pricing";
import { Team } from "@/components/sections/team";
import { Testimonials } from "@/components/sections/testimonials";
import { ContactUs } from "@/components/sections/contact-us";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/language-provider";
import { AuthProvider } from "@/contexts/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";

export default function Home() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main>
              <Hero />
              <Services />
              <AboutUs />
              <WhyChooseUs />
              <Achievements />
              <Pricing />
              <Team />
              <Testimonials />
              <ContactUs />
            </main>
            <Footer />
            <Toaster />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
