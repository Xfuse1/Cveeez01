import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import teamImageData from '@/lib/placeholder-images.json';

export function Team() {
  const teamMembers = [
    { name: "Ahmed Salah", role: "CEO & Founder", imageId: "team-member-1" },
    { name: "Fatima Al-Zahra", role: "Head of AI Development", imageId: "team-member-2" },
    { name: "Youssef Mohamed", role: "Lead Product Designer", imageId: "team-member-3" },
    { name: "Mariam Adel", role: "Career Success Lead", imageId: "team-member-4" },
  ];

  return (
    <section id="team" className="py-12 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Meet Our Team</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            The passionate minds behind CVeeez, dedicated to your success.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {teamMembers.map((member) => {
            const memberImage = teamImageData.placeholderImages.find(img => img.id === member.imageId);
            return (
              <div key={member.name} className="text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary/20">
                  {memberImage && (
                    <AvatarImage 
                      src={memberImage.imageUrl} 
                      alt={member.name} 
                      data-ai-hint={memberImage.imageHint}
                    />
                  )}
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-bold">{member.name}</h3>
                <p className="text-primary">{member.role}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  );
}
