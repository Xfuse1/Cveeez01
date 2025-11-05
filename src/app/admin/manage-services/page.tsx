"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-provider";
import { checkAdminAccess } from "@/services/admin";
import {
  getAllServicesAdmin,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  type EcommerceService,
} from "@/services/ecommerce-services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  Edit,
  Trash2,
  ArrowLeft,
  Loader,
  Eye,
  EyeOff,
  Save,
  X,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function ManageServicesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<EcommerceService[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<EcommerceService | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<EcommerceService>>({
    category: 'cv-writing',
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
    featuresEn: [''],
    featuresAr: [''],
    ctaTextEn: '',
    ctaTextAr: '',
    priceDesigner: 0,
    priceAI: 0,
    imageId: '',
    ctaType: 'link',
    href: '',
    isActive: true,
    order: 999,
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    checkAccess();
  }, [user, router]);

  const checkAccess = async () => {
    if (!user) return;

    const adminResult = await checkAdminAccess(user.uid, user.email);
    if (!adminResult.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      router.push("/");
      return;
    }

    loadServices();
  };

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await getAllServicesAdmin();
      setServices(data);
    } catch (error) {
      console.error("Error loading services:", error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (service?: EcommerceService) => {
    if (service) {
      setEditingService(service);
      setFormData({
        category: service.category,
        titleEn: service.titleEn,
        titleAr: service.titleAr,
        descriptionEn: service.descriptionEn,
        descriptionAr: service.descriptionAr,
        featuresEn: service.featuresEn,
        featuresAr: service.featuresAr,
        ctaTextEn: service.ctaTextEn,
        ctaTextAr: service.ctaTextAr,
        priceDesigner: service.priceDesigner,
        priceAI: service.priceAI,
        imageId: service.imageId,
        ctaType: service.ctaType,
        href: service.href,
        isActive: service.isActive,
        order: service.order || 999,
      });
    } else {
      setEditingService(null);
      setFormData({
        category: 'cv-writing',
        titleEn: '',
        titleAr: '',
        descriptionEn: '',
        descriptionAr: '',
        featuresEn: [''],
        featuresAr: [''],
        ctaTextEn: '',
        ctaTextAr: '',
        priceDesigner: 0,
        priceAI: 0,
        imageId: '',
        ctaType: 'link',
        href: '',
        isActive: true,
        order: 999,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingService(null);
  };

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (!formData.titleEn || !formData.titleAr || !formData.descriptionEn || !formData.descriptionAr) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingService?.id) {
        // Update existing service
        const result = await updateService(editingService.id, formData as Partial<EcommerceService>);
        if (result.success) {
          toast({
            title: "Success",
            description: "Service updated successfully",
          });
          loadServices();
          handleCloseDialog();
        } else {
          throw new Error(result.error);
        }
      } else {
        // Create new service
        const result = await createService(
          formData as Omit<EcommerceService, 'id' | 'createdAt' | 'updatedAt'>,
          user.uid
        );
        if (result.success) {
          toast({
            title: "Success",
            description: "Service created successfully",
          });
          loadServices();
          handleCloseDialog();
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error: any) {
      console.error("Error saving service:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save service",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return;
    }

    try {
      const result = await deleteService(serviceId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Service deleted successfully",
        });
        loadServices();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const result = await toggleServiceStatus(serviceId, !currentStatus);
      if (result.success) {
        toast({
          title: "Success",
          description: `Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        });
        loadServices();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error toggling status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update service status",
        variant: "destructive",
      });
    }
  };

  const addFeature = (language: 'en' | 'ar') => {
    if (language === 'en') {
      setFormData({
        ...formData,
        featuresEn: [...(formData.featuresEn || ['']), ''],
      });
    } else {
      setFormData({
        ...formData,
        featuresAr: [...(formData.featuresAr || ['']), ''],
      });
    }
  };

  const removeFeature = (language: 'en' | 'ar', index: number) => {
    if (language === 'en') {
      const newFeatures = formData.featuresEn?.filter((_, i) => i !== index);
      setFormData({ ...formData, featuresEn: newFeatures });
    } else {
      const newFeatures = formData.featuresAr?.filter((_, i) => i !== index);
      setFormData({ ...formData, featuresAr: newFeatures });
    }
  };

  const updateFeature = (language: 'en' | 'ar', index: number, value: string) => {
    if (language === 'en') {
      const newFeatures = [...(formData.featuresEn || [''])];
      newFeatures[index] = value;
      setFormData({ ...formData, featuresEn: newFeatures });
    } else {
      const newFeatures = [...(formData.featuresAr || [''])];
      newFeatures[index] = value;
      setFormData({ ...formData, featuresAr: newFeatures });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Services</h1>
            <p className="text-muted-foreground">Add, edit, or remove ecommerce services</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/admin")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>
        </div>

        {/* Services Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Services ({services.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title (EN)</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Prices</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No services found. Click "Add Service" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.titleEn}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{service.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Designer: EGP {service.priceDesigner}</div>
                            <div>AI: EGP {service.priceAI}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={service.isActive}
                              onCheckedChange={() => handleToggleStatus(service.id!, service.isActive)}
                            />
                            <Badge variant={service.isActive ? "default" : "secondary"}>
                              {service.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{service.order}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(service.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Edit Service" : "Add New Service"}
              </DialogTitle>
              <DialogDescription>
                Fill in the service details in both English and Arabic
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cv-writing">CV Writing</SelectItem>
                      <SelectItem value="career-dev">Career Development</SelectItem>
                      <SelectItem value="job-search">Job Search</SelectItem>
                      <SelectItem value="tools">Tools</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>CTA Type *</Label>
                  <Select
                    value={formData.ctaType}
                    onValueChange={(value) => setFormData({ ...formData, ctaType: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* English Fields */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-semibold">English Content</h3>
                
                <div className="space-y-2">
                  <Label>Title (EN) *</Label>
                  <Input
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="Professional CV Writing Service"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (EN) *</Label>
                  <Textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    placeholder="Get a professionally crafted CV..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Features (EN)</Label>
                  {formData.featuresEn?.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature('en', index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature('en', index)}
                        disabled={formData.featuresEn?.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addFeature('en')}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>CTA Text (EN) *</Label>
                  <Input
                    value={formData.ctaTextEn}
                    onChange={(e) => setFormData({ ...formData, ctaTextEn: e.target.value })}
                    placeholder="Order Now"
                  />
                </div>
              </div>

              {/* Arabic Fields */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-semibold">Arabic Content</h3>
                
                <div className="space-y-2">
                  <Label>Title (AR) *</Label>
                  <Input
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    placeholder="خدمة كتابة السيرة الذاتية الاحترافية"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (AR) *</Label>
                  <Textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder="احصل على سيرة ذاتية احترافية..."
                    rows={3}
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Features (AR)</Label>
                  {formData.featuresAr?.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature('ar', index, e.target.value)}
                        placeholder={`ميزة ${index + 1}`}
                        dir="rtl"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature('ar', index)}
                        disabled={formData.featuresAr?.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addFeature('ar')}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    إضافة ميزة
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>CTA Text (AR) *</Label>
                  <Input
                    value={formData.ctaTextAr}
                    onChange={(e) => setFormData({ ...formData, ctaTextAr: e.target.value })}
                    placeholder="اطلب الآن"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Prices & Other Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Designer Price (EGP) *</Label>
                  <Input
                    type="number"
                    value={formData.priceDesigner}
                    onChange={(e) => setFormData({ ...formData, priceDesigner: Number(e.target.value) })}
                    placeholder="299"
                  />
                </div>

                <div className="space-y-2">
                  <Label>AI Price (EGP) *</Label>
                  <Input
                    type="number"
                    value={formData.priceAI}
                    onChange={(e) => setFormData({ ...formData, priceAI: Number(e.target.value) })}
                    placeholder="149"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Image ID *</Label>
                  <Input
                    value={formData.imageId}
                    onChange={(e) => setFormData({ ...formData, imageId: e.target.value })}
                    placeholder="service-ats-cv"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Link/URL *</Label>
                  <Input
                    value={formData.href}
                    onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                    placeholder="/ecommerce/services/ats-cv"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Order (for sorting)</Label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    placeholder="999"
                  />
                </div>

                <div className="space-y-2 flex items-center gap-2 pt-8">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {editingService ? "Update Service" : "Create Service"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
