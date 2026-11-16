# RasoiIQ REST API Documentation
Base URL: `/api/v1`

### Authentication (`/auth`)
- `POST /auth/register` — Register a new account.
- `POST /auth/login` — Authenticate and retrieve JWT token.
- `POST /auth/demo-session` — Generate an active instant demo session with pre-populated household and meal plan.
- `GET /auth/me` — Retrieve current authenticated user profile.

### Household (`/households`)
- `GET /households/me` — Get user's active household profile and members.
- `PUT /households/me` — Update budget, spice preferences, member dietary settings.
- `POST /households/members` — Add family member with individual dietary constraints.

### Recipes (`/recipes`)
- `GET /recipes` — Search recipes with filters: `cuisine`, `dietary`, `maxTime`, `mealType`, `search`.
- `GET /recipes/:id` — Full recipe details with ingredient lists and step-by-step instructions.
- `POST /recipes/:id/favorite` — Toggle recipe bookmark.

### Meal Planning (`/meal-plans`)
- `GET /meal-plans/current` — Get 7-day meal plan for active week.
- `POST /meal-plans/item` — Add recipe to day (Monday-Sunday) and slot (Breakfast, Lunch, Dinner, Snack).
- `PUT /meal-plans/item/:id` — Update serving count or swap recipe.
- `DELETE /meal-plans/item/:id` — Remove recipe from slot.
- `POST /meal-plans/copy-week` — Duplicate plan to next week.

### AI Engine (`/ai`)
- `POST /ai/generate-plan` — Generate personalized 7-day meal plan based on natural language or household constraints.
- `POST /ai/recipe-substitute` — Suggest Indian ingredient substitution (e.g. paneer for tofu, jaggery for sugar).

### Grocery & Basket (`/grocery`)
- `GET /grocery/requirements` — Deterministic calculation of total required ingredients for the active meal plan.
- `GET /grocery/basket` — Multi-retailer mapped shopping basket with prices across Blinkit, Zepto, DMart, BigBasket.
- `POST /grocery/basket/toggle-item` — Toggle purchase requirement for an item without altering recipe requirements.
- `PUT /grocery/basket/swap-variant` — Change brand or pack size.

### Pantry (`/pantry`)
- `GET /pantry` — List all ingredients currently available at home.
- `POST /pantry` — Add ingredient with stock quantity.
- `PUT /pantry/:id` — Update available quantity.
- `DELETE /pantry/:id` — Remove item from pantry.

### Retailers & Marketplace (`/marketplace`)
- `GET /marketplace/retailers` — List supported grocers with delivery estimates and pricing tiers.
- `GET /marketplace/stores/:id/catalog` — Store inventory and pricing.
