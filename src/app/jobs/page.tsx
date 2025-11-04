
"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useLanguage } from "@/contexts/language-provider";
import { mockJobs, mockCandidates } from "@/data/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Briefcase,
  Users,
  DollarSign,
  Laptop,
  BarChart,
  Code,
} from "lucide-react";
import type { Job, Candidate } from "@/types/jobs";

type UserType = "jobSeeker" | "employer";

const jobPortalTranslations = {
  en: {
    title: "Job Portal",
    jobSeekerTitle: "Find Your Dream Job",
    employerTitle: "Find the Best Talent",
    searchPlaceholder: "Job title, keywords, or company",
    locationPlaceholder: "City or region",
    jobType: "Job Type",
    all: "All",
    fullTime: "Full-time",
    partTime: "Part-time",
    remoteOnly: "Remote Only",
    search: "Search",
    userToggle: "Switch to Employer View",
    employerToggle: "Switch to Job Seeker View",
    skills: "Skills",
    experience: "Experience",
    salaryRange: "Salary Range",
  },
  ar: {
    title: "بوابة التوظيف",
    jobSeekerTitle: "ابحث عن وظيفة أحلامك",
    employerTitle: "ابحث عن أفضل المواهب",
    searchPlaceholder: "المسمى الوظيفي، كلمات مفتاحية، أو شركة",
    locationPlaceholder: "المدينة أو المنطقة",
    jobType: "نوع الوظيفة",
    all: "الكل",
    fullTime: "دوام كامل",
    partTime: "دوام جزئي",
    remoteOnly: "عن بعد فقط",
    search: "بحث",
    userToggle: "التبديل إلى عرض صاحب العمل",
    employerToggle: "التبديل إلى عرض الباحث عن عمل",
    skills: "المهارات",
    experience: "الخبرة",
    salaryRange: "نطاق الراتب",
  },
};

// Job Card Component
function JobCard({ job }: { job: Job }) {
  const { language } = useLanguage();
  return (
    <Card className="hover:shadow-md hover:border-primary/30 transition-all">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{job.title}</CardTitle>
            <CardDescription>{job.company}</CardDescription>
          </div>
          <Badge variant="outline">{job.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          <span>
            {job.salaryRange}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" /> <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart className="w-4 h-4" /> <span>{job.experienceLevel}</span>
        </div>
        {job.isRemote && (
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4" /> <span>Remote</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full">Apply Now</Button>
      </CardFooter>
    </Card>
  );
}

// Candidate Card Component
function CandidateCard({ candidate }: { candidate: Candidate }) {
  const { language } = useLanguage();
  const t = jobPortalTranslations[language];

  return (
    <Card className="hover:shadow-md hover:border-primary/30 transition-all">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div>
            <CardTitle>{candidate.name}</CardTitle>
            <CardDescription>{candidate.currentRole}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" /> <span>{candidate.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart className="w-4 h-4" /> <span>{candidate.experienceLevel}</span>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Code className="w-4 h-4" /> {t.skills}
          </h4>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">View Profile</Button>
      </CardFooter>
    </Card>
  );
}

export default function JobsPage() {
  const { language } = useLanguage();
  const t = jobPortalTranslations[language];
  const [userType, setUserType] = useState<UserType>("jobSeeker");

  const toggleUserType = () => {
    setUserType(userType === "jobSeeker" ? "employer" : "jobSeeker");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary font-headline">
            {userType === "jobSeeker" ? t.jobSeekerTitle : t.employerTitle}
          </h1>
          <Button onClick={toggleUserType} variant="link" className="mt-2">
            {userType === "jobSeeker" ? t.userToggle : t.employerToggle}
          </Button>
        </div>

        {/* Search Bar and Filters */}
        <Card className="mb-8 p-4 md:p-6 bg-card/50">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-3 lg:col-span-2 space-y-2">
              <Label htmlFor="search">{t.searchPlaceholder}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="search" placeholder={t.searchPlaceholder} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">{t.locationPlaceholder}</Label>
               <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="location" placeholder={t.locationPlaceholder} className="pl-10" />
              </div>
            </div>
            <Button className="w-full">
              <Search className="mr-2 h-4 w-4" />
              {t.search}
            </Button>
          </div>
           <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                  <Switch id="remote-only" />
                  <Label htmlFor="remote-only">{t.remoteOnly}</Label>
              </div>
              <div className="flex items-center space-x-2">
                  <Label>{t.jobType}</Label>
                  <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder={t.jobType} />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">{t.all}</SelectItem>
                          <SelectItem value="full-time">{t.fullTime}</SelectItem>
                          <SelectItem value="part-time">{t.partTime}</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
          </div>
        </Card>

        {/* Results List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userType === "jobSeeker"
            ? mockJobs.map((job) => <JobCard key={job.id} job={job} />)
            : mockCandidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
              ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
