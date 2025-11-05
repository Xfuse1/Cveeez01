
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
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
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "unauthorized") {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You do not have permission to access the admin dashboard.",
        duration: 5000,
      });
    }
  }, [searchParams, toast]);

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
