
import type { Service } from "@/types/service";
import CreationMethod from "./CreationMethod";

interface ServiceDetailsProps {
  service: Service;
}

export default function ServiceDetails({ service }: ServiceDetailsProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-5xl font-extrabold mb-4">{service.name}</h1>
      <p className="text-xl text-gray-700 mb-6">{service.longDescription}</p>
      <p className="text-3xl font-bold text-teal-700 mb-8">{service.price}</p>

      <div>
        <h2 className="text-3xl font-bold mb-6">Choose Creation Method</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {service.creationMethods.map((method) => (
            <CreationMethod key={method.type} method={method} />
          ))}
        </div>
      </div>
    </div>
  );
}
