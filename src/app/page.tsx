import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Achievements } from "@/components/sections/achievements";
import { Pricing } from "@/components/sections/pricing";
import { Team } from "@/components/sections/team";
import { Testimonials } from "@/components/sections/testimonials";

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <Achievements />
        <Pricing />
        <Team />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
