
import type { CreationMethod } from "@/types/service";
import { Button } from "@/components/ui/button";

interface CreationMethodProps {
  method: CreationMethod;
}

export default function CreationMethod({ method }: CreationMethodProps) {
  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-2">{method.title}</h3>
      <p className="text-gray-600 mb-4">{method.description}</p>
      <Button className="w-full bg-teal-600 hover:bg-teal-700">
        Select
      </Button>
    </div>
  );
}
