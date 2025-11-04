"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BillingInfo, Invoice } from "@/types/dashboard";
import { CreditCard, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BillingCardProps {
  billingInfo: BillingInfo;
  invoices: Invoice[];
}

export function BillingCard({ billingInfo, invoices }: BillingCardProps) {
  const { toast } = useToast();

  const handleUpgrade = () => {
    toast({
      title: "Upgrade Plan",
      description: "Redirecting to plan selection...",
    });
  };

  const handleDownload = (invoiceId: string) => {
    toast({
      title: "Downloading Invoice",
      description: `Invoice ${invoiceId} is being downloaded...`,
    });
  };

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-500 hover:bg-green-600";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "overdue":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Billing & Plan
        </CardTitle>
        <Button size="sm" onClick={handleUpgrade}>
          Upgrade Plan
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Plan</span>
            <Badge className="bg-primary">{billingInfo.currentPlan}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next Invoice</span>
            <span className="font-semibold">
              ${billingInfo.amount} on{" "}
              {billingInfo.nextInvoiceDate.toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Recent Invoices</h4>
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-2 rounded hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    className={`${getStatusColor(invoice.status)} text-white text-xs`}
                  >
                    {invoice.status}
                  </Badge>
                  <span className="text-sm">
                    {invoice.date.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    ${invoice.amount}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(invoice.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
