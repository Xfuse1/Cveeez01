

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useLanguage } from "@/contexts/language-provider";
import { getJobs, getCandidates, getUserType } from "@/services/firestore";
import { getWalletBalance, deductFromWallet } from "@/services/wallet";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Loader,
  Mail,
  Phone,
  ArrowRight,
  Globe,
  User,
  Info,
} from "lucide-react";
import type { Job, Candidate } from "@/types/jobs";
import { useAuth } from "@/contexts/auth-provider";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import placeholderImageData from '@/lib/placeholder-images.json';
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/config";


const jobPortalTranslations = {
  en: {
    title: "Job Portal",
    jobSeekerTitle: "Find Your Dream Job",
    jobSeekerSubtitle: "Search thousands of job listings from top companies.",
    employerTitle: "Find the Best Talent",
    employerSubtitle: "Discover and connect with qualified candidates for your open roles.",
    searchPlaceholder: "Job title, keywords, or company",
    searchCandidatesPlaceholder: "Skills, role, or keywords",
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
    viewDetails: "View Details",
    viewProfile: "View Profile",
    jobDescription: "Job Description",
    contactInfo: "Contact Information",
    loading: "Loading...",
    loginRequiredTitle: "Login Required",
    loginRequiredDescription: "You need to be logged in to access the job portal.",
    loginButton: "Log In",
  },
  ar: {
    title: "بوابة التوظيف",
    jobSeekerTitle: "ابحث عن وظيفة أحلامك",
    jobSeekerSubtitle: "ابحث في آلاف قوائم الوظائف من أفضل الشركات.",
    employerTitle: "ابحث عن أفضل المواهب",
    employerSubtitle: "اكتشف وتواصل مع المرشحين المؤهلين لأدوارك المفتوحة.",
    searchPlaceholder: "المسمى الوظيفي، كلمات مفتاحية، أو شركة",
    searchCandidatesPlaceholder: "مهارات، دور، أو كلمات مفتاحية",
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
    viewDetails: "عرض التفاصيل",
    viewProfile: "عرض البروفايل",
    jobDescription: "الوصف الوظيفي",
    contactInfo: "معلومات التواصل",
    loading: "جاري التحميل...",
    loginRequiredTitle: "تسجيل الدخول مطلوب",
    loginRequiredDescription: "يجب عليك تسجيل الدخول للوصول إلى بوابة التوظيف.",
    loginButton: "تسجيل الدخول",
  },
};

// Job Card Component
function JobCard({ job, onViewDetails }: { job: Job, onViewDetails: (job: Job) => void }) {
  const { language } = useLanguage();
  return (
    <Card className="hover:shadow-md hover:border-primary/30 transition-all flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{job.title}</CardTitle>
            <CardDescription>{job.company}</CardDescription>
          </div>
          <Badge variant="outline">{job.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground flex-grow">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          <span>{job.salaryRange}</span>
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
        <Button className="w-full" onClick={() => onViewDetails(job)}>
          {jobPortalTranslations[language].viewDetails}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Candidate Card Component
function CandidateCard({ candidate, onViewProfile }: { candidate: Candidate; onViewProfile: (candidate: Candidate) => void; }) {
  const { language } = useLanguage();
  const t = jobPortalTranslations[language];

  return (
    <Card className="hover:shadow-md hover:border-primary/30 transition-all">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div>
            <CardTitle>{candidate.name}</CardTitle>
            <p className="text-md font-semibold text-primary">{candidate.currentRole}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" /> <span>{candidate.location}</span>
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
        <Button className="w-full" onClick={() => onViewProfile(candidate)}>
          {t.viewProfile}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Job Details Modal
function JobDetailsModal({ job, isOpen, onOpenChange }: { job: Job | null, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    const { language } = useLanguage();
    const t = jobPortalTranslations[language];

    if (!job) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{job.title}</DialogTitle>
                    <DialogDescription>{job.company} - {job.location}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">{t.jobDescription}</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                    </div>
                     <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" />{job.salaryRange}</div>
                        <div className="flex items-center gap-2"><BarChart className="w-4 h-4 text-primary" />{job.experienceLevel}</div>
                        <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" />{job.type}</div>
                        {job.isRemote && <div className="flex items-center gap-2"><Laptop className="w-4 h-4 text-primary" />Remote</div>}
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">{t.contactInfo}</h3>
                        <div className="space-y-2 text-sm">
                           {job.companyEmail && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> <a href={`mailto:${job.companyEmail}`} className="text-muted-foreground hover:underline">{job.companyEmail}</a></div>}
                           {job.companyPhone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> <span className="text-muted-foreground">{job.companyPhone}</span></div>}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function CandidateProfileModal({ candidate, isOpen, onOpenChange }: { candidate: Candidate | null; isOpen: boolean; onOpenChange: (open: boolean) => void; }) {
  const { language } = useLanguage();
  const t = jobPortalTranslations[language];
  if (!candidate) return null;

  const ProfileField = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null | string[] }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;

    return (
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          {Array.isArray(value) ? (
            <div className="flex flex-wrap gap-2 mt-1">
              {value.map((item, index) => (
                <Badge key={index} variant="secondary">{item}</Badge>
              ))}
            </div>
          ) : (
            <p className="font-medium text-foreground">{value}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl">{candidate.name}</DialogTitle>
          <DialogDescription>{candidate.currentRole}</DialogDescription>
        </DialogHeader>
        <div className="py-4 grid grid-cols-1 gap-y-4">
          <ProfileField icon={Mail} label="Email" value={candidate.email} />
          <ProfileField icon={Phone} label="Phone" value={candidate.phone} />
          <ProfileField icon={MapPin} label="Location" value={candidate.location} />
          <ProfileField icon={Globe} label="Nationality" value={candidate.nationality} />
          
          {candidate.bio && (
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">Bio</p>
                <p className="font-medium text-foreground text-sm">{candidate.bio}</p>
              </div>
            </div>
          )}
          
          <ProfileField icon={Code} label={t.skills} value={candidate.skills} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function JobsPage() {
  const { language } = useLanguage();
  const t = jobPortalTranslations[language];
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [userType, setUserType] = useState<"seeker" | "employer" | null>(null);
  
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [displayedJobs, setDisplayedJobs] = useState<Job[]>([]);
  const [displayedCandidates, setDisplayedCandidates] = useState<Candidate[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [showPaymentAlert, setShowPaymentAlert] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [pendingJob, setPendingJob] = useState<Job | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);

  // Filter states for jobs
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [jobType, setJobType] = useState('all');

  // Filter states for candidates
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateLocation, setCandidateLocation] = useState('');
  
  const jobPortalImage = placeholderImageData.placeholderImages.find(img => img.id === 'job-portal-hero');

  const fetchJobs = async () => {
    setIsLoading(true);
    const fetchedJobs = await getJobs({});
    setAllJobs(fetchedJobs);
    setDisplayedJobs(fetchedJobs);
    setIsLoading(false);
  };

  const fetchCandidates = async () => {
    setIsLoading(true);
    const fetchedCandidates = await getCandidates({});
    setAllCandidates(fetchedCandidates);
    setDisplayedCandidates(fetchedCandidates);
    setIsLoading(false);
  };

  useEffect(() => {
    const initializePortal = async () => {
      setIsLoading(true);
      
      if (authLoading) return;
      
      if (!user) {
        setShowLoginAlert(true);
        setIsLoading(false);
        return;
      }

      const type = await getUserType(user.uid);
      
      if (type) {
        setUserType(type);
        if (type === "seeker") {
          fetchJobs();
        } else {
          fetchCandidates();
        }
      } else {
        console.warn("Could not determine user type, defaulting to seeker.");
        setUserType("seeker");
        fetchJobs();
      }
      
      setIsLoading(false);
    };

    initializePortal();
  }, [user, authLoading]);

  const handleSearch = () => {
    if (userType === 'seeker') {
        let filteredJobs = allJobs;
        const lowerQuery = searchQuery.toLowerCase();

        if (searchQuery) {
            filteredJobs = filteredJobs.filter(job => 
                job.title.toLowerCase().includes(lowerQuery) ||
                job.company.toLowerCase().includes(lowerQuery) ||
                job.description.toLowerCase().includes(lowerQuery)
            );
        }
        if (locationQuery) {
            filteredJobs = filteredJobs.filter(job => job.location.toLowerCase().includes(locationQuery.toLowerCase()));
        }
        if (remoteOnly) {
            filteredJobs = filteredJobs.filter(job => job.isRemote);
        }
        if (jobType !== 'all') {
            filteredJobs = filteredJobs.filter(job => job.type === jobType);
        }
        setDisplayedJobs(filteredJobs);
    } else {
        let filteredCandidates = allCandidates;
        const lowerQuery = candidateSearch.toLowerCase();
        if (candidateSearch) {
            filteredCandidates = filteredCandidates.filter(candidate =>
                candidate.name.toLowerCase().includes(lowerQuery) ||
                (candidate.currentRole && candidate.currentRole.toLowerCase().includes(lowerQuery)) ||
                candidate.skills.some(skill => skill.toLowerCase().includes(lowerQuery))
            );
        }
        if (candidateLocation) {
            filteredCandidates = filteredCandidates.filter(candidate => candidate.location.toLowerCase().includes(candidateLocation.toLowerCase()));
        }
        setDisplayedCandidates(filteredCandidates);
    }
  };

  const handleViewDetails = async (job: Job) => {
    if (!user) {
      setShowLoginAlert(true);
      return;
    }

    setPendingJob(job);
    setPaymentMessage(language === 'ar' 
      ? 'سيتم خصم 5 جنيه مصري من محفظتك لعرض تفاصيل الوظيفة. هل تريد المتابعة؟'
      : 'EGP 5.00 will be deducted from your wallet to view job details. Continue?');
    setShowPaymentAlert(true);
  };

  const handleConfirmPayment = async () => {
    if (!user || !pendingJob) return;

    setIsProcessingPayment(true);
    setShowPaymentAlert(false);

    try {
      const result = await deductFromWallet(
        user.uid,
        5,
        `View Job Details: ${pendingJob.title}`,
        pendingJob.id
      );

      if (result.success) {
        setSelectedJob(pendingJob);
        setIsModalOpen(true);
        setPendingJob(null);
        
        toast({
          title: language === 'ar' ? 'تم الدفع بنجاح' : 'Payment Successful',
          description: language === 'ar' 
            ? `تم خصم 5 جنيه مصري من محفظتك. الرصيد الجديد: ${result.newBalance?.toFixed(2)} جنيه`
            : `EGP 5.00 has been deducted from your wallet. New balance: EGP ${result.newBalance?.toFixed(2)}`,
        });
      } else {
        setPaymentMessage(result.message);
        setShowPaymentAlert(true);
        
        toast({
          title: language === 'ar' ? 'فشل الدفع' : 'Payment Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentMessage(language === 'ar' 
        ? 'فشل معالجة الدفع. الرجاء المحاولة مرة أخرى.'
        : 'Failed to process payment. Please try again.');
      setShowPaymentAlert(true);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCancelPayment = () => {
    setShowPaymentAlert(false);
    setPendingJob(null);
  };
  
  const handleRedirectToLogin = () => {
      router.push('/login');
  }

  const handleViewProfile = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsCandidateModalOpen(true);
  };

  const renderContent = () => {
    if (authLoading || isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">{t.loading}</p>
        </div>
      );
    }
    
    return (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userType === "seeker"
          ? displayedJobs.map((job) => <JobCard key={job.id} job={job} onViewDetails={handleViewDetails} />)
          : displayedCandidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} onViewProfile={handleViewProfile} />
            ))}
      </div>
    )
  }

  const renderFilters = () => {
    if (userType === 'seeker') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div className="lg:col-span-2 space-y-2">
            <Label htmlFor="search">{t.searchPlaceholder}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="search" placeholder={t.searchPlaceholder} className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">{t.locationPlaceholder}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="location" placeholder={t.locationPlaceholder} className="pl-10" value={locationQuery} onChange={e => setLocationQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-4 border-t col-span-1 md:col-span-2 lg:col-span-3">
              <div className="flex items-center gap-x-2">
                  <Switch id="remote-only" checked={remoteOnly} onCheckedChange={setRemoteOnly} />
                  <Label htmlFor="remote-only">{t.remoteOnly}</Label>
              </div>
              <div className="flex items-center gap-x-2">
                  <Label className="me-2">{t.jobType}</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder={t.jobType} />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">{t.all}</SelectItem>
                          <SelectItem value="Full-time">{t.fullTime}</SelectItem>
                          <SelectItem value="Part-time">{t.partTime}</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <Button onClick={handleSearch} className="ms-auto">
                <Search className="h-4 w-4 me-2" />
                {t.search}
              </Button>
          </div>
        </div>
      );
    } else {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div className="lg:col-span-2 space-y-2">
                <Label htmlFor="search-candidates">{t.searchCandidatesPlaceholder}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="search-candidates" placeholder={t.searchCandidatesPlaceholder} className="pl-10" value={candidateSearch} onChange={e => setCandidateSearch(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="candidate-location">{t.locationPlaceholder}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="candidate-location" placeholder={t.locationPlaceholder} className="pl-10" value={candidateLocation} onChange={e => setCandidateLocation(e.target.value)} />
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end mt-4">
                  <Button onClick={handleSearch}>
                    <Search className="h-4 w-4 me-2" />
                    {t.search}
                  </Button>
              </div>
           </div>
        )
    }
  }
  
  if (showLoginAlert) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <AlertDialog open={true}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.loginRequiredTitle}</AlertDialogTitle>
                <AlertDialogDescription>{t.loginRequiredDescription}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button onClick={handleRedirectToLogin}>{t.loginButton}</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <AlertDialog open={showPaymentAlert} onOpenChange={setShowPaymentAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {language === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment'}
              </AlertDialogTitle>
              <AlertDialogDescription>{paymentMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelPayment} disabled={isProcessingPayment}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmPayment} disabled={isProcessingPayment}>
                {isProcessingPayment ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                  </>
                ) : (
                  language === 'ar' ? 'تأكيد' : 'Confirm'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {!showLoginAlert && (
          <>
            <Card className="mb-8 overflow-hidden bg-card/50">
              <div className="grid md:grid-cols-2 items-center">
                <div className="p-6 md:p-8">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-primary font-headline">
                    {userType === "seeker" ? t.jobSeekerTitle : t.employerTitle}
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    {userType === "seeker" ? t.jobSeekerSubtitle : t.employerSubtitle}
                  </p>
                </div>
                <div className="relative h-48 md:h-full hidden md:block">
                  {jobPortalImage && (
                    <Image 
                      src={jobPortalImage.imageUrl}
                      alt="Job Portal Illustration"
                      fill
                      className="object-cover"
                      data-ai-hint={jobPortalImage.imageHint}
                    />
                  )}
                </div>
              </div>
            </Card>

            <Card className="mb-8 p-4 md:p-6">
              {renderFilters()}
            </Card>

            {renderContent()}
          </>
        )}
      </main>
      <Footer />
      <JobDetailsModal job={selectedJob} isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      <CandidateProfileModal candidate={selectedCandidate} isOpen={isCandidateModalOpen} onOpenChange={setIsCandidateModalOpen} />
    </div>
  );
}
