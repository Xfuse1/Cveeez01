"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Tag, ArrowLeft } from "lucide-react";
import {
  getAllServicePrices,
  setServicePrice,
  deleteServicePrice,
  toggleServicePriceStatus,
  type ServicePrice,
} from "@/services/pricing";
import { useRouter } from "next/navigation";

export default function PricingManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [prices, setPrices] = useState<ServicePrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPrice, setEditingPrice] = useState<ServicePrice | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    serviceName: "",
    serviceType: "custom" as ServicePrice['serviceType'],
    price: 0,
    currency: "EGP",
    description: "",
    isActive: true,
    hasOffer: false,
    offerPercentage: 0,
    offerValidUntil: "",
  });

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    setIsLoading(true);
    try {
      const fetchedPrices = await getAllServicePrices();
      setPrices(fetchedPrices);
    } catch (error) {
      console.error("Error loading prices:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load service prices",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrice = async () => {
    if (!formData.serviceName || formData.price < 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please provide a service name and a non-negative price.",
      });
      return;
    }

    const options: any = {
      serviceName: formData.serviceName,
      description: formData.description,
      currency: formData.currency,
      isActive: formData.isActive,
      hasOffer: formData.hasOffer,
    };

    if (formData.hasOffer && formData.offerPercentage > 0) {
      options.offerPercentage = formData.offerPercentage;
      if (formData.offerValidUntil) {
        options.offerValidUntil = new Date(formData.offerValidUntil);
      }
    }

    const success = await setServicePrice(formData.serviceType, formData.price, options);

    if (success) {
      toast({
        title: "Success",
        description: editingPrice ? "Price updated successfully" : "Price added successfully",
      });
      setIsFormOpen(false);
      setEditingPrice(null);
      resetForm();
      loadPrices();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save price",
      });
    }
  };

  const handleEdit = (price: ServicePrice) => {
    setEditingPrice(price);
    setFormData({
      serviceName: price.serviceName,
      serviceType: price.serviceType,
      price: price.price,
      currency: price.currency,
      description: price.description,
      isActive: price.isActive,
      hasOffer: price.hasOffer,
      offerPercentage: price.offerPercentage || 0,
      offerValidUntil: price.offerValidUntil ? price.offerValidUntil.toISOString().split('T')[0] : "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (priceId: string) => {
    if (!confirm("Are you sure you want to delete this price?")) return;

    const success = await deleteServicePrice(priceId);
    if (success) {
      toast({
        title: "Deleted",
        description: "Price deleted successfully",
      });
      loadPrices();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete price",
      });
    }
  };

  const handleToggleStatus = async (priceId: string, currentStatus: boolean) => {
    const success = await toggleServicePriceStatus(priceId, !currentStatus);
    if (success) {
      toast({
        title: "Updated",
        description: `Price ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      loadPrices();
    }
  };

  const resetForm = () => {
    setFormData({
      serviceName: "",
      serviceType: "custom",
      price: 0,
      currency: "EGP",
      description: "",
      isActive: true,
      hasOffer: false,
      offerPercentage: 0,
      offerValidUntil: "",
    });
  };

  const calculateOfferPrice = () => {
    if (formData.hasOffer && formData.offerPercentage > 0) {
      return formData.price - (formData.price * formData.offerPercentage / 100);
    }
    return formData.price;
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => router.push("/admin")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Service Pricing Management</h1>
                <p className="text-muted-foreground">Manage prices and offers for all services</p>
              </div>
            </div>
            <Button onClick={() => { resetForm(); setIsFormOpen(true); setEditingPrice(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Price
            </Button>
          </div>

          {/* Price Form */}
          {isFormOpen && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle>{editingPrice ? "Edit Price" : "Add New Price"}</CardTitle>
                <CardDescription>Set pricing and offers for services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Service Name</label>
                    <Input
                      placeholder="e.g., AI CV Builder"
                      value={formData.serviceName}
                      onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Service Type</label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value: any) => setFormData({ ...formData, serviceType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai-cv-builder">AI CV Builder</SelectItem>
                        <SelectItem value="job-posting">Job Posting</SelectItem>
                        <SelectItem value="job-view">Job View</SelectItem>
                        <SelectItem value="view-seeker-profile">View Seeker Profile (Employer)</SelectItem>
                        <SelectItem value="view-job-details">View Job Details (Seeker)</SelectItem>
                        <SelectItem value="talent-space">Talent Space</SelectItem>
                        <SelectItem value="custom">Custom Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Currency</label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EGP">EGP</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Service description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Offer Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="hasOffer"
                      checked={formData.hasOffer}
                      onChange={(e) => setFormData({ ...formData, hasOffer: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="hasOffer" className="text-sm font-medium">Enable Special Offer</label>
                  </div>

                  {formData.hasOffer && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-primary/5 p-4 rounded-lg">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Discount Percentage (%)</label>
                        <Input
                          type="number"
                          placeholder="e.g., 20"
                          value={formData.offerPercentage}
                          onChange={(e) => setFormData({ ...formData, offerPercentage: parseFloat(e.target.value) || 0 })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Valid Until (Optional)</label>
                        <Input
                          type="date"
                          value={formData.offerValidUntil}
                          onChange={(e) => setFormData({ ...formData, offerValidUntil: e.target.value })}
                        />
                      </div>

                      {formData.offerPercentage > 0 && (
                        <div className="col-span-2 p-3 bg-green-100 dark:bg-green-900/20 rounded border border-green-500/50">
                          <p className="text-sm font-medium">Offer Price: {formData.currency} {calculateOfferPrice().toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            Save {formData.offerPercentage}% (Original: {formData.currency} {formData.price})
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSavePrice} className="flex-1">
                    {editingPrice ? "Update Price" : "Add Price"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingPrice(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prices List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prices.map((price) => (
              <Card key={price.id} className={`${!price.isActive ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        {price.serviceName}
                      </CardTitle>
                      <CardDescription className="mt-1 capitalize">
                        {price.serviceType.replace(/-/g, ' ')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(price.id, price.isActive)}
                      >
                        {price.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    {price.hasOffer && price.offerPrice ? (
                      <div>
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-green-600" />
                          <span className="text-2xl font-bold text-green-600">
                            {price.currency} {price.offerPrice.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-through">
                          Original: {price.currency} {price.price.toFixed(2)}
                        </p>
                        {price.offerPercentage && (
                          <p className="text-xs text-green-600 font-medium">
                            Save {price.offerPercentage}%
                          </p>
                        )}
                        {price.offerValidUntil && (
                          <p className="text-xs text-muted-foreground">
                            Valid until: {price.offerValidUntil.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-2xl font-bold">
                        {price.currency} {price.price.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {price.description && (
                    <p className="text-sm text-muted-foreground">{price.description}</p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(price)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(price.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {prices.length === 0 && !isLoading && (
            <Card>
              <CardContent className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No Prices Configured Yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first service price to get started
                </p>
                <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Price
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
