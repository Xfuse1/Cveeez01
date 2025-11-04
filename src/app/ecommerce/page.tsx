
import { services } from "@/data/services";
import ServiceCard from "@/components/ecommerce/ServiceCard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function EcommerceHomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-12">Our Services</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
