import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 14 Core Quick-Commerce Categories
export const GROCERY_CATEGORIES = [
  { id: 'fruits', name: 'Fruits', description: 'Fresh seasonal and imported fruits', icon: 'Apple' },
  { id: 'vegetables', name: 'Vegetables', description: 'Fresh farm vegetables, leafy greens and herbs', icon: 'Carrot' },
  { id: 'dairy-bakery', name: 'Dairy & Bakery', description: 'Milk, butter, paneer, curd, cheese and fresh bread', icon: 'Milk' },
  { id: 'rice-atta-grains', name: 'Rice, Atta & Grains', description: 'Chakki atta, basmati rice, poha, sooji and millets', icon: 'Wheat' },
  { id: 'pulses-lentils', name: 'Pulses & Lentils', description: 'Unpolished toor, moong, chana, urad dal and rajma', icon: 'CircleDot' },
  { id: 'spices-masalas', name: 'Spices & Masalas', description: 'Pure ground spices, whole spices and blended masalas', icon: 'Flame' },
  { id: 'oil-ghee', name: 'Oil & Ghee', description: 'Desi cow ghee, mustard oil, sunflower and groundnut oil', icon: 'Droplets' },
  { id: 'snacks-biscuits', name: 'Snacks & Biscuits', description: 'Khakhra, bhujia, sev, namkeen, cookies and chips', icon: 'Cookie' },
  { id: 'beverages', name: 'Beverages', description: 'Premium CTC tea, roasted coffee, juices and syrups', icon: 'Coffee' },
  { id: 'breakfast-cereals', name: 'Breakfast & Cereals', description: 'Cornflakes, oats, instant poha, idli and dosa mixes', icon: 'Sun' },
  { id: 'frozen-packaged-foods', name: 'Frozen & Packaged Foods', description: 'Ready-to-cook snacks, frozen peas, noodles and sauces', icon: 'Snowflake' },
  { id: 'personal-care', name: 'Personal Care', description: 'Bathing soaps, oral care, shampoos, oils and creams', icon: 'Sparkles' },
  { id: 'household-cleaning', name: 'Household Cleaning', description: 'Detergents, dishwash liquids, floor and toilet cleaners', icon: 'SprayCan' },
  { id: 'baby-care', name: 'Baby Care', description: 'Diaper pants, gentle baby soaps, wipes and baby powder', icon: 'Heart' }
];

export const RAW_PRODUCTS_CATALOG = [
  // --- 1. FRUITS ---
  {
    title: 'Fresh Alphonso Mangoes (Hapus)',
    brand: 'Farm Fresh',
    category: 'Fruits',
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=400&q=80',
    description: 'Naturally ripened, sweet and aromatic Ratnagiri Alphonso mangoes.',
    tags: ['Seasonal', 'Sweet', 'Fruit'],
    variants: [
      { sku: 'FF-MNG-ALPH-1KG', title: 'Alphonso Mangoes, 1 kg (~3-4 pcs)', packQuantity: 1000, packUnit: 'g', mrpInr: 450, sellingPriceInr: 399 }
    ]
  },
  {
    title: 'Fresh Robusta Bananas (Kela)',
    brand: 'Farm Fresh',
    category: 'Fruits',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80',
    description: 'Energy-rich premium Robusta bananas, perfectly ripe and sweet.',
    tags: ['Daily Essential', 'Potassium', 'Fruit'],
    variants: [
      { sku: 'FF-BAN-ROB-1KG', title: 'Robusta Bananas, 1 kg (~6-8 pcs)', packQuantity: 1000, packUnit: 'g', mrpInr: 60, sellingPriceInr: 49 },
      { sku: 'FF-BAN-ROB-500G', title: 'Robusta Bananas, 500g (~3-4 pcs)', packQuantity: 500, packUnit: 'g', mrpInr: 35, sellingPriceInr: 28 }
    ]
  },
  {
    title: 'Shimla Royal Delicious Apples',
    brand: 'Farm Fresh',
    category: 'Fruits',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
    description: 'Crisp, juicy and sweet Shimla apples packed with dietary fiber.',
    tags: ['Crisp', 'Vitamin C', 'Fruit'],
    variants: [
      { sku: 'FF-APP-SHIM-4PCS', title: 'Shimla Royal Apples, 4 pcs (~600g)', packQuantity: 600, packUnit: 'g', mrpInr: 160, sellingPriceInr: 135 }
    ]
  },
  {
    title: 'Nagpur Sweet Oranges (Santra)',
    brand: 'Farm Fresh',
    category: 'Fruits',
    imageUrl: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=400&q=80',
    description: 'Juicy Nagpur oranges with tangy-sweet citrus burst.',
    tags: ['Citrus', 'Vitamin C', 'Fruit'],
    variants: [
      { sku: 'FF-ORG-NAG-1KG', title: 'Nagpur Oranges, 1 kg (~4-5 pcs)', packQuantity: 1000, packUnit: 'g', mrpInr: 110, sellingPriceInr: 89 }
    ]
  },
  {
    title: 'Fresh Ruby Red Pomegranate (Anar)',
    brand: 'Farm Fresh',
    category: 'Fruits',
    imageUrl: 'https://images.unsplash.com/photo-1541344999736-83eca872f241?auto=format&fit=crop&w=400&q=80',
    description: 'Plump ruby red pearls rich in antioxidants and iron.',
    tags: ['Antioxidant', 'Iron Rich', 'Fruit'],
    variants: [
      { sku: 'FF-POM-RED-4PCS', title: 'Ruby Pomegranate, 4 pcs (~800g)', packQuantity: 800, packUnit: 'g', mrpInr: 180, sellingPriceInr: 155 }
    ]
  },
  {
    title: 'Juicy Sweet Lime (Mosambi)',
    brand: 'Farm Fresh',
    category: 'Fruits',
    imageUrl: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=400&q=80',
    description: 'Fresh Indian sweet lime, ideal for cold-pressed juices.',
    tags: ['Hydrating', 'Juice', 'Fruit'],
    variants: [
      { sku: 'FF-MOS-1KG', title: 'Fresh Mosambi, 1 kg (~5-6 pcs)', packQuantity: 1000, packUnit: 'g', mrpInr: 90, sellingPriceInr: 75 }
    ]
  },
  {
    title: 'Fresh Seedless Green Grapes (Angoor)',
    brand: 'Farm Fresh',
    category: 'Fruits',
    imageUrl: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=400&q=80',
    description: 'Crisp and sweet seedless green grapes from Nashik vineyards.',
    tags: ['Seedless', 'Snack', 'Fruit'],
    variants: [
      { sku: 'FF-GRP-GRN-500G', title: 'Seedless Green Grapes, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 85, sellingPriceInr: 69 }
    ]
  },
  {
    title: 'Fresh Sweet Papaya (Papita)',
    brand: 'Farm Fresh',
    category: 'Fruits',
    imageUrl: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=400&q=80',
    description: 'Rich orange-fleshed sweet papaya, excellent for digestion.',
    tags: ['Digestive', 'Vitamin A', 'Fruit'],
    variants: [
      { sku: 'FF-PAP-1PC', title: 'Semi-Ripe Sweet Papaya, 1 pc (~1 kg)', packQuantity: 1000, packUnit: 'g', mrpInr: 70, sellingPriceInr: 55 }
    ]
  },

  // --- 2. VEGETABLES ---
  {
    title: 'Fresh Country Desi Tomato (Tamatar)',
    brand: 'Farm Fresh',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
    description: 'Tangy and firm desi tomatoes essential for Indian curries and rasam.',
    tags: ['Daily Essential', 'Curry Base', 'Vegetable'],
    variants: [
      { sku: 'FF-TOM-DESI-1KG', title: 'Desi Country Tomato, 1 kg', packQuantity: 1000, packUnit: 'g', mrpInr: 45, sellingPriceInr: 36 },
      { sku: 'FF-TOM-DESI-500G', title: 'Desi Country Tomato, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 25, sellingPriceInr: 19 }
    ]
  },
  {
    title: 'Fresh Nashik Red Onion (Pyaz)',
    brand: 'Farm Fresh',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80',
    description: 'Pungent and crisp Nashik red onions for everyday tadka.',
    tags: ['Daily Essential', 'Pungent', 'Vegetable'],
    variants: [
      { sku: 'FF-ONI-RED-1KG', title: 'Nashik Red Onion, 1 kg', packQuantity: 1000, packUnit: 'g', mrpInr: 50, sellingPriceInr: 39 },
      { sku: 'FF-ONI-RED-2KG', title: 'Nashik Red Onion, 2 kg Pack', packQuantity: 2000, packUnit: 'g', mrpInr: 95, sellingPriceInr: 75 }
    ]
  },
  {
    title: 'Fresh Agra New Crop Potatoes (Aloo)',
    brand: 'Farm Fresh',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80',
    description: 'Thin-skinned earthy potatoes, perfect for boiling, roasting and curries.',
    tags: ['Daily Essential', 'Versatile', 'Vegetable'],
    variants: [
      { sku: 'FF-POT-AGRA-1KG', title: 'Agra Golden Potatoes, 1 kg', packQuantity: 1000, packUnit: 'g', mrpInr: 38, sellingPriceInr: 29 },
      { sku: 'FF-POT-AGRA-2KG', title: 'Agra Golden Potatoes, 2 kg Pack', packQuantity: 2000, packUnit: 'g', mrpInr: 75, sellingPriceInr: 56 }
    ]
  },
  {
    title: 'Fresh Tender Ladyfinger (Bhindi)',
    brand: 'Farm Fresh',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&w=400&q=80',
    description: 'Tender, bright green bhindi ideal for bhindi masala and crispy kurkuri bhindi.',
    tags: ['Tender', 'Homestyle', 'Vegetable'],
    variants: [
      { sku: 'FF-BHN-500G', title: 'Fresh Tender Bhindi, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 45, sellingPriceInr: 35 }
    ]
  },
  {
    title: 'Fresh Clean Cauliflower (Gobi)',
    brand: 'Farm Fresh',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=400&q=80',
    description: 'Tight white florets, pesticide-checked and cleaned.',
    tags: ['Winter Special', 'Gobi', 'Vegetable'],
    variants: [
      { sku: 'FF-GOB-1PC', title: 'Clean Cauliflower Head, 1 pc (~500g)', packQuantity: 500, packUnit: 'g', mrpInr: 40, sellingPriceInr: 32 }
    ]
  },
  {
    title: 'Fresh Purple Bharta Baingan (Eggplant)',
    brand: 'Farm Fresh',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1628773822503-930a84e27f2f?auto=format&fit=crop&w=400&q=80',
    description: 'Round purple eggplants with soft flesh, ideal for roasting for Baingan Bharta.',
    tags: ['Smoked', 'Bharta', 'Vegetable'],
    variants: [
      { sku: 'FF-BNG-BHR-500G', title: 'Bharta Baingan, 500g (1-2 pcs)', packQuantity: 500, packUnit: 'g', mrpInr: 40, sellingPriceInr: 30 }
    ]
  },
  {
    title: 'Hydroponic Clean Palak (Spinach)',
    brand: 'Farm Fresh',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80',
    description: 'Cleaned tender green spinach leaves for palak paneer and dal palak.',
    tags: ['Iron', 'Leafy Green', 'Vegetable'],
    variants: [
      { sku: 'FF-PLK-250G', title: 'Hydroponic Washed Palak, 250g Bunch', packQuantity: 250, packUnit: 'g', mrpInr: 35, sellingPriceInr: 26 }
    ]
  },
  {
    title: 'Fresh Ginger (Adrak)',
    brand: 'Farm Fresh',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80',
    description: 'Pungent, washed fresh ginger roots for masala chai and cooking pastes.',
    tags: ['Aromatic', 'Ginger', 'Vegetable'],
    variants: [
      { sku: 'FF-GIN-200G', title: 'Fresh Washed Ginger, 200g', packQuantity: 200, packUnit: 'g', mrpInr: 40, sellingPriceInr: 32 }
    ]
  },
  {
    title: 'Fresh MP Garlic (Lahsun)',
    brand: 'Farm Fresh',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=400&q=80',
    description: 'Aromatic garlic bulbs with high pungency and distinct flavor.',
    tags: ['Pungent', 'Garlic', 'Vegetable'],
    variants: [
      { sku: 'FF-GAR-200G', title: 'Madhya Pradesh Garlic, 200g', packQuantity: 200, packUnit: 'g', mrpInr: 65, sellingPriceInr: 52 }
    ]
  },
  {
    title: 'Fresh Dark Green Chillies (Hari Mirch)',
    brand: 'Farm Fresh',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=400&q=80',
    description: 'Spicy and crisp dark green chillies for daily tadka and chutney.',
    tags: ['Spicy', 'Tadka', 'Vegetable'],
    variants: [
      { sku: 'FF-CHL-100G', title: 'Spicy Green Chillies, 100g', packQuantity: 100, packUnit: 'g', mrpInr: 18, sellingPriceInr: 12 }
    ]
  },
  {
    title: 'Fresh Surti Papdi Beans (Valor)',
    brand: 'Farm Fresh',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=400&q=80',
    description: 'Authentic tender Surti Papdi flat beans, essential for Gujarati Undhiyu.',
    tags: ['Gujarati', 'Undhiyu Special', 'Winter'],
    variants: [
      { sku: 'FF-SUR-PAP-500G', title: 'Surti Papdi Flat Beans, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 60, sellingPriceInr: 48 }
    ]
  },
  {
    title: 'Fresh Green Tuver Lilva (Pigeon Pea Pods)',
    brand: 'Farm Fresh',
    category: 'Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=400&q=80',
    description: 'Fresh seasonal green tuver pods for Gujarati kachori, muthia and undhiyu.',
    tags: ['Gujarati', 'Seasonal', 'Tuver'],
    variants: [
      { sku: 'FF-TUV-LIL-250G', title: 'Shelled Green Tuver Lilva, 250g', packQuantity: 250, packUnit: 'g', mrpInr: 55, sellingPriceInr: 45 }
    ]
  },

  // --- 3. DAIRY & BAKERY ---
  {
    title: 'Amul Taaza Homogenised Toned Milk',
    brand: 'Amul',
    category: 'Dairy & Bakery',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    description: 'Pure, fresh and nutritious pasteurized toned milk from Amul.',
    tags: ['Daily Essential', 'Milk', 'Dairy'],
    variants: [
      { sku: 'AMUL-TZ-500ML', title: 'Amul Taaza Milk Pouch, 500ml', packQuantity: 500, packUnit: 'ml', mrpInr: 29, sellingPriceInr: 29 },
      { sku: 'AMUL-TZ-1L', title: 'Amul Taaza Milk Tetra Pak, 1L', packQuantity: 1000, packUnit: 'ml', mrpInr: 74, sellingPriceInr: 72 }
    ]
  },
  {
    title: 'Amul Fresh Malai Paneer',
    brand: 'Amul',
    category: 'Dairy & Bakery',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80',
    description: 'Soft, creamy and rich protein-packed Malai Paneer made from pure cow milk.',
    tags: ['High Protein', 'Paneer', 'Dairy'],
    variants: [
      { sku: 'AMUL-PAN-200G', title: 'Amul Fresh Malai Paneer, 200g', packQuantity: 200, packUnit: 'g', mrpInr: 95, sellingPriceInr: 89 },
      { sku: 'AMUL-PAN-500G', title: 'Amul Fresh Malai Paneer, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 230, sellingPriceInr: 215 }
    ]
  },
  {
    title: 'Amul Pasteurized Table Butter',
    brand: 'Amul',
    category: 'Dairy & Bakery',
    imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80',
    description: 'Utterly butterly delicious salted table butter loved across India.',
    tags: ['Butter', 'Breakfast', 'Dairy'],
    variants: [
      { sku: 'AMUL-BUT-100G', title: 'Amul Salted Table Butter, 100g', packQuantity: 100, packUnit: 'g', mrpInr: 60, sellingPriceInr: 58 },
      { sku: 'AMUL-BUT-500G', title: 'Amul Salted Table Butter, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 285, sellingPriceInr: 275 }
    ]
  },
  {
    title: 'Mother Dairy Classic Dahi (Curd)',
    brand: 'Mother Dairy',
    category: 'Dairy & Bakery',
    imageUrl: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=400&q=80',
    description: 'Thick, creamy and traditionally set curd rich in natural probiotics.',
    tags: ['Probiotic', 'Curd', 'Dairy'],
    variants: [
      { sku: 'MD-DAHI-400G', title: 'Mother Dairy Set Curd Tub, 400g', packQuantity: 400, packUnit: 'g', mrpInr: 40, sellingPriceInr: 38 }
    ]
  },
  {
    title: 'Amul Masti Spiced Buttermilk (Chhaas)',
    brand: 'Amul',
    category: 'Dairy & Bakery',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    description: 'Refreshing spiced chaas with roasted jeera and mint notes.',
    tags: ['Gujarati', 'Refreshing', 'Probiotic'],
    variants: [
      { sku: 'AMUL-CHAAS-500ML', title: 'Amul Masti Spiced Chaas Tetra, 500ml', packQuantity: 500, packUnit: 'ml', mrpInr: 20, sellingPriceInr: 18 }
    ]
  },
  {
    title: 'Modern 100% Whole Wheat Bread',
    brand: 'Modern',
    category: 'Dairy & Bakery',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    description: 'Soft and healthy whole wheat brown bread with zero maida.',
    tags: ['Whole Wheat', 'Breakfast', 'Bakery'],
    variants: [
      { sku: 'MOD-BREAD-400G', title: 'Modern 100% Whole Wheat Bread, 400g', packQuantity: 400, packUnit: 'g', mrpInr: 50, sellingPriceInr: 45 }
    ]
  },
  {
    title: 'Amul Processed Cheese Slices',
    brand: 'Amul',
    category: 'Dairy & Bakery',
    imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=400&q=80',
    description: 'Classic rich cheese slices, perfect for breakfast sandwiches and parathas.',
    tags: ['Cheese', 'Sandwich', 'Dairy'],
    variants: [
      { sku: 'AMUL-CHS-200G', title: 'Amul Cheese Slices (10 Slices), 200g', packQuantity: 200, packUnit: 'g', mrpInr: 145, sellingPriceInr: 135 }
    ]
  },

  // --- 4. RICE, ATTA & GRAINS ---
  {
    title: 'Aashirvaad Superior MP Shudh Chakki Atta',
    brand: 'Aashirvaad',
    category: 'Rice, Atta & Grains',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    description: '100% pure whole wheat stone-ground chakki flour that makes soft rotis.',
    tags: ['Daily Essential', 'Whole Wheat', 'Atta'],
    variants: [
      { sku: 'AASH-ATTA-5KG', title: 'Aashirvaad Shudh Chakki Atta, 5 kg', packQuantity: 5000, packUnit: 'g', mrpInr: 285, sellingPriceInr: 265 },
      { sku: 'AASH-ATTA-1KG', title: 'Aashirvaad Shudh Chakki Atta, 1 kg', packQuantity: 1000, packUnit: 'g', mrpInr: 72, sellingPriceInr: 68 },
      { sku: 'AASH-ATTA-10KG', title: 'Aashirvaad Shudh Chakki Atta, 10 kg', packQuantity: 10000, packUnit: 'g', mrpInr: 540, sellingPriceInr: 499 }
    ]
  },
  {
    title: 'India Gate Super Basmati Rice',
    brand: 'India Gate',
    category: 'Rice, Atta & Grains',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    description: 'Aged long-grain basmati rice with royal aroma and slender fluffy grains.',
    tags: ['Aged', 'Basmati', 'Biryani Special'],
    variants: [
      { sku: 'IG-BASM-1KG', title: 'India Gate Super Basmati Rice, 1 kg', packQuantity: 1000, packUnit: 'g', mrpInr: 195, sellingPriceInr: 165 },
      { sku: 'IG-BASM-5KG', title: 'India Gate Super Basmati Rice, 5 kg', packQuantity: 5000, packUnit: 'g', mrpInr: 920, sellingPriceInr: 799 }
    ]
  },
  {
    title: 'Daawat Rozana Super Basmati Rice',
    brand: 'Daawat',
    category: 'Rice, Atta & Grains',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    description: 'High-yield everyday basmati rice suitable for dal chawal and pulav.',
    tags: ['Everyday', 'Basmati', 'Rice'],
    variants: [
      { sku: 'DAAW-ROZ-1KG', title: 'Daawat Rozana Super Basmati, 1 kg', packQuantity: 1000, packUnit: 'g', mrpInr: 125, sellingPriceInr: 105 },
      { sku: 'DAAW-ROZ-5KG', title: 'Daawat Rozana Super Basmati, 5 kg', packQuantity: 5000, packUnit: 'g', mrpInr: 580, sellingPriceInr: 499 }
    ]
  },
  {
    title: 'Fortune Desi Bajra (Pearl Millet) Flour',
    brand: 'Fortune',
    category: 'Rice, Atta & Grains',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    description: 'Wholesome gluten-free Bajra flour, ideal for winter Bajra na Rotla.',
    tags: ['Gujarati', 'Gluten Free', 'Millet'],
    variants: [
      { sku: 'FORT-BAJ-1KG', title: 'Fortune Desi Bajra Flour, 1 kg', packQuantity: 1000, packUnit: 'g', mrpInr: 65, sellingPriceInr: 55 }
    ]
  },
  {
    title: 'Tata Sampann Roasted Sooji / Rava',
    brand: 'Tata Sampann',
    category: 'Rice, Atta & Grains',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    description: 'Granular roasted semolina for quick upma, halwa and rava dosa.',
    tags: ['Breakfast', 'Rava', 'Grain'],
    variants: [
      { sku: 'TATA-SOOJ-500G', title: 'Tata Sampann Roasted Sooji, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 42, sellingPriceInr: 36 }
    ]
  },
  {
    title: 'Tata Sampann Thick Poha (Flattened Rice)',
    brand: 'Tata Sampann',
    category: 'Rice, Atta & Grains',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    description: 'Thick, unpolished rice flakes that make fluffy Kanda Batata Poha.',
    tags: ['Breakfast', 'Poha', 'Grain'],
    variants: [
      { sku: 'TATA-POHA-500G', title: 'Tata Sampann Thick Poha, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 45, sellingPriceInr: 38 }
    ]
  },

  // --- 5. PULSES & LENTILS ---
  {
    title: 'Tata Sampann Unpolished Toor (Arhar) Dal',
    brand: 'Tata Sampann',
    category: 'Pulses & Lentils',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80',
    description: 'Naturally nutritious unpolished Toor Dal without artificial polishing or moisture.',
    tags: ['High Protein', 'Unpolished', 'Dal'],
    variants: [
      { sku: 'TATA-TOOR-1KG', title: 'Tata Sampann Toor Dal, 1 kg', packQuantity: 1000, packUnit: 'g', mrpInr: 195, sellingPriceInr: 172 },
      { sku: 'TATA-TOOR-500G', title: 'Tata Sampann Toor Dal, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 105, sellingPriceInr: 92 }
    ]
  },
  {
    title: 'Tata Sampann Unpolished Yellow Moong Dal',
    brand: 'Tata Sampann',
    category: 'Pulses & Lentils',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80',
    description: 'Light on the stomach, quick-cooking split yellow moong dal.',
    tags: ['Easy Digest', 'Moong Dal', 'Pulse'],
    variants: [
      { sku: 'TATA-MNG-1KG', title: 'Tata Sampann Moong Dal, 1 kg', packQuantity: 1000, packUnit: 'g', mrpInr: 170, sellingPriceInr: 148 }
    ]
  },
  {
    title: 'Tata Sampann Unpolished Chana Dal',
    brand: 'Tata Sampann',
    category: 'Pulses & Lentils',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80',
    description: 'Rich in dietary fiber and protein, perfect for dal tadka and Gujarati handvo.',
    tags: ['Gujarati', 'Handvo', 'High Fiber'],
    variants: [
      { sku: 'TATA-CHANA-1KG', title: 'Tata Sampann Chana Dal, 1 kg', packQuantity: 1000, packUnit: 'g', mrpInr: 140, sellingPriceInr: 122 }
    ]
  },
  {
    title: 'Tata Sampann White Kabuli Chana (Chickpeas)',
    brand: 'Tata Sampann',
    category: 'Pulses & Lentils',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80',
    description: 'Large grain white chickpeas that cook soft and creamy for Punjabi Chhole.',
    tags: ['Punjabi Chhole', 'High Protein', 'Pulse'],
    variants: [
      { sku: 'TATA-KAB-1KG', title: 'Tata Sampann Kabuli Chana, 1 kg', packQuantity: 1000, packUnit: 'g', mrpInr: 185, sellingPriceInr: 160 },
      { sku: 'TATA-KAB-500G', title: 'Tata Sampann Kabuli Chana, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 98, sellingPriceInr: 85 }
    ]
  },
  {
    title: 'Tata Sampann Kashmiri Rajma (Kidney Beans)',
    brand: 'Tata Sampann',
    category: 'Pulses & Lentils',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80',
    description: 'Deep red Kashmiri rajma that cooks into thick homestyle gravy.',
    tags: ['Rajma Chawal', 'North Indian', 'Pulse'],
    variants: [
      { sku: 'TATA-RAJM-500G', title: 'Tata Sampann Kashmiri Rajma, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 110, sellingPriceInr: 96 }
    ]
  },
  {
    title: 'Fortune Pure Besan (Gram Flour)',
    brand: 'Fortune',
    category: 'Pulses & Lentils',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    description: 'Fine milled gram flour from pure chana dal for dhokla, pakodas and kadhi.',
    tags: ['Gujarati', 'Dhokla Special', 'Besan'],
    variants: [
      { sku: 'FORT-BES-1KG', title: 'Fortune Pure Besan, 1 kg', packQuantity: 1000, packUnit: 'g', mrpInr: 110, sellingPriceInr: 95 },
      { sku: 'FORT-BES-500G', title: 'Fortune Pure Besan, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 60, sellingPriceInr: 52 }
    ]
  },

  // --- 6. SPICES & MASALAS ---
  {
    title: 'Everest Turmeric (Haldi) Powder',
    brand: 'Everest',
    category: 'Spices & Masalas',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80',
    description: 'High curcumin golden turmeric powder made from Salem rhizomes.',
    tags: ['Curcumin', 'Daily Essential', 'Spice'],
    variants: [
      { sku: 'EVE-HALDI-200G', title: 'Everest Turmeric Powder, 200g', packQuantity: 200, packUnit: 'g', mrpInr: 58, sellingPriceInr: 49 },
      { sku: 'EVE-HALDI-500G', title: 'Everest Turmeric Powder, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 135, sellingPriceInr: 118 }
    ]
  },
  {
    title: 'MDH Deggi Mirch (Kashmiri Red Chilli Powder)',
    brand: 'MDH',
    category: 'Spices & Masalas',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
    description: 'Vibrant natural red color with gentle warmth for rich curry gravies.',
    tags: ['Color', 'Kashmiri', 'Spice'],
    variants: [
      { sku: 'MDH-DEGG-100G', title: 'MDH Deggi Mirch Powder, 100g', packQuantity: 100, packUnit: 'g', mrpInr: 85, sellingPriceInr: 76 }
    ]
  },
  {
    title: 'Everest Coriander (Dhania) Powder',
    brand: 'Everest',
    category: 'Spices & Masalas',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
    description: 'Freshly ground aromatic coriander powder that thickens gravies.',
    tags: ['Aromatic', 'Dhania', 'Spice'],
    variants: [
      { sku: 'EVE-DHAN-200G', title: 'Everest Coriander Powder, 200g', packQuantity: 200, packUnit: 'g', mrpInr: 55, sellingPriceInr: 46 }
    ]
  },
  {
    title: 'Everest Royal Garam Masala',
    brand: 'Everest',
    category: 'Spices & Masalas',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
    description: 'Master blend of 13 roasted whole spices for finishing Indian curries.',
    tags: ['Warm Blend', 'Finishing', 'Masala'],
    variants: [
      { sku: 'EVE-GAR-100G', title: 'Everest Royal Garam Masala, 100g', packQuantity: 100, packUnit: 'g', mrpInr: 92, sellingPriceInr: 82 }
    ]
  },
  {
    title: 'Everest Pav Bhaji Masala',
    brand: 'Everest',
    category: 'Spices & Masalas',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
    description: 'Iconic Mumbai street-style pav bhaji masala blend.',
    tags: ['Street Food', 'Pav Bhaji', 'Masala'],
    variants: [
      { sku: 'EVE-PAV-100G', title: 'Everest Pav Bhaji Masala, 100g', packQuantity: 100, packUnit: 'g', mrpInr: 78, sellingPriceInr: 68 }
    ]
  },
  {
    title: 'Tata Salt Vacuum Evaporated Iodized Salt',
    brand: 'Tata Salt',
    category: 'Spices & Masalas',
    imageUrl: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=400&q=80',
    description: 'Desh ka Namak. Pure vacuum evaporated iodized table salt.',
    tags: ['Daily Essential', 'Iodized', 'Salt'],
    variants: [
      { sku: 'TATA-SALT-1KG', title: 'Tata Salt Iodized Salt, 1 kg', packQuantity: 1000, packUnit: 'g', mrpInr: 28, sellingPriceInr: 25 }
    ]
  },
  {
    title: 'LG Compounded Asafoetida (Hing) Powder',
    brand: 'LG',
    category: 'Spices & Masalas',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
    description: 'Aromatic digestive hing for tempering dals, kadhi and sabjis.',
    tags: ['Digestive', 'Jain Essential', 'Spice'],
    variants: [
      { sku: 'LG-HING-50G', title: 'LG Compounded Hing Powder, 50g Tub', packQuantity: 50, packUnit: 'g', mrpInr: 65, sellingPriceInr: 58 }
    ]
  },

  // --- 7. OIL & GHEE ---
  {
    title: 'Amul Pure Cow Ghee',
    brand: 'Amul',
    category: 'Oil & Ghee',
    imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=80',
    description: 'Golden, granular and fragrant pure cow ghee for rotis, dal and sweets.',
    tags: ['Pure Desi Ghee', 'Ayurvedic', 'Dairy'],
    variants: [
      { sku: 'AMUL-GHEE-500ML', title: 'Amul Pure Cow Ghee Tin, 500ml', packQuantity: 500, packUnit: 'g', mrpInr: 340, sellingPriceInr: 320 },
      { sku: 'AMUL-GHEE-1L', title: 'Amul Pure Cow Ghee Tin, 1L', packQuantity: 1000, packUnit: 'g', mrpInr: 660, sellingPriceInr: 625 }
    ]
  },
  {
    title: 'Fortune Sunlite Refined Sunflower Oil',
    brand: 'Fortune',
    category: 'Oil & Ghee',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
    description: 'Light, clear and heart-friendly sunflower oil enriched with Vitamin A & D.',
    tags: ['Heart Friendly', 'Light Oil', 'Cooking Oil'],
    variants: [
      { sku: 'FORT-SUN-1L', title: 'Fortune Sunflower Oil Pouch, 1L', packQuantity: 1000, packUnit: 'ml', mrpInr: 155, sellingPriceInr: 139 },
      { sku: 'FORT-SUN-5L', title: 'Fortune Sunflower Oil Can, 5L', packQuantity: 5000, packUnit: 'ml', mrpInr: 780, sellingPriceInr: 699 }
    ]
  },
  {
    title: 'Dhara Filtered Groundnut Oil (Sing Tel)',
    brand: 'Dhara',
    category: 'Oil & Ghee',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
    description: 'Traditional Gujarati groundnut oil with natural nutty aroma and high smoke point.',
    tags: ['Gujarati Favorite', 'Sing Tel', 'Peanut Oil'],
    variants: [
      { sku: 'DHARA-GND-1L', title: 'Dhara Filtered Groundnut Oil, 1L Pouch', packQuantity: 1000, packUnit: 'ml', mrpInr: 195, sellingPriceInr: 179 },
      { sku: 'DHARA-GND-5L', title: 'Dhara Groundnut Oil Jar, 5L', packQuantity: 5000, packUnit: 'ml', mrpInr: 960, sellingPriceInr: 885 }
    ]
  },
  {
    title: 'Fortune Kachi Ghani Pure Mustard Oil (Sarson Tel)',
    brand: 'Fortune',
    category: 'Oil & Ghee',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
    description: 'Cold-pressed strong pungent mustard oil for authentic North Indian dishes and pickles.',
    tags: ['Pungent', 'Kachi Ghani', 'North Indian'],
    variants: [
      { sku: 'FORT-MUS-1L', title: 'Fortune Kachi Ghani Mustard Oil, 1L', packQuantity: 1000, packUnit: 'ml', mrpInr: 165, sellingPriceInr: 148 }
    ]
  },

  // --- 8. SNACKS & BISCUITS ---
  {
    title: 'Balaji Crunchy Nylon Sev',
    brand: 'Balaji',
    category: 'Snacks & Biscuits',
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80',
    description: 'Zero-size crisp golden sev, an absolute must for sev tameta and chaat.',
    tags: ['Gujarati', 'Chaat Sev', 'Namkeen'],
    variants: [
      { sku: 'BAL-SEV-200G', title: 'Balaji Nylon Sev, 200g Pouch', packQuantity: 200, packUnit: 'g', mrpInr: 45, sellingPriceInr: 40 },
      { sku: 'BAL-SEV-400G', title: 'Balaji Nylon Sev, 400g Pouch', packQuantity: 400, packUnit: 'g', mrpInr: 85, sellingPriceInr: 75 }
    ]
  },
  {
    title: 'Haldirams Nagpur Aloo Bhujia',
    brand: 'Haldirams',
    category: 'Snacks & Biscuits',
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80',
    description: 'Crispy spicy potato and gram flour sev flavored with mint and spices.',
    tags: ['Teatime', 'Bhujia', 'Namkeen'],
    variants: [
      { sku: 'HALD-ALOO-400G', title: 'Haldirams Aloo Bhujia, 400g', packQuantity: 400, packUnit: 'g', mrpInr: 120, sellingPriceInr: 105 }
    ]
  },
  {
    title: 'Shreeji Crispy Methi Khakhra',
    brand: 'Shreeji',
    category: 'Snacks & Biscuits',
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80',
    description: 'Handcrafted roasted whole wheat thin khakhra with fenugreek leaves.',
    tags: ['Gujarati', 'Healthy Snack', 'Roasted'],
    variants: [
      { sku: 'SHR-KHAK-METH-200G', title: 'Shreeji Roasted Methi Khakhra, 200g', packQuantity: 200, packUnit: 'g', mrpInr: 70, sellingPriceInr: 62 }
    ]
  },
  {
    title: 'Parle-G Original Glucose Biscuits',
    brand: 'Parle',
    category: 'Snacks & Biscuits',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80',
    description: 'India\'s favorite teatime energy biscuit with milk and wheat goodness.',
    tags: ['Classic', 'Teatime', 'Biscuit'],
    variants: [
      { sku: 'PARL-G-250G', title: 'Parle-G Glucose Biscuits Family Pack, 250g', packQuantity: 250, packUnit: 'g', mrpInr: 30, sellingPriceInr: 27 }
    ]
  },
  {
    title: 'Britannia Good Day Butter Cookies',
    brand: 'Britannia',
    category: 'Snacks & Biscuits',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80',
    description: 'Rich buttery cookies with cheerful smile pattern and crunchy bite.',
    tags: ['Butter Cookie', 'Teatime', 'Sweet'],
    variants: [
      { sku: 'BRIT-GD-200G', title: 'Britannia Good Day Butter, 200g Pack', packQuantity: 200, packUnit: 'g', mrpInr: 50, sellingPriceInr: 45 }
    ]
  },

  // --- 9. BEVERAGES ---
  {
    title: 'Wagh Bakri Premium CTC Leaf Tea',
    brand: 'Wagh Bakri',
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80',
    description: 'Gujarat\'s beloved strong and aromatic CTC tea that brews a rich golden cup.',
    tags: ['Gujarati Favorite', 'Strong Chai', 'Tea'],
    variants: [
      { sku: 'WB-TEA-500G', title: 'Wagh Bakri Premium Leaf Tea, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 285, sellingPriceInr: 259 },
      { sku: 'WB-TEA-1KG', title: 'Wagh Bakri Premium Leaf Tea, 1 kg', packQuantity: 1000, packUnit: 'g', mrpInr: 560, sellingPriceInr: 499 }
    ]
  },
  {
    title: 'Tata Tea Gold',
    brand: 'Tata Tea',
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80',
    description: 'Unique blend of fine Assam CTC tea with 15% gently rolled long leaves for aroma.',
    tags: ['Assam Tea', 'Aromatic Chai', 'Tea'],
    variants: [
      { sku: 'TATA-GOLD-500G', title: 'Tata Tea Gold Pouch, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 320, sellingPriceInr: 285 }
    ]
  },
  {
    title: 'Nescafe Classic 100% Pure Instant Coffee',
    brand: 'Nescafe',
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
    description: 'Rich and dark roasted instant coffee granules for instant morning freshness.',
    tags: ['Instant Coffee', 'Morning Energy', 'Coffee'],
    variants: [
      { sku: 'NES-CLAS-100G', title: 'Nescafe Classic Glass Jar, 100g', packQuantity: 100, packUnit: 'g', mrpInr: 340, sellingPriceInr: 310 },
      { sku: 'NES-CLAS-50G', title: 'Nescafe Classic Pouch, 50g', packQuantity: 50, packUnit: 'g', mrpInr: 175, sellingPriceInr: 160 }
    ]
  },
  {
    title: 'Hamdard Rooh Afza Rose Sharbat',
    brand: 'Hamdard',
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80',
    description: 'Traditional cooling herbal rose syrup for milkshakes, lassi and falooda.',
    tags: ['Cooling', 'Summer Sharbat', 'Drink'],
    variants: [
      { sku: 'ROOH-AFZA-750ML', title: 'Hamdard Rooh Afza Glass Bottle, 750ml', packQuantity: 750, packUnit: 'ml', mrpInr: 170, sellingPriceInr: 155 }
    ]
  },

  // --- 10. BREAKFAST & CEREALS ---
  {
    title: 'Kelloggs Original Corn Flakes with Real Almond & Honey',
    brand: 'Kelloggs',
    category: 'Breakfast & Cereals',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80',
    description: 'Crisp golden corn flakes enriched with iron and 8 essential vitamins.',
    tags: ['High Iron', 'Quick Breakfast', 'Cereal'],
    variants: [
      { sku: 'KEL-CORN-500G', title: 'Kelloggs Corn Flakes Box, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 215, sellingPriceInr: 195 }
    ]
  },
  {
    title: 'Quaker 100% Whole Grain Rolled Oats',
    brand: 'Quaker',
    category: 'Breakfast & Cereals',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80',
    description: 'Soluble fiber beta-glucan rich rolled oats for heart health and morning porridge.',
    tags: ['Beta Glucan', 'Heart Healthy', 'Oats'],
    variants: [
      { sku: 'QUAK-OATS-1KG', title: 'Quaker Rolled Oats Pouch, 1 kg', packQuantity: 1000, packUnit: 'g', mrpInr: 199, sellingPriceInr: 169 }
    ]
  },
  {
    title: 'MTR Ready 3-Minute Khatta Meetha Poha',
    brand: 'MTR',
    category: 'Breakfast & Cereals',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    description: 'Instant poha breakfast cup: just add hot water and enjoy in 3 minutes.',
    tags: ['Instant Breakfast', 'Ready to Eat', 'Poha'],
    variants: [
      { sku: 'MTR-POHA-80G', title: 'MTR 3-Min Poha Cup, 80g', packQuantity: 80, packUnit: 'g', mrpInr: 45, sellingPriceInr: 39 }
    ]
  },
  {
    title: 'Maggi 2-Minute Masala Instant Noodles',
    brand: 'Nestle Maggi',
    category: 'Breakfast & Cereals',
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=400&q=80',
    description: 'India\'s favorite 2-minute snack noodles with the authentic tastemaker.',
    tags: ['Instant Noodles', 'Snack', 'Quick Meal'],
    variants: [
      { sku: 'MAGG-4PK-280G', title: 'Maggi 2-Minute Noodles (Pack of 4), 280g', packQuantity: 280, packUnit: 'g', mrpInr: 56, sellingPriceInr: 52 },
      { sku: 'MAGG-12PK-840G', title: 'Maggi 2-Minute Noodles (Pack of 12), 840g', packQuantity: 840, packUnit: 'g', mrpInr: 168, sellingPriceInr: 149 }
    ]
  },

  // --- 11. FROZEN & PACKAGED FOODS ---
  {
    title: 'McCain French Fries Crispy Masala',
    brand: 'McCain',
    category: 'Frozen & Packaged Foods',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80',
    description: 'Crunchy golden potato fries, ready in 3 minutes by air frying or shallow frying.',
    tags: ['Crispy Fries', 'Quick Snack', 'Frozen'],
    variants: [
      { sku: 'MCC-FRIES-420G', title: 'McCain Crispy French Fries, 420g', packQuantity: 420, packUnit: 'g', mrpInr: 135, sellingPriceInr: 119 }
    ]
  },
  {
    title: 'Safal Select Frozen Green Peas (Matar)',
    brand: 'Safal',
    category: 'Frozen & Packaged Foods',
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=400&q=80',
    description: 'Naturally sweet and tender green peas, IQF frozen within hours of harvest.',
    tags: ['Sweet Peas', 'Ready to Cook', 'Frozen'],
    variants: [
      { sku: 'SAF-PEAS-1KG', title: 'Safal Frozen Green Peas, 1 kg', packQuantity: 1000, packUnit: 'g', mrpInr: 160, sellingPriceInr: 135 },
      { sku: 'SAF-PEAS-500G', title: 'Safal Frozen Green Peas, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 85, sellingPriceInr: 72 }
    ]
  },
  {
    title: 'Kissan Fresh Tomato Ketchup',
    brand: 'Kissan',
    category: 'Frozen & Packaged Foods',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
    description: '100% real ripe tomato puree blended into sweet and tangy sauce.',
    tags: ['Condiment', 'Tomato Sauce', 'Snack Partner'],
    variants: [
      { sku: 'KIS-KET-950G', title: 'Kissan Fresh Tomato Ketchup Bottle, 950g', packQuantity: 950, packUnit: 'g', mrpInr: 145, sellingPriceInr: 125 }
    ]
  },
  {
    title: 'Chings Secret Schezwan Chutney',
    brand: 'Chings',
    category: 'Frozen & Packaged Foods',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
    description: 'Desi Chinese spicy garlic schezwan dip for fried rice, noodles and snacks.',
    tags: ['Desi Chinese', 'Spicy Dip', 'Sauce'],
    variants: [
      { sku: 'CHNG-SCH-250G', title: 'Chings Schezwan Chutney Glass Bottle, 250g', packQuantity: 250, packUnit: 'g', mrpInr: 85, sellingPriceInr: 75 }
    ]
  },

  // --- 12. PERSONAL CARE ---
  {
    title: 'Dettol Original Germ Protection Bathing Soap',
    brand: 'Dettol',
    category: 'Personal Care',
    imageUrl: 'https://images.unsplash.com/photo-1607006314595-36427d14251a?auto=format&fit=crop&w=400&q=80',
    description: 'Classic pine fragrance soap providing 99.9% protection from illness-causing germs.',
    tags: ['Hygiene', 'Germ Protection', 'Soap'],
    variants: [
      { sku: 'DET-SOAP-4PK', title: 'Dettol Original Soap (Pack of 4 × 125g)', packQuantity: 500, packUnit: 'g', mrpInr: 198, sellingPriceInr: 175 }
    ]
  },
  {
    title: 'Colgate Strong Teeth Dental Cream Toothpaste',
    brand: 'Colgate',
    category: 'Personal Care',
    imageUrl: 'https://images.unsplash.com/photo-1559591937-e106093498cb?auto=format&fit=crop&w=400&q=80',
    description: 'Calcium boost formula that strengthens tooth enamel against daily cavities.',
    tags: ['Oral Hygiene', 'Cavity Protection', 'Toothpaste'],
    variants: [
      { sku: 'COLG-ST-200G', title: 'Colgate Strong Teeth Toothpaste, 200g Tube', packQuantity: 200, packUnit: 'g', mrpInr: 125, sellingPriceInr: 110 }
    ]
  },
  {
    title: 'Head & Shoulders Anti-Dandruff Cool Menthol Shampoo',
    brand: 'Head & Shoulders',
    category: 'Personal Care',
    imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80',
    description: 'Invigorating cool menthol formula removes visible dandruff flakes from first wash.',
    tags: ['Hair Care', 'Cool Menthol', 'Shampoo'],
    variants: [
      { sku: 'HS-SHMP-340ML', title: 'Head & Shoulders Cool Menthol Shampoo, 340ml', packQuantity: 340, packUnit: 'ml', mrpInr: 340, sellingPriceInr: 299 }
    ]
  },
  {
    title: 'Parachute 100% Pure Coconut Hair Oil',
    brand: 'Parachute',
    category: 'Personal Care',
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-21629851610c?auto=format&fit=crop&w=400&q=80',
    description: 'Pure edible grade unadulterated coconut oil made from sun-dried coconuts.',
    tags: ['100% Pure', 'Nourishment', 'Hair Oil'],
    variants: [
      { sku: 'PARA-OIL-250ML', title: 'Parachute Pure Coconut Oil Bottle, 250ml', packQuantity: 250, packUnit: 'ml', mrpInr: 110, sellingPriceInr: 98 }
    ]
  },

  // --- 13. HOUSEHOLD CLEANING ---
  {
    title: 'Surf Excel Easy Wash Detergent Powder',
    brand: 'Surf Excel',
    category: 'Household Cleaning',
    imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80',
    description: 'Superior stain removal formula that tackles stubborn collar and grease stains effortlessly.',
    tags: ['Laundry', 'Stain Removal', 'Detergent'],
    variants: [
      { sku: 'SURF-EASY-1KG', title: 'Surf Excel Easy Wash Powder, 1 kg', packQuantity: 1000, packUnit: 'g', mrpInr: 150, sellingPriceInr: 135 },
      { sku: 'SURF-EASY-3KG', title: 'Surf Excel Easy Wash Powder, 3 kg', packQuantity: 3000, packUnit: 'g', mrpInr: 420, sellingPriceInr: 379 }
    ]
  },
  {
    title: 'Vim Lemon Dishwash Gel with Real Lime',
    brand: 'Vim',
    category: 'Household Cleaning',
    imageUrl: 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?auto=format&fit=crop&w=400&q=80',
    description: 'Deep grease cutting formula that leaves stainless steel and glassware sparkling clean.',
    tags: ['Dishwash', 'Lemon Fresh', 'Grease Cut'],
    variants: [
      { sku: 'VIM-GEL-750ML', title: 'Vim Lemon Dishwash Gel Squeezy Bottle, 750ml', packQuantity: 750, packUnit: 'ml', mrpInr: 165, sellingPriceInr: 145 }
    ]
  },
  {
    title: 'Harpic Power Plus Disinfectant Toilet Cleaner',
    brand: 'Harpic',
    category: 'Household Cleaning',
    imageUrl: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=400&q=80',
    description: '10x better limescale and stain removal with 99.9% germ kill certification.',
    tags: ['Sanitation', 'Toilet Cleaner', 'Disinfectant'],
    variants: [
      { sku: 'HARP-POW-1L', title: 'Harpic Power Plus Original, 1L Bottle', packQuantity: 1000, packUnit: 'ml', mrpInr: 215, sellingPriceInr: 189 }
    ]
  },
  {
    title: 'Lizol Disinfectant Surface & Floor Cleaner Citrus',
    brand: 'Lizol',
    category: 'Household Cleaning',
    imageUrl: 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?auto=format&fit=crop&w=400&q=80',
    description: 'India\'s No. 1 floor cleaner that removes 100 types of stains and kills 99.9% germs.',
    tags: ['Floor Cleaner', 'Citrus Fresh', 'Hygiene'],
    variants: [
      { sku: 'LIZ-CITR-1L', title: 'Lizol Citrus Floor Cleaner, 1L Bottle', packQuantity: 1000, packUnit: 'ml', mrpInr: 235, sellingPriceInr: 205 }
    ]
  },

  // --- 14. BABY CARE ---
  {
    title: 'Pampers All Round Protection Baby Diaper Pants',
    brand: 'Pampers',
    category: 'Baby Care',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80',
    description: 'Magic gel core provides up to 12 hours of leakage lock and dryness for baby skin.',
    tags: ['Baby Care', 'Diapers', 'Gentle Care'],
    variants: [
      { sku: 'PAMP-M-54', title: 'Pampers Pants Medium (7-12 kg), 54 pcs', packQuantity: 54, packUnit: 'pcs', mrpInr: 899, sellingPriceInr: 749 }
    ]
  },
  {
    title: 'Himalaya Gentle Baby Wipes with Aloe Vera & Indian Lotus',
    brand: 'Himalaya',
    category: 'Baby Care',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80',
    description: 'Alcohol-free and hypoallergenic baby wipes enriched with soothing herbs.',
    tags: ['Hypoallergenic', 'Wipes', 'Baby Skin'],
    variants: [
      { sku: 'HIM-WIPE-72', title: 'Himalaya Baby Wipes with Flip Lid (72 pcs)', packQuantity: 72, packUnit: 'pcs', mrpInr: 195, sellingPriceInr: 159 }
    ]
  },
  {
    title: 'Johnsons Baby Gentle Bathing Soap',
    brand: 'Johnsons',
    category: 'Baby Care',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80',
    description: 'No more tears formula, enriched with 1/4th baby lotion to keep delicate skin soft.',
    tags: ['No More Tears', 'Mild Care', 'Baby Soap'],
    variants: [
      { sku: 'JHN-SOAP-75G', title: 'Johnsons Baby Soap Bar, 75g', packQuantity: 75, packUnit: 'g', mrpInr: 65, sellingPriceInr: 58 }
    ]
  }
];

async function seedCatalog() {
  console.log('=== Step 2: Seeding Realistic 100+ Indian Grocery Marketplace Catalog ===\n');

  // 1. Ensure 4 major Quick-Commerce Retailers & Stores exist
  const majorRetailers = [
    {
      id: 'ret-blinkit',
      name: 'Blinkit',
      slug: 'blinkit',
      logoUrl: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=200&q=80',
      deliveryTimeEstimate: '10-15 mins',
      deliveryFeeInr: 25,
      freeDeliveryThresholdInr: 399,
      minOrderValueInr: 99,
      rating: 4.8,
      status: 'ACTIVE'
    },
    {
      id: 'ret-zepto',
      name: 'Zepto',
      slug: 'zepto',
      logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
      deliveryTimeEstimate: '10 mins',
      deliveryFeeInr: 29,
      freeDeliveryThresholdInr: 499,
      minOrderValueInr: 99,
      rating: 4.9,
      status: 'ACTIVE'
    },
    {
      id: 'ret-dmart',
      name: 'DMart Ready',
      slug: 'dmart-ready',
      logoUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=200&q=80',
      deliveryTimeEstimate: 'Tomorrow Morning',
      deliveryFeeInr: 49,
      freeDeliveryThresholdInr: 1000,
      minOrderValueInr: 500,
      rating: 4.7,
      status: 'ACTIVE'
    },
    {
      id: 'ret-bigbasket',
      name: 'BigBasket',
      slug: 'bigbasket',
      logoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80',
      deliveryTimeEstimate: 'Same Day (2-4 hrs)',
      deliveryFeeInr: 35,
      freeDeliveryThresholdInr: 600,
      minOrderValueInr: 200,
      rating: 4.6,
      status: 'ACTIVE'
    }
  ];

  const storesMap = new Map();

  for (const r of majorRetailers) {
    const retailer = await prisma.retailer.upsert({
      where: { id: r.id },
      update: {
        name: r.name,
        slug: r.slug,
        deliveryTimeEstimate: r.deliveryTimeEstimate,
        deliveryFeeInr: r.deliveryFeeInr,
        freeDeliveryThresholdInr: r.freeDeliveryThresholdInr,
        minOrderValueInr: r.minOrderValueInr,
        rating: r.rating,
        status: r.status
      },
      create: r
    });

    // Ensure store exists for retailer
    let store = await prisma.store.findFirst({
      where: { retailerId: retailer.id }
    });
    if (!store) {
      store = await prisma.store.create({
        data: {
          id: `store-${retailer.slug}-hub`,
          retailerId: retailer.id,
          name: `${retailer.name} Central Hub`,
          city: 'Ahmedabad',
          pincode: '380015'
        }
      });
    }
    storesMap.set(retailer.id, store);
    console.log(`Verified Retailer & Store: ${retailer.name} (${store.id})`);
  }

  // 2. Upsert Products & Variants
  let productsCount = 0;
  let variantsCount = 0;
  let storeProductsCount = 0;

  for (const p of RAW_PRODUCTS_CATALOG) {
    const slug = slugify(`${p.brand}-${p.title}`);
    const productId = `prod-${slug}`;

    const product = await prisma.product.upsert({
      where: { id: productId },
      update: {
        brand: p.brand,
        title: p.title,
        category: p.category,
        imageUrl: p.imageUrl,
        description: p.description,
        tags: p.tags,
        slug: slug,
        status: 'ACTIVE',
        isSampleData: true
      },
      create: {
        id: productId,
        slug: slug,
        brand: p.brand,
        title: p.title,
        category: p.category,
        imageUrl: p.imageUrl,
        description: p.description,
        tags: p.tags,
        status: 'ACTIVE',
        isSampleData: true
      }
    });
    productsCount++;

    for (const v of p.variants) {
      const variantId = `var-${slugify(v.sku)}`;
      const variant = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          productId: product.id,
          brand: p.brand,
          title: v.title,
          packQuantity: v.packQuantity,
          packUnit: v.packUnit,
          mrpInr: v.mrpInr,
          sellingPriceInr: v.sellingPriceInr,
          imageUrl: p.imageUrl,
          inStock: true
        },
        create: {
          id: variantId,
          productId: product.id,
          sku: v.sku,
          brand: p.brand,
          title: v.title,
          packQuantity: v.packQuantity,
          packUnit: v.packUnit,
          mrpInr: v.mrpInr,
          sellingPriceInr: v.sellingPriceInr,
          imageUrl: p.imageUrl,
          inStock: true
        }
      });
      variantsCount++;

      // 3. Create StoreProduct entries for each retailer store
      for (const [retailerId, store] of storesMap.entries()) {
        let priceFactor = 1.0;
        if (retailerId === 'ret-dmart') priceFactor = 0.94; // DMart deep everyday discount
        if (retailerId === 'ret-zepto') priceFactor = 1.02; // Quick commerce convenience
        if (retailerId === 'ret-bigbasket') priceFactor = 0.97; // Produce & staples savings

        const localPrice = Math.round(v.sellingPriceInr * priceFactor);

        await prisma.storeProduct.upsert({
          where: {
            storeId_productVariantId: {
              storeId: store.id,
              productVariantId: variant.id
            }
          },
          update: {
            localPriceInr: localPrice,
            inStock: true,
            stockCount: 50
          },
          create: {
            storeId: store.id,
            productVariantId: variant.id,
            localPriceInr: localPrice,
            inStock: true,
            stockCount: 50
          }
        });
        storeProductsCount++;
      }
    }
  }

  // Count total in DB
  const [totalProducts, totalVariants, totalStoreProducts] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.storeProduct.count()
  ]);

  console.log('\n======================================================');
  console.log(`Seeding complete!`);
  console.log(`Total Products in Database: ${totalProducts}`);
  console.log(`Total Product Variants in Database: ${totalVariants}`);
  console.log(`Total Retailer Store Listings: ${totalStoreProducts}`);
  console.log('======================================================\n');
}

seedCatalog().catch(console.error).finally(() => prisma.$disconnect());
