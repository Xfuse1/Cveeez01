
import type { Service } from "@/types/service";
import Link from "next/link";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link href={`/ecommerce/services/${service.id}`} className="block group">
      <div className="border rounded-lg p-6 h-full transition-all group-hover:shadow-lg group-hover:-translate-y-1">
        <h2 className="text-2xl font-bold mb-2">{service.name}</h2>
        <p className="text-gray-600 mb-4">{service.description}</p>
        <p className="text-xl font-semibold text-teal-600">{service.price}</p>
      </div>
    </Link>
  );
}
