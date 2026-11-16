import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { SEED_RECIPES, SEED_INGREDIENTS } = require('../packages/database/dist/seed-data.js');

console.log(`Auditing ${SEED_RECIPES.length} recipes in SEED_RECIPES:\n`);

const ingMap = new Map(SEED_INGREDIENTS.map(i => [i.id, i]));

for (let i = 0; i < SEED_RECIPES.length; i++) {
  const r = SEED_RECIPES[i];
  const tags = r.dietaryTags || [];
  const ingIds = r.ingredients.map(x => x.ingredientId);
  const ings = ingIds.map(id => ingMap.get(id)).filter(Boolean);

  const hasDairy = ingIds.some(id => ['ing-paneer', 'ing-ghee', 'ing-butter', 'ing-milk', 'ing-curd', 'ing-cream', 'ing-cheese', 'ing-buttermilk'].includes(id));
  const hasEggs = ingIds.some(id => ['ing-eggs', 'ing-egg'].includes(id));
  const hasMeat = ingIds.some(id => ['ing-chicken', 'ing-fish'].includes(id));
  const hasGluten = ingIds.some(id => ['ing-atta', 'ing-rava', 'ing-maida'].includes(id));
  const hasAlliumOrRoot = ingIds.some(id => ['ing-onion', 'ing-garlic', 'ing-potato', 'ing-ginger', 'ing-purple-yam', 'ing-carrot', 'ing-radish'].includes(id));

  const issues = [];
  if (tags.includes('Vegan') && hasDairy) {
    issues.push(`CONTRADICTION: Tagged 'Vegan' but contains dairy (${ingIds.filter(id => ['ing-paneer', 'ing-ghee', 'ing-butter', 'ing-milk', 'ing-curd'].includes(id)).join(', ')})`);
  }
  if (tags.includes('Vegan') && hasEggs) {
    issues.push(`CONTRADICTION: Tagged 'Vegan' but contains eggs`);
  }
  if (tags.includes('Gluten-Free') && hasGluten) {
    issues.push(`CONTRADICTION: Tagged 'Gluten-Free' but contains gluten grains (${ingIds.filter(id => ['ing-atta', 'ing-rava'].includes(id)).join(', ')})`);
  }
  if (r.isJainFriendly && hasAlliumOrRoot) {
    issues.push(`CONTRADICTION: Marked isJainFriendly=true but contains root/allium (${ingIds.filter(id => ['ing-onion', 'ing-garlic', 'ing-potato', 'ing-ginger', 'ing-purple-yam'].includes(id)).join(', ')})`);
  }
  if (r.isJainFriendly && (hasMeat || hasEggs)) {
    issues.push(`CONTRADICTION: Marked isJainFriendly=true but contains meat or eggs`);
  }

  console.log(`[${i + 1}] ${r.id} | ${r.title}`);
  console.log(`    Cuisine: ${r.cuisine} | Servings: ${r.defaultServings} | Jain: ${r.isJainFriendly}`);
  console.log(`    Tags: [${tags.join(', ')}]`);
  console.log(`    Nutrition: ${r.caloriesPerServing} kcal, ${r.proteinGrams}g P, ${r.carbsGrams}g C, ${r.fatGrams}g F`);
  if (issues.length > 0) {
    console.log(`    ⚠️ ISSUES FOUND:`);
    issues.forEach(iss => console.log(`       - ${iss}`));
  } else {
    console.log(`    ✅ No obvious contradictions`);
  }
  console.log('');
}
