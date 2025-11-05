// Server-side only - uses Node.js crypto module
import crypto from 'crypto';

export interface KashierConfig {
  merchantId: string;
  apiKey: string;
  secretKey: string;
  currency: string;
  mode: 'test' | 'live';
  baseUrl: string;
}

export interface KashierOrder {
  amount: string;
  currency: string;
  merchantOrderId: string;
  mid: string;
  secret?: string;
  merchantRedirect: string;
  display?: 'en' | 'ar';
  failureRedirect?: string;
  redirectMethod?: 'get' | 'post';
  allowedMethods?: string;
  defaultMethod?: string;
  brandColor?: string;
  metaData?: string;
}

export interface KashierPaymentResponse {
  paymentStatus: string;
  cardDataToken?: string;
  maskedCard?: string;
  merchantOrderId: string;
  orderId: string;
  cardBrand?: string;
  orderReference: string;
  transactionId: string;
  amount: string;
  currency: string;
  signature: string;
}

/**
 * Get Kashier configuration from environment variables
 */
export function getKashierConfig(): KashierConfig {
  return {
    merchantId: process.env.NEXT_PUBLIC_KASHIER_MERCHANT_ID || '',
    apiKey: process.env.NEXT_PUBLIC_KASHIER_API_KEY || '',
    secretKey: process.env.KASHIER_SECRET_KEY || '',
    currency: process.env.NEXT_PUBLIC_KASHIER_CURRENCY || 'EGP',
    mode: (process.env.NEXT_PUBLIC_KASHIER_MODE as 'test' | 'live') || 'live',
    baseUrl: process.env.NEXT_PUBLIC_KASHIER_BASE_URL || 'https://checkout.kashier.io',
  };
}

/**
 * Generate Kashier order hash
 * Format: /?payment={mid}.{orderId}.{amount}.{currency}
 */
export function generateKashierHash(
  merchantId: string,
  orderId: string,
  amount: string,
  currency: string,
  secretKey: string
): string {
  const path = `/?payment=${merchantId}.${orderId}.${amount}.${currency}`;
  
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(path)
    .digest('hex');
  
  return hash;
}

/**
 * Validate Kashier webhook signature
 */
export function validateKashierSignature(
  paymentData: KashierPaymentResponse,
  secretKey: string
): boolean {
  const queryString =
    `&paymentStatus=${paymentData.paymentStatus}` +
    `&cardDataToken=${paymentData.cardDataToken || ''}` +
    `&maskedCard=${paymentData.maskedCard || ''}` +
    `&merchantOrderId=${paymentData.merchantOrderId}` +
    `&orderId=${paymentData.orderId}` +
    `&cardBrand=${paymentData.cardBrand || ''}` +
    `&orderReference=${paymentData.orderReference}` +
    `&transactionId=${paymentData.transactionId}` +
    `&amount=${paymentData.amount}` +
    `&currency=${paymentData.currency}`;

  const finalUrl = queryString.substring(1); // Remove leading &
  
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(finalUrl)
    .digest('hex');

  return signature === paymentData.signature;
}

/**
 * Create Kashier payment URL for hosted checkout
 */
export function createKashierPaymentUrl(order: KashierOrder, hash: string, config: KashierConfig): string {
  const params = new URLSearchParams({
    merchantId: order.mid,
    orderId: order.merchantOrderId,
    amount: order.amount,
    currency: order.currency,
    hash: hash,
    merchantRedirect: order.merchantRedirect,
    mode: config.mode,
  });

  if (order.display) params.append('display', order.display);
  if (order.failureRedirect) params.append('failureRedirect', order.failureRedirect);
  if (order.redirectMethod) params.append('redirectMethod', order.redirectMethod);
  if (order.allowedMethods) params.append('allowedMethods', order.allowedMethods);
  if (order.defaultMethod) params.append('defaultMethod', order.defaultMethod);
  if (order.brandColor) params.append('brandColor', order.brandColor);
  if (order.metaData) params.append('metaData', order.metaData);

  return `${config.baseUrl}?${params.toString()}`;
}
