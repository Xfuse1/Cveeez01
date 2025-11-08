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
import { X } from "lucide-react";
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

// Country code to phone number length mapping
const phoneNumberLengths: Record<string, { min: number; max: number; typical: number }> = {
  "+1": { min: 10, max: 10, typical: 10 },      // USA, Canada
  "+7": { min: 10, max: 10, typical: 10 },      // Russia
  "+20": { min: 10, max: 10, typical: 10 },     // Egypt
  "+27": { min: 9, max: 9, typical: 9 },        // South Africa
  "+30": { min: 10, max: 10, typical: 10 },     // Greece
  "+31": { min: 9, max: 9, typical: 9 },        // Netherlands
  "+32": { min: 8, max: 9, typical: 9 },        // Belgium
  "+33": { min: 9, max: 9, typical: 9 },        // France
  "+34": { min: 9, max: 9, typical: 9 },        // Spain
  "+39": { min: 9, max: 10, typical: 10 },      // Italy
  "+41": { min: 9, max: 9, typical: 9 },        // Switzerland
  "+44": { min: 10, max: 10, typical: 10 },     // UK
  "+45": { min: 8, max: 8, typical: 8 },        // Denmark
  "+46": { min: 9, max: 9, typical: 9 },        // Sweden
  "+47": { min: 8, max: 8, typical: 8 },        // Norway
  "+48": { min: 9, max: 9, typical: 9 },        // Poland
  "+49": { min: 10, max: 11, typical: 10 },     // Germany
  "+51": { min: 9, max: 9, typical: 9 },        // Peru
  "+52": { min: 10, max: 10, typical: 10 },     // Mexico
  "+55": { min: 10, max: 11, typical: 11 },     // Brazil
  "+60": { min: 9, max: 10, typical: 10 },      // Malaysia
  "+61": { min: 9, max: 9, typical: 9 },        // Australia
  "+62": { min: 9, max: 11, typical: 10 },      // Indonesia
  "+63": { min: 10, max: 10, typical: 10 },     // Philippines
  "+64": { min: 8, max: 10, typical: 9 },       // New Zealand
  "+65": { min: 8, max: 8, typical: 8 },        // Singapore
  "+66": { min: 9, max: 9, typical: 9 },        // Thailand
  "+81": { min: 10, max: 10, typical: 10 },     // Japan
  "+82": { min: 9, max: 10, typical: 10 },      // South Korea
  "+84": { min: 9, max: 10, typical: 9 },       // Vietnam
  "+86": { min: 11, max: 11, typical: 11 },     // China
  "+90": { min: 10, max: 10, typical: 10 },     // Turkey
  "+91": { min: 10, max: 10, typical: 10 },     // India
  "+92": { min: 10, max: 10, typical: 10 },     // Pakistan
  "+94": { min: 9, max: 9, typical: 9 },        // Sri Lanka
  "+95": { min: 8, max: 10, typical: 9 },       // Myanmar
  "+98": { min: 10, max: 10, typical: 10 },     // Iran
  "+212": { min: 9, max: 9, typical: 9 },       // Morocco
  "+213": { min: 9, max: 9, typical: 9 },       // Algeria
  "+216": { min: 8, max: 8, typical: 8 },       // Tunisia
  "+218": { min: 9, max: 10, typical: 10 },     // Libya
  "+220": { min: 7, max: 7, typical: 7 },       // Gambia
  "+234": { min: 10, max: 10, typical: 10 },    // Nigeria
  "+249": { min: 9, max: 9, typical: 9 },       // Sudan
  "+251": { min: 9, max: 9, typical: 9 },       // Ethiopia
  "+254": { min: 9, max: 10, typical: 10 },     // Kenya
  "+255": { min: 9, max: 9, typical: 9 },       // Tanzania
  "+256": { min: 9, max: 9, typical: 9 },       // Uganda
  "+880": { min: 10, max: 10, typical: 10 },    // Bangladesh
  "+960": { min: 7, max: 7, typical: 7 },       // Maldives
  "+961": { min: 7, max: 8, typical: 8 },       // Lebanon
  "+962": { min: 9, max: 9, typical: 9 },       // Jordan
  "+963": { min: 9, max: 9, typical: 9 },       // Syria
  "+964": { min: 10, max: 10, typical: 10 },    // Iraq
  "+965": { min: 8, max: 8, typical: 8 },       // Kuwait
  "+966": { min: 9, max: 9, typical: 9 },       // Saudi Arabia
  "+967": { min: 9, max: 9, typical: 9 },       // Yemen
  "+968": { min: 8, max: 8, typical: 8 },       // Oman
  "+970": { min: 9, max: 9, typical: 9 },       // Palestine
  "+971": { min: 9, max: 9, typical: 9 },       // UAE
  "+972": { min: 9, max: 9, typical: 9 },       // Israel
  "+973": { min: 8, max: 8, typical: 8 },       // Bahrain
  "+974": { min: 8, max: 8, typical: 8 },       // Qatar
};

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be 8+ chars and include a number").regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, "Password must contain at least one letter and one number"),
  phoneCode: z.string()
    .min(1, "Code is required")
    .regex(/^\+\d{1,4}$/, "Invalid country code format (e.g., +20, +1, +971)"),
  phoneNumber: z.string()
    .min(6, "Phone number must be at least 6 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
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
  const [jobTitleMode, setJobTitleMode] = useState<"select" | "custom">("select");
  const [customJobTitle, setCustomJobTitle] = useState("");
  const [phoneCodeMode, setPhoneCodeMode] = useState<"select" | "custom">("select");
  const [customPhoneCode, setCustomPhoneCode] = useState("");

  // Get phone number placeholder and length info based on country code
  const getPhoneNumberInfo = (countryCode: string) => {
    const info = phoneNumberLengths[countryCode];
    if (info) {
      const lengthText = info.min === info.max 
        ? `${info.typical} digits`
        : `${info.min}-${info.max} digits`;
      return {
        placeholder: "1".repeat(info.typical),
        lengthText,
        ...info
      };
    }
    return {
      placeholder: "1234567890",
      lengthText: "6-15 digits",
      min: 6,
      max: 15,
      typical: 10
    };
  };

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
                      {jobTitleMode === "select" ? (
                        <>
                          <Select 
                            onValueChange={(value) => {
                              if (value === "custom") {
                                setJobTitleMode("custom");
                                field.onChange("");
                              } else {
                                field.onChange(value);
                              }
                            }} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select or write custom" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                               <SelectItem value="custom">✏️ Write Custom Job Title</SelectItem>
                              <SelectItem value="Software Developer">Software Developer</SelectItem>
                              <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                              <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                              <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                              <SelectItem value="Mobile Developer">Mobile Developer</SelectItem>
                              <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                              <SelectItem value="Graphic Designer">Graphic Designer</SelectItem>
                              <SelectItem value="Product Designer">Product Designer</SelectItem>
                              <SelectItem value="Project Manager">Project Manager</SelectItem>
                              <SelectItem value="Product Manager">Product Manager</SelectItem>
                              <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                              <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                              <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                              <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                              <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                              <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                              <SelectItem value="Sales Representative">Sales Representative</SelectItem>
                              <SelectItem value="Accountant">Accountant</SelectItem>
                              <SelectItem value="HR Manager">HR Manager</SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <FormControl>
                            <Input 
                              placeholder="Enter your job title" 
                              value={customJobTitle}
                              onChange={(e) => {
                                setCustomJobTitle(e.target.value);
                                field.onChange(e.target.value);
                              }}
                            />
                          </FormControl>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setJobTitleMode("select");
                              setCustomJobTitle("");
                              field.onChange("");
                            }}
                          >
                            ← Back to Selection
                          </Button>
                        </div>
                      )}
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
                      <Input type="password" {...field} />
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
                      <FormItem className="w-[120px]">
                        {phoneCodeMode === "select" ? (
                          <Select 
                            onValueChange={(value) => {
                              if (value === "custom") {
                                setPhoneCodeMode("custom");
                                field.onChange("");
                              } else {
                                field.onChange(value);
                              }
                            }} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="+20" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                             <SelectItem value="custom">✏️ Custom</SelectItem>
                              <SelectItem value="+1">🇺🇸 +1</SelectItem>
                              <SelectItem value="+7">🇷🇺 +7</SelectItem>
                              <SelectItem value="+20">🇪🇬 +20</SelectItem>
                              <SelectItem value="+27">🇿🇦 +27</SelectItem>
                              <SelectItem value="+30">🇬🇷 +30</SelectItem>
                              <SelectItem value="+31">🇳🇱 +31</SelectItem>
                              <SelectItem value="+32">🇧🇪 +32</SelectItem>
                              <SelectItem value="+33">🇫🇷 +33</SelectItem>
                              <SelectItem value="+34">🇪🇸 +34</SelectItem>
                              <SelectItem value="+39">🇮🇹 +39</SelectItem>
                              <SelectItem value="+41">🇨🇭 +41</SelectItem>
                              <SelectItem value="+44">🇬🇧 +44</SelectItem>
                              <SelectItem value="+45">🇩🇰 +45</SelectItem>
                              <SelectItem value="+98">🇮🇷 +98</SelectItem>
                              <SelectItem value="+212">🇲🇦 +212</SelectItem>
                              <SelectItem value="+213">🇩🇿 +213</SelectItem>
                              <SelectItem value="+216">🇹🇳 +216</SelectItem>
                              <SelectItem value="+218">🇱🇾 +218</SelectItem>
                              <SelectItem value="+220">🇬🇲 +220</SelectItem>
                              <SelectItem value="+234">🇳🇬 +234</SelectItem>
                              <SelectItem value="+249">🇸🇩 +249</SelectItem>
                              <SelectItem value="+251">🇪🇹 +251</SelectItem>
                              <SelectItem value="+254">🇰🇪 +254</SelectItem>
                            
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="space-y-1">
                            <FormControl>
                              <Input 
                                placeholder="+123" 
                                value={customPhoneCode}
                                onChange={(e) => {
                                  let value = e.target.value;
                                  // Ensure it starts with +
                                  if (!value.startsWith('+')) {
                                    value = '+' + value.replace(/[^\d]/g, '');
                                  } else {
                                    value = '+' + value.slice(1).replace(/[^\d]/g, '');
                                  }
                                  setCustomPhoneCode(value);
                                  field.onChange(value);
                                }}
                                maxLength={5}
                              />
                            </FormControl>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              className="h-6 text-xs p-1"
                              onClick={() => {
                                setPhoneCodeMode("select");
                                setCustomPhoneCode("");
                                field.onChange("+20");
                              }}
                            >
                              ← Select
                            </Button>
                          </div>
                        )}
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
