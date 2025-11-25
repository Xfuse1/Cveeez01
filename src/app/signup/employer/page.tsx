"use client";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ProgressHeader } from "../../../components/signup/employer/ProgressHeader";
import { Step1CompanyInfo } from "../../../components/signup/employer/Step1CompanyInfo";
import { Step2ContactPrefs } from "../../../components/signup/employer/Step2ContactPrefs";
import { Step3BillingKyc } from "../../../components/signup/employer/Step3BillingKyc";
import { Button } from "../../../components/ui/button";
import { useToast } from "../../../hooks/use-toast";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { phoneNumberLengths } from "@/data/phone-codes";


// Define Zod schemas for each step
const step1Schema = z.object({
  companyNameAr: z.string().optional(),
  companyNameEn: z.string().min(1, "Required"),
  legalName: z.string().min(1, "Required"),
  industry: z.string().min(1, "Required"),
  companySize: z.string().min(1, "Required"),
  foundedYear: z.coerce.number().min(1900).max(new Date().getFullYear()),
  country: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  streetAddress: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().startsWith("https://linkedin.com/company/").optional().or(z.literal('')),
});

const step2Schema = z.object({
  contactPersonName: z.string().min(1, "Required"),
  contactPersonJobTitle: z.string().min(1, "Required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be 8+ chars and include a number").regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, "Password must contain at least one letter and one number"),
  phoneCode: z.string()
    .min(1, "Code is required")
    .regex(/^\+\d{1,4}$/, "Invalid country code format (e.g., +20, +1, +971)"),
  phoneNumber: z.string()
    .min(6, "Phone number must be at least 6 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  additionalPhones: z.array(z.object({ value: z.string() })).optional(),
  additionalEmails: z.array(z.object({ value: z.string().email() })).optional(),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/png", "image/jpeg"];

const step3Schema = z.object({
  plan: z.enum(["Free", "Basic", "Pro"]),
  taxId: z.string().optional(),
  commercialRegDoc: z.any()
    .optional()
    .refine(file => !file || file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      file => !file || ACCEPTED_FILE_TYPES.includes(file.type),
      "Only .pdf, .png, and .jpg formats are supported."
    ),
});

const formSchema = step1Schema.merge(step2Schema).merge(step3Schema).refine((data) => {
  // Validate phone number length based on country code
  const lengthInfo = phoneNumberLengths[data.phoneCode];
  if (lengthInfo) {
    const length = data.phoneNumber.length;
    return length >= lengthInfo.min && length <= lengthInfo.max;
  }
  // For unknown country codes, use general validation (6-15 digits)
  return data.phoneNumber.length >= 6 && data.phoneNumber.length <= 15;
}, (data) => {
  const lengthInfo = phoneNumberLengths[data.phoneCode];
  if (lengthInfo) {
    const lengthText = lengthInfo.min === lengthInfo.max 
      ? `exactly ${lengthInfo.typical} digits`
      : `${lengthInfo.min}-${lengthInfo.max} digits`;
    return {
      message: `Phone number for ${data.phoneCode} must be ${lengthText}. Current: ${data.phoneNumber.length} digits`,
      path: ["phoneNumber"],
    };
  }
  return {
    message: "Invalid phone number length for this country",
    path: ["phoneNumber"],
  };
});

export default function EmployerSignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      companyNameAr: "",
      companyNameEn: "",
      legalName: "",
      industry: "",
      companySize: "",
      foundedYear: 2025,
      country: "Egypt",
      city: "",
      streetAddress: "",
      website: "",
      linkedinUrl: "",
      contactPersonName: "",
      contactPersonJobTitle: "",
      email: "",
      password: "",
      phoneCode: "+20",
      phoneNumber: "",
      additionalPhones: [],
      additionalEmails: [],
      plan: "Free",
      taxId: "",
      commercialRegDoc: null,
    },
  });

  const { trigger, handleSubmit, watch, reset } = methods;

  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem("cveeez_employer_signup_draft", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    const savedData = localStorage.getItem("cveeez_employer_signup_draft");
    if (savedData) {
      reset(JSON.parse(savedData));
    }
  }, [reset]);

  const nextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await trigger(Object.keys(step1Schema.shape) as any);
    } else if (currentStep === 2) {
      isValid = await trigger(Object.keys(step2Schema.shape) as any);
    }
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (!auth || !db) {
        throw new Error("Firebase not initialized");
      }
      const { email, password, ...rest } = data;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "employers", user.uid), {
        ...rest,
        authUid: user.uid,
        email: user.email,
        createdAt: new Date(),
      });
      localStorage.removeItem("cveeez_employer_signup_draft");
      toast({
        title: "Success!",
        description: "Company account created.",
      });
      router.push("/employer");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign-up.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-8">
      <div className="w-full max-w-4xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Company Account</h1>
          <p className="text-muted-foreground mt-2">
            Complete your company profile to start posting jobs and finding talent.
          </p>
        </div>
        <ProgressHeader currentStep={currentStep} />
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
            {currentStep === 1 && <Step1CompanyInfo />}
            {currentStep === 2 && <Step2ContactPrefs />}
            {currentStep === 3 && <Step3BillingKyc />}

            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button type="button" variant="ghost" onClick={prevStep}>
                  Back
                </Button>
              ) : <div />}
              
              {currentStep < 3 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit">
                  Finish
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
