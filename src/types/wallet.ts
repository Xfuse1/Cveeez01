// Wallet TypeScript Types for Firebase

export type TransactionType = 
  | "deposit"           // Adding funds to wallet
  | "withdrawal"        // Withdrawing funds
  | "payment"          // Payment for services (CV, job posting, etc.)
  | "refund"           // Refund from cancelled service
  | "bonus"            // Promotional bonus
  | "cashback";        // Cashback rewards

export type TransactionStatus = 
  | "pending"          // Transaction initiated but not completed
  | "processing"       // Being processed by payment gateway
  | "completed"        // Successfully completed
  | "failed"           // Transaction failed
  | "cancelled"        // Cancelled by user or system
  | "refunded";        // Transaction was refunded

export type PaymentMethod = 
  | "kashier"          // Kashier payment gateway
  | "wallet"           // Internal wallet balance
  | "credit_card"      // Direct credit card
  | "bank_transfer"    // Bank transfer
  | "cash";            // Cash payment

export interface WalletBalance {
  userId: string;
  balance: number;                    // Current available balance
  currency: string;                   // EGP, USD, etc.
  totalDeposited: number;             // Lifetime deposits
  totalSpent: number;                 // Lifetime spending
  lastUpdated: Date;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;                     // User who made the transaction
  type: TransactionType;
  status: TransactionStatus;
  amount: number;                     // Transaction amount
  currency: string;                   // EGP, USD, etc.
  
  // Payment Details
  paymentMethod: PaymentMethod;
  paymentGatewayId?: string;          // Kashier transaction ID
  paymentGatewayResponse?: any;       // Full response from Kashier
  
  // Transaction Details
  description: string;                // e.g., "CV Builder Service", "Wallet Top-up"
  referenceId?: string;               // Order ID, Service ID, etc.
  referenceType?: string;             // "order", "service", "subscription"
  
  // Balances (for audit trail)
  balanceBefore: number;
  balanceAfter: number;
  
  // Metadata
  metadata?: {
    orderId?: string;
    serviceType?: string;
    packageName?: string;
    ipAddress?: string;
    userAgent?: string;
    [key: string]: any;
  };
  
  // Timestamps
  createdAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  cancelledAt?: Date;
  
  // Error handling
  errorMessage?: string;
  errorCode?: string;
}

export interface KashierPaymentRequest {
  userId: string;
  amount: number;
  currency: string;
  description: string;
  referenceId?: string;
  orderId?: string;
  successUrl: string;                 // Redirect URL on success
  failureUrl: string;                 // Redirect URL on failure
  webhookUrl?: string;                // Webhook for payment notifications
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
}

export interface KashierPaymentResponse {
  transactionId: string;
  status: string;
  paymentUrl?: string;                // URL to redirect user for payment
  amount: number;
  currency: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface WithdrawalRequest {
  userId: string;
  amount: number;
  currency: string;
  method: "bank_transfer" | "cash";
  
  // Bank details (if bank_transfer)
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  iban?: string;
  swiftCode?: string;
  
  // Status tracking
  status: "pending" | "approved" | "processing" | "completed" | "rejected";
  requestedAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
  rejectedAt?: Date;
  
  // Admin review
  reviewedBy?: string;                // Admin user ID
  rejectionReason?: string;
  
  // Transaction reference
  transactionId?: string;             // Linked transaction ID after processing
}

export interface PaymentHistory {
  userId: string;
  transactions: Transaction[];
  totalTransactions: number;
  totalDeposited: number;
  totalSpent: number;
  averageTransactionAmount: number;
  lastTransactionDate?: Date;
}
