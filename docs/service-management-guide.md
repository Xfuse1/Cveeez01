# Service Management System - Admin Guide

## Overview
This system allows administrators to manage ecommerce services dynamically from the admin dashboard. Services are stored in Firestore and can be added, edited, or removed without code changes.

## Database Structure

### Firestore Collection: `ecommerce_services`

Each service document contains:

```typescript
{
  id: string (auto-generated)
  category: 'cv-writing' | 'career-dev' | 'job-search' | 'tools'
  
  // English Content
  titleEn: string
  descriptionEn: string
  featuresEn: string[]
  ctaTextEn: string
  
  // Arabic Content
  titleAr: string
  descriptionAr: string
  featuresAr: string[]
  ctaTextAr: string
  
  // Pricing
  priceDesigner: number (EGP)
  priceAI: number (EGP)
  
  // Display
  imageId: string (reference to placeholder image)
  ctaType: 'link' | 'whatsapp'
  href: string (link or WhatsApp URL)
  
  // Metadata
  isActive: boolean
  order: number (for sorting)
  createdAt: Date
  updatedAt: Date
  createdBy: string (admin user ID)
}
```

## Getting Started

### Step 1: Initial Setup (First Time Only)

1. **Login as Admin**
   - Email: `admin@gmail.com`
   - Password: Your admin password

2. **Navigate to Migration Tool**
   - Go to Admin Dashboard
   - Click "Migrate Services" in the Company Settings section
   - This page: `/admin/migrate-services`

3. **Run Migration**
   - Click "Start Migration" button
   - This will import all existing services from the static data file to Firestore
   - You should see a success message with the count of migrated services

4. **Verify Migration**
   - Click "Go to Manage Services" button
   - You should see all services listed in the table

### Step 2: Managing Services

#### View All Services
- Navigate to: `/admin/manage-services`
- See all services with their status, prices, and order
- Toggle services active/inactive with the switch

#### Add New Service

1. Click "Add Service" button
2. Fill in all required fields:
   - **Category**: Choose from CV Writing, Career Development, Job Search, or Tools
   - **CTA Type**: Link (internal page) or WhatsApp (external contact)
   
3. **English Content Tab**:
   - Title (e.g., "Professional CV Writing")
   - Description (brief overview)
   - Features (list of benefits) - can add multiple
   - CTA Text (button text, e.g., "Order Now")

4. **Arabic Content Tab**:
   - Title (e.g., "كتابة السيرة الذاتية الاحترافية")
   - Description (brief overview in Arabic)
   - Features (list of benefits in Arabic)
   - CTA Text (button text in Arabic, e.g., "اطلب الآن")

5. **Pricing & Settings**:
   - Designer Price (EGP) - price for human designer service
   - AI Price (EGP) - price for AI-generated service
   - Image ID - reference to image (e.g., "service-ats-cv")
   - Link/URL - destination when user clicks CTA
   - Order - number for sorting (lower = appears first)
   - Active - toggle to show/hide service

6. Click "Create Service"

#### Edit Existing Service

1. Find the service in the table
2. Click the Edit (pencil) icon
3. Modify any fields
4. Click "Update Service"

#### Delete Service

1. Find the service in the table
2. Click the Delete (trash) icon
3. Confirm deletion (this cannot be undone)

#### Activate/Deactivate Service

- Use the toggle switch in the Status column
- Inactive services won't show on the ecommerce page

## Frontend Display

### Ecommerce Page: `/ecommerce`

- Automatically fetches all **active** services from Firestore
- Groups services by category
- Displays in user's selected language (English or Arabic)
- Shows appropriate pricing for both Designer and AI options

### Service Features

- **Bilingual**: All services automatically switch between English and Arabic based on user's language preference
- **Dynamic**: Changes made in admin dashboard appear immediately on the ecommerce page
- **Sortable**: Services appear in order specified by the "order" field
- **Categorized**: Automatically grouped under correct category headers

## API/Service Functions

Located in: `src/services/ecommerce-services.ts`

### Available Functions:

1. `getAllServices()` - Get all active services (public)
2. `getAllServicesAdmin()` - Get all services including inactive (admin only)
3. `getServiceById(serviceId)` - Get single service
4. `createService(service, userId)` - Create new service (admin only)
5. `updateService(serviceId, updates)` - Update service (admin only)
6. `deleteService(serviceId)` - Delete service (admin only)
7. `toggleServiceStatus(serviceId, isActive)` - Activate/deactivate (admin only)
8. `getServicesByCategory(category)` - Get services in specific category

## Image References

Services use placeholder images referenced by `imageId`. Current image IDs:

- `service-ats-cv`
- `service-standard-cv`
- `service-europass-cv`
- `service-canadian-cv`
- `service-cover-letter`
- `service-portfolio`
- `service-linkedin`
- `service-training`
- `service-job-listings`
- `service-translator`

To add new images, update the placeholder image system in:
`src/lib/placeholder-images.ts`

## Best Practices

### When Adding Services:

1. **Always fill both English and Arabic content** - ensures proper display for all users
2. **Use descriptive titles** - clear and concise (3-7 words)
3. **Keep descriptions brief** - 1-2 sentences max
4. **List 3-5 features** - most important benefits
5. **Set appropriate order** - lower numbers appear first
6. **Choose correct category** - helps users find services
7. **Set realistic prices** - in Egyptian Pounds (EGP)

### URL/Link Guidelines:

- **Internal Links**: Use paths like `/ecommerce/services/service-name`
- **WhatsApp Links**: Use format `https://wa.me/201065236963`
- **Job Board**: Link to `/jobs`
- **Free Tools**: Link to tool page (e.g., `/translator`)

### Pricing Strategy:

- Designer price should be higher than AI price
- Set to 0 for free services (e.g., job board, translator)
- Typical range: EGP 99 - 349

## Troubleshooting

### Services Not Showing on Ecommerce Page

1. Check if service is **active** (toggle switch in Manage Services)
2. Verify service has both English and Arabic content
3. Clear browser cache and refresh
4. Check browser console for errors

### Migration Errors

If migration fails:
1. Check Firebase permissions
2. Ensure you're logged in as admin
3. Check browser console for detailed error
4. Verify Firestore is properly configured in Firebase

### Cannot Edit/Delete Services

- Only admins can manage services
- Verify your account has admin access
- Check `src/services/admin.ts` for admin email list

## File Structure

```
src/
├── app/
│   ├── ecommerce/
│   │   └── page.tsx              # Public services page
│   └── admin/
│       ├── manage-services/
│       │   └── page.tsx          # Service management UI
│       └── migrate-services/
│           └── page.tsx          # One-time migration tool
├── services/
│   ├── ecommerce-services.ts    # CRUD operations
│   └── migrate-services.ts      # Migration helper
└── types/
    └── service.ts               # TypeScript interfaces
```

## Security

- Only users in the admin whitelist can access management pages
- All service operations require authentication
- Firestore security rules should restrict write access to admins only

## Future Enhancements

Potential improvements:
- Image upload directly from admin panel
- Bulk import/export services (CSV/JSON)
- Service templates for quick creation
- Analytics on service views/clicks
- A/B testing different descriptions
- Service scheduling (publish at specific time)

## Support

For issues or questions:
1. Check this documentation first
2. Review error messages in browser console
3. Check Firestore database directly via Firebase Console
4. Contact system administrator

---

**Last Updated**: November 5, 2025
**Version**: 1.0.0
