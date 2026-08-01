const TAX_RATE = 0.0825;

const PICKUP_TIMES = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'
];

const DISCOUNT_CODES = {
  'PICNIC10': 0.10,
  'SUMMER20': 0.20,
  'FIRSTORDER': 0.15
};

const CATEGORIES = [
  { id: 'slushies', label: 'Slushies', type: 'drink', emoji: '🍧', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 'lemonade', label: 'Fresh Lemonade', type: 'drink', emoji: '🍋', gradient: 'linear-gradient(135deg, #f6d365, #fda085)' },
  { id: 'coffee', label: 'Coffee', type: 'drink', emoji: '☕', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
  { id: 'tea', label: 'Tea', type: 'drink', emoji: '🍵', gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)' },
  { id: 'arabic-coffee', label: 'Arabic Coffee', type: 'drink', emoji: '☕', gradient: 'linear-gradient(135deg, #c79081, #dfa579)' },
  { id: 'arabic-tea', label: 'Arabic Tea', type: 'drink', emoji: '🫖', gradient: 'linear-gradient(135deg, #f5af19, #f12711)' },
  { id: 'brownies', label: 'Brownies', type: 'dessert', emoji: '🍫', gradient: 'linear-gradient(135deg, #434343, #000000)' },
  { id: 'cake-pops', label: 'Cake Pops', type: 'dessert', emoji: '🍰', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' }
];

const MENU_ITEMS = [
  // Slushies
  {
    id: 'slushie-blue-raspberry',
    name: 'Blue Raspberry Slushie',
    category: 'slushies',
    categoryLabel: 'Slushies',
    type: 'drink',
    subtype: 'cold',
    description: 'A vibrant and refreshing sweet blue raspberry icy treat to cool you down.',
    prices: { small: 3, medium: 5, large: 7 },
    flavors: ['Blue Raspberry', 'Cherry', 'Strawberry', 'Mango', 'Watermelon', 'Lemon Lime'],
    addIns: [],
    emoji: '🍧',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    rating: 4.8,
    reviews: 210,
    soldOut: false,
    popular: true,
    featured: true
  },
  {
    id: 'slushie-cherry',
    name: 'Cherry Slushie',
    category: 'slushies',
    categoryLabel: 'Slushies',
    type: 'drink',
    subtype: 'cold',
    description: 'Classic sweet cherry flavor in a freezing cold slush format.',
    prices: { small: 3, medium: 5, large: 7 },
    flavors: ['Blue Raspberry', 'Cherry', 'Strawberry', 'Mango', 'Watermelon', 'Lemon Lime'],
    addIns: [],
    emoji: '🍧',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    rating: 4.5,
    reviews: 145,
    soldOut: false,
    popular: false,
    featured: false
  },
  
  // Lemonade
  {
    id: 'lemonade-classic',
    name: 'Classic Lemonade',
    category: 'lemonade',
    categoryLabel: 'Fresh Lemonade',
    type: 'drink',
    subtype: 'cold',
    description: 'Freshly squeezed lemons with just the right amount of sweetness.',
    prices: { small: 3, medium: 5, large: 7 },
    flavors: null,
    addIns: ['Strawberry', 'Mango', 'Mint'],
    emoji: '🍋',
    gradient: 'linear-gradient(135deg, #f6d365, #fda085)',
    rating: 4.9,
    reviews: 320,
    soldOut: false,
    popular: true,
    featured: true
  },
  {
    id: 'lemonade-strawberry',
    name: 'Strawberry Lemonade',
    category: 'lemonade',
    categoryLabel: 'Fresh Lemonade',
    type: 'drink',
    subtype: 'cold',
    description: 'Our classic lemonade infused with sweet, ripe strawberry puree.',
    prices: { small: 3, medium: 5, large: 7 },
    flavors: null,
    addIns: ['Mint'],
    emoji: '🍋',
    gradient: 'linear-gradient(135deg, #f6d365, #fda085)',
    rating: 4.7,
    reviews: 180,
    soldOut: false,
    popular: true,
    featured: false
  },

  // Coffee
  {
    id: 'coffee-iced',
    name: 'Iced Coffee',
    category: 'coffee',
    categoryLabel: 'Coffee',
    type: 'drink',
    subtype: 'cold',
    description: 'Cold brewed to perfection, served over ice for a smooth caffeine kick.',
    prices: { small: 2, medium: 4, large: 8 },
    flavors: ['Espresso', 'Americano', 'Latte', 'Cappuccino', 'Mocha', 'Iced Coffee'],
    addIns: ['Vanilla Syrup', 'Caramel', 'Oat Milk'],
    emoji: '☕',
    gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    rating: 4.6,
    reviews: 290,
    soldOut: false,
    popular: true,
    featured: false
  },
  {
    id: 'coffee-latte',
    name: 'Hot Latte',
    category: 'coffee',
    categoryLabel: 'Coffee',
    type: 'drink',
    subtype: 'hot',
    description: 'Rich espresso balanced with steamed milk and a light layer of foam.',
    prices: { small: 2, medium: 4, large: 8 },
    flavors: ['Espresso', 'Americano', 'Latte', 'Cappuccino', 'Mocha', 'Iced Coffee'],
    addIns: ['Vanilla Syrup', 'Caramel', 'Oat Milk'],
    emoji: '☕',
    gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    rating: 4.8,
    reviews: 155,
    soldOut: false,
    popular: false,
    featured: false
  },

  // Tea
  {
    id: 'tea-iced-black',
    name: 'Iced Black Tea',
    category: 'tea',
    categoryLabel: 'Tea',
    type: 'drink',
    subtype: 'cold',
    description: 'Crisp and refreshing premium black tea, served chilled.',
    prices: { small: 2, medium: 4, large: 8 },
    flavors: ['Black Tea', 'Green Tea', 'Herbal Tea', 'Iced Tea'],
    addIns: ['Lemon', 'Honey'],
    emoji: '🍵',
    gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)',
    rating: 4.5,
    reviews: 110,
    soldOut: false,
    popular: false,
    featured: false
  },

  // Arabic Coffee & Tea
  {
    id: 'arabic-coffee-traditional',
    name: 'Traditional Arabic Coffee',
    category: 'arabic-coffee',
    categoryLabel: 'Arabic Coffee',
    type: 'drink',
    subtype: 'hot',
    description: 'Lightly roasted beans simmered with cardamom and saffron.',
    prices: { small: 2, medium: 4, large: 8 },
    flavors: null,
    addIns: null,
    emoji: '☕',
    gradient: 'linear-gradient(135deg, #c79081, #dfa579)',
    rating: 4.9,
    reviews: 450,
    soldOut: false,
    popular: true,
    featured: true
  },
  {
    id: 'arabic-tea-mint',
    name: 'Mint Arabic Tea',
    category: 'arabic-tea',
    categoryLabel: 'Arabic Tea',
    type: 'drink',
    subtype: 'hot',
    description: 'Sweet black tea steeped with fresh mint leaves for a fragrant finish.',
    prices: { small: 2, medium: 4, large: 8 },
    flavors: null,
    addIns: null,
    emoji: '🫖',
    gradient: 'linear-gradient(135deg, #f5af19, #f12711)',
    rating: 4.7,
    reviews: 200,
    soldOut: false,
    popular: false,
    featured: false
  },

  // Desserts
  {
    id: 'brownie-fudge',
    name: 'Fudge Brownie',
    category: 'brownies',
    categoryLabel: 'Brownies',
    type: 'dessert',
    subtype: null,
    description: 'Decadent, rich chocolate brownie with a gooey fudge center.',
    prices: { single: 1 },
    flavors: null,
    addIns: null,
    emoji: '🍫',
    gradient: 'linear-gradient(135deg, #434343, #000000)',
    rating: 4.8,
    reviews: 340,
    soldOut: false,
    popular: true,
    featured: true
  },
  {
    id: 'cake-pop-vanilla',
    name: 'Vanilla Cake Pop',
    category: 'cake-pops',
    categoryLabel: 'Cake Pops',
    type: 'dessert',
    subtype: null,
    description: 'Moist vanilla cake coated in a crisp shell with festive sprinkles.',
    prices: { single: 4 },
    flavors: ['Chocolate', 'Vanilla', 'Strawberry', 'Birthday Cake'],
    addIns: null,
    emoji: '🍰',
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
    rating: 4.6,
    reviews: 180,
    soldOut: false,
    popular: false,
    featured: false
  }
];

const TESTIMONIALS = [
  { name: 'Sarah M.', text: 'The strawberry lemonade is the most refreshing drink ever!', rating: 5, avatar: '👩' },
  { name: 'Jason T.', text: 'Amazing fudge brownies. Could not eat just one.', rating: 5, avatar: '👨' },
  { name: 'Emily R.', text: 'Love the aesthetic and the Arabic Coffee is extremely authentic.', rating: 4, avatar: '👧' },
  { name: 'David K.', text: 'Perfect picnic spot and the slushies kept my kids happy all afternoon.', rating: 5, avatar: '👱‍♂️' },
  { name: 'Amanda L.', text: 'Cake pops were delicious and adorable.', rating: 5, avatar: '👩‍🦰' },
  { name: 'Michael B.', text: 'Super easy to order ahead online and pick up my drinks.', rating: 4, avatar: '🧔' }
];

const FAQ_ITEMS = [
  { question: 'When is the event?', answer: 'The Picnic Paradise event is taking place on August 28, 2026.' },
  { question: 'Where is it located?', answer: 'We are located at the Central Park Pavilion.' },
  { question: 'Can I order ahead?', answer: 'Yes, you can place your order online and choose a pickup time.' },
  { question: 'Do you offer vegan options?', answer: 'Many of our drinks and slushies are vegan-friendly. Our desserts currently contain dairy.' },
  { question: 'What payment methods are accepted?', answer: 'We accept all major credit cards, Apple Pay, and Google Pay through our secure checkout.' },
  { question: 'Is there a seating area?', answer: 'Yes! We have plenty of picnic tables and shaded spots to enjoy your drinks.' },
  { question: 'Can I modify my order?', answer: 'Orders can be modified up to 30 minutes before your scheduled pickup time.' },
  { question: 'Are pets allowed?', answer: 'Yes, the Central Park Pavilion area is pet-friendly. We even have water bowls!' }
];

window.TAX_RATE = TAX_RATE;
window.PICKUP_TIMES = PICKUP_TIMES;
window.DISCOUNT_CODES = DISCOUNT_CODES;
window.CATEGORIES = CATEGORIES;
window.MENU_ITEMS = MENU_ITEMS;
window.TESTIMONIALS = TESTIMONIALS;
window.FAQ_ITEMS = FAQ_ITEMS;
