"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "0 EGP/mo",
    features: ["1 job post/month", "Limited candidate access"],
  },
  {
    name: "Basic",
    price: "500 EGP/mo",
    features: ["10 job posts/month", "Full candidate access", "Company profile"],
  },
  {
    name: "Pro",
    price: "1500 EGP/mo",
    features: ["Unlimited job posts", "Advanced analytics", "Priority support"],
  },
];

export function Step3BillingKyc() {
  const { control, setValue, watch } = useFormContext();
  const selectedPlan = watch("plan");

  return (
    <div className="space-y-6">
      <div>
        <FormLabel>Choose your plan</FormLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "cursor-pointer",
                selectedPlan === plan.name && "border-primary"
              )}
              onClick={() => setValue("plan", plan.name)}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{plan.price}</div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-sm">{feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <FormField
        control={control}
        name="taxId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tax ID / VAT Number</FormLabel>
            <FormControl>
              <Input placeholder="123-456-789" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="commercialRegDoc"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Commercial Registration Document</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                onChange={(e) => field.onChange(e.target.files?.[0])}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
