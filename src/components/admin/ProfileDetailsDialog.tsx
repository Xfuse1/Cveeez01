"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Building2,
  Users,
  Globe,
  Award,
  Trash2,
  X,
} from "lucide-react";
import { UserProfile } from "@/services/profile-management";
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

interface ProfileDetailsDialogProps {
  profile: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (userId: string, userType: 'seeker' | 'employer') => void;
}

export function ProfileDetailsDialog({
  profile,
  open,
  onOpenChange,
  onDelete,
}: ProfileDetailsDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!profile) return null;

  const handleDelete = () => {
    onDelete(profile.id, profile.userType);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {profile.name}
              </DialogTitle>
              <Badge variant={profile.userType === 'seeker' ? 'default' : 'secondary'}>
                {profile.userType === 'seeker' ? 'Job Seeker' : 'Employer'}
              </Badge>
            </div>
            <DialogDescription>
              Account ID: {profile.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Information
              </h3>
              <div className="space-y-2 ml-6">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Location */}
            {(profile.country || profile.city) && (
              <>
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </h3>
                  <div className="ml-6">
                    <p className="text-sm">
                      {[profile.city, profile.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Seeker Specific Information */}
            {profile.userType === 'seeker' && (
              <>
                {profile.jobTitle && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Job Title
                    </h3>
                    <div className="ml-6">
                      <p className="text-sm">{profile.jobTitle}</p>
                    </div>
                  </div>
                )}

                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Skills
                    </h3>
                    <div className="ml-6 flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.experience && profile.experience.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Experience
                    </h3>
                    <div className="ml-6 space-y-3">
                      {profile.experience.slice(0, 3).map((exp: any, index: number) => (
                        <div key={index} className="border-l-2 border-primary/20 pl-3">
                          <p className="text-sm font-medium">{exp.title || exp.position}</p>
                          {exp.company && (
                            <p className="text-xs text-muted-foreground">{exp.company}</p>
                          )}
                          {(exp.startDate || exp.endDate) && (
                            <p className="text-xs text-muted-foreground">
                              {exp.startDate} - {exp.endDate || 'Present'}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Employer Specific Information */}
            {profile.userType === 'employer' && (
              <>
                {(profile.companyNameEn || profile.companyNameAr) && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company Name
                    </h3>
                    <div className="ml-6 space-y-1">
                      {profile.companyNameEn && (
                        <p className="text-sm">English: {profile.companyNameEn}</p>
                      )}
                      {profile.companyNameAr && (
                        <p className="text-sm">Arabic: {profile.companyNameAr}</p>
                      )}
                    </div>
                  </div>
                )}

                {profile.industry && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Industry
                    </h3>
                    <div className="ml-6">
                      <p className="text-sm">{profile.industry}</p>
                    </div>
                  </div>
                )}

                {profile.companySize && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Company Size
                    </h3>
                    <div className="ml-6">
                      <p className="text-sm">{profile.companySize}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Bio */}
            {profile.bio && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3">Bio</h3>
                  <p className="text-sm text-muted-foreground ml-6">{profile.bio}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Account Created Date */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Account Created
              </h3>
              <div className="ml-6">
                <p className="text-sm">{profile.createdAt.toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account for{" "}
              <span className="font-semibold">{profile.name}</span> and remove all their data
              from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
