// Client-side Kashier utilities (no crypto module)

export interface KashierConfig {
  merchantId: string;
  apiKey: string;
  currency: string;
  mode: 'test' | 'live';
  baseUrl: string;
}

/**
 * Get Kashier public configuration (client-safe)
 */
export function getKashierPublicConfig(): Omit<KashierConfig, 'apiKey'> {
  return {
    merchantId: process.env.NEXT_PUBLIC_KASHIER_MERCHANT_ID || '',
    currency: process.env.NEXT_PUBLIC_KASHIER_CURRENCY || 'EGP',
    mode: (process.env.NEXT_PUBLIC_KASHIER_MODE as 'test' | 'live') || 'live',
    baseUrl: process.env.NEXT_PUBLIC_KASHIER_BASE_URL || 'https://checkout.kashier.io',
  };
}
