"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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
import { Loader } from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
import { useRouter } from "next/navigation";
import { deductFromWallet } from "@/services/wallet";
import { useLanguage } from "@/contexts/language-provider";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "../EmptyState";
import { Briefcase, MapPin, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecommendedJobsListProps {
  jobs: Job[];
  loading?: boolean;
}

export function RecommendedJobsList({
  jobs,
  loading,
}: RecommendedJobsListProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPaymentAlert, setShowPaymentAlert] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [pendingJob, setPendingJob] = useState<Job | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleViewDetails = (job: Job) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please sign in to view job details." });
      router.push('/login');
      return;
    }

    setPendingJob(job);
    setPaymentMessage(
      language === 'ar'
        ? 'سيتم خصم 5 جنيه مصري من محفظتك لعرض تفاصيل الوظيفة. هل تريد المتابعة؟'
        : 'EGP 5.00 will be deducted from your wallet to view job details. Continue?'
    );
    setShowPaymentAlert(true);
  };

  const handleConfirmPayment = async () => {
    if (!user || !pendingJob) return;
    setIsProcessingPayment(true);
    setShowPaymentAlert(false);
    try {
      const result = await deductFromWallet(user.uid, 5, `View Job Details: ${pendingJob.title}`, pendingJob.id);
      if (result.success) {
        setSelectedJob(pendingJob);
        setIsModalOpen(true);
        setPendingJob(null);
        toast({ title: language === 'ar' ? 'تم الدفع بنجاح' : 'Payment Successful', description: language === 'ar' ? `تم خصم 5 جنيه. الرصيد الجديد: ${result.newBalance?.toFixed(2)}` : `EGP 5.00 has been deducted from your wallet. New balance: EGP ${result.newBalance?.toFixed(2)}` });
      } else {
        setPaymentMessage(result.message);
        setShowPaymentAlert(true);
        toast({ title: language === 'ar' ? 'فشل الدفع' : 'Payment Failed', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentMessage(language === 'ar' ? 'فشل معالجة الدفع. الرجاء المحاولة مرة أخرى.' : 'Failed to process payment. Please try again.');
      setShowPaymentAlert(true);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCancelPayment = () => {
    setShowPaymentAlert(false);
    setPendingJob(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-[80px]" />
                    <Skeleton className="h-6 w-[100px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Briefcase className="h-12 w-12" />}
            title="No recommendations yet"
            description="Complete your profile to get personalized job recommendations"
            actionLabel="Complete Profile"
            onAction={() => (window.location.href = "/settings")}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recommended Jobs</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <a href="/jobs">View All</a>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{job.title}</h4>
                    {job.matchScore && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {job.matchScore}% match
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {job.company}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {job.salary}
                    </span>
                    <Badge variant="outline">{job.type}</Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleViewDetails(job)}
                  className="shrink-0"
                >
                  {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Payment confirmation alert */}
    <AlertDialog open={showPaymentAlert} onOpenChange={setShowPaymentAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{language === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment'}</AlertDialogTitle>
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

    {/* Job details modal */}
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{selectedJob?.title}</DialogTitle>
          <DialogDescription>{selectedJob?.company} - {selectedJob?.location}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{language === 'ar' ? 'الوصف الوظيفي' : 'Job Description'}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{(selectedJob as any)?.description}</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{language === 'ar' ? 'إغلاق' : 'Close'}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    </>
  );
}
