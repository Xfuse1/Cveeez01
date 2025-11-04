import { db } from '@/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  runTransaction,
  type QueryConstraint,
} from 'firebase/firestore';
import type {
  WalletBalance,
  Transaction,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
  WithdrawalRequest,
} from '@/types/wallet';

// ============================================
// WALLET BALANCE FUNCTIONS
// ============================================

/**
 * Get user's wallet balance
 */
export async function getWalletBalance(userId: string): Promise<WalletBalance | null> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return null;
  }

  try {
    const walletRef = doc(db, 'wallets', userId);
    const walletSnap = await getDoc(walletRef);

    if (walletSnap.exists()) {
      const data = walletSnap.data();
      return {
        userId: data.userId,
        balance: data.balance || 0,
        currency: data.currency || 'EGP',
        totalDeposited: data.totalDeposited || 0,
        totalSpent: data.totalSpent || 0,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    }

    // Create wallet if doesn't exist
    const newWallet: WalletBalance = {
      userId,
      balance: 0,
      currency: 'EGP',
      totalDeposited: 0,
      totalSpent: 0,
      lastUpdated: new Date(),
      createdAt: new Date(),
    };

    await setDoc(walletRef, {
      ...newWallet,
      lastUpdated: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return newWallet;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return null;
  }
}

/**
 * Update wallet balance (internal use only - should be done via transactions)
 */
async function updateWalletBalance(
  userId: string,
  newBalance: number,
  totalDeposited?: number,
  totalSpent?: number
): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized.');

  const walletRef = doc(db, 'wallets', userId);
  const updateData: any = {
    balance: newBalance,
    lastUpdated: Timestamp.now(),
  };

  if (totalDeposited !== undefined) updateData.totalDeposited = totalDeposited;
  if (totalSpent !== undefined) updateData.totalSpent = totalSpent;

  await updateDoc(walletRef, updateData);
}

// ============================================
// TRANSACTION FUNCTIONS
// ============================================

/**
 * Get user's transaction history
 */
export async function getTransactionHistory(
  userId: string,
  limitCount: number = 50
): Promise<Transaction[]> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return [];
  }

  try {
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', userId),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        userId: data.userId,
        type: data.type,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        paymentMethod: data.paymentMethod,
        paymentGatewayId: data.paymentGatewayId,
        paymentGatewayResponse: data.paymentGatewayResponse,
        description: data.description,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
        balanceBefore: data.balanceBefore,
        balanceAfter: data.balanceAfter,
        metadata: data.metadata,
        createdAt: data.createdAt?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate(),
        failedAt: data.failedAt?.toDate(),
        cancelledAt: data.cancelledAt?.toDate(),
        errorMessage: data.errorMessage,
        errorCode: data.errorCode,
      });
    });

    // Sort by createdAt in memory (descending - newest first)
    transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return transactions;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
}

/**
 * Create a new transaction
 */
export async function createTransaction(
  userId: string,
  type: TransactionType,
  amount: number,
  paymentMethod: PaymentMethod,
  description: string,
  options?: {
    referenceId?: string;
    referenceType?: string;
    metadata?: any;
    paymentGatewayId?: string;
  }
): Promise<string | null> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return null;
  }

  try {
    return await runTransaction(db, async (transaction) => {
      const walletRef = doc(db, 'wallets', userId);
      const walletSnap = await transaction.get(walletRef);

      if (!walletSnap.exists()) {
        throw new Error('Wallet not found');
      }

      const walletData = walletSnap.data();
      const currentBalance = walletData.balance || 0;

      // Calculate expected balance after transaction (for pending deposits, don't update wallet yet)
      let expectedBalance = currentBalance;
      
      // For deposits via payment gateway, balance will be updated when payment is confirmed
      // For direct payments/withdrawals, check balance immediately
      if (type === 'payment' || type === 'withdrawal') {
        if (currentBalance < amount) {
          throw new Error('Insufficient balance');
        }
        expectedBalance = currentBalance - amount;
      } else if (paymentMethod === 'wallet') {
        // Internal wallet transfer - update immediately
        expectedBalance = currentBalance + amount;
      }
      // For payment gateway deposits (kashier), expectedBalance stays same until confirmed

      // Create transaction record
      const transactionData: any = {
        userId,
        type,
        status: 'pending' as TransactionStatus,
        amount,
        currency: walletData.currency || 'EGP',
        paymentMethod,
        description,
        balanceBefore: currentBalance,
        balanceAfter: paymentMethod === 'kashier' && type === 'deposit' ? currentBalance : expectedBalance,
        createdAt: Timestamp.now(),
      };

      // Only add optional fields if they have values
      if (options?.referenceId) transactionData.referenceId = options.referenceId;
      if (options?.referenceType) transactionData.referenceType = options.referenceType;
      if (options?.metadata) transactionData.metadata = options.metadata;
      if (options?.paymentGatewayId) transactionData.paymentGatewayId = options.paymentGatewayId;

      const transactionsRef = collection(db, 'transactions');
      const newTransactionRef = doc(transactionsRef);
      transaction.set(newTransactionRef, transactionData);

      // Only update wallet balance for non-payment-gateway transactions
      // Payment gateway deposits will be updated when webhook confirms success
      if (paymentMethod !== 'kashier' || type !== 'deposit') {
        const updateData: any = {
          balance: expectedBalance,
          lastUpdated: Timestamp.now(),
        };

        if (type === 'deposit' || type === 'refund' || type === 'bonus' || type === 'cashback') {
          updateData.totalDeposited = (walletData.totalDeposited || 0) + amount;
        } else if (type === 'payment') {
          updateData.totalSpent = (walletData.totalSpent || 0) + amount;
        }

        transaction.update(walletRef, updateData);
      }
      // For Kashier deposits, wallet will be updated in completeTransaction() after payment confirmation

      return newTransactionRef.id;
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: TransactionStatus,
  options?: {
    errorMessage?: string;
    errorCode?: string;
    paymentGatewayResponse?: any;
  }
): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized.');

  const transactionRef = doc(db, 'transactions', transactionId);
  const updateData: any = {
    status,
  };

  if (status === 'completed') {
    updateData.completedAt = Timestamp.now();
  } else if (status === 'failed') {
    updateData.failedAt = Timestamp.now();
    updateData.errorMessage = options?.errorMessage;
    updateData.errorCode = options?.errorCode;
  } else if (status === 'cancelled') {
    updateData.cancelledAt = Timestamp.now();
  }

  if (options?.paymentGatewayResponse) {
    updateData.paymentGatewayResponse = options.paymentGatewayResponse;
  }

  await updateDoc(transactionRef, updateData);
}

/**
 * Complete a transaction and update wallet balance
 * Use this for payment gateway confirmations (Kashier webhook)
 */
export async function completeTransaction(
  transactionId: string,
  paymentGatewayResponse?: any
): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized.');

  try {
    await runTransaction(db, async (transaction) => {
      // Get transaction details
      const transactionRef = doc(db, 'transactions', transactionId);
      const transactionSnap = await transaction.get(transactionRef);

      if (!transactionSnap.exists()) {
        throw new Error('Transaction not found');
      }

      const transactionData = transactionSnap.data();

      // Only complete if still pending
      if (transactionData.status !== 'pending') {
        console.log(`Transaction ${transactionId} already ${transactionData.status}`);
        return;
      }

      // Get wallet
      const walletRef = doc(db, 'wallets', transactionData.userId);
      const walletSnap = await transaction.get(walletRef);

      if (!walletSnap.exists()) {
        throw new Error('Wallet not found');
      }

      const walletData = walletSnap.data();
      const currentBalance = walletData.balance || 0;

      // Calculate new balance
      let newBalance = currentBalance;
      const amount = transactionData.amount;
      const type = transactionData.type;

      if (type === 'deposit' || type === 'refund' || type === 'bonus' || type === 'cashback') {
        newBalance = currentBalance + amount;
      } else if (type === 'payment' || type === 'withdrawal') {
        newBalance = currentBalance - amount;
      }

      // Update transaction status
      const transactionUpdate: any = {
        status: 'completed',
        completedAt: Timestamp.now(),
        balanceAfter: newBalance,
      };

      if (paymentGatewayResponse) {
        transactionUpdate.paymentGatewayResponse = paymentGatewayResponse;
      }

      transaction.update(transactionRef, transactionUpdate);

      // Update wallet balance
      const walletUpdate: any = {
        balance: newBalance,
        lastUpdated: Timestamp.now(),
      };

      if (type === 'deposit' || type === 'refund' || type === 'bonus' || type === 'cashback') {
        walletUpdate.totalDeposited = (walletData.totalDeposited || 0) + amount;
      } else if (type === 'payment') {
        walletUpdate.totalSpent = (walletData.totalSpent || 0) + amount;
      }

      transaction.update(walletRef, walletUpdate);
    });

    console.log(`Transaction ${transactionId} completed successfully`);
  } catch (error) {
    console.error('Error completing transaction:', error);
    throw error;
  }
}

/**
 * Get transaction by reference ID (merchant order ID)
 */
export async function getTransactionByReferenceId(referenceId: string): Promise<Transaction | null> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return null;
  }

  try {
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('referenceId', '==', referenceId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      userId: data.userId,
      type: data.type,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      paymentGatewayId: data.paymentGatewayId,
      paymentGatewayResponse: data.paymentGatewayResponse,
      description: data.description,
      referenceId: data.referenceId,
      referenceType: data.referenceType,
      balanceBefore: data.balanceBefore,
      balanceAfter: data.balanceAfter,
      metadata: data.metadata,
      createdAt: data.createdAt?.toDate() || new Date(),
      completedAt: data.completedAt?.toDate(),
      failedAt: data.failedAt?.toDate(),
      cancelledAt: data.cancelledAt?.toDate(),
      errorMessage: data.errorMessage,
      errorCode: data.errorCode,
    };
  } catch (error) {
    console.error('Error fetching transaction by reference ID:', error);
    return null;
  }
}

// ============================================
// WITHDRAWAL FUNCTIONS
// ============================================

/**
 * Request withdrawal
 */
export async function requestWithdrawal(
  userId: string,
  amount: number,
  method: 'bank_transfer' | 'cash',
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    iban?: string;
    swiftCode?: string;
  }
): Promise<string | null> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return null;
  }

  try {
    // Check balance
    const wallet = await getWalletBalance(userId);
    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    const withdrawalData: any = {
      userId,
      amount,
      currency: wallet.currency,
      method,
      status: 'pending',
      requestedAt: Timestamp.now(),
      ...bankDetails,
    };

    const withdrawalsRef = collection(db, 'withdrawalRequests');
    const docRef = await addDoc(withdrawalsRef, withdrawalData);

    return docRef.id;
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    return null;
  }
}

/**
 * Get user's withdrawal requests
 */
export async function getWithdrawalRequests(userId: string): Promise<WithdrawalRequest[]> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return [];
  }

  try {
    const withdrawalsRef = collection(db, 'withdrawalRequests');
    const q = query(
      withdrawalsRef,
      where('userId', '==', userId),
      orderBy('requestedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const withdrawals: WithdrawalRequest[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      withdrawals.push({
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountHolderName: data.accountHolderName,
        iban: data.iban,
        swiftCode: data.swiftCode,
        status: data.status,
        requestedAt: data.requestedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        rejectedAt: data.rejectedAt?.toDate(),
        reviewedBy: data.reviewedBy,
        rejectionReason: data.rejectionReason,
        transactionId: data.transactionId,
      });
    });

    return withdrawals;
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    return [];
  }
}

// ============================================
// PAYMENT FUNCTIONS (for Kashier integration)
// ============================================

/**
 * Initiate Kashier payment (placeholder - will be implemented later)
 */
export async function initiateKashierPayment(
  userId: string,
  amount: number,
  description: string,
  options?: {
    orderId?: string;
    referenceId?: string;
  }
): Promise<{ transactionId: string; paymentUrl?: string } | null> {
  // This will be implemented when integrating Kashier
  // For now, create a pending transaction
  
  const transactionId = await createTransaction(
    userId,
    'deposit',
    amount,
    'kashier',
    description,
    {
      referenceId: options?.referenceId,
      metadata: { orderId: options?.orderId },
    }
  );

  if (!transactionId) return null;

  return {
    transactionId,
    paymentUrl: undefined, // Will be Kashier payment URL
  };
}

/**
 * Handle Kashier webhook callback (placeholder)
 */
export async function handleKashierWebhook(
  transactionId: string,
  webhookData: any
): Promise<void> {
  // This will be implemented when integrating Kashier
  // Will update transaction status based on webhook data
  console.log('Kashier webhook received:', transactionId, webhookData);
}
