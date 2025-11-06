import { getWalletBalance, createTransaction } from './wallet';
import { hasUserPaidForView, recordPaidView, getEffectivePrice } from './pricing';

export interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
  error?: string;
}

/**
 * Process payment for viewing a seeker profile (employer action)
 */
export async function payToViewSeekerProfile(
  employerId: string,
  seekerId: string
): Promise<PaymentResult> {
  try {
    // Check if already paid
    const alreadyPaid = await hasUserPaidForView(employerId, seekerId, 'seeker_profile');
    if (alreadyPaid) {
      return {
        success: true,
        message: 'Already have access to this profile',
      };
    }

    // Get pricing
    const pricing = await getEffectivePrice('view-seeker-profile');
    const amount = pricing.price; // getEffectivePrice already returns the offer price if available

    // Check wallet balance
    const wallet = await getWalletBalance(employerId);
    if (!wallet || wallet.balance < amount) {
      return {
        success: false,
        message: `Insufficient balance. You need ${pricing.currency} ${amount.toFixed(2)} to view this profile.`,
        error: 'insufficient_balance',
      };
    }

    // Create transaction (will automatically deduct from wallet)
    const transactionId = await createTransaction(
      employerId,
      'payment',
      amount,
      'wallet',
      `View Seeker Profile`,
      {
        referenceId: seekerId,
        referenceType: 'seeker_profile',
        metadata: {
          seekerId,
          serviceType: 'view-seeker-profile',
        },
      }
    );

    if (!transactionId) {
      return {
        success: false,
        message: 'Failed to create transaction',
        error: 'transaction_failed',
      };
    }

    // Record the paid view
    await recordPaidView(employerId, seekerId, 'seeker_profile', amount, transactionId);

    return {
      success: true,
      message: `Successfully unlocked profile for ${pricing.currency} ${amount.toFixed(2)}`,
      transactionId: transactionId,
    };
  } catch (error) {
    console.error('Error in payToViewSeekerProfile:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred while processing payment',
      error: 'unknown_error',
    };
  }
}

/**
 * Process payment for viewing job details (seeker action)
 */
export async function payToViewJobDetails(
  seekerId: string,
  jobId: string
): Promise<PaymentResult> {
  try {
    // Check if already paid
    const alreadyPaid = await hasUserPaidForView(seekerId, jobId, 'job_details');
    if (alreadyPaid) {
      return {
        success: true,
        message: 'Already have access to this job',
      };
    }

    // Get pricing
    const pricing = await getEffectivePrice('view-job-details');
    const amount = pricing.price; // getEffectivePrice already returns the offer price if available

    // Check wallet balance
    const wallet = await getWalletBalance(seekerId);
    if (!wallet || wallet.balance < amount) {
      return {
        success: false,
        message: `Insufficient balance. You need ${pricing.currency} ${amount.toFixed(2)} to view full job details.`,
        error: 'insufficient_balance',
      };
    }

    // Create transaction (will automatically deduct from wallet)
    const transactionId = await createTransaction(
      seekerId,
      'payment',
      amount,
      'wallet',
      `View Job Details`,
      {
        referenceId: jobId,
        referenceType: 'job_details',
        metadata: {
          jobId,
          serviceType: 'view-job-details',
        },
      }
    );

    if (!transactionId) {
      return {
        success: false,
        message: 'Failed to create transaction',
        error: 'transaction_failed',
      };
    }

    // Record the paid view
    await recordPaidView(seekerId, jobId, 'job_details', amount, transactionId);

    return {
      success: true,
      message: `Successfully unlocked job details for ${pricing.currency} ${amount.toFixed(2)}`,
      transactionId: transactionId,
    };
  } catch (error) {
    console.error('Error in payToViewJobDetails:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred while processing payment',
      error: 'unknown_error',
    };
  }
}

/**
 * Check if user has access to view a seeker profile
 */
export async function canViewSeekerProfile(
  employerId: string,
  seekerId: string
): Promise<boolean> {
  return await hasUserPaidForView(employerId, seekerId, 'seeker_profile');
}

/**
 * Check if user has access to view job details
 */
export async function canViewJobDetails(
  seekerId: string,
  jobId: string
): Promise<boolean> {
  return await hasUserPaidForView(seekerId, jobId, 'job_details');
}

/**
 * Get the price for viewing a seeker profile
 */
export async function getSeekerProfileViewPrice() {
  return await getEffectivePrice('view-seeker-profile');
}

/**
 * Get the price for viewing job details
 */
export async function getJobDetailsViewPrice() {
  return await getEffectivePrice('view-job-details');
}
