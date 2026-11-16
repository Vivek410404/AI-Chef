import {
  Recipe,
  DietaryPreference,
  HouseholdMember,
  IndianCuisine,
  IndianRegion,
  ALL_INDIAN_CUISINE
} from '@rasoi/shared-types';

export interface VerifiedIngredientMeta {
  id: string;
  name: string;
  isJainPermissible: boolean;
  isVerified: boolean;
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

/**
 * Authoritative Verified Ingredient Metadata Registry
 * Ensures dietary and allergen safety are derived from verified structured metadata.
 */
export const VERIFIED_INGREDIENT_REGISTRY = new Map<string, VerifiedIngredientMeta>([
  // Dairy & Eggs
  ['ing-paneer', { id: 'ing-paneer', name: 'Paneer', isJainPermissible: true, isVerified: true, containsDairy: true, allergens: ['dairy', 'lactose'] }],
  ['ing-milk', { id: 'ing-milk', name: 'Cow Milk', isJainPermissible: true, isVerified: true, containsDairy: true, allergens: ['dairy', 'lactose'] }],
  ['ing-curd', { id: 'ing-curd', name: 'Curd (Dahi)', isJainPermissible: true, isVerified: true, containsDairy: true, allergens: ['dairy', 'lactose'] }],
  ['ing-ghee', { id: 'ing-ghee', name: 'Desi Cow Ghee', isJainPermissible: true, isVerified: true, containsDairy: true, allergens: ['dairy', 'lactose'] }],
  ['ing-butter', { id: 'ing-butter', name: 'White / Salted Butter', isJainPermissible: true, isVerified: true, containsDairy: true, allergens: ['dairy', 'lactose'] }],
  ['ing-eggs', { id: 'ing-eggs', name: 'Farm Eggs', isJainPermissible: false, isVerified: true, containsEggs: true, allergens: ['eggs'] }],
  ['ing-egg', { id: 'ing-egg', name: 'Farm Egg', isJainPermissible: false, isVerified: true, containsEggs: true, allergens: ['eggs'] }],
  ['ing-chicken', { id: 'ing-chicken', name: 'Chicken Breast / Curry Cut', isJainPermissible: false, isVerified: true, containsMeat: true, containsPoultry: true, allergens: [] }],
  ['ing-fish', { id: 'ing-fish', name: 'Fresh Rohu / Catla Fish', isJainPermissible: false, isVerified: true, containsMeat: true, containsFish: true, allergens: ['fish'] }],

  // Grains & Atta
  ['ing-basmati-rice', { id: 'ing-basmati-rice', name: 'Basmati Rice', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-atta', { id: 'ing-atta', name: 'Whole Wheat Atta', isJainPermissible: true, isVerified: true, containsGluten: true, allergens: ['gluten', 'wheat'] }],
  ['ing-poha', { id: 'ing-poha', name: 'Thick Poha (Flattened Rice)', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-besan', { id: 'ing-besan', name: 'Besan (Gram Flour)', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-rava', { id: 'ing-rava', name: 'Sooji / Rava (Semolina)', isJainPermissible: true, isVerified: true, containsGluten: true, allergens: ['gluten', 'wheat'] }],
  ['ing-dosa-batter', { id: 'ing-dosa-batter', name: 'Fermented Idli/Dosa Batter', isJainPermissible: true, isVerified: true, allergens: [] }],

  // Lentils & Pulses
  ['ing-toor-dal', { id: 'ing-toor-dal', name: 'Toor Dal (Pigeon Pea)', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-moong-dal', { id: 'ing-moong-dal', name: 'Yellow Moong Dal', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-rajma', { id: 'ing-rajma', name: 'Kashmiri Rajma', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-chana-dal', { id: 'ing-chana-dal', name: 'Chana Dal', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-urad-dal', { id: 'ing-urad-dal', name: 'Urad Dal Gota', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-kabuli-chana', { id: 'ing-kabuli-chana', name: 'Kabuli Chana (Chickpeas)', isJainPermissible: true, isVerified: true, allergens: [] }],

  // Produce (Vegetables)
  ['ing-onion', { id: 'ing-onion', name: 'Red Onion', isJainPermissible: false, isVerified: true, isOnionGarlic: true, isRootVegetable: true, allergens: [] }],
  ['ing-tomato', { id: 'ing-tomato', name: 'Ripe Red Tomato', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-garlic', { id: 'ing-garlic', name: 'Garlic Pods', isJainPermissible: false, isVerified: true, isOnionGarlic: true, isRootVegetable: true, allergens: [] }],
  ['ing-ginger', { id: 'ing-ginger', name: 'Fresh Ginger Root', isJainPermissible: false, isVerified: true, isRootVegetable: true, allergens: [] }],
  ['ing-green-chilli', { id: 'ing-green-chilli', name: 'Spicy Green Chillies', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-coriander', { id: 'ing-coriander', name: 'Fresh Coriander (Dhaniya)', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-curry-leaves', { id: 'ing-curry-leaves', name: 'Fresh Curry Leaves', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-potato', { id: 'ing-potato', name: 'Desi Potato (Aloo)', isJainPermissible: false, isVerified: true, isRootVegetable: true, allergens: [] }],
  ['ing-palak', { id: 'ing-palak', name: 'Fresh Palak (Spinach)', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-fenugreek', { id: 'ing-fenugreek', name: 'Fresh Methi Leaves', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-cauliflower', { id: 'ing-cauliflower', name: 'Fresh Cauliflower (Gobi)', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-bhindi', { id: 'ing-bhindi', name: 'Fresh Ladyfinger (Bhindi)', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-baingan', { id: 'ing-baingan', name: 'Round Bharta Eggplant (Baingan)', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-lemon', { id: 'ing-lemon', name: 'Juicy Yellow Lemon', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-peanuts', { id: 'ing-peanuts', name: 'Raw Peanuts', isJainPermissible: true, isVerified: true, containsNuts: true, allergens: ['peanuts', 'nuts'] }],

  // Spices & Condiments
  ['ing-turmeric', { id: 'ing-turmeric', name: 'Turmeric Powder (Haldi)', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-red-chilli-powder', { id: 'ing-red-chilli-powder', name: 'Kashmiri Red Chilli Powder', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-coriander-powder', { id: 'ing-coriander-powder', name: 'Dhaniya Powder', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-garam-masala', { id: 'ing-garam-masala', name: 'Garam Masala Blend', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-sambar-powder', { id: 'ing-sambar-powder', name: 'Madras Sambar Powder', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-chole-masala', { id: 'ing-chole-masala', name: 'Amritsari Chole Masala', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-mustard-seeds', { id: 'ing-mustard-seeds', name: 'Black Mustard Seeds (Rai)', isJainPermissible: true, isVerified: true, allergens: ['mustard'] }],
  ['ing-cumin-seeds', { id: 'ing-cumin-seeds', name: 'Cumin Seeds (Jeera)', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-kasuri-methi', { id: 'ing-kasuri-methi', name: 'Dried Kasuri Methi', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-salt', { id: 'ing-salt', name: 'Iodized Salt', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-oil', { id: 'ing-oil', name: 'Cold-Pressed Mustard / Sunflower Oil', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-jaggery', { id: 'ing-jaggery', name: 'Organic Jaggery (Gud)', isJainPermissible: true, isVerified: true, allergens: [] }],

  // Authentic Gujarati & Kathiyawadi Regional Ingredients
  ['ing-sev', { id: 'ing-sev', name: 'Nylon Sev / Ratlami Sev', isJainPermissible: true, isVerified: true, containsGluten: false, allergens: [] }],
  ['ing-bajra-flour', { id: 'ing-bajra-flour', name: 'Bajra (Pearl Millet) Flour', isJainPermissible: true, isVerified: true, containsGluten: false, allergens: [] }],
  ['ing-surti-papdi', { id: 'ing-surti-papdi', name: 'Fresh Surti Papdi (Flat Beans)', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-tuver-lilva', { id: 'ing-tuver-lilva', name: 'Fresh Tuver Lilva (Green Pigeon Peas)', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-purple-yam', { id: 'ing-purple-yam', name: 'Kand / Purple Yam (Ratalu)', isJainPermissible: false, isVerified: true, isRootVegetable: true, allergens: [] }],
  ['ing-raw-banana', { id: 'ing-raw-banana', name: 'Kacha Kela (Raw Green Banana)', isJainPermissible: true, isVerified: true, isRootVegetable: false, allergens: [] }],
  ['ing-buttermilk', { id: 'ing-buttermilk', name: 'Chhaas / Spiced Buttermilk', isJainPermissible: true, isVerified: true, containsDairy: true, allergens: ['dairy', 'lactose'] }],
  ['ing-sesame-seeds', { id: 'ing-sesame-seeds', name: 'White Sesame Seeds (Safed Til)', isJainPermissible: true, isVerified: true, allergens: ['sesame'] }],
  ['ing-ajwain', { id: 'ing-ajwain', name: 'Ajwain (Carom Seeds)', isJainPermissible: true, isVerified: true, allergens: [] }],
  ['ing-hing', { id: 'ing-hing', name: 'Asafoetida (Hing Powder)', isJainPermissible: true, isVerified: true, allergens: [] }]
]);

/**
 * Resolves structured verified metadata for an ingredient.
 * Returns null if the ingredient is unknown or unverified.
 */
export function getIngredientMetadata(ing: any): VerifiedIngredientMeta | null {
  if (!ing) return null;
  // If explicitly flagged as unverified
  if (ing.isVerified === false || ing.ingredient?.isVerified === false) {
    return null;
  }
  // Check embedded ingredient object
  if (ing.ingredient && ing.ingredient.isVerified === true) {
    return ing.ingredient;
  }
  // Check direct ingredient object
  if (ing.isVerified === true && ing.name) {
    return ing;
  }
  // Lookup by ID in verified registry
  const id = ing.ingredientId || ing.id;
  if (id && VERIFIED_INGREDIENT_REGISTRY.has(id)) {
    return VERIFIED_INGREDIENT_REGISTRY.get(id)!;
  }
  // Unknown ingredient -> incomplete metadata
  return null;
}

/**
 * Checks whether an ingredient has confirmed safe, verified metadata.
 * Rule: Unknown or incomplete ingredient metadata must not be treated as confirmed safe.
 */
export function isIngredientMetadataVerified(ing: any): boolean {
  return getIngredientMetadata(ing) !== null;
}

/**
 * Authoritative Indian Regional Cuisines to Specific Cuisines Mapping
 */
export const REGION_TO_CUISINES: Record<string, string[]> = {
  'North Indian': [
    'North Indian',
    'Punjabi',
    'Kashmiri',
    'Awadhi',
    'Mughlai',
    'Rajasthani',
    'Himachali'
  ],
  'South Indian': [
    'South Indian',
    'Tamil',
    'Kerala',
    'Andhra',
    'Karnataka',
    'Hyderabadi',
    'Chettinad'
  ],
  'West Indian': [
    'West Indian',
    'Gujarati',
    'Maharashtrian',
    'Goan',
    'Malvani',
    'Konkani',
    'Rajasthani'
  ],
  'East Indian': [
    'East Indian',
    'Bengali',
    'Bihari',
    'Odia',
    'Assamese'
  ],
  'Central Indian': [
    'Central Indian'
  ]
};

export const ALLERGEN_KEYWORD_MAP: Record<string, string[]> = {
  peanut: ['peanut', 'groundnut', 'peanuts'],
  nut: ['peanut', 'almond', 'cashew', 'walnut', 'pistachio', 'nuts'],
  dairy: ['paneer', 'milk', 'curd', 'dahi', 'butter', 'ghee', 'cream', 'cheese', 'yogurt'],
  lactose: ['paneer', 'milk', 'curd', 'dahi', 'butter', 'ghee', 'cream', 'cheese', 'yogurt'],
  gluten: ['atta', 'wheat', 'rava', 'sooji', 'semolina', 'maida', 'barley', 'rye'],
  mustard: ['mustard', 'rai', 'sarson'],
  fish: ['fish', 'rohu', 'catla', 'prawn', 'seafood'],
  egg: ['egg', 'eggs', 'anda']
};

/**
 * Normalizes any dietary preference string to canonical uppercase enum
 */
export function normalizeDietaryPreference(pref?: string): DietaryPreference {
  if (!pref) return 'VEGETARIAN';
  const clean = pref.toUpperCase().replace(/[-\s]/g, '_');
  if (clean.includes('NON_VEG') || clean.includes('NONVEG')) return 'NON_VEGETARIAN';
  if (clean.includes('EGG')) return 'EGGETARIAN';
  if (clean.includes('VEGAN')) return 'VEGAN';
  if (clean.includes('JAIN')) return 'JAIN';
  if (clean.includes('VEG')) return 'VEGETARIAN';
  return 'VEGETARIAN';
}

/**
 * Checks whether a recipe satisfies a given dietary mode.
 * Enforces structured ingredient metadata and fail-closed security for unknown metadata.
 */
export function isRecipeCompliantWithDiet(recipe: Recipe, diet: DietaryPreference | string): boolean {
  if (!recipe) return false;
  const normDiet = normalizeDietaryPreference(diet);
  const ings = recipe.ingredients || [];
  const tags = recipe.dietaryTags || [];

  // Fail-closed principle: If any ingredient metadata is incomplete/unverified,
  // it cannot be confirmed safe for any restricted dietary mode (Vegetarian, Vegan, Jain, Eggetarian).
  if (normDiet !== 'NON_VEGETARIAN') {
    const hasUnverified = ings.some((i) => !isIngredientMetadataVerified(i));
    if (hasUnverified) {
      return false; // Fail-closed: unverified ingredient metadata is never assumed safe
    }
  }

  // Derive compliance directly from verified structured ingredients metadata + verified IDs
  const hasMeatOrFish =
    ings.some((i) => {
      const meta = getIngredientMetadata(i);
      return (
        meta?.containsMeat ||
        meta?.containsPoultry ||
        meta?.containsFish ||
        meta?.containsSeafood ||
        i.ingredientId === 'ing-chicken' ||
        i.ingredientId === 'ing-fish'
      );
    }) || tags.includes('Non-Vegetarian');

  const hasEggs =
    ings.some((i) => {
      const meta = getIngredientMetadata(i);
      return (
        meta?.containsEggs ||
        i.ingredientId === 'ing-eggs' ||
        i.ingredientId === 'ing-egg'
      );
    }) || tags.includes('Eggetarian');

  const hasDairy = ings.some((i) => {
    const meta = getIngredientMetadata(i);
    return (
      meta?.containsDairy ||
      ['ing-paneer', 'ing-milk', 'ing-curd', 'ing-ghee', 'ing-butter', 'ing-cream', 'ing-cheese'].includes(i.ingredientId)
    );
  });

  const hasRootVegOrAllium = ings.some((i) => {
    const meta = getIngredientMetadata(i);
    return (
      meta?.isOnionGarlic ||
      meta?.isRootVegetable ||
      meta?.isJainPermissible === false ||
      ['ing-onion', 'ing-garlic', 'ing-potato', 'ing-ginger', 'ing-radish', 'ing-carrot', 'ing-beetroot'].includes(i.ingredientId)
    );
  });

  switch (normDiet) {
    case 'VEGETARIAN':
      // Allow plant-based foods and dairy. Exclude meat, poultry, fish, seafood. Exclude eggs by default.
      return !hasMeatOrFish && !hasEggs;

    case 'NON_VEGETARIAN':
      // Allow vegetarian and non-vegetarian foods (chicken, meat, fish, eggs, and all vegetarian)
      return true;

    case 'EGGETARIAN':
      // Allow vegetarian foods and eggs. Exclude meat, poultry, fish and seafood.
      return !hasMeatOrFish;

    case 'VEGAN':
      // Exclude meat, fish, eggs, dairy, honey and other animal-derived ingredients.
      return !hasMeatOrFish && !hasEggs && !hasDairy;

    case 'JAIN':
      // Enforce strict Jain rules: must be marked isJainFriendly, no root veg, no onion, no garlic, no meat/eggs
      return Boolean(recipe.isJainFriendly) && !hasMeatOrFish && !hasEggs && !hasRootVegOrAllium;

    default:
      return !hasMeatOrFish && !hasEggs;
  }
}

/**
 * Checks whether a recipe is free from specified allergens.
 * Unknown or incomplete ingredient metadata fails closed if allergens are specified.
 */
export function isRecipeCompliantWithAllergies(recipe: Recipe, allergies?: string[]): boolean {
  if (!allergies || allergies.length === 0) return true;
  const ings = recipe.ingredients || [];
  const lowerAllergies = allergies.map((a) => a.toLowerCase().trim()).filter(Boolean);
  if (lowerAllergies.length === 0) return true;

  for (const ing of ings) {
    const meta = getIngredientMetadata(ing);
    // Fail-closed: unverified ingredient metadata cannot be confirmed allergen-free
    if (!meta) {
      return false;
    }

    const ingId = ing.ingredientId.toLowerCase();
    const ingName = (meta.name || ingId).toLowerCase();
    const declaredAllergens = (meta.allergens || []).map((a) => a.toLowerCase());

    for (const allergy of lowerAllergies) {
      // 1. Direct structured allergen tags
      if (declaredAllergens.some((da) => da.includes(allergy) || allergy.includes(da))) {
        return false;
      }

      // 2. Structured boolean flags on verified ingredient
      if ((allergy.includes('peanut') || allergy.includes('nut')) && meta.containsNuts) {
        return false;
      }
      if ((allergy.includes('gluten') || allergy.includes('wheat')) && meta.containsGluten) {
        return false;
      }
      if ((allergy.includes('dairy') || allergy.includes('lactose')) && meta.containsDairy) {
        return false;
      }
      if (allergy.includes('egg') && meta.containsEggs) {
        return false;
      }
      if ((allergy.includes('fish') || allergy.includes('seafood')) && (meta.containsFish || meta.containsSeafood)) {
        return false;
      }

      // 3. Fallback keyword matching
      const keywords = ALLERGEN_KEYWORD_MAP[allergy] || [allergy];
      for (const kw of keywords) {
        if (ingId.includes(kw) || ingName.includes(kw)) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Checks whether a recipe is free from explicitly excluded / disliked ingredients.
 */
export function isRecipeCompliantWithExclusions(recipe: Recipe, excludedIngredients?: string[]): boolean {
  if (!excludedIngredients || excludedIngredients.length === 0) return true;
  const ings = recipe.ingredients || [];
  const lowerExclusions = excludedIngredients.map((e) => e.toLowerCase().trim()).filter(Boolean);
  if (lowerExclusions.length === 0) return true;

  for (const ing of ings) {
    const meta = getIngredientMetadata(ing);
    const ingId = ing.ingredientId.toLowerCase();
    const ingName = (meta?.name || ingId).toLowerCase();

    for (const ex of lowerExclusions) {
      if (ingId === ex || ingId.includes(ex) || ingName.includes(ex)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Checks whether a recipe matches the user's cuisine preferences (regional or specific).
 */
export function isRecipeCompliantWithCuisine(recipe: Recipe, preferences?: string[]): boolean {
  if (!preferences || preferences.length === 0) return true;

  // Check if ALL_INDIAN or "All Indian Cuisines" or "Pan-Indian" is chosen
  const hasAllIndian = preferences.some((p) => {
    const clean = p.toUpperCase().replace(/[-\s]/g, '_');
    return clean === 'ALL_INDIAN' || clean === 'PAN_INDIAN' || clean === 'ALL_INDIAN_CUISINES';
  });

  if (hasAllIndian) return true;

  const recipeCuisine = recipe.cuisine;

  for (const pref of preferences) {
    if (!pref) continue;
    // 1. Direct match (e.g. 'Punjabi' === 'Punjabi', or 'South Indian' === 'South Indian')
    if (recipeCuisine.toLowerCase() === pref.toLowerCase()) {
      return true;
    }

    // 2. Regional Expansion: e.g. User selected 'North Indian', which encompasses 'Punjabi', 'Kashmiri', etc.
    const regionalCuisines = REGION_TO_CUISINES[pref];
    if (regionalCuisines && regionalCuisines.some((c) => c.toLowerCase() === recipeCuisine.toLowerCase())) {
      return true;
    }
  }

  return false;
}

/**
 * Verifies whether a shared meal satisfies the intersection of all household members' actual restrictions.
 * Enforces:
 * - Individual dietary preferences for every member.
 * - Individual allergies for every member.
 * - Explicit ingredient exclusions for every member.
 * - Household-wide exclusions.
 * - Jain & Vegan ingredient restrictions.
 */
export function isRecipeCompliantWithHouseholdMembers(
  recipe: Recipe,
  members?: HouseholdMember[],
  householdExclusions?: string[]
): { isCompliant: boolean; violatedReasons: string[] } {
  const violatedReasons: string[] = [];
  if (!members || members.length === 0) {
    if (householdExclusions && householdExclusions.length > 0) {
      if (!isRecipeCompliantWithExclusions(recipe, householdExclusions)) {
        violatedReasons.push(`Contains household excluded ingredients (${householdExclusions.join(', ')})`);
      }
    }
    return { isCompliant: violatedReasons.length === 0, violatedReasons };
  }

  for (const member of members) {
    const memName = member.name || member.id || 'Member';

    // 1. Individual dietary mode
    if (member.dietaryPreference) {
      if (!isRecipeCompliantWithDiet(recipe, member.dietaryPreference)) {
        violatedReasons.push(`Violates ${memName}'s dietary mode (${member.dietaryPreference})`);
      }
    }

    // 2. Individual allergies
    if (member.allergies && member.allergies.length > 0) {
      if (!isRecipeCompliantWithAllergies(recipe, member.allergies)) {
        violatedReasons.push(`Violates ${memName}'s allergy restrictions (${member.allergies.join(', ')})`);
      }
    }

    // 3. Individual disliked / excluded ingredients
    if (member.dislikedIngredients && member.dislikedIngredients.length > 0) {
      if (!isRecipeCompliantWithExclusions(recipe, member.dislikedIngredients)) {
        violatedReasons.push(`Contains ingredients excluded by ${memName} (${member.dislikedIngredients.join(', ')})`);
      }
    }
  }

  // 4. Household-wide exclusions
  if (householdExclusions && householdExclusions.length > 0) {
    if (!isRecipeCompliantWithExclusions(recipe, householdExclusions)) {
      violatedReasons.push(`Contains household-wide excluded ingredients (${householdExclusions.join(', ')})`);
    }
  }

  return {
    isCompliant: violatedReasons.length === 0,
    violatedReasons
  };
}

/**
 * Computes a high-level label for the household dietary preference
 */
export function getSharedHouseholdDietaryConstraint(members?: HouseholdMember[]): DietaryPreference {
  if (!members || members.length === 0) return 'VEGETARIAN';

  const normalized = members.map((m) => normalizeDietaryPreference(m.dietaryPreference));

  if (normalized.includes('JAIN')) return 'JAIN';
  if (normalized.includes('VEGAN')) return 'VEGAN';
  if (normalized.includes('VEGETARIAN')) return 'VEGETARIAN';
  if (normalized.includes('EGGETARIAN')) return 'EGGETARIAN';
  return 'NON_VEGETARIAN';
}

/**
 * Authoritative Recipe Filtering Engine enforcing Dietary, Allergy, Member Intersection, and Regional Constraints
 */
export function filterEligibleRecipes(
  recipes: Recipe[],
  criteria: {
    dietaryPreference?: DietaryPreference | string;
    cuisinePreferences?: string[];
    allergies?: string[];
    excludeRecipeIds?: string[];
    excludeIngredients?: string[];
    members?: HouseholdMember[];
  }
): {
  eligible: Recipe[];
  reasonIfNotAvailable?: string;
  appliedDiet: DietaryPreference;
  effectiveCuisines: string[];
} {
  const excludedIds = new Set(criteria.excludeRecipeIds || []);
  const hasMembers = Boolean(criteria.members && criteria.members.length > 0);

  // Applied diet representation
  const appliedDiet = hasMembers
    ? getSharedHouseholdDietaryConstraint(criteria.members)
    : normalizeDietaryPreference(criteria.dietaryPreference);

  const effectiveCuisines = criteria.cuisinePreferences && criteria.cuisinePreferences.length > 0
    ? criteria.cuisinePreferences
    : [ALL_INDIAN_CUISINE];

  const allDirectAllergies = criteria.allergies || [];
  const allDirectExclusions = criteria.excludeIngredients || [];

  const eligible = recipes.filter((r) => {
    // 1. Excluded recipes by ID
    if (excludedIds.has(r.id)) return false;

    // 2. Member Intersection: calculate shared-meal eligibility across ALL household members
    if (hasMembers) {
      const memberCheck = isRecipeCompliantWithHouseholdMembers(r, criteria.members, allDirectExclusions);
      if (!memberCheck.isCompliant) {
        return false;
      }
    } else {
      // Single/General Household mode:
      if (!isRecipeCompliantWithDiet(r, appliedDiet)) return false;
      if (!isRecipeCompliantWithAllergies(r, allDirectAllergies)) return false;
      if (!isRecipeCompliantWithExclusions(r, allDirectExclusions)) return false;
    }

    // 3. Strict Regional / Cuisine Filter Enforcement
    if (!isRecipeCompliantWithCuisine(r, effectiveCuisines)) return false;

    return true;
  });

  let reasonIfNotAvailable: string | undefined;
  if (eligible.length === 0) {
    const cuisineDesc = effectiveCuisines.includes(ALL_INDIAN_CUISINE)
      ? 'All Indian Cuisines'
      : effectiveCuisines.join(', ');

    if (hasMembers) {
      const memberDiets = criteria.members!.map((m) => `${m.name || 'Member'}: ${m.dietaryPreference}`).join('; ');
      const memberAllergies = criteria.members!.flatMap((m) => m.allergies || []).filter(Boolean);
      const memberExclusions = criteria.members!.flatMap((m) => m.dislikedIngredients || []).filter(Boolean);

      reasonIfNotAvailable = `No recipes in catalog satisfy all combined household member restrictions (Members: [${memberDiets}], Allergies: [${memberAllergies.join(', ') || 'None'}], Excluded: [${memberExclusions.join(', ') || 'None'}], Region: "${cuisineDesc}"). No constraints were relaxed to preserve dietary safety.`;
    } else {
      reasonIfNotAvailable = `No recipes in catalog matching regional filter "${cuisineDesc}" and dietary mode "${appliedDiet}". Please select "All Indian Cuisines" or adjust dietary preferences.`;
    }
  }

  return {
    eligible,
    reasonIfNotAvailable,
    appliedDiet,
    effectiveCuisines
  };
}
