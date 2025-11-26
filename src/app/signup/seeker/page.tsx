"use client";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { jobTitleOptions } from "@/data/job-titles";
import { getPhoneNumberInfo, phoneCodeOptions, phoneNumberLengths } from "@/data/phone-codes";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").regex(/^[a-zA-Z\s]+$/, "Full name must contain only letters and spaces"),
  jobTitle: z.string().min(1, "Job title is required"),
  email: z.string()
    .email("Enter a valid email address")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email must be a valid format")
    .refine(val => !val.includes(".."), "Email cannot contain consecutive dots")
    .refine(val => val.length <= 254, "Email address is too long"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[A-Za-z])/, "Password must contain at least one letter")
    .regex(/^(?=.*\d)/, "Password must contain at least one number")
    .regex(/^(?=.*[!@#$%^&*])/, "Password must contain at least one special character (!@#$%^&*)")
    .regex(/^(?!.*\s)/, "Password cannot contain spaces"),
  phoneCode: z.string()
    .min(1, "Country code is required")
    .regex(/^\+\d{1,4}$/, "Invalid country code format (e.g., +20, +1, +971)"),
  phoneNumber: z.string()
    .min(6, "Phone number must be at least 6 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits")
    .refine(val => !val.startsWith('0'), "Phone number should not start with 0"),
  country: z.string().min(1, "Country is required"),
  nationality: z.string().min(1, "Nationality is required"),
  skills: z.array(z.string()).optional().default([]),
}).refine((data) => {
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

export default function SeekerSignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentSkill, setCurrentSkill] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      jobTitle: "",
      email: "",
      password: "",
      phoneCode: "+20",
      phoneNumber: "",
      country: "Egypt",
      nationality: "Egyptian",
      skills: [],
    },
  });

  const { control, handleSubmit, setValue, getValues } = form;

  const handleAddSkill = () => {
    if (currentSkill && !getValues("skills").includes(currentSkill)) {
      setValue("skills", [...getValues("skills"), currentSkill]);
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setValue("skills", getValues("skills").filter((skill) => skill !== skillToRemove));
  };


  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (!auth || !db) {
        throw new Error("Firebase not initialized");
      }
      const { email, password, fullName, ...rest } = data;
      
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: fullName });

      // Save user data to Firestore
      await setDoc(doc(db, "seekers", user.uid), {
        fullName,
        ...rest,
        authUid: user.uid,
        email: user.email,
        createdAt: new Date(),
      });

      toast({
        title: "Success!",
        description: "Seeker account created.",
      });
      router.push("/services/user-dashboard");
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
    <div className="flex items-center justify-center min-h-screen bg-background py-8">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up as a Job Seeker</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Max Robinson" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={jobTitleOptions.map((title) => ({ value: title, label: title }))}
                          placeholder="Select or type your title"
                          searchPlaceholder="Type to search job titles"
                          allowCustomValue
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} {...field} />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-2">
                <Label>Phone Number</Label>
                <div className="flex gap-2">
                  <FormField
                    control={control}
                    name="phoneCode"
                    render={({ field }) => (
                      <FormItem className="w-[220px]">
                        <FormControl>
                          <SearchableSelect
                            value={field.value}
                            onChange={(val) => {
                              const cleaned = val.startsWith("+")
                                ? "+" + val.slice(1).replace(/[^\d]/g, "")
                                : "+" + val.replace(/[^\d]/g, "");
                              field.onChange(cleaned.slice(0, 5));
                            }}
                            options={phoneCodeOptions}
                            placeholder="+20"
                            searchPlaceholder="Search country or code"
                            emptyText="No matching country code"
                            allowCustomValue
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="phoneNumber"
                    render={({ field }) => {
                      const currentPhoneCode = form.watch("phoneCode") || "+20";
                      const phoneInfo = getPhoneNumberInfo(currentPhoneCode);
                      return (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder={phoneInfo.placeholder}
                              {...field}
                              onChange={(e) => {
                                // Only allow digits
                                const value = e.target.value.replace(/[^\d]/g, '');
                                field.onChange(value);
                              }}
                              maxLength={phoneInfo.max}
                            />
                          </FormControl>
                          <div className="text-xs text-muted-foreground mt-1">
                            Expected: {phoneInfo.lengthText}
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>

               <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <div className="flex gap-2">
                    <Input
                    id="skills"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    placeholder="Add a skill (e.g., React)"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                        }
                    }}
                    />
                    <Button type="button" onClick={handleAddSkill}>
                    Add
                    </Button>
                </div>
                 <Controller
                    control={control}
                    name="skills"
                    render={({ field }) => (
                        <div className="flex flex-wrap gap-2 mt-2 min-h-[24px]">
                            {field.value.map((skill, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="flex items-center gap-1"
                                >
                                    {skill}
                                    <button
                                    type="button"
                                    onClick={() => handleRemoveSkill(skill)}
                                    className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                                    >
                                    <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Mexico">Mexico</SelectItem>
                          <SelectItem value="Egypt">Egypt</SelectItem>
                          <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                          <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a nationality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Egyptian">Egyptian</SelectItem>
                          <SelectItem value="Saudi Arabian">Saudi Arabian</SelectItem>
                          <SelectItem value="Emirati">Emirati</SelectItem>
                          <SelectItem value="Qatari">Qatari</SelectItem>
                          <SelectItem value="Kuwaiti">Kuwaiti</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                Create an account
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
