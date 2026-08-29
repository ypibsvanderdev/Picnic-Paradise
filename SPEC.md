# Picnic Paradise — Shared Specification

All agents building this website MUST follow these conventions for consistency.

## Project Info
- **Event**: August 28 Picnic Café & Drink Stand
- **Event Date**: August 28, 2026
- **Location**: Central Park Pavilion
- **Contact**: hello@picnicparadise.com | (555) 123-4567
- **Tax Rate**: 8.25%
- **Discount Codes**: PICNIC10 (10%), SUMMER20 (20%), FIRSTORDER (15%)

## Design Tokens (CSS Custom Properties on :root)

```css
:root {
  /* Primary palette */
  --pp-primary: #4ECDC4;
  --pp-primary-dark: #3BA99F;
  --pp-primary-light: #7EDDD6;
  --pp-secondary: #FFE66D;
  --pp-secondary-dark: #E6CF5C;
  --pp-accent: #FF6B6B;
  --pp-accent-dark: #E05555;
  --pp-green: #95E872;
  --pp-green-dark: #7BC95D;
  --pp-purple: #A78BFA;
  --pp-orange: #FFA94D;

  /* Surfaces */
  --pp-bg: #FFF8F0;
  --pp-bg-alt: #FFF0E0;
  --pp-surface: #FFFFFF;
  --pp-text: #2D3436;
  --pp-text-secondary: #636E72;
  --pp-border: #E0E0E0;

  /* Effects */
  --pp-shadow: 0 4px 24px rgba(0,0,0,0.08);
  --pp-shadow-lg: 0 8px 40px rgba(0,0,0,0.12);
  --pp-radius: 16px;
  --pp-radius-sm: 8px;
  --pp-radius-full: 9999px;

  /* Transitions */
  --pp-transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --pp-transition-fast: 0.15s ease;

  /* Navbar */
  --pp-navbar-height: 70px;
  --pp-navbar-bg: rgba(255,248,240,0.85);
  --pp-navbar-blur: 20px;
}

/* Dark mode */
[data-theme="dark"] {
  --pp-bg: #0F0F1A;
  --pp-bg-alt: #1A1A2E;
  --pp-surface: #16213E;
  --pp-text: #E8E8E8;
  --pp-text-secondary: #B0B0B0;
  --pp-border: #2A2A4A;
  --pp-shadow: 0 4px 24px rgba(0,0,0,0.3);
  --pp-shadow-lg: 0 8px 40px rgba(0,0,0,0.4);
  --pp-navbar-bg: rgba(15,15,26,0.85);
}
```

## Typography (Google Fonts)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
```

- Headings: `'Outfit', sans-serif` (weights: 600, 700, 800)
- Body: `'Inter', sans-serif` (weights: 400, 500, 600)

## HTML <head> Template

Every page must include:
```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="[page-specific description]">
  <title>[Page Title] | Picnic Paradise</title>
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
  <!-- CSS -->
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/animations.css">
  <!-- page-specific CSS here -->
</head>
```

## Navbar HTML (every page)

```html
<nav class="navbar" id="navbar">
  <div class="nav-container">
    <a href="index.html" class="nav-logo">
      <span class="nav-logo-icon">🧺</span>
      <span class="nav-logo-text">Picnic Paradise</span>
    </a>
    <div class="nav-links" id="navLinks">
      <a href="index.html" class="nav-link" data-page="home">Home</a>
      <a href="menu.html" class="nav-link" data-page="menu">Menu</a>
      <a href="cart.html" class="nav-link nav-link-cart" data-page="cart">
        Cart
        <span class="cart-badge" id="cartBadge" style="display:none;">0</span>
      </a>
      <a href="account.html" class="nav-link" data-page="account">Account</a>
    </div>
    <div class="nav-actions">
      <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode" title="Toggle dark mode">
        <span class="theme-icon">🌙</span>
      </button>
      <button class="hamburger" id="hamburger" aria-label="Toggle navigation menu">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>
  </div>
</nav>
```

## Footer HTML (every page)

```html
<footer class="footer" id="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-col">
        <h3 class="footer-title">🧺 Picnic Paradise</h3>
        <p class="footer-desc">Join us August 28, 2026 for delicious food and refreshing drinks at Central Park Pavilion!</p>
      </div>
      <div class="footer-col">
        <h4 class="footer-subtitle">Quick Links</h4>
        <ul class="footer-links">
          <li><a href="index.html">Home</a></li>
          <li><a href="menu.html">Menu</a></li>
          <li><a href="cart.html">Order Now</a></li>
          <li><a href="account.html">My Account</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4 class="footer-subtitle">Legal</h4>
        <ul class="footer-links">
          <li><a href="privacy.html">Privacy Policy</a></li>
          <li><a href="terms.html">Terms of Service</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4 class="footer-subtitle">Contact</h4>
        <p>📧 hello@picnicparadise.com</p>
        <p>📞 (555) 123-4567</p>
        <p>📍 Central Park Pavilion</p>
        <div class="social-links">
          <a href="#" aria-label="Instagram" class="social-icon">📸</a>
          <a href="#" aria-label="Facebook" class="social-icon">📘</a>
          <a href="#" aria-label="Twitter" class="social-icon">🐦</a>
          <a href="#" aria-label="TikTok" class="social-icon">🎵</a>
        </div>
      </div>
    </div>
    <div class="footer-newsletter">
      <h4>Stay Updated!</h4>
      <form class="newsletter-form" id="footerNewsletter" onsubmit="return false;">
        <input type="email" placeholder="Enter your email" class="input newsletter-input" required>
        <button type="submit" class="btn btn-secondary">Subscribe ✉️</button>
      </form>
    </div>
    <div class="footer-bottom">
      <p>© 2026 Picnic Paradise. All rights reserved. | Event Date: August 28, 2026</p>
    </div>
  </div>
</footer>
<button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>
```

## Script Loading Order (before </body>)

All customer pages:
```html
<script src="js/data.js"></script>
<script src="js/utils.js"></script>
<script src="js/app.js"></script>
```

Page-specific additions:
- index.html: `<script src="js/countdown.js"></script>`
- menu.html: `<script src="js/menu.js"></script>`
- cart.html: `<script src="js/cart.js"></script>` then `<script src="js/checkout.js"></script>`
- account.html: `<script src="js/auth.js"></script>`
- admin.html: Uses `<script src="js/data.js"></script>`, `<script src="js/utils.js"></script>`, `<script src="js/admin.js"></script>` (NO app.js)

## LocalStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `pp_cart` | CartItem[] | Shopping cart items |
| `pp_user` | User\|null | Logged-in user |
| `pp_orders` | Order[] | Order history |
| `pp_favorites` | string[] | Favorited item IDs |
| `pp_theme` | 'light'\|'dark' | Theme preference |
| `pp_menu_overrides` | object | Admin overrides (soldOut, prices) |
| `pp_announcements` | string[] | Admin announcements |

## Data Structures

### CartItem
```json
{
  "cartId": "ci_1693000000_abc",
  "itemId": "slushie",
  "name": "Slushie",
  "category": "slushies",
  "size": "medium",
  "flavor": "Blue Raspberry",
  "addIns": [],
  "quantity": 2,
  "unitPrice": 5,
  "specialInstructions": ""
}
```

### Order
```json
{
  "orderId": "PP-1693000000",
  "items": [],
  "subtotal": 10.00,
  "tax": 0.83,
  "discountCode": "PICNIC10",
  "discountAmount": 1.00,
  "total": 9.83,
  "pickupTime": "11:00 AM",
  "status": "confirmed",
  "timestamp": "2026-08-28T11:00:00Z",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "(555) 000-0000"
}
```

### User
```json
{
  "id": "u_1693000000",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "(555) 000-0000",
  "passwordHash": "hashed_password"
}
```

## Menu Items

### Categories
| ID | Label | Type | Subtype | Emoji | Gradient |
|----|-------|------|---------|-------|----------|
| slushies | Slushies | drink | cold | 🍧 | #667eea → #764ba2 |
| lemonade | Fresh Lemonade | drink | cold | 🍋 | #f6d365 → #fda085 |
| coffee | Coffee | drink | hot | ☕ | #a18cd1 → #fbc2eb |
| tea | Tea | drink | hot | 🍵 | #89f7fe → #66a6ff |
| arabic-coffee | Arabic Coffee | drink | hot | ☕ | #c79081 → #dfa579 |
| arabic-tea | Arabic Tea | drink | hot | 🫖 | #f5af19 → #f12711 |
| brownies | Brownies | dessert | null | 🍫 | #434343 → #000000 |
| cake-pops | Cake Pops | dessert | null | 🍰 | #f093fb ➔ #f5576c |
| baklawa | Baklawa | dessert | null | 🍯 | #f7971e ➔ #ffd200 |
| kanafa | Kanafa | dessert | null | 🥮 | #ff9966 ➔ #ff5e62 |

### Pricing
| Category | Small | Medium | Large | Single |
|----------|-------|--------|-------|--------|
| Slushies | $3 | $5 | $7 | - |
| Lemonade | $3 | $5 | $7 | - |
| Coffee | $2 | $4 | $8 | - |
| Tea | $2 | $4 | $8 | - |
| Arabic Coffee | $2 | $4 | $8 | - |
| Arabic Tea | $2 | $4 | $8 | - |
| Brownies | - | - | - | $1 |
| Cake Pops | - | - | - | $3 |
| Baklawa | - | - | - | $1 |
| Kanafa | - | - | - | $2 |

### Flavors/Options
- **Slushies**: Blue Raspberry, Cherry, Strawberry, Mango, Watermelon, Lemon Lime
- **Lemonade add-ins**: Strawberry, Mango, Mint
- **Coffee types**: Espresso, Americano, Latte, Cappuccino, Mocha, Iced Coffee
- **Tea types**: Black Tea, Green Tea, Herbal Tea, Iced Tea
- **Cake Pop flavors**: Cookies & Cream, Chocolate, Vanilla, Strawberry, Birthday Cake
- **Baklawa flavors**: Pistachio, Walnut, Mixed Assortment
- **Kanafa flavors**: Sweet Cheese, Cream (Ashta)

## Key CSS Classes

### Layout
`.container` `.section` `.section-alt`

### Buttons
`.btn` `.btn-primary` `.btn-secondary` `.btn-accent` `.btn-outline` `.btn-ghost` `.btn-sm` `.btn-lg` `.btn-icon` `.btn-full`

### Cards
`.card` `.card-glass`

### Forms
`.input` `.select` `.textarea` `.input-group` `.form-group` `.form-row`

### Grid
`.grid` `.grid-2` `.grid-3` `.grid-4`

### Animations
`.animate-on-scroll` `.fade-in-up` `.fade-in` `.scale-in`

### Modal
`.modal-overlay` `.modal` `.modal-header` `.modal-body` `.modal-footer` `.modal-close`

### Badges
`.badge` `.badge-primary` `.badge-success` `.badge-warning` `.badge-danger`

## Admin Dashboard
- Default credentials: admin / picnic2026
- Sidebar navigation with: Dashboard, Menu, Orders, Reports, Settings
- Protected behind login gate (localStorage-based)
