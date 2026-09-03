# The Sugar Printer - Store & Inventory Specification

## Brand Identity
- **Name**: The Sugar Printer
- **Description**: Premier e-commerce store for custom 3D prints, authentic sensory fidget toys, NeeDoh squishies, and sweet novelties.
- **Hosting URL**: https://the-sugar-printer.web.app
- **Admin Dashboard**: admin.html (Default password: picnic2026 or admin)

## Pre-Added Products (Initial Inventory)
1. **Mini Purple Mattress Fidget**
   - ID: `item-purple-mattress`
   - Stock: `1`
   - Price: `$8.00`
   - Image: `assets/images/purple-mattress.png`
   - Category: `fidgets` (Fidgets & Squishies)
   - Description: Authentic miniature purple mattress grid sample with built-in pillow. Ultra-satisfying squish, stretch, and sensory fidget toy!

2. **NeeDoh Classic Groovy Glob**
   - ID: `item-needoh-classic`
   - Stock: `1`
   - Price: `$4.50`
   - Category: `fidgets`
   - Variations: Groovy Pink, Electric Blue, Vibrant Purple, Neon Green, Sunset Orange
   - Description: The super squishy, soothing stress ball that always bounces back! Filled with a super-soft dough-like compound.

3. **NeeDoh Nice Berg (Crystal Iceberg)**
   - ID: `item-needoh-nice-berg`
   - Stock: `1`
   - Price: `$6.00`
   - Category: `fidgets`
   - Variations: Crystal Clear, Glacier Blue, Arctic Pink
   - Description: Crystal-clear translucent iceberg shaped squeeze block. Firm satisfying resistance that slowly returns to its geometric shape.

## Admin Features
- **Live Stock Stepper & Editor**: Real-time `[-]` and `[+]` buttons, numeric input, and stock badges (In Stock, Only 1 Left, Out of Stock).
- **Add / Edit Product Modal**: Create and edit products with custom titles, categories, prices, initial stock, and descriptions.
- **Image Import & Upload**: Upload local image files via FileReader (converted to Base64 data URLs) or provide external image URLs with instant preview.
- **Orders & Analytics**: View customer orders, filter by status, track sales volume, and export order history as CSV.
- **Promo Code Manager**: Create and delete custom discount codes with percentage discounts.
- **Reset Inventory**: One-click restore back to default initial stock.

## Customer Experience
- **Interactive Catalog**: Filter by Fidgets & Squishies, 3D Prints, Novelties, Sweet Treats, or search by keyword.
- **Stock Enforced Purchasing**: Quantity limits cannot exceed available stock; items automatically show "Sold Out" when stock reaches 0.
- **Cart & Checkout**: Multi-item cart, promo code redemption, responsive checkout, and instant stock deduction upon order confirmation.
