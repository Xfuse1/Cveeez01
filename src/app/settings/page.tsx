
"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { EmailAuthProvider, reauthenticateWithCredential, updateProfile, updateEmail, updatePassword, deleteUser } from "firebase/auth";
import { db, auth } from "@/firebase/config";
import { ArrowLeft, Save, User, Lock, Bell, Shield, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CloudinaryService } from "@/lib/cloudinary-client";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { checkAdminAccess } from "@/services/admin";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userRole, setUserRole] = useState<"seeker" | "employer" | "admin" | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Seeker fields
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCode, setPhoneCode] = useState("+20");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [nationality, setNationality] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  
  // Employer fields
  const [companyNameEn, setCompanyNameEn] = useState("");
  const [companyNameAr, setCompanyNameAr] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [applicationUpdates, setApplicationUpdates] = useState(true);
  const [jobRecommendations, setJobRecommendations] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadUserProfile();
  }, [user, router]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const adminCheck = await checkAdminAccess(user.uid, user.email);
      if (adminCheck.isAdmin) {
        setUserRole("admin");
        setEmail(user.email || "");
        setFullName(user.displayName || "Admin User");
      } else {
        const seekerDoc = await getDoc(doc(db, "seekers", user.uid));
        if (seekerDoc.exists()) {
          setUserRole("seeker");
          const data = seekerDoc.data();
          setFullName(data.fullName || user.displayName || "");
          setJobTitle(data.jobTitle || "");
          setEmail(user.email || "");
          setPhoneCode(data.phoneCode || "+20");
          setPhoneNumber(data.phoneNumber || "");
          setCountry(data.country || "");
          setNationality(data.nationality || "");
          setBio(data.bio || "");
          setSkills(data.skills || []);
        } else {
          const employerDoc = await getDoc(doc(db, "employers", user.uid));
          if (employerDoc.exists()) {
            setUserRole("employer");
            const data = employerDoc.data();
            setCompanyNameEn(data.companyNameEn || "");
            setCompanyNameAr(data.companyNameAr || "");
            setEmail(user.email || "");
            setIndustry(data.industry || "");
            setCompanySize(data.companySize || "");
            setWebsite(data.website || "");
            setCountry(data.country || "");
            setCity(data.city || "");
          } else {
            // Default to seeker if no profile found
            setUserRole("seeker");
            setEmail(user.email || "");
            setFullName(user.displayName || "");
          }
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDashboardUrl = () => {
    switch (userRole) {
      case "admin":
        return "/admin";
      case "employer":
        return "/employer";
      case "seeker":
        return "/services/user-dashboard";
      default:
        return "/";
    }
  };


  const handleSaveProfile = async () => {
    if (!user || !userRole || userRole === 'admin') return;
    
    setSaving(true);
    try {
      const collection = userRole === "employer" ? "employers" : "seekers";
      const profileData = userRole === "employer" 
        ? {
            companyNameEn,
            companyNameAr,
            industry,
            companySize,
            website,
            country,
            city,
            updatedAt: new Date(),
          }
        : {
            fullName,
            jobTitle,
            phoneCode,
            phoneNumber,
            country,
            nationality,
            bio,
            skills,
            updatedAt: new Date(),
          };
      
      await setDoc(doc(db, collection, user.uid), profileData, { merge: true });
      
      if (userRole === "seeker" && fullName !== user.displayName) {
        await updateProfile(user, { displayName: fullName });
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile changes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;

    if (!currentPassword) {
      toast({ title: "Error", description: "Please enter your current password.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "New password must be at least 8 characters.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      // Create a credential with the user's email and current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      
      // Re-authenticate the user with the credential
      await reauthenticateWithCredential(user, credential);
      
      // Now that the user is re-authenticated, update the password
      await updatePassword(user, newPassword);

      // Clear fields and show success message
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });

    } catch (error: any) {
      console.error("Error changing password:", error);
      let description = "Failed to change password. Please try again.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "The current password you entered is incorrect.";
      } else if (error.code === 'auth/requires-recent-login') {
        description = "This action is sensitive. Please log out and log back in before changing your password.";
      } else {
        description = error.message;
      }
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !userRole) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      if (userRole !== 'admin') {
        const collection = userRole === "employer" ? "employers" : "seekers";
        await deleteDoc(doc(db, collection, user.uid));
      }

      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }

      router.push("/");
      toast({ title: "Account Deleted", description: "Your account has been permanently deleted." });
    } catch (error: any) {
      console.error("Error deleting account:", error);
      if (error?.code === "auth/requires-recent-login") {
        toast({
          title: "Action Required",
          description: "For security, please sign in again and retry account deletion.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error?.message || "Failed to delete account",
          variant: "destructive",
        });
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleAddSkill = () => {
    if (currentSkill && !skills.includes(currentSkill)) {
      setSkills([...skills, currentSkill]);
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };


  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href={getDashboardUrl()}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
            {userRole && (
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                {userRole} Account
              </span>
            )}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={previewUrl || user.photoURL || undefined} />
                    <AvatarFallback className="text-2xl">
                      {user.displayName?.charAt(0) || fullName?.charAt(0) || <User />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (!userRole) return;
                        setUploading(true);
                        try {
                          const url = await CloudinaryService.openUploadWidget();
                          if (url) {
                            setPreviewUrl(url);
                            if (userRole !== 'admin' && user) {
                              const collection = userRole === "employer" ? "employers" : "seekers";
                              await setDoc(doc(db, collection, user.uid), { photoURL: url }, { merge: true });
                              await updateProfile(user, { photoURL: url });
                            }
                            toast({ title: "Photo Updated", description: "Profile photo updated successfully." });
                          }
                        } catch (err: any) {
                          console.error("Upload error:", err);
                          if (err?.code === "auth/requires-recent-login") {
                            toast({ title: "Action Required", description: "Please sign in again and retry.", variant: "destructive" });
                          } else if (err.message && !err.message.includes('closed')) { // Ignore closure error
                            toast({ title: "Upload Error", description: err.message || "Failed to upload image", variant: "destructive" });
                          }
                        } finally {
                          setUploading(false);
                        }
                      }}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Change Photo"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 10MB</p>
                  </div>
                </div>

                <Separator />

                {userRole === "seeker" ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input
                          id="jobTitle"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="e.g., Software Engineer"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <div className="flex gap-2">
                        <Select value={phoneCode} onValueChange={setPhoneCode}>
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+20">+20</SelectItem>
                            <SelectItem value="+1">+1</SelectItem>
                            <SelectItem value="+44">+44</SelectItem>
                            <SelectItem value="+91">+91</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="123 456 7890"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select value={country} onValueChange={setCountry}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Egypt">Egypt</SelectItem>
                            <SelectItem value="United States">United States</SelectItem>
                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                            <SelectItem value="United Arab Emirates">UAE</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nationality">Nationality</Label>
                        <Select value={nationality} onValueChange={setNationality}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select nationality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Egyptian">Egyptian</SelectItem>
                            <SelectItem value="American">American</SelectItem>
                            <SelectItem value="British">British</SelectItem>
                            <SelectItem value="Canadian">Canadian</SelectItem>
                            <SelectItem value="Saudi Arabian">Saudi Arabian</SelectItem>
                            <SelectItem value="Emirati">Emirati</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <div className="flex flex-wrap gap-2 mt-2">
                            {skills.map((skill, index) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center gap-1"
                            >
                                {skill}
                                <button
                                onClick={() => handleRemoveSkill(skill)}
                                className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                                >
                                <X className="h-3 w-3" />
                                </button>
                            </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>
                  </>
                ) : userRole === 'employer' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyNameEn">Company Name (English)</Label>
                        <Input
                          id="companyNameEn"
                          value={companyNameEn}
                          onChange={(e) => setCompanyNameEn(e.target.value)}
                          placeholder="Company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyNameAr">Company Name (Arabic)</Label>
                        <Input
                          id="companyNameAr"
                          value={companyNameAr}
                          onChange={(e) => setCompanyNameAr(e.target.value)}
                          placeholder="اسم الشركة"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select value={industry} onValueChange={setIndustry}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companySize">Company Size</Label>
                        <Select value={companySize} onValueChange={setCompanySize}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-500">201-500 employees</SelectItem>
                            <SelectItem value="500+">500+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select value={country} onValueChange={setCountry}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Egypt">Egypt</SelectItem>
                            <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                            <SelectItem value="United Arab Emirates">UAE</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City name"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <p>Your profile information is managed by the system administrator.</p>
                )}

                {userRole !== 'admin' && (
                  <Button onClick={handleSaveProfile} disabled={saving} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <Button onClick={handleChangePassword} disabled={saving}>
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about your account
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Application Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when your application status changes
                      </p>
                    </div>
                    <Switch
                      checked={applicationUpdates}
                      onCheckedChange={setApplicationUpdates}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Job Recommendations</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive personalized job recommendations
                      </p>
                    </div>
                    <Switch
                      checked={jobRecommendations}
                      onCheckedChange={setJobRecommendations}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Message Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about new messages
                      </p>
                    </div>
                    <Switch
                      checked={messageNotifications}
                      onCheckedChange={setMessageNotifications}
                    />
                  </div>
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control your privacy and data preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Profile Visibility</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Control who can see your profile information
                    </p>
                    <Select defaultValue="public">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="employers">Employers Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Data & Privacy</h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-red-600"
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                      >
                        {deleting ? "Deleting..." : "Delete Account"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
