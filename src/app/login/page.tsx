'use client';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '@/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { checkAdminAccess } from '@/services/admin';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email must be a valid format")
    .refine(val => val.length <= 254, "Email address is too long"),
  password: z.string()
    .min(1, "Password is required")
    .regex(/^(?!.*\s)/, "Password cannot contain spaces"),
});

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const [showPassword, setShowPassword] = useState(false);
  
  console.log('Redirect URL from params:', redirectUrl);
  
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      if (!auth) {
        throw new Error("Firebase not initialized");
      }
      
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      // Check if user is an admin first
      const adminCheck = await checkAdminAccess(user.uid, user.email);
      if (adminCheck.isAdmin) {
        const destination = redirectUrl || '/admin';
        console.log('Redirecting admin to:', destination);
        
        toast({
          title: 'Login Successful',
          description: 'Welcome back, Admin!',
        });
        
        router.push(destination);
        return;
      }
      
      // Check if user is an employer
      const employerDoc = await getDoc(doc(db, "employers", user.uid));
      if (employerDoc.exists()) {
        const destination = redirectUrl || '/employer';
        console.log('Redirecting employer to:', destination);
        
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        
        router.push(destination);
        return;
      }
      
      // Check if user is a seeker
      const seekerDoc = await getDoc(doc(db, "seekers", user.uid));
      if (seekerDoc.exists()) {
        const destination = redirectUrl || '/services/user-dashboard';
        console.log('Redirecting seeker to:', destination);
        
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        
        router.push(destination);
        return;
      }
      
      // If user exists in auth but not in either collection, redirect to complete profile
      console.log('User has no profile, redirecting to signup-type');
      toast({
        title: 'Login Successful',
        description: 'Please complete your profile to continue.',
      });
      router.push('/signup-type');
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'An error occurred during login.';
      
      // Provide specific error messages based on error code
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register('email')}
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password"className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/signup-type" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
