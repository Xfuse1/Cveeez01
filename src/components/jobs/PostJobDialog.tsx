"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-provider";
import { addJob, updateJob, type Job } from "@/services/firestore";
import { Loader2, PlusCircle, Eye, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ToastAction } from "@/components/ui/toast";

const jobSchema = z.object({
  title: z.string().min(3, "Job title is required"),
  location: z.string().min(2, "Location is required"),
  type: z.enum(["Full-time", "Part-time", "Contract", "Internship"]),
  experienceLevel: z.enum(["Entry-level", "Mid-level", "Senior", "Lead", "Manager"]),
  salaryRange: z.string().optional(),
  isRemote: z.boolean().default(false),
  description: z.string().min(50, "Description must be at least 50 characters"),
  companyEmail: z.string().email("Invalid email").optional().or(z.literal('')),
  companyPhone: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

interface PostJobDialogProps {
    onJobPosted: () => void;
    isSubtle?: boolean; // For a less prominent trigger button
    jobToEdit?: Job | null; // Pass job data to edit
    children?: React.ReactNode; // To use a custom trigger
}

export function PostJobDialog({ onJobPosted, isSubtle = false, jobToEdit, children }: PostJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const isEditMode = !!jobToEdit;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
  });

  useEffect(() => {
    if (open && jobToEdit) {
      reset({
        title: jobToEdit.title,
        location: jobToEdit.location,
        type: jobToEdit.type,
        experienceLevel: jobToEdit.experienceLevel,
        salaryRange: jobToEdit.salaryRange,
        isRemote: jobToEdit.isRemote,
        description: jobToEdit.description,
        companyEmail: jobToEdit.companyEmail,
        companyPhone: jobToEdit.companyPhone,
      });
    } else if (open && !isEditMode) {
      reset({
        title: "",
        location: "",
        type: "Full-time",
        experienceLevel: "Mid-level",
        salaryRange: "",
        isRemote: false,
        description: "",
        companyEmail: "",
        companyPhone: "",
      });
    }
  }, [jobToEdit, open, reset, isEditMode]);

  const onSubmit = async (data: JobFormData) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setLoading(true);

    if (isEditMode && jobToEdit) {
        // Update existing job
        const result = await updateJob(jobToEdit.id, data);
        if (result.success) {
            toast({ title: "Job Updated!", description: "The job listing has been updated." });
            setOpen(false);
            onJobPosted();
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    } else {
        // Create new job
        const result = await addJob({ ...data, employerId: user.uid });
        if (result.success) {
            toast({ 
                title: "Job Posted!", 
                description: "Your new job listing is now live.",
                action: (
                <ToastAction altText="View job" onClick={() => router.push('/jobs')}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Job Listings
                </ToastAction>
                )
            });
            reset();
            setOpen(false);
            onJobPosted();
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    }
    setLoading(false);
  };

  const TriggerButton = children || (
    <Button variant={isSubtle ? "outline" : "default"} className={cn(isSubtle && "w-full")}>
        {isEditMode ? <Edit className="h-4 w-4 mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
        {isEditMode ? "Edit Job" : "Post New Job"}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {TriggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Job Posting" : "Post a New Job"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details for this job listing." : "Fill out the details below to create a new job listing."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid gap-2">
            <Label htmlFor="title">Job Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} placeholder="e.g., Cairo, Egypt" />
              {errors.location && <p className="text-red-500 text-xs">{errors.location.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salaryRange">Salary Range (Optional)</Label>
              <Input id="salaryRange" {...register("salaryRange")} placeholder="e.g., 15,000 - 20,000 EGP" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Job Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Controller
                name="experienceLevel"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entry-level">Entry-level</SelectItem>
                      <SelectItem value="Mid-level">Mid-level</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
             <Controller
                name="isRemote"
                control={control}
                render={({ field }) => (
                    <Switch
                        id="isRemote"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                )}
             />
            <Label htmlFor="isRemote">This is a remote position</Label>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea id="description" {...register("description")} rows={6} placeholder="Describe the role, responsibilities, and requirements..." />
            {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
          </div>
          
           <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="companyEmail">Contact Email (Optional)</Label>
              <Input id="companyEmail" type="email" {...register("companyEmail")} />
              {errors.companyEmail && <p className="text-red-500 text-xs">{errors.companyEmail.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companyPhone">Contact Phone (Optional)</Label>
              <Input id="companyPhone" {...register("companyPhone")} />
            </div>
          </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditMode ? "Update Job" : "Post Job")}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
