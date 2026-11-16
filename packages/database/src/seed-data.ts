import { IndianCuisine, DietaryTag, StandardUnit, ProteinSource } from '@rasoi/shared-types';

export interface SeedIngredient {
  id: string;
  name: string;
  hindiName: string;
  category: 'Produce' | 'Dairy & Eggs' | 'Grains & Atta' | 'Lentils & Pulses' | 'Spices & Masalas' | 'Oils & Ghee' | 'Meat & Poultry' | 'Snacks & Bakery' | 'Pantry Staples';
  standardUnit: StandardUnit;
  isJainPermissible: boolean;
  shelfLifeDays?: number;
  isVerified?: boolean;
  containsEggs?: boolean;
  containsDairy?: boolean;
  containsMeat?: boolean;
  containsPoultry?: boolean;
  containsFish?: boolean;
  containsSeafood?: boolean;
  isOnionGarlic?: boolean;
  isRootVegetable?: boolean;
  containsNuts?: boolean;
  containsGluten?: boolean;
  allergens?: string[];
}

export const SEED_INGREDIENTS: SeedIngredient[] = [
  // Dairy & Eggs
  { id: 'ing-paneer', name: 'Paneer', hindiName: 'पनीर', category: 'Dairy & Eggs', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 7, isVerified: true, containsDairy: true, allergens: ['dairy', 'lactose'] },
  { id: 'ing-milk', name: 'Cow Milk', hindiName: 'दूध', category: 'Dairy & Eggs', standardUnit: 'ml', isJainPermissible: true, shelfLifeDays: 3, isVerified: true, containsDairy: true, allergens: ['dairy', 'lactose'] },
  { id: 'ing-curd', name: 'Curd (Dahi)', hindiName: 'दही', category: 'Dairy & Eggs', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 5, isVerified: true, containsDairy: true, allergens: ['dairy', 'lactose'] },
  { id: 'ing-ghee', name: 'Desi Cow Ghee', hindiName: 'देसी घी', category: 'Oils & Ghee', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 180, isVerified: true, containsDairy: true, allergens: ['dairy', 'lactose'] },
  { id: 'ing-butter', name: 'White / Salted Butter', hindiName: 'मक्खन', category: 'Dairy & Eggs', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 30, isVerified: true, containsDairy: true, allergens: ['dairy', 'lactose'] },
  { id: 'ing-eggs', name: 'Farm Eggs', hindiName: 'अंडे', category: 'Dairy & Eggs', standardUnit: 'piece', isJainPermissible: false, shelfLifeDays: 14, isVerified: true, containsEggs: true, allergens: ['eggs'] },
  { id: 'ing-chicken', name: 'Chicken Breast / Curry Cut', hindiName: 'चिकन', category: 'Meat & Poultry', standardUnit: 'g', isJainPermissible: false, shelfLifeDays: 2, isVerified: true, containsMeat: true, containsPoultry: true, allergens: [] },
  { id: 'ing-fish', name: 'Fresh Rohu / Catla Fish', hindiName: 'मछली', category: 'Meat & Poultry', standardUnit: 'g', isJainPermissible: false, shelfLifeDays: 2, isVerified: true, containsMeat: true, containsFish: true, allergens: ['fish'] },

  // Grains & Atta
  { id: 'ing-basmati-rice', name: 'Basmati Rice', hindiName: 'बासमती चावल', category: 'Grains & Atta', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] },
  { id: 'ing-atta', name: 'Whole Wheat Atta', hindiName: 'गेहूं का आटा', category: 'Grains & Atta', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 90, isVerified: true, containsGluten: true, allergens: ['gluten', 'wheat'] },
  { id: 'ing-poha', name: 'Thick Poha (Flattened Rice)', hindiName: 'पोहा', category: 'Grains & Atta', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 120, isVerified: true, allergens: [] },
  { id: 'ing-besan', name: 'Besan (Gram Flour)', hindiName: 'बेसन', category: 'Grains & Atta', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 180, isVerified: true, allergens: [] },
  { id: 'ing-rava', name: 'Sooji / Rava (Semolina)', hindiName: 'सूजी / रवा', category: 'Grains & Atta', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 90, isVerified: true, containsGluten: true, allergens: ['gluten', 'wheat'] },
  { id: 'ing-dosa-batter', name: 'Fermented Idli/Dosa Batter', hindiName: 'डोसा बैटर', category: 'Grains & Atta', standardUnit: 'ml', isJainPermissible: true, shelfLifeDays: 5, isVerified: true, allergens: [] },

  // Lentils & Pulses
  { id: 'ing-toor-dal', name: 'Toor Dal (Pigeon Pea)', hindiName: 'अरहर / तूर दाल', category: 'Lentils & Pulses', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] },
  { id: 'ing-moong-dal', name: 'Yellow Moong Dal', hindiName: 'मूंग दाल', category: 'Lentils & Pulses', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] },
  { id: 'ing-rajma', name: 'Kashmiri Rajma', hindiName: 'राजमा', category: 'Lentils & Pulses', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] },
  { id: 'ing-chana-dal', name: 'Chana Dal', hindiName: 'चना दाल', category: 'Lentils & Pulses', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] },
  { id: 'ing-urad-dal', name: 'Urad Dal Gota', hindiName: 'उड़द दाल', category: 'Lentils & Pulses', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] },
  { id: 'ing-kabuli-chana', name: 'Kabuli Chana (Chickpeas)', hindiName: 'काबुली चना', category: 'Lentils & Pulses', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] },

  // Produce (Vegetables)
  { id: 'ing-onion', name: 'Red Onion', hindiName: 'प्याज', category: 'Produce', standardUnit: 'g', isJainPermissible: false, shelfLifeDays: 20, isVerified: true, isOnionGarlic: true, isRootVegetable: true, allergens: [] },
  { id: 'ing-tomato', name: 'Ripe Red Tomato', hindiName: 'टमाटर', category: 'Produce', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 7, isVerified: true, allergens: [] },
  { id: 'ing-garlic', name: 'Garlic Pods', hindiName: 'लहसुन', category: 'Produce', standardUnit: 'g', isJainPermissible: false, shelfLifeDays: 30, isVerified: true, isOnionGarlic: true, isRootVegetable: true, allergens: [] },
  { id: 'ing-ginger', name: 'Fresh Ginger Root', hindiName: 'अदरक', category: 'Produce', standardUnit: 'g', isJainPermissible: false, shelfLifeDays: 14, isVerified: true, isRootVegetable: true, allergens: [] },
  { id: 'ing-green-chilli', name: 'Spicy Green Chillies', hindiName: 'हरी मिर्च', category: 'Produce', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 10, isVerified: true, allergens: [] },
  { id: 'ing-coriander', name: 'Fresh Coriander (Dhaniya)', hindiName: 'हरा धनिया', category: 'Produce', standardUnit: 'bunch', isJainPermissible: true, shelfLifeDays: 5, isVerified: true, allergens: [] },
  { id: 'ing-curry-leaves', name: 'Fresh Curry Leaves', hindiName: 'कढ़ी पत्ता', category: 'Produce', standardUnit: 'bunch', isJainPermissible: true, shelfLifeDays: 7, isVerified: true, allergens: [] },
  { id: 'ing-potato', name: 'Desi Potato (Aloo)', hindiName: 'आलू', category: 'Produce', standardUnit: 'g', isJainPermissible: false, shelfLifeDays: 30, isVerified: true, isRootVegetable: true, allergens: [] },
  { id: 'ing-palak', name: 'Fresh Palak (Spinach)', hindiName: 'पालक', category: 'Produce', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 4, isVerified: true, allergens: [] },
  { id: 'ing-fenugreek', name: 'Fresh Methi Leaves', hindiName: 'ताजा मेथी', category: 'Produce', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 4, isVerified: true, allergens: [] },
  { id: 'ing-cauliflower', name: 'Fresh Cauliflower (Gobi)', hindiName: 'फूलगोभी', category: 'Produce', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 5, isVerified: true, allergens: [] },
  { id: 'ing-bhindi', name: 'Fresh Ladyfinger (Bhindi)', hindiName: 'भिंडी', category: 'Produce', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 5, isVerified: true, allergens: [] },
  { id: 'ing-baingan', name: 'Round Bharta Eggplant (Baingan)', hindiName: 'बैंगन', category: 'Produce', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 7, isVerified: true, allergens: [] },
  { id: 'ing-lemon', name: 'Juicy Yellow Lemon', hindiName: 'नींबू', category: 'Produce', standardUnit: 'piece', isJainPermissible: true, shelfLifeDays: 14, isVerified: true, allergens: [] },
  { id: 'ing-peanuts', name: 'Raw Peanuts', hindiName: 'मूंगफली', category: 'Produce', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 180, isVerified: true, containsNuts: true, allergens: ['peanuts', 'nuts'] },

  // Spices & Condiments
  { id: 'ing-turmeric', name: 'Turmeric Powder (Haldi)', hindiName: 'हल्दी पाउडर', category: 'Spices & Masalas', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] },
  { id: 'ing-red-chilli-powder', name: 'Kashmiri Red Chilli Powder', hindiName: 'लाल मिर्च पाउडर', category: 'Spices & Masalas', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] },
  { id: 'ing-coriander-powder', name: 'Dhaniya Powder', hindiName: 'धनिया पाउडर', category: 'Spices & Masalas', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] },
  { id: 'ing-garam-masala', name: 'Garam Masala Blend', hindiName: 'गरम मसाला', category: 'Spices & Masalas', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] },
  { id: 'ing-sambar-powder', name: 'Madras Sambar Powder', hindiName: 'सांभर मसाला', category: 'Spices & Masalas', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 180, isVerified: true, allergens: [] },
  { id: 'ing-chole-masala', name: 'Amritsari Chole Masala', hindiName: 'छोले मसाला', category: 'Spices & Masalas', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] },
  { id: 'ing-mustard-seeds', name: 'Black Mustard Seeds (Rai)', hindiName: 'राई', category: 'Spices & Masalas', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: ['mustard'] },
  { id: 'ing-cumin-seeds', name: 'Cumin Seeds (Jeera)', hindiName: 'जीरा', category: 'Spices & Masalas', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] },
  { id: 'ing-kasuri-methi', name: 'Dried Kasuri Methi', hindiName: 'कसूरी मेथी', category: 'Spices & Masalas', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] },
  { id: 'ing-salt', name: 'Iodized Salt', hindiName: 'नमक', category: 'Pantry Staples', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 730, isVerified: true, allergens: [] },
  { id: 'ing-oil', name: 'Cold-Pressed Mustard / Sunflower Oil', hindiName: 'कुकिंग तेल', category: 'Oils & Ghee', standardUnit: 'ml', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] },
  { id: 'ing-jaggery', name: 'Organic Jaggery (Gud)', hindiName: 'गुड़', category: 'Pantry Staples', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] },

  // Authentic Regional Gujarati & Kathiyawadi Ingredients
  { id: 'ing-sev', name: 'Nylon Sev / Ratlami Sev', hindiName: 'सेव', category: 'Snacks & Bakery', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 90, isVerified: true, containsGluten: false, allergens: [] },
  { id: 'ing-bajra-flour', name: 'Bajra (Pearl Millet) Flour', hindiName: 'बाजरे का आटा', category: 'Grains & Atta', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 90, isVerified: true, containsGluten: false, allergens: [] },
  { id: 'ing-surti-papdi', name: 'Fresh Surti Papdi (Flat Beans)', hindiName: 'सुरती पापड़ी', category: 'Produce', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 5, isVerified: true, allergens: [] },
  { id: 'ing-tuver-lilva', name: 'Fresh Tuver Lilva (Green Pigeon Peas)', hindiName: 'तुवर लिलवा', category: 'Produce', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 5, isVerified: true, allergens: [] },
  { id: 'ing-purple-yam', name: 'Kand / Purple Yam (Ratalu)', hindiName: 'रतालू / कंद', category: 'Produce', standardUnit: 'g', isJainPermissible: false, shelfLifeDays: 14, isVerified: true, isRootVegetable: true, allergens: [] },
  { id: 'ing-raw-banana', name: 'Kacha Kela (Raw Green Banana)', hindiName: 'कच्चा केला', category: 'Produce', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 7, isVerified: true, isRootVegetable: false, allergens: [] },
  { id: 'ing-buttermilk', name: 'Chhaas / Spiced Buttermilk', hindiName: 'छाछ', category: 'Dairy & Eggs', standardUnit: 'ml', isJainPermissible: true, shelfLifeDays: 4, isVerified: true, containsDairy: true, allergens: ['dairy', 'lactose'] },
  { id: 'ing-sesame-seeds', name: 'White Sesame Seeds (Safed Til)', hindiName: 'सफेद तिल', category: 'Spices & Masalas', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: ['sesame'] },
  { id: 'ing-ajwain', name: 'Ajwain (Carom Seeds)', hindiName: 'अजवाइन', category: 'Spices & Masalas', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] },
  { id: 'ing-hing', name: 'Asafoetida (Hing Powder)', hindiName: 'हींग', category: 'Spices & Masalas', standardUnit: 'g', isJainPermissible: true, shelfLifeDays: 365, isVerified: true, allergens: [] }
];

export interface SeedRecipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  cuisine: IndianCuisine;
  dietaryTags: DietaryTag[];
  mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  defaultServings: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  proteinSource?: ProteinSource;
  caloriesPerServing: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  sugarGrams?: number;
  sodiumMg?: number;
  imageUrl: string;
  estimatedCostInr: number;
  isJainFriendly: boolean;
  jainAlternativeNotes?: string;
  ingredients: Array<{
    ingredientId: string;
    quantity: number;
    unit: StandardUnit;
    notes?: string;
  }>;
  steps: Array<{
    stepNumber: number;
    instruction: string;
    tip?: string;
    durationMinutes?: number;
  }>;
}

export const SEED_RECIPES: SeedRecipe[] = [
  {
    id: 'recipe-paneer-butter-masala',
    title: 'Restaurant Style Paneer Butter Masala',
    slug: 'paneer-butter-masala',
    description: 'Tender cottage cheese cubes simmered in a velvety, rich tomato, cashew, and butter gravy perfumed with kasuri methi.',
    cuisine: 'North Indian',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'High-Protein'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    defaultServings: 4,
    difficulty: 'Medium',
    proteinSource: 'paneer',
    caloriesPerServing: 380,
    proteinGrams: 16,
    carbsGrams: 14,
    fatGrams: 28,
    fiberGrams: 4,
    sugarGrams: 4.5,
    sodiumMg: 420,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 280,
    isJainFriendly: false,
    jainAlternativeNotes: 'Replace onion and garlic paste with pure tomato-ginger puree and a pinch of asafoetida (hing).',
    ingredients: [
      { ingredientId: 'ing-paneer', quantity: 300, unit: 'g', notes: 'fresh malai paneer cut into 1-inch cubes' },
      { ingredientId: 'ing-butter', quantity: 40, unit: 'g', notes: 'Amul salted butter' },
      { ingredientId: 'ing-tomato', quantity: 400, unit: 'g', notes: 'finely pureed' },
      { ingredientId: 'ing-onion', quantity: 150, unit: 'g', notes: 'finely chopped' },
      { ingredientId: 'ing-ginger', quantity: 20, unit: 'g', notes: 'minced' },
      { ingredientId: 'ing-garlic', quantity: 15, unit: 'g', notes: 'minced' },
      { ingredientId: 'ing-kasuri-methi', quantity: 5, unit: 'g', notes: 'toasted and crushed' },
      { ingredientId: 'ing-garam-masala', quantity: 5, unit: 'g', notes: 'freshly ground' },
      { ingredientId: 'ing-red-chilli-powder', quantity: 10, unit: 'g', notes: 'Kashmiri for vibrant red color' },
      { ingredientId: 'ing-oil', quantity: 20, unit: 'ml' },
      { ingredientId: 'ing-salt', quantity: 8, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Heat 1 tbsp oil and 20g butter in a heavy kadai. Sauté chopped onions until golden translucent.', durationMinutes: 5 },
      { stepNumber: 2, instruction: 'Add minced ginger and garlic. Sauté for 2 minutes until raw aroma disappears.', durationMinutes: 2 },
      { stepNumber: 3, instruction: 'Pour in the fresh tomato puree, Kashmiri red chilli powder, turmeric, and salt. Simmer on medium heat until fat separates from gravy.', durationMinutes: 10 },
      { stepNumber: 4, instruction: 'Gently add paneer cubes, remaining butter, and garam masala. Simmer on low heat for 5 minutes without breaking paneer.', durationMinutes: 5 },
      { stepNumber: 5, instruction: 'Crush kasuri methi between palms and sprinkle over the curry. Serve hot with buttery phulkas or naan.', durationMinutes: 3 }
    ]
  },
  {
    id: 'recipe-gujarati-khatti-meethi-dal',
    title: 'Authentic Gujarati Khatti Meethi Dal',
    slug: 'gujarati-khatti-meethi-dal',
    description: 'A delicate harmony of sweet organic jaggery and tangy kokum or lemon, tempered with mustard, cumin, and fragrant curry leaves. A Jain dietary staple.',
    cuisine: 'Gujarati',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Jain Friendly', 'Diabetic-Friendly'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    defaultServings: 4,
    difficulty: 'Easy',
    proteinSource: 'dal',
    caloriesPerServing: 185,
    proteinGrams: 8,
    carbsGrams: 30,
    fatGrams: 4,
    fiberGrams: 6,
    sugarGrams: 8.2,
    sodiumMg: 380,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 95,
    isJainFriendly: true,
    ingredients: [
      { ingredientId: 'ing-toor-dal', quantity: 200, unit: 'g', notes: 'unpolished toor dal rinsed and soaked' },
      { ingredientId: 'ing-tomato', quantity: 150, unit: 'g', notes: 'diced' },
      { ingredientId: 'ing-peanuts', quantity: 30, unit: 'g', notes: 'raw peanuts boiled with dal' },
      { ingredientId: 'ing-jaggery', quantity: 25, unit: 'g', notes: 'grated organic jaggery' },
      { ingredientId: 'ing-lemon', quantity: 1, unit: 'piece', notes: 'freshly squeezed' },
      { ingredientId: 'ing-ginger', quantity: 15, unit: 'g', notes: 'grated' },
      { ingredientId: 'ing-green-chilli', quantity: 10, unit: 'g', notes: 'slit lengthwise' },
      { ingredientId: 'ing-ghee', quantity: 20, unit: 'g', notes: 'for royal Gujarati tadka' },
      { ingredientId: 'ing-mustard-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-cumin-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-curry-leaves', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-coriander', quantity: 1, unit: 'bunch', notes: 'finely chopped' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 8, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Pressure cook toor dal with peanuts, chopped tomato, turmeric, and 3 cups of water for 4 whistles.', durationMinutes: 10 },
      { stepNumber: 2, instruction: 'Blend cooked dal with a hand churner (mathani) to silky consistency. Add jaggery, lemon juice, grated ginger, and slit chillies.', durationMinutes: 4 },
      { stepNumber: 3, instruction: 'Bring dal to a rolling boil on medium flame for 6-8 minutes so the flavors marry.', durationMinutes: 8 },
      { stepNumber: 4, instruction: 'Prepare the vaghar (tadka): heat pure cow ghee in a tadka pan. Add mustard seeds, cumin seeds, and curry leaves. Let crackle and immediately pour into the boiling dal.', durationMinutes: 3 },
      { stepNumber: 5, instruction: 'Garnish with freshly chopped coriander leaves. Enjoy with steamed basmati rice and thepla.', durationMinutes: 2 }
    ]
  },
  {
    id: 'recipe-methi-thepla',
    title: 'Spiced Gujarati Methi Thepla',
    slug: 'methi-thepla',
    description: 'Golden spiced flatbreads made with whole wheat flour, fresh fenugreek leaves, sesame, and yogurt. The iconic travel and breakfast food of Gujarat.',
    cuisine: 'Gujarati',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Jain Friendly', 'Kid-Friendly'],
    mealTypes: ['breakfast', 'snack'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    defaultServings: 4,
    difficulty: 'Easy',
    proteinSource: 'mixed-veg',
    caloriesPerServing: 210,
    proteinGrams: 6,
    carbsGrams: 32,
    fatGrams: 7,
    fiberGrams: 5,
    sugarGrams: 1.2,
    sodiumMg: 290,
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 80,
    isJainFriendly: true,
    ingredients: [
      { ingredientId: 'ing-atta', quantity: 300, unit: 'g', notes: 'Aashirvaad chakki atta' },
      { ingredientId: 'ing-besan', quantity: 50, unit: 'g', notes: 'for crispness' },
      { ingredientId: 'ing-fenugreek', quantity: 150, unit: 'g', notes: 'fresh methi leaves washed and finely chopped' },
      { ingredientId: 'ing-curd', quantity: 60, unit: 'g', notes: 'fresh dahi keeps them soft' },
      { ingredientId: 'ing-oil', quantity: 30, unit: 'ml' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-red-chilli-powder', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-coriander-powder', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 6, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'In a large parat, mix atta, besan, washed chopped methi, curd, turmeric, red chilli, coriander powder, 1 tbsp oil, and salt.', durationMinutes: 5 },
      { stepNumber: 2, instruction: 'Knead into a soft, pliable dough using lukewarm water. Rest covered for 10 minutes.', durationMinutes: 10 },
      { stepNumber: 3, instruction: 'Divide into lemon-sized balls. Roll into thin circular rotis dusting lightly with dry atta.', durationMinutes: 5 },
      { stepNumber: 4, instruction: 'Cook on a hot iron tawa with drops of oil on both sides until golden brown specks appear.', durationMinutes: 6 },
      { stepNumber: 5, instruction: 'Stack and serve hot with spicy mango pickle and masala chai.', durationMinutes: 2 }
    ]
  },
  {
    id: 'recipe-masala-dosa',
    title: 'Crispy Bengaluru Masala Dosa',
    slug: 'bengaluru-masala-dosa',
    description: 'Golden fermented rice and urad dal crepe slathered with red garlic chutney and stuffed with comforting spiced potato palya.',
    cuisine: 'South Indian',
    dietaryTags: ['Vegetarian', 'Gluten-Free'],
    mealTypes: ['breakfast', 'dinner'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    defaultServings: 4,
    difficulty: 'Medium',
    caloriesPerServing: 310,
    proteinGrams: 7,
    carbsGrams: 52,
    fatGrams: 9,
    fiberGrams: 4,
    sugarGrams: 2.1,
    sodiumMg: 480,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 120,
    isJainFriendly: false,
    jainAlternativeNotes: 'Replace potato palya with raw banana (kacha kela) palya cooked with mustard and turmeric.',
    ingredients: [
      { ingredientId: 'ing-dosa-batter', quantity: 600, unit: 'ml', notes: 'fresh fermented batter' },
      { ingredientId: 'ing-potato', quantity: 400, unit: 'g', notes: 'boiled and mashed coarsely' },
      { ingredientId: 'ing-onion', quantity: 120, unit: 'g', notes: 'thinly sliced' },
      { ingredientId: 'ing-green-chilli', quantity: 15, unit: 'g', notes: 'finely chopped' },
      { ingredientId: 'ing-curry-leaves', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-mustard-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-ghee', quantity: 40, unit: 'g', notes: 'for crisp buttery roasting' },
      { ingredientId: 'ing-oil', quantity: 20, unit: 'ml' },
      { ingredientId: 'ing-coriander', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-salt', quantity: 8, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Heat oil in a pan. Splutter mustard seeds and curry leaves. Sauté sliced onions and green chillies until soft.', durationMinutes: 5 },
      { stepNumber: 2, instruction: 'Add turmeric, salt, and mashed potatoes with 1/4 cup water. Simmer for 3 minutes and finish with fresh coriander.', durationMinutes: 4 },
      { stepNumber: 3, instruction: 'Heat cast iron tawa. Pour a ladle of batter and swirl quickly in outward spirals to form a thin crepe.', durationMinutes: 2 },
      { stepNumber: 4, instruction: 'Drizzle generous cow ghee around edges. Cook on high flame until golden brown and super crisp.', durationMinutes: 3 },
      { stepNumber: 5, instruction: 'Place a scoop of potato masala in center, fold neatly, and serve with fresh coconut chutney and piping hot sambar.', durationMinutes: 2 }
    ]
  },
  {
    id: 'recipe-rajma-chawal',
    title: 'Dhaba Style Kashmiri Rajma Chawal',
    slug: 'punjabi-rajma-chawal',
    description: 'Slow-simmered red kidney beans in an aromatic ginger-garlic and tomato masala served over steaming cumin-scented basmati rice.',
    cuisine: 'Punjabi',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'High-Protein', 'Gluten-Free'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 20,
    cookTimeMinutes: 35,
    defaultServings: 4,
    difficulty: 'Medium',
    proteinSource: 'rajma',
    caloriesPerServing: 420,
    proteinGrams: 18,
    carbsGrams: 68,
    fatGrams: 8,
    fiberGrams: 12,
    sugarGrams: 3.4,
    sodiumMg: 410,
    imageUrl: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 160,
    isJainFriendly: false,
    ingredients: [
      { ingredientId: 'ing-rajma', quantity: 250, unit: 'g', notes: 'soaked overnight for 8 hours' },
      { ingredientId: 'ing-basmati-rice', quantity: 300, unit: 'g', notes: 'aged long grain' },
      { ingredientId: 'ing-onion', quantity: 200, unit: 'g', notes: 'finely chopped' },
      { ingredientId: 'ing-tomato', quantity: 250, unit: 'g', notes: 'pureed' },
      { ingredientId: 'ing-ginger', quantity: 20, unit: 'g' },
      { ingredientId: 'ing-garlic', quantity: 20, unit: 'g' },
      { ingredientId: 'ing-cumin-seeds', quantity: 8, unit: 'g' },
      { ingredientId: 'ing-garam-masala', quantity: 6, unit: 'g' },
      { ingredientId: 'ing-red-chilli-powder', quantity: 8, unit: 'g' },
      { ingredientId: 'ing-ghee', quantity: 25, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 10, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Pressure cook soaked rajma with salt and water for 6-7 whistles until melt-in-the-mouth soft.', durationMinutes: 15 },
      { stepNumber: 2, instruction: 'Heat ghee in a deep pan. Sauté cumin seeds, ginger, garlic, and onions until deep caramelized brown.', durationMinutes: 8 },
      { stepNumber: 3, instruction: 'Add tomato puree, red chilli powder, and garam masala. Cook until oil releases on sides.', durationMinutes: 8 },
      { stepNumber: 4, instruction: 'Add boiled rajma with cooking liquid. Mash a ladle of beans to naturally thicken the gravy. Simmer on low flame for 15 minutes.', durationMinutes: 15 },
      { stepNumber: 5, instruction: 'Cook basmati rice with cumin seeds. Ladle piping hot rajma over jeera rice and top with sliced onions and ghee.', durationMinutes: 5 }
    ]
  },
  {
    id: 'recipe-palak-paneer',
    title: 'Creamy Homestyle Palak Paneer',
    slug: 'homestyle-palak-paneer',
    description: 'Blanched fresh green spinach puree infused with garlic, cumin, and mild spices, gently folded with soft paneer cubes.',
    cuisine: 'North Indian',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'High-Protein', 'Gluten-Free'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    defaultServings: 4,
    difficulty: 'Easy',
    proteinSource: 'paneer',
    caloriesPerServing: 320,
    proteinGrams: 15,
    carbsGrams: 10,
    fatGrams: 24,
    fiberGrams: 5,
    sugarGrams: 2.8,
    sodiumMg: 390,
    imageUrl: 'https://images.unsplash.com/photo-1589647363585-745280b57b8f?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 210,
    isJainFriendly: false,
    ingredients: [
      { ingredientId: 'ing-palak', quantity: 500, unit: 'g', notes: 'fresh leaves washed thoroughly' },
      { ingredientId: 'ing-paneer', quantity: 250, unit: 'g', notes: 'soft cubes' },
      { ingredientId: 'ing-onion', quantity: 100, unit: 'g', notes: 'finely minced' },
      { ingredientId: 'ing-garlic', quantity: 25, unit: 'g', notes: 'slivered and roasted' },
      { ingredientId: 'ing-ginger', quantity: 15, unit: 'g' },
      { ingredientId: 'ing-green-chilli', quantity: 10, unit: 'g' },
      { ingredientId: 'ing-butter', quantity: 25, unit: 'g' },
      { ingredientId: 'ing-cumin-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-garam-masala', quantity: 4, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 6, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Blanch palak in boiling water for 2 minutes, then immediately plunge into ice cold water to preserve vibrant emerald color.', durationMinutes: 5 },
      { stepNumber: 2, instruction: 'Puree blanched spinach with green chillies and ginger into a smooth velvet paste.', durationMinutes: 3 },
      { stepNumber: 3, instruction: 'Melt butter in a pan. Splutter cumin seeds and sauté slivered garlic until golden aromatic.', durationMinutes: 4 },
      { stepNumber: 4, instruction: 'Stir in pureed spinach, salt, and garam masala. Simmer gently for 4 minutes.', durationMinutes: 4 },
      { stepNumber: 5, instruction: 'Drop in fresh paneer cubes and warm through for 2 minutes. Serve with hot phulkas.', durationMinutes: 2 }
    ]
  },
  {
    id: 'recipe-kanda-poha',
    title: 'Mumbai Style Batata Kanda Poha',
    slug: 'batata-kanda-poha',
    description: 'Fluffy flattened rice tossed with crunchy peanuts, diced potatoes, caramelized onions, mustard seeds, and fresh lime.',
    cuisine: 'Maharashtrian',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Kid-Friendly'],
    mealTypes: ['breakfast', 'snack'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    defaultServings: 4,
    difficulty: 'Easy',
    caloriesPerServing: 240,
    proteinGrams: 5,
    carbsGrams: 42,
    fatGrams: 6,
    fiberGrams: 3,
    sugarGrams: 2.5,
    sodiumMg: 310,
    imageUrl: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 70,
    isJainFriendly: false,
    ingredients: [
      { ingredientId: 'ing-poha', quantity: 250, unit: 'g', notes: 'thick poha rinsed gently in colander' },
      { ingredientId: 'ing-onion', quantity: 120, unit: 'g', notes: 'finely sliced' },
      { ingredientId: 'ing-potato', quantity: 150, unit: 'g', notes: 'small cubes for quick cooking' },
      { ingredientId: 'ing-peanuts', quantity: 40, unit: 'g', notes: 'roasted to a crisp' },
      { ingredientId: 'ing-green-chilli', quantity: 10, unit: 'g' },
      { ingredientId: 'ing-mustard-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-curry-leaves', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-lemon', quantity: 1, unit: 'piece' },
      { ingredientId: 'ing-oil', quantity: 20, unit: 'ml' },
      { ingredientId: 'ing-coriander', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-salt', quantity: 6, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Rinse poha in a colander until moist, drain completely, and toss with turmeric and salt.', durationMinutes: 3 },
      { stepNumber: 2, instruction: 'Heat oil in a kadai. Fry peanuts until crisp and remove. In same oil, splutter mustard seeds and curry leaves.', durationMinutes: 4 },
      { stepNumber: 3, instruction: 'Add potato cubes, cover and steam on low heat until soft. Add onions and green chillies; sauté until translucent.', durationMinutes: 6 },
      { stepNumber: 4, instruction: 'Gently fold in softened poha and fried peanuts. Cover and steam for 3 minutes.', durationMinutes: 3 },
      { stepNumber: 5, instruction: 'Turn off heat, squeeze fresh lemon juice, and garnish with fresh coriander.', durationMinutes: 2 }
    ]
  },
  {
    id: 'recipe-moong-dal-khichdi',
    title: 'Sattvic Moong Dal Khichdi with Desi Ghee',
    slug: 'moong-dal-khichdi',
    description: 'The ultimate comforting, gut-healing Indian one-pot meal made with yellow moong dal, basmati rice, turmeric, and aromatic cumin ghee tadka.',
    cuisine: 'Gujarati',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Jain Friendly', 'Diabetic-Friendly', 'Kid-Friendly'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    defaultServings: 4,
    difficulty: 'Easy',
    proteinSource: 'dal',
    caloriesPerServing: 260,
    proteinGrams: 10,
    carbsGrams: 45,
    fatGrams: 6,
    fiberGrams: 5,
    sugarGrams: 1.1,
    sodiumMg: 280,
    imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 90,
    isJainFriendly: true,
    ingredients: [
      { ingredientId: 'ing-basmati-rice', quantity: 150, unit: 'g' },
      { ingredientId: 'ing-moong-dal', quantity: 150, unit: 'g', notes: 'split yellow moong dal' },
      { ingredientId: 'ing-ghee', quantity: 30, unit: 'g', notes: 'pure cow ghee' },
      { ingredientId: 'ing-cumin-seeds', quantity: 8, unit: 'g' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-green-chilli', quantity: 10, unit: 'g', notes: 'slit' },
      { ingredientId: 'ing-salt', quantity: 8, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Wash rice and moong dal together until water runs clear. Soak for 15 minutes.', durationMinutes: 5 },
      { stepNumber: 2, instruction: 'In a pressure cooker, heat 1 tbsp ghee. Splutter cumin seeds and add slit green chillies.', durationMinutes: 3 },
      { stepNumber: 3, instruction: 'Add soaked rice-dal, turmeric, salt, and 4.5 cups of water for a comforting porridge-like texture.', durationMinutes: 2 },
      { stepNumber: 4, instruction: 'Pressure cook for 4 whistles on medium flame. Allow natural pressure release.', durationMinutes: 10 },
      { stepNumber: 5, instruction: 'Open lid, swirl with remaining hot cow ghee, and serve with Gujarati kadhi, papad, and fresh curd.', durationMinutes: 2 }
    ]
  },
  {
    id: 'recipe-egg-curry',
    title: 'Dhaba Style Masala Egg Curry',
    slug: 'dhaba-style-egg-curry',
    description: 'Golden shallow-fried boiled eggs enveloped in a spiced onion, tomato, and garam masala gravy.',
    cuisine: 'North Indian',
    dietaryTags: ['Eggetarian', 'High-Protein', 'Gluten-Free'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    defaultServings: 4,
    difficulty: 'Easy',
    proteinSource: 'eggs',
    caloriesPerServing: 280,
    proteinGrams: 14,
    carbsGrams: 12,
    fatGrams: 18,
    fiberGrams: 3,
    sugarGrams: 3.2,
    sodiumMg: 430,
    imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 130,
    isJainFriendly: false,
    ingredients: [
      { ingredientId: 'ing-eggs', quantity: 8, unit: 'piece', notes: 'hard boiled and peeled' },
      { ingredientId: 'ing-onion', quantity: 180, unit: 'g', notes: 'finely chopped' },
      { ingredientId: 'ing-tomato', quantity: 200, unit: 'g', notes: 'crushed' },
      { ingredientId: 'ing-ginger', quantity: 15, unit: 'g' },
      { ingredientId: 'ing-garlic', quantity: 15, unit: 'g' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-red-chilli-powder', quantity: 8, unit: 'g' },
      { ingredientId: 'ing-garam-masala', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-oil', quantity: 30, unit: 'ml' },
      { ingredientId: 'ing-salt', quantity: 8, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Prick boiled eggs with a fork. Rub with a pinch of turmeric and chilli. Shallow fry in 1 tbsp oil until blistered golden.', durationMinutes: 5 },
      { stepNumber: 2, instruction: 'In the remaining oil, sauté cumin, chopped onions, ginger, and garlic until golden brown.', durationMinutes: 7 },
      { stepNumber: 3, instruction: 'Add tomatoes and dry spices. Cook until oil leaves masala.', durationMinutes: 6 },
      { stepNumber: 4, instruction: 'Pour in 1 cup warm water, drop in fried eggs, and simmer for 5 minutes.', durationMinutes: 5 },
      { stepNumber: 5, instruction: 'Garnish with coriander and serve with steamed rice or parotta.', durationMinutes: 2 }
    ]
  },
  {
    id: 'recipe-khaman-dhokla',
    title: 'Surati Nylon Khaman Dhokla',
    slug: 'surati-khaman-dhokla',
    description: 'Feather-light, spongy savory steamed cakes made from gram flour, drizzled with sweet-tangy mustard and green chilli tempering.',
    cuisine: 'Gujarati',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Jain Friendly', 'Kid-Friendly'],
    mealTypes: ['breakfast', 'snack'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    defaultServings: 4,
    difficulty: 'Easy',
    caloriesPerServing: 160,
    proteinGrams: 6,
    carbsGrams: 24,
    fatGrams: 4,
    fiberGrams: 3,
    sugarGrams: 5.5,
    sodiumMg: 360,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 65,
    isJainFriendly: true,
    ingredients: [
      { ingredientId: 'ing-besan', quantity: 200, unit: 'g', notes: 'fine gram flour sieved' },
      { ingredientId: 'ing-green-chilli', quantity: 10, unit: 'g', notes: 'slit for tempering' },
      { ingredientId: 'ing-mustard-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-curry-leaves', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-lemon', quantity: 1, unit: 'piece' },
      { ingredientId: 'ing-oil', quantity: 20, unit: 'ml' },
      { ingredientId: 'ing-turmeric', quantity: 2, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 6, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Whisk besan with water, lemon juice, salt, and turmeric into a lump-free batter.', durationMinutes: 5 },
      { stepNumber: 2, instruction: 'Add fruit salt/baking soda with a drop of water and whisk vigorously until batter doubles in volume.', durationMinutes: 2 },
      { stepNumber: 3, instruction: 'Immediately pour into greased steamer pan and steam on high flame for 15 minutes.', durationMinutes: 15 },
      { stepNumber: 4, instruction: 'Make vaghar: heat oil, add mustard seeds, curry leaves, slit chillies, and 1/2 cup warm sweet-lemon water.', durationMinutes: 4 },
      { stepNumber: 5, instruction: 'Pour warm vaghar evenly over sliced warm dhokla so it absorbs all moisture. Serve soft and juicy.', durationMinutes: 3 }
    ]
  },
  {
    id: 'recipe-amritsari-chole',
    title: 'Authentic Amritsari Pindi Chole',
    slug: 'amritsari-chole',
    description: 'Dark, tangy and robust Punjabi chickpeas slow-simmered with pomegranate seeds, amchoor, and aromatic whole spices.',
    cuisine: 'Punjabi',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'High-Protein', 'Gluten-Free'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    defaultServings: 4,
    difficulty: 'Medium',
    proteinSource: 'chickpeas',
    caloriesPerServing: 320,
    proteinGrams: 16,
    carbsGrams: 48,
    fatGrams: 8,
    fiberGrams: 11,
    sugarGrams: 3.1,
    sodiumMg: 440,
    imageUrl: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 110,
    isJainFriendly: false,
    ingredients: [
      { ingredientId: 'ing-kabuli-chana', quantity: 250, unit: 'g', notes: 'soaked overnight' },
      { ingredientId: 'ing-onion', quantity: 150, unit: 'g', notes: 'finely pureed' },
      { ingredientId: 'ing-tomato', quantity: 200, unit: 'g', notes: 'crushed' },
      { ingredientId: 'ing-ginger', quantity: 15, unit: 'g', notes: 'julienned' },
      { ingredientId: 'ing-garlic', quantity: 15, unit: 'g', notes: 'minced' },
      { ingredientId: 'ing-chole-masala', quantity: 15, unit: 'g' },
      { ingredientId: 'ing-ghee', quantity: 20, unit: 'g' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-red-chilli-powder', quantity: 8, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 8, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Pressure cook soaked kabuli chana with tea bag and salt for 6 whistles until melt-in-mouth soft.', durationMinutes: 15 },
      { stepNumber: 2, instruction: 'Heat desi ghee, brown pureed onions, add ginger-garlic paste and sauté until deep golden brown.', durationMinutes: 8 },
      { stepNumber: 3, instruction: 'Add crushed tomatoes and chole masala. Cook until oil separates.', durationMinutes: 5 },
      { stepNumber: 4, instruction: 'Add boiled chana and simmer for 10 minutes, lightly mashing some chickpeas for a rich thick gravy.', durationMinutes: 10 }
    ]
  },
  {
    id: 'recipe-dal-tadka',
    title: 'Dhaba Style Yellow Dal Tadka',
    slug: 'dal-tadka',
    description: 'Creamy slow-simmered yellow toor and moong lentils finished with a double sizzling tadka of cow ghee, cumin, and garlic.',
    cuisine: 'North Indian',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'High-Protein', 'Gluten-Free'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    defaultServings: 4,
    difficulty: 'Easy',
    proteinSource: 'dal',
    caloriesPerServing: 210,
    proteinGrams: 11,
    carbsGrams: 32,
    fatGrams: 6,
    fiberGrams: 7,
    sugarGrams: 1.8,
    sodiumMg: 350,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 85,
    isJainFriendly: false,
    ingredients: [
      { ingredientId: 'ing-toor-dal', quantity: 150, unit: 'g' },
      { ingredientId: 'ing-moong-dal', quantity: 50, unit: 'g' },
      { ingredientId: 'ing-tomato', quantity: 120, unit: 'g' },
      { ingredientId: 'ing-onion', quantity: 100, unit: 'g' },
      { ingredientId: 'ing-garlic', quantity: 15, unit: 'g', notes: 'thinly sliced' },
      { ingredientId: 'ing-ghee', quantity: 25, unit: 'g' },
      { ingredientId: 'ing-cumin-seeds', quantity: 6, unit: 'g' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 8, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Pressure cook toor and moong dal with turmeric, salt, and water for 4 whistles.', durationMinutes: 12 },
      { stepNumber: 2, instruction: 'In a pan, heat ghee and prepare tadka with cumin, sliced garlic, onions, and tomatoes.', durationMinutes: 5 },
      { stepNumber: 3, instruction: 'Pour hot sizzling tadka over the dal and garnish with fresh coriander.', durationMinutes: 3 }
    ]
  },
  {
    id: 'recipe-aloo-gobi',
    title: 'Homestyle Adraki Aloo Gobi',
    slug: 'adraki-aloo-gobi',
    description: 'Tender cauliflower florets and golden potatoes sautéed with loads of freshly julienned ginger, turmeric, and roasted cumin.',
    cuisine: 'North Indian',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Vegan', 'Gluten-Free'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    defaultServings: 4,
    difficulty: 'Easy',
    caloriesPerServing: 195,
    proteinGrams: 5,
    carbsGrams: 28,
    fatGrams: 7,
    fiberGrams: 6,
    sugarGrams: 2.6,
    sodiumMg: 320,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 75,
    isJainFriendly: false,
    ingredients: [
      { ingredientId: 'ing-cauliflower', quantity: 350, unit: 'g', notes: 'cut into medium florets' },
      { ingredientId: 'ing-potato', quantity: 250, unit: 'g', notes: 'peeled and diced' },
      { ingredientId: 'ing-tomato', quantity: 120, unit: 'g' },
      { ingredientId: 'ing-ginger', quantity: 25, unit: 'g', notes: 'copious juliennes' },
      { ingredientId: 'ing-green-chilli', quantity: 10, unit: 'g' },
      { ingredientId: 'ing-oil', quantity: 25, unit: 'ml' },
      { ingredientId: 'ing-cumin-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-coriander-powder', quantity: 6, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 6, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Heat mustard oil in kadai. Splutter cumin seeds and add half of ginger juliennes.', durationMinutes: 3 },
      { stepNumber: 2, instruction: 'Add potatoes and cauliflower. Sauté on high flame for 4 minutes to seal flavor.', durationMinutes: 4 },
      { stepNumber: 3, instruction: 'Add dry spices, diced tomatoes, cover and steam on low flame for 12 minutes.', durationMinutes: 12 },
      { stepNumber: 4, instruction: 'Uncover, top with fresh ginger and coriander. Serve hot with phulkas.', durationMinutes: 2 }
    ]
  },
  {
    id: 'recipe-idli-sambar',
    title: 'Steamed Idli with Drumstick Vegetable Sambar',
    slug: 'idli-sambar',
    description: 'Pillowy soft fermented steamed rice cakes served with aromatic Madras lentil sambar and fresh coconut chutney.',
    cuisine: 'South Indian',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Jain Friendly'],
    mealTypes: ['breakfast'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    defaultServings: 4,
    difficulty: 'Easy',
    caloriesPerServing: 220,
    proteinGrams: 8,
    carbsGrams: 42,
    fatGrams: 3,
    fiberGrams: 5,
    sugarGrams: 3.5,
    sodiumMg: 450,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 90,
    isJainFriendly: true,
    ingredients: [
      { ingredientId: 'ing-dosa-batter', quantity: 600, unit: 'ml', notes: 'fresh fermented idli batter' },
      { ingredientId: 'ing-toor-dal', quantity: 120, unit: 'g' },
      { ingredientId: 'ing-tomato', quantity: 100, unit: 'g' },
      { ingredientId: 'ing-sambar-powder', quantity: 15, unit: 'g' },
      { ingredientId: 'ing-mustard-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-curry-leaves', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-ghee', quantity: 15, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 8, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Pour batter into greased idli molds and steam on high for 10 minutes.', durationMinutes: 10 },
      { stepNumber: 2, instruction: 'Boil toor dal with tomatoes and sambar powder. Simmer for 8 minutes.', durationMinutes: 8 },
      { stepNumber: 3, instruction: 'Temper with mustard seeds, curry leaves, and ghee. Serve steaming hot with idlis.', durationMinutes: 3 }
    ]
  },
  {
    id: 'recipe-rava-upma',
    title: 'Spiced Vegetable Rava Upma',
    slug: 'rava-upma',
    description: 'Classic South Indian roasted semolina breakfast tempered with mustard, crunchy roasted peanuts, ginger, and curry leaves.',
    cuisine: 'South Indian',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Jain Friendly', 'Kid-Friendly'],
    mealTypes: ['breakfast', 'snack'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    defaultServings: 4,
    difficulty: 'Easy',
    caloriesPerServing: 230,
    proteinGrams: 6,
    carbsGrams: 38,
    fatGrams: 7,
    fiberGrams: 4,
    sugarGrams: 1.4,
    sodiumMg: 330,
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 60,
    isJainFriendly: true,
    ingredients: [
      { ingredientId: 'ing-rava', quantity: 200, unit: 'g', notes: 'roasted golden sooji' },
      { ingredientId: 'ing-peanuts', quantity: 30, unit: 'g' },
      { ingredientId: 'ing-ginger', quantity: 10, unit: 'g', notes: 'finely minced' },
      { ingredientId: 'ing-green-chilli', quantity: 10, unit: 'g' },
      { ingredientId: 'ing-mustard-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-curry-leaves', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-ghee', quantity: 20, unit: 'g' },
      { ingredientId: 'ing-lemon', quantity: 1, unit: 'piece' },
      { ingredientId: 'ing-salt', quantity: 6, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Dry roast rava on medium flame until fragrant and slightly pink. Set aside.', durationMinutes: 4 },
      { stepNumber: 2, instruction: 'Heat ghee in a pan. Fry peanuts until crisp. Add mustard seeds, ginger, green chillies, and curry leaves.', durationMinutes: 3 },
      { stepNumber: 3, instruction: 'Add 3 cups water and salt; bring to rolling boil. Slowly stream in roasted rava whisking continuously to avoid lumps.', durationMinutes: 3 },
      { stepNumber: 4, instruction: 'Cover and steam for 3 minutes on low flame. Finish with lemon juice and a dollop of ghee.', durationMinutes: 2 }
    ]
  },
  {
    id: 'recipe-bhindi-masala',
    title: 'Chatpati Homestyle Bhindi Masala',
    slug: 'bhindi-masala',
    description: 'Crisp-tender okra tossed in tangy amchoor, roasted coriander powder, cumin, and sliced green chillies.',
    cuisine: 'North Indian',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Jain Friendly'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    defaultServings: 4,
    difficulty: 'Easy',
    caloriesPerServing: 165,
    proteinGrams: 4,
    carbsGrams: 16,
    fatGrams: 9,
    fiberGrams: 5,
    sugarGrams: 2.2,
    sodiumMg: 290,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 70,
    isJainFriendly: true,
    ingredients: [
      { ingredientId: 'ing-bhindi', quantity: 400, unit: 'g', notes: 'washed, dried thoroughly, and sliced' },
      { ingredientId: 'ing-tomato', quantity: 100, unit: 'g' },
      { ingredientId: 'ing-green-chilli', quantity: 10, unit: 'g' },
      { ingredientId: 'ing-oil', quantity: 30, unit: 'ml' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-coriander-powder', quantity: 8, unit: 'g' },
      { ingredientId: 'ing-red-chilli-powder', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 6, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Heat oil in wide kadai. Add sliced bhindi and shallow fry uncovered on medium-high heat for 8 minutes until non-sticky.', durationMinutes: 8 },
      { stepNumber: 2, instruction: 'Add turmeric, coriander powder, chilli powder, tomatoes, and salt.', durationMinutes: 4 },
      { stepNumber: 3, instruction: 'Toss on high heat for 3 minutes until crisp and caramelized.', durationMinutes: 3 }
    ]
  },
  {
    id: 'recipe-sambhar-rice',
    title: 'Chennai Sambar Sadam (One-Pot Sambar Rice)',
    slug: 'sambar-sadam',
    description: 'Hearty Tamil Nadu style one-pot rice and toor dal simmered with country vegetables, tangy tamarind, and fragrant ghee tadka.',
    cuisine: 'South Indian',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Gluten-Free'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    defaultServings: 4,
    difficulty: 'Easy',
    caloriesPerServing: 290,
    proteinGrams: 9,
    carbsGrams: 52,
    fatGrams: 6,
    fiberGrams: 6,
    sugarGrams: 3.0,
    sodiumMg: 420,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 95,
    isJainFriendly: false,
    ingredients: [
      { ingredientId: 'ing-basmati-rice', quantity: 180, unit: 'g' },
      { ingredientId: 'ing-toor-dal', quantity: 120, unit: 'g' },
      { ingredientId: 'ing-tomato', quantity: 120, unit: 'g' },
      { ingredientId: 'ing-onion', quantity: 100, unit: 'g' },
      { ingredientId: 'ing-sambar-powder', quantity: 18, unit: 'g' },
      { ingredientId: 'ing-mustard-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-curry-leaves', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-ghee', quantity: 25, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 8, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Pressure cook rice and toor dal together with 4 cups water and turmeric for 5 whistles until very soft.', durationMinutes: 15 },
      { stepNumber: 2, instruction: 'In a pan, cook onions, tomatoes, and vegetables with sambar powder in tamarind water.', durationMinutes: 8 },
      { stepNumber: 3, instruction: 'Combine cooked dal-rice with vegetable sambar broth. Simmer together for 5 minutes.', durationMinutes: 5 },
      { stepNumber: 4, instruction: 'Pour over hot cow ghee tadka with mustard and curry leaves. Serve with potato fry and papadum.', durationMinutes: 2 }
    ]
  },
  {
    id: 'recipe-baingan-bharta',
    title: 'Dhaba Style Smoked Baingan Bharta',
    slug: 'baingan-bharta',
    description: 'Charcoal-roasted large eggplant mashed and braised with browned onions, ripe tomatoes, fresh green chillies, and ginger.',
    cuisine: 'Punjabi',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Vegan', 'Gluten-Free'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    defaultServings: 4,
    difficulty: 'Medium',
    caloriesPerServing: 180,
    proteinGrams: 4,
    carbsGrams: 18,
    fatGrams: 9,
    fiberGrams: 7,
    sugarGrams: 4.0,
    sodiumMg: 310,
    imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 80,
    isJainFriendly: false,
    ingredients: [
      { ingredientId: 'ing-baingan', quantity: 500, unit: 'g', notes: 'roasted over open flame until skin blisters black' },
      { ingredientId: 'ing-onion', quantity: 150, unit: 'g', notes: 'finely chopped' },
      { ingredientId: 'ing-tomato', quantity: 180, unit: 'g', notes: 'finely chopped' },
      { ingredientId: 'ing-garlic', quantity: 15, unit: 'g', notes: 'minced' },
      { ingredientId: 'ing-ginger', quantity: 15, unit: 'g', notes: 'finely chopped' },
      { ingredientId: 'ing-green-chilli', quantity: 10, unit: 'g' },
      { ingredientId: 'ing-oil', quantity: 30, unit: 'ml', notes: 'mustard oil' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-red-chilli-powder', quantity: 6, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 7, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Roast large eggplant over direct gas flame until skin is completely charred and flesh collapses. Peel and mash.', durationMinutes: 12 },
      { stepNumber: 2, instruction: 'Heat mustard oil to smoking point. Sauté chopped garlic, ginger, green chillies, and onions until deep brown.', durationMinutes: 8 },
      { stepNumber: 3, instruction: 'Add chopped tomatoes and dry spices. Cook until oil separates from the masala.', durationMinutes: 6 },
      { stepNumber: 4, instruction: 'Fold in mashed roasted eggplant and sauté vigorously on high flame for 5 minutes. Garnish with chopped coriander.', durationMinutes: 5 }
    ]
  },
  {
    id: 'recipe-punjabi-chicken-curry',
    title: 'Dhaba Style Tariwala Chicken Curry',
    slug: 'tariwala-chicken-curry',
    description: 'Rustic homestyle Punjabi chicken curry simmered in a golden onion-tomato gravy with bone-in chicken cuts, garlic, and freshly crushed spices.',
    cuisine: 'Punjabi',
    dietaryTags: ['Non-Vegetarian', 'High-Protein', 'Gluten-Free'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    defaultServings: 4,
    difficulty: 'Medium',
    proteinSource: 'chicken',
    caloriesPerServing: 340,
    proteinGrams: 28,
    carbsGrams: 10,
    fatGrams: 16,
    fiberGrams: 3,
    sugarGrams: 2.8,
    sodiumMg: 460,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 280,
    isJainFriendly: false,
    ingredients: [
      { ingredientId: 'ing-chicken', quantity: 500, unit: 'g', notes: 'curry cut bone-in' },
      { ingredientId: 'ing-onion', quantity: 200, unit: 'g', notes: 'finely sliced' },
      { ingredientId: 'ing-tomato', quantity: 200, unit: 'g', notes: 'pureed' },
      { ingredientId: 'ing-ginger', quantity: 20, unit: 'g', notes: 'crushed' },
      { ingredientId: 'ing-garlic', quantity: 20, unit: 'g', notes: 'crushed' },
      { ingredientId: 'ing-oil', quantity: 30, unit: 'ml', notes: 'mustard oil' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-red-chilli-powder', quantity: 8, unit: 'g' },
      { ingredientId: 'ing-garam-masala', quantity: 6, unit: 'g' },
      { ingredientId: 'ing-coriander', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-salt', quantity: 10, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Heat mustard oil to smoking point. Sauté onions until deep reddish brown.', durationMinutes: 8 },
      { stepNumber: 2, instruction: 'Add ginger-garlic paste and sauté for 2 minutes. Stir in pureed tomatoes and spices until oil separates.', durationMinutes: 6 },
      { stepNumber: 3, instruction: 'Add chicken pieces and bhunno on high heat for 5 minutes until sealed.', durationMinutes: 5 },
      { stepNumber: 4, instruction: 'Add 1.5 cups warm water, cover and simmer for 15 minutes until chicken is tender and gravy is fragrant.', durationMinutes: 15 },
      { stepNumber: 5, instruction: 'Garnish with freshly chopped coriander and serve with hot phulkas or rice.', durationMinutes: 2 }
    ]
  },
  {
    id: 'recipe-bengali-macher-jhol',
    title: 'Authentic Bengali Macher Jhol',
    slug: 'bengali-macher-jhol',
    description: 'Light and comforting Kolkata style fish curry made with fresh fish steaks, potato wedges, kalonji, turmeric, and green chillies in mustard oil.',
    cuisine: 'Bengali',
    dietaryTags: ['Non-Vegetarian', 'High-Protein', 'Gluten-Free'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    defaultServings: 4,
    difficulty: 'Medium',
    proteinSource: 'fish',
    caloriesPerServing: 280,
    proteinGrams: 24,
    carbsGrams: 16,
    fatGrams: 12,
    fiberGrams: 2,
    sugarGrams: 1.5,
    sodiumMg: 420,
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 260,
    isJainFriendly: false,
    ingredients: [
      { ingredientId: 'ing-fish', quantity: 400, unit: 'g', notes: 'fresh Rohu or Katla steaks' },
      { ingredientId: 'ing-potato', quantity: 150, unit: 'g', notes: 'cut into long wedges' },
      { ingredientId: 'ing-tomato', quantity: 100, unit: 'g', notes: 'sliced' },
      { ingredientId: 'ing-ginger', quantity: 15, unit: 'g', notes: 'paste' },
      { ingredientId: 'ing-green-chilli', quantity: 10, unit: 'g', notes: 'slit' },
      { ingredientId: 'ing-oil', quantity: 25, unit: 'ml', notes: 'pure mustard oil' },
      { ingredientId: 'ing-cumin-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-turmeric', quantity: 6, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 8, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Marinate fish steaks with turmeric and salt. Lightly shallow fry in hot mustard oil for 2 minutes per side and set aside.', durationMinutes: 5 },
      { stepNumber: 2, instruction: 'In the same oil, fry potato wedges until golden. Splutter cumin seeds and add slit green chillies with ginger paste.', durationMinutes: 4 },
      { stepNumber: 3, instruction: 'Pour in 2 cups warm water, add sliced tomatoes, turmeric, and salt. Bring to a rolling boil until potatoes are tender.', durationMinutes: 8 },
      { stepNumber: 4, instruction: 'Gently slip in fried fish steaks and simmer for 3 minutes. Serve hot with steamed Gobindobhog or Basmati rice.', durationMinutes: 3 }
    ]
  },
  {
    id: 'recipe-bengali-cholar-dal',
    title: 'Traditional Bengali Narkel Cholar Dal',
    slug: 'bengali-cholar-dal',
    description: 'Festive festive Bengal chana dal slow-simmered with ginger, cumin, bay leaf, and crisp fried coconut chips. Naturally plant-based and Jain permissible.',
    cuisine: 'Bengali',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Vegan', 'Jain Friendly', 'High-Protein'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    defaultServings: 4,
    difficulty: 'Easy',
    proteinSource: 'dal',
    caloriesPerServing: 230,
    proteinGrams: 12,
    carbsGrams: 36,
    fatGrams: 6,
    fiberGrams: 8,
    sugarGrams: 3.5,
    sodiumMg: 340,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 105,
    isJainFriendly: true,
    ingredients: [
      { ingredientId: 'ing-chana-dal', quantity: 200, unit: 'g', notes: 'soaked for 1 hour' },
      { ingredientId: 'ing-green-chilli', quantity: 10, unit: 'g', notes: 'slit' },
      { ingredientId: 'ing-oil', quantity: 20, unit: 'ml', notes: 'mustard oil or refined oil' },
      { ingredientId: 'ing-cumin-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 8, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Pressure cook chana dal with turmeric, salt, and water for 3 whistles until cooked through but grains remain distinct.', durationMinutes: 12 },
      { stepNumber: 2, instruction: 'Heat oil in a kadai. Splutter cumin seeds and sauté slit green chillies until aromatic.', durationMinutes: 3 },
      { stepNumber: 3, instruction: 'Pour in the cooked dal, adjust consistency with warm water, and simmer for 6 minutes.', durationMinutes: 6 },
      { stepNumber: 4, instruction: 'Serve piping hot with luchi or steamed basmati rice.', durationMinutes: 2 }
    ]
  },
  {
    id: 'recipe-jain-paneer-bhurji',
    title: 'Sattvic Jain Malai Paneer Bhurji',
    slug: 'jain-paneer-bhurji',
    description: 'Scrambled fresh paneer tossed with ripe country tomatoes, fresh green chillies, crushed kasuri methi, and fragrant cumin ghee tadka. 100% root-vegetable free.',
    cuisine: 'North Indian',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Jain Friendly', 'High-Protein', 'Gluten-Free'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    defaultServings: 4,
    difficulty: 'Easy',
    proteinSource: 'paneer',
    caloriesPerServing: 280,
    proteinGrams: 16,
    carbsGrams: 8,
    fatGrams: 20,
    fiberGrams: 2,
    sugarGrams: 2.1,
    sodiumMg: 310,
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 160,
    isJainFriendly: true,
    ingredients: [
      { ingredientId: 'ing-paneer', quantity: 300, unit: 'g', notes: 'freshly crumbled' },
      { ingredientId: 'ing-tomato', quantity: 200, unit: 'g', notes: 'finely chopped' },
      { ingredientId: 'ing-green-chilli', quantity: 10, unit: 'g', notes: 'finely minced' },
      { ingredientId: 'ing-ghee', quantity: 25, unit: 'g', notes: 'desi cow ghee' },
      { ingredientId: 'ing-cumin-seeds', quantity: 6, unit: 'g' },
      { ingredientId: 'ing-turmeric', quantity: 4, unit: 'g' },
      { ingredientId: 'ing-kasuri-methi', quantity: 4, unit: 'g' },
      { ingredientId: 'ing-coriander', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-salt', quantity: 6, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Heat desi ghee in a pan. Splutter cumin seeds and add minced green chillies.', durationMinutes: 2 },
      { stepNumber: 2, instruction: 'Add chopped tomatoes, turmeric, and salt. Sauté until tomatoes turn pulpy and ghee releases at edges.', durationMinutes: 5 },
      { stepNumber: 3, instruction: 'Fold in crumbled paneer and crushed kasuri methi. Toss gently on medium heat for 3 minutes.', durationMinutes: 3 },
      { stepNumber: 4, instruction: 'Garnish with fresh coriander leaves and serve immediately with hot phulkas.', durationMinutes: 2 }
    ]
  },
  {
    id: 'recipe-jain-moong-dal-tadka',
    title: 'Sattvic Homestyle Moong Dal Tadka',
    slug: 'jain-moong-dal-tadka',
    description: 'Golden yellow moong dal simmered with turmeric and tempered with sizzling cow ghee, cumin seeds, fresh curry leaves, and green chillies.',
    cuisine: 'North Indian',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Jain Friendly', 'High-Protein', 'Gluten-Free'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    defaultServings: 4,
    difficulty: 'Easy',
    proteinSource: 'dal',
    caloriesPerServing: 210,
    proteinGrams: 11,
    carbsGrams: 30,
    fatGrams: 5,
    fiberGrams: 6,
    sugarGrams: 1.5,
    sodiumMg: 280,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 85,
    isJainFriendly: true,
    ingredients: [
      { ingredientId: 'ing-moong-dal', quantity: 200, unit: 'g', notes: 'washed yellow split moong dal' },
      { ingredientId: 'ing-tomato', quantity: 150, unit: 'g', notes: 'finely chopped' },
      { ingredientId: 'ing-green-chilli', quantity: 10, unit: 'g' },
      { ingredientId: 'ing-curry-leaves', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-ghee', quantity: 20, unit: 'g' },
      { ingredientId: 'ing-cumin-seeds', quantity: 6, unit: 'g' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-coriander', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-salt', quantity: 8, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Pressure cook moong dal with chopped tomatoes, turmeric, salt, and 3 cups water for 3 whistles.', durationMinutes: 12 },
      { stepNumber: 2, instruction: 'Whisk dal lightly to achieve a velvety homestyle consistency.', durationMinutes: 2 },
      { stepNumber: 3, instruction: 'In a small tadka pan, heat cow ghee. Add cumin seeds, curry leaves, and green chillies until crackling.', durationMinutes: 3 },
      { stepNumber: 4, instruction: 'Pour sizzling tadka over dal, cover for 2 minutes to trap aroma, garnish with coriander, and serve.', durationMinutes: 3 }
    ]
  },

  // ---------------- Authentic Gujarati & Kathiyawadi Regional Recipes ----------------
  {
    id: 'recipe-sev-tameta-nu-shaak',
    title: 'Kathiyawadi Sev Tameta nu Shaak',
    slug: 'kathiyawadi-sev-tameta-nu-shaak',
    description: 'Iconic sweet, tangy, and spicy tomato curry tempered with mustard and cumin, topped with crisp Ratlami nylon sev right before serving.',
    cuisine: 'Kathiyawadi',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Jain Friendly'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    defaultServings: 4,
    difficulty: 'Easy',
    proteinSource: 'mixed-veg',
    caloriesPerServing: 245,
    proteinGrams: 7.2,
    carbsGrams: 28.5,
    fatGrams: 11.8,
    fiberGrams: 3.2,
    sugarGrams: 8.5,
    sodiumMg: 340,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 90,
    isJainFriendly: true,
    ingredients: [
      { ingredientId: 'ing-tomato', quantity: 350, unit: 'g', notes: 'juicy country tomatoes chopped' },
      { ingredientId: 'ing-sev', quantity: 100, unit: 'g', notes: 'crisp nylon sev' },
      { ingredientId: 'ing-green-chilli', quantity: 10, unit: 'g' },
      { ingredientId: 'ing-oil', quantity: 25, unit: 'ml' },
      { ingredientId: 'ing-mustard-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-cumin-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-turmeric', quantity: 4, unit: 'g' },
      { ingredientId: 'ing-red-chilli-powder', quantity: 8, unit: 'g' },
      { ingredientId: 'ing-coriander-powder', quantity: 10, unit: 'g' },
      { ingredientId: 'ing-jaggery', quantity: 20, unit: 'g', notes: 'desi jaggery for authentic balance' },
      { ingredientId: 'ing-salt', quantity: 8, unit: 'g' },
      { ingredientId: 'ing-coriander', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-hing', quantity: 2, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Heat oil in a kadai. Add mustard seeds, cumin seeds, hing, and green chillies until crackling.', durationMinutes: 3 },
      { stepNumber: 2, instruction: 'Add chopped tomatoes, turmeric, red chilli powder, coriander powder, and salt. Cook until tomatoes soften and release juices.', durationMinutes: 7 },
      { stepNumber: 3, instruction: 'Stir in jaggery and half a cup of warm water. Simmer for 3 minutes to achieve a glossy gravy.', durationMinutes: 3 },
      { stepNumber: 4, instruction: 'Turn off heat, stir in fresh coriander, and generously top with crisp sev just before serving with hot phulkas or Bhakhri.', durationMinutes: 2 }
    ]
  },
  {
    id: 'recipe-ringna-no-olo',
    title: 'Kathiyawadi Ringna no Olo (Baingan Bharta)',
    slug: 'kathiyawadi-ringna-no-olo',
    description: 'Rustic Kathiyawadi roasted eggplant mash infused with green garlic, chillies, and mustard oil, served with hot Bajra no Rotlo.',
    cuisine: 'Kathiyawadi',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Vegan', 'Gluten-Free'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    defaultServings: 4,
    difficulty: 'Medium',
    proteinSource: 'mixed-veg',
    caloriesPerServing: 165,
    proteinGrams: 3.8,
    carbsGrams: 18.2,
    fatGrams: 8.5,
    fiberGrams: 6.2,
    sugarGrams: 6.0,
    sodiumMg: 290,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 95,
    isJainFriendly: false,
    jainAlternativeNotes: 'Jain variation substitutes roasted green plantain or bottle gourd mash without garlic or onions.',
    ingredients: [
      { ingredientId: 'ing-baingan', quantity: 600, unit: 'g', notes: 'large round purple eggplant' },
      { ingredientId: 'ing-tomato', quantity: 200, unit: 'g', notes: 'finely chopped' },
      { ingredientId: 'ing-green-chilli', quantity: 20, unit: 'g', notes: 'spicy green chillies' },
      { ingredientId: 'ing-garlic', quantity: 20, unit: 'g', notes: 'fresh or green garlic crushed' },
      { ingredientId: 'ing-ginger', quantity: 15, unit: 'g', notes: 'grated' },
      { ingredientId: 'ing-oil', quantity: 35, unit: 'ml' },
      { ingredientId: 'ing-red-chilli-powder', quantity: 10, unit: 'g' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-coriander-powder', quantity: 10, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 10, unit: 'g' },
      { ingredientId: 'ing-coriander', quantity: 1, unit: 'bunch' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Roast eggplant over direct open flame until skin is completely charred and flesh is tender.', durationMinutes: 12 },
      { stepNumber: 2, instruction: 'Cool, peel off charred skin, and thoroughly mash pulp with a fork.', durationMinutes: 3 },
      { stepNumber: 3, instruction: 'Heat oil in a heavy pan. Add crushed garlic, ginger, and green chillies; sauté until fragrant.', durationMinutes: 4 },
      { stepNumber: 4, instruction: 'Add chopped tomatoes, turmeric, chilli powder, coriander powder, and salt. Cook until oil separates.', durationMinutes: 4 },
      { stepNumber: 5, instruction: 'Fold in mashed roasted eggplant and simmer for 5 minutes. Garnish with fresh coriander.', durationMinutes: 5 }
    ]
  },
  {
    id: 'recipe-bajra-no-rotlo',
    title: 'Traditional Kathiyawadi Bajra no Rotlo',
    slug: 'traditional-kathiyawadi-bajra-no-rotlo',
    description: 'Thick, wholesome gluten-free flatbread hand-patted from pearl millet flour and roasted on a clay tava, slathered with pure desi ghee.',
    cuisine: 'Kathiyawadi',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Jain Friendly'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    defaultServings: 4,
    difficulty: 'Medium',
    proteinSource: 'mixed-veg',
    caloriesPerServing: 195,
    proteinGrams: 5.8,
    carbsGrams: 34.2,
    fatGrams: 4.1,
    fiberGrams: 6.0,
    sugarGrams: 0.0,
    sodiumMg: 160,
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 60,
    isJainFriendly: true,
    ingredients: [
      { ingredientId: 'ing-bajra-flour', quantity: 350, unit: 'g', notes: 'fresh stone-ground pearl millet flour' },
      { ingredientId: 'ing-salt', quantity: 6, unit: 'g' },
      { ingredientId: 'ing-ghee', quantity: 25, unit: 'g', notes: 'desi cow ghee for brushing' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Knead bajra flour with warm water and salt in small batches using palm pressure until soft and pliable.', durationMinutes: 5 },
      { stepNumber: 2, instruction: 'Hand-pat portions between palms or on a flat surface using light dry flour into 6-inch thick round rotlas.', durationMinutes: 3 },
      { stepNumber: 3, instruction: 'Transfer gently onto a hot earthen or cast-iron tava. Sprinkle a few drops of water on top surface.', durationMinutes: 3 },
      { stepNumber: 4, instruction: 'Flip and roast both sides over open flame until puffed and crisp. Top generously with desi ghee.', durationMinutes: 4 }
    ]
  },
  {
    id: 'recipe-surati-undhiyu',
    title: 'Authentic Surati Undhiyu with Methi Muthiya',
    slug: 'authentic-surati-undhiyu',
    description: 'Celebrated Gujarati winter specialty uniting tender Surti papdi, tuver lilva, purple yam, baby eggplants, and spiced fenugreek dumplings.',
    cuisine: 'Gujarati',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 30,
    cookTimeMinutes: 40,
    defaultServings: 4,
    difficulty: 'Advanced',
    proteinSource: 'dal',
    caloriesPerServing: 385,
    proteinGrams: 11.2,
    carbsGrams: 48.6,
    fatGrams: 16.5,
    fiberGrams: 10.5,
    sugarGrams: 7.2,
    sodiumMg: 380,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 180,
    isJainFriendly: false,
    jainAlternativeNotes: 'Authentic Jain Undhiyu replaces purple yam and potatoes with firm raw green plantain (Kacha Kela) and extra Surti papdi.',
    ingredients: [
      { ingredientId: 'ing-surti-papdi', quantity: 250, unit: 'g', notes: 'fresh Surti flat beans stringed' },
      { ingredientId: 'ing-tuver-lilva', quantity: 150, unit: 'g', notes: 'fresh green pigeon peas' },
      { ingredientId: 'ing-purple-yam', quantity: 150, unit: 'g', notes: 'peeled and cubed kand' },
      { ingredientId: 'ing-potato', quantity: 150, unit: 'g', notes: 'cubed' },
      { ingredientId: 'ing-baingan', quantity: 150, unit: 'g', notes: 'small baby eggplants slit' },
      { ingredientId: 'ing-fenugreek', quantity: 100, unit: 'g', notes: 'fresh methi leaves for muthiya' },
      { ingredientId: 'ing-besan', quantity: 80, unit: 'g', notes: 'for binding muthiya' },
      { ingredientId: 'ing-sesame-seeds', quantity: 20, unit: 'g' },
      { ingredientId: 'ing-oil', quantity: 50, unit: 'ml' },
      { ingredientId: 'ing-green-chilli', quantity: 15, unit: 'g' },
      { ingredientId: 'ing-ginger', quantity: 15, unit: 'g' },
      { ingredientId: 'ing-jaggery', quantity: 20, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 12, unit: 'g' },
      { ingredientId: 'ing-ajwain', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-coriander', quantity: 1, unit: 'bunch' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Prepare methi muthiya dough combining chopped methi, besan, ajwain, chilli paste, salt, and oil. Shape into oval dumplings and steam or lightly shallow fry.', durationMinutes: 12 },
      { stepNumber: 2, instruction: 'Make masala paste by blending sesame seeds, ginger, green chillies, coriander, salt, and jaggery.', durationMinutes: 6 },
      { stepNumber: 3, instruction: 'In a heavy pot, heat oil with ajwain and hing. Add surti papdi and tuver lilva; sauté for 3 minutes.', durationMinutes: 5 },
      { stepNumber: 4, instruction: 'Layer cubed yam, potatoes, stuffed baby eggplants, and muthiya on top. Add masala mixture and half cup warm water.', durationMinutes: 5 },
      { stepNumber: 5, instruction: 'Cover tightly and slow-cook on low flame until vegetables are buttery tender. Gently toss and serve with hot Puris.', durationMinutes: 20 }
    ]
  },
  {
    id: 'recipe-gujarati-dal-dhokli',
    title: 'Traditional Gujarati One-Pot Dal Dhokli',
    slug: 'traditional-gujarati-dal-dhokli',
    description: 'Wholesome one-pot meal where thin spiced whole wheat pasta diamonds are simmered in a sweet, tangy, and aromatic toor dal curry.',
    cuisine: 'Gujarati',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Jain Friendly'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 20,
    cookTimeMinutes: 25,
    defaultServings: 4,
    difficulty: 'Medium',
    proteinSource: 'dal',
    caloriesPerServing: 320,
    proteinGrams: 12.5,
    carbsGrams: 52.0,
    fatGrams: 6.8,
    fiberGrams: 7.8,
    sugarGrams: 8.0,
    sodiumMg: 350,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 110,
    isJainFriendly: true,
    ingredients: [
      { ingredientId: 'ing-toor-dal', quantity: 150, unit: 'g', notes: 'boiled and whisked smooth' },
      { ingredientId: 'ing-atta', quantity: 150, unit: 'g', notes: 'whole wheat flour for dhokli' },
      { ingredientId: 'ing-tomato', quantity: 100, unit: 'g', notes: 'chopped' },
      { ingredientId: 'ing-peanuts', quantity: 30, unit: 'g', notes: 'raw peanuts' },
      { ingredientId: 'ing-jaggery', quantity: 25, unit: 'g' },
      { ingredientId: 'ing-lemon', quantity: 1, unit: 'piece' },
      { ingredientId: 'ing-ghee', quantity: 20, unit: 'g' },
      { ingredientId: 'ing-mustard-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-cumin-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-curry-leaves', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-red-chilli-powder', quantity: 8, unit: 'g' },
      { ingredientId: 'ing-ajwain', quantity: 4, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 10, unit: 'g' },
      { ingredientId: 'ing-coriander', quantity: 1, unit: 'bunch' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Knead dhokli dough with atta, ajwain, turmeric, chilli powder, salt, and oil. Roll into thin rotis and cut into diamond shapes.', durationMinutes: 10 },
      { stepNumber: 2, instruction: 'In a pot, bring whisked cooked toor dal to a rolling boil with tomatoes, peanuts, jaggery, turmeric, chilli powder, and salt.', durationMinutes: 7 },
      { stepNumber: 3, instruction: 'Drop dhokli pieces one by one into boiling dal. Simmer on medium flame for 12 minutes until dhokli is tender.', durationMinutes: 12 },
      { stepNumber: 4, instruction: 'In a pan, heat ghee with mustard seeds, cumin seeds, curry leaves, and hing. Pour sizzling tadka over dal dhokli. Squeeze lemon and serve hot.', durationMinutes: 4 }
    ]
  },
  {
    id: 'recipe-gujarati-kadhi',
    title: 'Traditional Sweet & Sour Gujarati Kadhi',
    slug: 'traditional-sweet-and-sour-gujarati-kadhi',
    description: 'Thin, soothing sweet-tangy soup made with churned yogurt and chickpea flour, tempered with cinnamon, cloves, mustard seeds, and curry leaves.',
    cuisine: 'Gujarati',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Gluten-Free', 'Jain Friendly'],
    mealTypes: ['lunch', 'dinner'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    defaultServings: 4,
    difficulty: 'Easy',
    proteinSource: 'curd',
    caloriesPerServing: 145,
    proteinGrams: 5.2,
    carbsGrams: 16.8,
    fatGrams: 6.5,
    fiberGrams: 1.5,
    sugarGrams: 9.0,
    sodiumMg: 280,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 75,
    isJainFriendly: true,
    ingredients: [
      { ingredientId: 'ing-curd', quantity: 250, unit: 'g', notes: 'fresh sour dahi whisked with 2 cups water' },
      { ingredientId: 'ing-besan', quantity: 40, unit: 'g', notes: 'gram flour for silken body' },
      { ingredientId: 'ing-jaggery', quantity: 20, unit: 'g' },
      { ingredientId: 'ing-green-chilli', quantity: 10, unit: 'g', notes: 'slit lengthwise' },
      { ingredientId: 'ing-curry-leaves', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-mustard-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-cumin-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-ghee', quantity: 15, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 8, unit: 'g' },
      { ingredientId: 'ing-coriander', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-hing', quantity: 2, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Whisk yogurt, besan, jaggery, salt, and water together until completely lump-free.', durationMinutes: 4 },
      { stepNumber: 2, instruction: 'Pour mixture into a saucepan and bring to a gentle boil on medium flame, stirring continuously to prevent curdling.', durationMinutes: 6 },
      { stepNumber: 3, instruction: 'In a small tadka pan, heat ghee. Add mustard seeds, cumin seeds, green chillies, curry leaves, and hing until fragrant.', durationMinutes: 3 },
      { stepNumber: 4, instruction: 'Pour sizzling tempering into kadhi. Simmer for 2 minutes and garnish with fresh coriander.', durationMinutes: 2 }
    ]
  },
  {
    id: 'recipe-vaghireli-khichdi',
    title: 'Kathiyawadi Vaghireli Khichdi with Desi Ghee',
    slug: 'kathiyawadi-vaghireli-khichdi',
    description: 'Comforting spicy tempered rice and split yellow moong dal infused with whole spices, tomatoes, curry leaves, and a generous dollop of ghee.',
    cuisine: 'Kathiyawadi',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Jain Friendly'],
    mealTypes: ['dinner'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    defaultServings: 4,
    difficulty: 'Easy',
    proteinSource: 'dal',
    caloriesPerServing: 285,
    proteinGrams: 9.8,
    carbsGrams: 46.5,
    fatGrams: 6.8,
    fiberGrams: 5.2,
    sugarGrams: 2.0,
    sodiumMg: 310,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 80,
    isJainFriendly: true,
    ingredients: [
      { ingredientId: 'ing-basmati-rice', quantity: 200, unit: 'g', notes: 'short-grain or basmati rice washed' },
      { ingredientId: 'ing-moong-dal', quantity: 100, unit: 'g', notes: 'split yellow moong dal' },
      { ingredientId: 'ing-tomato', quantity: 100, unit: 'g', notes: 'chopped' },
      { ingredientId: 'ing-green-chilli', quantity: 10, unit: 'g' },
      { ingredientId: 'ing-ghee', quantity: 25, unit: 'g' },
      { ingredientId: 'ing-mustard-seeds', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-cumin-seeds', quantity: 6, unit: 'g' },
      { ingredientId: 'ing-curry-leaves', quantity: 1, unit: 'bunch' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 10, unit: 'g' },
      { ingredientId: 'ing-hing', quantity: 2, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Wash rice and moong dal together; soak for 15 minutes and drain.', durationMinutes: 5 },
      { stepNumber: 2, instruction: 'Heat ghee in a pressure cooker. Add mustard seeds, cumin seeds, curry leaves, hing, and green chillies.', durationMinutes: 3 },
      { stepNumber: 3, instruction: 'Add chopped tomatoes, turmeric, and salt. Sauté for 2 minutes until tomatoes soften.', durationMinutes: 2 },
      { stepNumber: 4, instruction: 'Add drained rice, dal, and 4 cups of water. Pressure cook for 4 whistles until soft and porridge-like.', durationMinutes: 12 },
      { stepNumber: 5, instruction: 'Rest pressure cooker, open, drizzle warm ghee on top, and serve piping hot with Gujarati Kadhi.', durationMinutes: 3 }
    ]
  },
  {
    id: 'recipe-gujarati-handvo',
    title: 'Gujarati Baked Vegetable Handvo (Savory Lentil Cake)',
    slug: 'gujarati-baked-vegetable-handvo',
    description: 'Traditional Gujarati savory baked cake made with fermented rice and mixed lentils, bottle gourd, and a crunchy sesame-mustard seed crust.',
    cuisine: 'Gujarati',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Jain Friendly', 'Gluten-Free'],
    mealTypes: ['breakfast', 'snack', 'dinner'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 35,
    defaultServings: 4,
    difficulty: 'Medium',
    proteinSource: 'dal',
    caloriesPerServing: 260,
    proteinGrams: 9.5,
    carbsGrams: 36.8,
    fatGrams: 8.5,
    fiberGrams: 4.8,
    sugarGrams: 2.5,
    sodiumMg: 310,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 100,
    isJainFriendly: true,
    ingredients: [
      { ingredientId: 'ing-basmati-rice', quantity: 200, unit: 'g', notes: 'coarsely ground soaked grains' },
      { ingredientId: 'ing-chana-dal', quantity: 80, unit: 'g', notes: 'split Bengal gram soaked' },
      { ingredientId: 'ing-toor-dal', quantity: 40, unit: 'g', notes: 'pigeon pea soaked' },
      { ingredientId: 'ing-urad-dal', quantity: 30, unit: 'g', notes: 'black gram split soaked' },
      { ingredientId: 'ing-curd', quantity: 100, unit: 'g', notes: 'sour dahi for fermentation' },
      { ingredientId: 'ing-fenugreek', quantity: 50, unit: 'g', notes: 'fresh methi leaves' },
      { ingredientId: 'ing-sesame-seeds', quantity: 20, unit: 'g', notes: 'for crisp sesame crust' },
      { ingredientId: 'ing-mustard-seeds', quantity: 6, unit: 'g' },
      { ingredientId: 'ing-green-chilli', quantity: 10, unit: 'g' },
      { ingredientId: 'ing-oil', quantity: 30, unit: 'ml' },
      { ingredientId: 'ing-turmeric', quantity: 5, unit: 'g' },
      { ingredientId: 'ing-ajwain', quantity: 4, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 10, unit: 'g' },
      { ingredientId: 'ing-hing', quantity: 2, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Grind soaked rice and mixed dals coarsely with sour curd. Ferment for 6 hours until bubbly.', durationMinutes: 10 },
      { stepNumber: 2, instruction: 'Mix in chopped methi leaves, green chilli paste, turmeric, ajwain, salt, and 1 tbsp oil into batter.', durationMinutes: 5 },
      { stepNumber: 3, instruction: 'Heat 2 tbsp oil in a heavy non-stick pan or baking tin. Splutter mustard seeds, sesame seeds, and hing.', durationMinutes: 3 },
      { stepNumber: 4, instruction: 'Pour batter gently over sizzling sesame tempering. Cover and slow-cook on low flame (or bake at 180°C) until deep golden and crusty on both sides.', durationMinutes: 25 },
      { stepNumber: 5, instruction: 'Slice into squares and serve warm with coriander-mint chutney.', durationMinutes: 2 }
    ]
  },
  {
    id: 'recipe-methi-na-gota',
    title: 'Crispy Gujarati Methi na Gota (Dakor Style)',
    slug: 'crispy-gujarati-methi-na-gota',
    description: 'Pillowy soft inside and crisp outside fenugreek fritters spiced with crushed pepper, ajwain, and jaggery, famously served at Dakor temple.',
    cuisine: 'Gujarati',
    dietaryTags: ['Pure Vegetarian', 'Vegetarian', 'Jain Friendly'],
    mealTypes: ['breakfast', 'snack'],
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    defaultServings: 4,
    difficulty: 'Easy',
    proteinSource: 'mixed-veg',
    caloriesPerServing: 230,
    proteinGrams: 7.8,
    carbsGrams: 26.2,
    fatGrams: 10.5,
    fiberGrams: 4.2,
    sugarGrams: 3.5,
    sodiumMg: 290,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    estimatedCostInr: 70,
    isJainFriendly: true,
    ingredients: [
      { ingredientId: 'ing-besan', quantity: 200, unit: 'g', notes: 'coarse gram flour' },
      { ingredientId: 'ing-fenugreek', quantity: 100, unit: 'g', notes: 'washed and chopped fresh methi' },
      { ingredientId: 'ing-green-chilli', quantity: 15, unit: 'g', notes: 'finely crushed' },
      { ingredientId: 'ing-oil', quantity: 40, unit: 'ml', notes: 'for frying and batter shortening' },
      { ingredientId: 'ing-jaggery', quantity: 10, unit: 'g', notes: 'dissolved in 2 tbsp water' },
      { ingredientId: 'ing-ajwain', quantity: 4, unit: 'g' },
      { ingredientId: 'ing-turmeric', quantity: 4, unit: 'g' },
      { ingredientId: 'ing-salt', quantity: 8, unit: 'g' },
      { ingredientId: 'ing-hing', quantity: 2, unit: 'g' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Combine besan, chopped methi leaves, crushed chillies, ajwain, turmeric, salt, hing, and dissolved jaggery.', durationMinutes: 5 },
      { stepNumber: 2, instruction: 'Add 2 tablespoons of hot smoking oil to batter and whisk vigorously for 3 minutes to incorporate air for lightness.', durationMinutes: 4 },
      { stepNumber: 3, instruction: 'Drop round balls of batter into hot oil on medium flame. Fry until golden brown and cooked through.', durationMinutes: 8 },
      { stepNumber: 4, instruction: 'Drain on paper towel and serve hot with fried green chillies and sweet kadhi dip.', durationMinutes: 2 }
    ]
  }
];

export interface SeedRetailer {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  deliveryTimeEstimate: string;
  deliveryFeeInr: number;
  freeDeliveryThresholdInr: number;
  minOrderValueInr: number;
  rating: number;
}

export const SEED_RETAILERS: SeedRetailer[] = [
  {
    id: 'ret-blinkit',
    name: 'Blinkit',
    slug: 'blinkit',
    logoUrl: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=200&q=80',
    deliveryTimeEstimate: '10-15 mins',
    deliveryFeeInr: 25,
    freeDeliveryThresholdInr: 399,
    minOrderValueInr: 99,
    rating: 4.8
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
    rating: 4.9
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
    rating: 4.7
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
    rating: 4.6
  }
];

export interface SeedProductVariant {
  id: string;
  ingredientId: string;
  sku: string;
  brand: string;
  title: string;
  packQuantity: number;
  packUnit: StandardUnit;
  mrpInr: number;
  sellingPriceInr: number;
  imageUrl: string;
}

export const SEED_PRODUCT_VARIANTS: SeedProductVariant[] = [
  // Paneer
  { id: 'var-amul-paneer-200', ingredientId: 'ing-paneer', sku: 'AMUL-PAN-200G', brand: 'Amul', title: 'Amul Fresh Malai Paneer, 200g', packQuantity: 200, packUnit: 'g', mrpInr: 95, sellingPriceInr: 89, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-amul-paneer-500', ingredientId: 'ing-paneer', sku: 'AMUL-PAN-500G', brand: 'Amul', title: 'Amul Fresh Malai Paneer, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 230, sellingPriceInr: 215, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-mother-paneer-200', ingredientId: 'ing-paneer', sku: 'MD-PAN-200G', brand: 'Mother Dairy', title: 'Mother Dairy Classic Paneer, 200g', packQuantity: 200, packUnit: 'g', mrpInr: 95, sellingPriceInr: 90, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=200&q=80' },

  // Atta & Rice
  { id: 'var-aashirvaad-atta-5k', ingredientId: 'ing-atta', sku: 'AASH-ATTA-5KG', brand: 'Aashirvaad', title: 'Aashirvaad Superior MP Shudh Chakki Atta, 5kg', packQuantity: 5000, packUnit: 'g', mrpInr: 285, sellingPriceInr: 265, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fortune-atta-5k', ingredientId: 'ing-atta', sku: 'FORT-ATTA-5KG', brand: 'Fortune', title: 'Fortune Chakki Fresh 100% Whole Wheat Atta, 5kg', packQuantity: 5000, packUnit: 'g', mrpInr: 270, sellingPriceInr: 249, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-aashirvaad-atta-1k', ingredientId: 'ing-atta', sku: 'AASH-ATTA-1KG', brand: 'Aashirvaad', title: 'Aashirvaad Select 100% Sharbati Wheat Atta, 1kg', packQuantity: 1000, packUnit: 'g', mrpInr: 72, sellingPriceInr: 68, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-daawat-rice-5k', ingredientId: 'ing-basmati-rice', sku: 'DAAWAT-RICE-5KG', brand: 'Daawat', title: 'Daawat Rozana Gold Basmati Rice, 5kg', packQuantity: 5000, packUnit: 'g', mrpInr: 499, sellingPriceInr: 449, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-daawat-rice-1k', ingredientId: 'ing-basmati-rice', sku: 'DAAWAT-RICE-1KG', brand: 'Daawat', title: 'Daawat Super Basmati Rice, 1kg', packQuantity: 1000, packUnit: 'g', mrpInr: 160, sellingPriceInr: 139, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-indiagate-rice-1k', ingredientId: 'ing-basmati-rice', sku: 'IG-RICE-1KG', brand: 'India Gate', title: 'India Gate Feast Rozana Basmati Rice, 1kg', packQuantity: 1000, packUnit: 'g', mrpInr: 155, sellingPriceInr: 132, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80' },

  // Ghee & Butter
  { id: 'var-amul-ghee-500', ingredientId: 'ing-ghee', sku: 'AMUL-GHEE-500ML', brand: 'Amul', title: 'Amul Pure Cow Ghee, 500ml', packQuantity: 500, packUnit: 'g', mrpInr: 340, sellingPriceInr: 320, imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-gowardhan-ghee-500', ingredientId: 'ing-ghee', sku: 'GOW-GHEE-500ML', brand: 'Gowardhan', title: 'Gowardhan 100% Pure Cow Ghee Jar, 500ml', packQuantity: 500, packUnit: 'g', mrpInr: 350, sellingPriceInr: 335, imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-amul-butter-100', ingredientId: 'ing-butter', sku: 'AMUL-BUT-100G', brand: 'Amul', title: 'Amul Pasteurized Butter, 100g', packQuantity: 100, packUnit: 'g', mrpInr: 60, sellingPriceInr: 58, imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-amul-butter-500', ingredientId: 'ing-butter', sku: 'AMUL-BUT-500G', brand: 'Amul', title: 'Amul Pasteurized Table Butter, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 285, sellingPriceInr: 275, imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=200&q=80' },

  // Dals
  { id: 'var-tata-toor-1k', ingredientId: 'ing-toor-dal', sku: 'TATA-TOOR-1KG', brand: 'Tata Sampann', title: 'Tata Sampann Unpolished Toor Dal, 1kg', packQuantity: 1000, packUnit: 'g', mrpInr: 195, sellingPriceInr: 175, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fortune-toor-1k', ingredientId: 'ing-toor-dal', sku: 'FORT-TOOR-1KG', brand: 'Fortune', title: 'Fortune Unpolished Arhar Toor Dal, 1kg', packQuantity: 1000, packUnit: 'g', mrpInr: 190, sellingPriceInr: 168, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-tata-toor-500', ingredientId: 'ing-toor-dal', sku: 'TATA-TOOR-500G', brand: 'Tata Sampann', title: 'Tata Sampann Unpolished Toor Dal, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 105, sellingPriceInr: 92, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-tata-moong-1k', ingredientId: 'ing-moong-dal', sku: 'TATA-MOONG-1KG', brand: 'Tata Sampann', title: 'Tata Sampann Unpolished Moong Dal, 1kg', packQuantity: 1000, packUnit: 'g', mrpInr: 180, sellingPriceInr: 165, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fortune-moong-1k', ingredientId: 'ing-moong-dal', sku: 'FORT-MOONG-1KG', brand: 'Fortune', title: 'Fortune Mogar Yellow Moong Dal, 1kg', packQuantity: 1000, packUnit: 'g', mrpInr: 175, sellingPriceInr: 158, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-tata-rajma-500', ingredientId: 'ing-rajma', sku: 'TATA-RAJMA-500G', brand: 'Tata Sampann', title: 'Tata Sampann Kashmiri Rajma, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 110, sellingPriceInr: 99, imageUrl: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=200&q=80' },

  // Produce
  { id: 'var-fresh-onion-1k', ingredientId: 'ing-onion', sku: 'PROD-ONION-1KG', brand: 'Farm Fresh', title: 'Fresh Nashik Red Onion, 1kg', packQuantity: 1000, packUnit: 'g', mrpInr: 45, sellingPriceInr: 38, imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fresh-tomato-1k', ingredientId: 'ing-tomato', sku: 'PROD-TOM-1KG', brand: 'Farm Fresh', title: 'Fresh Country Desi Tomato, 1kg', packQuantity: 1000, packUnit: 'g', mrpInr: 40, sellingPriceInr: 32, imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fresh-potato-1k', ingredientId: 'ing-potato', sku: 'PROD-POT-1KG', brand: 'Farm Fresh', title: 'Fresh Agra New Crop Potatoes, 1kg', packQuantity: 1000, packUnit: 'g', mrpInr: 35, sellingPriceInr: 28, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fresh-palak-250', ingredientId: 'ing-palak', sku: 'PROD-PALAK-250G', brand: 'Farm Fresh', title: 'Hydroponic Clean Palak (Spinach), 250g', packQuantity: 250, packUnit: 'g', mrpInr: 30, sellingPriceInr: 24, imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fresh-ginger-200', ingredientId: 'ing-ginger', sku: 'PROD-GING-200G', brand: 'Farm Fresh', title: 'Fresh Washed Ginger, 200g', packQuantity: 200, packUnit: 'g', mrpInr: 35, sellingPriceInr: 29, imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fresh-garlic-200', ingredientId: 'ing-garlic', sku: 'PROD-GAR-200G', brand: 'Farm Fresh', title: 'Fresh Madhya Pradesh Garlic, 200g', packQuantity: 200, packUnit: 'g', mrpInr: 50, sellingPriceInr: 42, imageUrl: 'https://images.unsplash.com/photo-1615477550926-105260f8976b?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fresh-chilli-100', ingredientId: 'ing-green-chilli', sku: 'PROD-CHIL-100G', brand: 'Farm Fresh', title: 'Fresh Dark Green Chillies, 100g', packQuantity: 100, packUnit: 'g', mrpInr: 15, sellingPriceInr: 12, imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fresh-coriander-1b', ingredientId: 'ing-coriander', sku: 'PROD-COR-1B', brand: 'Farm Fresh', title: 'Fresh Coriander Leaves Bunch, 1 pc', packQuantity: 1, packUnit: 'piece', mrpInr: 20, sellingPriceInr: 15, imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fresh-curry-1b', ingredientId: 'ing-curry-leaves', sku: 'PROD-CUR-1B', brand: 'Farm Fresh', title: 'Fresh Aromatic Curry Leaves Bunch, 1 pc', packQuantity: 1, packUnit: 'piece', mrpInr: 15, sellingPriceInr: 10, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fresh-lemon-4pc', ingredientId: 'ing-lemon', sku: 'PROD-LEM-4PC', brand: 'Farm Fresh', title: 'Juicy Yellow Nimbu (Lemons), 4 pcs', packQuantity: 4, packUnit: 'piece', mrpInr: 30, sellingPriceInr: 24, imageUrl: 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=200&q=80' },

  // Spices & Oil
  { id: 'var-everest-garam-100', ingredientId: 'ing-garam-masala', sku: 'EVER-GAR-100G', brand: 'Everest', title: 'Everest Royal Garam Masala, 100g', packQuantity: 100, packUnit: 'g', mrpInr: 88, sellingPriceInr: 82, imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-tata-turmeric-200', ingredientId: 'ing-turmeric', sku: 'TATA-TURM-200G', brand: 'Tata Sampann', title: 'Tata Sampann Turmeric Powder, 200g', packQuantity: 200, packUnit: 'g', mrpInr: 65, sellingPriceInr: 58, imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fortune-oil-1l', ingredientId: 'ing-oil', sku: 'FORT-OIL-1L', brand: 'Fortune', title: 'Fortune Sunlite Refined Sunflower Oil, 1L', packQuantity: 1000, packUnit: 'ml', mrpInr: 155, sellingPriceInr: 139, imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-id-dosa-batter-1kg', ingredientId: 'ing-dosa-batter', sku: 'ID-BATTER-1KG', brand: 'iD Fresh', title: 'iD Fresh Idli & Dosa Batter, 1kg', packQuantity: 1000, packUnit: 'ml', mrpInr: 95, sellingPriceInr: 85, imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=200&q=80' },

  // New Produce & Staple Variants
  { id: 'var-tata-chana-500', ingredientId: 'ing-kabuli-chana', sku: 'TATA-CHANA-500G', brand: 'Tata Sampann', title: 'Tata Sampann White Kabuli Chana, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 120, sellingPriceInr: 105, imageUrl: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fortune-chana-500', ingredientId: 'ing-kabuli-chana', sku: 'FORT-CHANA-500G', brand: 'Fortune', title: 'Fortune Classic Kabuli Chana, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 115, sellingPriceInr: 99, imageUrl: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fresh-gobi-500', ingredientId: 'ing-cauliflower', sku: 'PROD-GOBI-500G', brand: 'Farm Fresh', title: 'Fresh Clean Cauliflower (Gobi), 1 pc (~500g)', packQuantity: 500, packUnit: 'g', mrpInr: 40, sellingPriceInr: 32, imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fresh-bhindi-500', ingredientId: 'ing-bhindi', sku: 'PROD-BHINDI-500G', brand: 'Farm Fresh', title: 'Fresh Tender Ladyfinger (Bhindi), 500g', packQuantity: 500, packUnit: 'g', mrpInr: 45, sellingPriceInr: 36, imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fresh-baingan-500', ingredientId: 'ing-baingan', sku: 'PROD-BAINGAN-500G', brand: 'Farm Fresh', title: 'Fresh Purple Bharta Baingan, 500g (1-2 pcs)', packQuantity: 500, packUnit: 'g', mrpInr: 35, sellingPriceInr: 28, imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-everest-sambar-100', ingredientId: 'ing-sambar-powder', sku: 'EVER-SAMBAR-100G', brand: 'Everest', title: 'Everest Madras Sambar Masala, 100g', packQuantity: 100, packUnit: 'g', mrpInr: 42, sellingPriceInr: 38, imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-everest-chole-100', ingredientId: 'ing-chole-masala', sku: 'EVER-CHOLE-100G', brand: 'Everest', title: 'Everest Chhole Masala, 100g', packQuantity: 100, packUnit: 'g', mrpInr: 45, sellingPriceInr: 40, imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-tata-rava-500', ingredientId: 'ing-rava', sku: 'TATA-RAVA-500G', brand: 'Tata Sampann', title: 'Tata Sampann Roasted Sooji / Rava, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 40, sellingPriceInr: 35, imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=200&q=80' },

  // Authentic Gujarati Regional Products
  { id: 'var-balaji-sev-200', ingredientId: 'ing-sev', sku: 'BAL-SEV-200G', brand: 'Balaji', title: 'Balaji Nylon Sev, 200g', packQuantity: 200, packUnit: 'g', mrpInr: 45, sellingPriceInr: 42, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fortune-bajra-1k', ingredientId: 'ing-bajra-flour', sku: 'FORT-BAJRA-1KG', brand: 'Fortune', title: 'Fortune Desi Bajra Flour, 1kg', packQuantity: 1000, packUnit: 'g', mrpInr: 65, sellingPriceInr: 59, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fresh-surti-papdi-500', ingredientId: 'ing-surti-papdi', sku: 'PROD-PAPDI-500G', brand: 'Farm Fresh', title: 'Fresh Surti Papdi Beans, 500g', packQuantity: 500, packUnit: 'g', mrpInr: 40, sellingPriceInr: 35, imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fresh-tuver-lilva-250', ingredientId: 'ing-tuver-lilva', sku: 'PROD-TUVER-250G', brand: 'Farm Fresh', title: 'Fresh Green Tuver Lilva, 250g', packQuantity: 250, packUnit: 'g', mrpInr: 55, sellingPriceInr: 48, imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fresh-purple-yam-500', ingredientId: 'ing-purple-yam', sku: 'PROD-YAM-500G', brand: 'Farm Fresh', title: 'Fresh Purple Yam (Kand), 500g', packQuantity: 500, packUnit: 'g', mrpInr: 50, sellingPriceInr: 45, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-fresh-raw-banana-500', ingredientId: 'ing-raw-banana', sku: 'PROD-BANANA-500G', brand: 'Farm Fresh', title: 'Fresh Green Raw Plantain (Kacha Kela), 500g', packQuantity: 500, packUnit: 'g', mrpInr: 30, sellingPriceInr: 25, imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-amul-buttermilk-500', ingredientId: 'ing-buttermilk', sku: 'AMUL-CHHAAS-500ML', brand: 'Amul', title: 'Amul Masti Spiced Buttermilk, 500ml', packQuantity: 500, packUnit: 'ml', mrpInr: 20, sellingPriceInr: 18, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=200&q=80' },
  { id: 'var-tata-sesame-200', ingredientId: 'ing-sesame-seeds', sku: 'TATA-SES-200G', brand: 'Tata Sampann', title: 'Tata Sampann White Sesame Seeds (Til), 200g', packQuantity: 200, packUnit: 'g', mrpInr: 60, sellingPriceInr: 54, imageUrl: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=200&q=80' }
];

// Sample Initial Households for Multi-Tenant Testing & Regional Pilot
export const SEED_DEMO_HOUSEHOLD = {
  id: 'hh-sharma-family',
  userId: 'user-demo-1',
  name: 'Sharma Family',
  dietaryPreference: 'VEGETARIAN' as const,
  cuisinePreference: 'ALL_INDIAN',
  spiceTolerance: 'Medium',
  weeklyBudgetInr: 3500,
  cookingFrequency: 'Daily Fresh',
  nutritionGoals: {
    dailyCalories: 2000,
    dailyProteinGrams: 65,
    dailyCarbsGrams: 250,
    dailyFatGrams: 65,
    dailyFiberGrams: 30
  },
  members: [
    {
      id: 'mem-1',
      name: 'Pooja',
      ageGroup: 'adult',
      dietaryPreference: 'vegetarian',
      allergies: ['Peanuts'],
      dislikedIngredients: ['Bitter Gourd'],
      nutritionGoals: {
        dailyProteinGrams: 60,
        dailyCalories: 1800
      }
    },
    {
      id: 'mem-2',
      name: 'Ramesh (Father-in-law)',
      ageGroup: 'senior',
      dietaryPreference: 'jain',
      allergies: [],
      dislikedIngredients: ['Onion', 'Garlic'],
      nutritionGoals: {
        dailyProteinGrams: 50,
        dailyCalories: 1700
      }
    },
    {
      id: 'mem-3',
      name: 'Rohan (Husband)',
      ageGroup: 'adult',
      dietaryPreference: 'eggetarian',
      allergies: [],
      dislikedIngredients: [],
      nutritionGoals: {
        dailyProteinGrams: 75,
        dailyCalories: 2200
      }
    },
    {
      id: 'mem-4',
      name: 'Aarav (Son)',
      ageGroup: 'child',
      dietaryPreference: 'vegetarian',
      allergies: [],
      dislikedIngredients: ['Spicy Food'],
      nutritionGoals: {
        dailyProteinGrams: 40,
        dailyCalories: 1600
      }
    }
  ]
};

// Seed Household B: Patel Family (Jain / Gujarati, Bodakdev, Ahmedabad)
export const SEED_PATEL_HOUSEHOLD = {
  id: 'hh-patel-family',
  userId: 'user-demo-patel',
  name: 'Patel Family',
  dietaryPreference: 'JAIN' as const,
  cuisinePreference: 'Gujarati',
  spiceTolerance: 'Medium',
  weeklyBudgetInr: 4000,
  cookingFrequency: 'Daily Fresh',
  nutritionGoals: {
    dailyCalories: 1900,
    dailyProteinGrams: 60,
    dailyCarbsGrams: 260,
    dailyFatGrams: 55,
    dailyFiberGrams: 32
  },
  members: [
    {
      id: 'mem-patel-1',
      name: 'Rameshbhai Patel',
      ageGroup: 'senior',
      dietaryPreference: 'jain',
      allergies: [],
      dislikedIngredients: ['Onion', 'Garlic', 'Potato', 'Carrot'],
      nutritionGoals: { dailyProteinGrams: 55, dailyCalories: 1750 }
    },
    {
      id: 'mem-patel-2',
      name: 'Bhavnaben Patel',
      ageGroup: 'adult',
      dietaryPreference: 'jain',
      allergies: [],
      dislikedIngredients: ['Root Vegetables'],
      nutritionGoals: { dailyProteinGrams: 60, dailyCalories: 1900 }
    },
    {
      id: 'mem-patel-3',
      name: 'Dev Patel',
      ageGroup: 'child',
      dietaryPreference: 'jain',
      allergies: [],
      dislikedIngredients: ['Bitter Gourd'],
      nutritionGoals: { dailyProteinGrams: 45, dailyCalories: 1650 }
    }
  ]
};

// Seed Household C: Mehta Family (Strict Jain, Malabar Hill, Mumbai)
export const SEED_MEHTA_HOUSEHOLD = {
  id: 'hh-mehta-family',
  userId: 'user-demo-mehta',
  name: 'Mehta Family',
  dietaryPreference: 'JAIN' as const,
  cuisinePreference: 'Gujarati',
  spiceTolerance: 'Medium',
  weeklyBudgetInr: 4500,
  cookingFrequency: 'Daily Fresh',
  nutritionGoals: {
    dailyCalories: 2200,
    dailyProteinGrams: 70,
    dailyCarbsGrams: 280,
    dailyFatGrams: 70,
    dailyFiberGrams: 35
  },
  members: [
    {
      id: 'mem-mehta-1',
      name: 'Kirit Mehta',
      ageGroup: 'adult',
      dietaryPreference: 'jain',
      allergies: [],
      dislikedIngredients: [],
      nutritionGoals: { dailyProteinGrams: 75, dailyCalories: 2200 }
    },
    {
      id: 'mem-mehta-2',
      name: 'Hetal Mehta',
      ageGroup: 'adult',
      dietaryPreference: 'jain',
      allergies: ['Peanuts'],
      dislikedIngredients: [],
      nutritionGoals: { dailyProteinGrams: 65, dailyCalories: 1950 }
    },
    {
      id: 'mem-mehta-3',
      name: 'Niyati Mehta',
      ageGroup: 'child',
      dietaryPreference: 'jain',
      allergies: [],
      dislikedIngredients: ['Karela'],
      nutritionGoals: { dailyProteinGrams: 45, dailyCalories: 1600 }
    }
  ]
};

export const SEED_ALL_HOUSEHOLDS = [
  SEED_DEMO_HOUSEHOLD,
  SEED_PATEL_HOUSEHOLD,
  SEED_MEHTA_HOUSEHOLD
];

// Initial sample pantry items
export const SEED_PANTRY_ITEMS = [
  { ingredientId: 'ing-atta', currentQuantity: 2000, unit: 'g', isLowStock: false }, // 2kg atta at home
  { ingredientId: 'ing-ghee', currentQuantity: 300, unit: 'g', isLowStock: false },
  { ingredientId: 'ing-salt', currentQuantity: 500, unit: 'g', isLowStock: false },
  { ingredientId: 'ing-oil', currentQuantity: 800, unit: 'ml', isLowStock: false },
  { ingredientId: 'ing-turmeric', currentQuantity: 100, unit: 'g', isLowStock: false },
  { ingredientId: 'ing-mustard-seeds', currentQuantity: 50, unit: 'g', isLowStock: false },
  { ingredientId: 'ing-cumin-seeds', currentQuantity: 50, unit: 'g', isLowStock: false },
  { ingredientId: 'ing-toor-dal', currentQuantity: 300, unit: 'g', isLowStock: true }
];
