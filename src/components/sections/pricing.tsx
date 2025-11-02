import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function Pricing() {
  const plans = [
    {
      title: "Standard",
      price: "$29",
      description: "For individuals getting started.",
      features: [
        "1 AI-Generated CV",
        "Standard Templates",
        "Basic Analytics",
        "Email Support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      title: "ATS Pro",
      price: "$59",
      description: "For job seekers targeting top companies.",
      features: [
        "5 AI-Generated CVs",
        "ATS-Optimized Templates",
        "Advanced Analytics",
        "Priority Support",
        "Cover Letter Generator",
      ],
      cta: "Choose Pro",
      popular: true,
    },
    {
      title: "Individual",
      price: "$99",
      description: "For personalized career guidance.",
      features: [
        "Unlimited AI CVs",
        "All Premium Templates",
        "1-on-1 Career Coaching",
        "LinkedIn Profile Review",
        "Interview Preparation",
      ],
      cta: "Contact Us",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Our Packages and Offers</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Choose the plan that best fits your career goals.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.title} className={`flex flex-col ${plan.popular ? 'border-primary ring-2 ring-primary' : ''}`}>
              <CardHeader className="text-center">
                {plan.popular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2"><span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-full">Most Popular</span></div>}
                <CardTitle className="text-2xl font-headline">{plan.title}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-center mb-6">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>{plan.cta}</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
