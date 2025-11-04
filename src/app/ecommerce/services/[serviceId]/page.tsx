
"use client";

import { useParams } from "next/navigation";
import { services } from "@/data/services";
import ServiceDetails from "@/components/ecommerce/ServiceDetails";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ServicePage() {
  const params = useParams();
  const { serviceId } = params;
  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    return <div>Service not found</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <ServiceDetails service={service} />
      </main>
      <Footer />
    </div>
  );
}
