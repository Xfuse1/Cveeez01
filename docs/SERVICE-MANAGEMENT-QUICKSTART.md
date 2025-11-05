# Service Management System - Quick Start

## What Was Created

### 1. Database Service Layer
**File**: `src/services/ecommerce-services.ts`
- Complete CRUD operations for services
- Functions to create, read, update, delete services
- Firestore integration with proper error handling

### 2. Admin Management Page
**File**: `src/app/admin/manage-services/page.tsx`
**Route**: `/admin/manage-services`
- Full-featured admin interface to manage services
- Add/Edit/Delete services with bilingual content
- Toggle service active/inactive status
- Sortable services table
- Dialog-based forms for adding/editing

### 3. Migration Tool
**File**: `src/app/admin/migrate-services/page.tsx`
**Route**: `/admin/migrate-services`
- One-time tool to import existing services to database
- Migrates all static services to Firestore
- Shows success/failure results
- Only needs to be run once

### 4. Updated Ecommerce Page
**File**: `src/app/ecommerce/page.tsx`
- Now fetches services from Firestore instead of static data
- Displays services dynamically based on admin changes
- Supports all 4 categories: cv-writing, career-dev, job-search, tools
- Bilingual support (English/Arabic)

### 5. Admin Dashboard Integration
**File**: `src/app/admin/page.tsx`
- Added "Manage Services" link in Company Settings
- Added "Migrate Services" link for first-time setup

### 6. Documentation
**File**: `docs/service-management-guide.md`
- Complete guide for managing services
- Database structure documentation
- Best practices and troubleshooting

## Quick Start Steps

### 1️⃣ First Time Setup (Do This Once)

1. Login as admin: `admin@gmail.com`
2. Go to Admin Dashboard
3. Click "Migrate Services" in Company Settings
4. Click "Start Migration" button
5. Wait for success message
6. Click "Go to Manage Services"

### 2️⃣ Managing Services

**To Add a Service:**
1. Go to `/admin/manage-services`
2. Click "Add Service"
3. Fill English content (title, description, features, CTA)
4. Fill Arabic content (title, description, features, CTA)
5. Set prices (Designer and AI)
6. Set image ID and link
7. Click "Create Service"

**To Edit a Service:**
1. Find service in table
2. Click edit (pencil) icon
3. Modify fields
4. Click "Update Service"

**To Activate/Deactivate:**
- Toggle the switch in Status column

**To Delete:**
- Click delete (trash) icon
- Confirm deletion

## Database Structure

**Collection**: `ecommerce_services`

**Required Fields**:
- `titleEn`, `titleAr` - Service name in both languages
- `descriptionEn`, `descriptionAr` - Brief description
- `featuresEn`, `featuresAr` - Array of feature strings
- `ctaTextEn`, `ctaTextAr` - Button text
- `priceDesigner`, `priceAI` - Numbers (EGP)
- `category` - One of: cv-writing, career-dev, job-search, tools
- `imageId` - Reference to placeholder image
- `ctaType` - 'link' or 'whatsapp'
- `href` - URL or link path
- `isActive` - Boolean (show/hide service)
- `order` - Number (for sorting, lower = first)

## Available Routes

1. `/admin/manage-services` - Manage all services (admin only)
2. `/admin/migrate-services` - One-time migration tool (admin only)
3. `/ecommerce` - Public services page (displays active services)

## Key Features

✅ **Bilingual Support** - English and Arabic content for all services
✅ **Dynamic Updates** - Changes appear immediately on ecommerce page
✅ **Active/Inactive Toggle** - Show/hide services without deleting
✅ **Sortable** - Control display order with `order` field
✅ **Categorized** - Automatic grouping by category
✅ **Admin Only** - Secure access control
✅ **Rich Editor** - Add multiple features, full control over content
✅ **Flexible Pricing** - Support for Designer and AI pricing models

## Testing Checklist

After setup, verify:

- [ ] Migration completed successfully
- [ ] All services visible in Manage Services page
- [ ] Can add new service with English and Arabic content
- [ ] Can edit existing service
- [ ] Can toggle service active/inactive
- [ ] Inactive services don't show on ecommerce page
- [ ] Active services display correctly on ecommerce page
- [ ] Services switch between English/Arabic when language changed
- [ ] Can delete a service
- [ ] Services appear in correct category sections
- [ ] Prices display correctly

## Common Issues & Solutions

**Issue**: Services not showing on ecommerce page
**Solution**: Check service is active, has all required fields, refresh page

**Issue**: Cannot edit/delete services
**Solution**: Verify logged in as admin, check admin.ts email whitelist

**Issue**: Migration fails
**Solution**: Check Firebase permissions, verify admin login, check console errors

**Issue**: Missing translations
**Solution**: Ensure both English AND Arabic fields are filled

## Next Steps

After completing the setup:

1. Remove the migration tool link from admin dashboard (optional)
2. Customize service content to match your offerings
3. Update prices based on your pricing strategy
4. Add custom images by updating placeholder-images.ts
5. Configure Firestore security rules for production

## Support Files

- Service Types: `src/types/service.ts`
- Translation Keys: `src/lib/translations.ts`
- Admin Access: `src/services/admin.ts`
- Placeholder Images: `src/lib/placeholder-images.ts`

---

**Ready to use!** 🚀

Your service management system is now fully operational. Admin can manage services from the dashboard, and changes will reflect immediately on the ecommerce page.
