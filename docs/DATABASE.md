# Database Architecture & Schema Specification
## RasoiIQ Normalized PostgreSQL Schema (Prisma ORM)

### 1. Separation of Concerns: Ingredient vs Retail Product
A foundational requirement of RasoiIQ is decoupling **Ingredient Identity** (culinary concept) from **Retail Product Identity** (SKU sold by retailers):

- `Ingredient`: Represents culinary items (e.g., "Paneer", "Basmati Rice", "Mustard Oil", "Turmeric Powder").
- `RecipeIngredient`: Links a recipe to an ingredient with quantity and unit.
- `Product`: Represents physical merchandise sold by retailers (e.g., "Amul Malai Paneer 200g", "Daawat Rozana Gold Basmati Rice 5kg", "Fortune Kachi Ghani Mustard Oil 1L").
- `ProductVariant`: Handles specific pack sizes (e.g., 200g, 500g, 1kg).
- `StoreProduct`: Connects a ProductVariant to a specific Store/Retailer with localized price, stock status, and discount.

### 2. Entity Relational Model Summary
```
[User] ──< [Household] ──< [HouseholdMember] ──< [DietaryPreference]
   │           │
   │           ├──< [PantryItem] >── [Ingredient]
   │           └──< [MealPlan] ──< [MealPlanItem] >── [Recipe]
   │                                                     │
   │                                                     └──< [RecipeIngredient] >── [Ingredient]
   │                                                                                      │
   └──< [Basket] ──< [BasketItem] >── [ProductVariant] >── [Product] ─────────────────────┘
          │                                 │
      [Retailer] >── [Store] >── [StoreProduct]
```

### 3. Key Entities
1. **User & Auth**: `User`, `Session`, `Address`.
2. **Household & Nutrition**: `Household`, `HouseholdMember`, `DietaryPreference` (Vegetarian, Non-Veg, Jain, Vegan, Eggetarian, Halal).
3. **Recipe Catalog**: `Recipe`, `RecipeIngredient`, `RecipeStep`, `CuisineTag`, `MealType`.
4. **Meal Planning**: `MealPlan`, `MealPlanItem` (dayOfWeek, mealType, servings, recipeId).
5. **Pantry Management**: `PantryItem` (ingredientId, quantity, unit, expiryDate, isLowStock).
6. **Marketplace & Retailers**: `Retailer`, `Store`, `Product`, `ProductVariant`, `StoreProduct`.
7. **Baskets & Orders**: `Basket`, `BasketItem`, `Order`, `OrderItem`, `Payment`.
