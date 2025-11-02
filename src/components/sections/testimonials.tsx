import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star } from "lucide-react";
import testimonialsImageData from '@/lib/placeholder-images.json';

export function Testimonials() {
  const reviews = [
    {
      name: "Salma H.",
      role: "Software Engineer",
      review: "The AI CV builder is a game-changer! I landed my dream job at a FAANG company, and CVeeez was instrumental in crafting the perfect resume.",
      rating: 5,
      imageId: "testimonial-avatar-1",
    },
    {
      name: "Khalid R.",
      role: "Marketing Manager",
      review: "Incredible platform. The user dashboard made it so easy to track my applications, and the ATS-optimized templates are top-notch.",
      rating: 5,
      imageId: "testimonial-avatar-2",
    },
    {
      name: "Nour T.",
      role: "Recent Graduate",
      review: "As a recent graduate, I was lost. The individual coaching session gave me the confidence and direction I needed. Highly recommended!",
      rating: 5,
      imageId: "testimonial-avatar-3",
    },
  ];

  const renderStars = (rating: number) => {
    return Array(rating)
      .fill(0)
      .map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />);
  };

  return (
    <section id="testimonials" className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">What Our Clients Say</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Real feedback from professionals who have advanced their careers with CVeeez.
          </p>
        </div>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-4xl mx-auto"
        >
          <CarouselContent>
            {reviews.map((review, index) => {
               const reviewImage = testimonialsImageData.placeholderImages.find(img => img.id === review.imageId);
               return (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="h-full flex flex-col">
                      <CardContent className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex mb-2">{renderStars(review.rating)}</div>
                          <p className="text-muted-foreground italic">"{review.review}"</p>
                        </div>
                        <div className="mt-4 flex items-center">
                          <Avatar className="h-10 w-10 mr-4">
                            {reviewImage && (
                              <AvatarImage 
                                src={reviewImage.imageUrl} 
                                alt={review.name} 
                                data-ai-hint={reviewImage.imageHint}
                              />
                            )}
                            <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{review.name}</p>
                            <p className="text-xs text-muted-foreground">{review.role}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
