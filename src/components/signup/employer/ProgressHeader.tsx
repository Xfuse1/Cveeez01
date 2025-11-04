"use client";

import { cn } from "@/lib/utils";

interface ProgressHeaderProps {
  currentStep: number;
}

const steps = [
  { id: 1, title: "Company Info" },
  { id: 2, title: "Contact & Prefs" },
  { id: 3, title: "Billing & KYC" },
];

export function ProgressHeader({ currentStep }: ProgressHeaderProps) {
  return (
    <div className="flex items-center justify-between border rounded-lg p-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1 last:flex-initial">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white",
                currentStep >= step.id ? "bg-primary" : "bg-gray-300"
              )}
            >
              {step.id}
            </div>
            <div>
              <div className="font-semibold">{step.title}</div>
              <div className="text-sm text-muted-foreground">Step {step.id}</div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-px bg-gray-300 mx-4" />
          )}
        </div>
      ))}
    </div>
  );
}
