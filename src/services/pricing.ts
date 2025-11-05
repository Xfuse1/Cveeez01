import { db } from '@/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

/**
 * Service Pricing Management
 */

export interface ServicePrice {
  id: string;
  serviceName: string;
  serviceType: 'ai-cv-builder' | 'job-posting' | 'talent-space' | 'job-view' | 'custom';
  price: number;
  currency: string;
  description: string;
  isActive: boolean;
  hasOffer: boolean;
  offerPrice?: number;
  offerPercentage?: number;
  offerValidUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all service prices
 */
export async function getAllServicePrices(): Promise<ServicePrice[]> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return [];
  }

  try {
    const pricesRef = collection(db, 'servicePrices');
    const pricesSnapshot = await getDocs(pricesRef);
    
    const prices: ServicePrice[] = pricesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        serviceName: data.serviceName || '',
        serviceType: data.serviceType || 'custom',
        price: data.price || 0,
        currency: data.currency || 'EGP',
        description: data.description || '',
        isActive: data.isActive !== false,
        hasOffer: data.hasOffer || false,
        offerPrice: data.offerPrice,
        offerPercentage: data.offerPercentage,
        offerValidUntil: data.offerValidUntil?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });

    return prices;
  } catch (error) {
    console.error('Error fetching service prices:', error);
    return [];
  }
}

/**
 * Get price for a specific service
 */
export async function getServicePrice(serviceType: string): Promise<ServicePrice | null> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return null;
  }

  try {
    const pricesRef = collection(db, 'servicePrices');
    const q = query(
      pricesRef,
      where('serviceType', '==', serviceType),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      serviceName: data.serviceName || '',
      serviceType: data.serviceType || 'custom',
      price: data.price || 0,
      currency: data.currency || 'EGP',
      description: data.description || '',
      isActive: data.isActive !== false,
      hasOffer: data.hasOffer || false,
      offerPrice: data.offerPrice,
      offerPercentage: data.offerPercentage,
      offerValidUntil: data.offerValidUntil?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error fetching service price:', error);
    return null;
  }
}

/**
 * Get effective price (with offer if applicable)
 */
export async function getEffectivePrice(serviceType: string): Promise<{ price: number; hasOffer: boolean; originalPrice?: number; currency: string }> {
  const servicePrice = await getServicePrice(serviceType);
  
  if (!servicePrice) {
    // Return default prices if not found
    const defaults: Record<string, number> = {
      'ai-cv-builder': 10,
      'job-posting': 50,
      'job-view': 5,
      'talent-space': 100,
    };
    return {
      price: defaults[serviceType] || 10,
      hasOffer: false,
      currency: 'EGP',
    };
  }

  // Check if offer is active and valid
  if (servicePrice.hasOffer && servicePrice.offerPrice) {
    const now = new Date();
    const isOfferValid = !servicePrice.offerValidUntil || servicePrice.offerValidUntil > now;
    
    if (isOfferValid) {
      return {
        price: servicePrice.offerPrice,
        hasOffer: true,
        originalPrice: servicePrice.price,
        currency: servicePrice.currency,
      };
    }
  }

  return {
    price: servicePrice.price,
    hasOffer: false,
    currency: servicePrice.currency,
  };
}

/**
 * Create or update service price
 */
export async function setServicePrice(
  serviceType: string,
  price: number,
  options?: {
    serviceName?: string;
    description?: string;
    currency?: string;
    isActive?: boolean;
    hasOffer?: boolean;
    offerPrice?: number;
    offerPercentage?: number;
    offerValidUntil?: Date;
  }
): Promise<boolean> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return false;
  }

  try {
    const pricesRef = collection(db, 'servicePrices');
    const q = query(pricesRef, where('serviceType', '==', serviceType));
    const querySnapshot = await getDocs(q);

    const priceData: any = {
      serviceType,
      price,
      currency: options?.currency || 'EGP',
      serviceName: options?.serviceName || serviceType,
      description: options?.description || '',
      isActive: options?.isActive !== false,
      hasOffer: options?.hasOffer || false,
      updatedAt: Timestamp.now(),
    };

    if (options?.hasOffer) {
      if (options.offerPrice) {
        priceData.offerPrice = options.offerPrice;
      }
      if (options.offerPercentage) {
        priceData.offerPercentage = options.offerPercentage;
        priceData.offerPrice = price - (price * options.offerPercentage / 100);
      }
      if (options.offerValidUntil) {
        priceData.offerValidUntil = Timestamp.fromDate(options.offerValidUntil);
      }
    } else {
      // Remove offer fields if hasOffer is false
      priceData.offerPrice = null;
      priceData.offerPercentage = null;
      priceData.offerValidUntil = null;
    }

    if (querySnapshot.empty) {
      // Create new
      priceData.createdAt = Timestamp.now();
      const newDocRef = doc(pricesRef);
      await setDoc(newDocRef, priceData);
    } else {
      // Update existing
      const existingDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'servicePrices', existingDoc.id), priceData);
    }

    return true;
  } catch (error) {
    console.error('Error setting service price:', error);
    return false;
  }
}

/**
 * Delete service price
 */
export async function deleteServicePrice(priceId: string): Promise<boolean> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return false;
  }

  try {
    await deleteDoc(doc(db, 'servicePrices', priceId));
    return true;
  } catch (error) {
    console.error('Error deleting service price:', error);
    return false;
  }
}

/**
 * Toggle service price active status
 */
export async function toggleServicePriceStatus(priceId: string, isActive: boolean): Promise<boolean> {
  if (!db) {
    console.error('Firestore is not initialized.');
    return false;
  }

  try {
    await updateDoc(doc(db, 'servicePrices', priceId), {
      isActive,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error toggling service price status:', error);
    return false;
  }
}
