
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

export default function Home() {
  return (
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
    </div>
  );
}
