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
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Loader2, Edit } from "lucide-react";

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  location: z.string().min(2, "Location is required"),
  type: z.enum(["Full-time", "Part-time", "Contract", "Internship"]),
  experienceLevel: z.enum(["Entry-level", "Mid-level", "Senior", "Lead", "Manager"]),
  salaryRange: z.string().optional(),
  isRemote: z.boolean(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  companyEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  companyPhone: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  experienceLevel?: string;
  salaryRange: string;
  isRemote?: boolean;
  description?: string;
  companyEmail?: string;
  companyPhone?: string;
}

interface EditJobDialogProps {
  job: Job;
  onJobUpdated: () => void;
  trigger?: React.ReactNode;
}

export function EditJobDialog({ job, onJobUpdated, trigger }: EditJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
  });

  // Reset form when job changes or dialog opens
  useEffect(() => {
    if (open) {
      reset({
        title: job.title || "",
        location: job.location || "",
        type: (job.type || "Full-time") as any,
        experienceLevel: (job.experienceLevel || "Mid-level") as any,
        salaryRange: job.salaryRange || "",
        isRemote: job.isRemote || false,
        description: job.description || "",
        companyEmail: job.companyEmail || "",
        companyPhone: job.companyPhone || "",
      });
    }
  }, [job, open, reset]);

  const onSubmit = async (data: JobFormData) => {
    if (!db) {
      toast({
        title: "Error",
        description: "Database not initialized.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const jobRef = doc(db, "jobs", job.id);
      await updateDoc(jobRef, {
        ...data,
        updatedAt: new Date(),
      });

      toast({
        title: "Job Updated!",
        description: "Your job listing has been updated successfully.",
      });

      setOpen(false);
      onJobUpdated();
    } catch (error: any) {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update job.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const TriggerButton = trigger || (
    <Button variant="ghost" size="sm">
      <Edit className="h-4 w-4 mr-2" />
      Edit
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{TriggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Posting</DialogTitle>
          <DialogDescription>
            Update the details of your job posting. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Senior React Developer"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g. Cairo, Egypt"
                {...register("location")}
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Job Type *</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level *</Label>
              <Controller
                name="experienceLevel"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
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
              {errors.experienceLevel && (
                <p className="text-sm text-red-500">
                  {errors.experienceLevel.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryRange">Salary Range</Label>
              <Input
                id="salaryRange"
                placeholder="e.g. $80k - $120k"
                {...register("salaryRange")}
              />
              {errors.salaryRange && (
                <p className="text-sm text-red-500">{errors.salaryRange.message}</p>
              )}
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
            <Label htmlFor="isRemote" className="cursor-pointer">
              Remote Position
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={5}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyEmail">Contact Email</Label>
              <Input
                id="companyEmail"
                type="email"
                placeholder="jobs@company.com"
                {...register("companyEmail")}
              />
              {errors.companyEmail && (
                <p className="text-sm text-red-500">{errors.companyEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyPhone">Contact Phone</Label>
              <Input
                id="companyPhone"
                type="tel"
                placeholder="+20 100 123 4567"
                {...register("companyPhone")}
              />
              {errors.companyPhone && (
                <p className="text-sm text-red-500">{errors.companyPhone.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
