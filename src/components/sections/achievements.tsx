import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, Smile } from "lucide-react";

export function Achievements() {
  const stats = [
    {
      icon: Users,
      value: "+5800",
      label: "Success Story",
    },
    {
      icon: Smile,
      value: "97%",
      label: "Customer Satisfaction",
    },
    {
      icon: CheckCircle,
      value: "+100",
      label: "Partner Companies"
    }
  ];

  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20">
          <CardContent className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center">
                  <stat.icon className="w-12 h-12 text-primary mb-4" />
                  <p className="text-4xl md:text-5xl font-extrabold text-foreground font-headline">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
