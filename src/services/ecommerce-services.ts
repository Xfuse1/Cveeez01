import { db } from '@/firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  where
} from 'firebase/firestore';

export interface EcommerceService {
  id?: string;
  category: 'cv-writing' | 'career-dev' | 'job-search' | 'tools';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  featuresEn: string[];
  featuresAr: string[];
  ctaTextEn: string;
  ctaTextAr: string;
  priceDesigner: number;
  priceAI: number;
  imageUrl?: string;
  imageId: string;
  ctaType: 'link' | 'whatsapp';
  href: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  order?: number; // For sorting services
}

const SERVICES_COLLECTION = 'ecommerce_services';

/**
 * Get all active services
 */
export async function getAllServices(): Promise<EcommerceService[]> {
  try {
    const servicesRef = collection(db, SERVICES_COLLECTION);
    // Simple query - just get all services, then filter and sort in memory
    const snapshot = await getDocs(servicesRef);
    
    const services = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as EcommerceService[];
    
    // Filter active services and sort in memory
    return services
      .filter(service => service.isActive)
      .sort((a, b) => {
        // Sort by order first (lower numbers first)
        const orderDiff = (a.order || 999) - (b.order || 999);
        if (orderDiff !== 0) return orderDiff;
        
        // Then by creation date (newest first)
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

/**
 * Get all services (including inactive) - Admin only
 */
export async function getAllServicesAdmin(): Promise<EcommerceService[]> {
  try {
    const servicesRef = collection(db, SERVICES_COLLECTION);
    // Simple query - get all, then sort in memory
    const snapshot = await getDocs(servicesRef);
    
    const services = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as EcommerceService[];
    
    // Sort in memory
    return services.sort((a, b) => {
      // Sort by order first (lower numbers first)
      const orderDiff = (a.order || 999) - (b.order || 999);
      if (orderDiff !== 0) return orderDiff;
      
      // Then by creation date (newest first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  } catch (error) {
    console.error('Error fetching all services:', error);
    return [];
  }
}

/**
 * Get service by ID
 */
export async function getServiceById(serviceId: string): Promise<EcommerceService | null> {
  try {
    const serviceRef = doc(db, SERVICES_COLLECTION, serviceId);
    const snapshot = await getDoc(serviceRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt?.toDate() || new Date(),
      updatedAt: snapshot.data().updatedAt?.toDate() || new Date(),
    } as EcommerceService;
  } catch (error) {
    console.error('Error fetching service:', error);
    return null;
  }
}

/**
 * Create a new service - Admin only
 */
export async function createService(
  service: Omit<EcommerceService, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<{ success: boolean; serviceId?: string; error?: string }> {
  try {
    const servicesRef = collection(db, SERVICES_COLLECTION);
    
    const newService = {
      ...service,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: userId,
      isActive: service.isActive ?? true,
      order: service.order ?? 999,
    };
    
    const docRef = await addDoc(servicesRef, newService);
    
    return { success: true, serviceId: docRef.id };
  } catch (error) {
    console.error('Error creating service:', error);
    return { success: false, error: 'Failed to create service' };
  }
}

/**
 * Update an existing service - Admin only
 */
export async function updateService(
  serviceId: string,
  updates: Partial<Omit<EcommerceService, 'id' | 'createdAt' | 'createdBy'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const serviceRef = doc(db, SERVICES_COLLECTION, serviceId);
    
    await updateDoc(serviceRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating service:', error);
    return { success: false, error: 'Failed to update service' };
  }
}

/**
 * Delete a service - Admin only
 */
export async function deleteService(serviceId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const serviceRef = doc(db, SERVICES_COLLECTION, serviceId);
    await deleteDoc(serviceRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting service:', error);
    return { success: false, error: 'Failed to delete service' };
  }
}

/**
 * Toggle service active status - Admin only
 */
export async function toggleServiceStatus(
  serviceId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateService(serviceId, { isActive });
}

/**
 * Get services by category
 */
export async function getServicesByCategory(
  category: EcommerceService['category']
): Promise<EcommerceService[]> {
  try {
    const servicesRef = collection(db, SERVICES_COLLECTION);
    // Simple query - filter by category only, then filter and sort in memory
    const q = query(servicesRef, where('category', '==', category));
    const snapshot = await getDocs(q);
    
    const services = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as EcommerceService[];
    
    // Filter active and sort in memory
    return services
      .filter(service => service.isActive)
      .sort((a, b) => (a.order || 999) - (b.order || 999));
  } catch (error) {
    console.error('Error fetching services by category:', error);
    return [];
  }
}

/**
 * Update service order for sorting
 */
export async function updateServiceOrder(
  serviceId: string,
  order: number
): Promise<{ success: boolean; error?: string }> {
  return updateService(serviceId, { order });
}
