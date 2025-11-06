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

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be 8+ chars and include a number").regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, "Password must contain at least one letter and one number"),
  phoneCode: z.string().min(1, "Code is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
  nationality: z.string().min(1, "Nationality is required"),
  skills: z.array(z.string()).optional().default([]),
});

export default function SeekerSignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentSkill, setCurrentSkill] = useState("");

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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job title" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="designer">Designer</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <FormItem className="w-[80px]">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="+20" />
                            </SelectTrigger>
                          </FormControl>
                        <SelectContent>
                          <SelectItem value="+20">+20</SelectItem>
                          <SelectItem value="+91">+91</SelectItem>
                          <SelectItem value="+81">+81</SelectItem>
                          <SelectItem value="+7">+7</SelectItem>
                          <SelectItem value="+1">+1</SelectItem>
                          <SelectItem value="+52">+52</SelectItem>
                          <SelectItem value="+44">+44</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input type="tel" placeholder="234 567 890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
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
