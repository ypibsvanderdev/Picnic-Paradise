const TAX_RATE = 0.0825;

const PICKUP_TIMES = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'
];

const DISCOUNT_CODES = {
  'SUGAR10': 0.10,
  'PRINT20': 0.20,
  'FIRSTORDER': 0.15,
  'TEST99': 0.9999,
  'ADMIN99': 0.9999
};

const CATEGORIES = [
  { id: 'all', label: 'All Items', type: 'all', emoji: '✨', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 'fidgets', label: 'Fidgets & Squishies', type: 'fidgets', emoji: '🫧', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
  { id: '3d-prints', label: '3D Prints & Models', type: '3d-prints', emoji: '🖨️', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { id: 'novelties', label: 'Novelties & Desk Toys', type: 'novelties', emoji: '🎁', gradient: 'linear-gradient(135deg, #f6d365, #fda085)' },
  { id: 'sweets', label: 'Sweet Treats', type: 'sweets', emoji: '🍭', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' }
];

const MENU_ITEMS = [
  {
    id: 'item-purple-mattress',
    name: 'Mini Purple Mattress Fidget',
    category: 'fidgets',
    categoryLabel: 'Fidgets & Squishies',
    type: 'fidgets',
    subtype: null,
    description: 'Authentic miniature purple mattress grid sample with built-in pillow. Ultra-satisfying squish, stretch, and sensory fidget toy!',
    prices: { single: 8 },
    stock: 1,
    flavors: null,
    addIns: null,
    image: 'assets/images/purple-mattress.png',
    emoji: '🛏️',
    gradient: 'linear-gradient(135deg, #7F00FF, #E100FF)',
    rating: 5.0,
    reviews: 18,
    soldOut: false,
    popular: true,
    featured: true
  },
  {
    id: 'item-needoh-classic',
    name: 'NeeDoh Classic Groovy Glob',
    category: 'fidgets',
    categoryLabel: 'Fidgets & Squishies',
    type: 'fidgets',
    subtype: null,
    description: 'The super squishy, soothing stress ball that always bounces back! Filled with a super-soft dough-like compound.',
    prices: { single: 4.5 },
    stock: 1,
    flavors: ['Groovy Pink', 'Electric Blue', 'Vibrant Purple', 'Neon Green', 'Sunset Orange'],
    addIns: null,
    image: '',
    emoji: '🟢',
    gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
    rating: 4.9,
    reviews: 52,
    soldOut: false,
    popular: true,
    featured: true
  },
  {
    id: 'item-needoh-nice-berg',
    name: 'NeeDoh Nice Berg (Crystal Iceberg)',
    category: 'fidgets',
    categoryLabel: 'Fidgets & Squishies',
    type: 'fidgets',
    subtype: null,
    description: 'Crystal-clear translucent iceberg shaped squeeze block. Firm satisfying resistance that slowly returns to its geometric shape.',
    prices: { single: 6 },
    stock: 1,
    flavors: ['Crystal Clear', 'Glacier Blue', 'Arctic Pink'],
    addIns: null,
    image: '',
    emoji: '🧊',
    gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)',
    rating: 5.0,
    reviews: 41,
    soldOut: false,
    popular: true,
    featured: true
  }
];

const TESTIMONIALS = [
  { name: 'Sarah M.', text: 'The Mini Purple Mattress is the most satisfying fidget I have ever owned! High quality and super squishy.', rating: 5, avatar: '👩' },
  { name: 'Jason T.', text: 'My NeeDoh Nice Berg arrived quickly and feels amazing. Perfect desk toy for focus!', rating: 5, avatar: '👨' },
  { name: 'Emily R.', text: 'The Sugar Printer has the best custom novelties and prints. Super easy checkout!', rating: 5, avatar: '👧' },
  { name: 'David K.', text: 'Awesome customer service and real-time inventory updates. 10/10 recommend!', rating: 5, avatar: '👱‍♂️' }
];

const FAQ_ITEMS = [
  { question: 'What is The Sugar Printer?', answer: 'The Sugar Printer is your go-to shop for unique 3D printed creations, authentic sensory fidgets, squishies, and sweet novelties!' },
  { question: 'How does stock and availability work?', answer: 'Our stock is tracked in real-time. If an item shows in stock, it is ready for fast pickup or shipping!' },
  { question: 'Can I request custom 3D prints?', answer: 'Yes! You can contact us with your 3D design files or custom novelty requests.' },
  { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, Apple Pay, Google Pay, and online payments.' },
  { question: 'Where are pickups located?', answer: 'You can choose your pickup time slot during checkout or select delivery.' }
];

window.TAX_RATE = TAX_RATE;
window.PICKUP_TIMES = PICKUP_TIMES;
window.DISCOUNT_CODES = DISCOUNT_CODES;
window.CATEGORIES = CATEGORIES;
window.MENU_ITEMS = MENU_ITEMS;
window.TESTIMONIALS = TESTIMONIALS;
window.FAQ_ITEMS = FAQ_ITEMS;
