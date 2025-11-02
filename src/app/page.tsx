import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { AboutUs } from "@/components/sections/about-us";
import { Services } from "@/components/sections/services";
import { Achievements } from "@/components/sections/achievements";
import { Pricing } from "@/components/sections/pricing";
import { Team } from "@/components/sections/team";
import { Testimonials } from "@/components/sections/testimonials";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { ContactUs } from "@/components/sections/contact-us";

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <AboutUs />
        <Services />
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
