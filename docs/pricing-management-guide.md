# Pricing Management System Guide

## Overview
The dynamic pricing management system allows admins to configure service prices and promotional offers without editing code. All pricing is stored in Firestore and can be managed through the admin dashboard.

## Features

### 1. **Dynamic Service Pricing**
- Set custom prices for different services (AI CV Builder, Job Posting, Job View, Talent Space, etc.)
- Change prices instantly without code deployment
- Support for multiple currencies (EGP, USD, etc.)

### 2. **Promotional Offers**
- Create percentage-based discounts (e.g., 20% off)
- Set expiration dates for offers
- Automatic price calculation
- Display strikethrough original price with savings

### 3. **Admin Interface**
- User-friendly card-based UI
- Add, edit, delete, and toggle prices
- Real-time offer price calculation
- Status indicators (active/inactive)

## Access

### Admin Dashboard
1. Navigate to `/admin`
2. Login with admin credentials (admin@gmail.com / Admin123)
3. In the **Company Settings** section, click **Pricing Management**

### Direct URL
Access directly at: `/admin/pricing`

## How to Use

### Adding a New Price
1. Click **Add New Service Price** button
2. Fill in the form:
   - **Service Name**: Display name (e.g., "AI CV Builder")
   - **Service Type**: Select from dropdown (ai-cv-builder, job-posting, etc.)
   - **Base Price**: Regular price
   - **Currency**: EGP, USD, etc.
   - **Description**: Optional description
3. Optional - Add an offer:
   - Check **Enable Offer**
   - Enter **Offer Percentage** (e.g., 20 for 20% off)
   - Set **Valid Until** date
   - See calculated offer price in real-time
4. Click **Add Service Price**

### Editing a Price
1. Find the service card
2. Click **Edit** button
3. Modify fields as needed
4. Click **Update Service Price**

### Deleting a Price
1. Find the service card
2. Click **Delete** button
3. Confirm deletion

### Toggling Active Status
1. Find the service card
2. Use the toggle switch at the top
3. Inactive prices won't be shown to customers

## Service Types

| Type | Description | Used In |
|------|-------------|---------|
| `ai-cv-builder` | AI CV generation service | `/services/ai-cv-builder` |
| `job-posting` | Job posting service | `/employer/jobs` |
| `job-view` | Job listing visibility | Job board |
| `talent-space` | Talent space features | `/talent-space` |
| `custom` | Custom services | Various |

## Technical Details

### Database Structure
Collection: `servicePrices`

```typescript
{
  id: string;
  serviceName: string;
  serviceType: string;
  price: number;
  currency: string;
  description?: string;
  isActive: boolean;
  hasOffer: boolean;
  offerPrice?: number;
  offerPercentage?: number;
  offerValidUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Integration Example

```typescript
import { getEffectivePrice } from '@/services/pricing';

// Fetch current price with offers
const priceInfo = await getEffectivePrice('ai-cv-builder');

console.log(priceInfo.price); // Final price after offer
console.log(priceInfo.hasOffer); // true if offer is active
console.log(priceInfo.originalPrice); // Original price before offer
console.log(priceInfo.currency); // Currency code
```

### Default Prices
If no price is configured in the database, default values are used:
- AI CV Builder: 10 EGP
- Job Posting: 50 EGP
- Job View: 5 EGP
- Talent Space: 100 EGP

## User Experience

### CV Builder Page
When a user visits the AI CV Builder:
1. The current price is displayed below the Generate button
2. If an offer is active:
   - Original price shown with strikethrough
   - Offer price in green/bold
   - Percentage savings displayed (e.g., "25% OFF! 🎉")
3. Wallet balance shown in the same currency
4. After generation, success message includes amount deducted

### Example Display
```
💰 Cost: 10 EGP 7.5 EGP (25% OFF! 🎉) per CV generation
```

## Best Practices

1. **Test Offers**: Create test offers with short durations first
2. **Clear Descriptions**: Add helpful descriptions for each service
3. **Monitor Usage**: Check how pricing affects service usage
4. **Set Reasonable Expiry**: Don't make offers too long or too short
5. **Currency Consistency**: Use the same currency across related services

## Troubleshooting

### Price Not Updating
- Check if the service is marked as "Active"
- Verify the service type matches exactly
- Refresh the page to clear cache

### Offer Not Showing
- Check if the offer expiration date has passed
- Ensure "Enable Offer" checkbox was checked
- Verify the offer percentage is greater than 0

### Balance Deduction Mismatch
- Price is fetched at generation time
- If price changed after page load, refresh the page
- Check transaction history in wallet

## Future Enhancements
- Bulk pricing updates
- Price history tracking
- A/B testing for pricing
- Regional pricing
- Tiered pricing based on usage
- Coupon codes
- User-specific discounts

## Support
For issues or questions, contact the development team or check the admin dashboard for help resources.
