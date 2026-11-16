--
-- PostgreSQL database dump
--

\restrict yBn2guBsFSqjvYle2ifBWvEVAEaadXfxFhPn57stejON0aG9laIhVUHyW6VuMsI

-- Dumped from database version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DietaryType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DietaryType" AS ENUM (
    'VEGETARIAN',
    'NON_VEGETARIAN',
    'JAIN',
    'VEGAN',
    'EGGETARIAN'
);


ALTER TYPE public."DietaryType" OWNER TO postgres;

--
-- Name: HouseholdRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."HouseholdRole" AS ENUM (
    'OWNER',
    'MEMBER',
    'COOK'
);


ALTER TYPE public."HouseholdRole" OWNER TO postgres;

--
-- Name: RetailerApplicationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RetailerApplicationStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'SUSPENDED'
);


ALTER TYPE public."RetailerApplicationStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'CUSTOMER',
    'RETAILER',
    'ADMIN',
    'SUPER_ADMIN',
    'OPERATIONS',
    'SUPPORT'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: SpiceTolerance; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SpiceTolerance" AS ENUM (
    'MILD',
    'MEDIUM',
    'SPICY',
    'DESI_TEEKHA'
);


ALTER TYPE public."SpiceTolerance" OWNER TO postgres;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'PENDING_VERIFICATION',
    'ACTIVE',
    'SUSPENDED',
    'DELETED'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

--
-- Name: audit_log_immutable_trigger(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.audit_log_immutable_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog records are strictly immutable and cannot be updated or deleted.';
END;
$$;


ALTER FUNCTION public.audit_log_immutable_trigger() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Address" (
    id text NOT NULL,
    "userId" text NOT NULL,
    label text NOT NULL,
    "flatBuilding" text NOT NULL,
    street text NOT NULL,
    landmark text,
    city text NOT NULL,
    state text NOT NULL,
    pincode text NOT NULL,
    latitude double precision,
    longitude double precision,
    "isDefault" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Address" OWNER TO postgres;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    "entityType" text,
    "entityId" text,
    metadata jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- Name: Basket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Basket" (
    id text NOT NULL,
    "householdId" text NOT NULL,
    "selectedRetailerId" text NOT NULL,
    "subtotalInr" double precision DEFAULT 0 NOT NULL,
    "deliveryFeeInr" double precision DEFAULT 0 NOT NULL,
    "totalInr" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Basket" OWNER TO postgres;

--
-- Name: BasketItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BasketItem" (
    id text NOT NULL,
    "basketId" text NOT NULL,
    "productVariantId" text NOT NULL,
    "quantityPacks" integer DEFAULT 1 NOT NULL,
    "isSelectedForPurchase" boolean DEFAULT true NOT NULL,
    "availableAtHome" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."BasketItem" OWNER TO postgres;

--
-- Name: EmailVerificationToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmailVerificationToken" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tokenHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "consumedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."EmailVerificationToken" OWNER TO postgres;

--
-- Name: Feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Feedback" (
    id text NOT NULL,
    "userId" text NOT NULL,
    rating integer NOT NULL,
    comment text,
    category text DEFAULT 'GENERAL'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Feedback" OWNER TO postgres;

--
-- Name: Household; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Household" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    "spiceTolerance" public."SpiceTolerance" DEFAULT 'MEDIUM'::public."SpiceTolerance" NOT NULL,
    "weeklyBudgetInr" double precision DEFAULT 3000 NOT NULL,
    "cookingFrequency" text DEFAULT 'Daily Fresh'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    city text DEFAULT 'Ahmedabad'::text NOT NULL,
    country text DEFAULT 'India'::text NOT NULL,
    "cuisinePreference" text DEFAULT 'ALL_INDIAN'::text NOT NULL,
    "dietaryPreference" public."DietaryType" DEFAULT 'VEGETARIAN'::public."DietaryType" NOT NULL,
    locality text,
    size integer DEFAULT 4 NOT NULL,
    state text DEFAULT 'Gujarat'::text NOT NULL
);


ALTER TABLE public."Household" OWNER TO postgres;

--
-- Name: HouseholdInvitation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."HouseholdInvitation" (
    id text NOT NULL,
    "householdId" text NOT NULL,
    "invitedEmail" text NOT NULL,
    "invitedByUserId" text NOT NULL,
    "tokenHash" text NOT NULL,
    role public."HouseholdRole" DEFAULT 'MEMBER'::public."HouseholdRole" NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "acceptedAt" timestamp(3) without time zone,
    "revokedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."HouseholdInvitation" OWNER TO postgres;

--
-- Name: HouseholdMember; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."HouseholdMember" (
    id text NOT NULL,
    "householdId" text NOT NULL,
    name text NOT NULL,
    "ageGroup" text DEFAULT 'adult'::text NOT NULL,
    "dietaryPreference" public."DietaryType" DEFAULT 'VEGETARIAN'::public."DietaryType" NOT NULL,
    allergies text[] DEFAULT ARRAY[]::text[],
    "dislikedIngredients" text[] DEFAULT ARRAY[]::text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role public."HouseholdRole" DEFAULT 'MEMBER'::public."HouseholdRole" NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "userId" text
);


ALTER TABLE public."HouseholdMember" OWNER TO postgres;

--
-- Name: Ingredient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Ingredient" (
    id text NOT NULL,
    name text NOT NULL,
    "hindiName" text,
    category text NOT NULL,
    "standardUnit" text NOT NULL,
    "shelfLifeDays" integer,
    "isJainPermissible" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Ingredient" OWNER TO postgres;

--
-- Name: MealPlan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MealPlan" (
    id text NOT NULL,
    "householdId" text NOT NULL,
    "weekStartDate" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MealPlan" OWNER TO postgres;

--
-- Name: MealPlanItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MealPlanItem" (
    id text NOT NULL,
    "mealPlanId" text NOT NULL,
    "dayOfWeek" text NOT NULL,
    "mealCategory" text NOT NULL,
    "recipeId" text NOT NULL,
    servings integer DEFAULT 4 NOT NULL,
    notes text
);


ALTER TABLE public."MealPlanItem" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "retailerName" text NOT NULL,
    status text DEFAULT 'PLACED'::text NOT NULL,
    "totalAmountInr" double precision NOT NULL,
    "deliveryFeeInr" double precision NOT NULL,
    "deliveryAddress" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "fulfillmentNotes" text,
    "isDemoOrder" boolean DEFAULT true NOT NULL,
    "statusReason" text,
    "substitutionNotes" text,
    "updatedBy" text
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productVariantId" text NOT NULL,
    "quantityPacks" integer NOT NULL,
    "unitPriceInr" double precision NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: PantryItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PantryItem" (
    id text NOT NULL,
    "householdId" text NOT NULL,
    "ingredientId" text NOT NULL,
    "currentQuantity" double precision NOT NULL,
    unit text NOT NULL,
    "isLowStock" boolean DEFAULT false NOT NULL,
    "lowStockThreshold" double precision,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PantryItem" OWNER TO postgres;

--
-- Name: PasswordResetToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PasswordResetToken" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tokenHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "consumedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PasswordResetToken" OWNER TO postgres;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "amountInr" double precision NOT NULL,
    status text DEFAULT 'SUCCESS'::text NOT NULL,
    "paymentMethod" text DEFAULT 'UPI'::text NOT NULL,
    "transactionId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Payment" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    brand text NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    "imageUrl" text NOT NULL,
    description text
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: ProductVariant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductVariant" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "ingredientId" text NOT NULL,
    sku text NOT NULL,
    brand text NOT NULL,
    title text NOT NULL,
    "packQuantity" double precision NOT NULL,
    "packUnit" text NOT NULL,
    "mrpInr" double precision NOT NULL,
    "sellingPriceInr" double precision NOT NULL,
    "imageUrl" text NOT NULL
);


ALTER TABLE public."ProductVariant" OWNER TO postgres;

--
-- Name: Recipe; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Recipe" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    cuisine text NOT NULL,
    "dietaryTags" text[],
    "mealTypes" text[],
    "prepTimeMinutes" integer NOT NULL,
    "cookTimeMinutes" integer NOT NULL,
    "defaultServings" integer DEFAULT 4 NOT NULL,
    difficulty text DEFAULT 'Medium'::text NOT NULL,
    "caloriesPerServing" double precision NOT NULL,
    "proteinGrams" double precision NOT NULL,
    "carbsGrams" double precision NOT NULL,
    "fatGrams" double precision NOT NULL,
    "fiberGrams" double precision NOT NULL,
    "imageUrl" text NOT NULL,
    "estimatedCostInr" double precision NOT NULL,
    "isJainFriendly" boolean DEFAULT false NOT NULL,
    "jainAlternativeNotes" text,
    rating double precision DEFAULT 4.8 NOT NULL,
    "ratingCount" integer DEFAULT 120 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "archivedAt" timestamp(3) without time zone,
    "archivedBy" text,
    "isArchived" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Recipe" OWNER TO postgres;

--
-- Name: RecipeIngredient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RecipeIngredient" (
    id text NOT NULL,
    "recipeId" text NOT NULL,
    "ingredientId" text NOT NULL,
    quantity double precision NOT NULL,
    unit text NOT NULL,
    notes text
);


ALTER TABLE public."RecipeIngredient" OWNER TO postgres;

--
-- Name: RecipeStep; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RecipeStep" (
    id text NOT NULL,
    "recipeId" text NOT NULL,
    "stepNumber" integer NOT NULL,
    instruction text NOT NULL,
    tip text,
    "durationMinutes" integer
);


ALTER TABLE public."RecipeStep" OWNER TO postgres;

--
-- Name: RefreshSession; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RefreshSession" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tokenHash" text NOT NULL,
    "tokenFamilyId" text NOT NULL,
    "deviceName" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastUsedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "revokedAt" timestamp(3) without time zone
);


ALTER TABLE public."RefreshSession" OWNER TO postgres;

--
-- Name: Retailer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Retailer" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "logoUrl" text NOT NULL,
    "deliveryTimeEstimate" text NOT NULL,
    "deliveryFeeInr" double precision DEFAULT 29 NOT NULL,
    "freeDeliveryThresholdInr" double precision DEFAULT 500 NOT NULL,
    "minOrderValueInr" double precision DEFAULT 99 NOT NULL,
    rating double precision DEFAULT 4.7 NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "suspendedAt" timestamp(3) without time zone,
    "suspendedReason" text
);


ALTER TABLE public."Retailer" OWNER TO postgres;

--
-- Name: RetailerApplication; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RetailerApplication" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "businessName" text NOT NULL,
    "contactInformation" jsonb NOT NULL,
    "applicationStatus" public."RetailerApplicationStatus" DEFAULT 'PENDING'::public."RetailerApplicationStatus" NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reviewedAt" timestamp(3) without time zone,
    "reviewedBy" text,
    "rejectionReason" text
);


ALTER TABLE public."RetailerApplication" OWNER TO postgres;

--
-- Name: RevokedToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RevokedToken" (
    id text NOT NULL,
    token text NOT NULL,
    reason text DEFAULT 'LOGOUT'::text,
    "revokedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RevokedToken" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: Store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Store" (
    id text NOT NULL,
    "retailerId" text NOT NULL,
    name text NOT NULL,
    city text NOT NULL,
    pincode text NOT NULL
);


ALTER TABLE public."Store" OWNER TO postgres;

--
-- Name: StoreProduct; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreProduct" (
    id text NOT NULL,
    "storeId" text NOT NULL,
    "productVariantId" text NOT NULL,
    "inStock" boolean DEFAULT true NOT NULL,
    "stockCount" integer DEFAULT 50 NOT NULL,
    "localPriceInr" double precision NOT NULL
);


ALTER TABLE public."StoreProduct" OWNER TO postgres;

--
-- Name: SystemSetting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SystemSetting" (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    "updatedBy" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SystemSetting" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "fullName" text NOT NULL,
    "phoneNumber" text,
    role public."Role" DEFAULT 'CUSTOMER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "emailVerifiedAt" timestamp(3) without time zone,
    "lastLoginAt" timestamp(3) without time zone,
    "normalizedEmail" text DEFAULT ''::text NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "suspendedAt" timestamp(3) without time zone,
    "suspendedBy" text,
    "suspensionReason" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Data for Name: Address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Address" (id, "userId", label, "flatBuilding", street, landmark, city, state, pincode, latitude, longitude, "isDefault") FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, "userId", action, "entityType", "entityId", metadata, "ipAddress", "userAgent", "createdAt") FROM stdin;
cmwj2fa550002l3s464kocjcw	cmwj2fa4w0000l3s4x4q1jmst	ADMIN_BOOTSTRAP	User	cmwj2fa4w0000l3s4x4q1jmst	{"role": "ADMIN", "email": "admin@rasoiiq.in", "source": "CLI"}	\N	\N	2026-11-16 09:32:54.425
cmwj4y7o5003ll3rcp82y51yy	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 10:43:36.917
cmwj4y8cw003ol3rcrq1ge2xl	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 10:43:37.809
cmwj4yezl005ul3rc2o67xyya	\N	ORDER_STATUS_CHANGED	Order	ord-1794825818247	{"reason": "Out with delivery executive", "actorId": "user-ops-1", "newStatus": "DISPATCHED", "fulfillmentNotes": "Customer requested contactless delivery at doorstep"}	\N	\N	2026-11-16 10:43:46.401
cmwj4yf15005wl3rci0op1znn	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_CREATED	Recipe	rec-1794825826443	{"title": "Kathiyawadi Ringan No Olo mwj4ye8x", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "cuisine": "Kathiyawadi"}	\N	\N	2026-11-16 10:43:46.457
cmwj4yf1w005yl3rchy0ubde0	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794825826443	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": true}	\N	\N	2026-11-16 10:43:46.484
cmwj4yf2o0060l3rchnf1p6vj	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794825826443	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": false}	\N	\N	2026-11-16 10:43:46.512
cmwj58zb1006dl3rc14esvner	cmwj58zak0069l3rc3wksnuya	REGISTER	User	cmwj58zak0069l3rc3wksnuya	{"actorId": "cmwj58zak0069l3rc3wksnuya"}	::1	\N	2026-11-16 10:51:59.293
cmwj58zqh006nl3rctgctoxnr	\N	ORDER_STATUS_CHANGED	Order	ord-1794825818247	{"reason": "Out with delivery executive", "actorId": "user-ops-1", "newStatus": "DISPATCHED", "fulfillmentNotes": "Customer requested contactless delivery at doorstep"}	\N	\N	2026-11-16 10:51:59.849
cmwj58zro006pl3rcazjvznji	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_CREATED	Recipe	rec-1794826319880	{"title": "Kathiyawadi Ringan No Olo mwj58z1h", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "cuisine": "Kathiyawadi"}	\N	\N	2026-11-16 10:51:59.892
cmwj58zs8006rl3rcteon99qz	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794826319880	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": true}	\N	\N	2026-11-16 10:51:59.913
cmwj58zst006tl3rca0g85dzk	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794826319880	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": false}	\N	\N	2026-11-16 10:51:59.933
cmwj33fok001nl33k4nnujlfn	cmwj2fa4w0000l3s4x4q1jmst	LOGIN_SUCCESS	\N	\N	{}	::1	node	2026-11-16 09:51:41.349
cmwj33fqj001pl33ku00roxwz	\N	LOGOUT	\N	\N	{}	::1	\N	2026-11-16 09:51:41.42
cmwj33f0h0017l33koaahx5vj	\N	REGISTER	User	cmwj33f060013l33k4h6pos88	{}	::1	\N	2026-11-16 09:51:40.481
cmwj33f170019l33kjgabojnz	\N	EMAIL_VERIFIED	User	cmwj33f060013l33k4h6pos88	{}	::1	\N	2026-11-16 09:51:40.508
cmwj33fb0001dl33krh4rdvg2	\N	LOGIN_SUCCESS	\N	\N	{}	::1	node	2026-11-16 09:51:40.86
cmwj33fbx001hl33kr8pctdwj	\N	HOUSEHOLD_INVITATION_ACCEPTED	Household	cmwj33eom000ul33ko9vkiapb	{"role": "MEMBER"}	\N	\N	2026-11-16 09:51:40.893
cmwj33d3y0004l33k3e5hyebv	\N	REGISTER	User	cmwj33d3h0000l33k7g1c2aik	{}	::1	\N	2026-11-16 09:51:38.015
cmwj33d7z0006l33kpydlzgfy	\N	EMAIL_VERIFIED	User	cmwj33d3h0000l33k7g1c2aik	{}	::1	\N	2026-11-16 09:51:38.159
cmwj33dho0008l33kj1bo2p4f	\N	LOGIN_FAILURE	\N	\N	{}	::1	\N	2026-11-16 09:51:38.509
cmwj33drj000cl33k2m9wtanm	\N	LOGIN_SUCCESS	\N	\N	{}	::1	node	2026-11-16 09:51:38.863
cmwj33dt8000gl33kuc7gyxtl	\N	REFRESH_TOKEN_REPLAY_DETECTED	\N	\N	{"tokenFamilyId": "fam_c4ab31bb-8bf9-43fc-8e2e-9d19b3cddaf4"}	::1	\N	2026-11-16 09:51:38.924
cmwj33du7000kl33k3s0kadhf	\N	PASSWORD_RESET_REQUESTED	\N	\N	{}	::1	\N	2026-11-16 09:51:38.96
cmwj33e3x000ml33ktzr509r4	\N	PASSWORD_RESET_COMPLETED	\N	\N	{}	::1	\N	2026-11-16 09:51:39.309
cmwj33edu000ol33kvbtt9ja8	\N	LOGIN_FAILURE	\N	\N	{}	::1	\N	2026-11-16 09:51:39.667
cmwj33eo1000sl33km4k4jnvf	\N	LOGIN_SUCCESS	\N	\N	{}	::1	node	2026-11-16 09:51:40.034
cmwj33ep4000yl33kj0til14x	\N	HOUSEHOLD_CREATED	Household	cmwj33eom000ul33ko9vkiapb	{"name": "Joshi Family Kitchen"}	\N	\N	2026-11-16 09:51:40.072
cmwj33eqd0012l33k9oxjfxdr	\N	HOUSEHOLD_INVITATION_SENT	HouseholdInvitation	cmwj33eq80010l33k8runjyrc	{"role": "MEMBER", "invitedEmail": "invited.family.mwj33co8@testrasoi.in"}	\N	\N	2026-11-16 09:51:40.118
cmwj34f8q001rl33k35eiy6uv	\N	LOGOUT	\N	\N	{}	::1	\N	2026-11-16 09:52:27.435
cmwj34ku2001sl33ksi3iqkdf	\N	LOGIN_FAILURE	\N	\N	{"email": "pilot.user.mwj34kmh@testrasoi.in"}	::1	\N	2026-11-16 09:52:34.682
cmwj38fdb0001l3i4s5jsnaus	\N	LOGOUT	\N	\N	{}	::1	\N	2026-11-16 09:55:34.223
cmwj38qf50003l3i47ecmcpdh	\N	LOGOUT	\N	\N	{}	::1	\N	2026-11-16 09:55:48.546
cmwj39g3h001rl3i4caiqyqqa	cmwj2fa4w0000l3s4x4q1jmst	LOGIN_SUCCESS	\N	\N	{}	::1	node	2026-11-16 09:56:21.822
cmwj39g5c001tl3i41q1i2qhg	\N	LOGOUT	\N	\N	{}	::1	\N	2026-11-16 09:56:21.888
cmwj39fct001bl3i4i2li0zav	\N	REGISTER	User	cmwj39fch0017l3i4vr9d0z02	{}	::1	\N	2026-11-16 09:56:20.861
cmwj39fdl001dl3i4fsxdkzqm	\N	EMAIL_VERIFIED	User	cmwj39fch0017l3i4vr9d0z02	{}	::1	\N	2026-11-16 09:56:20.889
cmwj39fof001hl3i41o09cj4l	\N	LOGIN_SUCCESS	\N	\N	{}	::1	node	2026-11-16 09:56:21.279
cmwj39fph001ll3i4byqcfkdl	\N	HOUSEHOLD_INVITATION_ACCEPTED	Household	cmwj39eye000yl3i4thgo6x4p	{"role": "MEMBER"}	\N	\N	2026-11-16 09:56:21.317
cmwj39d9v0008l3i4fkbon8as	\N	REGISTER	User	cmwj39d990004l3i4dfatr72j	{}	::1	\N	2026-11-16 09:56:18.164
cmwj39dea000al3i4kb0bgvg4	\N	EMAIL_VERIFIED	User	cmwj39d990004l3i4dfatr72j	{}	::1	\N	2026-11-16 09:56:18.322
cmwj39dpf000cl3i49iqm1jyr	\N	LOGIN_FAILURE	\N	\N	{}	::1	\N	2026-11-16 09:56:18.724
cmwj39e0b000gl3i4kq0994xe	\N	LOGIN_SUCCESS	\N	\N	{}	::1	node	2026-11-16 09:56:19.116
cmwj39e22000kl3i4c2yplt0t	\N	REFRESH_TOKEN_REPLAY_DETECTED	\N	\N	{"tokenFamilyId": "fam_e5815562-637a-4fa9-8d8c-c08776fdf781"}	::1	\N	2026-11-16 09:56:19.178
cmwj39e31000ol3i4r5029o44	\N	PASSWORD_RESET_REQUESTED	\N	\N	{}	::1	\N	2026-11-16 09:56:19.214
cmwj39ed1000ql3i4poepmhpu	\N	PASSWORD_RESET_COMPLETED	\N	\N	{}	::1	\N	2026-11-16 09:56:19.573
cmwj39en7000sl3i46j4yyvjf	\N	LOGIN_FAILURE	\N	\N	{}	::1	\N	2026-11-16 09:56:19.94
cmwj39exr000wl3i4lvkd0tda	\N	LOGIN_SUCCESS	\N	\N	{}	::1	node	2026-11-16 09:56:20.32
cmwj39eyw0012l3i488p22724	\N	HOUSEHOLD_CREATED	Household	cmwj39eye000yl3i4thgo6x4p	{"name": "Joshi Family Kitchen"}	\N	\N	2026-11-16 09:56:20.36
cmwj39f100016l3i43otq46ab	\N	HOUSEHOLD_INVITATION_SENT	HouseholdInvitation	cmwj39f0j0014l3i4ml88yoto	{"role": "MEMBER", "invitedEmail": "invited.family.mwj39csx@testrasoi.in"}	\N	\N	2026-11-16 09:56:20.436
cmwj3a205001vl3i4wgv72hxa	\N	LOGOUT	\N	\N	{}	::1	\N	2026-11-16 09:56:50.213
cmwj3a2l3001xl3i4buqdh8w6	\N	LOGOUT	\N	\N	{}	::1	\N	2026-11-16 09:56:50.967
cmwj3a5pp001yl3i4podm1yeq	\N	LOGIN_FAILURE	\N	\N	{"email": "pilot.user.mwj3a5jf@testrasoi.in"}	::1	\N	2026-11-16 09:56:55.021
cmwj3evwq0001l3g0mlkdnof4	\N	LOGOUT	\N	\N	{}	::1	\N	2026-11-16 10:00:35.594
cmwj3ewwl0003l3g0rf8gmfb4	\N	LOGOUT	\N	\N	{}	::1	\N	2026-11-16 10:00:36.885
cmwj3f5ln001rl3g0ynpo3uco	cmwj2fa4w0000l3s4x4q1jmst	LOGIN_SUCCESS	\N	\N	{}	::1	node	2026-11-16 10:00:48.155
cmwj3f5pl001tl3g0n9z3thxa	\N	LOGOUT	\N	\N	{}	::1	\N	2026-11-16 10:00:48.298
cmwj3f4kn001bl3g0h2f21spk	\N	REGISTER	User	cmwj3f4k80017l3g0jqxzp0ee	{}	::1	\N	2026-11-16 10:00:46.823
cmwj3f4lr001dl3g06xjcs5xn	\N	EMAIL_VERIFIED	User	cmwj3f4k80017l3g0jqxzp0ee	{}	::1	\N	2026-11-16 10:00:46.863
cmwj3f50d001hl3g0yw79zvbn	\N	LOGIN_SUCCESS	\N	\N	{}	::1	node	2026-11-16 10:00:47.389
cmwj3f522001ll3g0ny8twawv	\N	HOUSEHOLD_INVITATION_ACCEPTED	Household	cmwj3f41z000yl3g0hw94vn6f	{"role": "MEMBER"}	\N	\N	2026-11-16 10:00:47.45
cmwj3f1k80008l3g01873z23s	\N	REGISTER	User	cmwj3f1jm0004l3g0ilbzzana	{}	::1	\N	2026-11-16 10:00:42.92
cmwj3f1ov000al3g0k1th2x63	\N	EMAIL_VERIFIED	User	cmwj3f1jm0004l3g0ilbzzana	{}	::1	\N	2026-11-16 10:00:43.087
cmwj3f23s000cl3g0cadllyrh	\N	LOGIN_FAILURE	\N	\N	{}	::1	\N	2026-11-16 10:00:43.624
cmwj3f2nc000gl3g04kjbbj55	\N	LOGIN_SUCCESS	\N	\N	{}	::1	node	2026-11-16 10:00:44.328
cmwj3f2pj000kl3g0ywv08g9y	\N	REFRESH_TOKEN_REPLAY_DETECTED	\N	\N	{"tokenFamilyId": "fam_b757dcd9-9957-4cde-b858-c062f25c9336"}	::1	\N	2026-11-16 10:00:44.407
cmwj3f2qt000ol3g06evc7yx7	\N	PASSWORD_RESET_REQUESTED	\N	\N	{}	::1	\N	2026-11-16 10:00:44.453
cmwj3f357000ql3g0llcdiq55	\N	PASSWORD_RESET_COMPLETED	\N	\N	{}	::1	\N	2026-11-16 10:00:44.971
cmwj3f3kw000sl3g0aqoo6va8	\N	LOGIN_FAILURE	\N	\N	{}	::1	\N	2026-11-16 10:00:45.536
cmwj3f417000wl3g0slv2f2pf	\N	LOGIN_SUCCESS	\N	\N	{}	::1	node	2026-11-16 10:00:46.123
cmwj3f42n0012l3g0hhza86oc	\N	HOUSEHOLD_CREATED	Household	cmwj3f41z000yl3g0hw94vn6f	{"name": "Joshi Family Kitchen"}	\N	\N	2026-11-16 10:00:46.175
cmwj3f45c0016l3g05p2kvtiu	\N	HOUSEHOLD_INVITATION_SENT	HouseholdInvitation	cmwj3f44y0014l3g0ujuemz2w	{"role": "MEMBER", "invitedEmail": "invited.family.mwj3f0ys@testrasoi.in"}	\N	\N	2026-11-16 10:00:46.272
cmwj4nyuj0002l3ic232maioh	cmwj4nyub0000l3ic1cbm4scv	ADMIN_BOOTSTRAP	User	cmwj4nyub0000l3ic1cbm4scv	{"role": "SUPER_ADMIN", "email": "superadmin@rasoiiq.in", "source": "CLI"}	\N	\N	2026-11-16 10:35:38.924
cmwj4rt390004l32w59a2wa5e	cmwj4rt2s0000l32wbc1f7nfy	REGISTER	User	cmwj4rt2s0000l32wbc1f7nfy	{}	::1	\N	2026-11-16 10:38:38.085
cmwj4s4sq0009l32wnbd6dzbi	cmwj4s4se0005l32w7q19yt5l	REGISTER	User	cmwj4s4se0005l32w7q19yt5l	{}	::1	\N	2026-11-16 10:38:53.259
cmwj4tzuq0004l3rc7vv9igk1	cmwj4tzu40000l3rcqmpkfu8l	REGISTER	User	cmwj4tzu40000l3rcqmpkfu8l	{"actorId": "cmwj4tzu40000l3rcqmpkfu8l"}	::1	\N	2026-11-16 10:40:20.162
cmwj4u07b0006l3rcs6bvenso	cmwj2fa4w0000l3s4x4q1jmst	USER_SUSPENDED	User	cmwj4tzu40000l3rcqmpkfu8l	{"reason": "Investigating suspicious order activity", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "SUSPENDED", "targetEmail": "rogue.admin.mwj4tzkq@test.in", "previousStatus": "PENDING_VERIFICATION"}	\N	\N	2026-11-16 10:40:20.615
cmwj4u08y0008l3rcy1v3i57h	cmwj2fa4w0000l3s4x4q1jmst	USER_REACTIVATED	User	cmwj4tzu40000l3rcqmpkfu8l	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "ACTIVE", "targetEmail": "rogue.admin.mwj4tzkq@test.in", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 10:40:20.674
cmwj4u0aq000al3rcw575mp9p	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_APPROVED	RetailerApplication	cmwj4u0960003l3q0fuogx841	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "applicantId": "cmwj4tzu40000l3rcqmpkfu8l", "businessName": "Fresh Greens Mart mwj4tzkq", "applicantEmail": "rogue.admin.mwj4tzkq@test.in"}	\N	\N	2026-11-16 10:40:20.738
cmwj4u0br000cl3rcu0mbo0r5	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_SUSPENDED	Retailer	ret-fresh-greens-mart-mwj4tzkq	{"reason": "Audit pending", "status": "SUSPENDED", "actorId": "cmwj2fa4w0000l3s4x4q1jmst"}	\N	\N	2026-11-16 10:40:20.775
cmwj4u0db000el3rclltm2rqk	\N	ORDER_STATUS_CHANGED	Order	ord-1794823237743	{"reason": "Out with delivery executive", "actorId": "user-ops-1", "newStatus": "DISPATCHED", "fulfillmentNotes": "Customer requested contactless delivery at doorstep"}	\N	\N	2026-11-16 10:40:20.831
cmwj4u0em000gl3rcgm9cgd4d	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_CREATED	Recipe	rec-1794825620862	{"title": "Kathiyawadi Ringan No Olo mwj4tzkq", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "cuisine": "Kathiyawadi"}	\N	\N	2026-11-16 10:40:20.878
cmwj4u0fa000il3rcx3t3u7y4	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794825620862	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": true}	\N	\N	2026-11-16 10:40:20.902
cmwj4u0fw000kl3rc98ca37v1	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794825620862	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": false}	\N	\N	2026-11-16 10:40:20.924
cmwj4u0qg000nl3rcpr1hnpow	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj4u0q5000ll3rc65255uth	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "ops.lead.mwj4tzkq@rasoiiq.in", "assignedRole": "OPERATIONS"}	\N	\N	2026-11-16 10:40:21.304
cmwj4u0r5000pl3rcbmfyu2t1	cmwj4nyub0000l3ic1cbm4scv	STAFF_ROLE_CHANGED	User	cmwj4u0q5000ll3rc65255uth	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newRole": "SUPPORT", "previousRole": "OPERATIONS"}	\N	\N	2026-11-16 10:40:21.329
cmwj4u0s4000sl3rczy96sxq6	cmwj4nyub0000l3ic1cbm4scv	SETTINGS_UPDATED	SystemSetting	cmwj4s5on0011l32wh1uxro1d	{"key": "pricing.default_delivery_fee_inr", "value": "35", "actorId": "cmwj4nyub0000l3ic1cbm4scv"}	\N	\N	2026-11-16 10:40:21.364
cmwj4ycw9004wl3rcjbgqx948	\N	REGISTER	User	cmwj4ycvt004sl3rclh8elztf	{"actorId": "cmwj4ycvt004sl3rclh8elztf"}	::1	\N	2026-11-16 10:43:43.689
cmwj5evh4000xl3082d39q49s	\N	REGISTER	User	cmwj5evgl000tl308jjr78hlr	{"actorId": "cmwj5evgl000tl308jjr78hlr"}	::1	\N	2026-11-16 10:56:34.264
cmwj5goda004dl308k091zrdb	cmwj2fa4w0000l3s4x4q1jmst	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst"}	::1	node	2026-11-16 10:57:58.366
cmwj5gofn004gl308cfyn7j76	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 10:57:58.451
cmwj5gnty0043l308mfq1x8ow	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj5gnae003tl3084qabxte5"}	::1	node	2026-11-16 10:57:57.67
cmwj5gnvp0047l308ctuysetg	\N	HOUSEHOLD_INVITATION_ACCEPTED	Household	cmwj5gmt7003kl308twun7cd7	{"role": "MEMBER", "actorId": "cmwj5gnae003tl3084qabxte5"}	\N	\N	2026-11-16 10:57:57.733
cmwj5gpiw004ll308myk6cr7w	cmwj5gpi9004hl308a296szof	REGISTER	User	cmwj5gpi9004hl308a296szof	{"actorId": "cmwj5gpi9004hl308a296szof"}	::1	\N	2026-11-16 10:57:59.864
cmwj5gq5h004vl308irkct1mm	\N	ORDER_STATUS_CHANGED	Order	ord-1794826669508	{"reason": "Out with delivery executive", "actorId": "user-ops-1", "newStatus": "DISPATCHED", "fulfillmentNotes": "Customer requested contactless delivery at doorstep"}	\N	\N	2026-11-16 10:58:00.677
cmwj5gq77004xl3086g6y3r7k	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_CREATED	Recipe	rec-1794826680717	{"title": "Kathiyawadi Ringan No Olo mwj5gp68", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "cuisine": "Kathiyawadi"}	\N	\N	2026-11-16 10:58:00.739
cmwj5gq8f004zl308mmnjz0su	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794826680717	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": true}	\N	\N	2026-11-16 10:58:00.784
cmwj68bkl000ul31wkrm5wvw4	\N	LOGIN_FAILURE	\N	\N	{"email": "superadmin@rasoi.internal", "actorId": "system"}	::1	\N	2026-11-16 11:19:28.149
cmwj69hlk000zl31wktbpvg8b	cmwj69hkz000vl31wlw6uv5rv	REGISTER	User	cmwj69hkz000vl31wlw6uv5rv	{"actorId": "cmwj69hkz000vl31wlw6uv5rv"}	::1	\N	2026-11-16 11:20:22.617
cmwj4vm5t000vl3rcpjx5ya4w	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 10:41:35.729
cmwj4vmqq000yl3rcdov52b4j	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 10:41:36.482
cmwj4vquo0013l3rc2ncsvxgk	cmwj4vqu8000zl3rcxghmhy5s	REGISTER	User	cmwj4vqu8000zl3rcxghmhy5s	{"actorId": "cmwj4vqu8000zl3rcxghmhy5s"}	::1	\N	2026-11-16 10:41:41.808
cmwj4vr8o0015l3rc9ujox6s9	cmwj2fa4w0000l3s4x4q1jmst	USER_SUSPENDED	User	cmwj4vqu8000zl3rcxghmhy5s	{"reason": "Investigating suspicious order activity", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "SUSPENDED", "targetEmail": "rogue.admin.mwj4vql1@test.in", "previousStatus": "PENDING_VERIFICATION"}	\N	\N	2026-11-16 10:41:42.312
cmwj4vrb10017l3rc2jeaq74m	cmwj2fa4w0000l3s4x4q1jmst	USER_REACTIVATED	User	cmwj4vqu8000zl3rcxghmhy5s	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "ACTIVE", "targetEmail": "rogue.admin.mwj4vql1@test.in", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 10:41:42.397
cmwj4vrdc0019l3rcgtf425s1	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_APPROVED	RetailerApplication	cmwj4vrbe0003l31grh99dfcb	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "applicantId": "cmwj4vqu8000zl3rcxghmhy5s", "businessName": "Fresh Greens Mart mwj4vql1", "applicantEmail": "rogue.admin.mwj4vql1@test.in"}	\N	\N	2026-11-16 10:41:42.48
cmwj4vreg001bl3rc349vsjup	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_SUSPENDED	Retailer	ret-fresh-greens-mart-mwj4vql1	{"reason": "Audit pending", "status": "SUSPENDED", "actorId": "cmwj2fa4w0000l3s4x4q1jmst"}	\N	\N	2026-11-16 10:41:42.52
cmwj4vrg2001dl3rciy9zgs6k	\N	ORDER_STATUS_CHANGED	Order	ord-1794825696926	{"reason": "Out with delivery executive", "actorId": "user-ops-1", "newStatus": "DISPATCHED", "fulfillmentNotes": "Customer requested contactless delivery at doorstep"}	\N	\N	2026-11-16 10:41:42.578
cmwj4vrh1001fl3rco05ddoxu	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_CREATED	Recipe	rec-1794825702604	{"title": "Kathiyawadi Ringan No Olo mwj4vql1", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "cuisine": "Kathiyawadi"}	\N	\N	2026-11-16 10:41:42.613
cmwj4vrhj001hl3rcqrrn2z9a	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794825702604	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": true}	\N	\N	2026-11-16 10:41:42.631
cmwj4vri7001jl3rcc05ee04v	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794825702604	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": false}	\N	\N	2026-11-16 10:41:42.655
cmwj4vrp7001ml3rc469s9kzu	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj4vrp1001kl3rcpspgngcx	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "ops.lead.mwj4vql1@rasoiiq.in", "assignedRole": "OPERATIONS"}	\N	\N	2026-11-16 10:41:42.908
cmwj4vrpl001ol3rc1e8v02f8	cmwj4nyub0000l3ic1cbm4scv	STAFF_ROLE_CHANGED	User	cmwj4vrp1001kl3rcpspgngcx	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newRole": "SUPPORT", "previousRole": "OPERATIONS"}	\N	\N	2026-11-16 10:41:42.921
cmwj4vrq9001rl3rcrqgi3yhx	cmwj4nyub0000l3ic1cbm4scv	SETTINGS_UPDATED	SystemSetting	cmwj4s5on0011l32wh1uxro1d	{"key": "pricing.default_delivery_fee_inr", "value": "35", "actorId": "cmwj4nyub0000l3ic1cbm4scv"}	\N	\N	2026-11-16 10:41:42.946
cmwj4ydn7005cl3rcqfxjc31p	cmwj2fa4w0000l3s4x4q1jmst	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst"}	::1	node	2026-11-16 10:43:44.66
cmwj4ydpd005fl3rc4al5hy8r	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 10:43:44.737
cmwj4ycx7004yl3rceg8py4ho	\N	EMAIL_VERIFIED	User	cmwj4ycvt004sl3rclh8elztf	{"actorId": "cmwj4ycvt004sl3rclh8elztf"}	::1	\N	2026-11-16 10:43:43.723
cmwj4yd7m0052l3rc6sopud4e	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj4ycvt004sl3rclh8elztf"}	::1	node	2026-11-16 10:43:44.098
cmwj4yd8r0056l3rceratxbpk	\N	HOUSEHOLD_INVITATION_ACCEPTED	Household	cmwj4ycij004jl3rcnh7zz9t2	{"role": "MEMBER", "actorId": "cmwj4ycvt004sl3rclh8elztf"}	\N	\N	2026-11-16 10:43:44.139
cmwj4yeib005kl3rckyebpzcg	cmwj4yehu005gl3rcm5kmhc9c	REGISTER	User	cmwj4yehu005gl3rcm5kmhc9c	{"actorId": "cmwj4yehu005gl3rcm5kmhc9c"}	::1	\N	2026-11-16 10:43:45.78
cmwj4yesw005ml3rc2frnjqlf	cmwj2fa4w0000l3s4x4q1jmst	USER_SUSPENDED	User	cmwj4yehu005gl3rcm5kmhc9c	{"reason": "Investigating suspicious order activity", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "SUSPENDED", "targetEmail": "rogue.admin.mwj4ye8x@test.in", "previousStatus": "PENDING_VERIFICATION"}	\N	\N	2026-11-16 10:43:46.16
cmwj4yeui005ol3rccjowyx8c	cmwj2fa4w0000l3s4x4q1jmst	USER_REACTIVATED	User	cmwj4yehu005gl3rcm5kmhc9c	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "ACTIVE", "targetEmail": "rogue.admin.mwj4ye8x@test.in", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 10:43:46.218
cmwj4yewg005ql3rcntxmcls9	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_APPROVED	RetailerApplication	cmwj4yeuq0003l3mg18mkas0f	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "applicantId": "cmwj4yehu005gl3rcm5kmhc9c", "businessName": "Fresh Greens Mart mwj4ye8x", "applicantEmail": "rogue.admin.mwj4ye8x@test.in"}	\N	\N	2026-11-16 10:43:46.288
cmwj4yexk005sl3rc35g5z701	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_SUSPENDED	Retailer	ret-fresh-greens-mart-mwj4ye8x	{"reason": "Audit pending", "status": "SUSPENDED", "actorId": "cmwj2fa4w0000l3s4x4q1jmst"}	\N	\N	2026-11-16 10:43:46.328
cmwj4yfdh0063l3rcv7nfr843	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj4yfd80061l3rcjsgyes91	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "ops.lead.mwj4ye8x@rasoiiq.in", "assignedRole": "OPERATIONS"}	\N	\N	2026-11-16 10:43:46.901
cmwj4yfe50065l3rcqbhkp87g	cmwj4nyub0000l3ic1cbm4scv	STAFF_ROLE_CHANGED	User	cmwj4yfd80061l3rcjsgyes91	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newRole": "SUPPORT", "previousRole": "OPERATIONS"}	\N	\N	2026-11-16 10:43:46.926
cmwj4wmxt003fl3rcv7sjw8ax	cmwj2fa4w0000l3s4x4q1jmst	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst"}	::1	node	2026-11-16 10:42:23.394
cmwj4wn04003il3rcc286gdv5	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 10:42:23.476
cmwj4wlzk002zl3rc7d6v6qdf	\N	REGISTER	User	cmwj4wlz2002vl3rc79aoqcp7	{"actorId": "cmwj4wlz2002vl3rc79aoqcp7"}	::1	\N	2026-11-16 10:42:22.16
cmwj4wm0z0031l3rc0gz1s5cs	\N	EMAIL_VERIFIED	User	cmwj4wlz2002vl3rc79aoqcp7	{"actorId": "cmwj4wlz2002vl3rc79aoqcp7"}	::1	\N	2026-11-16 10:42:22.212
cmwj4wmff0035l3rcarj3f060	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj4wlz2002vl3rc79aoqcp7"}	::1	node	2026-11-16 10:42:22.731
cmwj4wmgy0039l3rc85xihed4	\N	HOUSEHOLD_INVITATION_ACCEPTED	Household	cmwj4wlil002ml3rccec27hcr	{"role": "MEMBER", "actorId": "cmwj4wlz2002vl3rc79aoqcp7"}	\N	\N	2026-11-16 10:42:22.786
cmwj4wjom001wl3rcbmjfzroi	\N	REGISTER	User	cmwj4wjo1001sl3rciqufcoap	{"actorId": "cmwj4wjo1001sl3rciqufcoap"}	::1	\N	2026-11-16 10:42:19.174
cmwj4wjsm001yl3rcup1ze6l4	\N	EMAIL_VERIFIED	User	cmwj4wjo1001sl3rciqufcoap	{"actorId": "cmwj4wjo1001sl3rciqufcoap"}	::1	\N	2026-11-16 10:42:19.319
cmwj4wk2s0020l3rcdhlsk6xc	\N	LOGIN_FAILURE	\N	\N	{"actorId": "cmwj4wjo1001sl3rciqufcoap"}	::1	\N	2026-11-16 10:42:19.684
cmwj4wkct0024l3rc6l95oe32	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj4wjo1001sl3rciqufcoap"}	::1	node	2026-11-16 10:42:20.045
cmwj4wkel0028l3rchdk8f2zc	\N	REFRESH_TOKEN_REPLAY_DETECTED	\N	\N	{"actorId": "cmwj4wjo1001sl3rciqufcoap", "tokenFamilyId": "fam_2f1b9157-1897-4ebc-a6f3-c4061c7e88e4"}	::1	\N	2026-11-16 10:42:20.109
cmwj5e0010004l308jqbz6k1p	cmwj5dzzh0000l3087zcubc03	REGISTER	User	cmwj5dzzh0000l3087zcubc03	{"actorId": "cmwj5dzzh0000l3087zcubc03"}	::1	\N	2026-11-16 10:55:53.473
cmwj4wkfr002cl3rcxsxywseu	\N	PASSWORD_RESET_REQUESTED	\N	\N	{"actorId": "cmwj4wjo1001sl3rciqufcoap"}	::1	\N	2026-11-16 10:42:20.151
cmwj4wkq7002el3rcaknsah8v	\N	PASSWORD_RESET_COMPLETED	\N	\N	{"actorId": "cmwj4wjo1001sl3rciqufcoap"}	::1	\N	2026-11-16 10:42:20.527
cmwj4wl41002gl3rckstljpf8	\N	LOGIN_FAILURE	\N	\N	{"actorId": "cmwj4wjo1001sl3rciqufcoap"}	::1	\N	2026-11-16 10:42:21.025
cmwj4wli0002kl3rclidj7x5q	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj4wjo1001sl3rciqufcoap"}	::1	node	2026-11-16 10:42:21.528
cmwj4wlja002ql3rcmf3rllba	\N	HOUSEHOLD_CREATED	Household	cmwj4wlil002ml3rccec27hcr	{"name": "Joshi Family Kitchen", "actorId": "cmwj4wjo1001sl3rciqufcoap"}	\N	\N	2026-11-16 10:42:21.575
cmwj4wlkt002ul3rc12670ajp	\N	HOUSEHOLD_INVITATION_SENT	HouseholdInvitation	cmwj4wlkh002sl3rcev0esbod	{"role": "MEMBER", "actorId": "cmwj4wjo1001sl3rciqufcoap", "invitedEmail": "invited.family.mwj4wjax@testrasoi.in"}	\N	\N	2026-11-16 10:42:21.629
cmwj4ybby003tl3rcu02yve4e	\N	REGISTER	User	cmwj4ybbm003pl3rcs6l2u6ez	{"actorId": "cmwj4ybbm003pl3rcs6l2u6ez"}	::1	\N	2026-11-16 10:43:41.663
cmwj4ybex003vl3rceyf7slb9	\N	EMAIL_VERIFIED	User	cmwj4ybbm003pl3rcs6l2u6ez	{"actorId": "cmwj4ybbm003pl3rcs6l2u6ez"}	::1	\N	2026-11-16 10:43:41.769
cmwj4ybme003xl3rcf2t9jnyk	\N	LOGIN_FAILURE	\N	\N	{"actorId": "cmwj4ybbm003pl3rcs6l2u6ez"}	::1	\N	2026-11-16 10:43:42.038
cmwj4ybtv0041l3rcuf13dkd5	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj4ybbm003pl3rcs6l2u6ez"}	::1	node	2026-11-16 10:43:42.307
cmwj4ybw20045l3rcotdylgnh	\N	REFRESH_TOKEN_REPLAY_DETECTED	\N	\N	{"actorId": "cmwj4ybbm003pl3rcs6l2u6ez", "tokenFamilyId": "fam_20427e87-9e00-47ea-8897-ff29f9d42997"}	::1	\N	2026-11-16 10:43:42.386
cmwj4ybww0049l3rcgosh7g6o	\N	PASSWORD_RESET_REQUESTED	\N	\N	{"actorId": "cmwj4ybbm003pl3rcs6l2u6ez"}	::1	\N	2026-11-16 10:43:42.416
cmwj4yc4o004bl3rc7wms6jdz	\N	PASSWORD_RESET_COMPLETED	\N	\N	{"actorId": "cmwj4ybbm003pl3rcs6l2u6ez"}	::1	\N	2026-11-16 10:43:42.697
cmwj4ycas004dl3rcqmjqh8yj	\N	LOGIN_FAILURE	\N	\N	{"actorId": "cmwj4ybbm003pl3rcs6l2u6ez"}	::1	\N	2026-11-16 10:43:42.917
cmwj4yci6004hl3rcjs9mahu1	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj4ybbm003pl3rcs6l2u6ez"}	::1	node	2026-11-16 10:43:43.183
cmwj4ycj0004nl3rcymjhv2pv	\N	HOUSEHOLD_CREATED	Household	cmwj4ycij004jl3rcnh7zz9t2	{"name": "Joshi Family Kitchen", "actorId": "cmwj4ybbm003pl3rcs6l2u6ez"}	\N	\N	2026-11-16 10:43:43.212
cmwj4yck4004rl3rccg571wdd	\N	HOUSEHOLD_INVITATION_SENT	HouseholdInvitation	cmwj4ycju004pl3rc1wb1cstb	{"role": "MEMBER", "actorId": "cmwj4ybbm003pl3rcs6l2u6ez", "invitedEmail": "invited.family.mwj4yb24@testrasoi.in"}	\N	\N	2026-11-16 10:43:43.252
cmwj4yff20068l3rcmupzyq2p	cmwj4nyub0000l3ic1cbm4scv	SETTINGS_UPDATED	SystemSetting	cmwj4s5on0011l32wh1uxro1d	{"key": "pricing.default_delivery_fee_inr", "value": "35", "actorId": "cmwj4nyub0000l3ic1cbm4scv"}	\N	\N	2026-11-16 10:43:46.959
cmwj58zlb006fl3rcx75mfoto	cmwj2fa4w0000l3s4x4q1jmst	USER_SUSPENDED	User	cmwj58zak0069l3rc3wksnuya	{"reason": "Investigating suspicious order activity", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "SUSPENDED", "targetEmail": "rogue.admin.mwj58z1h@test.in", "previousStatus": "PENDING_VERIFICATION"}	\N	\N	2026-11-16 10:51:59.663
cmwj58zmr006hl3rc2zlroepe	cmwj2fa4w0000l3s4x4q1jmst	USER_REACTIVATED	User	cmwj58zak0069l3rc3wksnuya	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "ACTIVE", "targetEmail": "rogue.admin.mwj58z1h@test.in", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 10:51:59.715
cmwj58zoc006jl3rc116ba50b	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_APPROVED	RetailerApplication	cmwj58zmx0003l3uoy8mvcj2g	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "applicantId": "cmwj58zak0069l3rc3wksnuya", "businessName": "Fresh Greens Mart mwj58z1h", "applicantEmail": "rogue.admin.mwj58z1h@test.in"}	\N	\N	2026-11-16 10:51:59.772
cmwj58zp4006ll3rctk04ddnx	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_SUSPENDED	Retailer	ret-fresh-greens-mart-mwj58z1h	{"reason": "Audit pending", "status": "SUSPENDED", "actorId": "cmwj2fa4w0000l3s4x4q1jmst"}	\N	\N	2026-11-16 10:51:59.8
cmwj59034006wl3rcy7y0pxrz	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj5902u006ul3rc3rb95v74	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "ops.lead.mwj58z1h@rasoiiq.in", "assignedRole": "OPERATIONS"}	\N	\N	2026-11-16 10:52:00.304
cmwj5903s006yl3rcxxkpu6fy	cmwj4nyub0000l3ic1cbm4scv	STAFF_ROLE_CHANGED	User	cmwj5902u006ul3rc3rb95v74	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newRole": "SUPPORT", "previousRole": "OPERATIONS"}	\N	\N	2026-11-16 10:52:00.329
cmwj5904r0071l3rcrg463i8r	cmwj4nyub0000l3ic1cbm4scv	SETTINGS_UPDATED	SystemSetting	cmwj4s5on0011l32wh1uxro1d	{"key": "pricing.default_delivery_fee_inr", "value": "35", "actorId": "cmwj4nyub0000l3ic1cbm4scv"}	\N	\N	2026-11-16 10:52:00.363
cmwj5e0c80006l308m3gw9g8j	cmwj2fa4w0000l3s4x4q1jmst	USER_SUSPENDED	User	cmwj5dzzh0000l3087zcubc03	{"reason": "Investigating suspicious order activity", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "SUSPENDED", "targetEmail": "rogue.admin.mwj5dzq9@test.in", "previousStatus": "PENDING_VERIFICATION"}	\N	\N	2026-11-16 10:55:53.912
cmwj5e0ds0008l308l9lr0wgr	cmwj2fa4w0000l3s4x4q1jmst	USER_REACTIVATED	User	cmwj5dzzh0000l3087zcubc03	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "ACTIVE", "targetEmail": "rogue.admin.mwj5dzq9@test.in", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 10:55:53.968
cmwj5e0fk000al308a3oekohk	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_APPROVED	RetailerApplication	cmwj5e0dz0003l3ecy2272wun	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "applicantId": "cmwj5dzzh0000l3087zcubc03", "businessName": "Fresh Greens Mart mwj5dzq9", "applicantEmail": "rogue.admin.mwj5dzq9@test.in"}	\N	\N	2026-11-16 10:55:54.032
cmwj5e0gh000cl308ofak5kf0	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_SUSPENDED	Retailer	ret-fresh-greens-mart-mwj5dzq9	{"reason": "Audit pending", "status": "SUSPENDED", "actorId": "cmwj2fa4w0000l3s4x4q1jmst"}	\N	\N	2026-11-16 10:55:54.065
cmwj5e0i0000el3088yz2byuc	\N	ORDER_STATUS_CHANGED	Order	ord-1794825818247	{"reason": "Out with delivery executive", "actorId": "user-ops-1", "newStatus": "DISPATCHED", "fulfillmentNotes": "Customer requested contactless delivery at doorstep"}	\N	\N	2026-11-16 10:55:54.12
cmwj5e0jd000gl308q1r98p31	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_CREATED	Recipe	rec-1794826554152	{"title": "Kathiyawadi Ringan No Olo mwj5dzq9", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "cuisine": "Kathiyawadi"}	\N	\N	2026-11-16 10:55:54.17
cmwj5e0k1000il308jnqhdr01	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794826554152	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": true}	\N	\N	2026-11-16 10:55:54.193
cmwj5e0kl000kl308x9a6nead	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794826554152	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": false}	\N	\N	2026-11-16 10:55:54.213
cmwj5e0uu000nl3082sqi6w0b	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj5e0uk000ll308ne6457g6	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "ops.lead.mwj5dzq9@rasoiiq.in", "assignedRole": "OPERATIONS"}	\N	\N	2026-11-16 10:55:54.582
cmwj5e0vk000pl308tva55pp4	cmwj4nyub0000l3ic1cbm4scv	STAFF_ROLE_CHANGED	User	cmwj5e0uk000ll308ne6457g6	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newRole": "SUPPORT", "previousRole": "OPERATIONS"}	\N	\N	2026-11-16 10:55:54.608
cmwj5e0xa000sl308fmnn6947	cmwj4nyub0000l3ic1cbm4scv	SETTINGS_UPDATED	SystemSetting	cmwj4s5on0011l32wh1uxro1d	{"key": "pricing.default_delivery_fee_inr", "value": "35", "actorId": "cmwj4nyub0000l3ic1cbm4scv"}	\N	\N	2026-11-16 10:55:54.67
cmwj5ey17002gl308do2d4k8f	cmwj2fa4w0000l3s4x4q1jmst	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst"}	::1	node	2026-11-16 10:56:37.579
cmwj5ey2y002jl308dyd9yxeo	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 10:56:37.642
cmwj5exdn0020l3087c8utm1d	\N	REGISTER	User	cmwj5exd7001wl308bj5zpgkt	{"actorId": "cmwj5exd7001wl308bj5zpgkt"}	::1	\N	2026-11-16 10:56:36.731
cmwj5exeh0022l308fhbfv8qx	\N	EMAIL_VERIFIED	User	cmwj5exd7001wl308bj5zpgkt	{"actorId": "cmwj5exd7001wl308bj5zpgkt"}	::1	\N	2026-11-16 10:56:36.761
cmwj5exoa0026l308nrn1vfpx	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj5exd7001wl308bj5zpgkt"}	::1	node	2026-11-16 10:56:37.114
cmwj5expa002al308udi3iz2o	\N	HOUSEHOLD_INVITATION_ACCEPTED	Household	cmwj5ex26001nl308hdv1uncp	{"role": "MEMBER", "actorId": "cmwj5exd7001wl308bj5zpgkt"}	\N	\N	2026-11-16 10:56:37.15
cmwj5evkm000zl308cscis7k3	\N	EMAIL_VERIFIED	User	cmwj5evgl000tl308jjr78hlr	{"actorId": "cmwj5evgl000tl308jjr78hlr"}	::1	\N	2026-11-16 10:56:34.39
cmwj5evub0011l30822fzry0o	\N	LOGIN_FAILURE	\N	\N	{"actorId": "cmwj5evgl000tl308jjr78hlr"}	::1	\N	2026-11-16 10:56:34.74
cmwj5ew5l0015l308zjlhbchn	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj5evgl000tl308jjr78hlr"}	::1	node	2026-11-16 10:56:35.145
cmwj5ew7c0019l308w70f4h9y	\N	REFRESH_TOKEN_REPLAY_DETECTED	\N	\N	{"actorId": "cmwj5evgl000tl308jjr78hlr", "tokenFamilyId": "fam_f65cd354-0abd-4975-abb5-41ef21120094"}	::1	\N	2026-11-16 10:56:35.208
cmwj5ew89001dl308qzorst59	\N	PASSWORD_RESET_REQUESTED	\N	\N	{"actorId": "cmwj5evgl000tl308jjr78hlr"}	::1	\N	2026-11-16 10:56:35.241
cmwj5ewi6001fl308jzllnxlw	\N	PASSWORD_RESET_COMPLETED	\N	\N	{"actorId": "cmwj5evgl000tl308jjr78hlr"}	::1	\N	2026-11-16 10:56:35.598
cmwj5ewru001hl3081hbdixni	\N	LOGIN_FAILURE	\N	\N	{"actorId": "cmwj5evgl000tl308jjr78hlr"}	::1	\N	2026-11-16 10:56:35.947
cmwj5ex1o001ll308tx21izuz	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj5evgl000tl308jjr78hlr"}	::1	node	2026-11-16 10:56:36.301
cmwj5ex2q001rl308fxx6xx98	\N	HOUSEHOLD_CREATED	Household	cmwj5ex26001nl308hdv1uncp	{"name": "Joshi Family Kitchen", "actorId": "cmwj5evgl000tl308jjr78hlr"}	\N	\N	2026-11-16 10:56:36.338
cmwj5ex3v001vl308tommqe17	\N	HOUSEHOLD_INVITATION_SENT	HouseholdInvitation	cmwj5ex3m001tl308i9pp5pqr	{"role": "MEMBER", "actorId": "cmwj5evgl000tl308jjr78hlr", "invitedEmail": "invited.family.mwj5ev3t@testrasoi.in"}	\N	\N	2026-11-16 10:56:36.38
cmwj5ggjs002ml308jgtf8cii	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 10:57:48.232
cmwj5gh74002pl308dnuudjb0	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 10:57:49.073
cmwj5gnbi003xl308bv4rqsp5	\N	REGISTER	User	cmwj5gnae003tl3084qabxte5	{"actorId": "cmwj5gnae003tl3084qabxte5"}	::1	\N	2026-11-16 10:57:57.006
cmwj5gndj003zl308x9hfipq4	\N	EMAIL_VERIFIED	User	cmwj5gnae003tl3084qabxte5	{"actorId": "cmwj5gnae003tl3084qabxte5"}	::1	\N	2026-11-16 10:57:57.079
cmwj5gkfl002ul308ikjb49iv	\N	REGISTER	User	cmwj5gkex002ql308vzyp3quv	{"actorId": "cmwj5gkex002ql308vzyp3quv"}	::1	\N	2026-11-16 10:57:53.265
cmwj5gkkc002wl308z37pf97o	\N	EMAIL_VERIFIED	User	cmwj5gkex002ql308vzyp3quv	{"actorId": "cmwj5gkex002ql308vzyp3quv"}	::1	\N	2026-11-16 10:57:53.436
cmwj5gl11002yl308c5zltwdi	\N	LOGIN_FAILURE	\N	\N	{"actorId": "cmwj5gkex002ql308vzyp3quv"}	::1	\N	2026-11-16 10:57:54.037
cmwj5glfo0032l3083a3zsyl4	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj5gkex002ql308vzyp3quv"}	::1	node	2026-11-16 10:57:54.564
cmwj5glhw0036l308kidg2mbi	\N	REFRESH_TOKEN_REPLAY_DETECTED	\N	\N	{"actorId": "cmwj5gkex002ql308vzyp3quv", "tokenFamilyId": "fam_fc4a55c6-4380-4e50-a2f0-3b72552be08d"}	::1	\N	2026-11-16 10:57:54.644
cmwj5glj2003al308162rj7gq	\N	PASSWORD_RESET_REQUESTED	\N	\N	{"actorId": "cmwj5gkex002ql308vzyp3quv"}	::1	\N	2026-11-16 10:57:54.686
cmwj5glx9003cl3086pety999	\N	PASSWORD_RESET_COMPLETED	\N	\N	{"actorId": "cmwj5gkex002ql308vzyp3quv"}	::1	\N	2026-11-16 10:57:55.197
cmwj5gmbi003el3087qsauujd	\N	LOGIN_FAILURE	\N	\N	{"actorId": "cmwj5gkex002ql308vzyp3quv"}	::1	\N	2026-11-16 10:57:55.711
cmwj5gmsk003il3081h998ctf	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj5gkex002ql308vzyp3quv"}	::1	node	2026-11-16 10:57:56.324
cmwj5gmtw003ol308id2nlf9j	\N	HOUSEHOLD_CREATED	Household	cmwj5gmt7003kl308twun7cd7	{"name": "Joshi Family Kitchen", "actorId": "cmwj5gkex002ql308vzyp3quv"}	\N	\N	2026-11-16 10:57:56.372
cmwj5gmvk003sl308ogjn4u10	\N	HOUSEHOLD_INVITATION_SENT	HouseholdInvitation	cmwj5gmv8003ql308sjww9x62	{"role": "MEMBER", "actorId": "cmwj5gkex002ql308vzyp3quv", "invitedEmail": "invited.family.mwj5gjxn@testrasoi.in"}	\N	\N	2026-11-16 10:57:56.433
cmwj5gpya004nl3089n2b08ee	cmwj2fa4w0000l3s4x4q1jmst	USER_SUSPENDED	User	cmwj5gpi9004hl308a296szof	{"reason": "Investigating suspicious order activity", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "SUSPENDED", "targetEmail": "rogue.admin.mwj5gp68@test.in", "previousStatus": "PENDING_VERIFICATION"}	\N	\N	2026-11-16 10:58:00.418
cmwj5gq02004pl308831h6pnp	cmwj2fa4w0000l3s4x4q1jmst	USER_REACTIVATED	User	cmwj5gpi9004hl308a296szof	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "ACTIVE", "targetEmail": "rogue.admin.mwj5gp68@test.in", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 10:58:00.482
cmwj5gq2b004rl308pn0gitfb	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_APPROVED	RetailerApplication	cmwj5gq0b0003l3mwkewzrk2j	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "applicantId": "cmwj5gpi9004hl308a296szof", "businessName": "Fresh Greens Mart mwj5gp68", "applicantEmail": "rogue.admin.mwj5gp68@test.in"}	\N	\N	2026-11-16 10:58:00.563
cmwj5gq3n004tl308bwm8w4b6	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_SUSPENDED	Retailer	ret-fresh-greens-mart-mwj5gp68	{"reason": "Audit pending", "status": "SUSPENDED", "actorId": "cmwj2fa4w0000l3s4x4q1jmst"}	\N	\N	2026-11-16 10:58:00.611
cmwj5gqov0054l308hershi7t	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj5gqoj0052l308dnub9leg	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "ops.lead.mwj5gp68@rasoiiq.in", "assignedRole": "OPERATIONS"}	\N	\N	2026-11-16 10:58:01.375
cmwj5gqpv0056l308dek66ok2	cmwj4nyub0000l3ic1cbm4scv	STAFF_ROLE_CHANGED	User	cmwj5gqoj0052l308dnub9leg	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newRole": "SUPPORT", "previousRole": "OPERATIONS"}	\N	\N	2026-11-16 10:58:01.411
cmwj5gqrf0059l308d2auqbe9	cmwj4nyub0000l3ic1cbm4scv	SETTINGS_UPDATED	SystemSetting	cmwj4s5on0011l32wh1uxro1d	{"key": "pricing.default_delivery_fee_inr", "value": "35", "actorId": "cmwj4nyub0000l3ic1cbm4scv"}	\N	\N	2026-11-16 10:58:01.467
cmwj5gq9b0051l308nld7wa7b	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794826680717	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": false}	\N	\N	2026-11-16 10:58:00.815
cmwj5wmcj0004l31wvhcm8zzg	cmwj5wmbu0000l31w7jzpotps	REGISTER	User	cmwj5wmbu0000l31w7jzpotps	{"actorId": "cmwj5wmbu0000l31w7jzpotps"}	::1	\N	2026-11-16 11:10:22.243
cmwj5wmqn0006l31wgyfimix9	cmwj2fa4w0000l3s4x4q1jmst	USER_SUSPENDED	User	cmwj5wmbu0000l31w7jzpotps	{"reason": "Investigating suspicious order activity", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "SUSPENDED", "targetEmail": "rogue.admin.mwj5wm2p@test.in", "previousStatus": "PENDING_VERIFICATION"}	\N	\N	2026-11-16 11:10:22.751
cmwj5wmsa0008l31wjut96eoz	cmwj2fa4w0000l3s4x4q1jmst	USER_REACTIVATED	User	cmwj5wmbu0000l31w7jzpotps	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "ACTIVE", "targetEmail": "rogue.admin.mwj5wm2p@test.in", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 11:10:22.811
cmwj5wmu4000al31wyuwf5qxp	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_APPROVED	RetailerApplication	cmwj5wmsh0003l3ekospwg0rs	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "applicantId": "cmwj5wmbu0000l31w7jzpotps", "businessName": "Fresh Greens Mart mwj5wm2p", "applicantEmail": "rogue.admin.mwj5wm2p@test.in"}	\N	\N	2026-11-16 11:10:22.877
cmwj5wmv0000cl31wbpbtxozu	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_SUSPENDED	Retailer	ret-fresh-greens-mart-mwj5wm2p	{"reason": "Audit pending", "status": "SUSPENDED", "actorId": "cmwj2fa4w0000l3s4x4q1jmst"}	\N	\N	2026-11-16 11:10:22.908
cmwj5wmwl000el31wsstx7pfx	\N	ORDER_STATUS_CHANGED	Order	ord-1794826669508	{"reason": "Out with delivery executive", "actorId": "user-ops-1", "newStatus": "DISPATCHED", "fulfillmentNotes": "Customer requested contactless delivery at doorstep"}	\N	\N	2026-11-16 11:10:22.965
cmwj5wmy1000gl31w30vqchmk	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_CREATED	Recipe	rec-1794827423003	{"title": "Kathiyawadi Ringan No Olo mwj5wm2p", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "cuisine": "Kathiyawadi"}	\N	\N	2026-11-16 11:10:23.017
cmwj5wmyr000il31wfhr8f7rm	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794827423003	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": true}	\N	\N	2026-11-16 11:10:23.044
cmwj5wmze000kl31wvj122zeq	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794827423003	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": false}	\N	\N	2026-11-16 11:10:23.066
cmwj5wn9f000nl31wz2bopq3a	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj5wn96000ll31wm16axgtg	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "ops.lead.mwj5wm2p@rasoiiq.in", "assignedRole": "OPERATIONS"}	\N	\N	2026-11-16 11:10:23.427
cmwj5wna8000pl31w25lrrh5q	cmwj4nyub0000l3ic1cbm4scv	STAFF_ROLE_CHANGED	User	cmwj5wn96000ll31wm16axgtg	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newRole": "SUPPORT", "previousRole": "OPERATIONS"}	\N	\N	2026-11-16 11:10:23.457
cmwj5wnbe000sl31wil2ude9v	cmwj4nyub0000l3ic1cbm4scv	SETTINGS_UPDATED	SystemSetting	cmwj4s5on0011l32wh1uxro1d	{"key": "pricing.default_delivery_fee_inr", "value": "35", "actorId": "cmwj4nyub0000l3ic1cbm4scv"}	\N	\N	2026-11-16 11:10:23.498
cmwj69hvy0013l31wz6rt0156	cmwj69hkz000vl31wlw6uv5rv	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj69hkz000vl31wlw6uv5rv"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:22.99
cmwj69i5e0016l31wvexn2mxb	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj69i530014l31wj9xjtuq2	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "supp-1794828022272@rasoi.internal", "assignedRole": "SUPPORT"}	\N	\N	2026-11-16 11:20:23.33
cmwj69iex001al31wjqxyr8c3	cmwj69i530014l31wj9xjtuq2	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj69i530014l31wj9xjtuq2"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:23.674
cmwj69ioe001dl31wjzgy6vjo	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj69io5001bl31wubfm7tks	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "ops-1794828022272@rasoi.internal", "assignedRole": "OPERATIONS"}	\N	\N	2026-11-16 11:20:24.015
cmwj69iy1001hl31w15iqhax8	cmwj69io5001bl31wubfm7tks	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj69io5001bl31wubfm7tks"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:24.361
cmwj69j7n001kl31w6bv8rwj2	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj69j7f001il31w0f1f7u85	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "adm-1794828022272@rasoi.internal", "assignedRole": "ADMIN"}	\N	\N	2026-11-16 11:20:24.707
cmwj69jhb001ol31wx1saghqi	cmwj69j7f001il31w0f1f7u85	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj69j7f001il31w0f1f7u85"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:25.055
cmwj69jwj001tl31waxliw3uy	cmwj69jw1001pl31wlxz9v75z	REGISTER	User	cmwj69jw1001pl31wlxz9v75z	{"actorId": "cmwj69jw1001pl31wlxz9v75z"}	::1	\N	2026-11-16 11:20:25.603
cmwj69k7u001xl31wcgn1xm0f	cmwj69jw1001pl31wlxz9v75z	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj69jw1001pl31wlxz9v75z"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:26.011
cmwj69k8z0023l31wu7sa8wg9	cmwj69jw1001pl31wlxz9v75z	HOUSEHOLD_CREATED	Household	cmwj69k8h001zl31wvc9y7lf3	{"name": "Victim Household", "actorId": "cmwj69jw1001pl31wlxz9v75z"}	\N	\N	2026-11-16 11:20:26.051
cmwj69kam0025l31w2zr671o8	cmwj4nyub0000l3ic1cbm4scv	USER_SUSPENDED	User	cmwj69jw1001pl31wlxz9v75z	{"reason": "Security violation test suspension", "actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "SUSPENDED", "targetEmail": "victim-1794828025254@test.com", "previousStatus": "ACTIVE"}	\N	\N	2026-11-16 11:20:26.11
cmwj69kcf0027l31wff6qzr0s	cmwj4nyub0000l3ic1cbm4scv	USER_REACTIVATED	User	cmwj69jw1001pl31wlxz9v75z	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "ACTIVE", "targetEmail": "victim-1794828025254@test.com", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 11:20:26.175
cmwj69kmd002bl31wvywkvxvn	cmwj69jw1001pl31wlxz9v75z	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj69jw1001pl31wlxz9v75z"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:26.533
cmwj6a0ok002il31wibrotoob	cmwj6a0o7002el31w6imlht2w	REGISTER	User	cmwj6a0o7002el31w6imlht2w	{"actorId": "cmwj6a0o7002el31w6imlht2w"}	::1	\N	2026-11-16 11:20:47.348
cmwj6a0ym002ml31w3wqhscs9	cmwj6a0o7002el31w6imlht2w	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6a0o7002el31w6imlht2w"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:47.71
cmwj6a187002pl31wubo68sc0	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6a17w002nl31w11gbuhpy	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "supp-1794828046990@rasoi.internal", "assignedRole": "SUPPORT"}	\N	\N	2026-11-16 11:20:48.055
cmwj6a1hi002tl31w6cl5q2ga	cmwj6a17w002nl31w11gbuhpy	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6a17w002nl31w11gbuhpy"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:48.39
cmwj6a1qy002wl31w7nu9c48a	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6a1qq002ul31wd5hbzrci	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "ops-1794828046990@rasoi.internal", "assignedRole": "OPERATIONS"}	\N	\N	2026-11-16 11:20:48.73
cmwj6a20h0030l31w0wz2trcl	cmwj6a1qq002ul31wd5hbzrci	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6a1qq002ul31wd5hbzrci"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:49.073
cmwj6a2a10033l31wwdcbm0hu	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6a29s0031l31wowndvpej	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "adm-1794828046990@rasoi.internal", "assignedRole": "ADMIN"}	\N	\N	2026-11-16 11:20:49.418
cmwj6a2jw0037l31w3xffg8xz	cmwj6a29s0031l31wowndvpej	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6a29s0031l31wowndvpej"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:49.773
cmwj6a2xz003cl31wsl3b9bjc	cmwj6a2xj0038l31wu1m3t9lt	REGISTER	User	cmwj6a2xj0038l31wu1m3t9lt	{"actorId": "cmwj6a2xj0038l31wu1m3t9lt"}	::1	\N	2026-11-16 11:20:50.279
cmwj6a38g003gl31wskvx58j0	cmwj6a2xj0038l31wu1m3t9lt	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6a2xj0038l31wu1m3t9lt"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:50.657
cmwj6a39g003ml31wzfy4lafo	cmwj6a2xj0038l31wu1m3t9lt	HOUSEHOLD_CREATED	Household	cmwj6a38y003il31wdvfyk9bh	{"name": "Victim Household", "actorId": "cmwj6a2xj0038l31wu1m3t9lt"}	\N	\N	2026-11-16 11:20:50.692
cmwj6a3b3003ol31wsu9y0o59	cmwj4nyub0000l3ic1cbm4scv	USER_SUSPENDED	User	cmwj6a2xj0038l31wu1m3t9lt	{"reason": "Security violation test suspension", "actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "SUSPENDED", "targetEmail": "victim-1794828049942@test.com", "previousStatus": "ACTIVE"}	\N	\N	2026-11-16 11:20:50.751
cmwj6a3e1003ql31wzhwicycs	cmwj4nyub0000l3ic1cbm4scv	USER_REACTIVATED	User	cmwj6a2xj0038l31wu1m3t9lt	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "ACTIVE", "targetEmail": "victim-1794828049942@test.com", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 11:20:50.857
cmwj6a3qo003ul31wny5evazp	cmwj6a2xj0038l31wu1m3t9lt	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6a2xj0038l31wu1m3t9lt"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:51.312
cmwj6a3v2003yl31w2w8kb1gt	cmwj6a17w002nl31w11gbuhpy	SUPPORT_HOUSEHOLD_INSPECTED	Household	hh-sharma-family	{"actorId": "cmwj6a17w002nl31w11gbuhpy", "actorRole": "SUPPORT", "accessedAt": "2026-11-16T11:20:51.457Z", "householdName": "Sharma Family", "supportReason": "Investigating delivery delay for customer ticket #SUP-9941"}	\N	\N	2026-11-16 11:20:51.471
cmwj6a44d0042l31wsgwpn4y4	cmwj4vqu8000zl3rcxghmhy5s	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj4vqu8000zl3rcxghmhy5s"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:51.805
cmwj6a4f60047l31whw5rqxlc	cmwj6a4eq0043l31wuhrlhgy6	REGISTER	User	cmwj6a4eq0043l31wuhrlhgy6	{"actorId": "cmwj6a4eq0043l31wuhrlhgy6"}	::1	\N	2026-11-16 11:20:52.194
cmwj6a4os004bl31wvaoj1d71	cmwj6a4eq0043l31wuhrlhgy6	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6a4eq0043l31wuhrlhgy6"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:52.54
cmwj6a4pn004hl31wc6vdrmn3	cmwj6a4eq0043l31wuhrlhgy6	HOUSEHOLD_CREATED	Household	cmwj6a4p7004dl31wpez33ln2	{"name": "Alpha Household", "actorId": "cmwj6a4eq0043l31wuhrlhgy6"}	\N	\N	2026-11-16 11:20:52.572
cmwj6a4z0004ml31w6evjp0jw	cmwj6a4yl004il31w4i1kjtj0	REGISTER	User	cmwj6a4yl004il31w4i1kjtj0	{"actorId": "cmwj6a4yl004il31w4i1kjtj0"}	::1	\N	2026-11-16 11:20:52.908
cmwj6a58t004ql31w251iyw5k	cmwj6a4yl004il31w4i1kjtj0	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6a4yl004il31w4i1kjtj0"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:53.262
cmwj6a59p004wl31wze7aya0q	cmwj6a4yl004il31w4i1kjtj0	HOUSEHOLD_CREATED	Household	cmwj6a59b004sl31wczqvl6xj	{"name": "Beta Household", "actorId": "cmwj6a4yl004il31w4i1kjtj0"}	\N	\N	2026-11-16 11:20:53.293
cmwj6a5xp0051l31wjt3d8htg	cmwj6a5x9004xl31w884y0tym	REGISTER	User	cmwj6a5x9004xl31w884y0tym	{"actorId": "cmwj6a5x9004xl31w884y0tym"}	::1	\N	2026-11-16 11:20:54.158
cmwj6a68u0055l31wu5bv7har	cmwj6a5x9004xl31w884y0tym	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6a5x9004xl31w884y0tym"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:54.558
cmwj6a6eh005bl31w511euva0	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj6a6cz0059l31wmmdvlvix	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj6a5x9004xl31w884y0tym", "businessName": "Organic Greens 1794828054689", "applicantEmail": "merchant-cust-1794828053777@test.com"}	\N	\N	2026-11-16 11:20:54.761
cmwj6a6qh005gl31wsnmgc5yj	cmwj6a6q1005cl31wjzejax5n	REGISTER	User	cmwj6a6q1005cl31wjzejax5n	{"actorId": "cmwj6a6q1005cl31wjzejax5n"}	::1	\N	2026-11-16 11:20:55.193
cmwj6a71u005kl31wesrk6jtp	cmwj6a6q1005cl31wjzejax5n	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6a6q1005cl31wjzejax5n"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:55.602
cmwj6a72u005ql31wj5q7yixc	cmwj6a6q1005cl31wjzejax5n	HOUSEHOLD_CREATED	Household	cmwj6a72d005ml31wets427cr	{"name": "Pilot Household Alpha", "actorId": "cmwj6a6q1005cl31wjzejax5n"}	\N	\N	2026-11-16 11:20:55.638
cmwj6a7dx005vl31wdwk39dtn	cmwj6a7di005rl31wsf3ezgrh	REGISTER	User	cmwj6a7di005rl31wsf3ezgrh	{"actorId": "cmwj6a7di005rl31wsf3ezgrh"}	::1	\N	2026-11-16 11:20:56.038
cmwj6a7p8005zl31wboyfbews	cmwj6a7di005rl31wsf3ezgrh	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6a7di005rl31wsf3ezgrh"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:56.444
cmwj6a7we0063l31w2d62uzb8	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj6a7uj0061l31wl0cl6otx	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj6a6q1005cl31wjzejax5n", "businessName": "Pilot Store 1794828056619", "applicantEmail": "pilot-e2e-1794828054797@rasoi.pilot"}	\N	\N	2026-11-16 11:20:56.702
cmwj6a7xv0065l31w6nfgqyzd	cmwj4nyub0000l3ic1cbm4scv	USER_SUSPENDED	User	cmwj6a6q1005cl31wjzejax5n	{"reason": "End-of-pilot verification suspension", "actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "SUSPENDED", "targetEmail": "pilot-e2e-1794828054797@rasoi.pilot", "previousStatus": "ACTIVE"}	\N	\N	2026-11-16 11:20:56.755
cmwj6fsbq0004l3rc8unu6nxo	cmwj6fsb00000l3rc0jdk9bkv	REGISTER	User	cmwj6fsb00000l3rc0jdk9bkv	{"actorId": "cmwj6fsb00000l3rc0jdk9bkv"}	::1	\N	2026-11-16 11:25:16.454
cmwj6fsma0008l3rcpv13t454	cmwj6fsb00000l3rc0jdk9bkv	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6fsb00000l3rc0jdk9bkv"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:16.834
cmwj6fsw7000bl3rchfmdygsk	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6fsvv0009l3rckbhgn4cq	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "supp-1794828316096@rasoi.internal", "assignedRole": "SUPPORT"}	\N	\N	2026-11-16 11:25:17.191
cmwj6ft62000fl3rc7cdugkhu	cmwj6fsvv0009l3rckbhgn4cq	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6fsvv0009l3rckbhgn4cq"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:17.546
cmwj6ftfg000il3rc3vxcnrpt	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6ftf9000gl3rc1sho14lk	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "ops-1794828316096@rasoi.internal", "assignedRole": "OPERATIONS"}	\N	\N	2026-11-16 11:25:17.884
cmwj6ftpx000ml3rckftpckjh	cmwj6ftf9000gl3rc1sho14lk	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6ftf9000gl3rc1sho14lk"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:18.261
cmwj6fu0c000pl3rcainyuzit	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6fu00000nl3rcd0k2dhcv	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "adm-1794828316096@rasoi.internal", "assignedRole": "ADMIN"}	\N	\N	2026-11-16 11:25:18.636
cmwj6fuak000tl3rc6jcelpf2	cmwj6fu00000nl3rcd0k2dhcv	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6fu00000nl3rcd0k2dhcv"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:19.004
cmwj6fusn000yl3rc3jxh0118	cmwj6fus4000ul3rcb7neh4zk	REGISTER	User	cmwj6fus4000ul3rcb7neh4zk	{"actorId": "cmwj6fus4000ul3rcb7neh4zk"}	::1	\N	2026-11-16 11:25:19.656
cmwj6fv2q0012l3rcw4mxh71h	cmwj6fus4000ul3rcb7neh4zk	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6fus4000ul3rcb7neh4zk"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:20.019
cmwj6fv3w0018l3rc2o3njuw3	cmwj6fus4000ul3rcb7neh4zk	HOUSEHOLD_CREATED	Household	cmwj6fv3d0014l3rcgo5ufwm1	{"name": "Victim Household", "actorId": "cmwj6fus4000ul3rcb7neh4zk"}	\N	\N	2026-11-16 11:25:20.06
cmwj6fv5q001al3rcdqz6928c	cmwj4nyub0000l3ic1cbm4scv	USER_SUSPENDED	User	cmwj6fus4000ul3rcb7neh4zk	{"reason": "Security violation test suspension", "actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "SUSPENDED", "targetEmail": "victim-1794828319244@test.com", "previousStatus": "ACTIVE"}	\N	\N	2026-11-16 11:25:20.126
cmwj6fv82001cl3rcgmmz5jdn	cmwj4nyub0000l3ic1cbm4scv	USER_REACTIVATED	User	cmwj6fus4000ul3rcb7neh4zk	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "ACTIVE", "targetEmail": "victim-1794828319244@test.com", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 11:25:20.211
cmwj6fvin001gl3rcy9mcxcey	cmwj6fus4000ul3rcb7neh4zk	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6fus4000ul3rcb7neh4zk"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:20.591
cmwj6fvmo001kl3rcv9qk5xov	cmwj6fsvv0009l3rckbhgn4cq	SUPPORT_HOUSEHOLD_INSPECTED	Household	hh-sharma-family	{"actorId": "cmwj6fsvv0009l3rckbhgn4cq", "actorRole": "SUPPORT", "accessedAt": "2026-11-16T11:25:20.731Z", "householdName": "Sharma Family", "supportReason": "Investigating delivery delay for customer ticket #SUP-9941"}	\N	\N	2026-11-16 11:25:20.736
cmwj6fvw2001ol3rcwzts4ekv	cmwj4vqu8000zl3rcxghmhy5s	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj4vqu8000zl3rcxghmhy5s"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:21.075
cmwj6fw76001tl3rc5abvlke8	cmwj6fw6s001pl3rc4beefuss	REGISTER	User	cmwj6fw6s001pl3rc4beefuss	{"actorId": "cmwj6fw6s001pl3rc4beefuss"}	::1	\N	2026-11-16 11:25:21.475
cmwj6fwgy001xl3rc4dxk1i5x	cmwj6fw6s001pl3rc4beefuss	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6fw6s001pl3rc4beefuss"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:21.827
cmwj6fwhw0023l3rcluq36gou	cmwj6fw6s001pl3rc4beefuss	HOUSEHOLD_CREATED	Household	cmwj6fwhf001zl3rc37mmmui6	{"name": "Alpha Household", "actorId": "cmwj6fw6s001pl3rc4beefuss"}	\N	\N	2026-11-16 11:25:21.86
cmwj6fws50028l3rcnxoezwmk	cmwj6fwrk0024l3rcjrrzd6kw	REGISTER	User	cmwj6fwrk0024l3rcjrrzd6kw	{"actorId": "cmwj6fwrk0024l3rcjrrzd6kw"}	::1	\N	2026-11-16 11:25:22.229
cmwj6fx2m002cl3rcfg7re9zw	cmwj6fwrk0024l3rcjrrzd6kw	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6fwrk0024l3rcjrrzd6kw"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:22.606
cmwj6fx3i002il3rcoldih5u1	cmwj6fwrk0024l3rcjrrzd6kw	HOUSEHOLD_CREATED	Household	cmwj6fx33002el3rcy6gfv909	{"name": "Beta Household", "actorId": "cmwj6fwrk0024l3rcjrrzd6kw"}	\N	\N	2026-11-16 11:25:22.638
cmwj6fxsn002nl3rci5l3cp2e	cmwj6fxs9002jl3rcumdxv2q8	REGISTER	User	cmwj6fxs9002jl3rcumdxv2q8	{"actorId": "cmwj6fxs9002jl3rcumdxv2q8"}	::1	\N	2026-11-16 11:25:23.543
cmwj6fy2p002rl3rcc83gxwyk	cmwj6fxs9002jl3rcumdxv2q8	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6fxs9002jl3rcumdxv2q8"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:23.905
cmwj6fy3k002xl3rcz9diyw64	cmwj6fxs9002jl3rcumdxv2q8	HOUSEHOLD_CREATED	Household	cmwj6fy36002tl3rcve501gxq	{"name": "Merchant Family Household", "actorId": "cmwj6fxs9002jl3rcumdxv2q8"}	\N	\N	2026-11-16 11:25:23.936
cmwj6fy5f0031l3rcwowxtbh5	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj6fy46002zl3rcpfcl85ml	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj6fxs9002jl3rcumdxv2q8", "businessName": "Organic Greens 1794828323940", "applicantEmail": "merchant-cust-1794828323197@test.com"}	\N	\N	2026-11-16 11:25:24.004
cmwj6fygj0036l3rcoci9we2e	cmwj6fyg50032l3rcif9xvg5z	REGISTER	User	cmwj6fyg50032l3rcif9xvg5z	{"actorId": "cmwj6fyg50032l3rcif9xvg5z"}	::1	\N	2026-11-16 11:25:24.403
cmwj6fyqy003al3rclo3c0pjy	cmwj6fyg50032l3rcif9xvg5z	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6fyg50032l3rcif9xvg5z"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:24.778
cmwj6fyrt003gl3rc5cixn8i6	cmwj6fyg50032l3rcif9xvg5z	HOUSEHOLD_CREATED	Household	cmwj6fyrf003cl3rc1n58062c	{"name": "Pilot Household Alpha", "actorId": "cmwj6fyg50032l3rcif9xvg5z"}	\N	\N	2026-11-16 11:25:24.809
cmwj6fyt0003kl3rcjf9290t7	cmwj6fyg50032l3rcif9xvg5z	HOUSEHOLD_INVITATION_SENT	HouseholdInvitation	cmwj6fysp003il3rc7yoh17w1	{"role": "MEMBER", "actorId": "cmwj6fyg50032l3rcif9xvg5z", "invitedEmail": "invited-1794828324807@pilot.com"}	\N	\N	2026-11-16 11:25:24.852
cmwj6fz39003pl3rcwo10tk2s	cmwj6fz2s003ll3rc0ijbu111	REGISTER	User	cmwj6fz2s003ll3rc0ijbu111	{"actorId": "cmwj6fz2s003ll3rc0ijbu111"}	::1	\N	2026-11-16 11:25:25.222
cmwj6fzdv003tl3rcke7ug599	cmwj6fz2s003ll3rc0ijbu111	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6fz2s003ll3rc0ijbu111"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:25.603
cmwj6fzf0003xl3rcu8zity5m	cmwj6fz2s003ll3rc0ijbu111	HOUSEHOLD_INVITATION_ACCEPTED	Household	cmwj6fyrf003cl3rc1n58062c	{"role": "MEMBER", "actorId": "cmwj6fz2s003ll3rc0ijbu111"}	\N	\N	2026-11-16 11:25:25.644
cmwj6fzlg0041l3rc4jy2abca	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj6fzkh003zl3rci3mzkyeu	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj6fyg50032l3rcif9xvg5z", "businessName": "Pilot Store 1794828325824", "applicantEmail": "pilot-e2e-1794828324043@rasoi.pilot"}	\N	\N	2026-11-16 11:25:25.877
cmwj6fzmh0043l3rce0yyusua	cmwj4nyub0000l3ic1cbm4scv	USER_SUSPENDED	User	cmwj6fyg50032l3rcif9xvg5z	{"reason": "End-of-pilot verification suspension", "actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "SUSPENDED", "targetEmail": "pilot-e2e-1794828324043@rasoi.pilot", "previousStatus": "ACTIVE"}	\N	\N	2026-11-16 11:25:25.914
cmwj6i1n60004l3y8cyrnhdjm	cmwj6i1mh0000l3y89i7lmtz5	REGISTER	User	cmwj6i1mh0000l3y89i7lmtz5	{"actorId": "cmwj6i1mh0000l3y89i7lmtz5"}	::1	\N	2026-11-16 11:27:01.842
cmwj6i1xt0008l3y8khry2fg7	cmwj6i1mh0000l3y89i7lmtz5	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6i1mh0000l3y89i7lmtz5"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:02.225
cmwj6i27n000bl3y8hfasqh6c	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6i27e0009l3y81t08q7fy	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "supp-1794828421473@rasoi.internal", "assignedRole": "SUPPORT"}	\N	\N	2026-11-16 11:27:02.58
cmwj6i2ha000fl3y8tr58kitw	cmwj6i27e0009l3y81t08q7fy	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6i27e0009l3y81t08q7fy"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:02.926
cmwj6i2qw000il3y82wz2evhy	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6i2qm000gl3y8pcqvlxgc	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "ops-1794828421473@rasoi.internal", "assignedRole": "OPERATIONS"}	\N	\N	2026-11-16 11:27:03.272
cmwj6i31y000ml3y8xuvou9y1	cmwj6i2qm000gl3y8pcqvlxgc	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6i2qm000gl3y8pcqvlxgc"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:03.671
cmwj6i3d2000pl3y8mcrcbumr	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6i3cr000nl3y8ue8rc6kq	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "adm-1794828421473@rasoi.internal", "assignedRole": "ADMIN"}	\N	\N	2026-11-16 11:27:04.07
cmwj6i3n1000tl3y8m7vcmxjn	cmwj6i3cr000nl3y8ue8rc6kq	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6i3cr000nl3y8ue8rc6kq"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:04.429
cmwj6i45z000yl3y8v8qz6w84	cmwj6i45g000ul3y88a15dh2l	REGISTER	User	cmwj6i45g000ul3y88a15dh2l	{"actorId": "cmwj6i45g000ul3y88a15dh2l"}	::1	\N	2026-11-16 11:27:05.112
cmwj6i4hg0012l3y8almr0xg1	cmwj6i45g000ul3y88a15dh2l	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6i45g000ul3y88a15dh2l"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:05.524
cmwj6i4is0018l3y84w6ooap5	cmwj6i45g000ul3y88a15dh2l	HOUSEHOLD_CREATED	Household	cmwj6i4i70014l3y81gat7z9n	{"name": "Victim Household", "actorId": "cmwj6i45g000ul3y88a15dh2l"}	\N	\N	2026-11-16 11:27:05.572
cmwj6i4kv001al3y8c63gpzmz	cmwj4nyub0000l3ic1cbm4scv	USER_SUSPENDED	User	cmwj6i45g000ul3y88a15dh2l	{"reason": "Security violation test suspension", "actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "SUSPENDED", "targetEmail": "victim-1794828424660@test.com", "previousStatus": "ACTIVE"}	\N	\N	2026-11-16 11:27:05.648
cmwj6i4n6001cl3y8ptpbtrgr	cmwj4nyub0000l3ic1cbm4scv	USER_REACTIVATED	User	cmwj6i45g000ul3y88a15dh2l	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "ACTIVE", "targetEmail": "victim-1794828424660@test.com", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 11:27:05.73
cmwj6i4xj001gl3y84qwwy29o	cmwj6i45g000ul3y88a15dh2l	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6i45g000ul3y88a15dh2l"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:06.104
cmwj6i51a001kl3y8x7vku2os	cmwj6i27e0009l3y81t08q7fy	SUPPORT_HOUSEHOLD_INSPECTED	Household	hh-sharma-family	{"actorId": "cmwj6i27e0009l3y81t08q7fy", "actorRole": "SUPPORT", "accessedAt": "2026-11-16T11:27:06.221Z", "householdName": "Sharma Family", "supportReason": "Investigating delivery delay for customer ticket #SUP-9941"}	\N	\N	2026-11-16 11:27:06.238
cmwj6i5a7001ol3y8q96esbws	cmwj4vqu8000zl3rcxghmhy5s	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj4vqu8000zl3rcxghmhy5s"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:06.559
cmwj6i5ln001tl3y8vom8qmc8	cmwj6i5l7001pl3y8mka3cba2	REGISTER	User	cmwj6i5l7001pl3y8mka3cba2	{"actorId": "cmwj6i5l7001pl3y8mka3cba2"}	::1	\N	2026-11-16 11:27:06.971
cmwj6i5xf001xl3y84rgg23in	cmwj6i5l7001pl3y8mka3cba2	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6i5l7001pl3y8mka3cba2"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:07.395
cmwj6i5yj0023l3y8hebh31cv	cmwj6i5l7001pl3y8mka3cba2	HOUSEHOLD_CREATED	Household	cmwj6i5xz001zl3y8f8oiffmr	{"name": "Alpha Household", "actorId": "cmwj6i5l7001pl3y8mka3cba2"}	\N	\N	2026-11-16 11:27:07.436
cmwj6i6af0028l3y8bwxhwyb5	cmwj6i69z0024l3y82xdd2a3j	REGISTER	User	cmwj6i69z0024l3y82xdd2a3j	{"actorId": "cmwj6i69z0024l3y82xdd2a3j"}	::1	\N	2026-11-16 11:27:07.863
cmwj6i6lt002cl3y8mr983p54	cmwj6i69z0024l3y82xdd2a3j	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6i69z0024l3y82xdd2a3j"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:08.273
cmwj6i6mq002il3y86i7ei8ae	cmwj6i69z0024l3y82xdd2a3j	HOUSEHOLD_CREATED	Household	cmwj6i6mb002el3y88fjm3pxz	{"name": "Beta Household", "actorId": "cmwj6i69z0024l3y82xdd2a3j"}	\N	\N	2026-11-16 11:27:08.306
cmwj6i7bb002nl3y8bdng60rd	cmwj6i7ax002jl3y8cvctzzmw	REGISTER	User	cmwj6i7ax002jl3y8cvctzzmw	{"actorId": "cmwj6i7ax002jl3y8cvctzzmw"}	::1	\N	2026-11-16 11:27:09.191
cmwj6i7lu002rl3y868or1y31	cmwj6i7ax002jl3y8cvctzzmw	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6i7ax002jl3y8cvctzzmw"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:09.571
cmwj6i7mr002xl3y8egehvtb2	cmwj6i7ax002jl3y8cvctzzmw	HOUSEHOLD_CREATED	Household	cmwj6i7mb002tl3y85wrix5oj	{"name": "Merchant Family Household", "actorId": "cmwj6i7ax002jl3y8cvctzzmw"}	\N	\N	2026-11-16 11:27:09.604
cmwj6i7p10031l3y80ps1jfmu	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj6i7nf002zl3y80kiy500w	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj6i7ax002jl3y8cvctzzmw", "businessName": "Organic Greens 1794828429605", "applicantEmail": "merchant-cust-1794828428835@test.com"}	\N	\N	2026-11-16 11:27:09.685
cmwj6i80u0036l3y85b76n21g	cmwj6i80g0032l3y87a4qyxrq	REGISTER	User	cmwj6i80g0032l3y87a4qyxrq	{"actorId": "cmwj6i80g0032l3y87a4qyxrq"}	::1	\N	2026-11-16 11:27:10.11
cmwj6i8cc003al3y8345iapjk	cmwj6i80g0032l3y87a4qyxrq	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6i80g0032l3y87a4qyxrq"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:10.524
cmwj6i8d8003gl3y8hfcet8ci	cmwj6i80g0032l3y87a4qyxrq	HOUSEHOLD_CREATED	Household	cmwj6i8ct003cl3y81vk7pkjq	{"name": "Pilot Household Alpha", "actorId": "cmwj6i80g0032l3y87a4qyxrq"}	\N	\N	2026-11-16 11:27:10.557
cmwj6i8ek003kl3y8nxgnasde	cmwj6i80g0032l3y87a4qyxrq	HOUSEHOLD_INVITATION_SENT	HouseholdInvitation	cmwj6i8e6003il3y8cv930leq	{"role": "MEMBER", "actorId": "cmwj6i80g0032l3y87a4qyxrq", "invitedEmail": "invited-1794828430554@pilot.com"}	\N	\N	2026-11-16 11:27:10.604
cmwj6i8oz003pl3y8h12i7ceg	cmwj6i8oi003ll3y8ckc7swdj	REGISTER	User	cmwj6i8oi003ll3y8ckc7swdj	{"actorId": "cmwj6i8oi003ll3y8ckc7swdj"}	::1	\N	2026-11-16 11:27:10.979
cmwj6i8z0003tl3y8y7ryn26w	cmwj6i8oi003ll3y8ckc7swdj	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6i8oi003ll3y8ckc7swdj"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:11.34
cmwj6i905003xl3y87kfyavy1	cmwj6i8oi003ll3y8ckc7swdj	HOUSEHOLD_INVITATION_ACCEPTED	Household	cmwj6i8ct003cl3y81vk7pkjq	{"role": "MEMBER", "actorId": "cmwj6i8oi003ll3y8ckc7swdj"}	\N	\N	2026-11-16 11:27:11.381
cmwj6i9760041l3y8d2gt0x56	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj6i966003zl3y8yi48uy6g	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj6i80g0032l3y87a4qyxrq", "businessName": "Pilot Store 1794828431579", "applicantEmail": "pilot-e2e-1794828429721@rasoi.pilot"}	\N	\N	2026-11-16 11:27:11.634
cmwj6i98m0043l3y813suwr4h	cmwj4nyub0000l3ic1cbm4scv	USER_SUSPENDED	User	cmwj6i80g0032l3y87a4qyxrq	{"reason": "End-of-pilot verification suspension", "actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "SUSPENDED", "targetEmail": "pilot-e2e-1794828429721@rasoi.pilot", "previousStatus": "ACTIVE"}	\N	\N	2026-11-16 11:27:11.686
cmwj6lh200046l3y8ajtijlb5	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 11:29:41.784
cmwj6lhnu0049l3y8yvtmqdzc	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 11:29:42.57
cmwj6lmgt005xl3y8buvkdgxx	cmwj2fa4w0000l3s4x4q1jmst	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst"}	::1	node	2026-11-16 11:29:48.797
cmwj6lmj60060l3y8fgmzpr4w	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 11:29:48.883
cmwj6llvj005hl3y897dq8sfc	\N	REGISTER	User	cmwj6llv8005dl3y8xypi7s0r	{"actorId": "cmwj6llv8005dl3y8xypi7s0r"}	::1	\N	2026-11-16 11:29:48.032
cmwj6llw0005jl3y8zlnxs75p	\N	EMAIL_VERIFIED	User	cmwj6llv8005dl3y8xypi7s0r	{"actorId": "cmwj6llv8005dl3y8xypi7s0r"}	::1	\N	2026-11-16 11:29:48.049
cmwj6lm2u005nl3y87o4o8n1b	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6llv8005dl3y8xypi7s0r"}	::1	node	2026-11-16 11:29:48.294
cmwj6lm3s005rl3y8mx3mvbju	\N	HOUSEHOLD_INVITATION_ACCEPTED	Household	cmwj6llnt0054l3y84frg0xns	{"role": "MEMBER", "actorId": "cmwj6llv8005dl3y8xypi7s0r"}	\N	\N	2026-11-16 11:29:48.329
cmwj6lklc004el3y86cah5qos	\N	REGISTER	User	cmwj6lkkx004al3y8oh0a9nnr	{"actorId": "cmwj6lkkx004al3y8oh0a9nnr"}	::1	\N	2026-11-16 11:29:46.368
cmwj6lko2004gl3y88z7wp0hv	\N	EMAIL_VERIFIED	User	cmwj6lkkx004al3y8oh0a9nnr	{"actorId": "cmwj6lkkx004al3y8oh0a9nnr"}	::1	\N	2026-11-16 11:29:46.466
cmwj6lkue004il3y8ry4qrpw4	\N	LOGIN_FAILURE	\N	\N	{"actorId": "cmwj6lkkx004al3y8oh0a9nnr"}	::1	\N	2026-11-16 11:29:46.694
cmwj6ll0l004ml3y8pbfdqz2o	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6lkkx004al3y8oh0a9nnr"}	::1	node	2026-11-16 11:29:46.918
cmwj6ll1r004ql3y83qvit6jl	\N	REFRESH_TOKEN_REPLAY_DETECTED	\N	\N	{"actorId": "cmwj6lkkx004al3y8oh0a9nnr", "tokenFamilyId": "[REDACTED]"}	::1	\N	2026-11-16 11:29:46.959
cmwj6ll2d004ul3y89m69sxto	\N	PASSWORD_RESET_REQUESTED	\N	\N	{"actorId": "cmwj6lkkx004al3y8oh0a9nnr"}	::1	\N	2026-11-16 11:29:46.981
cmwj6ll8w004wl3y8bt0zcbgm	\N	PASSWORD_RESET_COMPLETED	\N	\N	{"actorId": "cmwj6lkkx004al3y8oh0a9nnr"}	::1	\N	2026-11-16 11:29:47.216
cmwj6llgo004yl3y8480cpkyy	\N	LOGIN_FAILURE	\N	\N	{"actorId": "cmwj6lkkx004al3y8oh0a9nnr"}	::1	\N	2026-11-16 11:29:47.496
cmwj6llnh0052l3y864xgd0hs	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6lkkx004al3y8oh0a9nnr"}	::1	node	2026-11-16 11:29:47.742
cmwj6llo40058l3y838g720j6	\N	HOUSEHOLD_CREATED	Household	cmwj6llnt0054l3y84frg0xns	{"name": "Joshi Family Kitchen", "actorId": "cmwj6lkkx004al3y8oh0a9nnr"}	\N	\N	2026-11-16 11:29:47.764
cmwj6llp1005cl3y8swskp2yk	\N	HOUSEHOLD_INVITATION_SENT	HouseholdInvitation	cmwj6llot005al3y8dyv4oili	{"role": "MEMBER", "actorId": "cmwj6lkkx004al3y8oh0a9nnr", "invitedEmail": "invited.family.mwj6lkc7@testrasoi.in"}	\N	\N	2026-11-16 11:29:47.798
cmwj6lnqq0065l3y8lp3zclim	cmwj6lnqa0061l3y8x72iose3	REGISTER	User	cmwj6lnqa0061l3y8x72iose3	{"actorId": "cmwj6lnqa0061l3y8x72iose3"}	::1	\N	2026-11-16 11:29:50.451
cmwj6lo2j0067l3y8o7ajw0ol	cmwj2fa4w0000l3s4x4q1jmst	USER_SUSPENDED	User	cmwj6lnqa0061l3y8x72iose3	{"reason": "Investigating suspicious order activity", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "SUSPENDED", "targetEmail": "rogue.admin.mwj6lngd@test.in", "previousStatus": "PENDING_VERIFICATION"}	\N	\N	2026-11-16 11:29:50.875
cmwj6lo480069l3y8c66tx2s9	cmwj2fa4w0000l3s4x4q1jmst	USER_REACTIVATED	User	cmwj6lnqa0061l3y8x72iose3	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "ACTIVE", "targetEmail": "rogue.admin.mwj6lngd@test.in", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 11:29:50.936
cmwj6lo62006bl3y85vthod1x	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_APPROVED	RetailerApplication	cmwj6lo4f0003l3xsfu8m2ghr	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "applicantId": "cmwj6lnqa0061l3y8x72iose3", "businessName": "Fresh Greens Mart mwj6lngd", "applicantEmail": "rogue.admin.mwj6lngd@test.in"}	\N	\N	2026-11-16 11:29:51.002
cmwj6lo75006dl3y8yegb3es5	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_SUSPENDED	Retailer	ret-fresh-greens-mart-mwj6lngd	{"reason": "Audit pending", "status": "SUSPENDED", "actorId": "cmwj2fa4w0000l3s4x4q1jmst"}	\N	\N	2026-11-16 11:29:51.042
cmwj6lo8u006fl3y86pi0isx6	\N	ORDER_STATUS_CHANGED	Order	ord-1794828583074	{"reason": "Out with delivery executive", "actorId": "user-ops-1", "newStatus": "DISPATCHED", "fulfillmentNotes": "Customer requested contactless delivery at doorstep"}	\N	\N	2026-11-16 11:29:51.102
cmwj6lomh006ol3y8wfakxip4	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6lom7006ml3y82vyxlgqt	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "ops.lead.mwj6lngd@rasoiiq.in", "assignedRole": "OPERATIONS"}	\N	\N	2026-11-16 11:29:51.593
cmwj6lond006ql3y8peksr827	cmwj4nyub0000l3ic1cbm4scv	STAFF_ROLE_CHANGED	User	cmwj6lom7006ml3y82vyxlgqt	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newRole": "SUPPORT", "previousRole": "OPERATIONS"}	\N	\N	2026-11-16 11:29:51.625
cmwj6lood006tl3y8kblpizdl	cmwj4nyub0000l3ic1cbm4scv	SETTINGS_UPDATED	SystemSetting	cmwj4s5on0011l32wh1uxro1d	{"key": "pricing.default_delivery_fee_inr", "value": "35", "actorId": "cmwj4nyub0000l3ic1cbm4scv"}	\N	\N	2026-11-16 11:29:51.661
cmwj6lpe3006yl3y85m5nwsw5	cmwj6lpdo006ul3y8avmmqk3e	REGISTER	User	cmwj6lpdo006ul3y8avmmqk3e	{"actorId": "cmwj6lpdo006ul3y8avmmqk3e"}	::1	\N	2026-11-16 11:29:52.587
cmwj6lpog0072l3y8b16iq0i9	cmwj6lpdo006ul3y8avmmqk3e	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6lpdo006ul3y8avmmqk3e"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:29:52.961
cmwj6lpzp0075l3y8zysjhzrn	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6lpzg0073l3y8l9hrhx3m	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "supp-1794828592235@rasoi.internal", "assignedRole": "SUPPORT"}	\N	\N	2026-11-16 11:29:53.365
cmwj6lq970079l3y8z9rdr19c	cmwj6lpzg0073l3y8l9hrhx3m	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6lpzg0073l3y8l9hrhx3m"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:29:53.707
cmwj6lqjs007cl3y8x4rfg1vc	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6lqjj007al3y8slbome7k	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "ops-1794828592235@rasoi.internal", "assignedRole": "OPERATIONS"}	\N	\N	2026-11-16 11:29:54.088
cmwj6lqts007gl3y8wgkl0q2g	cmwj6lqjj007al3y8slbome7k	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6lqjj007al3y8slbome7k"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:29:54.448
cmwj6lr4z007jl3y8kb49yv95	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6lr4p007hl3y84mwsuw0j	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "adm-1794828592235@rasoi.internal", "assignedRole": "ADMIN"}	\N	\N	2026-11-16 11:29:54.851
cmwj6lrfh007nl3y81rje1m70	cmwj6lr4p007hl3y84mwsuw0j	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6lr4p007hl3y84mwsuw0j"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:29:55.229
cmwj6ls7h0084l3y8l4yem0ib	cmwj4nyub0000l3ic1cbm4scv	USER_SUSPENDED	User	cmwj6lru7007ol3y8kcaeerkv	{"reason": "Security violation test suspension", "actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "SUSPENDED", "targetEmail": "victim-1794828595382@test.com", "previousStatus": "ACTIVE"}	\N	\N	2026-11-16 11:29:56.237
cmwj6load006hl3y8rokvcsn6	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_CREATED	Recipe	rec-1794828591141	{"title": "Kathiyawadi Ringan No Olo mwj6lngd", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "cuisine": "Kathiyawadi"}	\N	\N	2026-11-16 11:29:51.157
cmwj6lob2006jl3y8vfrz12ts	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794828591141	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": true}	\N	\N	2026-11-16 11:29:51.182
cmwj6lobt006ll3y8vlaon56r	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794828591141	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": false}	\N	\N	2026-11-16 11:29:51.209
cmwj6lrun007sl3y8x73g3dwr	cmwj6lru7007ol3y8kcaeerkv	REGISTER	User	cmwj6lru7007ol3y8kcaeerkv	{"actorId": "cmwj6lru7007ol3y8kcaeerkv"}	::1	\N	2026-11-16 11:29:55.775
cmwj6ls58007wl3y8o9rmj4h4	cmwj6lru7007ol3y8kcaeerkv	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6lru7007ol3y8kcaeerkv"}	::1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:29:56.156
cmwj6ls650082l3y8zgl2bq8y	cmwj6lru7007ol3y8kcaeerkv	HOUSEHOLD_CREATED	Household	cmwj6ls5q007yl3y84th51utm	{"name": "Victim Household", "actorId": "cmwj6lru7007ol3y8kcaeerkv"}	\N	\N	2026-11-16 11:29:56.189
cmwj6ls9g0086l3y865z2ykrk	cmwj4nyub0000l3ic1cbm4scv	USER_REACTIVATED	User	cmwj6lru7007ol3y8kcaeerkv	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "ACTIVE", "targetEmail": "victim-1794828595382@test.com", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 11:29:56.308
cmwj6lscy008al3y8jp6sh7jr	cmwj6lpzg0073l3y8l9hrhx3m	SUPPORT_HOUSEHOLD_INSPECTED	Household	hh-sharma-family	{"actorId": "cmwj6lpzg0073l3y8l9hrhx3m", "actorRole": "SUPPORT", "accessedAt": "2026-11-16T11:29:56.426Z", "householdName": "Sharma Family", "supportReason": "Investigating delivery delay for customer ticket #SUP-9941"}	\N	\N	2026-11-16 11:29:56.434
cmwj6x74a008fl3y8njkbcrr8	cmwj6x73q008bl3y80mv4nrrt	REGISTER	User	cmwj6x73q008bl3y80mv4nrrt	{"actorId": "cmwj6x73q008bl3y80mv4nrrt"}	10.52.53.59	\N	2026-11-16 11:38:48.778
cmwj6x7f8008jl3y8zkz9d61b	cmwj6x73q008bl3y80mv4nrrt	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6x73q008bl3y80mv4nrrt"}	10.52.173.194	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:49.172
cmwj6x7qs008ml3y8dtuzf7no	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6x7qe008kl3y8a992cwtg	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "supp-1794829128395@rasoi.internal", "assignedRole": "SUPPORT"}	\N	\N	2026-11-16 11:38:49.588
cmwj6x83b008ql3y8t5ek5gb0	cmwj6x7qe008kl3y8a992cwtg	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6x7qe008kl3y8a992cwtg"}	10.52.61.52	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:50.04
cmwj6x8du008tl3y8ap57yfd2	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6x8dl008rl3y8skrrtrwr	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "ops-1794829128395@rasoi.internal", "assignedRole": "OPERATIONS"}	\N	\N	2026-11-16 11:38:50.418
cmwj6x8pb008xl3y8wqeghfd1	cmwj6x8dl008rl3y8skrrtrwr	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6x8dl008rl3y8skrrtrwr"}	10.52.90.93	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:50.831
cmwj6x90h0090l3y8ty47dc7g	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6x908008yl3y8d6w9fi4s	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "adm-1794829128395@rasoi.internal", "assignedRole": "ADMIN"}	\N	\N	2026-11-16 11:38:51.233
cmwj6x9bx0094l3y8jhwdbpmd	cmwj6x908008yl3y8d6w9fi4s	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6x908008yl3y8d6w9fi4s"}	10.52.166.98	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:51.645
cmwj6x9uj0099l3y8fcfszady	cmwj6x9tt0095l3y8z0swl428	REGISTER	User	cmwj6x9tt0095l3y8z0swl428	{"actorId": "cmwj6x9tt0095l3y8z0swl428"}	10.52.148.107	\N	2026-11-16 11:38:52.315
cmwj6xa7l009dl3y8ef2dmndd	cmwj6x9tt0095l3y8z0swl428	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6x9tt0095l3y8z0swl428"}	10.52.196.116	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:52.785
cmwj6xa8p009jl3y8gf1bmrlu	cmwj6x9tt0095l3y8z0swl428	HOUSEHOLD_CREATED	Household	cmwj6xa86009fl3y877o6hjbl	{"name": "Victim Household", "actorId": "cmwj6x9tt0095l3y8z0swl428"}	\N	\N	2026-11-16 11:38:52.826
cmwj6xaag009ll3y852qajbz4	cmwj4nyub0000l3ic1cbm4scv	USER_SUSPENDED	User	cmwj6x9tt0095l3y8z0swl428	{"reason": "Security violation test suspension", "actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "SUSPENDED", "targetEmail": "victim-1794829131883@test.com", "previousStatus": "ACTIVE"}	\N	\N	2026-11-16 11:38:52.888
cmwj6xabz009nl3y8se6j35v6	cmwj4nyub0000l3ic1cbm4scv	USER_REACTIVATED	User	cmwj6x9tt0095l3y8z0swl428	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "ACTIVE", "targetEmail": "victim-1794829131883@test.com", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 11:38:52.944
cmwj6xam5009rl3y8v850cmoe	cmwj6x9tt0095l3y8z0swl428	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6x9tt0095l3y8z0swl428"}	10.52.161.122	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:53.309
cmwj6xapj009vl3y8eaxik1sk	cmwj6x7qe008kl3y8a992cwtg	SUPPORT_HOUSEHOLD_INSPECTED	Household	hh-sharma-family	{"actorId": "cmwj6x7qe008kl3y8a992cwtg", "actorRole": "SUPPORT", "accessedAt": "2026-11-16T11:38:53.427Z", "householdName": "Sharma Family", "supportReason": "Investigating delivery delay for customer ticket #SUP-9941"}	\N	\N	2026-11-16 11:38:53.431
cmwj6xazh009zl3y8a7fd78zd	cmwj58zak0069l3rc3wksnuya	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj58zak0069l3rc3wksnuya"}	10.52.81.10	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:53.79
cmwj6xbbv00a4l3y8hy99t03l	cmwj6xbbf00a0l3y8gyrqt637	REGISTER	User	cmwj6xbbf00a0l3y8gyrqt637	{"actorId": "cmwj6xbbf00a0l3y8gyrqt637"}	10.52.170.35	\N	2026-11-16 11:38:54.235
cmwj6xbnf00a8l3y8fee3wkhq	cmwj6xbbf00a0l3y8gyrqt637	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6xbbf00a0l3y8gyrqt637"}	10.52.154.153	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:54.652
cmwj6xbob00ael3y8rsnvyled	cmwj6xbbf00a0l3y8gyrqt637	HOUSEHOLD_CREATED	Household	cmwj6xbny00aal3y8jpupz2qv	{"name": "Alpha Household", "actorId": "cmwj6xbbf00a0l3y8gyrqt637"}	\N	\N	2026-11-16 11:38:54.684
cmwj6xbyp00ajl3y8gm0ykz68	cmwj6xbyb00afl3y8paohnqpl	REGISTER	User	cmwj6xbyb00afl3y8paohnqpl	{"actorId": "cmwj6xbyb00afl3y8paohnqpl"}	10.52.87.61	\N	2026-11-16 11:38:55.057
cmwj6xc9400anl3y8c0cbtky4	cmwj6xbyb00afl3y8paohnqpl	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6xbyb00afl3y8paohnqpl"}	10.52.197.38	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:55.432
cmwj6xca200atl3y8yawe6n4i	cmwj6xbyb00afl3y8paohnqpl	HOUSEHOLD_CREATED	Household	cmwj6xc9n00apl3y8mhd0s1w7	{"name": "Beta Household", "actorId": "cmwj6xbyb00afl3y8paohnqpl"}	\N	\N	2026-11-16 11:38:55.466
cmwj6xd2b00ayl3y85q485o6i	cmwj6xd1w00aul3y8ll382ry0	REGISTER	User	cmwj6xd1w00aul3y8ll382ry0	{"actorId": "cmwj6xd1w00aul3y8ll382ry0"}	10.52.174.110	\N	2026-11-16 11:38:56.483
cmwj6xdd400b2l3y8olfz9pfj	cmwj6xd1w00aul3y8ll382ry0	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6xd1w00aul3y8ll382ry0"}	10.52.169.162	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:56.873
cmwj6xddx00b8l3y8qj32px0r	cmwj6xd1w00aul3y8ll382ry0	HOUSEHOLD_CREATED	Household	cmwj6xddm00b4l3y84bm9ih1l	{"name": "Merchant Family Household", "actorId": "cmwj6xd1w00aul3y8ll382ry0"}	\N	\N	2026-11-16 11:38:56.902
cmwj6xdfz00bcl3y8xylnfq4y	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj6xdek00bal3y8cf39hlw7	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj6xd1w00aul3y8ll382ry0", "businessName": "Organic Greens 1794829136910", "applicantEmail": "merchant-cust-1794829136062@test.com"}	\N	\N	2026-11-16 11:38:56.975
cmwj6xdtt00bhl3y8x8pnhqqf	cmwj6xdtd00bdl3y825vovtmm	REGISTER	User	cmwj6xdtd00bdl3y825vovtmm	{"actorId": "cmwj6xdtd00bdl3y825vovtmm"}	10.52.97.117	\N	2026-11-16 11:38:57.474
cmwj6xe6300bll3y8qwo6hlfq	cmwj6xdtd00bdl3y825vovtmm	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6xdtd00bdl3y825vovtmm"}	10.52.61.60	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:57.916
cmwj6xe6y00brl3y8ywd0lool	cmwj6xdtd00bdl3y825vovtmm	HOUSEHOLD_CREATED	Household	cmwj6xe6k00bnl3y8iyefsg3n	{"name": "Pilot Household Alpha", "actorId": "cmwj6xdtd00bdl3y825vovtmm"}	\N	\N	2026-11-16 11:38:57.947
cmwj6xe8200bvl3y8dy1i4cer	cmwj6xdtd00bdl3y825vovtmm	HOUSEHOLD_INVITATION_SENT	HouseholdInvitation	cmwj6xe7t00btl3y8vmh2smg4	{"role": "MEMBER", "actorId": "cmwj6xdtd00bdl3y825vovtmm", "invitedEmail": "invited-1794829137950@pilot.com"}	\N	\N	2026-11-16 11:38:57.986
cmwj6xej700c0l3y89cqq4j39	cmwj6xeit00bwl3y8yks7cd7r	REGISTER	User	cmwj6xeit00bwl3y8yks7cd7r	{"actorId": "cmwj6xeit00bwl3y8yks7cd7r"}	10.52.19.9	\N	2026-11-16 11:38:58.388
cmwj6xev500c4l3y8olsvrklq	cmwj6xeit00bwl3y8yks7cd7r	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6xeit00bwl3y8yks7cd7r"}	10.52.73.109	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:58.817
cmwj6xew400c8l3y81n94ez6h	cmwj6xeit00bwl3y8yks7cd7r	HOUSEHOLD_INVITATION_ACCEPTED	Household	cmwj6xe6k00bnl3y8iyefsg3n	{"role": "MEMBER", "actorId": "cmwj6xeit00bwl3y8yks7cd7r"}	\N	\N	2026-11-16 11:38:58.853
cmwj6xf2a00ccl3y8n4m5o8ol	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj6xf1500cal3y8u7x9p5v4	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj6xdtd00bdl3y825vovtmm", "businessName": "Pilot Store 1794829139019", "applicantEmail": "pilot-e2e-1794829137015@rasoi.pilot"}	\N	\N	2026-11-16 11:38:59.074
cmwj6xf3h00cel3y87r1smomv	cmwj4nyub0000l3ic1cbm4scv	USER_SUSPENDED	User	cmwj6xdtd00bdl3y825vovtmm	{"reason": "End-of-pilot verification suspension", "actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "SUSPENDED", "targetEmail": "pilot-e2e-1794829137015@rasoi.pilot", "previousStatus": "ACTIVE"}	\N	\N	2026-11-16 11:38:59.117
cmwj6yxau00chl3y889h69hc1	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 11:40:09.366
cmwj6yxy800ckl3y8axatm3wg	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 11:40:10.208
cmwj6z3rb00e8l3y85e4r6lg3	cmwj2fa4w0000l3s4x4q1jmst	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst"}	::1	node	2026-11-16 11:40:17.735
cmwj6z3tj00ebl3y84izoyttd	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 11:40:17.815
cmwj6z31l00dsl3y8w9hbjb52	\N	REGISTER	User	cmwj6z31500dol3y8af0gbj0a	{"actorId": "cmwj6z31500dol3y8af0gbj0a"}	::1	\N	2026-11-16 11:40:16.809
cmwj6z32g00dul3y8o4yors3o	\N	EMAIL_VERIFIED	User	cmwj6z31500dol3y8af0gbj0a	{"actorId": "cmwj6z31500dol3y8af0gbj0a"}	::1	\N	2026-11-16 11:40:16.84
cmwj6z3d000dyl3y8wjsy7mcg	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6z31500dol3y8af0gbj0a"}	::1	node	2026-11-16 11:40:17.22
cmwj6z3e400e2l3y85e9b8foc	\N	HOUSEHOLD_INVITATION_ACCEPTED	Household	cmwj6z2oa00dfl3y8s8he5nq8	{"role": "MEMBER", "actorId": "cmwj6z31500dol3y8af0gbj0a"}	\N	\N	2026-11-16 11:40:17.26
cmwj6z0x300cpl3y8isvxzar6	\N	REGISTER	User	cmwj6z0wj00cll3y89vkh1tnc	{"actorId": "cmwj6z0wj00cll3y89vkh1tnc"}	::1	\N	2026-11-16 11:40:14.055
cmwj6z10f00crl3y8i52nzzfh	\N	EMAIL_VERIFIED	User	cmwj6z0wj00cll3y89vkh1tnc	{"actorId": "cmwj6z0wj00cll3y89vkh1tnc"}	::1	\N	2026-11-16 11:40:14.175
cmwj6z1bx00ctl3y86xvk00r2	\N	LOGIN_FAILURE	\N	\N	{"actorId": "cmwj6z0wj00cll3y89vkh1tnc"}	::1	\N	2026-11-16 11:40:14.59
cmwj6z1m700cxl3y8u4ylj4wu	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6z0wj00cll3y89vkh1tnc"}	::1	node	2026-11-16 11:40:14.959
cmwj6z1nr00d1l3y80bjcd6kf	\N	REFRESH_TOKEN_REPLAY_DETECTED	\N	\N	{"actorId": "cmwj6z0wj00cll3y89vkh1tnc", "tokenFamilyId": "[REDACTED]"}	::1	\N	2026-11-16 11:40:15.015
cmwj6z1oh00d5l3y8zwwjb5wj	\N	PASSWORD_RESET_REQUESTED	\N	\N	{"actorId": "cmwj6z0wj00cll3y89vkh1tnc"}	::1	\N	2026-11-16 11:40:15.041
cmwj6z20800d7l3y899fbynra	\N	PASSWORD_RESET_COMPLETED	\N	\N	{"actorId": "cmwj6z0wj00cll3y89vkh1tnc"}	::1	\N	2026-11-16 11:40:15.464
cmwj6z2bt00d9l3y8dymmkte8	\N	LOGIN_FAILURE	\N	\N	{"actorId": "cmwj6z0wj00cll3y89vkh1tnc"}	::1	\N	2026-11-16 11:40:15.881
cmwj6z2nr00ddl3y8oci1mf34	\N	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6z0wj00cll3y89vkh1tnc"}	::1	node	2026-11-16 11:40:16.312
cmwj6z2or00djl3y8kcazhxhi	\N	HOUSEHOLD_CREATED	Household	cmwj6z2oa00dfl3y8s8he5nq8	{"name": "Joshi Family Kitchen", "actorId": "cmwj6z0wj00cll3y89vkh1tnc"}	\N	\N	2026-11-16 11:40:16.347
cmwj6z2pz00dnl3y8haq8q70f	\N	HOUSEHOLD_INVITATION_SENT	HouseholdInvitation	cmwj6z2pq00dll3y8io6ha7tj	{"role": "MEMBER", "actorId": "cmwj6z0wj00cll3y89vkh1tnc", "invitedEmail": "invited.family.mwj6z0je@testrasoi.in"}	\N	\N	2026-11-16 11:40:16.392
cmwj6z4q500egl3y8et8k37el	cmwj6z4po00ecl3y84i7cp32h	REGISTER	User	cmwj6z4po00ecl3y84i7cp32h	{"actorId": "cmwj6z4po00ecl3y84i7cp32h"}	::1	\N	2026-11-16 11:40:18.989
cmwj6z55300eil3y8yor29zul	cmwj2fa4w0000l3s4x4q1jmst	USER_SUSPENDED	User	cmwj6z4po00ecl3y84i7cp32h	{"reason": "Investigating suspicious order activity", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "SUSPENDED", "targetEmail": "rogue.admin.mwj6z4en@test.in", "previousStatus": "PENDING_VERIFICATION"}	\N	\N	2026-11-16 11:40:19.527
cmwj6z56r00ekl3y8hvvcelow	cmwj2fa4w0000l3s4x4q1jmst	USER_REACTIVATED	User	cmwj6z4po00ecl3y84i7cp32h	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "newStatus": "ACTIVE", "targetEmail": "rogue.admin.mwj6z4en@test.in", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 11:40:19.587
cmwj6z58w00eml3y8d9wjxfos	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_APPROVED	RetailerApplication	cmwj6z56y0003l3b8ikh3h0xo	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "applicantId": "cmwj6z4po00ecl3y84i7cp32h", "businessName": "Fresh Greens Mart mwj6z4en", "applicantEmail": "rogue.admin.mwj6z4en@test.in"}	\N	\N	2026-11-16 11:40:19.664
cmwj6z59v00eol3y8togia8gl	cmwj2fa4w0000l3s4x4q1jmst	RETAILER_SUSPENDED	Retailer	ret-fresh-greens-mart-mwj6z4en	{"reason": "Audit pending", "status": "SUSPENDED", "actorId": "cmwj2fa4w0000l3s4x4q1jmst"}	\N	\N	2026-11-16 11:40:19.699
cmwj6z5bd00eql3y8ojkkk291	\N	ORDER_STATUS_CHANGED	Order	ord-1794829210692	{"reason": "Out with delivery executive", "actorId": "user-ops-1", "newStatus": "DISPATCHED", "fulfillmentNotes": "Customer requested contactless delivery at doorstep"}	\N	\N	2026-11-16 11:40:19.754
cmwj6z5pc00ezl3y8zlrcodf1	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6z5p300exl3y8wgdxik10	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "ops.lead.mwj6z4en@rasoiiq.in", "assignedRole": "OPERATIONS"}	\N	\N	2026-11-16 11:40:20.257
cmwj6z5q800f1l3y8jn2h4dt2	cmwj4nyub0000l3ic1cbm4scv	STAFF_ROLE_CHANGED	User	cmwj6z5p300exl3y8wgdxik10	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newRole": "SUPPORT", "previousRole": "OPERATIONS"}	\N	\N	2026-11-16 11:40:20.288
cmwj6z5rd00f4l3y8jw76gcau	cmwj4nyub0000l3ic1cbm4scv	SETTINGS_UPDATED	SystemSetting	cmwj4s5on0011l32wh1uxro1d	{"key": "pricing.default_delivery_fee_inr", "value": "35", "actorId": "cmwj4nyub0000l3ic1cbm4scv"}	\N	\N	2026-11-16 11:40:20.329
cmwj6z6hw00f9l3y8yk3euht5	cmwj6z6hh00f5l3y8wly8d46b	REGISTER	User	cmwj6z6hh00f5l3y8wly8d46b	{"actorId": "cmwj6z6hh00f5l3y8wly8d46b"}	10.52.18.170	\N	2026-11-16 11:40:21.284
cmwj6z6t500fdl3y80m1evg43	cmwj6z6hh00f5l3y8wly8d46b	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6z6hh00f5l3y8wly8d46b"}	10.52.143.131	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:21.689
cmwj6z74b00fgl3y8kmn9lrmx	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6z74200fel3y8b21ragl4	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "supp-1794829220915@rasoi.internal", "assignedRole": "SUPPORT"}	\N	\N	2026-11-16 11:40:22.091
cmwj6z7ep00fkl3y8ww80ju75	cmwj6z74200fel3y8b21ragl4	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6z74200fel3y8b21ragl4"}	10.52.81.100	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:22.465
cmwj6z7p200fnl3y892a5c6vb	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6z7ou00fll3y8gipg5bo4	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "ops-1794829220915@rasoi.internal", "assignedRole": "OPERATIONS"}	\N	\N	2026-11-16 11:40:22.839
cmwj6z7zg00frl3y8ndji8t7h	cmwj6z7ou00fll3y8gipg5bo4	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6z7ou00fll3y8gipg5bo4"}	10.52.50.171	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:23.212
cmwj6z8a900ful3y8x3lc42sg	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj6z89z00fsl3y8z0848h4i	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "adm-1794829220915@rasoi.internal", "assignedRole": "ADMIN"}	\N	\N	2026-11-16 11:40:23.601
cmwj6z8lf00fyl3y8ypdfwvrq	cmwj6z89z00fsl3y8z0848h4i	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6z89z00fsl3y8z0848h4i"}	10.52.73.71	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:24.004
cmwj7lzgj0012l3jswbr6ey8v	cmwj7lzfz000yl3jsoax6761b	REGISTER	User	cmwj7lzfz000yl3jsoax6761b	{"actorId": "cmwj7lzfz000yl3jsoax6761b"}	10.52.14.194	\N	2026-11-16 11:58:05.251
cmwj6z5cs00esl3y86d1o6zlv	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_CREATED	Recipe	rec-1794829219790	{"title": "Kathiyawadi Ringan No Olo mwj6z4en", "actorId": "cmwj2fa4w0000l3s4x4q1jmst", "cuisine": "Kathiyawadi"}	\N	\N	2026-11-16 11:40:19.804
cmwj6z5dh00eul3y8196fklkg	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794829219790	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": true}	\N	\N	2026-11-16 11:40:19.829
cmwj6z5e300ewl3y8rgoiic1l	cmwj2fa4w0000l3s4x4q1jmst	RECIPE_ARCHIVED	Recipe	rec-1794829219790	{"actorId": "cmwj2fa4w0000l3s4x4q1jmst", "isArchived": false}	\N	\N	2026-11-16 11:40:19.852
cmwj6z8yn00g3l3y8rldw2ir8	cmwj6z8ya00fzl3y8xja0epch	REGISTER	User	cmwj6z8ya00fzl3y8xja0epch	{"actorId": "cmwj6z8ya00fzl3y8xja0epch"}	10.52.174.179	\N	2026-11-16 11:40:24.479
cmwj6z99500g7l3y81q6igugu	cmwj6z8ya00fzl3y8xja0epch	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6z8ya00fzl3y8xja0epch"}	10.52.32.168	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:24.858
cmwj6z99z00gdl3y80b6u58gn	cmwj6z8ya00fzl3y8xja0epch	HOUSEHOLD_CREATED	Household	cmwj6z99m00g9l3y8oc4q8m3o	{"name": "Victim Household", "actorId": "cmwj6z8ya00fzl3y8xja0epch"}	\N	\N	2026-11-16 11:40:24.888
cmwj6zdxb00j8l3y8z203064o	cmwj4nyub0000l3ic1cbm4scv	USER_SUSPENDED	User	cmwj6zcpy00i7l3y8vp2u3gdx	{"reason": "End-of-pilot verification suspension", "actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "SUSPENDED", "targetEmail": "pilot-e2e-1794829228985@rasoi.pilot", "previousStatus": "ACTIVE"}	\N	\N	2026-11-16 11:40:30.912
cmwj6z9bh00gfl3y8qcmp1ict	cmwj4nyub0000l3ic1cbm4scv	USER_SUSPENDED	User	cmwj6z8ya00fzl3y8xja0epch	{"reason": "Security violation test suspension", "actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "SUSPENDED", "targetEmail": "victim-1794829224150@test.com", "previousStatus": "ACTIVE"}	\N	\N	2026-11-16 11:40:24.941
cmwj6z9dd00ghl3y8v63yk1n8	cmwj4nyub0000l3ic1cbm4scv	USER_REACTIVATED	User	cmwj6z8ya00fzl3y8xja0epch	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "ACTIVE", "targetEmail": "victim-1794829224150@test.com", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 11:40:25.009
cmwj6z9oe00gll3y8vkvoq49s	cmwj6z8ya00fzl3y8xja0epch	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6z8ya00fzl3y8xja0epch"}	10.52.119.13	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:25.407
cmwj6z9sb00gpl3y8oylaokke	cmwj6z74200fel3y8b21ragl4	SUPPORT_HOUSEHOLD_INSPECTED	Household	hh-sharma-family	{"actorId": "cmwj6z74200fel3y8b21ragl4", "actorRole": "SUPPORT", "accessedAt": "2026-11-16T11:40:25.541Z", "householdName": "Sharma Family", "supportReason": "Investigating delivery delay for customer ticket #SUP-9941"}	\N	\N	2026-11-16 11:40:25.547
cmwj6za1t00gtl3y8ddr4xbhc	cmwj58zak0069l3rc3wksnuya	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj58zak0069l3rc3wksnuya"}	10.52.159.27	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:25.89
cmwj6zac600gyl3y8yusk6k3i	cmwj6zabr00gul3y8iotaejmx	REGISTER	User	cmwj6zabr00gul3y8iotaejmx	{"actorId": "cmwj6zabr00gul3y8iotaejmx"}	10.52.75.101	\N	2026-11-16 11:40:26.263
cmwj6zaoc00h2l3y81skxcann	cmwj6zabr00gul3y8iotaejmx	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6zabr00gul3y8iotaejmx"}	10.52.177.169	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:26.7
cmwj6zaph00h8l3y85u7q25e6	cmwj6zabr00gul3y8iotaejmx	HOUSEHOLD_CREATED	Household	cmwj6zaox00h4l3y801ndmedm	{"name": "Alpha Household", "actorId": "cmwj6zabr00gul3y8iotaejmx"}	\N	\N	2026-11-16 11:40:26.742
cmwj6zb0q00hdl3y81ubfu5l7	cmwj6zb0b00h9l3y8jbf1bxsl	REGISTER	User	cmwj6zb0b00h9l3y8jbf1bxsl	{"actorId": "cmwj6zb0b00h9l3y8jbf1bxsl"}	10.52.115.198	\N	2026-11-16 11:40:27.146
cmwj6zbb600hhl3y82rqu2yf6	cmwj6zb0b00h9l3y8jbf1bxsl	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6zb0b00h9l3y8jbf1bxsl"}	10.52.150.132	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:27.522
cmwj6zbc000hnl3y8dozhvcqp	cmwj6zb0b00h9l3y8jbf1bxsl	HOUSEHOLD_CREATED	Household	cmwj6zbbk00hjl3y8j5txhp5n	{"name": "Beta Household", "actorId": "cmwj6zb0b00h9l3y8jbf1bxsl"}	\N	\N	2026-11-16 11:40:27.553
cmwj6zc1m00hsl3y86az74x2c	cmwj6zc1800hol3y8bm6l3skb	REGISTER	User	cmwj6zc1800hol3y8bm6l3skb	{"actorId": "cmwj6zc1800hol3y8bm6l3skb"}	10.52.45.94	\N	2026-11-16 11:40:28.475
cmwj6zcce00hwl3y8wepd3bty	cmwj6zc1800hol3y8bm6l3skb	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6zc1800hol3y8bm6l3skb"}	10.52.123.110	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:28.862
cmwj6zcda00i2l3y8ywatsm0l	cmwj6zc1800hol3y8bm6l3skb	HOUSEHOLD_CREATED	Household	cmwj6zccu00hyl3y8qwb4t047	{"name": "Merchant Family Household", "actorId": "cmwj6zc1800hol3y8bm6l3skb"}	\N	\N	2026-11-16 11:40:28.894
cmwj6zcey00i6l3y8inv923p4	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj6zcdw00i4l3y8gybqohfm	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj6zc1800hol3y8bm6l3skb", "businessName": "Organic Greens 1794829228898", "applicantEmail": "merchant-cust-1794829228122@test.com"}	\N	\N	2026-11-16 11:40:28.954
cmwj6zcqd00ibl3y8m8zlo9r6	cmwj6zcpy00i7l3y8vp2u3gdx	REGISTER	User	cmwj6zcpy00i7l3y8vp2u3gdx	{"actorId": "cmwj6zcpy00i7l3y8vp2u3gdx"}	10.52.13.149	\N	2026-11-16 11:40:29.366
cmwj6zd1h00ifl3y8oajkjvqf	cmwj6zcpy00i7l3y8vp2u3gdx	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6zcpy00i7l3y8vp2u3gdx"}	10.52.128.119	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:29.765
cmwj6zd2c00ill3y8546rnu7n	cmwj6zcpy00i7l3y8vp2u3gdx	HOUSEHOLD_CREATED	Household	cmwj6zd1y00ihl3y8tizaztne	{"name": "Pilot Household Alpha", "actorId": "cmwj6zcpy00i7l3y8vp2u3gdx"}	\N	\N	2026-11-16 11:40:29.796
cmwj6zd3a00ipl3y89lcmqy07	cmwj6zcpy00i7l3y8vp2u3gdx	HOUSEHOLD_INVITATION_SENT	HouseholdInvitation	cmwj6zd3100inl3y8r17uiyp5	{"role": "MEMBER", "actorId": "cmwj6zcpy00i7l3y8vp2u3gdx", "invitedEmail": "invited-1794829229796@pilot.com"}	\N	\N	2026-11-16 11:40:29.83
cmwj6zdec00iul3y8bhj41fxb	cmwj6zddx00iql3y8wulseycc	REGISTER	User	cmwj6zddx00iql3y8wulseycc	{"actorId": "cmwj6zddx00iql3y8wulseycc"}	10.52.200.155	\N	2026-11-16 11:40:30.228
cmwj6zdp300iyl3y8jgbxq3b2	cmwj6zddx00iql3y8wulseycc	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj6zddx00iql3y8wulseycc"}	10.52.149.74	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:30.615
cmwj6zdq500j2l3y8pivjvwxk	cmwj6zddx00iql3y8wulseycc	HOUSEHOLD_INVITATION_ACCEPTED	Household	cmwj6zd1y00ihl3y8tizaztne	{"role": "MEMBER", "actorId": "cmwj6zddx00iql3y8wulseycc"}	\N	\N	2026-11-16 11:40:30.653
cmwj6zdw700j6l3y842fl34eo	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj6zdv100j4l3y8ti6xchjy	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj6zcpy00i7l3y8vp2u3gdx", "businessName": "Pilot Store 1794829230810", "applicantEmail": "pilot-e2e-1794829228985@rasoi.pilot"}	\N	\N	2026-11-16 11:40:30.871
cmwj7l12l0001l3jsc3x482a5	cmwj4nyub0000l3ic1cbm4scv	LOGIN_FAILURE	\N	\N	{"actorId": "cmwj4nyub0000l3ic1cbm4scv"}	10.52.151.27	\N	2026-11-16 11:57:20.685
cmwj7l1d10006l3js1h7b4ghm	cmwj7l1cj0002l3jsbgwcbmwx	REGISTER	User	cmwj7l1cj0002l3jsbgwcbmwx	{"actorId": "cmwj7l1cj0002l3jsbgwcbmwx"}	10.52.172.196	\N	2026-11-16 11:57:21.062
cmwj7l1no000al3jslhot1e50	cmwj7l1cj0002l3jsbgwcbmwx	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7l1cj0002l3jsbgwcbmwx"}	10.52.77.128	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:57:21.444
cmwj7lyo0000hl3js4e5wdaxu	cmwj7lyng000dl3js8tqyxiym	REGISTER	User	cmwj7lyng000dl3js8tqyxiym	{"actorId": "cmwj7lyng000dl3js8tqyxiym"}	10.52.198.121	\N	2026-11-16 11:58:04.224
cmwj7lyyh000ll3jsmdqk4ivb	cmwj7lyng000dl3js8tqyxiym	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7lyng000dl3js8tqyxiym"}	10.52.77.29	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:04.601
cmwj7lyzl000rl3jshc4jwr7g	cmwj7lyng000dl3js8tqyxiym	HOUSEHOLD_CREATED	Household	cmwj7lyz3000nl3jsd40ge37l	{"name": "Suspension Test Household", "actorId": "cmwj7lyng000dl3js8tqyxiym"}	\N	\N	2026-11-16 11:58:04.641
cmwj7lz1c000tl3jsrs6yt4yf	cmwj4nyub0000l3ic1cbm4scv	USER_SUSPENDED	User	cmwj7lyng000dl3js8tqyxiym	{"reason": "Controlled audit suspension test", "actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "SUSPENDED", "targetEmail": "cust-susp-1794830283859@pilot.com", "previousStatus": "ACTIVE"}	\N	\N	2026-11-16 11:58:04.705
cmwj7lz3q000vl3js6tr9mfj1	cmwj4nyub0000l3ic1cbm4scv	USER_REACTIVATED	User	cmwj7lyng000dl3js8tqyxiym	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "ACTIVE", "targetEmail": "cust-susp-1794830283859@pilot.com", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 11:58:04.79
cmwj7lz63000xl3jszy16xy3b	\N	SUPPORT_HOUSEHOLD_INSPECTED	Household	hh-sharma-family	{"actorId": "user-support-1", "actorRole": "SUPPORT", "accessedAt": "2026-11-16T11:58:04.863Z", "householdName": "Sharma Family", "supportReason": "Valid ticket #9901: pantry sync issue"}	\N	\N	2026-11-16 11:58:04.875
cmwj7radc0074l3jslm642bkn	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 12:02:12.672
cmwj7lzqm0016l3js84yadb71	cmwj7lzfz000yl3jsoax6761b	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7lzfz000yl3jsoax6761b"}	10.52.196.123	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:05.615
cmwj7lzsm001al3jse0l90d2q	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj7lzr90018l3jsg7hzxc1r	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj7lzfz000yl3jsoax6761b", "businessName": "Alpha Grocers 1794830285620", "applicantEmail": "reta-1794830284900@merchant.com"}	\N	\N	2026-11-16 11:58:05.686
cmwj7m02c001fl3js8a3oqw4w	cmwj7m01y001bl3js2hkruhrk	REGISTER	User	cmwj7m01y001bl3js2hkruhrk	{"actorId": "cmwj7m01y001bl3js2hkruhrk"}	10.52.168.180	\N	2026-11-16 11:58:06.036
cmwj7m0d1001jl3jsjpc30pku	cmwj7m01y001bl3js2hkruhrk	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7m01y001bl3js2hkruhrk"}	10.52.85.13	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:06.421
cmwj7m0eo001nl3jsbrd78rx1	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj7m0dj001ll3jsyvmvrb8d	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj7m01y001bl3js2hkruhrk", "businessName": "Beta Provisions 1794830286425", "applicantEmail": "retb-1794830285691@merchant.com"}	\N	\N	2026-11-16 11:58:06.48
cmwj7m0pz001rl3js6e5pamm5	cmwj7lzfz000yl3jsoax6761b	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7lzfz000yl3jsoax6761b"}	10.52.47.126	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:06.888
cmwj7m124001vl3jsql1u77th	cmwj7m01y001bl3js2hkruhrk	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7m01y001bl3js2hkruhrk"}	10.52.143.198	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:07.325
cmwj7n0nl0022l3js50b5lqh5	cmwj7n0n7001yl3jsz11tqw4e	REGISTER	User	cmwj7n0n7001yl3jsz11tqw4e	{"actorId": "cmwj7n0n7001yl3jsz11tqw4e"}	10.52.165.168	\N	2026-11-16 11:58:53.457
cmwj7n0xj0026l3jsan6hbxt3	cmwj7n0n7001yl3jsz11tqw4e	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7n0n7001yl3jsz11tqw4e"}	10.52.17.32	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:53.815
cmwj7n0yh002cl3jst9ydr7fi	cmwj7n0n7001yl3jsz11tqw4e	HOUSEHOLD_CREATED	Household	cmwj7n0y10028l3jse6hvetdf	{"name": "Suspension Test Household", "actorId": "cmwj7n0n7001yl3jsz11tqw4e"}	\N	\N	2026-11-16 11:58:53.849
cmwj7n0zy002el3js8ynf2ttl	cmwj4nyub0000l3ic1cbm4scv	USER_SUSPENDED	User	cmwj7n0n7001yl3jsz11tqw4e	{"reason": "Controlled audit suspension test", "actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "SUSPENDED", "targetEmail": "cust-susp-1794830333112@pilot.com", "previousStatus": "ACTIVE"}	\N	\N	2026-11-16 11:58:53.903
cmwj7n125002gl3jsx59k2590	cmwj4nyub0000l3ic1cbm4scv	USER_REACTIVATED	User	cmwj7n0n7001yl3jsz11tqw4e	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "ACTIVE", "targetEmail": "cust-susp-1794830333112@pilot.com", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 11:58:53.982
cmwj7n14f002il3jsl6goyiiv	\N	SUPPORT_HOUSEHOLD_INSPECTED	Household	hh-sharma-family	{"actorId": "user-support-1", "actorRole": "SUPPORT", "accessedAt": "2026-11-16T11:58:54.041Z", "householdName": "Sharma Family", "supportReason": "Valid ticket #9901: pantry sync issue"}	\N	\N	2026-11-16 11:58:54.063
cmwj7n1ed002nl3jsb42fcvr0	cmwj7n1e0002jl3jsh9vx8s87	REGISTER	User	cmwj7n1e0002jl3jsh9vx8s87	{"actorId": "cmwj7n1e0002jl3jsh9vx8s87"}	10.52.119.166	\N	2026-11-16 11:58:54.422
cmwj7n1o1002rl3jstggdopch	cmwj7n1e0002jl3jsh9vx8s87	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7n1e0002jl3jsh9vx8s87"}	10.52.198.10	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:54.769
cmwj7n1pw002vl3js7u0vvks8	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj7n1ol002tl3js98q9mc35	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj7n1e0002jl3jsh9vx8s87", "businessName": "Alpha Grocers 1794830334772", "applicantEmail": "reta-1794830334083@merchant.com"}	\N	\N	2026-11-16 11:58:54.836
cmwj7n1z90030l3jss5q987e2	cmwj7n1yu002wl3jsr6auh782	REGISTER	User	cmwj7n1yu002wl3jsr6auh782	{"actorId": "cmwj7n1yu002wl3jsr6auh782"}	10.52.191.58	\N	2026-11-16 11:58:55.173
cmwj7n29o0034l3jspz8dmm14	cmwj7n1yu002wl3jsr6auh782	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7n1yu002wl3jsr6auh782"}	10.52.54.83	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:55.548
cmwj7n2b80038l3jshryfkkn9	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj7n2a50036l3jsl5vp2cyh	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj7n1yu002wl3jsr6auh782", "businessName": "Beta Provisions 1794830335550", "applicantEmail": "retb-1794830334839@merchant.com"}	\N	\N	2026-11-16 11:58:55.604
cmwj7n2kz003cl3jszntteh4u	cmwj7n1e0002jl3jsh9vx8s87	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7n1e0002jl3jsh9vx8s87"}	10.52.19.159	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:55.955
cmwj7n2w0003gl3jsg4wbge9y	cmwj7n1yu002wl3jsr6auh782	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7n1yu002wl3jsr6auh782"}	10.52.50.49	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:56.352
cmwj7n38b003ll3jsx1gbvsho	cmwj7n37w003hl3jsck0kq2ij	REGISTER	User	cmwj7n37w003hl3jsck0kq2ij	{"actorId": "cmwj7n37w003hl3jsck0kq2ij"}	10.52.91.87	\N	2026-11-16 11:58:56.795
cmwj7n39l0002l3fkr5yd0sce	\N	AUDIT_IMMUTABILITY_TEST	SecurityTest	test-sec-1	{"test": "initial value", "nested": {"deep": {"secretToken": "raw_secret_xyz"}, "password": "PlainTextPassword123!"}, "pAsSwOrD": "MixedCasePass!", "tokenList": [{"apiKey": "secret_key_1"}, {"normal": "public_value"}], "freeTextJwt": "Here is my token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsK88 for access"}	\N	\N	2026-11-16 11:58:56.841
cmwj7o6l4003ql3jsbo5rnefo	cmwj7o6ko003ml3jsfxik77ut	REGISTER	User	cmwj7o6ko003ml3jsfxik77ut	{"actorId": "cmwj7o6ko003ml3jsfxik77ut"}	10.52.182.137	\N	2026-11-16 11:59:47.8
cmwj7o6vb003ul3jsq5bnq7yg	cmwj7o6ko003ml3jsfxik77ut	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7o6ko003ml3jsfxik77ut"}	10.52.166.122	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:59:48.167
cmwj7o6w70040l3jse6ej9fzc	cmwj7o6ko003ml3jsfxik77ut	HOUSEHOLD_CREATED	Household	cmwj7o6vs003wl3jsm45u62kw	{"name": "Suspension Test Household", "actorId": "cmwj7o6ko003ml3jsfxik77ut"}	\N	\N	2026-11-16 11:59:48.199
cmwj7o6xm0042l3jsvp8mq968	cmwj4nyub0000l3ic1cbm4scv	USER_SUSPENDED	User	cmwj7o6ko003ml3jsfxik77ut	{"reason": "Controlled audit suspension test", "actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "SUSPENDED", "targetEmail": "cust-susp-1794830387457@pilot.com", "previousStatus": "ACTIVE"}	\N	\N	2026-11-16 11:59:48.251
cmwj7o6zq0044l3js37l81w07	cmwj4nyub0000l3ic1cbm4scv	USER_REACTIVATED	User	cmwj7o6ko003ml3jsfxik77ut	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "ACTIVE", "targetEmail": "cust-susp-1794830387457@pilot.com", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 11:59:48.326
cmwj7o71s0046l3js7bpkwynh	\N	SUPPORT_HOUSEHOLD_INSPECTED	Household	hh-sharma-family	{"actorId": "user-support-1", "actorRole": "SUPPORT", "accessedAt": "2026-11-16T11:59:48.379Z", "householdName": "Sharma Family", "supportReason": "Valid ticket #9901: pantry sync issue"}	\N	\N	2026-11-16 11:59:48.4
cmwj7o7bw004bl3js471ravr2	cmwj7o7bg0047l3js67k4d347	REGISTER	User	cmwj7o7bg0047l3js67k4d347	{"actorId": "cmwj7o7bg0047l3js67k4d347"}	10.52.88.58	\N	2026-11-16 11:59:48.765
cmwj7o7lh004fl3jsw13uq3yh	cmwj7o7bg0047l3js67k4d347	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7o7bg0047l3js67k4d347"}	10.52.73.120	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:59:49.109
cmwj7o7n0004jl3js3jtge2rz	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj7o7lx004hl3jszjsi9jwp	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj7o7bg0047l3js67k4d347", "businessName": "Alpha Grocers 1794830389112", "applicantEmail": "reta-1794830388421@merchant.com"}	\N	\N	2026-11-16 11:59:49.164
cmwj7o7wg004ol3jsjtmy5pzq	cmwj7o7w0004kl3jsjpz2qr0v	REGISTER	User	cmwj7o7w0004kl3jsjpz2qr0v	{"actorId": "cmwj7o7w0004kl3jsjpz2qr0v"}	10.52.26.96	\N	2026-11-16 11:59:49.504
cmwj7o864004sl3jszftaafx6	cmwj7o7w0004kl3jsjpz2qr0v	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7o7w0004kl3jsjpz2qr0v"}	10.52.11.85	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:59:49.852
cmwj7o87l004wl3jsv8dys18v	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj7o86j004ul3jsxl0w58wm	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj7o7w0004kl3jsjpz2qr0v", "businessName": "Beta Provisions 1794830389855", "applicantEmail": "retb-1794830389167@merchant.com"}	\N	\N	2026-11-16 11:59:49.905
cmwj7o8gw0050l3js99f1rdik	cmwj7o7bg0047l3js67k4d347	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7o7bg0047l3js67k4d347"}	10.52.90.173	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:59:50.24
cmwj7o8qn0054l3jsobzl2hfr	cmwj7o7w0004kl3jsjpz2qr0v	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7o7w0004kl3jsjpz2qr0v"}	10.52.147.1	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:59:50.591
cmwj7oodq0059l3jsv2yuw68l	cmwj7oodb0055l3js8v9wpnko	REGISTER	User	cmwj7oodb0055l3js8v9wpnko	{"actorId": "cmwj7oodb0055l3js8v9wpnko"}	10.52.131.136	\N	2026-11-16 12:00:10.862
cmwj7oons005dl3js3srongc3	cmwj7oodb0055l3js8v9wpnko	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7oodb0055l3js8v9wpnko"}	10.52.30.35	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 12:00:11.224
cmwj7ooon005jl3jszokt52e5	cmwj7oodb0055l3js8v9wpnko	HOUSEHOLD_CREATED	Household	cmwj7ooo9005fl3jsxlnyeoax	{"name": "Suspension Test Household", "actorId": "cmwj7oodb0055l3js8v9wpnko"}	\N	\N	2026-11-16 12:00:11.256
cmwj7ravm0077l3jsyzea6zgc	\N	LOGOUT	\N	\N	{"actorId": "system"}	::1	\N	2026-11-16 12:02:13.33
cmwj7ooq0005ll3jst326tpzv	cmwj4nyub0000l3ic1cbm4scv	USER_SUSPENDED	User	cmwj7oodb0055l3js8v9wpnko	{"reason": "Controlled audit suspension test", "actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "SUSPENDED", "targetEmail": "cust-susp-1794830410495@pilot.com", "previousStatus": "ACTIVE"}	\N	\N	2026-11-16 12:00:11.304
cmwj7oos7005nl3js4wq87yhj	cmwj4nyub0000l3ic1cbm4scv	USER_REACTIVATED	User	cmwj7oodb0055l3js8v9wpnko	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "newStatus": "ACTIVE", "targetEmail": "cust-susp-1794830410495@pilot.com", "previousStatus": "SUSPENDED"}	\N	\N	2026-11-16 12:00:11.383
cmwj7oou8005pl3jsvkjz34wy	\N	SUPPORT_HOUSEHOLD_INSPECTED	Household	hh-sharma-family	{"actorId": "user-support-1", "actorRole": "SUPPORT", "accessedAt": "2026-11-16T12:00:11.449Z", "householdName": "Sharma Family", "supportReason": "Valid ticket #9901: pantry sync issue"}	\N	\N	2026-11-16 12:00:11.456
cmwj7op45005ul3jsu7yfa0r1	cmwj7op3r005ql3jsb2wkt4j7	REGISTER	User	cmwj7op3r005ql3jsb2wkt4j7	{"actorId": "cmwj7op3r005ql3jsb2wkt4j7"}	10.52.106.185	\N	2026-11-16 12:00:11.813
cmwj7opdt005yl3jsok5lmypx	cmwj7op3r005ql3jsb2wkt4j7	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7op3r005ql3jsb2wkt4j7"}	10.52.11.86	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 12:00:12.162
cmwj7opfc0062l3jsnidf0bow	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj7opeb0060l3jsb1xxbqks	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj7op3r005ql3jsb2wkt4j7", "businessName": "Alpha Grocers 1794830412167", "applicantEmail": "reta-1794830411477@merchant.com"}	\N	\N	2026-11-16 12:00:12.216
cmwj7opox0067l3js39v8909m	cmwj7opoi0063l3jsb4gz7quy	REGISTER	User	cmwj7opoi0063l3jsb4gz7quy	{"actorId": "cmwj7opoi0063l3jsb4gz7quy"}	10.52.33.63	\N	2026-11-16 12:00:12.561
cmwj7opyr006bl3jsgcvfumum	cmwj7opoi0063l3jsb4gz7quy	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7opoi0063l3jsb4gz7quy"}	10.52.43.52	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 12:00:12.915
cmwj7oq09006fl3js3uko5sdo	cmwj4nyub0000l3ic1cbm4scv	RETAILER_APPROVED	RetailerApplication	cmwj7opz8006dl3jsbvrnezjs	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "applicantId": "cmwj7opoi0063l3jsb4gz7quy", "businessName": "Beta Provisions 1794830412920", "applicantEmail": "retb-1794830412220@merchant.com"}	\N	\N	2026-11-16 12:00:12.97
cmwj7oq9w006jl3jsncnwq23h	cmwj7op3r005ql3jsb2wkt4j7	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7op3r005ql3jsb2wkt4j7"}	10.52.145.167	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 12:00:13.317
cmwj7oqjc006nl3jspjkuthbl	cmwj7opoi0063l3jsb4gz7quy	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7opoi0063l3jsb4gz7quy"}	10.52.184.47	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 12:00:13.656
cmwj7oquc006ql3jsj2wd32lx	cmwj4nyub0000l3ic1cbm4scv	STAFF_CREATED	User	cmwj7oqu3006ol3jscxsley7w	{"actorId": "cmwj4nyub0000l3ic1cbm4scv", "staffEmail": "selfreview-1794830413706@rasoi.internal", "assignedRole": "ADMIN"}	\N	\N	2026-11-16 12:00:14.052
cmwj7or40006ul3js6titr636	cmwj7oqu3006ol3jscxsley7w	LOGIN_SUCCESS	\N	\N	{"actorId": "cmwj7oqu3006ol3jscxsley7w"}	10.52.143.139	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 12:00:14.4
cmwj7oren0071l3jsz32ui1e3	cmwj7ore8006xl3jslfdqmo7e	REGISTER	User	cmwj7ore8006xl3jslfdqmo7e	{"actorId": "cmwj7ore8006xl3jslfdqmo7e"}	10.52.59.44	\N	2026-11-16 12:00:14.783
cmwj7orft0002l3eg4xu97dsj	\N	AUDIT_IMMUTABILITY_TEST	SecurityTest	test-sec-1	{"test": "initial value", "timestamp": "2026-11-16T12:00:14.823Z", "immutableCheck": true}	\N	\N	2026-11-16 12:00:14.825
\.


--
-- Data for Name: Basket; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Basket" (id, "householdId", "selectedRetailerId", "subtotalInr", "deliveryFeeInr", "totalInr", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BasketItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BasketItem" (id, "basketId", "productVariantId", "quantityPacks", "isSelectedForPurchase", "availableAtHome") FROM stdin;
\.


--
-- Data for Name: EmailVerificationToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmailVerificationToken" (id, "userId", "tokenHash", "expiresAt", "consumedAt", "createdAt") FROM stdin;
cmwj4rt310002l32w53qa8xw0	cmwj4rt2s0000l32wbc1f7nfy	ea42551044ed3435693e065e5a71d4126fbfa168350f4afd3cdfba47885a6270	2026-11-16 11:08:38.073	\N	2026-11-16 10:38:38.077
cmwj4s4sl0007l32wdzf4y51k	cmwj4s4se0005l32w7q19yt5l	58d7c55073a0bc326eb51f47e0751de28c871eea99109434520fc3ac331175b9	2026-11-16 11:08:53.25	\N	2026-11-16 10:38:53.254
cmwj4tzue0002l3rcr71qryg1	cmwj4tzu40000l3rcqmpkfu8l	58ba28cc0dec9b26a6078d7840b29f311ba9f729d876fa663d00b56fe1c169c4	2026-11-16 11:10:20.144	\N	2026-11-16 10:40:20.15
cmwj4vquf0011l3rcg0h7udsw	cmwj4vqu8000zl3rcxghmhy5s	487f8a25d8dd01ac16f5f57a63d8d42b040c4cf8189e491acb88e2c62c335342	2026-11-16 11:11:41.797	\N	2026-11-16 10:41:41.799
cmwj4yei2005il3rc6lxrixxp	cmwj4yehu005gl3rcm5kmhc9c	d6179dab1fc6800a844b059aa593c0f044f6abc19cea59a36ed6690392f8ad22	2026-11-16 11:13:45.768	\N	2026-11-16 10:43:45.77
cmwj58zas006bl3rczo8l729z	cmwj58zak0069l3rc3wksnuya	95507f7d2489fff182d66353565bd6f7324e42dfeead1f8c2c73ab6eb0f2d0c4	2026-11-16 11:21:59.282	\N	2026-11-16 10:51:59.284
cmwj5dzzp0002l30859zz6d1h	cmwj5dzzh0000l3087zcubc03	beb50c6f781a4de1c86a28de494796319ebf271ec0b3aa1777703c636f63ac9b	2026-11-16 11:25:53.454	\N	2026-11-16 10:55:53.461
cmwj5gpik004jl308p04b68j0	cmwj5gpi9004hl308a296szof	df073d5fa355cc645445505ce01d0989f964f015a63f5877cf2c8c491ff3ae2f	2026-11-16 11:27:59.847	\N	2026-11-16 10:57:59.852
cmwj5wmc50002l31w28w9b660	cmwj5wmbu0000l31w7jzpotps	73957c6224a43f0dedb9751b89cbf9854a75d610443e61ff8891275577246748	2026-11-16 11:40:22.224	\N	2026-11-16 11:10:22.23
cmwj69hl9000xl31w59dyrozk	cmwj69hkz000vl31wlw6uv5rv	2c692e004057d550dd80c98059ce905b50c37dd692c94b00a77103f088cf272b	2026-11-16 11:50:22.595	\N	2026-11-16 11:20:22.605
cmwj69jw8001rl31wi4cv2rcr	cmwj69jw1001pl31wlxz9v75z	a060b474c14a4284552bdbcdead3f846914d006756606ab28c19b960c0ed95ec	2026-11-16 11:50:25.581	\N	2026-11-16 11:20:25.592
cmwj6a0od002gl31w478jby6e	cmwj6a0o7002el31w6imlht2w	aa1ae73223a24466761777160c419a61ba67036d198b5adfc559706be390f084	2026-11-16 11:50:47.331	\N	2026-11-16 11:20:47.342
cmwj6a2xr003al31wnhsbptq0	cmwj6a2xj0038l31wu1m3t9lt	295da3b6cef0fe1e8b6c27b4f80e746c734488d353214be278cda09509055aaa	2026-11-16 11:50:50.261	\N	2026-11-16 11:20:50.272
cmwj6a4ex0045l31wsvuu7nwf	cmwj6a4eq0043l31wuhrlhgy6	6d296b9987aa467f32360550710f954af2a4c3bba089a3151fe67ad7f40b39db	2026-11-16 11:50:52.175	\N	2026-11-16 11:20:52.186
cmwj6a4yr004kl31wy35sz0td	cmwj6a4yl004il31w4i1kjtj0	f5d93dbc2c6b43539769be0fbebcb5ddeaa306865350a5d51ed5c95b856d684f	2026-11-16 11:50:52.889	\N	2026-11-16 11:20:52.9
cmwj6a5xh004zl31we17gd659	cmwj6a5x9004xl31w884y0tym	3dd3534ad19ee2cbb317386949498270f637c0456cf0af7c087fe725dfc8e870	2026-11-16 11:50:54.139	\N	2026-11-16 11:20:54.149
cmwj6a6q7005el31wvd83psty	cmwj6a6q1005cl31wjzejax5n	eec7e70216fd2bef6eb1b87c7c7668c551529c229ff09525626e02cb84c98aa2	2026-11-16 11:50:55.172	\N	2026-11-16 11:20:55.183
cmwj6a7do005tl31wfidnij7x	cmwj6a7di005rl31wsf3ezgrh	1978ea73591b0d29c633aec2730363b21b5446c08075d716279fdcf48137d3ea	2026-11-16 11:50:56.019	\N	2026-11-16 11:20:56.029
cmwj6fsba0002l3rckqs9p2vt	cmwj6fsb00000l3rc0jdk9bkv	f6c6b8c80462467d3ef892d02eb07c05ef14f389b1dee082ecb883e615cfc888	2026-11-16 11:55:16.435	\N	2026-11-16 11:25:16.438
cmwj6fusd000wl3rckxpjwd1t	cmwj6fus4000ul3rcb7neh4zk	8c68e83e14fa50699eb8f99b92c3ee9b463997d6a3593e7c2ebf2b29a27a6013	2026-11-16 11:55:19.642	\N	2026-11-16 11:25:19.645
cmwj6fw6z001rl3rcji1we7f4	cmwj6fw6s001pl3rc4beefuss	2413f7b0ed0a273998002b2bf4f381f4bf84b69d1147a39b24d719ef3f486022	2026-11-16 11:55:21.464	\N	2026-11-16 11:25:21.467
cmwj6fwrt0026l3rcr9snvapk	cmwj6fwrk0024l3rcjrrzd6kw	bae0b4a670b1aa55d97bf60fe180999c205f29e57252be139ae6e2cfefda68a4	2026-11-16 11:55:22.214	\N	2026-11-16 11:25:22.217
cmwj6fxsg002ll3rcdluycavp	cmwj6fxs9002jl3rcumdxv2q8	e93a9befa1e441c0dfe9245390da7059370d30553d9317017179c2f302716bd7	2026-11-16 11:55:23.533	\N	2026-11-16 11:25:23.536
cmwj6fyga0034l3rcbpkrv9gq	cmwj6fyg50032l3rcif9xvg5z	cb8eac3bc93931134945a3123ca9d27175910c1bcbd08e17ca9a4d66e69349c2	2026-11-16 11:55:24.392	\N	2026-11-16 11:25:24.395
cmwj6fz2z003nl3rc0m1sspog	cmwj6fz2s003ll3rc0ijbu111	5398aefdbf69daa2931fe1aeed39cc8e25ddd8b939b99e09c7503eda1f560af8	2026-11-16 11:55:25.209	\N	2026-11-16 11:25:25.212
cmwj6i1mt0002l3y8y56cy5qv	cmwj6i1mh0000l3y89i7lmtz5	65c7212a108790e3af822d39e28eb7c15ffd6709768308cfff6b3b14dc7d88f9	2026-11-16 11:57:01.813	\N	2026-11-16 11:27:01.829
cmwj6i45p000wl3y8c6c8pyuf	cmwj6i45g000ul3y88a15dh2l	644a6d917002174053432504d2d3c6be615e55e66fbdebd6c0219efd63cf5aa8	2026-11-16 11:57:05.087	\N	2026-11-16 11:27:05.102
cmwj6i5lf001rl3y8b8hnzljj	cmwj6i5l7001pl3y8mka3cba2	85084261696b1a6edb07c041e398f6d5c8dd2d799ea2ba0d7d4908d74dcc246a	2026-11-16 11:57:06.949	\N	2026-11-16 11:27:06.963
cmwj6i6a60026l3y8wg1g8q9u	cmwj6i69z0024l3y82xdd2a3j	5e78ad296c2b08c0283fd10c520473b627d928deaf988020b1dff8952a5b108b	2026-11-16 11:57:07.84	\N	2026-11-16 11:27:07.854
cmwj6i7b3002ll3y8p0ej3kn6	cmwj6i7ax002jl3y8cvctzzmw	877d279ab41bf1a9e86f2b13761473d84f8fb3fbad1200b82bcaae0354f4dd13	2026-11-16 11:57:09.17	\N	2026-11-16 11:27:09.184
cmwj6i80m0034l3y8h7dbuqgl	cmwj6i80g0032l3y87a4qyxrq	9db66aa0676b3713c1bd9c187b83a3d296206c7a1e8ae10432b0be756ea36abe	2026-11-16 11:57:10.089	\N	2026-11-16 11:27:10.103
cmwj6i8oq003nl3y84bkiv387	cmwj6i8oi003ll3y8ckc7swdj	494db4bca69d61dc6e4e11ce0555e434e39f3c4b64d3ab5b540113b382e2cae4	2026-11-16 11:57:10.955	\N	2026-11-16 11:27:10.97
cmwj7o6kv003ol3jsm5gx7zbc	cmwj7o6ko003ml3jsfxik77ut	a241c177e67f1b5545c6bd7a2d853d793716c5cbcfdf5ef9d57cea50be402bb4	2026-11-16 12:29:47.775	\N	2026-11-16 11:59:47.791
cmwj7o7bn0049l3js6wl9zxjb	cmwj7o7bg0047l3js67k4d347	cf4374a60bc9ba8b6c59e0473463f616cbd34e58a4c1a57784d478e282828ec2	2026-11-16 12:29:48.739	\N	2026-11-16 11:59:48.756
cmwj6lnqi0063l3y88bz2ouq8	cmwj6lnqa0061l3y8x72iose3	45623049263ad03407850e5d3dce8a8d1370b3b76589a1e8d8bf7d426034a9a7	2026-11-16 11:59:50.437	\N	2026-11-16 11:29:50.443
cmwj6lpdv006wl3y8wq2430x2	cmwj6lpdo006ul3y8avmmqk3e	cb989c811295a285594cb0139d853a648702c11a6d9cfb22668046710b5fe887	2026-11-16 11:59:52.573	\N	2026-11-16 11:29:52.579
cmwj6lrue007ql3y8dxewojo2	cmwj6lru7007ol3y8kcaeerkv	eee7fb9a315166d5281010d96f5b0fa5688242a86978bf1ebccd211ca2eb2dbc	2026-11-16 11:59:55.761	\N	2026-11-16 11:29:55.766
cmwj6x73z008dl3y8qz5spcg0	cmwj6x73q008bl3y80mv4nrrt	c8e68c31b41af33c707bf1b2f367d9697f1360f1134037677e5d12a71bee4d18	2026-11-16 12:08:48.765	\N	2026-11-16 11:38:48.767
cmwj6x9u30097l3y855cvtab4	cmwj6x9tt0095l3y8z0swl428	12a98ec10683b0393bb975a158b873ebfb9713e5bf989a3739288bac01e1ccbd	2026-11-16 12:08:52.297	\N	2026-11-16 11:38:52.3
cmwj6xbbm00a2l3y8bshvpb02	cmwj6xbbf00a0l3y8gyrqt637	f95c57e1ce5a1ef6dc33b9410ad66f3611e88f72700598318bafd64ea48f51ce	2026-11-16 12:08:54.225	\N	2026-11-16 11:38:54.226
cmwj6xbyh00ahl3y8jth0rm7z	cmwj6xbyb00afl3y8paohnqpl	b811d8e545a8ca4d15e31d0486909dd3162bfce09ff26a184fed2a27d01886d1	2026-11-16 12:08:55.047	\N	2026-11-16 11:38:55.049
cmwj6xd2300awl3y81lmzmq5n	cmwj6xd1w00aul3y8ll382ry0	2debb731ee8269d70c6b05aca897192a0b7b7ce4c9eb52fb94a0ddc5bd1517b0	2026-11-16 12:08:56.473	\N	2026-11-16 11:38:56.475
cmwj6xdtk00bfl3y86pcpza38	cmwj6xdtd00bdl3y825vovtmm	663592e0bc7e7ab1222d3b1dd95d0e39c8a550a6e63366e9c4a32248155885dd	2026-11-16 12:08:57.462	\N	2026-11-16 11:38:57.464
cmwj6xeiz00byl3y8izgh5mh6	cmwj6xeit00bwl3y8yks7cd7r	fbd9a2698b556778ea8634fdbd7f643464d0ba86d0feafc2ee2ca878c5a7bc14	2026-11-16 12:08:58.377	\N	2026-11-16 11:38:58.38
cmwj7o7w8004ml3jsgt4jk867	cmwj7o7w0004kl3jsjpz2qr0v	d992a318bbcf58f6c950da4fa248a8d34b509335fa385d57736a02c386ffe46a	2026-11-16 12:29:49.48	\N	2026-11-16 11:59:49.496
cmwj7oodi0057l3jstq9ysyyw	cmwj7oodb0055l3js8v9wpnko	99a28f2c905af65341657fef44f892628ab674f954a024eb41da4856d5187e90	2026-11-16 12:30:10.852	\N	2026-11-16 12:00:10.854
cmwj6z4pw00eel3y8skj0bvs6	cmwj6z4po00ecl3y84i7cp32h	bf65bf9661f1293b3a992b5a6f337c6f6763aecb851856691140a7621c4c8fe7	2026-11-16 12:10:18.976	\N	2026-11-16 11:40:18.98
cmwj6z6ho00f7l3y8hojepamo	cmwj6z6hh00f5l3y8wly8d46b	4abda3e2a6f237e477094f4b8a200b4af5fa4f45fd995e454044f4fc222cd699	2026-11-16 12:10:21.272	\N	2026-11-16 11:40:21.276
cmwj6z8yg00g1l3y8514zfs8s	cmwj6z8ya00fzl3y8xja0epch	bde7f778c7e218e8139f68deed4543d3d214c3bc39609a596da852d4bc487fc3	2026-11-16 12:10:24.469	\N	2026-11-16 11:40:24.473
cmwj6zaby00gwl3y8x1u6dzr1	cmwj6zabr00gul3y8iotaejmx	ffcd93a13b03c1ccc897c2def30c6457128dd97a40ac0596ad6857c1e67f4f32	2026-11-16 12:10:26.251	\N	2026-11-16 11:40:26.254
cmwj6zb0i00hbl3y8j0ob792b	cmwj6zb0b00h9l3y8jbf1bxsl	67ca48911ff11864192a655f4c0eda7bdc5254ffc16e8abb16cf359959f77f7c	2026-11-16 12:10:27.134	\N	2026-11-16 11:40:27.138
cmwj6zc1f00hql3y8a05z4339	cmwj6zc1800hol3y8bm6l3skb	2b023ad3ad08010a5422f5710429d7da05630ff482210a935cee2c2c3db3772e	2026-11-16 12:10:28.464	\N	2026-11-16 11:40:28.467
cmwj6zcq400i9l3y8or5yn9ae	cmwj6zcpy00i7l3y8vp2u3gdx	f49f551fe0d37d22cd28ad6d66170134bcf9f1a530e74c2bbf035edcc5cc93a9	2026-11-16 12:10:29.353	\N	2026-11-16 11:40:29.357
cmwj6zde300isl3y8v0l80fz3	cmwj6zddx00iql3y8wulseycc	db932d975067b767956bbfc5bd717f197ad45177861dca2b5b61cc39b5f4d262	2026-11-16 12:10:30.216	\N	2026-11-16 11:40:30.219
cmwj7l1cr0004l3jsmiesw1c0	cmwj7l1cj0002l3jsbgwcbmwx	cdcb8b74570b55782eb44414a6ac6c8497dff30c67fa2daaf558f10dfe94695e	2026-11-16 12:27:21.045	\N	2026-11-16 11:57:21.052
cmwj7lyno000fl3js7v8c61e7	cmwj7lyng000dl3js8tqyxiym	fd9adc8bb309e09d7148d4e416815954e0299e261612c3bb60808edc55f719f2	2026-11-16 12:28:04.207	\N	2026-11-16 11:58:04.213
cmwj7lzg60010l3jsst44eiz2	cmwj7lzfz000yl3jsoax6761b	6f1c3aca6a09f521f7e04796ec4b71beeb5d8c69fbb35805482fb8067f8bef0f	2026-11-16 12:28:05.232	\N	2026-11-16 11:58:05.238
cmwj7m024001dl3jseuo5q5i8	cmwj7m01y001bl3js2hkruhrk	267d0f597bfd14e8d796fffc1cfefc3633a6199253d4b7c1e53ac09c471e3969	2026-11-16 12:28:06.022	\N	2026-11-16 11:58:06.028
cmwj7n0nd0020l3js3ce7udbb	cmwj7n0n7001yl3jsz11tqw4e	af154a36e402bc7c8f1bed0d3e936ade81ceb1fe3d133727d4ae4f967374fe8f	2026-11-16 12:28:53.433	\N	2026-11-16 11:58:53.45
cmwj7n1e6002ll3jsk2nzkat4	cmwj7n1e0002jl3jsh9vx8s87	6142c6641e70c9c2201fe328f6c35ea4bfa83c131d56fa4b31e37c22df82ee16	2026-11-16 12:28:54.398	\N	2026-11-16 11:58:54.415
cmwj7n1z1002yl3js9jjad9mv	cmwj7n1yu002wl3jsr6auh782	56b621cc5f2816c89c47e9822b4570665b3dce01a7ba3fdb1537900f770b768d	2026-11-16 12:28:55.148	\N	2026-11-16 11:58:55.165
cmwj7n382003jl3js848vwt1o	cmwj7n37w003hl3jsck0kq2ij	3c7a04fd0c0e978d8bfdfd4a199279cb4e8217bfd1bd1fa73c90bab01977f7b5	2026-11-16 12:28:56.77	\N	2026-11-16 11:58:56.787
cmwj7op3x005sl3jsx4fz6app	cmwj7op3r005ql3jsb2wkt4j7	6d47b44f0ac5f348925cf95fdc321728a405b88829e37177bebce05e3fdd1128	2026-11-16 12:30:11.804	\N	2026-11-16 12:00:11.806
cmwj7opop0065l3jsgwx9shos	cmwj7opoi0063l3jsb4gz7quy	6683b319dff49651e7053e4a4f0f85bd4b58cfaed88be985b60bc133454de8f4	2026-11-16 12:30:12.552	\N	2026-11-16 12:00:12.553
cmwj7oreg006zl3jsl6o1ofeq	cmwj7ore8006xl3jslfdqmo7e	1d3e86739a7cf56293b826aa4fbde3ef95faeba4c600257ad24d0820770c3cec	2026-11-16 12:30:14.773	\N	2026-11-16 12:00:14.776
\.


--
-- Data for Name: Feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Feedback" (id, "userId", rating, comment, category, "createdAt") FROM stdin;
\.


--
-- Data for Name: Household; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Household" (id, "userId", name, "spiceTolerance", "weeklyBudgetInr", "cookingFrequency", "createdAt", "updatedAt", city, country, "cuisinePreference", "dietaryPreference", locality, size, state) FROM stdin;
hh-mehta-family	user-demo-mehta	Mehta Family	MEDIUM	4500	Daily Fresh	2026-11-16 06:15:05.095	2026-11-16 07:27:44.43	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj6i4i70014l3y81gat7z9n	cmwj6i45g000ul3y88a15dh2l	Victim Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:27:05.551	2026-11-16 11:27:05.551	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj6i5xz001zl3y8f8oiffmr	cmwj6i5l7001pl3y8mka3cba2	Alpha Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:27:07.416	2026-11-16 11:27:07.416	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj6i6mb002el3y88fjm3pxz	cmwj6i69z0024l3y82xdd2a3j	Beta Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:27:08.291	2026-11-16 11:27:08.291	Ahmedabad	India	ALL_INDIAN	JAIN	\N	4	Gujarat
cmwj6i7mb002tl3y85wrix5oj	cmwj6i7ax002jl3y8cvctzzmw	Merchant Family Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:27:09.587	2026-11-16 11:27:09.587	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj6i8ct003cl3y81vk7pkjq	cmwj6i80g0032l3y87a4qyxrq	Pilot Household Alpha	MEDIUM	3500	Daily Fresh	2026-11-16 11:27:10.541	2026-11-16 11:27:11.413	Ahmedabad	India	ALL_INDIAN	JAIN	\N	4	Gujarat
cmwj7ooo9005fl3jsxlnyeoax	cmwj7oodb0055l3js8v9wpnko	Suspension Test Household	MEDIUM	3500	Daily Fresh	2026-11-16 12:00:11.241	2026-11-16 12:00:11.241	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
hh-patel-family	user-demo-patel	Patel Family	MEDIUM	99999	Daily Fresh	2026-11-16 06:15:05.059	2026-11-16 12:02:09.362	Ahmedabad	India	ALL_INDIAN	JAIN	\N	4	Gujarat
hh-sharma-family	user-demo-1	Sharma Family	MEDIUM	4500	Daily Fresh	2026-11-16 06:15:04.99	2026-11-16 12:02:12.749	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj6z99m00g9l3y8oc4q8m3o	cmwj6z8ya00fzl3y8xja0epch	Victim Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:40:24.874	2026-11-16 11:40:24.874	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj6zaox00h4l3y801ndmedm	cmwj6zabr00gul3y8iotaejmx	Alpha Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:40:26.72	2026-11-16 11:40:26.72	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj6ls5q007yl3y84th51utm	cmwj6lru7007ol3y8kcaeerkv	Victim Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:29:56.174	2026-11-16 11:29:56.174	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj6xa86009fl3y877o6hjbl	cmwj6x9tt0095l3y8z0swl428	Victim Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:38:52.806	2026-11-16 11:38:52.806	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj6xbny00aal3y8jpupz2qv	cmwj6xbbf00a0l3y8gyrqt637	Alpha Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:38:54.67	2026-11-16 11:38:54.67	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj6zbbk00hjl3y8j5txhp5n	cmwj6zb0b00h9l3y8jbf1bxsl	Beta Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:40:27.536	2026-11-16 11:40:27.536	Ahmedabad	India	ALL_INDIAN	JAIN	\N	4	Gujarat
cmwj6xc9n00apl3y8mhd0s1w7	cmwj6xbyb00afl3y8paohnqpl	Beta Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:38:55.451	2026-11-16 11:38:55.451	Ahmedabad	India	ALL_INDIAN	JAIN	\N	4	Gujarat
cmwj6zccu00hyl3y8qwb4t047	cmwj6zc1800hol3y8bm6l3skb	Merchant Family Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:40:28.878	2026-11-16 11:40:28.878	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj69k8h001zl31wvc9y7lf3	cmwj69jw1001pl31wlxz9v75z	Victim Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:20:26.033	2026-11-16 11:20:26.033	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj6a38y003il31wdvfyk9bh	cmwj6a2xj0038l31wu1m3t9lt	Victim Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:20:50.674	2026-11-16 11:20:50.674	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj6a4p7004dl31wpez33ln2	cmwj6a4eq0043l31wuhrlhgy6	Alpha Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:20:52.556	2026-11-16 11:20:52.556	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj6a59b004sl31wczqvl6xj	cmwj6a4yl004il31w4i1kjtj0	Beta Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:20:53.279	2026-11-16 11:20:53.279	Ahmedabad	India	ALL_INDIAN	JAIN	\N	4	Gujarat
cmwj6a72d005ml31wets427cr	cmwj6a6q1005cl31wjzejax5n	Pilot Household Alpha	MEDIUM	3500	Daily Fresh	2026-11-16 11:20:55.622	2026-11-16 11:20:56.491	Ahmedabad	India	ALL_INDIAN	JAIN	\N	4	Gujarat
cmwj6xddm00b4l3y84bm9ih1l	cmwj6xd1w00aul3y8ll382ry0	Merchant Family Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:38:56.89	2026-11-16 11:38:56.89	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj6fv3d0014l3rcgo5ufwm1	cmwj6fus4000ul3rcb7neh4zk	Victim Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:25:20.041	2026-11-16 11:25:20.041	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj6fwhf001zl3rc37mmmui6	cmwj6fw6s001pl3rc4beefuss	Alpha Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:25:21.843	2026-11-16 11:25:21.843	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj6fx33002el3rcy6gfv909	cmwj6fwrk0024l3rcjrrzd6kw	Beta Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:25:22.623	2026-11-16 11:25:22.623	Ahmedabad	India	ALL_INDIAN	JAIN	\N	4	Gujarat
cmwj6fy36002tl3rcve501gxq	cmwj6fxs9002jl3rcumdxv2q8	Merchant Family Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:25:23.922	2026-11-16 11:25:23.922	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj6fyrf003cl3rc1n58062c	cmwj6fyg50032l3rcif9xvg5z	Pilot Household Alpha	MEDIUM	3500	Daily Fresh	2026-11-16 11:25:24.795	2026-11-16 11:25:25.672	Ahmedabad	India	ALL_INDIAN	JAIN	\N	4	Gujarat
cmwj6xe6k00bnl3y8iyefsg3n	cmwj6xdtd00bdl3y825vovtmm	Pilot Household Alpha	MEDIUM	3500	Daily Fresh	2026-11-16 11:38:57.932	2026-11-16 11:38:58.881	Ahmedabad	India	ALL_INDIAN	JAIN	\N	4	Gujarat
cmwj6zd1y00ihl3y8tizaztne	cmwj6zcpy00i7l3y8vp2u3gdx	Pilot Household Alpha	MEDIUM	3500	Daily Fresh	2026-11-16 11:40:29.782	2026-11-16 11:40:30.681	Ahmedabad	India	ALL_INDIAN	JAIN	\N	4	Gujarat
cmwj7lyz3000nl3jsd40ge37l	cmwj7lyng000dl3js8tqyxiym	Suspension Test Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:58:04.623	2026-11-16 11:58:04.623	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj7n0y10028l3jse6hvetdf	cmwj7n0n7001yl3jsz11tqw4e	Suspension Test Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:58:53.834	2026-11-16 11:58:53.834	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
cmwj7o6vs003wl3jsm45u62kw	cmwj7o6ko003ml3jsfxik77ut	Suspension Test Household	MEDIUM	3500	Daily Fresh	2026-11-16 11:59:48.184	2026-11-16 11:59:48.184	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
\.


--
-- Data for Name: HouseholdInvitation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."HouseholdInvitation" (id, "householdId", "invitedEmail", "invitedByUserId", "tokenHash", role, "expiresAt", "acceptedAt", "revokedAt", "createdAt") FROM stdin;
cmwj6fysp003il3rc7yoh17w1	cmwj6fyrf003cl3rc1n58062c	invited-1794828324807@pilot.com	cmwj6fyg50032l3rcif9xvg5z	70fff78db7a302d5e463613fa19bf0130d225e599f20d6bf3c615fb500047c17	MEMBER	2026-11-23 11:25:24.838	2026-11-16 11:25:25.625	\N	2026-11-16 11:25:24.841
cmwj6i8e6003il3y8cv930leq	cmwj6i8ct003cl3y81vk7pkjq	invited-1794828430554@pilot.com	cmwj6i80g0032l3y87a4qyxrq	a032f0c22cf4d431b27dd89d3a4d6b3e6a29e1110de3d6805797f941b0cf3a5b	MEMBER	2026-11-23 11:27:10.575	2026-11-16 11:27:11.35	\N	2026-11-16 11:27:10.59
cmwj6xe7t00btl3y8vmh2smg4	cmwj6xe6k00bnl3y8iyefsg3n	invited-1794829137950@pilot.com	cmwj6xdtd00bdl3y825vovtmm	6d3d8b531c2a5e7af3e70cfeba28b4bc088898797d814bc806c59ed0becaf227	MEMBER	2026-11-23 11:38:57.975	2026-11-16 11:38:58.837	\N	2026-11-16 11:38:57.977
cmwj6zd3100inl3y8r17uiyp5	cmwj6zd1y00ihl3y8tizaztne	invited-1794829229796@pilot.com	cmwj6zcpy00i7l3y8vp2u3gdx	833ebcd54cc003a64d5ebe5ac831cfb4a288b087ee54b10b3a524e11d88a09f1	MEMBER	2026-11-23 11:40:29.818	2026-11-16 11:40:30.634	\N	2026-11-16 11:40:29.822
\.


--
-- Data for Name: HouseholdMember; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."HouseholdMember" (id, "householdId", name, "ageGroup", "dietaryPreference", allergies, "dislikedIngredients", "createdAt", "joinedAt", role, status, "userId") FROM stdin;
mem-1	hh-sharma-family	Pooja	adult	VEGETARIAN	{Peanuts}	{"Bitter Gourd"}	2026-11-16 06:15:04.99	2026-11-16 09:32:42.433	MEMBER	ACTIVE	\N
mem-2	hh-sharma-family	Ramesh (Father-in-law)	senior	JAIN	{}	{Onion,Garlic}	2026-11-16 06:15:04.99	2026-11-16 09:32:42.433	MEMBER	ACTIVE	\N
mem-3	hh-sharma-family	Rohan (Husband)	adult	EGGETARIAN	{}	{}	2026-11-16 06:15:04.99	2026-11-16 09:32:42.433	MEMBER	ACTIVE	\N
mem-4	hh-sharma-family	Aarav (Son)	child	VEGETARIAN	{}	{"Spicy Food"}	2026-11-16 06:15:04.99	2026-11-16 09:32:42.433	MEMBER	ACTIVE	\N
mem-patel-1	hh-patel-family	Rameshbhai Patel	senior	JAIN	{}	{Onion,Garlic,Potato,Carrot}	2026-11-16 06:15:05.059	2026-11-16 09:32:42.433	MEMBER	ACTIVE	\N
mem-patel-2	hh-patel-family	Bhavnaben Patel	adult	JAIN	{}	{"Root Vegetables"}	2026-11-16 06:15:05.059	2026-11-16 09:32:42.433	MEMBER	ACTIVE	\N
mem-patel-3	hh-patel-family	Dev Patel	child	JAIN	{}	{"Bitter Gourd"}	2026-11-16 06:15:05.059	2026-11-16 09:32:42.433	MEMBER	ACTIVE	\N
mem-mehta-1	hh-mehta-family	Kirit Mehta	adult	JAIN	{}	{}	2026-11-16 06:15:05.095	2026-11-16 09:32:42.433	MEMBER	ACTIVE	\N
mem-mehta-2	hh-mehta-family	Hetal Mehta	adult	JAIN	{Peanuts}	{}	2026-11-16 06:15:05.095	2026-11-16 09:32:42.433	MEMBER	ACTIVE	\N
mem-mehta-3	hh-mehta-family	Niyati Mehta	child	JAIN	{}	{Karela}	2026-11-16 06:15:05.095	2026-11-16 09:32:42.433	MEMBER	ACTIVE	\N
cmwj69k8n0021l31wvr37se3v	cmwj69k8h001zl31wvc9y7lf3	Victim User	adult	VEGETARIAN	{}	{}	2026-11-16 11:20:26.039	2026-11-16 11:20:26.039	OWNER	ACTIVE	cmwj69jw1001pl31wlxz9v75z
cmwj6a394003kl31wgs9rmj98	cmwj6a38y003il31wdvfyk9bh	Victim User	adult	VEGETARIAN	{}	{}	2026-11-16 11:20:50.68	2026-11-16 11:20:50.68	OWNER	ACTIVE	cmwj6a2xj0038l31wu1m3t9lt
cmwj6a4pc004fl31wpwkfnlje	cmwj6a4p7004dl31wpez33ln2	User One	adult	VEGETARIAN	{}	{}	2026-11-16 11:20:52.561	2026-11-16 11:20:52.561	OWNER	ACTIVE	cmwj6a4eq0043l31wuhrlhgy6
cmwj6a59f004ul31whlyj0ppe	cmwj6a59b004sl31wczqvl6xj	User Two	adult	JAIN	{}	{}	2026-11-16 11:20:53.283	2026-11-16 11:20:53.283	OWNER	ACTIVE	cmwj6a4yl004il31w4i1kjtj0
cmwj6a72i005ol31w88huaizk	cmwj6a72d005ml31wets427cr	Pilot Lead	adult	VEGETARIAN	{}	{}	2026-11-16 11:20:55.626	2026-11-16 11:20:55.626	OWNER	ACTIVE	cmwj6a6q1005cl31wjzejax5n
cmwj6fv3i0016l3rc7z23xuf8	cmwj6fv3d0014l3rcgo5ufwm1	Victim User	adult	VEGETARIAN	{}	{}	2026-11-16 11:25:20.046	2026-11-16 11:25:20.046	OWNER	ACTIVE	cmwj6fus4000ul3rcb7neh4zk
cmwj6fwhk0021l3rcv8sz2m8s	cmwj6fwhf001zl3rc37mmmui6	User One	adult	VEGETARIAN	{}	{}	2026-11-16 11:25:21.849	2026-11-16 11:25:21.849	OWNER	ACTIVE	cmwj6fw6s001pl3rc4beefuss
cmwj6fx36002gl3rctmbjzgyu	cmwj6fx33002el3rcy6gfv909	User Two	adult	JAIN	{}	{}	2026-11-16 11:25:22.627	2026-11-16 11:25:22.627	OWNER	ACTIVE	cmwj6fwrk0024l3rcjrrzd6kw
cmwj6fy39002vl3rczyvtd1bu	cmwj6fy36002tl3rcve501gxq	Merchant Customer	adult	VEGETARIAN	{}	{}	2026-11-16 11:25:23.926	2026-11-16 11:25:23.926	OWNER	ACTIVE	cmwj6fxs9002jl3rcumdxv2q8
cmwj6fyri003el3rcpgz68jlt	cmwj6fyrf003cl3rc1n58062c	Pilot Lead	adult	VEGETARIAN	{}	{}	2026-11-16 11:25:24.798	2026-11-16 11:25:24.798	OWNER	ACTIVE	cmwj6fyg50032l3rcif9xvg5z
cmwj6fzeo003vl3rcjed38824	cmwj6fyrf003cl3rc1n58062c	Aarav Patel	adult	VEGETARIAN	{}	{}	2026-11-16 11:25:25.63	2026-11-16 11:25:25.63	MEMBER	ACTIVE	cmwj6fz2s003ll3rc0ijbu111
cmwj6i4ie0016l3y8chdqjbf2	cmwj6i4i70014l3y81gat7z9n	Victim User	adult	VEGETARIAN	{}	{}	2026-11-16 11:27:05.558	2026-11-16 11:27:05.558	OWNER	ACTIVE	cmwj6i45g000ul3y88a15dh2l
cmwj6i5y60021l3y8ebptcm9j	cmwj6i5xz001zl3y8f8oiffmr	User One	adult	VEGETARIAN	{}	{}	2026-11-16 11:27:07.422	2026-11-16 11:27:07.422	OWNER	ACTIVE	cmwj6i5l7001pl3y8mka3cba2
cmwj6i6mf002gl3y8mytx2ie4	cmwj6i6mb002el3y88fjm3pxz	User Two	adult	JAIN	{}	{}	2026-11-16 11:27:08.296	2026-11-16 11:27:08.296	OWNER	ACTIVE	cmwj6i69z0024l3y82xdd2a3j
cmwj6i7mf002vl3y8i2eyjxgm	cmwj6i7mb002tl3y85wrix5oj	Merchant Customer	adult	VEGETARIAN	{}	{}	2026-11-16 11:27:09.592	2026-11-16 11:27:09.592	OWNER	ACTIVE	cmwj6i7ax002jl3y8cvctzzmw
cmwj6i8cx003el3y85cx3swby	cmwj6i8ct003cl3y81vk7pkjq	Pilot Lead	adult	VEGETARIAN	{}	{}	2026-11-16 11:27:10.545	2026-11-16 11:27:10.545	OWNER	ACTIVE	cmwj6i80g0032l3y87a4qyxrq
cmwj6i8zs003vl3y8tbiie4u2	cmwj6i8ct003cl3y81vk7pkjq	Aarav Patel	adult	VEGETARIAN	{}	{}	2026-11-16 11:27:11.367	2026-11-16 11:27:11.367	MEMBER	ACTIVE	cmwj6i8oi003ll3y8ckc7swdj
cmwj6ls5v0080l3y8r4sinnsu	cmwj6ls5q007yl3y84th51utm	Victim User	adult	VEGETARIAN	{}	{}	2026-11-16 11:29:56.179	2026-11-16 11:29:56.179	OWNER	ACTIVE	cmwj6lru7007ol3y8kcaeerkv
cmwj6xa8b009hl3y8u24t62lm	cmwj6xa86009fl3y877o6hjbl	Victim User	adult	VEGETARIAN	{}	{}	2026-11-16 11:38:52.811	2026-11-16 11:38:52.811	OWNER	ACTIVE	cmwj6x9tt0095l3y8z0swl428
cmwj6xbo100acl3y8942ycv4n	cmwj6xbny00aal3y8jpupz2qv	User One	adult	VEGETARIAN	{}	{}	2026-11-16 11:38:54.673	2026-11-16 11:38:54.673	OWNER	ACTIVE	cmwj6xbbf00a0l3y8gyrqt637
cmwj6xc9r00arl3y838875t91	cmwj6xc9n00apl3y8mhd0s1w7	User Two	adult	JAIN	{}	{}	2026-11-16 11:38:55.455	2026-11-16 11:38:55.455	OWNER	ACTIVE	cmwj6xbyb00afl3y8paohnqpl
cmwj6xddp00b6l3y8zim9bpxt	cmwj6xddm00b4l3y84bm9ih1l	Merchant Customer	adult	VEGETARIAN	{}	{}	2026-11-16 11:38:56.893	2026-11-16 11:38:56.893	OWNER	ACTIVE	cmwj6xd1w00aul3y8ll382ry0
cmwj6xe6o00bpl3y83ef0fmtt	cmwj6xe6k00bnl3y8iyefsg3n	Pilot Lead	adult	VEGETARIAN	{}	{}	2026-11-16 11:38:57.937	2026-11-16 11:38:57.937	OWNER	ACTIVE	cmwj6xdtd00bdl3y825vovtmm
cmwj6xevs00c6l3y8a55un1dt	cmwj6xe6k00bnl3y8iyefsg3n	Aarav Patel	adult	VEGETARIAN	{}	{}	2026-11-16 11:38:58.839	2026-11-16 11:38:58.839	MEMBER	ACTIVE	cmwj6xeit00bwl3y8yks7cd7r
cmwj6z99p00gbl3y8c9aitvdm	cmwj6z99m00g9l3y8oc4q8m3o	Victim User	adult	VEGETARIAN	{}	{}	2026-11-16 11:40:24.877	2026-11-16 11:40:24.877	OWNER	ACTIVE	cmwj6z8ya00fzl3y8xja0epch
cmwj6zap200h6l3y8z145wl0z	cmwj6zaox00h4l3y801ndmedm	User One	adult	VEGETARIAN	{}	{}	2026-11-16 11:40:26.727	2026-11-16 11:40:26.727	OWNER	ACTIVE	cmwj6zabr00gul3y8iotaejmx
cmwj6zbbn00hll3y8wvicacye	cmwj6zbbk00hjl3y8j5txhp5n	User Two	adult	JAIN	{}	{}	2026-11-16 11:40:27.539	2026-11-16 11:40:27.539	OWNER	ACTIVE	cmwj6zb0b00h9l3y8jbf1bxsl
cmwj6zccy00i0l3y8hxzpd2ec	cmwj6zccu00hyl3y8qwb4t047	Merchant Customer	adult	VEGETARIAN	{}	{}	2026-11-16 11:40:28.882	2026-11-16 11:40:28.882	OWNER	ACTIVE	cmwj6zc1800hol3y8bm6l3skb
cmwj6zd2100ijl3y89gpomka1	cmwj6zd1y00ihl3y8tizaztne	Pilot Lead	adult	VEGETARIAN	{}	{}	2026-11-16 11:40:29.785	2026-11-16 11:40:29.785	OWNER	ACTIVE	cmwj6zcpy00i7l3y8vp2u3gdx
cmwj6zdpr00j0l3y8535j9b1m	cmwj6zd1y00ihl3y8tizaztne	Aarav Patel	adult	VEGETARIAN	{}	{}	2026-11-16 11:40:30.639	2026-11-16 11:40:30.639	MEMBER	ACTIVE	cmwj6zddx00iql3y8wulseycc
cmwj7lyz8000pl3jsgt2i21t3	cmwj7lyz3000nl3jsd40ge37l	Suspension Test Customer	adult	VEGETARIAN	{}	{}	2026-11-16 11:58:04.628	2026-11-16 11:58:04.628	OWNER	ACTIVE	cmwj7lyng000dl3js8tqyxiym
cmwj7n0y6002al3jss2nnra43	cmwj7n0y10028l3jse6hvetdf	Suspension Test Customer	adult	VEGETARIAN	{}	{}	2026-11-16 11:58:53.838	2026-11-16 11:58:53.838	OWNER	ACTIVE	cmwj7n0n7001yl3jsz11tqw4e
cmwj7o6vw003yl3jsju5g8bvx	cmwj7o6vs003wl3jsm45u62kw	Suspension Test Customer	adult	VEGETARIAN	{}	{}	2026-11-16 11:59:48.188	2026-11-16 11:59:48.188	OWNER	ACTIVE	cmwj7o6ko003ml3jsfxik77ut
cmwj7oood005hl3jsh92lvoek	cmwj7ooo9005fl3jsxlnyeoax	Suspension Test Customer	adult	VEGETARIAN	{}	{}	2026-11-16 12:00:11.246	2026-11-16 12:00:11.246	OWNER	ACTIVE	cmwj7oodb0055l3js8v9wpnko
\.


--
-- Data for Name: Ingredient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Ingredient" (id, name, "hindiName", category, "standardUnit", "shelfLifeDays", "isJainPermissible") FROM stdin;
ing-paneer	Paneer	पनीर	Dairy & Eggs	g	7	t
ing-milk	Cow Milk	दूध	Dairy & Eggs	ml	3	t
ing-curd	Curd (Dahi)	दही	Dairy & Eggs	g	5	t
ing-ghee	Desi Cow Ghee	देसी घी	Oils & Ghee	g	180	t
ing-butter	White / Salted Butter	मक्खन	Dairy & Eggs	g	30	t
ing-eggs	Farm Eggs	अंडे	Dairy & Eggs	piece	14	f
ing-chicken	Chicken Breast / Curry Cut	चिकन	Meat & Poultry	g	2	f
ing-fish	Fresh Rohu / Catla Fish	मछली	Meat & Poultry	g	2	f
ing-basmati-rice	Basmati Rice	बासमती चावल	Grains & Atta	g	365	t
ing-atta	Whole Wheat Atta	गेहूं का आटा	Grains & Atta	g	90	t
ing-poha	Thick Poha (Flattened Rice)	पोहा	Grains & Atta	g	120	t
ing-besan	Besan (Gram Flour)	बेसन	Grains & Atta	g	180	t
ing-rava	Sooji / Rava (Semolina)	सूजी / रवा	Grains & Atta	g	90	t
ing-dosa-batter	Fermented Idli/Dosa Batter	डोसा बैटर	Grains & Atta	ml	5	t
ing-toor-dal	Toor Dal (Pigeon Pea)	अरहर / तूर दाल	Lentils & Pulses	g	365	t
ing-moong-dal	Yellow Moong Dal	मूंग दाल	Lentils & Pulses	g	365	t
ing-rajma	Kashmiri Rajma	राजमा	Lentils & Pulses	g	365	t
ing-chana-dal	Chana Dal	चना दाल	Lentils & Pulses	g	365	t
ing-urad-dal	Urad Dal Gota	उड़द दाल	Lentils & Pulses	g	365	t
ing-kabuli-chana	Kabuli Chana (Chickpeas)	काबुली चना	Lentils & Pulses	g	365	t
ing-onion	Red Onion	प्याज	Produce	g	20	f
ing-tomato	Ripe Red Tomato	टमाटर	Produce	g	7	t
ing-garlic	Garlic Pods	लहसुन	Produce	g	30	f
ing-ginger	Fresh Ginger Root	अदरक	Produce	g	14	f
ing-green-chilli	Spicy Green Chillies	हरी मिर्च	Produce	g	10	t
ing-coriander	Fresh Coriander (Dhaniya)	हरा धनिया	Produce	bunch	5	t
ing-curry-leaves	Fresh Curry Leaves	कढ़ी पत्ता	Produce	bunch	7	t
ing-potato	Desi Potato (Aloo)	आलू	Produce	g	30	f
ing-palak	Fresh Palak (Spinach)	पालक	Produce	g	4	t
ing-fenugreek	Fresh Methi Leaves	ताजा मेथी	Produce	g	4	t
ing-cauliflower	Fresh Cauliflower (Gobi)	फूलगोभी	Produce	g	5	t
ing-bhindi	Fresh Ladyfinger (Bhindi)	भिंडी	Produce	g	5	t
ing-baingan	Round Bharta Eggplant (Baingan)	बैंगन	Produce	g	7	t
ing-lemon	Juicy Yellow Lemon	नींबू	Produce	piece	14	t
ing-peanuts	Raw Peanuts	मूंगफली	Produce	g	180	t
ing-turmeric	Turmeric Powder (Haldi)	हल्दी पाउडर	Spices & Masalas	g	365	t
ing-red-chilli-powder	Kashmiri Red Chilli Powder	लाल मिर्च पाउडर	Spices & Masalas	g	365	t
ing-coriander-powder	Dhaniya Powder	धनिया पाउडर	Spices & Masalas	g	365	t
ing-garam-masala	Garam Masala Blend	गरम मसाला	Spices & Masalas	g	365	t
ing-sambar-powder	Madras Sambar Powder	सांभर मसाला	Spices & Masalas	g	180	t
ing-chole-masala	Amritsari Chole Masala	छोले मसाला	Spices & Masalas	g	365	t
ing-mustard-seeds	Black Mustard Seeds (Rai)	राई	Spices & Masalas	g	365	t
ing-cumin-seeds	Cumin Seeds (Jeera)	जीरा	Spices & Masalas	g	365	t
ing-kasuri-methi	Dried Kasuri Methi	कसूरी मेथी	Spices & Masalas	g	365	t
ing-salt	Iodized Salt	नमक	Pantry Staples	g	730	t
ing-oil	Cold-Pressed Mustard / Sunflower Oil	कुकिंग तेल	Oils & Ghee	ml	365	t
ing-jaggery	Organic Jaggery (Gud)	गुड़	Pantry Staples	g	365	t
ing-sev	Nylon Sev / Ratlami Sev	सेव	Snacks & Bakery	g	90	t
ing-bajra-flour	Bajra (Pearl Millet) Flour	बाजरे का आटा	Grains & Atta	g	90	t
ing-surti-papdi	Fresh Surti Papdi (Flat Beans)	सुरती पापड़ी	Produce	g	5	t
ing-tuver-lilva	Fresh Tuver Lilva (Green Pigeon Peas)	तुवर लिलवा	Produce	g	5	t
ing-purple-yam	Kand / Purple Yam (Ratalu)	रतालू / कंद	Produce	g	14	f
ing-raw-banana	Kacha Kela (Raw Green Banana)	कच्चा केला	Produce	g	7	t
ing-buttermilk	Chhaas / Spiced Buttermilk	छाछ	Dairy & Eggs	ml	4	t
ing-sesame-seeds	White Sesame Seeds (Safed Til)	सफेद तिल	Spices & Masalas	g	365	t
ing-ajwain	Ajwain (Carom Seeds)	अजवाइन	Spices & Masalas	g	365	t
ing-hing	Asafoetida (Hing Powder)	हींग	Spices & Masalas	g	365	t
\.


--
-- Data for Name: MealPlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MealPlan" (id, "householdId", "weekStartDate", "createdAt", "updatedAt") FROM stdin;
mp-hh-sharma-family	hh-sharma-family	2026-11-16 06:46:00.145	2026-11-16 06:46:00.152	2026-11-16 06:46:00.152
mp-cmwj6fyrf003cl3rc1n58062c	cmwj6fyrf003cl3rc1n58062c	2026-11-16 11:25:25.718	2026-11-16 11:25:25.721	2026-11-16 11:25:25.721
mp-cmwj6i8ct003cl3y81vk7pkjq	cmwj6i8ct003cl3y81vk7pkjq	2026-11-16 11:27:11.457	2026-11-16 11:27:11.471	2026-11-16 11:27:11.471
mp-cmwj6xe6k00bnl3y8iyefsg3n	cmwj6xe6k00bnl3y8iyefsg3n	2026-11-16 11:38:58.924	2026-11-16 11:38:58.925	2026-11-16 11:38:58.925
mp-cmwj6zd1y00ihl3y8tizaztne	cmwj6zd1y00ihl3y8tizaztne	2026-11-16 11:40:30.725	2026-11-16 11:40:30.728	2026-11-16 11:40:30.728
\.


--
-- Data for Name: MealPlanItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MealPlanItem" (id, "mealPlanId", "dayOfWeek", "mealCategory", "recipeId", servings, notes) FROM stdin;
plan-item-1794828325714-zb1b	mp-cmwj6fyrf003cl3rc1n58062c	Monday	Lunch	recipe-gujarati-khatti-meethi-dal	4	\N
plan-item-1794828431452-67yv	mp-cmwj6i8ct003cl3y81vk7pkjq	Monday	Lunch	recipe-gujarati-khatti-meethi-dal	4	\N
plan-item-1794829138921-yssq	mp-cmwj6xe6k00bnl3y8iyefsg3n	Monday	Lunch	recipe-gujarati-khatti-meethi-dal	4	\N
plan-item-1794829230722-7av3	mp-cmwj6zd1y00ihl3y8tizaztne	Monday	Lunch	recipe-gujarati-khatti-meethi-dal	4	\N
plan-item-1794830528911-mm7ry	mp-hh-sharma-family	monday	breakfast	recipe-methi-thepla	4	\N
plan-item-1794830528911-a988y	mp-hh-sharma-family	monday	lunch	recipe-rajma-chawal	4	\N
plan-item-1794830528911-g0lr5	mp-hh-sharma-family	monday	dinner	recipe-palak-paneer	4	\N
plan-item-1794830528911-ebdu8	mp-hh-sharma-family	tuesday	breakfast	recipe-idli-sambar	4	\N
plan-item-1794830528911-b14ky	mp-hh-sharma-family	tuesday	lunch	recipe-amritsari-chole	4	\N
plan-item-1794830528911-ntidq	mp-hh-sharma-family	tuesday	dinner	recipe-dal-tadka	4	\N
plan-item-1794830528911-hu8mp	mp-hh-sharma-family	wednesday	breakfast	recipe-kanda-poha	4	\N
plan-item-1794830528911-dor25	mp-hh-sharma-family	wednesday	dinner	recipe-aloo-gobi	4	\N
plan-item-1794830528911-os5q1	mp-hh-sharma-family	thursday	breakfast	recipe-khaman-dhokla	4	\N
plan-item-1794830528911-ykfz2	mp-hh-sharma-family	thursday	lunch	recipe-sambhar-rice	4	\N
plan-item-1794830528911-s7une	mp-hh-sharma-family	thursday	dinner	recipe-bhindi-masala	4	\N
plan-item-1794830528911-4otne	mp-hh-sharma-family	friday	breakfast	recipe-rava-upma	4	\N
plan-item-1794830528911-5a82t	mp-hh-sharma-family	friday	lunch	recipe-gujarati-khatti-meethi-dal	4	\N
plan-item-1794830528911-bsxv0	mp-hh-sharma-family	friday	dinner	recipe-baingan-bharta	4	\N
plan-item-1794830528911-8lq6s	mp-hh-sharma-family	saturday	breakfast	recipe-gujarati-handvo	4	\N
plan-item-1794830528911-fhsm5	mp-hh-sharma-family	saturday	lunch	recipe-paneer-butter-masala	4	\N
plan-item-1794830528911-x5hni	mp-hh-sharma-family	saturday	dinner	recipe-ringna-no-olo	4	\N
plan-item-1794830528911-n51np	mp-hh-sharma-family	sunday	breakfast	recipe-masala-dosa	4	\N
plan-item-1794830528911-15ycd	mp-hh-sharma-family	sunday	lunch	recipe-surati-undhiyu	4	\N
plan-item-1794830528911-w3lsf	mp-hh-sharma-family	sunday	dinner	recipe-moong-dal-khichdi	4	\N
plan-item-1794830528911-h8xs6	mp-hh-sharma-family	wednesday	lunch	recipe-paneer-butter-masala	4	\N
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "userId", "retailerName", status, "totalAmountInr", "deliveryFeeInr", "deliveryAddress", "createdAt", "updatedAt", "fulfillmentNotes", "isDemoOrder", "statusReason", "substitutionNotes", "updatedBy") FROM stdin;
ord-1794810679972	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794810679970)	2026-11-16 06:31:19.974	2026-11-16 06:31:19.974	\N	t	\N	\N	\N
ord-1794810679985	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794810679970)	2026-11-16 06:31:19.986	2026-11-16 06:31:19.986	\N	t	\N	\N	\N
ord-1794810680000	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794810679970)	2026-11-16 06:31:20.002	2026-11-16 06:31:20.002	\N	t	\N	\N	\N
ord-1794810680007	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794810679970)	2026-11-16 06:31:20.008	2026-11-16 06:31:20.008	\N	t	\N	\N	\N
ord-1794810680011	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794810679970)	2026-11-16 06:31:20.012	2026-11-16 06:31:20.012	\N	t	\N	\N	\N
ord-1794810685357	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 06:31:25.359	2026-11-16 06:31:25.359	\N	t	\N	\N	\N
ord-1794810807797	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	0	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:33:27.801	2026-11-16 06:33:27.801	\N	t	\N	\N	\N
ord-1794810810125	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	0	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:33:30.129	2026-11-16 06:33:30.129	\N	t	\N	\N	\N
ord-1794811140988	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:39:00.996	2026-11-16 06:39:00.996	\N	t	\N	\N	\N
ord-1794811143232	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:39:03.238	2026-11-16 06:39:03.238	\N	t	\N	\N	\N
ord-1794811385019	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:43:05.021	2026-11-16 06:43:05.021	\N	t	\N	\N	\N
ord-1794811387312	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:43:07.314	2026-11-16 06:43:07.314	\N	t	\N	\N	\N
ord-1794811387318	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 06:43:07.32	2026-11-16 06:43:07.32	\N	t	\N	\N	\N
ord-1794811429516	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:43:49.518	2026-11-16 06:43:49.518	\N	t	\N	\N	\N
ord-1794811431745	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:43:51.747	2026-11-16 06:43:51.747	\N	t	\N	\N	\N
ord-1794811431751	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 06:43:51.753	2026-11-16 06:43:51.753	\N	t	\N	\N	\N
ord-1794811550892	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	1563	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 06:45:50.898	2026-11-16 06:45:50.898	\N	t	\N	\N	\N
ord-1794811560233	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	1976	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 06:46:00.239	2026-11-16 06:46:00.239	\N	t	\N	\N	\N
ord-1794811560548	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794811560549)	2026-11-16 06:46:00.554	2026-11-16 06:46:00.554	\N	t	\N	\N	\N
ord-1794811560557	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794811560549)	2026-11-16 06:46:00.563	2026-11-16 06:46:00.563	\N	t	\N	\N	\N
ord-1794811560566	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794811560549)	2026-11-16 06:46:00.572	2026-11-16 06:46:00.572	\N	t	\N	\N	\N
ord-1794811560574	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794811560549)	2026-11-16 06:46:00.58	2026-11-16 06:46:00.58	\N	t	\N	\N	\N
ord-1794811560578	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794811560549)	2026-11-16 06:46:00.584	2026-11-16 06:46:00.584	\N	t	\N	\N	\N
ord-1794811560837	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 06:46:00.843	2026-11-16 06:46:00.843	\N	t	\N	\N	\N
ord-1794811561424	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:46:01.43	2026-11-16 06:46:01.43	\N	t	\N	\N	\N
ord-1794811563666	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:46:03.672	2026-11-16 06:46:03.672	\N	t	\N	\N	\N
ord-1794811563674	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 06:46:03.68	2026-11-16 06:46:03.68	\N	t	\N	\N	\N
ord-1794811689362	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794811689362)	2026-11-16 06:48:09.365	2026-11-16 06:48:09.365	\N	t	\N	\N	\N
ord-1794811689377	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794811689362)	2026-11-16 06:48:09.38	2026-11-16 06:48:09.38	\N	t	\N	\N	\N
ord-1794811689387	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794811689362)	2026-11-16 06:48:09.389	2026-11-16 06:48:09.389	\N	t	\N	\N	\N
ord-1794811689391	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794811689362)	2026-11-16 06:48:09.394	2026-11-16 06:48:09.394	\N	t	\N	\N	\N
ord-1794811689396	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794811689362)	2026-11-16 06:48:09.399	2026-11-16 06:48:09.399	\N	t	\N	\N	\N
ord-1794811709720	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:48:29.723	2026-11-16 06:48:29.723	\N	t	\N	\N	\N
ord-1794811711940	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:48:31.942	2026-11-16 06:48:31.942	\N	t	\N	\N	\N
ord-1794811711945	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 06:48:31.947	2026-11-16 06:48:31.947	\N	t	\N	\N	\N
ord-1794811739645	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:48:59.647	2026-11-16 06:48:59.647	\N	t	\N	\N	\N
ord-1794811741991	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:49:01.992	2026-11-16 06:49:01.992	\N	t	\N	\N	\N
ord-1794811742003	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 06:49:02.005	2026-11-16 06:49:02.005	\N	t	\N	\N	\N
ord-1794811885447	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2680	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 06:51:25.449	2026-11-16 06:51:25.449	\N	t	\N	\N	\N
ord-1794811929962	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:52:09.966	2026-11-16 06:52:09.966	\N	t	\N	\N	\N
ord-1794811932183	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:52:12.186	2026-11-16 06:52:12.186	\N	t	\N	\N	\N
ord-1794811932190	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 06:52:12.193	2026-11-16 06:52:12.193	\N	t	\N	\N	\N
ord-1794814450004	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2680	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 07:34:10.007	2026-11-16 07:34:10.007	\N	t	\N	\N	\N
ord-1794814456824	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2534	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 07:34:16.826	2026-11-16 07:34:16.826	\N	t	\N	\N	\N
ord-1794814457196	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794814457182)	2026-11-16 07:34:17.198	2026-11-16 07:34:17.198	\N	t	\N	\N	\N
ord-1794814457205	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794814457182)	2026-11-16 07:34:17.207	2026-11-16 07:34:17.207	\N	t	\N	\N	\N
ord-1794814457219	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794814457182)	2026-11-16 07:34:17.22	2026-11-16 07:34:17.22	\N	t	\N	\N	\N
ord-1794814457226	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794814457182)	2026-11-16 07:34:17.228	2026-11-16 07:34:17.228	\N	t	\N	\N	\N
ord-1794814457232	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794814457182)	2026-11-16 07:34:17.233	2026-11-16 07:34:17.233	\N	t	\N	\N	\N
ord-1794814457483	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 07:34:17.485	2026-11-16 07:34:17.485	\N	t	\N	\N	\N
ord-1794814458050	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:34:18.052	2026-11-16 07:34:18.052	\N	t	\N	\N	\N
ord-1794814460343	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:34:20.345	2026-11-16 07:34:20.345	\N	t	\N	\N	\N
ord-1794814460351	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 07:34:20.353	2026-11-16 07:34:20.353	\N	t	\N	\N	\N
ord-1794814626095	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:37:06.104	2026-11-16 07:37:06.104	\N	t	\N	\N	\N
ord-1794814628341	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:37:08.35	2026-11-16 07:37:08.35	\N	t	\N	\N	\N
ord-1794814628348	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 07:37:08.357	2026-11-16 07:37:08.357	\N	t	\N	\N	\N
ord-1794814892625	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 07:41:32.635	2026-11-16 07:41:32.635	\N	t	\N	\N	\N
ord-1794815003346	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2534	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 07:43:23.351	2026-11-16 07:43:23.351	\N	t	\N	\N	\N
ord-1794815057256	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794815055188)	2026-11-16 07:44:17.269	2026-11-16 07:44:17.269	\N	t	\N	\N	\N
ord-1794815058843	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794815055188)	2026-11-16 07:44:18.856	2026-11-16 07:44:18.856	\N	t	\N	\N	\N
ord-1794815058852	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794815055188)	2026-11-16 07:44:18.864	2026-11-16 07:44:18.864	\N	t	\N	\N	\N
ord-1794815058858	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794815055188)	2026-11-16 07:44:18.871	2026-11-16 07:44:18.871	\N	t	\N	\N	\N
ord-1794815059257	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 07:44:19.269	2026-11-16 07:44:19.269	\N	t	\N	\N	\N
ord-1794815061238	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:44:21.25	2026-11-16 07:44:21.25	\N	t	\N	\N	\N
ord-1794815063531	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:44:23.543	2026-11-16 07:44:23.543	\N	t	\N	\N	\N
ord-1794815063536	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 07:44:23.549	2026-11-16 07:44:23.549	\N	t	\N	\N	\N
ord-1794815064076	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 07:44:24.088	2026-11-16 07:44:24.088	\N	t	\N	\N	\N
ord-1794815302442	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2502	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 07:48:22.444	2026-11-16 07:48:22.444	\N	t	\N	\N	\N
ord-1794815434576	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:50:34.578	2026-11-16 07:50:34.578	\N	t	\N	\N	\N
ord-1794815436819	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:50:36.821	2026-11-16 07:50:36.821	\N	t	\N	\N	\N
ord-1794815436826	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 07:50:36.828	2026-11-16 07:50:36.828	\N	t	\N	\N	\N
ord-1794815437417	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 07:50:37.418	2026-11-16 07:50:37.418	\N	t	\N	\N	\N
ord-1794815751185	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2569	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 07:55:51.196	2026-11-16 07:55:51.196	\N	t	\N	\N	\N
ord-1794815758045	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2775	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 07:55:58.057	2026-11-16 07:55:58.057	\N	t	\N	\N	\N
ord-1794815758521	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794815758527)	2026-11-16 07:55:58.532	2026-11-16 07:55:58.532	\N	t	\N	\N	\N
ord-1794815758535	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794815758527)	2026-11-16 07:55:58.546	2026-11-16 07:55:58.546	\N	t	\N	\N	\N
ord-1794815758552	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794815758527)	2026-11-16 07:55:58.563	2026-11-16 07:55:58.563	\N	t	\N	\N	\N
ord-1794815758562	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794815758527)	2026-11-16 07:55:58.573	2026-11-16 07:55:58.573	\N	t	\N	\N	\N
ord-1794815758570	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794815758527)	2026-11-16 07:55:58.581	2026-11-16 07:55:58.581	\N	t	\N	\N	\N
ord-1794815758893	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 07:55:58.904	2026-11-16 07:55:58.904	\N	t	\N	\N	\N
ord-1794815759614	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:55:59.625	2026-11-16 07:55:59.625	\N	t	\N	\N	\N
ord-1794815761985	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:56:01.996	2026-11-16 07:56:01.996	\N	t	\N	\N	\N
ord-1794815761995	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 07:56:02.006	2026-11-16 07:56:02.006	\N	t	\N	\N	\N
ord-1794815762738	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 07:56:02.749	2026-11-16 07:56:02.749	\N	t	\N	\N	\N
ord-1794817209291	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2852	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 08:20:09.293	2026-11-16 08:20:09.293	\N	t	\N	\N	\N
ord-1794817219541	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2367	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 08:20:19.543	2026-11-16 08:20:19.543	\N	t	\N	\N	\N
ord-1794817220036	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794817220033)	2026-11-16 08:20:20.038	2026-11-16 08:20:20.038	\N	t	\N	\N	\N
ord-1794817220049	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794817220033)	2026-11-16 08:20:20.051	2026-11-16 08:20:20.051	\N	t	\N	\N	\N
ord-1794817220070	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794817220033)	2026-11-16 08:20:20.072	2026-11-16 08:20:20.072	\N	t	\N	\N	\N
ord-1794817220081	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794817220033)	2026-11-16 08:20:20.083	2026-11-16 08:20:20.083	\N	t	\N	\N	\N
ord-1794817220088	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794817220033)	2026-11-16 08:20:20.09	2026-11-16 08:20:20.09	\N	t	\N	\N	\N
ord-1794817220427	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 08:20:20.429	2026-11-16 08:20:20.429	\N	t	\N	\N	\N
ord-1794817221225	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 08:20:21.227	2026-11-16 08:20:21.227	\N	t	\N	\N	\N
ord-1794817223639	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 08:20:23.641	2026-11-16 08:20:23.641	\N	t	\N	\N	\N
ord-1794817223649	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 08:20:23.651	2026-11-16 08:20:23.651	\N	t	\N	\N	\N
ord-1794817224528	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 08:20:24.53	2026-11-16 08:20:24.53	\N	t	\N	\N	\N
ord-1794817822270	user-demo-patel	DMart Ready	DEMO ORDER CONFIRMED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 08:30:22.278	2026-11-16 08:30:22.278	\N	t	\N	\N	\N
ord-1794818154448	user-demo-patel	DMart Ready	DEMO ORDER CONFIRMED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 08:35:54.451	2026-11-16 08:35:54.451	\N	t	\N	\N	\N
ord-1794818318403	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2633	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 08:38:38.413	2026-11-16 08:38:38.413	\N	t	\N	\N	\N
ord-1794818318851	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794818318854)	2026-11-16 08:38:38.861	2026-11-16 08:38:38.861	\N	t	\N	\N	\N
ord-1794818318865	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794818318854)	2026-11-16 08:38:38.875	2026-11-16 08:38:38.875	\N	t	\N	\N	\N
ord-1794818318881	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794818318854)	2026-11-16 08:38:38.891	2026-11-16 08:38:38.891	\N	t	\N	\N	\N
ord-1794818318889	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794818318854)	2026-11-16 08:38:38.899	2026-11-16 08:38:38.899	\N	t	\N	\N	\N
ord-1794818318898	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794818318854)	2026-11-16 08:38:38.908	2026-11-16 08:38:38.908	\N	t	\N	\N	\N
ord-1794818319229	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 08:38:39.238	2026-11-16 08:38:39.238	\N	t	\N	\N	\N
ord-1794818320015	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 08:38:40.024	2026-11-16 08:38:40.024	\N	t	\N	\N	\N
ord-1794818322341	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 08:38:42.351	2026-11-16 08:38:42.351	\N	t	\N	\N	\N
ord-1794818322350	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 08:38:42.359	2026-11-16 08:38:42.359	\N	t	\N	\N	\N
ord-1794818323039	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 08:38:43.049	2026-11-16 08:38:43.049	\N	t	\N	\N	\N
ord-1794818323463	user-demo-patel	DMart Ready	DEMO ORDER CONFIRMED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 08:38:43.473	2026-11-16 08:38:43.473	\N	t	\N	\N	\N
ord-1794818377176	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 08:39:37.18	2026-11-16 08:39:37.18	\N	t	\N	\N	\N
ord-1794818554226	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2827	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 08:42:34.231	2026-11-16 08:42:34.231	\N	t	\N	\N	\N
ord-1794818567353	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2342	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 08:42:47.355	2026-11-16 08:42:47.355	\N	t	\N	\N	\N
ord-1794818567850	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794818567848)	2026-11-16 08:42:47.853	2026-11-16 08:42:47.853	\N	t	\N	\N	\N
ord-1794818567865	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794818567848)	2026-11-16 08:42:47.867	2026-11-16 08:42:47.867	\N	t	\N	\N	\N
ord-1794818567882	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794818567848)	2026-11-16 08:42:47.885	2026-11-16 08:42:47.885	\N	t	\N	\N	\N
ord-1794818567891	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794818567848)	2026-11-16 08:42:47.894	2026-11-16 08:42:47.894	\N	t	\N	\N	\N
ord-1794818567899	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794818567848)	2026-11-16 08:42:47.901	2026-11-16 08:42:47.901	\N	t	\N	\N	\N
ord-1794818568267	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 08:42:48.27	2026-11-16 08:42:48.27	\N	t	\N	\N	\N
ord-1794818569015	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 08:42:49.017	2026-11-16 08:42:49.017	\N	t	\N	\N	\N
ord-1794818571364	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 08:42:51.367	2026-11-16 08:42:51.367	\N	t	\N	\N	\N
ord-1794818571375	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 08:42:51.378	2026-11-16 08:42:51.378	\N	t	\N	\N	\N
ord-1794818572170	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 08:42:52.172	2026-11-16 08:42:52.172	\N	t	\N	\N	\N
ord-1794818572579	user-demo-patel	DMart Ready	DEMO ORDER CONFIRMED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 08:42:52.582	2026-11-16 08:42:52.582	\N	t	\N	\N	\N
ord-1794822041138	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794822031100)	2026-11-16 09:40:41.139	2026-11-16 09:40:41.139	\N	t	\N	\N	\N
ord-1794822041797	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794822031100)	2026-11-16 09:40:41.799	2026-11-16 09:40:41.799	\N	t	\N	\N	\N
ord-1794822041810	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794822031100)	2026-11-16 09:40:41.812	2026-11-16 09:40:41.812	\N	t	\N	\N	\N
ord-1794822041822	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794822031100)	2026-11-16 09:40:41.824	2026-11-16 09:40:41.824	\N	t	\N	\N	\N
ord-1794822678759	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794822678756)	2026-11-16 09:51:18.761	2026-11-16 09:51:18.761	\N	t	\N	\N	\N
ord-1794822678778	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794822678756)	2026-11-16 09:51:18.781	2026-11-16 09:51:18.781	\N	t	\N	\N	\N
ord-1794822678800	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794822678756)	2026-11-16 09:51:18.802	2026-11-16 09:51:18.802	\N	t	\N	\N	\N
ord-1794822678810	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794822678756)	2026-11-16 09:51:18.812	2026-11-16 09:51:18.812	\N	t	\N	\N	\N
ord-1794822678820	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794822678756)	2026-11-16 09:51:18.823	2026-11-16 09:51:18.823	\N	t	\N	\N	\N
ord-1794822740009	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2689	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 09:52:20.014	2026-11-16 09:52:20.014	\N	t	\N	\N	\N
ord-1794822741933	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2333	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 09:52:21.938	2026-11-16 09:52:21.938	\N	t	\N	\N	\N
ord-1794822742958	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794822742955)	2026-11-16 09:52:22.963	2026-11-16 09:52:22.963	\N	t	\N	\N	\N
ord-1794822742988	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794822742955)	2026-11-16 09:52:22.992	2026-11-16 09:52:22.992	\N	t	\N	\N	\N
ord-1794822743020	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794822742955)	2026-11-16 09:52:23.025	2026-11-16 09:52:23.025	\N	t	\N	\N	\N
ord-1794822743037	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794822742955)	2026-11-16 09:52:23.041	2026-11-16 09:52:23.041	\N	t	\N	\N	\N
ord-1794822743054	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794822742955)	2026-11-16 09:52:23.058	2026-11-16 09:52:23.058	\N	t	\N	\N	\N
ord-1794822743811	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 09:52:23.816	2026-11-16 09:52:23.816	\N	t	\N	\N	\N
ord-1794822745019	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 09:52:25.023	2026-11-16 09:52:25.023	\N	t	\N	\N	\N
ord-1794822747527	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 09:52:27.531	2026-11-16 09:52:27.531	\N	t	\N	\N	\N
ord-1794822747540	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 09:52:27.544	2026-11-16 09:52:27.544	\N	t	\N	\N	\N
ord-1794822748460	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 09:52:28.464	2026-11-16 09:52:28.464	\N	t	\N	\N	\N
ord-1794822748988	user-demo-patel	DMart Ready	DEMO ORDER CONFIRMED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 09:52:28.992	2026-11-16 09:52:28.992	\N	t	\N	\N	\N
ord-1794822915943	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 09:55:15.947	2026-11-16 09:55:15.947	\N	t	\N	\N	\N
ord-1794822931859	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 09:55:31.862	2026-11-16 09:55:31.862	\N	t	\N	\N	\N
ord-1794822934281	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 09:55:34.284	2026-11-16 09:55:34.284	\N	t	\N	\N	\N
ord-1794822934290	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 09:55:34.293	2026-11-16 09:55:34.293	\N	t	\N	\N	\N
ord-1794822948567	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 09:55:48.571	2026-11-16 09:55:48.571	\N	t	\N	\N	\N
ord-1794822958891	user-demo-patel	DMart Ready	DEMO ORDER CONFIRMED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 09:55:58.894	2026-11-16 09:55:58.894	\N	t	\N	\N	\N
ord-1794823004627	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2372	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 09:56:44.631	2026-11-16 09:56:44.631	\N	t	\N	\N	\N
ord-1794823005755	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794823005753)	2026-11-16 09:56:45.758	2026-11-16 09:56:45.758	\N	t	\N	\N	\N
ord-1794823005766	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794823005753)	2026-11-16 09:56:45.769	2026-11-16 09:56:45.769	\N	t	\N	\N	\N
ord-1794823005785	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794823005753)	2026-11-16 09:56:45.788	2026-11-16 09:56:45.788	\N	t	\N	\N	\N
ord-1794823005793	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794823005753)	2026-11-16 09:56:45.796	2026-11-16 09:56:45.796	\N	t	\N	\N	\N
ord-1794823005800	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794823005753)	2026-11-16 09:56:45.803	2026-11-16 09:56:45.803	\N	t	\N	\N	\N
ord-1794823006121	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 09:56:46.124	2026-11-16 09:56:46.124	\N	t	\N	\N	\N
ord-1794823007828	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 09:56:47.831	2026-11-16 09:56:47.831	\N	t	\N	\N	\N
ord-1794823010273	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 09:56:50.276	2026-11-16 09:56:50.276	\N	t	\N	\N	\N
ord-1794823010285	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 09:56:50.288	2026-11-16 09:56:50.288	\N	t	\N	\N	\N
ord-1794823010988	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 09:56:50.992	2026-11-16 09:56:50.992	\N	t	\N	\N	\N
ord-1794823011360	user-demo-patel	DMart Ready	DEMO ORDER CONFIRMED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 09:56:51.363	2026-11-16 09:56:51.363	\N	t	\N	\N	\N
ord-1794823210498	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2350	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 10:00:10.503	2026-11-16 10:00:10.503	\N	t	\N	\N	\N
ord-1794823229199	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2350	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 10:00:29.203	2026-11-16 10:00:29.203	\N	t	\N	\N	\N
ord-1794823230317	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2505	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 10:00:30.323	2026-11-16 10:00:30.323	\N	t	\N	\N	\N
ord-1794823231293	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794823231286)	2026-11-16 10:00:31.301	2026-11-16 10:00:31.301	\N	t	\N	\N	\N
ord-1794823231322	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794823231286)	2026-11-16 10:00:31.327	2026-11-16 10:00:31.327	\N	t	\N	\N	\N
ord-1794823231353	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794823231286)	2026-11-16 10:00:31.357	2026-11-16 10:00:31.357	\N	t	\N	\N	\N
ord-1794823231370	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794823231286)	2026-11-16 10:00:31.374	2026-11-16 10:00:31.374	\N	t	\N	\N	\N
ord-1794823231385	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794823231286)	2026-11-16 10:00:31.39	2026-11-16 10:00:31.39	\N	t	\N	\N	\N
ord-1794823231891	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 10:00:31.895	2026-11-16 10:00:31.895	\N	t	\N	\N	\N
ord-1794823233090	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 10:00:33.094	2026-11-16 10:00:33.094	\N	t	\N	\N	\N
ord-1794823235686	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 10:00:35.691	2026-11-16 10:00:35.691	\N	t	\N	\N	\N
ord-1794823235701	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 10:00:35.706	2026-11-16 10:00:35.706	\N	t	\N	\N	\N
ord-1794823236933	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 10:00:36.938	2026-11-16 10:00:36.938	\N	t	\N	\N	\N
ord-1794823237743	user-demo-patel	DMart Ready	DISPATCHED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 10:00:37.748	2026-11-16 10:40:20.806	Customer requested contactless delivery at doorstep	t	Out with delivery executive	Substituted organic coriander with standard coriander	operations@rasoiiq.in
ord-1794825684884	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2808	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 10:41:24.886	2026-11-16 10:41:24.886	\N	t	\N	\N	\N
ord-1794825691731	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2475	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 10:41:31.733	2026-11-16 10:41:31.733	\N	t	\N	\N	\N
ord-1794825692196	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794825692187)	2026-11-16 10:41:32.198	2026-11-16 10:41:32.198	\N	t	\N	\N	\N
ord-1794825692208	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794825692187)	2026-11-16 10:41:32.21	2026-11-16 10:41:32.21	\N	t	\N	\N	\N
ord-1794825692222	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794825692187)	2026-11-16 10:41:32.224	2026-11-16 10:41:32.224	\N	t	\N	\N	\N
ord-1794825692231	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794825692187)	2026-11-16 10:41:32.233	2026-11-16 10:41:32.233	\N	t	\N	\N	\N
ord-1794825692238	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794825692187)	2026-11-16 10:41:32.24	2026-11-16 10:41:32.24	\N	t	\N	\N	\N
ord-1794825692587	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 10:41:32.588	2026-11-16 10:41:32.588	\N	t	\N	\N	\N
ord-1794825693372	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 10:41:33.374	2026-11-16 10:41:33.374	\N	t	\N	\N	\N
ord-1794825695792	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 10:41:35.794	2026-11-16 10:41:35.794	\N	t	\N	\N	\N
ord-1794825695802	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 10:41:35.804	2026-11-16 10:41:35.804	\N	t	\N	\N	\N
ord-1794825696510	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 10:41:36.512	2026-11-16 10:41:36.512	\N	t	\N	\N	\N
ord-1794825696926	user-demo-patel	DMart Ready	DISPATCHED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 10:41:36.928	2026-11-16 10:41:42.556	Customer requested contactless delivery at doorstep	t	Out with delivery executive	Substituted organic coriander with standard coriander	operations@rasoiiq.in
ord-1794825806875	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2475	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 10:43:26.877	2026-11-16 10:43:26.877	\N	t	\N	\N	\N
ord-1794825812985	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2741	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 10:43:32.986	2026-11-16 10:43:32.986	\N	t	\N	\N	\N
ord-1794825813476	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794825813475)	2026-11-16 10:43:33.478	2026-11-16 10:43:33.478	\N	t	\N	\N	\N
ord-1794825813488	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794825813475)	2026-11-16 10:43:33.49	2026-11-16 10:43:33.49	\N	t	\N	\N	\N
ord-1794825813504	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794825813475)	2026-11-16 10:43:33.506	2026-11-16 10:43:33.506	\N	t	\N	\N	\N
ord-1794825813511	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794825813475)	2026-11-16 10:43:33.513	2026-11-16 10:43:33.513	\N	t	\N	\N	\N
ord-1794825813518	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794825813475)	2026-11-16 10:43:33.519	2026-11-16 10:43:33.519	\N	t	\N	\N	\N
ord-1794825813845	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 10:43:33.847	2026-11-16 10:43:33.847	\N	t	\N	\N	\N
ord-1794825814586	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 10:43:34.587	2026-11-16 10:43:34.587	\N	t	\N	\N	\N
ord-1794825816965	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 10:43:36.967	2026-11-16 10:43:36.967	\N	t	\N	\N	\N
ord-1794825816972	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 10:43:36.974	2026-11-16 10:43:36.974	\N	t	\N	\N	\N
ord-1794825817840	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 10:43:37.842	2026-11-16 10:43:37.842	\N	t	\N	\N	\N
ord-1794826668288	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 10:57:48.293	2026-11-16 10:57:48.293	\N	t	\N	\N	\N
ord-1794826668301	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 10:57:48.306	2026-11-16 10:57:48.306	\N	t	\N	\N	\N
ord-1794825818247	user-demo-patel	DMart Ready	DISPATCHED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 10:43:38.249	2026-11-16 10:55:54.097	Customer requested contactless delivery at doorstep	t	Out with delivery executive	Substituted organic coriander with standard coriander	operations@rasoiiq.in
ord-1794826657847	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2521	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 10:57:37.849	2026-11-16 10:57:37.849	\N	t	\N	\N	\N
ord-1794826663981	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2309	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 10:57:43.983	2026-11-16 10:57:43.983	\N	t	\N	\N	\N
ord-1794826664564	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794826664562)	2026-11-16 10:57:44.566	2026-11-16 10:57:44.566	\N	t	\N	\N	\N
ord-1794826664579	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794826664562)	2026-11-16 10:57:44.581	2026-11-16 10:57:44.581	\N	t	\N	\N	\N
ord-1794826664600	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794826664562)	2026-11-16 10:57:44.602	2026-11-16 10:57:44.602	\N	t	\N	\N	\N
ord-1794826664611	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794826664562)	2026-11-16 10:57:44.613	2026-11-16 10:57:44.613	\N	t	\N	\N	\N
ord-1794826664620	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794826664562)	2026-11-16 10:57:44.622	2026-11-16 10:57:44.622	\N	t	\N	\N	\N
ord-1794826665029	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 10:57:45.034	2026-11-16 10:57:45.034	\N	t	\N	\N	\N
ord-1794826665872	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 10:57:45.877	2026-11-16 10:57:45.877	\N	t	\N	\N	\N
ord-1794826669098	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 10:57:49.103	2026-11-16 10:57:49.103	\N	t	\N	\N	\N
ord-1794828325799	cmwj6fyg50032l3rcif9xvg5z	Blinkit	DEMO ORDER CONFIRMED	240	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103	2026-11-16 11:25:25.803	2026-11-16 11:25:25.803	\N	t	\N	\N	\N
ord-1794826669508	user-demo-patel	DMart Ready	DISPATCHED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 10:57:49.513	2026-11-16 11:10:22.945	Customer requested contactless delivery at doorstep	t	Out with delivery executive	Substituted organic coriander with standard coriander	operations@rasoiiq.in
ord-1794828431545	cmwj6i80g0032l3y87a4qyxrq	Blinkit	DEMO ORDER CONFIRMED	240	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103	2026-11-16 11:27:11.56	2026-11-16 11:27:11.56	\N	t	\N	\N	\N
ord-1794828556986	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2689	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 11:29:16.992	2026-11-16 11:29:16.992	\N	t	\N	\N	\N
ord-1794828577774	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2990	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 11:29:37.78	2026-11-16 11:29:37.78	\N	t	\N	\N	\N
ord-1794828578276	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794828578277)	2026-11-16 11:29:38.281	2026-11-16 11:29:38.281	\N	t	\N	\N	\N
ord-1794828578290	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794828578277)	2026-11-16 11:29:38.296	2026-11-16 11:29:38.296	\N	t	\N	\N	\N
ord-1794828578309	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794828578277)	2026-11-16 11:29:38.315	2026-11-16 11:29:38.315	\N	t	\N	\N	\N
ord-1794828578319	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794828578277)	2026-11-16 11:29:38.325	2026-11-16 11:29:38.325	\N	t	\N	\N	\N
ord-1794828578327	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794828578277)	2026-11-16 11:29:38.333	2026-11-16 11:29:38.333	\N	t	\N	\N	\N
ord-1794828578703	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 11:29:38.708	2026-11-16 11:29:38.708	\N	t	\N	\N	\N
ord-1794828579392	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 11:29:39.398	2026-11-16 11:29:39.398	\N	t	\N	\N	\N
ord-1794828581838	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 11:29:41.844	2026-11-16 11:29:41.844	\N	t	\N	\N	\N
ord-1794828581849	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 11:29:41.855	2026-11-16 11:29:41.855	\N	t	\N	\N	\N
ord-1794828582592	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 11:29:42.598	2026-11-16 11:29:42.598	\N	t	\N	\N	\N
ord-1794828583074	user-demo-patel	DMart Ready	DISPATCHED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 11:29:43.08	2026-11-16 11:29:51.081	Customer requested contactless delivery at doorstep	t	Out with delivery executive	Substituted organic coriander with standard coriander	operations@rasoiiq.in
ord-1794829138982	cmwj6xdtd00bdl3y825vovtmm	Blinkit	DEMO ORDER CONFIRMED	240	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103	2026-11-16 11:38:58.984	2026-11-16 11:38:58.984	\N	t	\N	\N	\N
ord-1794829194615	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2990	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 11:39:54.619	2026-11-16 11:39:54.619	\N	t	\N	\N	\N
ord-1794829205285	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	3324	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 11:40:05.289	2026-11-16 11:40:05.289	\N	t	\N	\N	\N
ord-1794829205773	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794829205771)	2026-11-16 11:40:05.777	2026-11-16 11:40:05.777	\N	t	\N	\N	\N
ord-1794829205786	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794829205771)	2026-11-16 11:40:05.79	2026-11-16 11:40:05.79	\N	t	\N	\N	\N
ord-1794829205802	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794829205771)	2026-11-16 11:40:05.805	2026-11-16 11:40:05.805	\N	t	\N	\N	\N
ord-1794829205811	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794829205771)	2026-11-16 11:40:05.814	2026-11-16 11:40:05.814	\N	t	\N	\N	\N
ord-1794829205818	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794829205771)	2026-11-16 11:40:05.821	2026-11-16 11:40:05.821	\N	t	\N	\N	\N
ord-1794829206192	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 11:40:06.196	2026-11-16 11:40:06.196	\N	t	\N	\N	\N
ord-1794829206975	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 11:40:06.979	2026-11-16 11:40:06.979	\N	t	\N	\N	\N
ord-1794829209422	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 11:40:09.426	2026-11-16 11:40:09.426	\N	t	\N	\N	\N
ord-1794829209434	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 11:40:09.438	2026-11-16 11:40:09.438	\N	t	\N	\N	\N
ord-1794829210232	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 11:40:10.236	2026-11-16 11:40:10.236	\N	t	\N	\N	\N
ord-1794829210692	user-demo-patel	DMart Ready	DISPATCHED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 11:40:10.696	2026-11-16 11:40:19.734	Customer requested contactless delivery at doorstep	t	Out with delivery executive	Substituted organic coriander with standard coriander	operations@rasoiiq.in
ord-1794829230784	cmwj6zcpy00i7l3y8vp2u3gdx	Blinkit	DEMO ORDER CONFIRMED	240	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103	2026-11-16 11:40:30.788	2026-11-16 11:40:30.788	\N	t	\N	\N	\N
ord-1794830522879	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2474	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 12:02:02.881	2026-11-16 12:02:02.881	\N	t	\N	\N	\N
ord-1794830529012	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2400	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 12:02:09.014	2026-11-16 12:02:09.014	\N	t	\N	\N	\N
ord-1794830529396	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794830529394)	2026-11-16 12:02:09.397	2026-11-16 12:02:09.397	\N	t	\N	\N	\N
ord-1794830529407	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794830529394)	2026-11-16 12:02:09.409	2026-11-16 12:02:09.409	\N	t	\N	\N	\N
ord-1794830529421	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794830529394)	2026-11-16 12:02:09.423	2026-11-16 12:02:09.423	\N	t	\N	\N	\N
ord-1794830529430	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794830529394)	2026-11-16 12:02:09.431	2026-11-16 12:02:09.431	\N	t	\N	\N	\N
ord-1794830529436	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794830529394)	2026-11-16 12:02:09.437	2026-11-16 12:02:09.437	\N	t	\N	\N	\N
ord-1794830529702	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 12:02:09.703	2026-11-16 12:02:09.703	\N	t	\N	\N	\N
ord-1794830530346	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 12:02:10.348	2026-11-16 12:02:10.348	\N	t	\N	\N	\N
ord-1794830532714	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 12:02:12.716	2026-11-16 12:02:12.716	\N	t	\N	\N	\N
ord-1794830532722	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 12:02:12.724	2026-11-16 12:02:12.724	\N	t	\N	\N	\N
ord-1794830533345	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 12:02:13.346	2026-11-16 12:02:13.346	\N	t	\N	\N	\N
ord-1794830533631	user-demo-patel	DMart Ready	DEMO ORDER CONFIRMED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 12:02:13.633	2026-11-16 12:02:13.633	\N	t	\N	\N	\N
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", "productVariantId", "quantityPacks", "unitPriceInr") FROM stdin;
\.


--
-- Data for Name: PantryItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PantryItem" (id, "householdId", "ingredientId", "currentQuantity", unit, "isLowStock", "lowStockThreshold", "updatedAt") FROM stdin;
cmwivcvn400drl3q43rhk4w7t	hh-sharma-family	ing-atta	2000	g	f	\N	2026-11-16 06:15:05.008
cmwivcvnb00dtl3q4vw3xb4nf	hh-sharma-family	ing-ghee	300	g	f	\N	2026-11-16 06:15:05.016
cmwivcvnh00dvl3q4quz3d8k6	hh-sharma-family	ing-salt	500	g	f	\N	2026-11-16 06:15:05.021
cmwivcvno00dxl3q4hnq2k5zs	hh-sharma-family	ing-oil	800	ml	f	\N	2026-11-16 06:15:05.028
cmwivcvnt00dzl3q4xtb6f7kc	hh-sharma-family	ing-turmeric	100	g	f	\N	2026-11-16 06:15:05.034
cmwivcvo500e3l3q4a53quqxi	hh-sharma-family	ing-cumin-seeds	50	g	f	\N	2026-11-16 06:15:05.046
cmwivcvoa00e5l3q4h4feys7a	hh-sharma-family	ing-toor-dal	300	g	t	\N	2026-11-16 06:15:05.05
cmwivcvou00e7l3q4f9j5h2i7	hh-patel-family	ing-besan	1500	g	f	\N	2026-11-16 06:15:05.071
cmwivcvoz00e9l3q4ez55nph6	hh-patel-family	ing-toor-dal	1000	g	f	\N	2026-11-16 06:15:05.075
cmwivcvp500ebl3q4gzod6gww	hh-patel-family	ing-ghee	500	g	f	\N	2026-11-16 06:15:05.082
cmwivcvpb00edl3q4m1k1q5nq	hh-patel-family	ing-jaggery	400	g	f	\N	2026-11-16 06:15:05.088
cmwivcvpu00efl3q4g85o0or9	hh-mehta-family	ing-bajra-flour	2000	g	f	\N	2026-11-16 06:15:05.106
cmwivcvpz00ehl3q4aybn4ci6	hh-mehta-family	ing-ghee	1000	g	f	\N	2026-11-16 06:15:05.111
cmwivcvq300ejl3q4lq5iioe7	hh-mehta-family	ing-green-chilli	250	g	f	\N	2026-11-16 06:15:05.115
cmwivcvq800ell3q411ejwkrd	hh-mehta-family	ing-mustard-seeds	200	g	f	\N	2026-11-16 06:15:05.121
cmwivcvo000e1l3q4teh4nxo1	hh-sharma-family	ing-mustard-seeds	200	g	f	\N	2026-11-16 12:02:10.338
pantry-1794817781894	hh-patel-family	ing-bajra-flour	2000	g	f	\N	2026-11-16 12:02:13.573
pantry-1794817791932	hh-mehta-family	ing-raw-banana	1500	g	f	\N	2026-11-16 12:02:13.583
\.


--
-- Data for Name: PasswordResetToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PasswordResetToken" (id, "userId", "tokenHash", "expiresAt", "consumedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payment" (id, "orderId", "amountInr", status, "paymentMethod", "transactionId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, brand, title, category, "imageUrl", description) FROM stdin;
prod-Mother Dairy-ing-paneer	Mother Dairy	Mother Dairy Classic Paneer, 200g	Grocery	https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=200&q=80	\N
prod-Fortune-ing-atta	Fortune	Fortune Chakki Fresh 100% Whole Wheat Atta, 5kg	Grocery	https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80	\N
prod-Daawat-ing-basmati-rice	Daawat	Daawat Super Basmati Rice, 1kg	Grocery	https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80	\N
prod-Amul-ing-butter	Amul	Amul Pasteurized Table Butter, 500g	Grocery	https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=200&q=80	\N
prod-Fortune-ing-toor-dal	Fortune	Fortune Unpolished Arhar Toor Dal, 1kg	Grocery	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80	\N
prod-India Gate-ing-basmati-rice	India Gate	India Gate Feast Rozana Basmati Rice, 1kg	Grocery	https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80	\N
prod-Aashirvaad-ing-atta	Aashirvaad	Aashirvaad Select 100% Sharbati Wheat Atta, 1kg	Grocery	https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80	\N
prod-Amul-ing-ghee	Amul	Amul Pure Cow Ghee, 500ml	Grocery	https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=200&q=80	\N
prod-Gowardhan-ing-ghee	Gowardhan	Gowardhan 100% Pure Cow Ghee Jar, 500ml	Grocery	https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=200&q=80	\N
prod-Tata Sampann-ing-moong-dal	Tata Sampann	Tata Sampann Unpolished Moong Dal, 1kg	Grocery	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80	\N
prod-Tata Sampann-ing-toor-dal	Tata Sampann	Tata Sampann Unpolished Toor Dal, 500g	Grocery	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80	\N
prod-Fortune-ing-moong-dal	Fortune	Fortune Mogar Yellow Moong Dal, 1kg	Grocery	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80	\N
prod-Tata Sampann-ing-rajma	Tata Sampann	Tata Sampann Kashmiri Rajma, 500g	Grocery	https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=200&q=80	\N
prod-Farm Fresh-ing-onion	Farm Fresh	Fresh Nashik Red Onion, 1kg	Grocery	https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=200&q=80	\N
prod-Farm Fresh-ing-tomato	Farm Fresh	Fresh Country Desi Tomato, 1kg	Grocery	https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80	\N
prod-Farm Fresh-ing-potato	Farm Fresh	Fresh Agra New Crop Potatoes, 1kg	Grocery	https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=200&q=80	\N
prod-Farm Fresh-ing-palak	Farm Fresh	Hydroponic Clean Palak (Spinach), 250g	Grocery	https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=200&q=80	\N
prod-Farm Fresh-ing-ginger	Farm Fresh	Fresh Washed Ginger, 200g	Grocery	https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=200&q=80	\N
prod-Farm Fresh-ing-garlic	Farm Fresh	Fresh Madhya Pradesh Garlic, 200g	Grocery	https://images.unsplash.com/photo-1615477550926-105260f8976b?auto=format&fit=crop&w=200&q=80	\N
prod-Farm Fresh-ing-green-chilli	Farm Fresh	Fresh Dark Green Chillies, 100g	Grocery	https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=200&q=80	\N
prod-Farm Fresh-ing-coriander	Farm Fresh	Fresh Coriander Leaves Bunch, 1 pc	Grocery	https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=200&q=80	\N
prod-Farm Fresh-ing-curry-leaves	Farm Fresh	Fresh Aromatic Curry Leaves Bunch, 1 pc	Grocery	https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=200&q=80	\N
prod-Farm Fresh-ing-lemon	Farm Fresh	Juicy Yellow Nimbu (Lemons), 4 pcs	Grocery	https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=200&q=80	\N
prod-Everest-ing-garam-masala	Everest	Everest Royal Garam Masala, 100g	Grocery	https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80	\N
prod-Tata Sampann-ing-turmeric	Tata Sampann	Tata Sampann Turmeric Powder, 200g	Grocery	https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=200&q=80	\N
prod-Fortune-ing-oil	Fortune	Fortune Sunlite Refined Sunflower Oil, 1L	Grocery	https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=200&q=80	\N
prod-iD Fresh-ing-dosa-batter	iD Fresh	iD Fresh Idli & Dosa Batter, 1kg	Grocery	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=200&q=80	\N
prod-Tata Sampann-ing-kabuli-chana	Tata Sampann	Tata Sampann White Kabuli Chana, 500g	Grocery	https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=200&q=80	\N
prod-Fortune-ing-kabuli-chana	Fortune	Fortune Classic Kabuli Chana, 500g	Grocery	https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=200&q=80	\N
prod-Farm Fresh-ing-cauliflower	Farm Fresh	Fresh Clean Cauliflower (Gobi), 1 pc (~500g)	Grocery	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=200&q=80	\N
prod-Farm Fresh-ing-bhindi	Farm Fresh	Fresh Tender Ladyfinger (Bhindi), 500g	Grocery	https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80	\N
prod-Farm Fresh-ing-baingan	Farm Fresh	Fresh Purple Bharta Baingan, 500g (1-2 pcs)	Grocery	https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=200&q=80	\N
prod-Everest-ing-sambar-powder	Everest	Everest Madras Sambar Masala, 100g	Grocery	https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80	\N
prod-Everest-ing-chole-masala	Everest	Everest Chhole Masala, 100g	Grocery	https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80	\N
prod-Tata Sampann-ing-rava	Tata Sampann	Tata Sampann Roasted Sooji / Rava, 500g	Grocery	https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=200&q=80	\N
prod-Balaji-ing-sev	Balaji	Balaji Nylon Sev, 200g	Grocery	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80	\N
prod-Fortune-ing-bajra-flour	Fortune	Fortune Desi Bajra Flour, 1kg	Grocery	https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80	\N
prod-Amul-ing-paneer	Amul	Amul Fresh Malai Paneer, 500g	Grocery	https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=200&q=80	\N
prod-Farm Fresh-ing-surti-papdi	Farm Fresh	Fresh Surti Papdi Beans, 500g	Grocery	https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80	\N
prod-Farm Fresh-ing-tuver-lilva	Farm Fresh	Fresh Green Tuver Lilva, 250g	Grocery	https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80	\N
prod-Farm Fresh-ing-purple-yam	Farm Fresh	Fresh Purple Yam (Kand), 500g	Grocery	https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=200&q=80	\N
prod-Farm Fresh-ing-raw-banana	Farm Fresh	Fresh Green Raw Plantain (Kacha Kela), 500g	Grocery	https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=200&q=80	\N
prod-Amul-ing-buttermilk	Amul	Amul Masti Spiced Buttermilk, 500ml	Grocery	https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=200&q=80	\N
prod-Tata Sampann-ing-sesame-seeds	Tata Sampann	Tata Sampann White Sesame Seeds (Til), 200g	Grocery	https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=200&q=80	\N
\.


--
-- Data for Name: ProductVariant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductVariant" (id, "productId", "ingredientId", sku, brand, title, "packQuantity", "packUnit", "mrpInr", "sellingPriceInr", "imageUrl") FROM stdin;
var-amul-paneer-500	prod-Amul-ing-paneer	ing-paneer	AMUL-PAN-500G	Amul	Amul Fresh Malai Paneer, 500g	500	g	230	215	https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=200&q=80
var-mother-paneer-200	prod-Mother Dairy-ing-paneer	ing-paneer	MD-PAN-200G	Mother Dairy	Mother Dairy Classic Paneer, 200g	200	g	95	90	https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=200&q=80
var-aashirvaad-atta-5k	prod-Aashirvaad-ing-atta	ing-atta	AASH-ATTA-5KG	Aashirvaad	Aashirvaad Superior MP Shudh Chakki Atta, 5kg	5000	g	285	265	https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80
var-fortune-atta-5k	prod-Fortune-ing-atta	ing-atta	FORT-ATTA-5KG	Fortune	Fortune Chakki Fresh 100% Whole Wheat Atta, 5kg	5000	g	270	249	https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80
var-aashirvaad-atta-1k	prod-Aashirvaad-ing-atta	ing-atta	AASH-ATTA-1KG	Aashirvaad	Aashirvaad Select 100% Sharbati Wheat Atta, 1kg	1000	g	72	68	https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80
var-daawat-rice-5k	prod-Daawat-ing-basmati-rice	ing-basmati-rice	DAAWAT-RICE-5KG	Daawat	Daawat Rozana Gold Basmati Rice, 5kg	5000	g	499	449	https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80
var-daawat-rice-1k	prod-Daawat-ing-basmati-rice	ing-basmati-rice	DAAWAT-RICE-1KG	Daawat	Daawat Super Basmati Rice, 1kg	1000	g	160	139	https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80
var-indiagate-rice-1k	prod-India Gate-ing-basmati-rice	ing-basmati-rice	IG-RICE-1KG	India Gate	India Gate Feast Rozana Basmati Rice, 1kg	1000	g	155	132	https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80
var-amul-ghee-500	prod-Amul-ing-ghee	ing-ghee	AMUL-GHEE-500ML	Amul	Amul Pure Cow Ghee, 500ml	500	g	340	320	https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=200&q=80
var-gowardhan-ghee-500	prod-Gowardhan-ing-ghee	ing-ghee	GOW-GHEE-500ML	Gowardhan	Gowardhan 100% Pure Cow Ghee Jar, 500ml	500	g	350	335	https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=200&q=80
var-amul-butter-100	prod-Amul-ing-butter	ing-butter	AMUL-BUT-100G	Amul	Amul Pasteurized Butter, 100g	100	g	60	58	https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=200&q=80
var-amul-butter-500	prod-Amul-ing-butter	ing-butter	AMUL-BUT-500G	Amul	Amul Pasteurized Table Butter, 500g	500	g	285	275	https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=200&q=80
var-tata-toor-1k	prod-Tata Sampann-ing-toor-dal	ing-toor-dal	TATA-TOOR-1KG	Tata Sampann	Tata Sampann Unpolished Toor Dal, 1kg	1000	g	195	175	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80
var-fortune-toor-1k	prod-Fortune-ing-toor-dal	ing-toor-dal	FORT-TOOR-1KG	Fortune	Fortune Unpolished Arhar Toor Dal, 1kg	1000	g	190	168	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80
var-tata-moong-1k	prod-Tata Sampann-ing-moong-dal	ing-moong-dal	TATA-MOONG-1KG	Tata Sampann	Tata Sampann Unpolished Moong Dal, 1kg	1000	g	180	165	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80
var-fortune-moong-1k	prod-Fortune-ing-moong-dal	ing-moong-dal	FORT-MOONG-1KG	Fortune	Fortune Mogar Yellow Moong Dal, 1kg	1000	g	175	158	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80
var-tata-rajma-500	prod-Tata Sampann-ing-rajma	ing-rajma	TATA-RAJMA-500G	Tata Sampann	Tata Sampann Kashmiri Rajma, 500g	500	g	110	99	https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=200&q=80
var-fresh-onion-1k	prod-Farm Fresh-ing-onion	ing-onion	PROD-ONION-1KG	Farm Fresh	Fresh Nashik Red Onion, 1kg	1000	g	45	38	https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=200&q=80
var-fresh-tomato-1k	prod-Farm Fresh-ing-tomato	ing-tomato	PROD-TOM-1KG	Farm Fresh	Fresh Country Desi Tomato, 1kg	1000	g	40	32	https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80
var-fresh-potato-1k	prod-Farm Fresh-ing-potato	ing-potato	PROD-POT-1KG	Farm Fresh	Fresh Agra New Crop Potatoes, 1kg	1000	g	35	28	https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=200&q=80
var-fresh-palak-250	prod-Farm Fresh-ing-palak	ing-palak	PROD-PALAK-250G	Farm Fresh	Hydroponic Clean Palak (Spinach), 250g	250	g	30	24	https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=200&q=80
var-fresh-ginger-200	prod-Farm Fresh-ing-ginger	ing-ginger	PROD-GING-200G	Farm Fresh	Fresh Washed Ginger, 200g	200	g	35	29	https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=200&q=80
var-fresh-garlic-200	prod-Farm Fresh-ing-garlic	ing-garlic	PROD-GAR-200G	Farm Fresh	Fresh Madhya Pradesh Garlic, 200g	200	g	50	42	https://images.unsplash.com/photo-1615477550926-105260f8976b?auto=format&fit=crop&w=200&q=80
var-fresh-chilli-100	prod-Farm Fresh-ing-green-chilli	ing-green-chilli	PROD-CHIL-100G	Farm Fresh	Fresh Dark Green Chillies, 100g	100	g	15	12	https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=200&q=80
var-fresh-coriander-1b	prod-Farm Fresh-ing-coriander	ing-coriander	PROD-COR-1B	Farm Fresh	Fresh Coriander Leaves Bunch, 1 pc	1	piece	20	15	https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=200&q=80
var-fresh-curry-1b	prod-Farm Fresh-ing-curry-leaves	ing-curry-leaves	PROD-CUR-1B	Farm Fresh	Fresh Aromatic Curry Leaves Bunch, 1 pc	1	piece	15	10	https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=200&q=80
var-fresh-lemon-4pc	prod-Farm Fresh-ing-lemon	ing-lemon	PROD-LEM-4PC	Farm Fresh	Juicy Yellow Nimbu (Lemons), 4 pcs	4	piece	30	24	https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=200&q=80
var-amul-paneer-200	prod-Amul-ing-paneer	ing-paneer	AMUL-PAN-200G	Amul	Amul Fresh Malai Paneer, 200g	200	g	95	89	https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=200&q=80
var-tata-toor-500	prod-Tata Sampann-ing-toor-dal	ing-toor-dal	TATA-TOOR-500G	Tata Sampann	Tata Sampann Unpolished Toor Dal, 500g	500	g	105	92	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80
var-everest-garam-100	prod-Everest-ing-garam-masala	ing-garam-masala	EVER-GAR-100G	Everest	Everest Royal Garam Masala, 100g	100	g	88	82	https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80
var-tata-turmeric-200	prod-Tata Sampann-ing-turmeric	ing-turmeric	TATA-TURM-200G	Tata Sampann	Tata Sampann Turmeric Powder, 200g	200	g	65	58	https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=200&q=80
var-fortune-oil-1l	prod-Fortune-ing-oil	ing-oil	FORT-OIL-1L	Fortune	Fortune Sunlite Refined Sunflower Oil, 1L	1000	ml	155	139	https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=200&q=80
var-id-dosa-batter-1kg	prod-iD Fresh-ing-dosa-batter	ing-dosa-batter	ID-BATTER-1KG	iD Fresh	iD Fresh Idli & Dosa Batter, 1kg	1000	ml	95	85	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=200&q=80
var-tata-chana-500	prod-Tata Sampann-ing-kabuli-chana	ing-kabuli-chana	TATA-CHANA-500G	Tata Sampann	Tata Sampann White Kabuli Chana, 500g	500	g	120	105	https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=200&q=80
var-fortune-chana-500	prod-Fortune-ing-kabuli-chana	ing-kabuli-chana	FORT-CHANA-500G	Fortune	Fortune Classic Kabuli Chana, 500g	500	g	115	99	https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=200&q=80
var-fresh-gobi-500	prod-Farm Fresh-ing-cauliflower	ing-cauliflower	PROD-GOBI-500G	Farm Fresh	Fresh Clean Cauliflower (Gobi), 1 pc (~500g)	500	g	40	32	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=200&q=80
var-fresh-bhindi-500	prod-Farm Fresh-ing-bhindi	ing-bhindi	PROD-BHINDI-500G	Farm Fresh	Fresh Tender Ladyfinger (Bhindi), 500g	500	g	45	36	https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80
var-fresh-baingan-500	prod-Farm Fresh-ing-baingan	ing-baingan	PROD-BAINGAN-500G	Farm Fresh	Fresh Purple Bharta Baingan, 500g (1-2 pcs)	500	g	35	28	https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=200&q=80
var-everest-sambar-100	prod-Everest-ing-sambar-powder	ing-sambar-powder	EVER-SAMBAR-100G	Everest	Everest Madras Sambar Masala, 100g	100	g	42	38	https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80
var-everest-chole-100	prod-Everest-ing-chole-masala	ing-chole-masala	EVER-CHOLE-100G	Everest	Everest Chhole Masala, 100g	100	g	45	40	https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80
var-tata-rava-500	prod-Tata Sampann-ing-rava	ing-rava	TATA-RAVA-500G	Tata Sampann	Tata Sampann Roasted Sooji / Rava, 500g	500	g	40	35	https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=200&q=80
var-balaji-sev-200	prod-Balaji-ing-sev	ing-sev	BAL-SEV-200G	Balaji	Balaji Nylon Sev, 200g	200	g	45	42	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80
var-fortune-bajra-1k	prod-Fortune-ing-bajra-flour	ing-bajra-flour	FORT-BAJRA-1KG	Fortune	Fortune Desi Bajra Flour, 1kg	1000	g	65	59	https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80
var-fresh-surti-papdi-500	prod-Farm Fresh-ing-surti-papdi	ing-surti-papdi	PROD-PAPDI-500G	Farm Fresh	Fresh Surti Papdi Beans, 500g	500	g	40	35	https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80
var-fresh-tuver-lilva-250	prod-Farm Fresh-ing-tuver-lilva	ing-tuver-lilva	PROD-TUVER-250G	Farm Fresh	Fresh Green Tuver Lilva, 250g	250	g	55	48	https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80
var-fresh-purple-yam-500	prod-Farm Fresh-ing-purple-yam	ing-purple-yam	PROD-YAM-500G	Farm Fresh	Fresh Purple Yam (Kand), 500g	500	g	50	45	https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=200&q=80
var-fresh-raw-banana-500	prod-Farm Fresh-ing-raw-banana	ing-raw-banana	PROD-BANANA-500G	Farm Fresh	Fresh Green Raw Plantain (Kacha Kela), 500g	500	g	30	25	https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=200&q=80
var-amul-buttermilk-500	prod-Amul-ing-buttermilk	ing-buttermilk	AMUL-CHHAAS-500ML	Amul	Amul Masti Spiced Buttermilk, 500ml	500	ml	20	18	https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=200&q=80
var-tata-sesame-200	prod-Tata Sampann-ing-sesame-seeds	ing-sesame-seeds	TATA-SES-200G	Tata Sampann	Tata Sampann White Sesame Seeds (Til), 200g	200	g	60	54	https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=200&q=80
\.


--
-- Data for Name: Recipe; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Recipe" (id, title, slug, description, cuisine, "dietaryTags", "mealTypes", "prepTimeMinutes", "cookTimeMinutes", "defaultServings", difficulty, "caloriesPerServing", "proteinGrams", "carbsGrams", "fatGrams", "fiberGrams", "imageUrl", "estimatedCostInr", "isJainFriendly", "jainAlternativeNotes", rating, "ratingCount", "createdAt", "archivedAt", "archivedBy", "isArchived") FROM stdin;
recipe-gujarati-khatti-meethi-dal	Authentic Gujarati Khatti Meethi Dal	gujarati-khatti-meethi-dal	A delicate harmony of sweet organic jaggery and tangy kokum or lemon, tempered with mustard, cumin, and fragrant curry leaves. A Jain dietary staple.	Gujarati	{"Pure Vegetarian",Vegetarian,"Jain Friendly",Diabetic-Friendly}	{lunch,dinner}	10	20	4	Easy	185	8	30	4	6	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	95	t	\N	4.8	120	2026-11-16 06:15:04.323	\N	\N	f
recipe-methi-thepla	Spiced Gujarati Methi Thepla	methi-thepla	Golden spiced flatbreads made with whole wheat flour, fresh fenugreek leaves, sesame, and yogurt. The iconic travel and breakfast food of Gujarat.	Gujarati	{"Pure Vegetarian",Vegetarian,"Jain Friendly",Kid-Friendly}	{breakfast,snack}	15	15	4	Easy	210	6	32	7	5	https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80	80	t	\N	4.8	120	2026-11-16 06:15:04.341	\N	\N	f
recipe-masala-dosa	Crispy Bengaluru Masala Dosa	bengaluru-masala-dosa	Golden fermented rice and urad dal crepe slathered with red garlic chutney and stuffed with comforting spiced potato palya.	South Indian	{Vegetarian,Gluten-Free}	{breakfast,dinner}	10	20	4	Medium	310	7	52	9	4	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80	120	f	Replace potato palya with raw banana (kacha kela) palya cooked with mustard and turmeric.	4.8	120	2026-11-16 06:15:04.353	\N	\N	f
recipe-rajma-chawal	Dhaba Style Kashmiri Rajma Chawal	punjabi-rajma-chawal	Slow-simmered red kidney beans in an aromatic ginger-garlic and tomato masala served over steaming cumin-scented basmati rice.	Punjabi	{"Pure Vegetarian",Vegetarian,High-Protein,Gluten-Free}	{lunch,dinner}	20	35	4	Medium	420	18	68	8	12	https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80	160	f	\N	4.8	120	2026-11-16 06:15:04.366	\N	\N	f
recipe-palak-paneer	Creamy Homestyle Palak Paneer	homestyle-palak-paneer	Blanched fresh green spinach puree infused with garlic, cumin, and mild spices, gently folded with soft paneer cubes.	North Indian	{"Pure Vegetarian",Vegetarian,High-Protein,Gluten-Free}	{lunch,dinner}	15	20	4	Easy	320	15	10	24	5	https://images.unsplash.com/photo-1589647363585-745280b57b8f?auto=format&fit=crop&w=800&q=80	210	f	\N	4.8	120	2026-11-16 06:15:04.378	\N	\N	f
recipe-kanda-poha	Mumbai Style Batata Kanda Poha	batata-kanda-poha	Fluffy flattened rice tossed with crunchy peanuts, diced potatoes, caramelized onions, mustard seeds, and fresh lime.	Maharashtrian	{"Pure Vegetarian",Vegetarian,Kid-Friendly}	{breakfast,snack}	10	15	4	Easy	240	5	42	6	3	https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=800&q=80	70	f	\N	4.8	120	2026-11-16 06:15:04.389	\N	\N	f
recipe-moong-dal-khichdi	Sattvic Moong Dal Khichdi with Desi Ghee	moong-dal-khichdi	The ultimate comforting, gut-healing Indian one-pot meal made with yellow moong dal, basmati rice, turmeric, and aromatic cumin ghee tadka.	Gujarati	{"Pure Vegetarian",Vegetarian,"Jain Friendly",Diabetic-Friendly,Kid-Friendly}	{lunch,dinner}	10	15	4	Easy	260	10	45	6	5	https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80	90	t	\N	4.8	120	2026-11-16 06:15:04.398	\N	\N	f
recipe-egg-curry	Dhaba Style Masala Egg Curry	dhaba-style-egg-curry	Golden shallow-fried boiled eggs enveloped in a spiced onion, tomato, and garam masala gravy.	North Indian	{Eggetarian,High-Protein,Gluten-Free}	{lunch,dinner}	15	20	4	Easy	280	14	12	18	3	https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80	130	f	\N	4.8	120	2026-11-16 06:15:04.408	\N	\N	f
recipe-khaman-dhokla	Surati Nylon Khaman Dhokla	surati-khaman-dhokla	Feather-light, spongy savory steamed cakes made from gram flour, drizzled with sweet-tangy mustard and green chilli tempering.	Gujarati	{"Pure Vegetarian",Vegetarian,"Jain Friendly",Kid-Friendly}	{breakfast,snack}	10	20	4	Easy	160	6	24	4	3	https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80	65	t	\N	4.8	120	2026-11-16 06:15:04.419	\N	\N	f
recipe-amritsari-chole	Authentic Amritsari Pindi Chole	amritsari-chole	Dark, tangy and robust Punjabi chickpeas slow-simmered with pomegranate seeds, amchoor, and aromatic whole spices.	Punjabi	{"Pure Vegetarian",Vegetarian,High-Protein,Gluten-Free}	{lunch,dinner}	15	30	4	Medium	320	16	48	8	11	https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80	110	f	\N	4.8	120	2026-11-16 06:15:04.43	\N	\N	f
recipe-dal-tadka	Dhaba Style Yellow Dal Tadka	dal-tadka	Creamy slow-simmered yellow toor and moong lentils finished with a double sizzling tadka of cow ghee, cumin, and garlic.	North Indian	{"Pure Vegetarian",Vegetarian,High-Protein,Gluten-Free}	{lunch,dinner}	10	20	4	Easy	210	11	32	6	7	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	85	f	\N	4.8	120	2026-11-16 06:15:04.443	\N	\N	f
recipe-aloo-gobi	Homestyle Adraki Aloo Gobi	adraki-aloo-gobi	Tender cauliflower florets and golden potatoes sautéed with loads of freshly julienned ginger, turmeric, and roasted cumin.	North Indian	{"Pure Vegetarian",Vegetarian,Vegan,Gluten-Free}	{lunch,dinner}	15	20	4	Easy	195	5	28	7	6	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80	75	f	\N	4.8	120	2026-11-16 06:15:04.452	\N	\N	f
recipe-rava-upma	Spiced Vegetable Rava Upma	rava-upma	Classic South Indian roasted semolina breakfast tempered with mustard, crunchy roasted peanuts, ginger, and curry leaves.	South Indian	{"Pure Vegetarian",Vegetarian,Kid-Friendly}	{breakfast,snack}	10	12	4	Easy	230	6	38	7	4	https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80	60	f	\N	4.8	120	2026-11-16 06:15:04.472	\N	\N	f
recipe-bhindi-masala	Chatpati Homestyle Bhindi Masala	bhindi-masala	Crisp-tender okra tossed in tangy amchoor, roasted coriander powder, cumin, and sliced green chillies.	North Indian	{"Pure Vegetarian",Vegetarian,Vegan,Gluten-Free,"Jain Friendly"}	{lunch,dinner}	15	15	4	Easy	165	4	16	9	5	https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80	70	t	\N	4.8	120	2026-11-16 06:15:04.481	\N	\N	f
recipe-sambhar-rice	Chennai Sambar Sadam (One-Pot Sambar Rice)	sambar-sadam	Hearty Tamil Nadu style one-pot rice and toor dal simmered with country vegetables, tangy tamarind, and fragrant ghee tadka.	South Indian	{"Pure Vegetarian",Vegetarian,Gluten-Free}	{lunch,dinner}	10	20	4	Easy	290	9	52	6	6	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	95	f	\N	4.8	120	2026-11-16 06:15:04.49	\N	\N	f
recipe-baingan-bharta	Dhaba Style Smoked Baingan Bharta	baingan-bharta	Charcoal-roasted large eggplant mashed and braised with browned onions, ripe tomatoes, fresh green chillies, and ginger.	Punjabi	{"Pure Vegetarian",Vegetarian,Vegan,Gluten-Free}	{lunch,dinner}	15	20	4	Medium	180	4	18	9	7	https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80	80	f	\N	4.8	120	2026-11-16 06:15:04.498	\N	\N	f
recipe-punjabi-chicken-curry	Dhaba Style Tariwala Chicken Curry	tariwala-chicken-curry	Rustic homestyle Punjabi chicken curry simmered in a golden onion-tomato gravy with bone-in chicken cuts, garlic, and freshly crushed spices.	Punjabi	{Non-Vegetarian,High-Protein,Gluten-Free}	{lunch,dinner}	15	30	4	Medium	340	28	10	16	3	https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80	280	f	\N	4.8	120	2026-11-16 06:15:04.508	\N	\N	f
recipe-bengali-macher-jhol	Authentic Bengali Macher Jhol	bengali-macher-jhol	Light and comforting Kolkata style fish curry made with fresh fish steaks, potato wedges, kalonji, turmeric, and green chillies in mustard oil.	Bengali	{Non-Vegetarian,High-Protein,Gluten-Free}	{lunch,dinner}	15	20	4	Medium	280	24	16	12	2	https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80	260	f	\N	4.8	120	2026-11-16 06:15:04.517	\N	\N	f
recipe-bengali-cholar-dal	Traditional Bengali Narkel Cholar Dal	bengali-cholar-dal	Festive festive Bengal chana dal slow-simmered with ginger, cumin, bay leaf, and crisp fried coconut chips. Naturally plant-based and Jain permissible.	Bengali	{"Pure Vegetarian",Vegetarian,Vegan,"Jain Friendly",High-Protein}	{lunch,dinner}	15	25	4	Easy	230	12	36	6	8	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	105	t	\N	4.8	120	2026-11-16 06:15:04.526	\N	\N	f
recipe-jain-paneer-bhurji	Sattvic Jain Malai Paneer Bhurji	jain-paneer-bhurji	Scrambled fresh paneer tossed with ripe country tomatoes, fresh green chillies, crushed kasuri methi, and fragrant cumin ghee tadka. 100% root-vegetable free.	North Indian	{"Pure Vegetarian",Vegetarian,"Jain Friendly",High-Protein,Gluten-Free}	{lunch,dinner}	10	12	4	Easy	280	16	8	20	2	https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80	160	t	\N	4.8	120	2026-11-16 06:15:04.535	\N	\N	f
recipe-jain-moong-dal-tadka	Sattvic Homestyle Moong Dal Tadka	jain-moong-dal-tadka	Golden yellow moong dal simmered with turmeric and tempered with sizzling cow ghee, cumin seeds, fresh curry leaves, and green chillies.	North Indian	{"Pure Vegetarian",Vegetarian,"Jain Friendly",High-Protein,Gluten-Free}	{lunch,dinner}	10	20	4	Easy	210	11	30	5	6	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	85	t	\N	4.8	120	2026-11-16 06:15:04.543	\N	\N	f
recipe-sev-tameta-nu-shaak	Kathiyawadi Sev Tameta nu Shaak	kathiyawadi-sev-tameta-nu-shaak	Iconic sweet, tangy, and spicy tomato curry tempered with mustard and cumin, topped with crisp Ratlami nylon sev right before serving.	Kathiyawadi	{"Pure Vegetarian",Vegetarian,"Jain Friendly"}	{lunch,dinner}	10	15	4	Easy	245	7.2	28.5	11.8	3.2	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	90	t	\N	4.8	120	2026-11-16 06:15:04.552	\N	\N	f
recipe-ringna-no-olo	Kathiyawadi Ringna no Olo (Baingan Bharta)	kathiyawadi-ringna-no-olo	Rustic Kathiyawadi roasted eggplant mash infused with green garlic, chillies, and mustard oil, served with hot Bajra no Rotlo.	Kathiyawadi	{"Pure Vegetarian",Vegetarian,Vegan,Gluten-Free}	{lunch,dinner}	15	25	4	Medium	165	3.8	18.2	8.5	6.2	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	95	f	Jain variation substitutes roasted green plantain or bottle gourd mash without garlic or onions.	4.8	120	2026-11-16 06:15:04.561	\N	\N	f
recipe-bajra-no-rotlo	Traditional Kathiyawadi Bajra no Rotlo	traditional-kathiyawadi-bajra-no-rotlo	Thick, wholesome gluten-free flatbread hand-patted from pearl millet flour and roasted on a clay tava, slathered with pure desi ghee.	Kathiyawadi	{"Pure Vegetarian",Vegetarian,Gluten-Free,"Jain Friendly"}	{lunch,dinner}	10	15	4	Medium	195	5.8	34.2	4.1	6	https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80	60	t	\N	4.8	120	2026-11-16 06:15:04.57	\N	\N	f
recipe-paneer-butter-masala	Restaurant Style Paneer Butter Masala	paneer-butter-masala	Tender cottage cheese cubes simmered in a velvety, rich tomato, cashew, and butter gravy perfumed with kasuri methi.	North Indian	{"Pure Vegetarian",Vegetarian,High-Protein}	{lunch,dinner}	15	25	4	Medium	380	16	14	28	4	https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80	280	f	Replace onion and garlic paste with pure tomato-ginger puree and a pinch of asafoetida (hing).	4.8	120	2026-11-16 06:15:04.273	\N	\N	f
recipe-idli-sambar	Steamed Idli with Drumstick Vegetable Sambar	idli-sambar	Pillowy soft fermented steamed rice cakes served with aromatic Madras lentil sambar and fresh coconut chutney.	South Indian	{"Pure Vegetarian",Vegetarian,Vegan,Gluten-Free,"Jain Friendly"}	{breakfast}	10	15	4	Easy	220	8	42	3	5	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80	90	t	\N	4.8	120	2026-11-16 06:15:04.462	\N	\N	f
recipe-bajra-no-rotlo-vegan	Kathiyawadi Bajra no Rotlo (Vegan / Til Oil)	kathiyawadi-bajra-no-rotlo-vegan	Authentic rustic Gujarati pearl millet flatbread hand-patted and roasted over fire, brushed with cold-pressed sesame oil (til tel) for a 100% plant-based, gluten-free traditional meal.	Kathiyawadi	{"Pure Vegetarian",Vegetarian,Vegan,Gluten-Free,"Jain Friendly"}	{lunch,dinner}	10	15	4	Medium	190	5.8	34.2	4	6	https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80	55	t	\N	4.8	120	2026-11-16 07:27:44.02	\N	\N	f
recipe-surati-undhiyu	Authentic Surati Undhiyu with Methi Muthiya	authentic-surati-undhiyu	Celebrated Gujarati winter specialty uniting tender Surti papdi, tuver lilva, purple yam, baby eggplants, and spiced fenugreek dumplings.	Gujarati	{"Pure Vegetarian",Vegetarian}	{lunch,dinner}	30	40	4	Advanced	385	11.2	48.6	16.5	10.5	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	180	f	Authentic Jain Undhiyu replaces purple yam and potatoes with firm raw green plantain (Kacha Kela) and extra Surti papdi.	4.8	120	2026-11-16 06:15:04.578	\N	\N	f
recipe-surati-undhiyu-jain	Authentic Jain Surati Undhiyu (Kacha Kela & Papdi)	authentic-jain-surati-undhiyu	Revered Jain Gujarati winter banquet preparation slow-cooked strictly without root vegetables, onions, or garlic, using fresh Surti papdi, tuver lilva, raw green plantain (kacha kela), and steamed methi muthiya.	Gujarati	{"Pure Vegetarian",Vegetarian,"Jain Friendly"}	{lunch,dinner}	30	35	4	Advanced	350	10.8	46.2	14.5	11	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	175	t	\N	4.8	120	2026-11-16 07:27:44.046	\N	\N	f
recipe-gujarati-dal-dhokli	Traditional Gujarati One-Pot Dal Dhokli	traditional-gujarati-dal-dhokli	Wholesome one-pot meal where thin spiced whole wheat pasta diamonds are simmered in a sweet, tangy, and aromatic toor dal curry.	Gujarati	{"Pure Vegetarian",Vegetarian,"Jain Friendly"}	{lunch,dinner}	20	25	4	Medium	320	12.5	52	6.8	7.8	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	110	t	\N	4.8	120	2026-11-16 06:15:04.588	\N	\N	f
recipe-gujarati-kadhi	Traditional Sweet & Sour Gujarati Kadhi	traditional-sweet-and-sour-gujarati-kadhi	Thin, soothing sweet-tangy soup made with churned yogurt and chickpea flour, tempered with cinnamon, cloves, mustard seeds, and curry leaves.	Gujarati	{"Pure Vegetarian",Vegetarian,Gluten-Free,"Jain Friendly"}	{lunch,dinner}	10	15	4	Easy	145	5.2	16.8	6.5	1.5	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	75	t	\N	4.8	120	2026-11-16 06:15:04.596	\N	\N	f
recipe-vaghireli-khichdi	Kathiyawadi Vaghireli Khichdi with Desi Ghee	kathiyawadi-vaghireli-khichdi	Comforting spicy tempered rice and split yellow moong dal infused with whole spices, tomatoes, curry leaves, and a generous dollop of ghee.	Kathiyawadi	{"Pure Vegetarian",Vegetarian,Gluten-Free,"Jain Friendly"}	{dinner}	10	20	4	Easy	285	9.8	46.5	6.8	5.2	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	80	t	\N	4.8	120	2026-11-16 06:15:04.605	\N	\N	f
recipe-gujarati-handvo	Gujarati Baked Vegetable Handvo (Savory Lentil Cake)	gujarati-baked-vegetable-handvo	Traditional Gujarati savory baked cake made with fermented rice and mixed lentils, bottle gourd, and a crunchy sesame-mustard seed crust.	Gujarati	{"Pure Vegetarian",Vegetarian,"Jain Friendly",Gluten-Free}	{breakfast,snack,dinner}	15	35	4	Medium	260	9.5	36.8	8.5	4.8	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	100	t	\N	4.8	120	2026-11-16 06:15:04.614	\N	\N	f
recipe-methi-na-gota	Crispy Gujarati Methi na Gota (Dakor Style)	crispy-gujarati-methi-na-gota	Pillowy soft inside and crisp outside fenugreek fritters spiced with crushed pepper, ajwain, and jaggery, famously served at Dakor temple.	Gujarati	{"Pure Vegetarian",Vegetarian,"Jain Friendly"}	{breakfast,snack}	15	15	4	Easy	230	7.8	26.2	10.5	4.2	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	70	t	\N	4.8	120	2026-11-16 06:15:04.624	\N	\N	f
rec-1794825533927	Kathiyawadi Ringan No Olo mwj4s4j1	kathiyawadi-ringan-no-olo-mwj4s4j1	Smoky roasted eggplant mash with green garlic and Kathiyawadi spices.	Kathiyawadi	{PURE_VEGETARIAN,GLUTEN_FREE}	{LUNCH,DINNER}	20	30	4	Medium	280	12	45	10	6	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80	120	f	\N	5	1	2026-11-16 10:38:53.931	\N	\N	f
rec-1794825620862	Kathiyawadi Ringan No Olo mwj4tzkq	kathiyawadi-ringan-no-olo-mwj4tzkq	Smoky roasted eggplant mash with green garlic and Kathiyawadi spices.	Kathiyawadi	{PURE_VEGETARIAN,GLUTEN_FREE}	{LUNCH,DINNER}	20	30	4	Medium	280	12	45	10	6	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80	120	f	\N	5	1	2026-11-16 10:40:20.868	\N	\N	f
rec-1794825702604	Kathiyawadi Ringan No Olo mwj4vql1	kathiyawadi-ringan-no-olo-mwj4vql1	Smoky roasted eggplant mash with green garlic and Kathiyawadi spices.	Kathiyawadi	{PURE_VEGETARIAN,GLUTEN_FREE}	{LUNCH,DINNER}	20	30	4	Medium	280	12	45	10	6	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80	120	f	\N	5	1	2026-11-16 10:41:42.606	\N	\N	f
rec-1794825826443	Kathiyawadi Ringan No Olo mwj4ye8x	kathiyawadi-ringan-no-olo-mwj4ye8x	Smoky roasted eggplant mash with green garlic and Kathiyawadi spices.	Kathiyawadi	{PURE_VEGETARIAN,GLUTEN_FREE}	{LUNCH,DINNER}	20	30	4	Medium	280	12	45	10	6	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80	120	f	\N	5	1	2026-11-16 10:43:46.445	\N	\N	f
rec-1794826319880	Kathiyawadi Ringan No Olo mwj58z1h	kathiyawadi-ringan-no-olo-mwj58z1h	Smoky roasted eggplant mash with green garlic and Kathiyawadi spices.	Kathiyawadi	{PURE_VEGETARIAN,GLUTEN_FREE}	{LUNCH,DINNER}	20	30	4	Medium	280	12	45	10	6	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80	120	f	\N	5	1	2026-11-16 10:51:59.882	\N	\N	f
rec-1794826554152	Kathiyawadi Ringan No Olo mwj5dzq9	kathiyawadi-ringan-no-olo-mwj5dzq9	Smoky roasted eggplant mash with green garlic and Kathiyawadi spices.	Kathiyawadi	{PURE_VEGETARIAN,GLUTEN_FREE}	{LUNCH,DINNER}	20	30	4	Medium	280	12	45	10	6	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80	120	f	\N	5	1	2026-11-16 10:55:54.16	\N	\N	f
rec-1794826680717	Kathiyawadi Ringan No Olo mwj5gp68	kathiyawadi-ringan-no-olo-mwj5gp68	Smoky roasted eggplant mash with green garlic and Kathiyawadi spices.	Kathiyawadi	{PURE_VEGETARIAN,GLUTEN_FREE}	{LUNCH,DINNER}	20	30	4	Medium	280	12	45	10	6	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80	120	f	\N	5	1	2026-11-16 10:58:00.723	\N	\N	f
rec-1794827423003	Kathiyawadi Ringan No Olo mwj5wm2p	kathiyawadi-ringan-no-olo-mwj5wm2p	Smoky roasted eggplant mash with green garlic and Kathiyawadi spices.	Kathiyawadi	{PURE_VEGETARIAN,GLUTEN_FREE}	{LUNCH,DINNER}	20	30	4	Medium	280	12	45	10	6	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80	120	f	\N	5	1	2026-11-16 11:10:23.007	\N	\N	f
rec-1794828591141	Kathiyawadi Ringan No Olo mwj6lngd	kathiyawadi-ringan-no-olo-mwj6lngd	Smoky roasted eggplant mash with green garlic and Kathiyawadi spices.	Kathiyawadi	{PURE_VEGETARIAN,GLUTEN_FREE}	{LUNCH,DINNER}	20	30	4	Medium	280	12	45	10	6	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80	120	f	\N	5	1	2026-11-16 11:29:51.147	\N	\N	f
rec-1794829219790	Kathiyawadi Ringan No Olo mwj6z4en	kathiyawadi-ringan-no-olo-mwj6z4en	Smoky roasted eggplant mash with green garlic and Kathiyawadi spices.	Kathiyawadi	{PURE_VEGETARIAN,GLUTEN_FREE}	{LUNCH,DINNER}	20	30	4	Medium	280	12	45	10	6	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80	120	f	\N	5	1	2026-11-16 11:40:19.794	\N	\N	f
\.


--
-- Data for Name: RecipeIngredient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RecipeIngredient" (id, "recipeId", "ingredientId", quantity, unit, notes) FROM stdin;
cmwivcv2u0001l3q4pr3t4b65	recipe-paneer-butter-masala	ing-paneer	300	g	fresh malai paneer cut into 1-inch cubes
cmwivcv2u0002l3q4xw233db3	recipe-paneer-butter-masala	ing-butter	40	g	Amul salted butter
cmwivcv2u0003l3q4dqzwou15	recipe-paneer-butter-masala	ing-tomato	400	g	finely pureed
cmwivcv2u0004l3q4q14dcxbb	recipe-paneer-butter-masala	ing-onion	150	g	finely chopped
cmwivcv2u0005l3q45dfsv3cj	recipe-paneer-butter-masala	ing-ginger	20	g	minced
cmwivcv2u0006l3q4xb1vxryt	recipe-paneer-butter-masala	ing-garlic	15	g	minced
cmwivcv2u0007l3q4yxze19jo	recipe-paneer-butter-masala	ing-kasuri-methi	5	g	toasted and crushed
cmwivcv2u0008l3q4yaob2f4e	recipe-paneer-butter-masala	ing-garam-masala	5	g	freshly ground
cmwivcv2u0009l3q46rn9lx0j	recipe-paneer-butter-masala	ing-red-chilli-powder	10	g	Kashmiri for vibrant red color
cmwivcv2u000al3q4sxzbzxwa	recipe-paneer-butter-masala	ing-oil	20	ml	\N
cmwivcv2u000bl3q437c45zus	recipe-paneer-butter-masala	ing-salt	8	g	\N
cmwivcv44000il3q4x7gg833w	recipe-gujarati-khatti-meethi-dal	ing-toor-dal	200	g	unpolished toor dal rinsed and soaked
cmwivcv44000jl3q4mdfpliaf	recipe-gujarati-khatti-meethi-dal	ing-tomato	150	g	diced
cmwivcv44000kl3q412q2jmob	recipe-gujarati-khatti-meethi-dal	ing-peanuts	30	g	raw peanuts boiled with dal
cmwivcv44000ll3q4my3xhhm3	recipe-gujarati-khatti-meethi-dal	ing-jaggery	25	g	grated organic jaggery
cmwivcv44000ml3q4t4d93svt	recipe-gujarati-khatti-meethi-dal	ing-lemon	1	piece	freshly squeezed
cmwivcv44000nl3q45ht4fw5j	recipe-gujarati-khatti-meethi-dal	ing-ginger	15	g	grated
cmwivcv44000ol3q4beo5sjo0	recipe-gujarati-khatti-meethi-dal	ing-green-chilli	10	g	slit lengthwise
cmwivcv44000pl3q4qeg3clh0	recipe-gujarati-khatti-meethi-dal	ing-ghee	20	g	for royal Gujarati tadka
cmwivcv44000ql3q4nrpd38m8	recipe-gujarati-khatti-meethi-dal	ing-mustard-seeds	5	g	\N
cmwivcv44000rl3q4p3zt2ljv	recipe-gujarati-khatti-meethi-dal	ing-cumin-seeds	5	g	\N
cmwivcv44000sl3q48mck336i	recipe-gujarati-khatti-meethi-dal	ing-curry-leaves	1	bunch	\N
cmwivcv44000tl3q42lhy49b1	recipe-gujarati-khatti-meethi-dal	ing-coriander	1	bunch	finely chopped
cmwivcv44000ul3q4xdbcfy69	recipe-gujarati-khatti-meethi-dal	ing-turmeric	5	g	\N
cmwivcv44000vl3q4axt64c99	recipe-gujarati-khatti-meethi-dal	ing-salt	8	g	\N
cmwivcv4l0012l3q4zhkq8zxk	recipe-methi-thepla	ing-atta	300	g	Aashirvaad chakki atta
cmwivcv4l0013l3q4jh7tpiri	recipe-methi-thepla	ing-besan	50	g	for crispness
cmwivcv4l0014l3q4o398koeq	recipe-methi-thepla	ing-fenugreek	150	g	fresh methi leaves washed and finely chopped
cmwivcv4l0015l3q4m2im124i	recipe-methi-thepla	ing-curd	60	g	fresh dahi keeps them soft
cmwivcv4l0016l3q4a7ibxth1	recipe-methi-thepla	ing-oil	30	ml	\N
cmwivcv4l0017l3q4apyfvy4h	recipe-methi-thepla	ing-turmeric	5	g	\N
cmwivcv4l0018l3q445fp5n62	recipe-methi-thepla	ing-red-chilli-powder	5	g	\N
cmwivcv4l0019l3q472qnj4r5	recipe-methi-thepla	ing-coriander-powder	5	g	\N
cmwivcv4l001al3q4a607m8ew	recipe-methi-thepla	ing-salt	6	g	\N
cmwivcv4x001hl3q4ayqv1yeu	recipe-masala-dosa	ing-dosa-batter	600	ml	fresh fermented batter
cmwivcv4x001il3q4czr6nx6r	recipe-masala-dosa	ing-potato	400	g	boiled and mashed coarsely
cmwivcv4x001jl3q4vpg4el2s	recipe-masala-dosa	ing-onion	120	g	thinly sliced
cmwivcv4x001kl3q49x8keo7d	recipe-masala-dosa	ing-green-chilli	15	g	finely chopped
cmwivcv4x001ll3q4z8v9czy6	recipe-masala-dosa	ing-curry-leaves	1	bunch	\N
cmwivcv4x001ml3q4e32c6aks	recipe-masala-dosa	ing-mustard-seeds	5	g	\N
cmwivcv4x001nl3q4o4s6ump3	recipe-masala-dosa	ing-turmeric	5	g	\N
cmwivcv4x001ol3q4h6kx8nvl	recipe-masala-dosa	ing-ghee	40	g	for crisp buttery roasting
cmwivcv4x001pl3q4zcr4rncs	recipe-masala-dosa	ing-oil	20	ml	\N
cmwivcv4x001ql3q4fcw8z59o	recipe-masala-dosa	ing-coriander	1	bunch	\N
cmwivcv4x001rl3q4t9zb0ibs	recipe-masala-dosa	ing-salt	8	g	\N
cmwivcv5a001yl3q4kqsp5pr5	recipe-rajma-chawal	ing-rajma	250	g	soaked overnight for 8 hours
cmwivcv5a001zl3q4x5slpf5o	recipe-rajma-chawal	ing-basmati-rice	300	g	aged long grain
cmwivcv5a0020l3q4ujbzi5rc	recipe-rajma-chawal	ing-onion	200	g	finely chopped
cmwivcv5a0021l3q4md4zo25q	recipe-rajma-chawal	ing-tomato	250	g	pureed
cmwivcv5a0022l3q4drogqb2g	recipe-rajma-chawal	ing-ginger	20	g	\N
cmwivcv5a0023l3q4k3yns56d	recipe-rajma-chawal	ing-garlic	20	g	\N
cmwivcv5a0024l3q4m6z9eazo	recipe-rajma-chawal	ing-cumin-seeds	8	g	\N
cmwivcv5a0025l3q4tre84x66	recipe-rajma-chawal	ing-garam-masala	6	g	\N
cmwivcv5a0026l3q4j1rgib5u	recipe-rajma-chawal	ing-red-chilli-powder	8	g	\N
cmwivcv5a0027l3q4azudgm6y	recipe-rajma-chawal	ing-ghee	25	g	\N
cmwivcv5a0028l3q4xqwqirik	recipe-rajma-chawal	ing-salt	10	g	\N
cmwivcv5m002fl3q4bgracx24	recipe-palak-paneer	ing-palak	500	g	fresh leaves washed thoroughly
cmwivcv5m002gl3q4wvarpnsj	recipe-palak-paneer	ing-paneer	250	g	soft cubes
cmwivcv5m002hl3q4sfeutilc	recipe-palak-paneer	ing-onion	100	g	finely minced
cmwivcv5m002il3q4f0cch32p	recipe-palak-paneer	ing-garlic	25	g	slivered and roasted
cmwivcv5m002jl3q49h3u9e8u	recipe-palak-paneer	ing-ginger	15	g	\N
cmwivcv5m002kl3q40hsxezed	recipe-palak-paneer	ing-green-chilli	10	g	\N
cmwivcv5m002ll3q4k3v9nn4d	recipe-palak-paneer	ing-butter	25	g	\N
cmwivcv5m002ml3q4psjogkmt	recipe-palak-paneer	ing-cumin-seeds	5	g	\N
cmwivcv5m002nl3q4ct31zjfr	recipe-palak-paneer	ing-garam-masala	4	g	\N
cmwivcv5m002ol3q4rchzoa27	recipe-palak-paneer	ing-salt	6	g	\N
cmwivcv5w002vl3q4bru1zb1z	recipe-kanda-poha	ing-poha	250	g	thick poha rinsed gently in colander
cmwivcv5w002wl3q4fwgfzja4	recipe-kanda-poha	ing-onion	120	g	finely sliced
cmwivcv5w002xl3q4ho23h6v0	recipe-kanda-poha	ing-potato	150	g	small cubes for quick cooking
cmwivcv5x002yl3q4my87y3e4	recipe-kanda-poha	ing-peanuts	40	g	roasted to a crisp
cmwivcv5x002zl3q4o1d0i03o	recipe-kanda-poha	ing-green-chilli	10	g	\N
cmwivcv5x0030l3q41t6eka73	recipe-kanda-poha	ing-mustard-seeds	5	g	\N
cmwivcv5x0031l3q43kpehjmm	recipe-kanda-poha	ing-curry-leaves	1	bunch	\N
cmwivcv5x0032l3q4xdi4ywfc	recipe-kanda-poha	ing-turmeric	5	g	\N
cmwivcv5x0033l3q4gune73q4	recipe-kanda-poha	ing-lemon	1	piece	\N
cmwivcv5x0034l3q4w8je93x1	recipe-kanda-poha	ing-oil	20	ml	\N
cmwivcv5x0035l3q4yz1byn51	recipe-kanda-poha	ing-coriander	1	bunch	\N
cmwivcv5x0036l3q4lbycuk0z	recipe-kanda-poha	ing-salt	6	g	\N
cmwivcv66003dl3q4k59zedq5	recipe-moong-dal-khichdi	ing-basmati-rice	150	g	\N
cmwivcv66003el3q498zwvt5f	recipe-moong-dal-khichdi	ing-moong-dal	150	g	split yellow moong dal
cmwivcv66003fl3q4nyt7dsnq	recipe-moong-dal-khichdi	ing-ghee	30	g	pure cow ghee
cmwivcv66003gl3q4ci1vltke	recipe-moong-dal-khichdi	ing-cumin-seeds	8	g	\N
cmwivcv66003hl3q4gwdc56sj	recipe-moong-dal-khichdi	ing-turmeric	5	g	\N
cmwivcv66003il3q40cminoy9	recipe-moong-dal-khichdi	ing-green-chilli	10	g	slit
cmwivcv66003jl3q48krtexcf	recipe-moong-dal-khichdi	ing-salt	8	g	\N
cmwivcv6g003ql3q4s70arbnk	recipe-egg-curry	ing-eggs	8	piece	hard boiled and peeled
cmwivcv6g003rl3q49fvbflph	recipe-egg-curry	ing-onion	180	g	finely chopped
cmwivcv6g003sl3q4fy30mhae	recipe-egg-curry	ing-tomato	200	g	crushed
cmwivcv6g003tl3q4m3uom61w	recipe-egg-curry	ing-ginger	15	g	\N
cmwivcv6g003ul3q4tlzambuy	recipe-egg-curry	ing-garlic	15	g	\N
cmwivcv6g003vl3q49f14x6w8	recipe-egg-curry	ing-turmeric	5	g	\N
cmwivcv6g003wl3q4j3n2zddo	recipe-egg-curry	ing-red-chilli-powder	8	g	\N
cmwivcv6g003xl3q4v93np4e4	recipe-egg-curry	ing-garam-masala	5	g	\N
cmwivcv6g003yl3q4aefbfiuj	recipe-egg-curry	ing-oil	30	ml	\N
cmwivcv6g003zl3q4u6zm97zr	recipe-egg-curry	ing-salt	8	g	\N
cmwivcv6r0046l3q4tkdo3ztz	recipe-khaman-dhokla	ing-besan	200	g	fine gram flour sieved
cmwivcv6r0047l3q4hv2a9a1x	recipe-khaman-dhokla	ing-green-chilli	10	g	slit for tempering
cmwivcv6r0048l3q4i6mqtby3	recipe-khaman-dhokla	ing-mustard-seeds	5	g	\N
cmwivcv6r0049l3q44m72z89i	recipe-khaman-dhokla	ing-curry-leaves	1	bunch	\N
cmwivcv6r004al3q4fml0rnuz	recipe-khaman-dhokla	ing-lemon	1	piece	\N
cmwivcv6r004bl3q4rk66hsj3	recipe-khaman-dhokla	ing-oil	20	ml	\N
cmwivcv6r004cl3q4i3v64tvc	recipe-khaman-dhokla	ing-turmeric	2	g	\N
cmwivcv6r004dl3q47nhy91fn	recipe-khaman-dhokla	ing-salt	6	g	\N
cmwivcv72004kl3q4vytpqaxd	recipe-amritsari-chole	ing-kabuli-chana	250	g	soaked overnight
cmwivcv72004ll3q4cmrnjtfu	recipe-amritsari-chole	ing-onion	150	g	finely pureed
cmwivcv72004ml3q433bwxi13	recipe-amritsari-chole	ing-tomato	200	g	crushed
cmwivcv72004nl3q4xbf8gbhd	recipe-amritsari-chole	ing-ginger	15	g	julienned
cmwivcv72004ol3q4xbebn1zp	recipe-amritsari-chole	ing-garlic	15	g	minced
cmwivcv72004pl3q4ywzi303p	recipe-amritsari-chole	ing-chole-masala	15	g	\N
cmwivcv72004ql3q4m6x2kq6h	recipe-amritsari-chole	ing-ghee	20	g	\N
cmwivcv72004rl3q4047gymtv	recipe-amritsari-chole	ing-turmeric	5	g	\N
cmwivcv72004sl3q4v0g2h6q0	recipe-amritsari-chole	ing-red-chilli-powder	8	g	\N
cmwivcv72004tl3q4crwnbngt	recipe-amritsari-chole	ing-salt	8	g	\N
cmwivcv7f004zl3q48p9nlpm7	recipe-dal-tadka	ing-toor-dal	150	g	\N
cmwivcv7f0050l3q492qvaoh7	recipe-dal-tadka	ing-moong-dal	50	g	\N
cmwivcv7f0051l3q4fs2rtp99	recipe-dal-tadka	ing-tomato	120	g	\N
cmwivcv7f0052l3q47u7fzhen	recipe-dal-tadka	ing-onion	100	g	\N
cmwivcv7f0053l3q4v6oqrok3	recipe-dal-tadka	ing-garlic	15	g	thinly sliced
cmwivcv7f0054l3q4a7pdrvtw	recipe-dal-tadka	ing-ghee	25	g	\N
cmwivcv7f0055l3q4mpfdasqn	recipe-dal-tadka	ing-cumin-seeds	6	g	\N
cmwivcv7f0056l3q4q5ajeju7	recipe-dal-tadka	ing-turmeric	5	g	\N
cmwivcv7f0057l3q49enqk0jx	recipe-dal-tadka	ing-salt	8	g	\N
cmwivcv7o005cl3q4ksz6ci0c	recipe-aloo-gobi	ing-cauliflower	350	g	cut into medium florets
cmwivcv7o005dl3q4ms0up62r	recipe-aloo-gobi	ing-potato	250	g	peeled and diced
cmwivcv7o005el3q4rtk3q7zi	recipe-aloo-gobi	ing-tomato	120	g	\N
cmwivcv7o005fl3q4u27h3wpl	recipe-aloo-gobi	ing-ginger	25	g	copious juliennes
cmwivcv7o005gl3q4aqk9qwda	recipe-aloo-gobi	ing-green-chilli	10	g	\N
cmwivcv7o005hl3q4ms0xtwl3	recipe-aloo-gobi	ing-oil	25	ml	\N
cmwivcv7o005il3q43pint4bs	recipe-aloo-gobi	ing-cumin-seeds	5	g	\N
cmwivcv7o005jl3q4a4emtis4	recipe-aloo-gobi	ing-turmeric	5	g	\N
cmwivcv7o005kl3q45ihgfqp7	recipe-aloo-gobi	ing-coriander-powder	6	g	\N
cmwivcv7o005ll3q4avn12cbh	recipe-aloo-gobi	ing-salt	6	g	\N
cmwivcv7x005rl3q44ei0xkjx	recipe-idli-sambar	ing-dosa-batter	600	ml	fresh fermented idli batter
cmwivcv7x005sl3q4rl7qbyf1	recipe-idli-sambar	ing-toor-dal	120	g	\N
cmwivcv7x005tl3q4h1joudsf	recipe-idli-sambar	ing-tomato	100	g	\N
cmwivcv7x005ul3q4jpi944fb	recipe-idli-sambar	ing-sambar-powder	15	g	\N
cmwivcv7x005vl3q47dtgzuxl	recipe-idli-sambar	ing-mustard-seeds	5	g	\N
cmwivcv7x005wl3q4v3p4bs3h	recipe-idli-sambar	ing-curry-leaves	1	bunch	\N
cmwivcv7x005xl3q419xp5ff5	recipe-idli-sambar	ing-ghee	15	g	\N
cmwivcv7x005yl3q4p2aq5exu	recipe-idli-sambar	ing-salt	8	g	\N
cmwivcv880063l3q47a2yhevo	recipe-rava-upma	ing-rava	200	g	roasted golden sooji
cmwivcv880064l3q4by2a815k	recipe-rava-upma	ing-peanuts	30	g	\N
cmwivcv880065l3q4zrkc8a53	recipe-rava-upma	ing-ginger	10	g	finely minced
cmwivcv880066l3q4f8qjk5i8	recipe-rava-upma	ing-green-chilli	10	g	\N
cmwivcv880067l3q481vqcl6q	recipe-rava-upma	ing-mustard-seeds	5	g	\N
cmwivcv880068l3q47bj5dfj7	recipe-rava-upma	ing-curry-leaves	1	bunch	\N
cmwivcv880069l3q4bkuj5cg0	recipe-rava-upma	ing-ghee	20	g	\N
cmwivcv88006al3q4sw2t9q01	recipe-rava-upma	ing-lemon	1	piece	\N
cmwivcv88006bl3q48lnmc5xm	recipe-rava-upma	ing-salt	6	g	\N
cmwivcv8g006hl3q4984fqmo7	recipe-bhindi-masala	ing-bhindi	400	g	washed, dried thoroughly, and sliced
cmwivcv8g006il3q4i9iokkuz	recipe-bhindi-masala	ing-tomato	100	g	\N
cmwivcv8g006jl3q495mg5c06	recipe-bhindi-masala	ing-green-chilli	10	g	\N
cmwivcv8h006kl3q43n6pk5sw	recipe-bhindi-masala	ing-oil	30	ml	\N
cmwivcv8h006ll3q4fuv7tlr7	recipe-bhindi-masala	ing-turmeric	5	g	\N
cmwivcv8h006ml3q4t488zaiq	recipe-bhindi-masala	ing-coriander-powder	8	g	\N
cmwivcv8h006nl3q435129c8o	recipe-bhindi-masala	ing-red-chilli-powder	5	g	\N
cmwivcv8h006ol3q4hcy87kv1	recipe-bhindi-masala	ing-salt	6	g	\N
cmwivcv8q006tl3q4we545pqi	recipe-sambhar-rice	ing-basmati-rice	180	g	\N
cmwivcv8q006ul3q4f625buto	recipe-sambhar-rice	ing-toor-dal	120	g	\N
cmwivcv8q006vl3q4huafa6a9	recipe-sambhar-rice	ing-tomato	120	g	\N
cmwivcv8q006wl3q4nfsm7lzr	recipe-sambhar-rice	ing-onion	100	g	\N
cmwivcv8q006xl3q4eauinrp4	recipe-sambhar-rice	ing-sambar-powder	18	g	\N
cmwivcv8q006yl3q4soad0h3f	recipe-sambhar-rice	ing-mustard-seeds	5	g	\N
cmwivcv8q006zl3q4jhni1n9y	recipe-sambhar-rice	ing-curry-leaves	1	bunch	\N
cmwivcv8q0070l3q4c7w2x0w6	recipe-sambhar-rice	ing-ghee	25	g	\N
cmwivcv8q0071l3q44bdsbclq	recipe-sambhar-rice	ing-salt	8	g	\N
cmwivcv8y0077l3q4kzptyfq5	recipe-baingan-bharta	ing-baingan	500	g	roasted over open flame until skin blisters black
cmwivcv8y0078l3q4i4zah7nr	recipe-baingan-bharta	ing-onion	150	g	finely chopped
cmwivcv8y0079l3q4u0m6lp63	recipe-baingan-bharta	ing-tomato	180	g	finely chopped
cmwivcv8y007al3q4yujngmvx	recipe-baingan-bharta	ing-garlic	15	g	minced
cmwivcv8y007bl3q4ekieo26x	recipe-baingan-bharta	ing-ginger	15	g	finely chopped
cmwivcv8y007cl3q4sxydf1tn	recipe-baingan-bharta	ing-green-chilli	10	g	\N
cmwivcv8y007dl3q47tw1z4fu	recipe-baingan-bharta	ing-oil	30	ml	mustard oil
cmwivcv8y007el3q4qyjdmge4	recipe-baingan-bharta	ing-turmeric	5	g	\N
cmwivcv8y007fl3q4wpuvzwz9	recipe-baingan-bharta	ing-red-chilli-powder	6	g	\N
cmwivcv8y007gl3q4l0xkpi2x	recipe-baingan-bharta	ing-salt	7	g	\N
cmwivcv98007ml3q44gpq0rip	recipe-punjabi-chicken-curry	ing-chicken	500	g	curry cut bone-in
cmwivcv98007nl3q4fs8efhqn	recipe-punjabi-chicken-curry	ing-onion	200	g	finely sliced
cmwivcv98007ol3q4i518r8pw	recipe-punjabi-chicken-curry	ing-tomato	200	g	pureed
cmwivcv98007pl3q4mx9ilcbp	recipe-punjabi-chicken-curry	ing-ginger	20	g	crushed
cmwivcv98007ql3q4owgf34g3	recipe-punjabi-chicken-curry	ing-garlic	20	g	crushed
cmwivcv98007rl3q4yr4jpdpo	recipe-punjabi-chicken-curry	ing-oil	30	ml	mustard oil
cmwivcv98007sl3q4r5i22pi5	recipe-punjabi-chicken-curry	ing-turmeric	5	g	\N
cmwivcv98007tl3q4jj2v7jtb	recipe-punjabi-chicken-curry	ing-red-chilli-powder	8	g	\N
cmwivcv98007ul3q4rncpfp6v	recipe-punjabi-chicken-curry	ing-garam-masala	6	g	\N
cmwivcv98007vl3q4ao5x5k2i	recipe-punjabi-chicken-curry	ing-coriander	1	bunch	\N
cmwivcv98007wl3q4xd1y871b	recipe-punjabi-chicken-curry	ing-salt	10	g	\N
cmwivcv9h0083l3q4xff0ubdq	recipe-bengali-macher-jhol	ing-fish	400	g	fresh Rohu or Katla steaks
cmwivcv9h0084l3q4vkbm6wkm	recipe-bengali-macher-jhol	ing-potato	150	g	cut into long wedges
cmwivcv9h0085l3q4fq8arbj2	recipe-bengali-macher-jhol	ing-tomato	100	g	sliced
cmwivcv9h0086l3q47qwie25w	recipe-bengali-macher-jhol	ing-ginger	15	g	paste
cmwivcv9h0087l3q4h3q0n5c0	recipe-bengali-macher-jhol	ing-green-chilli	10	g	slit
cmwivcv9h0088l3q46e8jc89v	recipe-bengali-macher-jhol	ing-oil	25	ml	pure mustard oil
cmwivcv9h0089l3q4jkroembd	recipe-bengali-macher-jhol	ing-cumin-seeds	5	g	\N
cmwivcv9h008al3q4b9odufkq	recipe-bengali-macher-jhol	ing-turmeric	6	g	\N
cmwivcv9h008bl3q41cued1sc	recipe-bengali-macher-jhol	ing-salt	8	g	\N
cmwivcv9q008hl3q4dgn16fhc	recipe-bengali-cholar-dal	ing-chana-dal	200	g	soaked for 1 hour
cmwivcv9q008il3q49ulcbm3o	recipe-bengali-cholar-dal	ing-green-chilli	10	g	slit
cmwivcv9q008jl3q4oeub92b8	recipe-bengali-cholar-dal	ing-oil	20	ml	mustard oil or refined oil
cmwivcv9q008kl3q4b4qckrp4	recipe-bengali-cholar-dal	ing-cumin-seeds	5	g	\N
cmwivcv9q008ll3q4lusbcgmu	recipe-bengali-cholar-dal	ing-turmeric	5	g	\N
cmwivcv9q008ml3q47v4rwm1y	recipe-bengali-cholar-dal	ing-salt	8	g	\N
cmwivcv9z008sl3q4vciu90u4	recipe-jain-paneer-bhurji	ing-paneer	300	g	freshly crumbled
cmwivcv9z008tl3q420ngzgki	recipe-jain-paneer-bhurji	ing-tomato	200	g	finely chopped
cmwivcv9z008ul3q48li9hvzg	recipe-jain-paneer-bhurji	ing-green-chilli	10	g	finely minced
cmwivcv9z008vl3q4v3mov9q0	recipe-jain-paneer-bhurji	ing-ghee	25	g	desi cow ghee
cmwivcv9z008wl3q44cy7rz6t	recipe-jain-paneer-bhurji	ing-cumin-seeds	6	g	\N
cmwivcv9z008xl3q4gf6ef6kc	recipe-jain-paneer-bhurji	ing-turmeric	4	g	\N
cmwivcv9z008yl3q4u5kal6p6	recipe-jain-paneer-bhurji	ing-kasuri-methi	4	g	\N
cmwivcv9z008zl3q44zuty3sm	recipe-jain-paneer-bhurji	ing-coriander	1	bunch	\N
cmwivcv9z0090l3q40sk7wxs5	recipe-jain-paneer-bhurji	ing-salt	6	g	\N
cmwivcva70096l3q4inti3pmj	recipe-jain-moong-dal-tadka	ing-moong-dal	200	g	washed yellow split moong dal
cmwivcva70097l3q4uelpgmbb	recipe-jain-moong-dal-tadka	ing-tomato	150	g	finely chopped
cmwivcva70098l3q4x1j3uex2	recipe-jain-moong-dal-tadka	ing-green-chilli	10	g	\N
cmwivcva70099l3q4wgfmxxd5	recipe-jain-moong-dal-tadka	ing-curry-leaves	1	bunch	\N
cmwivcva7009al3q42m04t0c1	recipe-jain-moong-dal-tadka	ing-ghee	20	g	\N
cmwivcva7009bl3q4e0es9yw5	recipe-jain-moong-dal-tadka	ing-cumin-seeds	6	g	\N
cmwivcva7009cl3q4o1h4m952	recipe-jain-moong-dal-tadka	ing-turmeric	5	g	\N
cmwivcva7009dl3q4jjs4bqy6	recipe-jain-moong-dal-tadka	ing-coriander	1	bunch	\N
cmwivcva7009el3q4rxbifg0f	recipe-jain-moong-dal-tadka	ing-salt	8	g	\N
cmwivcvag009kl3q42l0696af	recipe-sev-tameta-nu-shaak	ing-tomato	350	g	juicy country tomatoes chopped
cmwivcvag009ll3q4vghjdqvh	recipe-sev-tameta-nu-shaak	ing-sev	100	g	crisp nylon sev
cmwivcvag009ml3q4o8mptt00	recipe-sev-tameta-nu-shaak	ing-green-chilli	10	g	\N
cmwivcvag009nl3q4905w9pu7	recipe-sev-tameta-nu-shaak	ing-oil	25	ml	\N
cmwivcvag009ol3q4gcnzfvyh	recipe-sev-tameta-nu-shaak	ing-mustard-seeds	5	g	\N
cmwivcvag009pl3q4nu397fom	recipe-sev-tameta-nu-shaak	ing-cumin-seeds	5	g	\N
cmwivcvag009ql3q4dr0lyt9h	recipe-sev-tameta-nu-shaak	ing-turmeric	4	g	\N
cmwivcvag009rl3q4w57ljvlb	recipe-sev-tameta-nu-shaak	ing-red-chilli-powder	8	g	\N
cmwivcvag009sl3q4dx2rs9rq	recipe-sev-tameta-nu-shaak	ing-coriander-powder	10	g	\N
cmwivcvag009tl3q42cx4hwc5	recipe-sev-tameta-nu-shaak	ing-jaggery	20	g	desi jaggery for authentic balance
cmwivcvag009ul3q4w10pn7ho	recipe-sev-tameta-nu-shaak	ing-salt	8	g	\N
cmwivcvag009vl3q4u3x4ozfv	recipe-sev-tameta-nu-shaak	ing-coriander	1	bunch	\N
cmwivcvag009wl3q484rwwgig	recipe-sev-tameta-nu-shaak	ing-hing	2	g	\N
cmwivcvap00a2l3q43my2os66	recipe-ringna-no-olo	ing-baingan	600	g	large round purple eggplant
cmwivcvap00a3l3q4cxlua3m4	recipe-ringna-no-olo	ing-tomato	200	g	finely chopped
cmwivcvap00a4l3q4qw3eahb4	recipe-ringna-no-olo	ing-green-chilli	20	g	spicy green chillies
cmwivcvap00a5l3q4zx0za04h	recipe-ringna-no-olo	ing-garlic	20	g	fresh or green garlic crushed
cmwivcvap00a6l3q410eufumo	recipe-ringna-no-olo	ing-ginger	15	g	grated
cmwivcvap00a7l3q4f6h7samm	recipe-ringna-no-olo	ing-oil	35	ml	\N
cmwivcvap00a8l3q4t445wisk	recipe-ringna-no-olo	ing-red-chilli-powder	10	g	\N
cmwivcvap00a9l3q4mun0wfxr	recipe-ringna-no-olo	ing-turmeric	5	g	\N
cmwivcvap00aal3q41rojqd8n	recipe-ringna-no-olo	ing-coriander-powder	10	g	\N
cmwivcvap00abl3q4n90n613x	recipe-ringna-no-olo	ing-salt	10	g	\N
cmwivcvap00acl3q42zuze2bh	recipe-ringna-no-olo	ing-coriander	1	bunch	\N
cmwivcvax00ajl3q4pii6e0kj	recipe-bajra-no-rotlo	ing-bajra-flour	350	g	fresh stone-ground pearl millet flour
cmwivcvax00akl3q4ei90t1tz	recipe-bajra-no-rotlo	ing-salt	6	g	\N
cmwivcvax00all3q462ygpprc	recipe-bajra-no-rotlo	ing-ghee	25	g	desi cow ghee for brushing
cmwivcvb600arl3q4ik82m3y8	recipe-surati-undhiyu	ing-surti-papdi	250	g	fresh Surti flat beans stringed
cmwivcvb600asl3q4mfdj2n7q	recipe-surati-undhiyu	ing-tuver-lilva	150	g	fresh green pigeon peas
cmwivcvb600atl3q4xlcq53gh	recipe-surati-undhiyu	ing-purple-yam	150	g	peeled and cubed kand
cmwivcvb600aul3q478ku74q5	recipe-surati-undhiyu	ing-potato	150	g	cubed
cmwivcvb600avl3q4cfvy71oi	recipe-surati-undhiyu	ing-baingan	150	g	small baby eggplants slit
cmwivcvb600awl3q4wglxzxoy	recipe-surati-undhiyu	ing-fenugreek	100	g	fresh methi leaves for muthiya
cmwivcvb600axl3q4radruaja	recipe-surati-undhiyu	ing-besan	80	g	for binding muthiya
cmwivcvb600ayl3q4g8iky7kv	recipe-surati-undhiyu	ing-sesame-seeds	20	g	\N
cmwivcvb600azl3q474mvekcz	recipe-surati-undhiyu	ing-oil	50	ml	\N
cmwivcvb600b0l3q4z3s5uqnf	recipe-surati-undhiyu	ing-green-chilli	15	g	\N
cmwivcvb600b1l3q4ul6z0qoh	recipe-surati-undhiyu	ing-ginger	15	g	\N
cmwivcvb600b2l3q411qrnysb	recipe-surati-undhiyu	ing-jaggery	20	g	\N
cmwivcvb600b3l3q4b056ciy9	recipe-surati-undhiyu	ing-salt	12	g	\N
cmwivcvb600b4l3q4n26f6w2z	recipe-surati-undhiyu	ing-ajwain	5	g	\N
cmwivcvb600b5l3q4hrdnidd5	recipe-surati-undhiyu	ing-coriander	1	bunch	\N
cmwivcvbf00bcl3q40phiz6rc	recipe-gujarati-dal-dhokli	ing-toor-dal	150	g	boiled and whisked smooth
cmwivcvbf00bdl3q4lbhfix9r	recipe-gujarati-dal-dhokli	ing-atta	150	g	whole wheat flour for dhokli
cmwivcvbf00bel3q4cnvb1jss	recipe-gujarati-dal-dhokli	ing-tomato	100	g	chopped
cmwivcvbf00bfl3q4dd37mx09	recipe-gujarati-dal-dhokli	ing-peanuts	30	g	raw peanuts
cmwivcvbf00bgl3q4yeyjwvup	recipe-gujarati-dal-dhokli	ing-jaggery	25	g	\N
cmwivcvbg00bhl3q43pc3phe5	recipe-gujarati-dal-dhokli	ing-lemon	1	piece	\N
cmwivcvbg00bil3q4blj1c0ak	recipe-gujarati-dal-dhokli	ing-ghee	20	g	\N
cmwivcvbg00bjl3q4gdloz3gz	recipe-gujarati-dal-dhokli	ing-mustard-seeds	5	g	\N
cmwivcvbg00bkl3q490i2md48	recipe-gujarati-dal-dhokli	ing-cumin-seeds	5	g	\N
cmwivcvbg00bll3q4ltp82wby	recipe-gujarati-dal-dhokli	ing-curry-leaves	1	bunch	\N
cmwivcvbg00bml3q4vrgyp173	recipe-gujarati-dal-dhokli	ing-turmeric	5	g	\N
cmwivcvbg00bnl3q447x4ozyz	recipe-gujarati-dal-dhokli	ing-red-chilli-powder	8	g	\N
cmwivcvbg00bol3q4voiu6ulp	recipe-gujarati-dal-dhokli	ing-ajwain	4	g	\N
cmwivcvbg00bpl3q4o30js181	recipe-gujarati-dal-dhokli	ing-salt	10	g	\N
cmwivcvbg00bql3q4i3rt0ole	recipe-gujarati-dal-dhokli	ing-coriander	1	bunch	\N
cmwivcvbo00bwl3q4r586qf7c	recipe-gujarati-kadhi	ing-curd	250	g	fresh sour dahi whisked with 2 cups water
cmwivcvbo00bxl3q4xol2quz7	recipe-gujarati-kadhi	ing-besan	40	g	gram flour for silken body
cmwivcvbo00byl3q4hig0qfi0	recipe-gujarati-kadhi	ing-jaggery	20	g	\N
cmwivcvbo00bzl3q4pn583nqx	recipe-gujarati-kadhi	ing-green-chilli	10	g	slit lengthwise
cmwivcvbo00c0l3q4zqol2mjg	recipe-gujarati-kadhi	ing-curry-leaves	1	bunch	\N
cmwivcvbo00c1l3q4991uh5f5	recipe-gujarati-kadhi	ing-mustard-seeds	5	g	\N
cmwivcvbo00c2l3q48l4c5f0w	recipe-gujarati-kadhi	ing-cumin-seeds	5	g	\N
cmwivcvbo00c3l3q48578zcz5	recipe-gujarati-kadhi	ing-ghee	15	g	\N
cmwivcvbo00c4l3q4lt9csad3	recipe-gujarati-kadhi	ing-salt	8	g	\N
cmwivcvbo00c5l3q4xgsoz37d	recipe-gujarati-kadhi	ing-coriander	1	bunch	\N
cmwivcvbo00c6l3q4nbw2ew4u	recipe-gujarati-kadhi	ing-hing	2	g	\N
cmwivcvbx00ccl3q4ctadxg4g	recipe-vaghireli-khichdi	ing-basmati-rice	200	g	short-grain or basmati rice washed
cmwivcvbx00cdl3q4pz45ioi7	recipe-vaghireli-khichdi	ing-moong-dal	100	g	split yellow moong dal
cmwivcvbx00cel3q4fc9vwv0q	recipe-vaghireli-khichdi	ing-tomato	100	g	chopped
cmwivcvbx00cfl3q4ckyg01yo	recipe-vaghireli-khichdi	ing-green-chilli	10	g	\N
cmwivcvbx00cgl3q4ukb9ajbp	recipe-vaghireli-khichdi	ing-ghee	25	g	\N
cmwivcvbx00chl3q4ubd8crt7	recipe-vaghireli-khichdi	ing-mustard-seeds	5	g	\N
cmwivcvbx00cil3q4b9uo8q2i	recipe-vaghireli-khichdi	ing-cumin-seeds	6	g	\N
cmwivcvbx00cjl3q4fajualyr	recipe-vaghireli-khichdi	ing-curry-leaves	1	bunch	\N
cmwivcvbx00ckl3q4mgk7ms11	recipe-vaghireli-khichdi	ing-turmeric	5	g	\N
cmwivcvbx00cll3q49jd3z0q9	recipe-vaghireli-khichdi	ing-salt	10	g	\N
cmwivcvbx00cml3q47lma458t	recipe-vaghireli-khichdi	ing-hing	2	g	\N
cmwivcvc600ctl3q4x492eu8x	recipe-gujarati-handvo	ing-basmati-rice	200	g	coarsely ground soaked grains
cmwivcvc600cul3q4fmh4grga	recipe-gujarati-handvo	ing-chana-dal	80	g	split Bengal gram soaked
cmwivcvc600cvl3q40i4g59g3	recipe-gujarati-handvo	ing-toor-dal	40	g	pigeon pea soaked
cmwivcvc600cwl3q470fhw2jh	recipe-gujarati-handvo	ing-urad-dal	30	g	black gram split soaked
cmwivcvc600cxl3q4liu9zuda	recipe-gujarati-handvo	ing-curd	100	g	sour dahi for fermentation
cmwivcvc600cyl3q40vztey6x	recipe-gujarati-handvo	ing-fenugreek	50	g	fresh methi leaves
cmwivcvc600czl3q4b8pehumu	recipe-gujarati-handvo	ing-sesame-seeds	20	g	for crisp sesame crust
cmwivcvc600d0l3q4a1igmw7l	recipe-gujarati-handvo	ing-mustard-seeds	6	g	\N
cmwivcvc600d1l3q41qghl05s	recipe-gujarati-handvo	ing-green-chilli	10	g	\N
cmwivcvc600d2l3q4mu0ehdkx	recipe-gujarati-handvo	ing-oil	30	ml	\N
cmwivcvc600d3l3q481p7ryn3	recipe-gujarati-handvo	ing-turmeric	5	g	\N
cmwivcvc600d4l3q4uwie4k9j	recipe-gujarati-handvo	ing-ajwain	4	g	\N
cmwivcvc600d5l3q44u1uz8x8	recipe-gujarati-handvo	ing-salt	10	g	\N
cmwivcvc600d6l3q4r1pkiwin	recipe-gujarati-handvo	ing-hing	2	g	\N
cmwivcvcg00ddl3q4ios1kj28	recipe-methi-na-gota	ing-besan	200	g	coarse gram flour
cmwivcvcg00del3q4cy843b0y	recipe-methi-na-gota	ing-fenugreek	100	g	washed and chopped fresh methi
cmwivcvcg00dfl3q4daduvv5q	recipe-methi-na-gota	ing-green-chilli	15	g	finely crushed
cmwivcvcg00dgl3q48tq667qo	recipe-methi-na-gota	ing-oil	40	ml	for frying and batter shortening
cmwivcvcg00dhl3q4dyj8aac0	recipe-methi-na-gota	ing-jaggery	10	g	dissolved in 2 tbsp water
cmwivcvcg00dil3q40r0bgyh6	recipe-methi-na-gota	ing-ajwain	4	g	\N
cmwivcvcg00djl3q4paebamaa	recipe-methi-na-gota	ing-turmeric	4	g	\N
cmwivcvcg00dkl3q4lcqbzdhs	recipe-methi-na-gota	ing-salt	8	g	\N
cmwivcvcg00dll3q4hfz1gip1	recipe-methi-na-gota	ing-hing	2	g	\N
cmwixyb2s00arl3bs7p5uc35k	recipe-bajra-no-rotlo-vegan	ing-bajra-flour	350	g	fresh stone-ground pearl millet flour
cmwixyb2s00asl3bs7cz0hrmi	recipe-bajra-no-rotlo-vegan	ing-salt	6	g	\N
cmwixyb2s00atl3bs2cnvoogo	recipe-bajra-no-rotlo-vegan	ing-oil	20	ml	cold-pressed sesame or sunflower oil for brushing
cmwixyb2s00aul3bsi08t6y61	recipe-bajra-no-rotlo-vegan	ing-sesame-seeds	10	g	white sesame seeds pressed into crust
cmwixyb3i00bll3bsbfi2x3v3	recipe-surati-undhiyu-jain	ing-surti-papdi	250	g	fresh Surti flat beans stringed
cmwixyb3i00bml3bsiggregrb	recipe-surati-undhiyu-jain	ing-tuver-lilva	150	g	fresh green pigeon peas
cmwixyb3i00bnl3bsw5hnpo3k	recipe-surati-undhiyu-jain	ing-raw-banana	250	g	firm kacha kela cubed (replacing kand and potatoes)
cmwixyb3i00bol3bsi5b5xdmx	recipe-surati-undhiyu-jain	ing-fenugreek	100	g	fresh methi leaves for muthiya
cmwixyb3i00bpl3bsd4eg0929	recipe-surati-undhiyu-jain	ing-besan	80	g	gram flour for muthiya binding
cmwixyb3i00bql3bsh8m8cdcf	recipe-surati-undhiyu-jain	ing-sesame-seeds	20	g	\N
cmwixyb3i00brl3bsouqdb8rm	recipe-surati-undhiyu-jain	ing-oil	45	ml	\N
cmwixyb3i00bsl3bsnnoqjcju	recipe-surati-undhiyu-jain	ing-green-chilli	15	g	\N
cmwixyb3i00btl3bssduk4480	recipe-surati-undhiyu-jain	ing-hing	3	g	pure asafoetida replacing ginger and garlic
cmwixyb3i00bul3bsb7s72luc	recipe-surati-undhiyu-jain	ing-jaggery	20	g	\N
cmwixyb3i00bvl3bsfob90s4o	recipe-surati-undhiyu-jain	ing-salt	12	g	\N
cmwixyb3i00bwl3bsze6te2zw	recipe-surati-undhiyu-jain	ing-ajwain	5	g	\N
cmwixyb3i00bxl3bsz02osyb1	recipe-surati-undhiyu-jain	ing-coriander	1	bunch	\N
\.


--
-- Data for Name: RecipeStep; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RecipeStep" (id, "recipeId", "stepNumber", instruction, tip, "durationMinutes") FROM stdin;
cmwivcv2u000cl3q47e8upznk	recipe-paneer-butter-masala	1	Heat 1 tbsp oil and 20g butter in a heavy kadai. Sauté chopped onions until golden translucent.	\N	5
cmwivcv2u000dl3q4mvi8ivbl	recipe-paneer-butter-masala	2	Add minced ginger and garlic. Sauté for 2 minutes until raw aroma disappears.	\N	2
cmwivcv2u000el3q440mizij2	recipe-paneer-butter-masala	3	Pour in the fresh tomato puree, Kashmiri red chilli powder, turmeric, and salt. Simmer on medium heat until fat separates from gravy.	\N	10
cmwivcv2u000fl3q4sa4qcmyy	recipe-paneer-butter-masala	4	Gently add paneer cubes, remaining butter, and garam masala. Simmer on low heat for 5 minutes without breaking paneer.	\N	5
cmwivcv2u000gl3q4opbvbb75	recipe-paneer-butter-masala	5	Crush kasuri methi between palms and sprinkle over the curry. Serve hot with buttery phulkas or naan.	\N	3
cmwivcv44000wl3q46xind7n7	recipe-gujarati-khatti-meethi-dal	1	Pressure cook toor dal with peanuts, chopped tomato, turmeric, and 3 cups of water for 4 whistles.	\N	10
cmwivcv44000xl3q441owhcbk	recipe-gujarati-khatti-meethi-dal	2	Blend cooked dal with a hand churner (mathani) to silky consistency. Add jaggery, lemon juice, grated ginger, and slit chillies.	\N	4
cmwivcv44000yl3q4m0uvis3o	recipe-gujarati-khatti-meethi-dal	3	Bring dal to a rolling boil on medium flame for 6-8 minutes so the flavors marry.	\N	8
cmwivcv45000zl3q4vo9mra5q	recipe-gujarati-khatti-meethi-dal	4	Prepare the vaghar (tadka): heat pure cow ghee in a tadka pan. Add mustard seeds, cumin seeds, and curry leaves. Let crackle and immediately pour into the boiling dal.	\N	3
cmwivcv450010l3q4n2zv5o3g	recipe-gujarati-khatti-meethi-dal	5	Garnish with freshly chopped coriander leaves. Enjoy with steamed basmati rice and thepla.	\N	2
cmwivcv4l001bl3q4tm7oxfk5	recipe-methi-thepla	1	In a large parat, mix atta, besan, washed chopped methi, curd, turmeric, red chilli, coriander powder, 1 tbsp oil, and salt.	\N	5
cmwivcv4l001cl3q43b1mi2tb	recipe-methi-thepla	2	Knead into a soft, pliable dough using lukewarm water. Rest covered for 10 minutes.	\N	10
cmwivcv4l001dl3q45jmgebo6	recipe-methi-thepla	3	Divide into lemon-sized balls. Roll into thin circular rotis dusting lightly with dry atta.	\N	5
cmwivcv4l001el3q46dt1iyx2	recipe-methi-thepla	4	Cook on a hot iron tawa with drops of oil on both sides until golden brown specks appear.	\N	6
cmwivcv4l001fl3q48urceev7	recipe-methi-thepla	5	Stack and serve hot with spicy mango pickle and masala chai.	\N	2
cmwivcv4x001sl3q4cv8f8zj3	recipe-masala-dosa	1	Heat oil in a pan. Splutter mustard seeds and curry leaves. Sauté sliced onions and green chillies until soft.	\N	5
cmwivcv4x001tl3q4sk6xk5fl	recipe-masala-dosa	2	Add turmeric, salt, and mashed potatoes with 1/4 cup water. Simmer for 3 minutes and finish with fresh coriander.	\N	4
cmwivcv4x001ul3q45kkk4cvs	recipe-masala-dosa	3	Heat cast iron tawa. Pour a ladle of batter and swirl quickly in outward spirals to form a thin crepe.	\N	2
cmwivcv4x001vl3q4065yvmk9	recipe-masala-dosa	4	Drizzle generous cow ghee around edges. Cook on high flame until golden brown and super crisp.	\N	3
cmwivcv4x001wl3q4djay6qqp	recipe-masala-dosa	5	Place a scoop of potato masala in center, fold neatly, and serve with fresh coconut chutney and piping hot sambar.	\N	2
cmwivcv5a0029l3q4kalrm373	recipe-rajma-chawal	1	Pressure cook soaked rajma with salt and water for 6-7 whistles until melt-in-the-mouth soft.	\N	15
cmwivcv5a002al3q4gtb8d4b6	recipe-rajma-chawal	2	Heat ghee in a deep pan. Sauté cumin seeds, ginger, garlic, and onions until deep caramelized brown.	\N	8
cmwivcv5a002bl3q4a9nen87l	recipe-rajma-chawal	3	Add tomato puree, red chilli powder, and garam masala. Cook until oil releases on sides.	\N	8
cmwivcv5a002cl3q4e0xaexju	recipe-rajma-chawal	4	Add boiled rajma with cooking liquid. Mash a ladle of beans to naturally thicken the gravy. Simmer on low flame for 15 minutes.	\N	15
cmwivcv5a002dl3q4dri6zwqm	recipe-rajma-chawal	5	Cook basmati rice with cumin seeds. Ladle piping hot rajma over jeera rice and top with sliced onions and ghee.	\N	5
cmwivcv5m002pl3q47fm4hwxq	recipe-palak-paneer	1	Blanch palak in boiling water for 2 minutes, then immediately plunge into ice cold water to preserve vibrant emerald color.	\N	5
cmwivcv5m002ql3q44tiqa3fa	recipe-palak-paneer	2	Puree blanched spinach with green chillies and ginger into a smooth velvet paste.	\N	3
cmwivcv5m002rl3q4vj0l1cbq	recipe-palak-paneer	3	Melt butter in a pan. Splutter cumin seeds and sauté slivered garlic until golden aromatic.	\N	4
cmwivcv5m002sl3q4ahbvvrjt	recipe-palak-paneer	4	Stir in pureed spinach, salt, and garam masala. Simmer gently for 4 minutes.	\N	4
cmwivcv5m002tl3q4xh70fkau	recipe-palak-paneer	5	Drop in fresh paneer cubes and warm through for 2 minutes. Serve with hot phulkas.	\N	2
cmwivcv5x0037l3q4z4fdyr1c	recipe-kanda-poha	1	Rinse poha in a colander until moist, drain completely, and toss with turmeric and salt.	\N	3
cmwivcv5x0038l3q4ax1w6ldv	recipe-kanda-poha	2	Heat oil in a kadai. Fry peanuts until crisp and remove. In same oil, splutter mustard seeds and curry leaves.	\N	4
cmwivcv5x0039l3q47d1hdeqv	recipe-kanda-poha	3	Add potato cubes, cover and steam on low heat until soft. Add onions and green chillies; sauté until translucent.	\N	6
cmwivcv5x003al3q4krruqsy8	recipe-kanda-poha	4	Gently fold in softened poha and fried peanuts. Cover and steam for 3 minutes.	\N	3
cmwivcv5x003bl3q49zi4wgtl	recipe-kanda-poha	5	Turn off heat, squeeze fresh lemon juice, and garnish with fresh coriander.	\N	2
cmwivcv66003kl3q449fr1jcg	recipe-moong-dal-khichdi	1	Wash rice and moong dal together until water runs clear. Soak for 15 minutes.	\N	5
cmwivcv66003ll3q4e4fyu4xg	recipe-moong-dal-khichdi	2	In a pressure cooker, heat 1 tbsp ghee. Splutter cumin seeds and add slit green chillies.	\N	3
cmwivcv66003ml3q4ek7aq10r	recipe-moong-dal-khichdi	3	Add soaked rice-dal, turmeric, salt, and 4.5 cups of water for a comforting porridge-like texture.	\N	2
cmwivcv66003nl3q4u0zsyv6a	recipe-moong-dal-khichdi	4	Pressure cook for 4 whistles on medium flame. Allow natural pressure release.	\N	10
cmwivcv66003ol3q4xcki4hlg	recipe-moong-dal-khichdi	5	Open lid, swirl with remaining hot cow ghee, and serve with Gujarati kadhi, papad, and fresh curd.	\N	2
cmwivcv6g0040l3q4jyoe1eko	recipe-egg-curry	1	Prick boiled eggs with a fork. Rub with a pinch of turmeric and chilli. Shallow fry in 1 tbsp oil until blistered golden.	\N	5
cmwivcv6g0041l3q4vi3o5trf	recipe-egg-curry	2	In the remaining oil, sauté cumin, chopped onions, ginger, and garlic until golden brown.	\N	7
cmwivcv6g0042l3q4jhrkpqis	recipe-egg-curry	3	Add tomatoes and dry spices. Cook until oil leaves masala.	\N	6
cmwivcv6g0043l3q4k6ou30aw	recipe-egg-curry	4	Pour in 1 cup warm water, drop in fried eggs, and simmer for 5 minutes.	\N	5
cmwivcv6g0044l3q4qo7gi6hr	recipe-egg-curry	5	Garnish with coriander and serve with steamed rice or parotta.	\N	2
cmwivcv6r004el3q4893ydp16	recipe-khaman-dhokla	1	Whisk besan with water, lemon juice, salt, and turmeric into a lump-free batter.	\N	5
cmwivcv6r004fl3q4wyznc7iq	recipe-khaman-dhokla	2	Add fruit salt/baking soda with a drop of water and whisk vigorously until batter doubles in volume.	\N	2
cmwivcv6r004gl3q4shnnnk3v	recipe-khaman-dhokla	3	Immediately pour into greased steamer pan and steam on high flame for 15 minutes.	\N	15
cmwivcv6r004hl3q418mhesjw	recipe-khaman-dhokla	4	Make vaghar: heat oil, add mustard seeds, curry leaves, slit chillies, and 1/2 cup warm sweet-lemon water.	\N	4
cmwivcv6r004il3q46v2azuo8	recipe-khaman-dhokla	5	Pour warm vaghar evenly over sliced warm dhokla so it absorbs all moisture. Serve soft and juicy.	\N	3
cmwivcv72004ul3q4o3wouoz0	recipe-amritsari-chole	1	Pressure cook soaked kabuli chana with tea bag and salt for 6 whistles until melt-in-mouth soft.	\N	15
cmwivcv73004vl3q4k07cnglt	recipe-amritsari-chole	2	Heat desi ghee, brown pureed onions, add ginger-garlic paste and sauté until deep golden brown.	\N	8
cmwivcv73004wl3q45woshow2	recipe-amritsari-chole	3	Add crushed tomatoes and chole masala. Cook until oil separates.	\N	5
cmwivcv73004xl3q4uyhhin78	recipe-amritsari-chole	4	Add boiled chana and simmer for 10 minutes, lightly mashing some chickpeas for a rich thick gravy.	\N	10
cmwivcv7f0058l3q4t5p427m4	recipe-dal-tadka	1	Pressure cook toor and moong dal with turmeric, salt, and water for 4 whistles.	\N	12
cmwivcv7f0059l3q4tc0pxexm	recipe-dal-tadka	2	In a pan, heat ghee and prepare tadka with cumin, sliced garlic, onions, and tomatoes.	\N	5
cmwivcv7f005al3q45p836m4d	recipe-dal-tadka	3	Pour hot sizzling tadka over the dal and garnish with fresh coriander.	\N	3
cmwivcv7o005ml3q4yam0uyk8	recipe-aloo-gobi	1	Heat mustard oil in kadai. Splutter cumin seeds and add half of ginger juliennes.	\N	3
cmwivcv7o005nl3q4bnl9qpgl	recipe-aloo-gobi	2	Add potatoes and cauliflower. Sauté on high flame for 4 minutes to seal flavor.	\N	4
cmwivcv7o005ol3q4pc1i1sgn	recipe-aloo-gobi	3	Add dry spices, diced tomatoes, cover and steam on low flame for 12 minutes.	\N	12
cmwivcv7o005pl3q4izbdtvhd	recipe-aloo-gobi	4	Uncover, top with fresh ginger and coriander. Serve hot with phulkas.	\N	2
cmwivcv7y005zl3q4b1oe9n6o	recipe-idli-sambar	1	Pour batter into greased idli molds and steam on high for 10 minutes.	\N	10
cmwivcv7y0060l3q4th0ds1lu	recipe-idli-sambar	2	Boil toor dal with tomatoes and sambar powder. Simmer for 8 minutes.	\N	8
cmwivcv7y0061l3q4g8re0557	recipe-idli-sambar	3	Temper with mustard seeds, curry leaves, and ghee. Serve steaming hot with idlis.	\N	3
cmwivcv88006cl3q48xtck7gh	recipe-rava-upma	1	Dry roast rava on medium flame until fragrant and slightly pink. Set aside.	\N	4
cmwivcv88006dl3q4vgvqucry	recipe-rava-upma	2	Heat ghee in a pan. Fry peanuts until crisp. Add mustard seeds, ginger, green chillies, and curry leaves.	\N	3
cmwivcv88006el3q4n6popcv1	recipe-rava-upma	3	Add 3 cups water and salt; bring to rolling boil. Slowly stream in roasted rava whisking continuously to avoid lumps.	\N	3
cmwivcv88006fl3q4lutf8ecr	recipe-rava-upma	4	Cover and steam for 3 minutes on low flame. Finish with lemon juice and a dollop of ghee.	\N	2
cmwivcv8h006pl3q41hu9nu9c	recipe-bhindi-masala	1	Heat oil in wide kadai. Add sliced bhindi and shallow fry uncovered on medium-high heat for 8 minutes until non-sticky.	\N	8
cmwivcv8h006ql3q4ie3yjjw0	recipe-bhindi-masala	2	Add turmeric, coriander powder, chilli powder, tomatoes, and salt.	\N	4
cmwivcv8h006rl3q4k3rkjrkh	recipe-bhindi-masala	3	Toss on high heat for 3 minutes until crisp and caramelized.	\N	3
cmwivcv8q0072l3q4u8xhua91	recipe-sambhar-rice	1	Pressure cook rice and toor dal together with 4 cups water and turmeric for 5 whistles until very soft.	\N	15
cmwivcv8q0073l3q4tfy6a01r	recipe-sambhar-rice	2	In a pan, cook onions, tomatoes, and vegetables with sambar powder in tamarind water.	\N	8
cmwivcv8q0074l3q4s0gm6e0i	recipe-sambhar-rice	3	Combine cooked dal-rice with vegetable sambar broth. Simmer together for 5 minutes.	\N	5
cmwivcv8q0075l3q4cgd8zued	recipe-sambhar-rice	4	Pour over hot cow ghee tadka with mustard and curry leaves. Serve with potato fry and papadum.	\N	2
cmwivcv8y007hl3q4x9u7j13z	recipe-baingan-bharta	1	Roast large eggplant over direct gas flame until skin is completely charred and flesh collapses. Peel and mash.	\N	12
cmwivcv8y007il3q4j97rxvup	recipe-baingan-bharta	2	Heat mustard oil to smoking point. Sauté chopped garlic, ginger, green chillies, and onions until deep brown.	\N	8
cmwivcv8y007jl3q4wsw4lcyw	recipe-baingan-bharta	3	Add chopped tomatoes and dry spices. Cook until oil separates from the masala.	\N	6
cmwivcv8y007kl3q42536w1tg	recipe-baingan-bharta	4	Fold in mashed roasted eggplant and sauté vigorously on high flame for 5 minutes. Garnish with chopped coriander.	\N	5
cmwivcv98007xl3q4v6wba2jj	recipe-punjabi-chicken-curry	1	Heat mustard oil to smoking point. Sauté onions until deep reddish brown.	\N	8
cmwivcv98007yl3q47tgsgd0y	recipe-punjabi-chicken-curry	2	Add ginger-garlic paste and sauté for 2 minutes. Stir in pureed tomatoes and spices until oil separates.	\N	6
cmwivcv98007zl3q4e60ov5kn	recipe-punjabi-chicken-curry	3	Add chicken pieces and bhunno on high heat for 5 minutes until sealed.	\N	5
cmwivcv980080l3q4qi4jsl13	recipe-punjabi-chicken-curry	4	Add 1.5 cups warm water, cover and simmer for 15 minutes until chicken is tender and gravy is fragrant.	\N	15
cmwivcv980081l3q4a7dbgh6u	recipe-punjabi-chicken-curry	5	Garnish with freshly chopped coriander and serve with hot phulkas or rice.	\N	2
cmwivcv9h008cl3q4ajh7g4ti	recipe-bengali-macher-jhol	1	Marinate fish steaks with turmeric and salt. Lightly shallow fry in hot mustard oil for 2 minutes per side and set aside.	\N	5
cmwivcv9h008dl3q4j5db5kyq	recipe-bengali-macher-jhol	2	In the same oil, fry potato wedges until golden. Splutter cumin seeds and add slit green chillies with ginger paste.	\N	4
cmwivcv9h008el3q4cg15ihgb	recipe-bengali-macher-jhol	3	Pour in 2 cups warm water, add sliced tomatoes, turmeric, and salt. Bring to a rolling boil until potatoes are tender.	\N	8
cmwivcv9h008fl3q49u25849l	recipe-bengali-macher-jhol	4	Gently slip in fried fish steaks and simmer for 3 minutes. Serve hot with steamed Gobindobhog or Basmati rice.	\N	3
cmwivcv9q008nl3q4l52976rz	recipe-bengali-cholar-dal	1	Pressure cook chana dal with turmeric, salt, and water for 3 whistles until cooked through but grains remain distinct.	\N	12
cmwivcv9q008ol3q4rlxrxate	recipe-bengali-cholar-dal	2	Heat oil in a kadai. Splutter cumin seeds and sauté slit green chillies until aromatic.	\N	3
cmwivcv9q008pl3q4pzsz2yxa	recipe-bengali-cholar-dal	3	Pour in the cooked dal, adjust consistency with warm water, and simmer for 6 minutes.	\N	6
cmwivcv9q008ql3q4db8eyqzr	recipe-bengali-cholar-dal	4	Serve piping hot with luchi or steamed basmati rice.	\N	2
cmwivcv9z0091l3q4ier87032	recipe-jain-paneer-bhurji	1	Heat desi ghee in a pan. Splutter cumin seeds and add minced green chillies.	\N	2
cmwivcv9z0092l3q4lvcajs06	recipe-jain-paneer-bhurji	2	Add chopped tomatoes, turmeric, and salt. Sauté until tomatoes turn pulpy and ghee releases at edges.	\N	5
cmwivcv9z0093l3q4dk89zl5p	recipe-jain-paneer-bhurji	3	Fold in crumbled paneer and crushed kasuri methi. Toss gently on medium heat for 3 minutes.	\N	3
cmwivcv9z0094l3q4w4ht1d9f	recipe-jain-paneer-bhurji	4	Garnish with fresh coriander leaves and serve immediately with hot phulkas.	\N	2
cmwivcva7009fl3q4bxiqrnib	recipe-jain-moong-dal-tadka	1	Pressure cook moong dal with chopped tomatoes, turmeric, salt, and 3 cups water for 3 whistles.	\N	12
cmwivcva7009gl3q4nva6sk3k	recipe-jain-moong-dal-tadka	2	Whisk dal lightly to achieve a velvety homestyle consistency.	\N	2
cmwivcva7009hl3q4bhaci2fd	recipe-jain-moong-dal-tadka	3	In a small tadka pan, heat cow ghee. Add cumin seeds, curry leaves, and green chillies until crackling.	\N	3
cmwivcva7009il3q4j0gn15ll	recipe-jain-moong-dal-tadka	4	Pour sizzling tadka over dal, cover for 2 minutes to trap aroma, garnish with coriander, and serve.	\N	3
cmwivcvag009xl3q4g83124y1	recipe-sev-tameta-nu-shaak	1	Heat oil in a kadai. Add mustard seeds, cumin seeds, hing, and green chillies until crackling.	\N	3
cmwivcvag009yl3q4zgb6j4c8	recipe-sev-tameta-nu-shaak	2	Add chopped tomatoes, turmeric, red chilli powder, coriander powder, and salt. Cook until tomatoes soften and release juices.	\N	7
cmwivcvag009zl3q4xn5g1spk	recipe-sev-tameta-nu-shaak	3	Stir in jaggery and half a cup of warm water. Simmer for 3 minutes to achieve a glossy gravy.	\N	3
cmwivcvag00a0l3q4nj47ivxa	recipe-sev-tameta-nu-shaak	4	Turn off heat, stir in fresh coriander, and generously top with crisp sev just before serving with hot phulkas or Bhakhri.	\N	2
cmwivcvap00adl3q4z4zhv9jp	recipe-ringna-no-olo	1	Roast eggplant over direct open flame until skin is completely charred and flesh is tender.	\N	12
cmwivcvap00ael3q41ni9w1c2	recipe-ringna-no-olo	2	Cool, peel off charred skin, and thoroughly mash pulp with a fork.	\N	3
cmwivcvap00afl3q4rfkjn1mk	recipe-ringna-no-olo	3	Heat oil in a heavy pan. Add crushed garlic, ginger, and green chillies; sauté until fragrant.	\N	4
cmwivcvap00agl3q4eq4tt2c3	recipe-ringna-no-olo	4	Add chopped tomatoes, turmeric, chilli powder, coriander powder, and salt. Cook until oil separates.	\N	4
cmwivcvap00ahl3q422f2bpm3	recipe-ringna-no-olo	5	Fold in mashed roasted eggplant and simmer for 5 minutes. Garnish with fresh coriander.	\N	5
cmwivcvay00aml3q4kw6mnvpf	recipe-bajra-no-rotlo	1	Knead bajra flour with warm water and salt in small batches using palm pressure until soft and pliable.	\N	5
cmwivcvay00anl3q40z395usl	recipe-bajra-no-rotlo	2	Hand-pat portions between palms or on a flat surface using light dry flour into 6-inch thick round rotlas.	\N	3
cmwivcvay00aol3q4gx7a91jy	recipe-bajra-no-rotlo	3	Transfer gently onto a hot earthen or cast-iron tava. Sprinkle a few drops of water on top surface.	\N	3
cmwivcvay00apl3q4xuamuj82	recipe-bajra-no-rotlo	4	Flip and roast both sides over open flame until puffed and crisp. Top generously with desi ghee.	\N	4
cmwivcvb600b6l3q48qbdj040	recipe-surati-undhiyu	1	Prepare methi muthiya dough combining chopped methi, besan, ajwain, chilli paste, salt, and oil. Shape into oval dumplings and steam or lightly shallow fry.	\N	12
cmwivcvb600b7l3q43ek535yz	recipe-surati-undhiyu	2	Make masala paste by blending sesame seeds, ginger, green chillies, coriander, salt, and jaggery.	\N	6
cmwivcvb600b8l3q47pck96oe	recipe-surati-undhiyu	3	In a heavy pot, heat oil with ajwain and hing. Add surti papdi and tuver lilva; sauté for 3 minutes.	\N	5
cmwivcvb600b9l3q4hmtz0r6e	recipe-surati-undhiyu	4	Layer cubed yam, potatoes, stuffed baby eggplants, and muthiya on top. Add masala mixture and half cup warm water.	\N	5
cmwivcvb600bal3q4kpqi0zda	recipe-surati-undhiyu	5	Cover tightly and slow-cook on low flame until vegetables are buttery tender. Gently toss and serve with hot Puris.	\N	20
cmwivcvbg00brl3q4ss2a2d1z	recipe-gujarati-dal-dhokli	1	Knead dhokli dough with atta, ajwain, turmeric, chilli powder, salt, and oil. Roll into thin rotis and cut into diamond shapes.	\N	10
cmwivcvbg00bsl3q4851n0xjf	recipe-gujarati-dal-dhokli	2	In a pot, bring whisked cooked toor dal to a rolling boil with tomatoes, peanuts, jaggery, turmeric, chilli powder, and salt.	\N	7
cmwivcvbg00btl3q46ms49ffp	recipe-gujarati-dal-dhokli	3	Drop dhokli pieces one by one into boiling dal. Simmer on medium flame for 12 minutes until dhokli is tender.	\N	12
cmwivcvbg00bul3q4kdctc3su	recipe-gujarati-dal-dhokli	4	In a pan, heat ghee with mustard seeds, cumin seeds, curry leaves, and hing. Pour sizzling tadka over dal dhokli. Squeeze lemon and serve hot.	\N	4
cmwivcvbo00c7l3q4pxmidnjg	recipe-gujarati-kadhi	1	Whisk yogurt, besan, jaggery, salt, and water together until completely lump-free.	\N	4
cmwivcvbo00c8l3q4nnvqwuw4	recipe-gujarati-kadhi	2	Pour mixture into a saucepan and bring to a gentle boil on medium flame, stirring continuously to prevent curdling.	\N	6
cmwivcvbo00c9l3q4ewcl1al1	recipe-gujarati-kadhi	3	In a small tadka pan, heat ghee. Add mustard seeds, cumin seeds, green chillies, curry leaves, and hing until fragrant.	\N	3
cmwivcvbo00cal3q4e21lwcuj	recipe-gujarati-kadhi	4	Pour sizzling tempering into kadhi. Simmer for 2 minutes and garnish with fresh coriander.	\N	2
cmwivcvbx00cnl3q4qxb83d4q	recipe-vaghireli-khichdi	1	Wash rice and moong dal together; soak for 15 minutes and drain.	\N	5
cmwivcvbx00col3q4ic9dcdbm	recipe-vaghireli-khichdi	2	Heat ghee in a pressure cooker. Add mustard seeds, cumin seeds, curry leaves, hing, and green chillies.	\N	3
cmwivcvbx00cpl3q4gmhbbj0d	recipe-vaghireli-khichdi	3	Add chopped tomatoes, turmeric, and salt. Sauté for 2 minutes until tomatoes soften.	\N	2
cmwivcvbx00cql3q4rv51ow0d	recipe-vaghireli-khichdi	4	Add drained rice, dal, and 4 cups of water. Pressure cook for 4 whistles until soft and porridge-like.	\N	12
cmwivcvbx00crl3q4ekdek35m	recipe-vaghireli-khichdi	5	Rest pressure cooker, open, drizzle warm ghee on top, and serve piping hot with Gujarati Kadhi.	\N	3
cmwivcvc600d7l3q4wx5tims2	recipe-gujarati-handvo	1	Grind soaked rice and mixed dals coarsely with sour curd. Ferment for 6 hours until bubbly.	\N	10
cmwivcvc600d8l3q4k0zdxiun	recipe-gujarati-handvo	2	Mix in chopped methi leaves, green chilli paste, turmeric, ajwain, salt, and 1 tbsp oil into batter.	\N	5
cmwivcvc600d9l3q4czzy1je9	recipe-gujarati-handvo	3	Heat 2 tbsp oil in a heavy non-stick pan or baking tin. Splutter mustard seeds, sesame seeds, and hing.	\N	3
cmwivcvc600dal3q4uuu7o3to	recipe-gujarati-handvo	4	Pour batter gently over sizzling sesame tempering. Cover and slow-cook on low flame (or bake at 180°C) until deep golden and crusty on both sides.	\N	25
cmwivcvc600dbl3q4kus4mrt5	recipe-gujarati-handvo	5	Slice into squares and serve warm with coriander-mint chutney.	\N	2
cmwivcvcg00dml3q4gwzk2unh	recipe-methi-na-gota	1	Combine besan, chopped methi leaves, crushed chillies, ajwain, turmeric, salt, hing, and dissolved jaggery.	\N	5
cmwivcvcg00dnl3q4qtep6pr4	recipe-methi-na-gota	2	Add 2 tablespoons of hot smoking oil to batter and whisk vigorously for 3 minutes to incorporate air for lightness.	\N	4
cmwivcvcg00dol3q453lyxhem	recipe-methi-na-gota	3	Drop round balls of batter into hot oil on medium flame. Fry until golden brown and cooked through.	\N	8
cmwivcvcg00dpl3q49ld6zby8	recipe-methi-na-gota	4	Drain on paper towel and serve hot with fried green chillies and sweet kadhi dip.	\N	2
cmwixyb2s00avl3bsrsaqbebj	recipe-bajra-no-rotlo-vegan	1	Knead bajra flour with warm water and salt in small batches using palm heel pressure until smooth and elastic.	\N	5
cmwixyb2s00awl3bsfe2qpxht	recipe-bajra-no-rotlo-vegan	2	Hand-pat portions between wet palms into 6-inch thick round rotlas, pressing sesame seeds onto the outer surface.	\N	3
cmwixyb2s00axl3bst5axomsi	recipe-bajra-no-rotlo-vegan	3	Gently transfer onto a hot earthen lodhi or cast iron tava. Brush top lightly with water to prevent cracking.	\N	3
cmwixyb2s00ayl3bsfhto5h82	recipe-bajra-no-rotlo-vegan	4	Roast both sides over direct flame until puffed and crisp. Generously brush with cold-pressed sesame oil and serve hot with Baingan Bharta or Ringna Olo.	\N	4
cmwixyb3i00byl3bsn72c2mex	recipe-surati-undhiyu-jain	1	Prepare Jain methi muthiya combining chopped methi, besan, ajwain, green chilli, hing, salt, and 1 tbsp oil. Shape into small oval dumplings and steam for 10 minutes.	\N	10
cmwixyb3i00bzl3bsa269cmsb	recipe-surati-undhiyu-jain	2	Make green spice stuffing by crushing sesame seeds, green chillies, coriander, salt, hing, and jaggery.	\N	5
cmwixyb3i00c0l3bspgej6mda	recipe-surati-undhiyu-jain	3	Heat oil in a heavy pot with ajwain and hing. Add Surti papdi, tuver lilva, and cubed raw plantain (kacha kela).	\N	5
cmwixyb3i00c1l3bspzrxx4hr	recipe-surati-undhiyu-jain	4	Layer the steamed methi muthiya over vegetables. Sprinkle remaining green masala paste and 1/2 cup warm water.	\N	5
cmwixyb3i00c2l3bsfere0ea4	recipe-surati-undhiyu-jain	5	Cover tightly with a rimmed plate filled with water (dum cooking) and simmer on low heat for 20 minutes until plantain is tender and aromatic. Serve with puri or rotlo.	\N	20
\.


--
-- Data for Name: RefreshSession; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RefreshSession" (id, "userId", "tokenHash", "tokenFamilyId", "deviceName", "userAgent", "createdAt", "lastUsedAt", "expiresAt", "revokedAt") FROM stdin;
cmwj4wmxe003dl3rc6qr63ovy	cmwj2fa4w0000l3s4x4q1jmst	c0a17ed8e682b39441f94c6c1640d7f33331f0352342e08c250a38caf16112b0	fam_517bf96d-7a50-4590-bc33-a419754b57bd	Web Browser	node	2026-11-16 10:42:23.378	2026-11-16 10:42:23.378	2026-11-23 10:42:23.375	\N
cmwj33fo9001ll33ksqrhin9z	cmwj2fa4w0000l3s4x4q1jmst	0a88bbe62b2c90df8f962c27be5c70fcb4a051c46edad5d2ea8b7ccd4916a70b	fam_3cb50e83-6c00-48e2-8dc5-0bfbdd57ff44	Web Browser	node	2026-11-16 09:51:41.337	2026-11-16 09:51:41.337	2026-11-23 09:51:41.333	\N
cmwj39g35001pl3i4ovfyws6j	cmwj2fa4w0000l3s4x4q1jmst	129292068ce1b8f6f847aee1daa4627fae8a354f4935271aa282f1b922cc664b	fam_7b702b3b-b3a3-4316-b512-1b4ade491bbc	Web Browser	node	2026-11-16 09:56:21.809	2026-11-16 09:56:21.809	2026-11-23 09:56:21.806	\N
cmwj5goct004bl3084rv1bqjc	cmwj2fa4w0000l3s4x4q1jmst	c4f486f230c634f3870de30abc01aa6de0873a2d5cc043d3d8604e30dec3aeb1	fam_6b14449c-973c-47a0-815f-1f86bd8efd97	Web Browser	node	2026-11-16 10:57:58.349	2026-11-16 10:57:58.349	2026-11-23 10:57:58.343	\N
cmwj3f5l3001pl3g0uor6vqmv	cmwj2fa4w0000l3s4x4q1jmst	c3a5f2fe76c4c273af09ce5b1337d48a56035979a30d4f8afff28968a5308b1d	fam_665c3cb8-668f-4db9-92bf-2f19ac483253	Web Browser	node	2026-11-16 10:00:48.135	2026-11-16 10:00:48.135	2026-11-23 10:00:48.132	\N
cmwj4ydmp005al3rcn4kvcvov	cmwj2fa4w0000l3s4x4q1jmst	4bccc6bc9be4ea6e87745a56c6042f4b78819f551ccbb30596c5b9a65e2471b1	fam_3dbf80e7-0e6e-495b-b282-e2504cfba7cf	Web Browser	node	2026-11-16 10:43:44.642	2026-11-16 10:43:44.642	2026-11-23 10:43:44.64	\N
cmwj69hvf0011l31wdsdelkum	cmwj69hkz000vl31wlw6uv5rv	fc8270eac481e12dfd9ad9fa6b47cead542ca88581d779d023195f1ba819b045	fam_5a3c1e89-0b16-45e5-ac49-afb78643f923	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:22.972	2026-11-16 11:20:22.972	2026-11-23 11:20:22.96	\N
cmwj69iej0018l31whry49mcx	cmwj69i530014l31wj9xjtuq2	eb0e1c5b08b3f1dabaec6cd79835ba263e524333addb62574c01c1dea68bfed5	fam_154a25bf-13af-4516-8bba-b7cfbf4a3eae	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:23.659	2026-11-16 11:20:23.659	2026-11-23 11:20:23.648	\N
cmwj69ixn001fl31w3ht63xo1	cmwj69io5001bl31wubfm7tks	62aee902f5627ff4b2493b52d9d34930e5a129ad81757115e11d0969445ffbf1	fam_a52b2bf7-ae6a-4b63-9d8c-4ee65280ac3c	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:24.347	2026-11-16 11:20:24.347	2026-11-23 11:20:24.336	\N
cmwj5ey0s002el308f6ah44jo	cmwj2fa4w0000l3s4x4q1jmst	478c6e9920752bf40d20b5c3fefc158052865308a56ccccad523584d664a8b28	fam_5016d0e3-a91b-4e8a-98aa-b273de69500d	Web Browser	node	2026-11-16 10:56:37.565	2026-11-16 10:56:37.565	2026-11-23 10:56:37.557	\N
cmwj69jgv001ml31wasoqqkqh	cmwj69j7f001il31w0f1f7u85	5672bcc2bcd79f9430f6755cf787a4989f470ac44f6d16e255c076fd0156f168	fam_9710c0de-8fe2-401f-bcc8-6619a39c603d	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:25.039	2026-11-16 11:20:25.039	2026-11-23 11:20:25.028	\N
cmwj69km00029l31wzxjhmlgx	cmwj69jw1001pl31wlxz9v75z	b5e5b7488bdb940013a8085efb58c54a8ea6ea597a3c9736e476204a8146d209	fam_81b951de-b02b-43db-9971-16c1327b3cfc	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:26.52	2026-11-16 11:20:26.52	2026-11-23 11:20:26.509	\N
cmwj6a0y9002kl31w33qt01od	cmwj6a0o7002el31w6imlht2w	a4c27000ecf1771246436b05a32a3255e72367159362d6790786708ed5cb26d2	fam_4885585f-ac5b-4f1e-b642-1d05dfbfe234	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:47.697	2026-11-16 11:20:47.697	2026-11-23 11:20:47.687	\N
cmwj6a1h5002rl31wt4oa9lws	cmwj6a17w002nl31w11gbuhpy	4401339ec283336afb70f056b617306782cef3e2989d8d72c479e8bc4583b4c8	fam_f0fdcfbb-f097-41bf-9d49-2ba30fcae9f2	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:48.377	2026-11-16 11:20:48.377	2026-11-23 11:20:48.367	\N
cmwj6a203002yl31wf72byty3	cmwj6a1qq002ul31wd5hbzrci	b131882c6a2bff8d53e9e1a857c0293e41c99de85f4122be2c9e474042632dc4	fam_99ecaee3-6434-46b9-ac49-85bed070462d	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:49.059	2026-11-16 11:20:49.059	2026-11-23 11:20:49.048	\N
cmwj6a2jj0035l31wic7pzcmd	cmwj6a29s0031l31wowndvpej	c7766db82cb5023df73d466afe9d5796ebc5a87a8a5d8c271a59926c774a1482	fam_85e160bb-7eee-42b5-87ba-4a08b793c888	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:49.759	2026-11-16 11:20:49.759	2026-11-23 11:20:49.748	\N
cmwj6a3q2003sl31waxdgqrb9	cmwj6a2xj0038l31wu1m3t9lt	2911a8877794ca35de33e5835af593cf59491c7746ea8b9348fc71be0e50f812	fam_5cc6d722-0590-4b8b-bfcf-05538df36851	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:51.29	2026-11-16 11:20:51.29	2026-11-23 11:20:51.278	\N
cmwj6a4410040l31wpprtzs0a	cmwj4vqu8000zl3rcxghmhy5s	daa2030e509f3bff9ba7bc0557e2b7ded149f7279802ab30a0931cc8edd68a5b	fam_b0e0fa76-4b17-4aae-9bdb-6e66c507ecb9	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:51.793	2026-11-16 11:20:51.793	2026-11-23 11:20:51.783	\N
cmwj6a4of0049l31we88m1ml6	cmwj6a4eq0043l31wuhrlhgy6	57b5c92ceb4db7f7e68f44339408e81746c535c0a2d7c5addcedd4cdc440af18	fam_c510f6c2-a882-46b8-91f3-487b39d4ca1f	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:52.527	2026-11-16 11:20:52.527	2026-11-23 11:20:52.517	\N
cmwj6a58f004ol31wcbzh5fza	cmwj6a4yl004il31w4i1kjtj0	2ee818b46024e0ad8ed90c6944bd1e1c11f7194463c4ccec6bbd3849ed50c8e7	fam_e6bfa3c2-f0c7-4359-b5c6-2ac8e9800977	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:53.247	2026-11-16 11:20:53.247	2026-11-23 11:20:53.237	\N
cmwj6a68e0053l31wwtt15nh5	cmwj6a5x9004xl31w884y0tym	200e9004dd47a3ac667ba326001fa9cf934e40a9dea5a7642d7ec19a80c1fc29	fam_b13f4015-62f0-48cf-b6c4-c7c8d4d71c26	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:54.542	2026-11-16 11:20:54.542	2026-11-23 11:20:54.532	\N
cmwj6a7or005xl31w9bo2wyui	cmwj6a7di005rl31wsf3ezgrh	3f16fdc8c37e4ed5cda47a5bbe987a81d5d305df6f85f5b663852ab01d0dde7d	fam_80d44482-284a-4624-b946-27f6432cd6ba	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:20:56.428	2026-11-16 11:20:56.428	2026-11-23 11:20:56.417	\N
cmwj6fslt0006l3rc3a04erqv	cmwj6fsb00000l3rc0jdk9bkv	3fc440ebb16a863e236c7b0b426c82be5652415ba5d5ef822ddc7eb12d2b44d1	fam_24b06098-6a42-4b00-b59c-40ba41efae78	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:16.817	2026-11-16 11:25:16.817	2026-11-23 11:25:16.814	\N
cmwj6ft5o000dl3rcicgwlnqq	cmwj6fsvv0009l3rckbhgn4cq	c2e7bf4d905ded86e41d35f75b424f3e23333e09e3e9526c5b650222ff28ca86	fam_3d078e36-301e-46f5-9e7f-66b9341b15aa	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:17.532	2026-11-16 11:25:17.532	2026-11-23 11:25:17.53	\N
cmwj6ftph000kl3rc8avn7sqz	cmwj6ftf9000gl3rc1sho14lk	0856c50f71fcb64e64aaf28e895612c536b2708101b4856074f41c5309571584	fam_f3f0b2df-f2bc-4c48-86aa-fe1cb8e504d9	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:18.245	2026-11-16 11:25:18.245	2026-11-23 11:25:18.243	\N
cmwj6fua6000rl3rc2j5ctwta	cmwj6fu00000nl3rcd0k2dhcv	93ab0df2c45faf269a9ac88eb0ac3b440e0b1c03d81970f74bdd6595f82446c1	fam_4f6aaf4b-c344-4f43-8579-c0c821950223	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:18.99	2026-11-16 11:25:18.99	2026-11-23 11:25:18.987	\N
cmwj6fvi9001el3rc9juh6fye	cmwj6fus4000ul3rcb7neh4zk	74d26b98eec9b43c0c726c28c2b6a59bc56c6ec50ea54fb91f50a6a398b0f21f	fam_1b2c9a55-d83b-4a5f-b69b-8aa3310cf5c7	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:20.577	2026-11-16 11:25:20.577	2026-11-23 11:25:20.575	\N
cmwj6fvvq001ml3rc02a4oacf	cmwj4vqu8000zl3rcxghmhy5s	b74029cf698371073325477d5a7177ba4817b96253d57b1455d52664cca598e2	fam_fd01e09c-89c4-492e-9358-758db15fd545	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:21.062	2026-11-16 11:25:21.062	2026-11-23 11:25:21.059	\N
cmwj6fwgl001vl3rcoorm03rl	cmwj6fw6s001pl3rc4beefuss	105565dd25accb07917c45f8ee7b82f9cfec100750e4b682e2473d686cf9fb50	fam_6d305c25-78a8-4d48-bf59-a2b5e0c817bf	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:21.813	2026-11-16 11:25:21.813	2026-11-23 11:25:21.811	\N
cmwj6fx28002al3rcglyj01l3	cmwj6fwrk0024l3rcjrrzd6kw	b089bd17e202828f813c73a91ae4349dfc5d0a251b6138cf6671b9bae686c0c1	fam_3ca7e21d-2c11-4d00-81fa-dbfdee8f566e	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:22.593	2026-11-16 11:25:22.593	2026-11-23 11:25:22.59	\N
cmwj6fy2c002pl3rckinuv3l9	cmwj6fxs9002jl3rcumdxv2q8	e51f524775b44e451bdfdce7bb11ce86b29befb9675099197071485fc570acd8	fam_7b8b2b71-72d5-4e9b-902a-48b1bc345b58	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:23.892	2026-11-16 11:25:23.892	2026-11-23 11:25:23.889	\N
cmwj6fzdi003rl3rcux204vg2	cmwj6fz2s003ll3rc0ijbu111	174497b8e47b3e24b0edc3c1a82685047bb132e8a4e4bff28d43a5e9eb399c40	fam_99abb033-c873-445f-bd34-88b6f3ae8814	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:25:25.59	2026-11-16 11:25:25.59	2026-11-23 11:25:25.587	\N
cmwj6i1xb0006l3y8a56abwyo	cmwj6i1mh0000l3y89i7lmtz5	9b068a4421637d0cb6d07767d3813516fffc833941d9e6710ac58d33a7b00587	fam_5827e100-663d-4b50-ab3f-b4e808865697	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:02.207	2026-11-16 11:27:02.207	2026-11-23 11:27:02.193	\N
cmwj6i2gw000dl3y8f726gg1n	cmwj6i27e0009l3y81t08q7fy	fd921377cce272e86d33fb1cf8989442d59329bb3e206b5ae7d5e7f54499b235	fam_f5f9fcf2-9311-41c9-b369-979877d1c04d	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:02.912	2026-11-16 11:27:02.912	2026-11-23 11:27:02.898	\N
cmwj6i31j000kl3y8ro4hm532	cmwj6i2qm000gl3y8pcqvlxgc	beafe9a7fea507c0d86f44b0f4bf72b2c411485f0cb0fe001753f1b413639e03	fam_fdb4bb42-5b7b-41d1-9652-2d5a384c021d	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:03.655	2026-11-16 11:27:03.655	2026-11-23 11:27:03.641	\N
cmwj6i3ml000rl3y83wtz31kk	cmwj6i3cr000nl3y8ue8rc6kq	4312ff53ee13bc4a4238681f9cfc8ff846e7855f55a15bdf6b2138cfcf759ded	fam_bd19b19f-5c24-4f49-b1ec-c1af1f6a6c84	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:04.414	2026-11-16 11:27:04.414	2026-11-23 11:27:04.399	\N
cmwj6i4x7001el3y81xoehxww	cmwj6i45g000ul3y88a15dh2l	a7a3f15f9e9d48188d3abe458296d37027ea47e2cd82d2a1e4e41fc71aaf93dc	fam_37e3e60d-1d6a-4940-886c-adfd93d67a48	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:06.091	2026-11-16 11:27:06.091	2026-11-23 11:27:06.077	\N
cmwj6i59v001ml3y8ic5ms7g9	cmwj4vqu8000zl3rcxghmhy5s	1778f3a8cbddf71c6a4e4809860da88bed05cb3ee6214c13d1729adfd1308287	fam_284895b8-78fc-47b9-a80a-1ac6320d1561	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:06.548	2026-11-16 11:27:06.548	2026-11-23 11:27:06.533	\N
cmwj6i5wz001vl3y8tav82617	cmwj6i5l7001pl3y8mka3cba2	2e0364305678f3b07141931055cfb0c263558d69529b2196f3e0f0aaa5ac5fd9	fam_de518f62-6196-4857-aec0-c46eb5895848	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:07.379	2026-11-16 11:27:07.379	2026-11-23 11:27:07.365	\N
cmwj6i6le002al3y8h185jg2k	cmwj6i69z0024l3y82xdd2a3j	7640bcab7001c46126bbadfe1ac9869e5c4ca49152120038b57e41c528725c2e	fam_0148465b-df0a-47f7-ad63-ca9756860499	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:08.259	2026-11-16 11:27:08.259	2026-11-23 11:27:08.244	\N
cmwj6i7le002pl3y8xwkil93x	cmwj6i7ax002jl3y8cvctzzmw	7376e066afa6ecbf742518fd9b228bbf61f4d1febd6d7b298c01c9b0d79d86ea	fam_3058cb99-26a4-4ea5-959f-2cc5a76094ad	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:09.555	2026-11-16 11:27:09.555	2026-11-23 11:27:09.54	\N
cmwj6i8yn003rl3y81slu4i6o	cmwj6i8oi003ll3y8ckc7swdj	35b7eee63c0833bdfb3c912165dd597d24a7099a6fa358568d1646696ca72f9a	fam_4f77fb0a-1d5a-4196-be0f-d4f33734c34e	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:27:11.328	2026-11-16 11:27:11.328	2026-11-23 11:27:11.314	\N
cmwj6lpo20070l3y8frm0yr8y	cmwj6lpdo006ul3y8avmmqk3e	93a3a4de2bc923c4bd087870d59626fd123992c29f446fc650b8eaecf15076c7	fam_fb2b04bc-e099-408a-9e8b-ced217ea8d84	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:29:52.946	2026-11-16 11:29:52.946	2026-11-23 11:29:52.94	\N
cmwj6lmgg005vl3y8x35ryd5p	cmwj2fa4w0000l3s4x4q1jmst	4871c778e2da5e3e1e9648d55d1b6d23244f44cf37f54652e99c1b7327b6c55b	fam_f302343b-04ee-4e76-a633-8035fabe00ff	Web Browser	node	2026-11-16 11:29:48.784	2026-11-16 11:29:48.784	2026-11-23 11:29:48.779	\N
cmwj6lq8u0077l3y8s42c0mbq	cmwj6lpzg0073l3y8l9hrhx3m	fb06463bb2403e3c855bca8d881245e9bf7cc8aa72773b49b8a8bb7cc7fd89f4	fam_6e50ab28-b7c7-4841-bdf2-51641a6b65c0	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:29:53.694	2026-11-16 11:29:53.694	2026-11-23 11:29:53.688	\N
cmwj6lqtc007el3y8se3if7z5	cmwj6lqjj007al3y8slbome7k	9f25d35a298342f08876f8fa4eddef478e66af99b8570825798bc35f2564376b	fam_17ff03fa-0888-4ba2-ad79-413b36fdc83e	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:29:54.432	2026-11-16 11:29:54.432	2026-11-23 11:29:54.427	\N
cmwj6lrf4007ll3y8154i63pn	cmwj6lr4p007hl3y84mwsuw0j	3e0c5f82477ef6b3610edf1cd711518fe0bfc69aa218074a07c62bd3e9b680b7	fam_508dbc3c-2e57-425a-8b07-59d08bed2135	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:29:55.216	2026-11-16 11:29:55.216	2026-11-23 11:29:55.211	\N
cmwj6x7es008hl3y8pvyxo9nj	cmwj6x73q008bl3y80mv4nrrt	56e5390e903160f4059a82fb06ec47d54a0c8d07236cc776e27288ca1f910000	fam_351f2c83-4323-4a5d-b702-d22488cb2049	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:49.156	2026-11-16 11:38:49.156	2026-11-23 11:38:49.154	\N
cmwj6x82w008ol3y8dlpgy7et	cmwj6x7qe008kl3y8a992cwtg	8ff196a2bc108856962794c0b71e1ad07391496ca099a27ab8bfbee9bfa59a16	fam_8b587a12-b31f-4d32-9cb6-22692ae2dbb2	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:50.025	2026-11-16 11:38:50.025	2026-11-23 11:38:50.023	\N
cmwj6x8ow008vl3y8u5td6ek1	cmwj6x8dl008rl3y8skrrtrwr	0cbadb8cf65c3f0f19a3dc53dc6c63685d020171167b07146e21a8bce5cb35d2	fam_ceec0fa7-5b40-4f21-b770-6683ebd9c6be	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:50.817	2026-11-16 11:38:50.817	2026-11-23 11:38:50.815	\N
cmwj6x9bg0092l3y8ujyxsi0i	cmwj6x908008yl3y8d6w9fi4s	f2458bc55acb7655a18a7f4cd4439715a3d0bf85b9b70757d544610dc3a39b60	fam_a4965f41-4dd7-4788-b288-6894199f6be8	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:51.628	2026-11-16 11:38:51.628	2026-11-23 11:38:51.626	\N
cmwj6xals009pl3y8vafax5da	cmwj6x9tt0095l3y8z0swl428	3f473fa44e7b40979f5723224e0e022baf0ba00e4b4f20fc3e3521470588207c	fam_2cb01c73-a656-40e0-b809-9e3afd4fba42	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:53.296	2026-11-16 11:38:53.296	2026-11-23 11:38:53.294	\N
cmwj6xaz5009xl3y8avohmo42	cmwj58zak0069l3rc3wksnuya	90352bc5fd5f7cb062012998109ea837af4a15134d332597e9de711fbe123cd2	fam_65a0849f-0d11-47bf-b14f-fcd155454457	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:53.778	2026-11-16 11:38:53.778	2026-11-23 11:38:53.776	\N
cmwj6xbn100a6l3y8oodii6ki	cmwj6xbbf00a0l3y8gyrqt637	6249dcec991b8f251f2e62111d8364357ab7f759b47e27318eaccf29c9c7ad55	fam_38b2eb72-b1b7-47fe-ba07-cc251f322ece	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:54.638	2026-11-16 11:38:54.638	2026-11-23 11:38:54.636	\N
cmwj6xc8q00all3y8a8l687rv	cmwj6xbyb00afl3y8paohnqpl	b616adfe9e6692469fda1bb16760752790a8f6eafea35556ea09cc7dabdca1ef	fam_9c6a0d67-e0e8-432b-b90c-0e812402c8ac	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:55.418	2026-11-16 11:38:55.418	2026-11-23 11:38:55.416	\N
cmwj6xdcn00b0l3y8zcooc9a0	cmwj6xd1w00aul3y8ll382ry0	7eb508d9df780f7bbcd7bf6a59c8c4401adaf51256477e33caa9dbaa83b69dee	fam_65e7bffc-fe3a-4d00-9bfd-317aabe862e6	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:56.856	2026-11-16 11:38:56.856	2026-11-23 11:38:56.854	\N
cmwj6xeus00c2l3y8hk724svo	cmwj6xeit00bwl3y8yks7cd7r	f2ab5f9cd7989da18573895cdccddf541ecbbb29bee0d8ed696f1da51694b178	fam_106031ac-935c-45f0-9b4a-5d82f85f58bd	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:38:58.804	2026-11-16 11:38:58.804	2026-11-23 11:38:58.802	\N
cmwj6z3qw00e6l3y89x3pjm01	cmwj2fa4w0000l3s4x4q1jmst	75018cebf38ec1eba3aca467b58f8bed75805b61b29614571b756fda29e31304	fam_aaeb25e1-5fa8-4be4-94dd-b50a765b3385	Web Browser	node	2026-11-16 11:40:17.721	2026-11-16 11:40:17.721	2026-11-23 11:40:17.717	\N
cmwj6z6sn00fbl3y8rbr6o8cy	cmwj6z6hh00f5l3y8wly8d46b	120cb05c252748dd0e6bfb2f3346eaaa4bf27f43701fbad185fe3ab20ff59177	fam_ea96c5ff-6945-4c07-9ecf-487361e9a7bd	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:21.672	2026-11-16 11:40:21.672	2026-11-23 11:40:21.668	\N
cmwj6z7e900fil3y8gi01jnel	cmwj6z74200fel3y8b21ragl4	3c3a2c1ad4877bd7763176da3e351d0476264afd193cd8d602de05b6cb6dc35c	fam_9834d1cb-d548-4a71-84bb-2bbf6760cc89	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:22.449	2026-11-16 11:40:22.449	2026-11-23 11:40:22.445	\N
cmwj6z7z100fpl3y8nnrzpdun	cmwj6z7ou00fll3y8gipg5bo4	af226b16bead75431536d320a9797234521856fd52615783b5014cbad8017c69	fam_1bec5bc3-4e5d-4e8e-bfd5-cc8bb4c842b3	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:23.197	2026-11-16 11:40:23.197	2026-11-23 11:40:23.194	\N
cmwj6z8l000fwl3y8t41znwmf	cmwj6z89z00fsl3y8z0848h4i	75a5cedfbfa21660fa3fd4ce7296a35891986e4d70bf7bbe2b49547bacdf5790	fam_19d67e0b-a9c8-4220-9319-f1796614f092	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:23.988	2026-11-16 11:40:23.988	2026-11-23 11:40:23.984	\N
cmwj6z9nz00gjl3y8gvb5n390	cmwj6z8ya00fzl3y8xja0epch	5223098590c220efacb52010b8a292252b3e86546a88840fb3d1a85fd91b15c4	fam_09210635-481a-4d41-9dee-d75052af8c9a	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:25.39	2026-11-16 11:40:25.39	2026-11-23 11:40:25.387	\N
cmwj6za1g00grl3y8gi8jcqe6	cmwj58zak0069l3rc3wksnuya	ae58476db0e0bc5a138a92e38c76e1f4bb9a2d78a48615c91a74bd32272b564f	fam_98db8b05-b129-4f17-8c86-0201e94ae33d	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:25.877	2026-11-16 11:40:25.877	2026-11-23 11:40:25.873	\N
cmwj6zanv00h0l3y848x3jss3	cmwj6zabr00gul3y8iotaejmx	3db5c00d5fdb44f0a664053cd4f32ead324e221240d896b0a7a2f8829e20bb72	fam_8893ac1e-fd4e-4889-badb-4559551a6e2f	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:26.683	2026-11-16 11:40:26.683	2026-11-23 11:40:26.679	\N
cmwj6zbas00hfl3y823hdgers	cmwj6zb0b00h9l3y8jbf1bxsl	a8abb38616817a7ae8ada28d2527b6eab9f0134e27ef3212fdfca11d31a36977	fam_e5b9a39e-0d00-432a-b6f2-51788e68432e	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:27.509	2026-11-16 11:40:27.509	2026-11-23 11:40:27.505	\N
cmwj6zcbz00hul3y8mymsblki	cmwj6zc1800hol3y8bm6l3skb	8787fc0297acfe150b32436327181c54fd78398eb0b8e28e0c075d6a2548e89a	fam_7bdec27a-0184-45f3-bde4-3719d6aa614c	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:28.847	2026-11-16 11:40:28.847	2026-11-23 11:40:28.843	\N
cmwj6zdop00iwl3y8e96inq2z	cmwj6zddx00iql3y8wulseycc	fa48cace5068d224867aa3cb47a3716fae0465f913f6fafddd68158673c63972	fam_37eeed9c-dc58-48fc-8a10-f1c43f385719	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:40:30.602	2026-11-16 11:40:30.602	2026-11-23 11:40:30.598	\N
cmwj7l1n80008l3js50dsn5pg	cmwj7l1cj0002l3jsbgwcbmwx	b5d3bc3d8eed5d858f442532747b5cc76fb6152eb6d61e336313bc53160d89b2	fam_7cd41f11-3fc5-4493-ae5a-3478632b5479	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:57:21.428	2026-11-16 11:57:21.428	2026-11-23 11:57:21.422	2026-11-16 11:57:21.587
cmwj7l1s2000cl3jsuup29qjs	cmwj7l1cj0002l3jsbgwcbmwx	8777b8b6828faf57a8ce0d7c23e68ea86a5f1f35adf3df6028c03887430dca28	fam_7cd41f11-3fc5-4493-ae5a-3478632b5479	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:57:21.602	2026-11-16 11:57:21.602	2026-11-23 11:57:21.596	\N
cmwj7lzq90014l3js8v5qi69c	cmwj7lzfz000yl3jsoax6761b	685bb17065e84114214cb3b6f1cd2ec1a59e8a1897939f2274c1c54faef52087	fam_2bdc9dc1-4891-480c-8a4d-0da859247e3e	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:05.601	2026-11-16 11:58:05.601	2026-11-23 11:58:05.595	\N
cmwj7m0cn001hl3js4qjhl53a	cmwj7m01y001bl3js2hkruhrk	772a115c017fa415e0a51d7e6f30a292fd95654d47275200769d976403a7adcf	fam_06731972-c0fa-4735-bc68-352df5a47e1e	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:06.407	2026-11-16 11:58:06.407	2026-11-23 11:58:06.401	\N
cmwj7m0pk001pl3jsfj3ziyfn	cmwj7lzfz000yl3jsoax6761b	ff711dc813c5512d792bf84494a4f64a60e0ed8bcf8e40ad80b6d51511e28290	fam_6625a643-3d75-4e76-9506-e8132b71ef62	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:06.872	2026-11-16 11:58:06.872	2026-11-23 11:58:06.865	\N
cmwj7m11q001tl3jskgcq5o3s	cmwj7m01y001bl3js2hkruhrk	62e37e6736537d7f5e0dcda492df06f7508d006eefa7e87492503cb2f38704af	fam_9ebec615-3969-4636-9de0-3bdf8aea1026	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:07.31	2026-11-16 11:58:07.31	2026-11-23 11:58:07.304	\N
cmwj7n1nn002pl3jstcgbav03	cmwj7n1e0002jl3jsh9vx8s87	aa0cf2a1c51b02f9edd4037580767fe246bc45530a0e245b22fb8a1f6c0704e3	fam_0f09d295-1904-4324-b11d-56d7c7204a5f	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:54.755	2026-11-16 11:58:54.755	2026-11-23 11:58:54.739	\N
cmwj7n2990032l3jsxmgg1pv1	cmwj7n1yu002wl3jsr6auh782	2cc30a276992d8a87075b86fdbbe8d34f881d862c79ebe72b09ad27db86ca356	fam_eaf799dc-44da-48bc-8fc3-28a5ca1a5894	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:55.533	2026-11-16 11:58:55.533	2026-11-23 11:58:55.517	\N
cmwj7n2kn003al3jso21pezdz	cmwj7n1e0002jl3jsh9vx8s87	420335c77efa0aa3fbcf3466e4305e7ef201ad56222346c3fbb50135149d004a	fam_d80d15f8-f16d-4940-95d3-186aff445490	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:55.943	2026-11-16 11:58:55.943	2026-11-23 11:58:55.927	\N
cmwj7n2vl003el3js5yozf566	cmwj7n1yu002wl3jsr6auh782	5a4ee425ff6d3e97609b8ba178db7ba5644d98bb9334b9e70dc2c312b3b88f29	fam_8589aa5c-4a4f-41b4-9ed8-018148908b07	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:58:56.337	2026-11-16 11:58:56.337	2026-11-23 11:58:56.321	\N
cmwj7o7l3004dl3jstapjvkus	cmwj7o7bg0047l3js67k4d347	8142f9ccfbd628e44e525b606762e9651de84c10a8aff2230ed9d226a65131a2	fam_9991f131-75b7-4523-b364-8207513844ae	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:59:49.096	2026-11-16 11:59:49.096	2026-11-23 11:59:49.079	\N
cmwj7o85q004ql3js7yo56f33	cmwj7o7w0004kl3jsjpz2qr0v	1e9cdd4145a83467dcec2750c055fe8c3eae193f9f18cf5db60b6b5f96dfae53	fam_ed955117-2c68-4834-881f-118dc8505d26	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:59:49.838	2026-11-16 11:59:49.838	2026-11-23 11:59:49.822	\N
cmwj7o8gj004yl3jssdyzhxpr	cmwj7o7bg0047l3js67k4d347	8b2d4f2e77309fefc4c0afbeb52e492287888884d062dfa2a1aaab881f16181b	fam_2ee5ebc2-a995-4da9-8a18-74233d8d6d99	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:59:50.227	2026-11-16 11:59:50.227	2026-11-23 11:59:50.211	\N
cmwj7o8q80052l3jsw0qpiy9g	cmwj7o7w0004kl3jsjpz2qr0v	495f5f897b7447ed2c6c7be7dc0232d1028b4c147d043f9a5d4209e461b1db45	fam_0288e6b8-0dba-412b-acba-2078b7efb46b	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 11:59:50.576	2026-11-16 11:59:50.576	2026-11-23 11:59:50.559	\N
cmwj7opdh005wl3js13fiy83h	cmwj7op3r005ql3jsb2wkt4j7	adb3937a2068670a6cf397b35b1cfe587b575332a95d9447a9501b6b866b5d41	fam_88488305-ffe2-4035-9ae6-2f56ecac7629	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 12:00:12.148	2026-11-16 12:00:12.148	2026-11-23 12:00:12.146	\N
cmwj7opyd0069l3jsv5ee5q0t	cmwj7opoi0063l3jsb4gz7quy	8eed21c1a161ac447064894b880949f51bef6ecf4bcef2052b39c2b91e14a5a3	fam_79f03919-7da7-48dd-9f87-882a3f97ed76	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 12:00:12.901	2026-11-16 12:00:12.901	2026-11-23 12:00:12.899	\N
cmwj7oq9i006hl3jsg4zpl4pc	cmwj7op3r005ql3jsb2wkt4j7	e2429de3170f592fafe0104035faada1d0e04b75c7df384bc07ab2d6858582e4	fam_dbcc585e-b969-4a7d-aed1-57dedc492386	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 12:00:13.302	2026-11-16 12:00:13.302	2026-11-23 12:00:13.3	\N
cmwj7oqj0006ll3jsz74n5s5e	cmwj7opoi0063l3jsb4gz7quy	6ae0780428107320d7d6b1bea2dd0a460a4dc2398cd28aba55904846872d1aac	fam_5c6531b1-28b8-491f-bd66-4d0dc5e21466	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 12:00:13.644	2026-11-16 12:00:13.644	2026-11-23 12:00:13.643	\N
cmwj7or3m006sl3jspttjcyj6	cmwj7oqu3006ol3jscxsley7w	0c861306cb80cbc19f57dc77deafaa9c0ddcb83ce3a1363d1785f98a701eb98b	fam_9bf772b5-c58c-46b8-b0fa-16426c61bea9	Web Browser	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2026-11-16 12:00:14.386	2026-11-16 12:00:14.386	2026-11-23 12:00:14.384	\N
\.


--
-- Data for Name: Retailer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Retailer" (id, name, slug, "logoUrl", "deliveryTimeEstimate", "deliveryFeeInr", "freeDeliveryThresholdInr", "minOrderValueInr", rating, status, "suspendedAt", "suspendedReason") FROM stdin;
ret-blinkit	Blinkit	blinkit	https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=200&q=80	10-15 mins	25	399	99	4.8	ACTIVE	\N	\N
ret-zepto	Zepto	zepto	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	10 mins	29	499	99	4.9	ACTIVE	\N	\N
ret-dmart	DMart Ready	dmart-ready	https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=200&q=80	Tomorrow Morning	49	1000	500	4.7	ACTIVE	\N	\N
ret-bigbasket	BigBasket	bigbasket	https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80	Same Day (2-4 hrs)	35	600	200	4.6	ACTIVE	\N	\N
ret-fresh-greens-mart-mwj4s4j1	Fresh Greens Mart mwj4s4j1	fresh-greens-mart-mwj4s4j1	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	SUSPENDED	2026-11-16 10:38:53.834	Audit pending
ret-fresh-greens-mart-mwj4tzkq	Fresh Greens Mart mwj4tzkq	fresh-greens-mart-mwj4tzkq	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	SUSPENDED	2026-11-16 10:40:20.758	Audit pending
ret-fresh-greens-mart-mwj4vql1	Fresh Greens Mart mwj4vql1	fresh-greens-mart-mwj4vql1	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	SUSPENDED	2026-11-16 10:41:42.51	Audit pending
ret-fresh-greens-mart-mwj4ye8x	Fresh Greens Mart mwj4ye8x	fresh-greens-mart-mwj4ye8x	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	SUSPENDED	2026-11-16 10:43:46.312	Audit pending
ret-fresh-greens-mart-mwj58z1h	Fresh Greens Mart mwj58z1h	fresh-greens-mart-mwj58z1h	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	SUSPENDED	2026-11-16 10:51:59.79	Audit pending
ret-fresh-greens-mart-mwj5dzq9	Fresh Greens Mart mwj5dzq9	fresh-greens-mart-mwj5dzq9	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	SUSPENDED	2026-11-16 10:55:54.048	Audit pending
ret-fresh-greens-mart-mwj5gp68	Fresh Greens Mart mwj5gp68	fresh-greens-mart-mwj5gp68	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	SUSPENDED	2026-11-16 10:58:00.59	Audit pending
ret-fresh-greens-mart-mwj5wm2p	Fresh Greens Mart mwj5wm2p	fresh-greens-mart-mwj5wm2p	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	SUSPENDED	2026-11-16 11:10:22.894	Audit pending
ret-organic-greens-1794828054689	Organic Greens 1794828054689	organic-greens-1794828054689	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
ret-pilot-store-1794828056619	Pilot Store 1794828056619	pilot-store-1794828056619	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
ret-organic-greens-1794828323940	Organic Greens 1794828323940	organic-greens-1794828323940	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
ret-pilot-store-1794828325824	Pilot Store 1794828325824	pilot-store-1794828325824	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
ret-organic-greens-1794828429605	Organic Greens 1794828429605	organic-greens-1794828429605	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
ret-pilot-store-1794828431579	Pilot Store 1794828431579	pilot-store-1794828431579	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
ret-fresh-greens-mart-mwj6lngd	Fresh Greens Mart mwj6lngd	fresh-greens-mart-mwj6lngd	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	SUSPENDED	2026-11-16 11:29:51.023	Audit pending
ret-organic-greens-1794829136910	Organic Greens 1794829136910	organic-greens-1794829136910	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
ret-pilot-store-1794829139019	Pilot Store 1794829139019	pilot-store-1794829139019	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
ret-fresh-greens-mart-mwj6z4en	Fresh Greens Mart mwj6z4en	fresh-greens-mart-mwj6z4en	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	SUSPENDED	2026-11-16 11:40:19.685	Audit pending
ret-organic-greens-1794829228898	Organic Greens 1794829228898	organic-greens-1794829228898	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
ret-pilot-store-1794829230810	Pilot Store 1794829230810	pilot-store-1794829230810	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
ret-alpha-grocers-1794830285620	Alpha Grocers 1794830285620	alpha-grocers-1794830285620	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
ret-beta-provisions-1794830286425	Beta Provisions 1794830286425	beta-provisions-1794830286425	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
ret-alpha-grocers-1794830334772	Alpha Grocers 1794830334772	alpha-grocers-1794830334772	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
ret-beta-provisions-1794830335550	Beta Provisions 1794830335550	beta-provisions-1794830335550	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
ret-alpha-grocers-1794830389112	Alpha Grocers 1794830389112	alpha-grocers-1794830389112	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
ret-beta-provisions-1794830389855	Beta Provisions 1794830389855	beta-provisions-1794830389855	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
ret-alpha-grocers-1794830412167	Alpha Grocers 1794830412167	alpha-grocers-1794830412167	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
ret-beta-provisions-1794830412920	Beta Provisions 1794830412920	beta-provisions-1794830412920	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	30-45 mins	29	500	99	4.7	ACTIVE	\N	\N
\.


--
-- Data for Name: RetailerApplication; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RetailerApplication" (id, "userId", "businessName", "contactInformation", "applicationStatus", "submittedAt", "reviewedAt", "reviewedBy", "rejectionReason") FROM stdin;
cmwj6fzkh003zl3rci3mzkyeu	cmwj6fyg50032l3rcif9xvg5z	Pilot Store 1794828325824	{"city": "Bengaluru"}	APPROVED	2026-11-16 11:25:25.841	2026-11-16 11:25:25.855	superadmin@rasoiiq.in	\N
cmwj6i4yr001il3y8yymb4cqg	cmwj6i3cr000nl3y8ue8rc6kq	Admin Rogue Grocers	{}	PENDING	2026-11-16 11:27:06.148	\N	\N	\N
cmwj4s56k0003l3hgzyy648f6	cmwj4s4se0005l32w7q19yt5l	Fresh Greens Mart mwj4s4j1	{"city": "Ahmedabad", "phone": "9876543210"}	APPROVED	2026-11-16 10:38:53.757	2026-11-16 10:38:53.787	admin@rasoiiq.in	\N
cmwj4u0960003l3q0fuogx841	cmwj4tzu40000l3rcqmpkfu8l	Fresh Greens Mart mwj4tzkq	{"city": "Ahmedabad", "phone": "9876543210"}	APPROVED	2026-11-16 10:40:20.682	2026-11-16 10:40:20.706	admin@rasoiiq.in	\N
cmwj4vrbe0003l31grh99dfcb	cmwj4vqu8000zl3rcxghmhy5s	Fresh Greens Mart mwj4vql1	{"city": "Ahmedabad", "phone": "9876543210"}	APPROVED	2026-11-16 10:41:42.41	2026-11-16 10:41:42.446	admin@rasoiiq.in	\N
cmwj6i7nf002zl3y80kiy500w	cmwj6i7ax002jl3y8cvctzzmw	Organic Greens 1794828429605	{"city": "Bengaluru", "phone": "+91 9876543210"}	APPROVED	2026-11-16 11:27:09.627	2026-11-16 11:27:09.639	superadmin@rasoiiq.in	\N
cmwj4yeuq0003l3mg18mkas0f	cmwj4yehu005gl3rcm5kmhc9c	Fresh Greens Mart mwj4ye8x	{"city": "Ahmedabad", "phone": "9876543210"}	APPROVED	2026-11-16 10:43:46.226	2026-11-16 10:43:46.257	admin@rasoiiq.in	\N
cmwj58zmx0003l3uoy8mvcj2g	cmwj58zak0069l3rc3wksnuya	Fresh Greens Mart mwj58z1h	{"city": "Ahmedabad", "phone": "9876543210"}	APPROVED	2026-11-16 10:51:59.721	2026-11-16 10:51:59.745	admin@rasoiiq.in	\N
cmwj5e0dz0003l3ecy2272wun	cmwj5dzzh0000l3087zcubc03	Fresh Greens Mart mwj5dzq9	{"city": "Ahmedabad", "phone": "9876543210"}	APPROVED	2026-11-16 10:55:53.975	2026-11-16 10:55:53.998	admin@rasoiiq.in	\N
cmwj6i966003zl3y8yi48uy6g	cmwj6i80g0032l3y87a4qyxrq	Pilot Store 1794828431579	{"city": "Bengaluru"}	APPROVED	2026-11-16 11:27:11.598	2026-11-16 11:27:11.601	superadmin@rasoiiq.in	\N
cmwj5gq0b0003l3mwkewzrk2j	cmwj5gpi9004hl308a296szof	Fresh Greens Mart mwj5gp68	{"city": "Ahmedabad", "phone": "9876543210"}	APPROVED	2026-11-16 10:58:00.491	2026-11-16 10:58:00.526	admin@rasoiiq.in	\N
cmwj5wmsh0003l3ekospwg0rs	cmwj5wmbu0000l31w7jzpotps	Fresh Greens Mart mwj5wm2p	{"city": "Ahmedabad", "phone": "9876543210"}	APPROVED	2026-11-16 11:10:22.817	2026-11-16 11:10:22.846	admin@rasoiiq.in	\N
cmwj69knq002dl31wzgy3kko2	cmwj69j7f001il31w0f1f7u85	Admin Rogue Grocers	{}	PENDING	2026-11-16 11:20:26.582	\N	\N	\N
cmwj6a3s5003wl31w0ty28qa9	cmwj6a29s0031l31wowndvpej	Admin Rogue Grocers	{}	PENDING	2026-11-16 11:20:51.366	\N	\N	\N
cmwj6a6cz0059l31wmmdvlvix	cmwj6a5x9004xl31w884y0tym	Organic Greens 1794828054689	{"city": "Bengaluru", "phone": "+91 9876543210"}	APPROVED	2026-11-16 11:20:54.708	2026-11-16 11:20:54.719	superadmin@rasoiiq.in	\N
cmwj6a7uj0061l31wl0cl6otx	cmwj6a6q1005cl31wjzejax5n	Pilot Store 1794828056619	{"city": "Bengaluru"}	APPROVED	2026-11-16 11:20:56.635	2026-11-16 11:20:56.65	superadmin@rasoiiq.in	\N
cmwj6fvjy001il3rcaryss6en	cmwj6fu00000nl3rcd0k2dhcv	Admin Rogue Grocers	{}	PENDING	2026-11-16 11:25:20.638	\N	\N	\N
cmwj6fy46002zl3rcpfcl85ml	cmwj6fxs9002jl3rcumdxv2q8	Organic Greens 1794828323940	{"city": "Bengaluru", "phone": "+91 9876543210"}	APPROVED	2026-11-16 11:25:23.959	2026-11-16 11:25:23.977	superadmin@rasoiiq.in	\N
cmwj6lo4f0003l3xsfu8m2ghr	cmwj6lnqa0061l3y8x72iose3	Fresh Greens Mart mwj6lngd	{"city": "Ahmedabad", "phone": "9876543210"}	APPROVED	2026-11-16 11:29:50.943	2026-11-16 11:29:50.971	admin@rasoiiq.in	\N
cmwj6lsae0088l3y86ek1qopb	cmwj6lr4p007hl3y84mwsuw0j	Admin Rogue Grocers	{}	PENDING	2026-11-16 11:29:56.342	\N	\N	\N
cmwj6xan4009tl3y8w52s61qs	cmwj6x908008yl3y8d6w9fi4s	Admin Rogue Grocers	{}	PENDING	2026-11-16 11:38:53.345	\N	\N	\N
cmwj6xdek00bal3y8cf39hlw7	cmwj6xd1w00aul3y8ll382ry0	Organic Greens 1794829136910	{"city": "Bengaluru", "phone": "+91 9876543210"}	APPROVED	2026-11-16 11:38:56.925	2026-11-16 11:38:56.945	superadmin@rasoiiq.in	\N
cmwj6xf1500cal3y8u7x9p5v4	cmwj6xdtd00bdl3y825vovtmm	Pilot Store 1794829139019	{"city": "Bengaluru"}	APPROVED	2026-11-16 11:38:59.033	2026-11-16 11:38:59.052	superadmin@rasoiiq.in	\N
cmwj7lzr90018l3jsg7hzxc1r	cmwj7lzfz000yl3jsoax6761b	Alpha Grocers 1794830285620	{}	APPROVED	2026-11-16 11:58:05.637	2026-11-16 11:58:05.655	superadmin@rasoiiq.in	\N
cmwj6z56y0003l3b8ikh3h0xo	cmwj6z4po00ecl3y84i7cp32h	Fresh Greens Mart mwj6z4en	{"city": "Ahmedabad", "phone": "9876543210"}	APPROVED	2026-11-16 11:40:19.595	2026-11-16 11:40:19.63	admin@rasoiiq.in	\N
cmwj6z9pl00gnl3y8pfcaekse	cmwj6z89z00fsl3y8z0848h4i	Admin Rogue Grocers	{}	PENDING	2026-11-16 11:40:25.449	\N	\N	\N
cmwj6zcdw00i4l3y8gybqohfm	cmwj6zc1800hol3y8bm6l3skb	Organic Greens 1794829228898	{"city": "Bengaluru", "phone": "+91 9876543210"}	APPROVED	2026-11-16 11:40:28.917	2026-11-16 11:40:28.93	superadmin@rasoiiq.in	\N
cmwj6zdv100j4l3y8ti6xchjy	cmwj6zcpy00i7l3y8vp2u3gdx	Pilot Store 1794829230810	{"city": "Bengaluru"}	APPROVED	2026-11-16 11:40:30.829	2026-11-16 11:40:30.848	superadmin@rasoiiq.in	\N
cmwj7m0dj001ll3jsyvmvrb8d	cmwj7m01y001bl3js2hkruhrk	Beta Provisions 1794830286425	{}	APPROVED	2026-11-16 11:58:06.439	2026-11-16 11:58:06.455	superadmin@rasoiiq.in	\N
cmwj7m142001xl3jsirfz8y0f	cmwj4nyub0000l3ic1cbm4scv	SuperAdmin Rogue Store 1794830287382	{}	PENDING	2026-11-16 11:58:07.395	\N	\N	\N
cmwj7n1ol002tl3js98q9mc35	cmwj7n1e0002jl3jsh9vx8s87	Alpha Grocers 1794830334772	{}	APPROVED	2026-11-16 11:58:54.789	2026-11-16 11:58:54.799	superadmin@rasoiiq.in	\N
cmwj7n2a50036l3jsl5vp2cyh	cmwj7n1yu002wl3jsr6auh782	Beta Provisions 1794830335550	{}	APPROVED	2026-11-16 11:58:55.565	2026-11-16 11:58:55.571	superadmin@rasoiiq.in	\N
cmwj7n38p0001l3fkyv4xbqu0	cmwj7n37w003hl3jsck0kq2ij	Suspended Merchant 1794830336804	{"phone": "1234567890"}	PENDING	2026-11-16 11:58:56.809	\N	\N	\N
cmwj7o7lx004hl3jszjsi9jwp	cmwj7o7bg0047l3js67k4d347	Alpha Grocers 1794830389112	{}	APPROVED	2026-11-16 11:59:49.125	2026-11-16 11:59:49.13	superadmin@rasoiiq.in	\N
cmwj7o86j004ul3jsxl0w58wm	cmwj7o7w0004kl3jsjpz2qr0v	Beta Provisions 1794830389855	{}	APPROVED	2026-11-16 11:59:49.868	2026-11-16 11:59:49.871	superadmin@rasoiiq.in	\N
cmwj7opeb0060l3jsb1xxbqks	cmwj7op3r005ql3jsb2wkt4j7	Alpha Grocers 1794830412167	{}	APPROVED	2026-11-16 12:00:12.179	2026-11-16 12:00:12.198	superadmin@rasoiiq.in	\N
cmwj7opz8006dl3jsbvrnezjs	cmwj7opoi0063l3jsb4gz7quy	Beta Provisions 1794830412920	{}	APPROVED	2026-11-16 12:00:12.932	2026-11-16 12:00:12.951	superadmin@rasoiiq.in	\N
cmwj7or4g006wl3jsl49f63wc	cmwj7oqu3006ol3jscxsley7w	Self Review Store 1794830414405	{}	PENDING	2026-11-16 12:00:14.416	\N	\N	\N
cmwj7orf00001l3egl5nicpp4	cmwj7ore8006xl3jslfdqmo7e	Suspended Merchant 1794830414795	{"phone": "1234567890"}	PENDING	2026-11-16 12:00:14.796	\N	\N	\N
\.


--
-- Data for Name: RevokedToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RevokedToken" (id, token, reason, "revokedAt", "expiresAt") FROM stdin;
cmwiy6sup0000l32cy4r693p4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImlhdCI6MTc5NDgxNDQ2MCwiZXhwIjoxNzk1NDE5MjYwfQ.z3lkwjoipnMG2uko_OEfEzRNHpQIa4VD53R4mussjws	User logout	2026-11-16 07:34:20.303	2026-11-23 07:34:20
cmwiyaehl0001l32cii34j4za	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImlhdCI6MTc5NDgxNDYyOCwiZXhwIjoxNzk1NDE5NDI4fQ.Ihziy7fMb175FCAihgM0eYRY22DRzWERR5gwDrUbSxk	User logout	2026-11-16 07:37:08.304	2026-11-23 07:37:08
cmwiyg2f70002l32cksypqa27	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwiaWF0IjoxNzk0ODE0ODkyLCJleHAiOjE3OTU0MTk2OTJ9.V5xeoMEf96AgtvwKbV9wW-OtL8uX9mFfv7MHYEx3kZU	User logout	2026-11-16 07:41:32.602	2026-11-23 07:41:32
cmwiyjqam0003l32cz5yhd9a9	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImlhdCI6MTc5NDgxNTA2MywiZXhwIjoxNzk1NDE5ODYzfQ.nz6kdZiH4FXCMqsbF-99tTCKNGXDBdXwIybTWHo_yv8	User logout	2026-11-16 07:44:23.506	2026-11-23 07:44:23
cmwiyjqps0004l32cyoe77kfd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwiaWF0IjoxNzk0ODE1MDY0LCJleHAiOjE3OTU0MTk4NjR9.b6_dHnbnatGY-MvcUZcB_sjCnFTYEkR2SbITcIh7M_4	User logout	2026-11-16 07:44:24.052	2026-11-23 07:44:24
cmwiyrqb40000l3p0j5zqarjh	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImlhdCI6MTc5NDgxNTQzNiwiZXhwIjoxNzk1NDIwMjM2fQ.EqYbs-SUnFwJRoWAM4ujJoyaaTCnnG7PlsTDl8lh9mY	User logout	2026-11-16 07:50:36.782	2026-11-23 07:50:36
cmwiyrqs10001l3p0gggjmgzk	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwiaWF0IjoxNzk0ODE1NDM3LCJleHAiOjE3OTU0MjAyMzd9.nlMDlleR-EC3jk93RyTOaAGabPoKSyD0RDeikKz5O2A	User logout	2026-11-16 07:50:37.392	2026-11-23 07:50:37
cmwiyyp750002l3p0sy419e5y	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImlhdCI6MTc5NDgxNTc2MSwiZXhwIjoxNzk1NDIwNTYxfQ.-DZ4MSOcJLi4z2LfmNtQApz_cN8SbYK4Yi-itFMoYFI	User logout	2026-11-16 07:56:01.926	2026-11-23 07:56:01
cmwiyypst0003l3p0v04fp399	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwiaWF0IjoxNzk0ODE1NzYyLCJleHAiOjE3OTU0MjA1NjJ9.FlgKRuJWzA-rP1knpcTbauYf0rQpAE601WnqhTJjcEw	User logout	2026-11-16 07:56:02.707	2026-11-23 07:56:02
cmwizu1010000l37wrjly0chb	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImlhdCI6MTc5NDgxNzIyMywiZXhwIjoxNzk1NDIyMDIzfQ.GWtsYA-jJdDY34-qssAutl8LjB9sJpwIz1R2JshdppQ	User logout	2026-11-16 08:20:23.567	2026-11-23 08:20:23
cmwizu1pr0001l37w15hghatn	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwiaWF0IjoxNzk0ODE3MjI0LCJleHAiOjE3OTU0MjIwMjR9.Sm_JtgGLtV97JkjjScaTHN7C1Sa5QBUSLNPrnugdyTc	User logout	2026-11-16 08:20:24.494	2026-11-23 08:20:24
cmwj0hksd0002l37w8272h6gr	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImlhdCI6MTc5NDgxODMyMiwiZXhwIjoxNzk1NDIzMTIyfQ.odsb2vLebkuw5iJ23ODdwv6-kL9S_DEdE0yE2czjIJ8	User logout	2026-11-16 08:38:42.292	2026-11-23 08:38:42
cmwj0ir3z0003l37wpy4jos7g	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwiaWF0IjoxNzk0ODE4Mzc3LCJleHAiOjE3OTU0MjMxNzd9.62o310BAjoXN6AHF9-lznAf0-5BltXRf60F2D-EHEJQ	User logout	2026-11-16 08:39:37.147	2026-11-23 08:39:37
cmwj0mwwu0000l3csgpufdd4e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImp0aSI6IjE3OTQ4MTg1NzEyODMtYmJ4a3RyNSIsImlhdCI6MTc5NDgxODU3MSwiZXhwIjoxNzk1NDIzMzcxfQ.6oXr-QYQRo0EEoPrXGx8Up5uQt5PsaJqMEKGsufG9cY	User logout	2026-11-16 08:42:51.292	2026-11-23 08:42:51
cmwj0mxkb0001l3csixnovsyi	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwianRpIjoiMTc5NDgxODU3MjEyNy11eWNiNTNpIiwiaWF0IjoxNzk0ODE4NTcyLCJleHAiOjE3OTU0MjMzNzJ9.7OZg0TRFaOYchd-QzLiOoAIqKRYj-lmZnDXZQoOHs8A	User logout	2026-11-16 08:42:52.137	2026-11-23 08:42:52
cmwj33fq2001ol33khcaugc1k	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXdqMzNkM2gwMDAwbDMzazdnMWMyYWlrIiwiaWQiOiJjbXdqMzNkM2gwMDAwbDMzazdnMWMyYWlrIiwiZW1haWwiOiJwaWxvdC51c2VyLm13ajMzY284QHRlc3RyYXNvaS5pbiIsImZ1bGxOYW1lIjoiVml2ZWsgSm9zaGkiLCJyb2xlIjoiQ1VTVE9NRVIiLCJob3VzZWhvbGRSb2xlIjoiTUVNQkVSIiwianRpIjoiMTc5NDgyMjcwMDAxNy01YmQ4ZmZhYWYyNWZiY2VhZjI4NzczZWM4MzY5MzJmZCIsImlhdCI6MTc5NDgyMjcwMCwiZXhwIjoxNzk0ODIzNjAwLCJhdWQiOiJyYXNvaS1pcS1hcHAiLCJpc3MiOiJyYXNvaS1pcSJ9.ujQ4qWkTn2l3AEXstGKO2c4iBNKuUrdsPn3guxONQJ4	User logout	2026-11-16 09:51:41.4	2026-11-16 10:06:40
cmwj34f8e001ql33kk3vtgk9m	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImp0aSI6IjE3OTQ4MjI3NDc0MDAtbjV5ZnB1ayIsImlhdCI6MTc5NDgyMjc0NywiZXhwIjoxNzk1NDI3NTQ3fQ.As5hNkGFgXf9pWWZnp6rsPKuXl6-mpcMvDL2XRq4BAk	User logout	2026-11-16 09:52:27.418	2026-11-23 09:52:27
cmwj38fcz0000l3i4xmyyzcbw	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImp0aSI6IjE3OTQ4MjI5MzQxOTMtNDk3Nmc3NCIsImlhdCI6MTc5NDgyMjkzNCwiZXhwIjoxNzk1NDI3NzM0fQ.fLkruq9W-hQV78Rgzrskh-2CFJJEc7be8_5jrPYz9qQ	User logout	2026-11-16 09:55:34.208	2026-11-23 09:55:34
cmwj38qex0002l3i4pzl1cy3o	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwianRpIjoiMTc5NDgyMjk0ODUyMi1hOXgzenYwIiwiaWF0IjoxNzk0ODIyOTQ4LCJleHAiOjE3OTU0Mjc3NDh9.IMJxFoULf8egNUkfJbXoQGlhmo-hN6Sp5ha6vqgYqUE	User logout	2026-11-16 09:55:48.534	2026-11-23 09:55:48
cmwj6lhnj0047l3y8sglf4ns4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwianRpIjoiMTc5NDgyODU4MjUzNi01aWp0YmcxIiwiaWF0IjoxNzk0ODI4NTgyLCJleHAiOjE3OTU0MzMzODJ9.BvEbiaEKVjv-dwuzSHzxCzEmJPFKvadXLoHmhB9dgCw	User logout	2026-11-16 11:29:42.553	2026-11-23 11:29:42
cmwj39g4x001sl3i42mylbw53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXdqMzlkOTkwMDA0bDNpNGRmYXRyNzJqIiwiaWQiOiJjbXdqMzlkOTkwMDA0bDNpNGRmYXRyNzJqIiwiZW1haWwiOiJwaWxvdC51c2VyLm13ajM5Y3N4QHRlc3RyYXNvaS5pbiIsImZ1bGxOYW1lIjoiVml2ZWsgSm9zaGkiLCJyb2xlIjoiQ1VTVE9NRVIiLCJob3VzZWhvbGRSb2xlIjoiTUVNQkVSIiwianRpIjoiMTc5NDgyMjk4MDMwNC03MTFiNDhjODIyMmRlM2I3NTgxNjQ1YzZhYTkwMjI5ZiIsImlhdCI6MTc5NDgyMjk4MCwiZXhwIjoxNzk0ODIzODgwLCJhdWQiOiJyYXNvaS1pcS1hcHAiLCJpc3MiOiJyYXNvaS1pcSJ9.qCy90WWTt-ZPkhRKQ7eUMqk7mu05Nh0mE1PbyzQnHhk	User logout	2026-11-16 09:56:21.87	2026-11-16 10:11:20
cmwj3a1zj001ul3i4br0kr67v	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImp0aSI6IjE3OTQ4MjMwMTAxNjcteHBwaXM3ZCIsImlhdCI6MTc5NDgyMzAxMCwiZXhwIjoxNzk1NDI3ODEwfQ.-qIS9ziBdzG47VDBIWCvA9U6Ov13pqgQWk63i1mj65g	User logout	2026-11-16 09:56:50.188	2026-11-23 09:56:50
cmwj3a2ku001wl3i4fb0vlmx3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwianRpIjoiMTc5NDgyMzAxMDk0Mi16azM2ejJlIiwiaWF0IjoxNzk0ODIzMDEwLCJleHAiOjE3OTU0Mjc4MTB9.3VZYc3rd0Fvwvr_xHe61rwYEieUMAUysMh87H8g7-nc	User logout	2026-11-16 09:56:50.955	2026-11-23 09:56:50
cmwj3evw80000l3g0k6q75lot	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImp0aSI6IjE3OTQ4MjMyMzU1NDgtazUyM3dtaSIsImlhdCI6MTc5NDgyMzIzNSwiZXhwIjoxNzk1NDI4MDM1fQ.bJhRMFaLPG885ynu3RAXm_v6YfoO_nILlj-kYR-e-pc	User logout	2026-11-16 10:00:35.572	2026-11-23 10:00:35
cmwj3eww50002l3g0y97u7lk1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwianRpIjoiMTc5NDgyMzIzNjgzMy0wMm1ma3AwIiwiaWF0IjoxNzk0ODIzMjM2LCJleHAiOjE3OTU0MjgwMzZ9.IzVQeTpdZW6nkedADK_iD40_KVjgKbC2R-u47uwZRzI	User logout	2026-11-16 10:00:36.864	2026-11-23 10:00:36
cmwj3f5ov001sl3g0dov0l84l	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXdqM2Yxam0wMDA0bDNnMGlsYnp6YW5hIiwiaWQiOiJjbXdqM2Yxam0wMDA0bDNnMGlsYnp6YW5hIiwiZW1haWwiOiJwaWxvdC51c2VyLm13ajNmMHlzQHRlc3RyYXNvaS5pbiIsImZ1bGxOYW1lIjoiVml2ZWsgSm9zaGkiLCJyb2xlIjoiQ1VTVE9NRVIiLCJob3VzZWhvbGRSb2xlIjoiTUVNQkVSIiwianRpIjoiMTc5NDgyMzI0NjEwMC02NzNjOTg1YjM5Y2EzYTllYjM5MjkwMzQwNDZiYmNiYiIsImlhdCI6MTc5NDgyMzI0NiwiZXhwIjoxNzk0ODI0MTQ2LCJhdWQiOiJyYXNvaS1pcS1hcHAiLCJpc3MiOiJyYXNvaS1pcSJ9.sl3vR6FSFv8GtlBH6pFALrlHDlgDoHCjCjdcOP8l4F4	User logout	2026-11-16 10:00:48.267	2026-11-16 10:15:46
cmwj4vm5g000tl3rc9c17lrfv	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImp0aSI6IjE3OTQ4MjU2OTU3MDAtbjZjMnF3aSIsImlhdCI6MTc5NDgyNTY5NSwiZXhwIjoxNzk1NDMwNDk1fQ.pYsQdgRoXK8sh3YLnjF4ys79vYMcLXkRInKEZVB6_aA	User logout	2026-11-16 10:41:35.714	2026-11-23 10:41:35
cmwj4vmqg000wl3rc337too7y	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwianRpIjoiMTc5NDgyNTY5NjQ1NS0zbWxlZmVlIiwiaWF0IjoxNzk0ODI1Njk2LCJleHAiOjE3OTU0MzA0OTZ9.jvcGlDQ7__e-5Yih9W0Y9JKdPJZPzAm3tKLAiYXCtvg	User logout	2026-11-16 10:41:36.471	2026-11-23 10:41:36
cmwj4wmzr003gl3rc0q9ildpf	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXdqNHdqbzEwMDFzbDNyY2lxdWZjb2FwIiwiaWQiOiJjbXdqNHdqbzEwMDFzbDNyY2lxdWZjb2FwIiwiZW1haWwiOiJwaWxvdC51c2VyLm13ajR3amF4QHRlc3RyYXNvaS5pbiIsImZ1bGxOYW1lIjoiVml2ZWsgSm9zaGkiLCJyb2xlIjoiQ1VTVE9NRVIiLCJob3VzZWhvbGRSb2xlIjoiTUVNQkVSIiwianRpIjoiMTc5NDgyNTc0MTUwNy0zYjYyYmM1MzVmZjM4ZjZlMmQ1NGYxZWJmNzlmYzZlNSIsImlhdCI6MTc5NDgyNTc0MSwiZXhwIjoxNzk0ODI2NjQxLCJhdWQiOiJyYXNvaS1pcS1hcHAiLCJpc3MiOiJyYXNvaS1pcSJ9.EF1agAQnyk0qZOIW_DYYKtceeUT2-HmAK54pn7tbO00	User logout	2026-11-16 10:42:23.46	2026-11-16 10:57:21
cmwj4y7nu003jl3rcakytmusu	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImp0aSI6IjE3OTQ4MjU4MTY4OTEtdmRlNjl1YiIsImlhdCI6MTc5NDgyNTgxNiwiZXhwIjoxNzk1NDMwNjE2fQ.GK0KXpyks5-pofyxDlPN8u-rYpHoaXGky8dMBRdU5SM	User logout	2026-11-16 10:43:36.905	2026-11-23 10:43:36
cmwj4y8cn003ml3rcvhkptfx7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwianRpIjoiMTc5NDgyNTgxNzc4Mi12d3NkYzAwIiwiaWF0IjoxNzk0ODI1ODE3LCJleHAiOjE3OTU0MzA2MTd9.pGYxfVmAEnaWOZLLWOcmy5RgjsqtXQWIHiV3I6mC9RQ	User logout	2026-11-16 10:43:37.797	2026-11-23 10:43:37
cmwj4ydov005dl3rcylk4qtvk	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXdqNHliYm0wMDNwbDNyY3M2bDJ1NmV6IiwiaWQiOiJjbXdqNHliYm0wMDNwbDNyY3M2bDJ1NmV6IiwiZW1haWwiOiJwaWxvdC51c2VyLm13ajR5YjI0QHRlc3RyYXNvaS5pbiIsImZ1bGxOYW1lIjoiVml2ZWsgSm9zaGkiLCJyb2xlIjoiQ1VTVE9NRVIiLCJob3VzZWhvbGRSb2xlIjoiTUVNQkVSIiwianRpIjoiMTc5NDgyNTgyMzE2Ny0yZDkyN2Y0ODUzYWExZWQzZjMzZTA5Y2Q5ZmViYTk2YSIsImlhdCI6MTc5NDgyNTgyMywiZXhwIjoxNzk0ODI2NzIzLCJhdWQiOiJyYXNvaS1pcS1hcHAiLCJpc3MiOiJyYXNvaS1pcSJ9.koxEBoNU1D6WWi3oHtg-V2_3KsJo_XnJfWveETMkzaY	User logout	2026-11-16 10:43:44.717	2026-11-16 10:58:43
cmwj5ey2l002hl3089nq8799g	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXdqNWV2Z2wwMDB0bDMwOGpqcjc4aGxyIiwiaWQiOiJjbXdqNWV2Z2wwMDB0bDMwOGpqcjc4aGxyIiwiZW1haWwiOiJwaWxvdC51c2VyLm13ajVldjN0QHRlc3RyYXNvaS5pbiIsImZ1bGxOYW1lIjoiVml2ZWsgSm9zaGkiLCJyb2xlIjoiQ1VTVE9NRVIiLCJob3VzZWhvbGRSb2xlIjoiTUVNQkVSIiwianRpIjoiMTc5NDgyNjU5NjI3Ny1mZjNiZmM3NDEzMmFmY2EzZDY1MTFmZjgwOTYxZTE2YyIsImlhdCI6MTc5NDgyNjU5NiwiZXhwIjoxNzk0ODI3NDk2LCJhdWQiOiJyYXNvaS1pcS1hcHAiLCJpc3MiOiJyYXNvaS1pcSJ9.ZgucH9eqRDyQzknljWR5ybzjutRV-54i3V4LYEhG8OQ	User logout	2026-11-16 10:56:37.622	2026-11-16 11:11:36
cmwj5ggjh002kl308kbte23sg	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImp0aSI6IjE3OTQ4MjY2NjgyMDEtcHdpZWJoNCIsImlhdCI6MTc5NDgyNjY2OCwiZXhwIjoxNzk1NDMxNDY4fQ.JWpZLOC9pu2RKa3Db5BBU_VuTxc8dmo5mtufJOoE5kk	User logout	2026-11-16 10:57:48.216	2026-11-23 10:57:48
cmwj5gh6v002nl308z1dqxnpa	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwianRpIjoiMTc5NDgyNjY2OTA0NS1ucTN6YnF4IiwiaWF0IjoxNzk0ODI2NjY5LCJleHAiOjE3OTU0MzE0Njl9.5JdzXMRjlNGf_Qh_B3bTig75q9ygvpkD830iySlt0SA	User logout	2026-11-16 10:57:49.058	2026-11-23 10:57:49
cmwj5gof8004el3088a2iaqgh	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXdqNWdrZXgwMDJxbDMwOHZ6eXAzcXV2IiwiaWQiOiJjbXdqNWdrZXgwMDJxbDMwOHZ6eXAzcXV2IiwiZW1haWwiOiJwaWxvdC51c2VyLm13ajVnanhuQHRlc3RyYXNvaS5pbiIsImZ1bGxOYW1lIjoiVml2ZWsgSm9zaGkiLCJyb2xlIjoiQ1VTVE9NRVIiLCJob3VzZWhvbGRSb2xlIjoiTUVNQkVSIiwianRpIjoiMTc5NDgyNjY3NjI5Ny1hMmVjMjJkMjUwMWQ4ZmY1MDUzODQ3NmI0Mzg2YTkzYyIsImlhdCI6MTc5NDgyNjY3NiwiZXhwIjoxNzk0ODI3NTc2LCJhdWQiOiJyYXNvaS1pcS1hcHAiLCJpc3MiOiJyYXNvaS1pcSJ9.k1xj2l3WrAsY9LobNoIA-awp2HD2KJrDC0uS8wVXeP4	User logout	2026-11-16 10:57:58.431	2026-11-16 11:12:56
cmwj6lh1n0044l3y86n9l6p56	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImp0aSI6IjE3OTQ4Mjg1ODE3NDctdnRqdngyZCIsImlhdCI6MTc5NDgyODU4MSwiZXhwIjoxNzk1NDMzMzgxfQ.EeXnkQRvPztOnlr24_rdU9g58wGECpXvELB3KLQ2a0E	User logout	2026-11-16 11:29:41.765	2026-11-23 11:29:41
cmwj6lmin005yl3y8oz4ro1fw	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXdqNmxra3gwMDRhbDN5OG9oMGE5bm5yIiwiaWQiOiJjbXdqNmxra3gwMDRhbDN5OG9oMGE5bm5yIiwiZW1haWwiOiJwaWxvdC51c2VyLm13ajZsa2M3QHRlc3RyYXNvaS5pbiIsImZ1bGxOYW1lIjoiVml2ZWsgSm9zaGkiLCJyb2xlIjoiQ1VTVE9NRVIiLCJob3VzZWhvbGRSb2xlIjoiTUVNQkVSIiwianRpIjoiMTc5NDgyODU4NzcyNS0wYjFlMmZmNWY3NDQ5Mjk3MTY4N2RmOGZmNGMwZTc0MCIsImlhdCI6MTc5NDgyODU4NywiZXhwIjoxNzk0ODI5NDg3LCJhdWQiOiJyYXNvaS1pcS1hcHAiLCJpc3MiOiJyYXNvaS1pcSJ9.JLrgQY0GYip_6MaJF1vV3H20NmIpeOpdQq0-kApA9cQ	User logout	2026-11-16 11:29:48.857	2026-11-16 11:44:47
cmwj6yxah00cfl3y8umzxfrqc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImp0aSI6IjE3OTQ4MjkyMDkzMzUteTU0eDQwMCIsImlhdCI6MTc5NDgyOTIwOSwiZXhwIjoxNzk1NDM0MDA5fQ.EtYdZj1fe3H4KnS0lErsuYs4SNKDKw82VKe3Erm0WPY	User logout	2026-11-16 11:40:09.35	2026-11-23 11:40:09
cmwj6yxy000cil3y89921x4jl	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwianRpIjoiMTc5NDgyOTIxMDE3OC00eWNpMDRjIiwiaWF0IjoxNzk0ODI5MjEwLCJleHAiOjE3OTU0MzQwMTB9.JQJB1ODvqQMw_tRVvxbTFykvZdMq6bxZDfcb11dofWo	User logout	2026-11-16 11:40:10.196	2026-11-23 11:40:10
cmwj6z3t400e9l3y8r9fgimvn	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXdqNnowd2owMGNsbDN5ODl2a2gxdG5jIiwiaWQiOiJjbXdqNnowd2owMGNsbDN5ODl2a2gxdG5jIiwiZW1haWwiOiJwaWxvdC51c2VyLm13ajZ6MGplQHRlc3RyYXNvaS5pbiIsImZ1bGxOYW1lIjoiVml2ZWsgSm9zaGkiLCJyb2xlIjoiQ1VTVE9NRVIiLCJob3VzZWhvbGRSb2xlIjoiTUVNQkVSIiwianRpIjoiMTc5NDgyOTIxNjI5Mi1lODgzYjhlNmFkYmNkYzRkMDdjZDM3NTJjZTRiNjRkYSIsImlhdCI6MTc5NDgyOTIxNiwiZXhwIjoxNzk0ODMwMTE2LCJhdWQiOiJyYXNvaS1pcS1hcHAiLCJpc3MiOiJyYXNvaS1pcSJ9.yQdjOwQsx2PaPxISlydTDn-EBhu-xkxQKgv822e3Wu4	User logout	2026-11-16 11:40:17.796	2026-11-16 11:55:16
cmwj7rad20072l3jsgokz9sx5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImp0aSI6IjE3OTQ4MzA1MzI2NDcteGt4YjF1dCIsImlhdCI6MTc5NDgzMDUzMiwiZXhwIjoxNzk1NDM1MzMyfQ.9Z0n7F-9QFKQyc-XFY22hGlE_2agYnxSuc_w7otbvR8	User logout	2026-11-16 12:02:12.661	2026-11-23 12:02:12
cmwj7rave0075l3js8hiibuvb	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwianRpIjoiMTc5NDgzMDUzMzMxMS1tM2hubmtkIiwiaWF0IjoxNzk0ODMwNTMzLCJleHAiOjE3OTU0MzUzMzN9.k9BnD-PqIRYdecWBEIPlvOFO0hzZDWTkEYvllmyzr4A	User logout	2026-11-16 12:02:13.321	2026-11-23 12:02:13
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "userId", token, "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Store" (id, "retailerId", name, city, pincode) FROM stdin;
\.


--
-- Data for Name: StoreProduct; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreProduct" (id, "storeId", "productVariantId", "inStock", "stockCount", "localPriceInr") FROM stdin;
\.


--
-- Data for Name: SystemSetting; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SystemSetting" (id, key, value, description, "updatedBy", "updatedAt", "createdAt") FROM stdin;
cmwj4s5nv000vl32wy4z4k0ul	platform.registration_enabled	true	Enable/disable public customer registration	\N	2026-11-16 10:38:54.379	2026-11-16 10:38:54.379
cmwj4s5o1000wl32wvbtgvja0	platform.maintenance_mode	false	Enable/disable platform maintenance downtime mode	\N	2026-11-16 10:38:54.386	2026-11-16 10:38:54.386
cmwj4s5o6000xl32wnkyy0jlm	platform.max_members_per_household	10	Maximum family members allowed per household	\N	2026-11-16 10:38:54.39	2026-11-16 10:38:54.39
cmwj4s5oa000yl32ww1uw6qho	platform.demo_orders_enabled	true	Permit simulated checkout and demo order generation	\N	2026-11-16 10:38:54.394	2026-11-16 10:38:54.394
cmwj4s5oe000zl32wll9ja17r	ai.gemini_model	gemini-2.5-flash-lite	Active Google Gemini LLM model identifier	\N	2026-11-16 10:38:54.398	2026-11-16 10:38:54.398
cmwj4s5oj0010l32wntsx9v9q	ai.secondary_provider	deterministic-offline	Fallback AI planning engine when primary quota is exhausted	\N	2026-11-16 10:38:54.403	2026-11-16 10:38:54.403
cmwj4s5on0011l32wh1uxro1d	pricing.default_delivery_fee_inr	35	Quick-commerce delivery fee in INR	superadmin@rasoiiq.in	2026-11-16 11:40:20.32	2026-11-16 10:38:54.407
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, "passwordHash", "fullName", "phoneNumber", role, "createdAt", "updatedAt", "emailVerifiedAt", "lastLoginAt", "normalizedEmail", status, "suspendedAt", "suspendedBy", "suspensionReason") FROM stdin;
user-demo-1	demo@rasoiiq.in	$2b$10$demo_hash_rasoi_iq_2026	Pooja Sharma	+91 98765 43210	CUSTOMER	2026-11-16 06:15:04.98	2026-11-16 07:27:44.381	\N	\N		ACTIVE	\N	\N	\N
user-demo-patel	patel.family@rasoiiq.demo	$2b$10$demo_hash_rasoi_iq_2026	Rameshbhai Patel	+91 98250 11223	CUSTOMER	2026-11-16 06:15:05.055	2026-11-16 07:27:44.411	\N	\N		ACTIVE	\N	\N	\N
user-demo-mehta	mehta.family@rasoiiq.demo	$2b$10$demo_hash_rasoi_iq_2026	Kirit Mehta	+91 98980 44556	CUSTOMER	2026-11-16 06:15:05.091	2026-11-16 07:27:44.426	\N	\N		ACTIVE	\N	\N	\N
cmwj2fa4w0000l3s4x4q1jmst	admin@rasoiiq.in	$argon2id$v=19$m=65536,t=3,p=1$TfUYCY8ObBkFhXavknrTrA$M0D5ShbMC+KqI6phtRMy2I3B998moRxFpt8IgFf8Bqo	Platform Administrator	\N	ADMIN	2026-11-16 09:32:54.416	2026-11-16 11:40:17.727	2026-11-16 09:32:54.413	2026-11-16 11:40:17.724	admin@rasoiiq.in	ACTIVE	\N	\N	\N
cmwj4vrp1001kl3rcpspgngcx	ops.lead.mwj4vql1@rasoiiq.in	$argon2id$v=19$m=65536,t=3,p=1$w+j+U73JA17dNB8/1NDNPA$OCt4+5KK/EX9HcTZESeNLQ3D77eZISzlRZLBtFJprlI	Operations Lead	\N	SUPPORT	2026-11-16 10:41:42.901	2026-11-16 10:41:42.917	2026-11-16 10:41:42.9	\N	ops.lead.mwj4vql1@rasoiiq.in	ACTIVE	\N	\N	\N
cmwj4nyub0000l3ic1cbm4scv	superadmin@rasoiiq.in	$argon2id$v=19$m=65536,t=3,p=1$wDj/oOtWUls8fkoLoaqBJg$RbWn/vvrELtxlPT598OkshrIEXR1xSJrI9lyMlOxIN0	Super Administrator	\N	SUPER_ADMIN	2026-11-16 10:35:38.915	2026-11-16 10:35:38.915	2026-11-16 10:35:38.907	\N	superadmin@rasoiiq.in	ACTIVE	\N	\N	\N
cmwj4rt2s0000l32wbc1f7nfy	rogue.admin.mwj4rste@test.in	$argon2id$v=19$m=65536,t=3,p=1$GIvNKgcG+OAxb/nCPfWSUA$EMQi7/iEW1UVjQLo0YZaQf/GvbTxsBADTDobFS0x5lc	Rogue Admin Attempt	\N	CUSTOMER	2026-11-16 10:38:38.068	2026-11-16 10:38:38.068	\N	\N	rogue.admin.mwj4rste@test.in	PENDING_VERIFICATION	\N	\N	\N
cmwj58zak0069l3rc3wksnuya	rogue.admin.mwj58z1h@test.in	$argon2id$v=19$m=65536,t=3,p=4$pOMr/zItbwPajHcsz3AnDw$bvlM35+UqVyI8LltagvtTqdDkAW7d0khAn5UXOwVX1k	Rogue Admin Attempt	\N	RETAILER	2026-11-16 10:51:59.277	2026-11-16 11:40:25.883	\N	2026-11-16 11:40:25.88	rogue.admin.mwj58z1h@test.in	ACTIVE	\N	\N	\N
cmwj4s4se0005l32w7q19yt5l	rogue.admin.mwj4s4j1@test.in	$argon2id$v=19$m=65536,t=3,p=1$ZLsazWsmfTdmlJNKXzCU9g$PkEKpBk85+kdohKNh6TcRbYzZ6S7JeoPsocNiPP259w	Rogue Admin Attempt	\N	RETAILER	2026-11-16 10:38:53.247	2026-11-16 10:38:53.798	\N	\N	rogue.admin.mwj4s4j1@test.in	ACTIVE	\N	\N	\N
cmwj4s5ml000ql32wsc99mofs	ops.lead.mwj4s4j1@rasoiiq.in	$argon2id$v=19$m=65536,t=3,p=1$NRaWRIuLShNmNNzR3aS8Sw$hux9pWr5qbO4rIxABqNhYlgHz5X6klzwfBBgW9D2MrU	Operations Lead	\N	SUPPORT	2026-11-16 10:38:54.334	2026-11-16 10:38:54.357	2026-11-16 10:38:54.329	\N	ops.lead.mwj4s4j1@rasoiiq.in	ACTIVE	\N	\N	\N
cmwj5902u006ul3rc3rb95v74	ops.lead.mwj58z1h@rasoiiq.in	$argon2id$v=19$m=65536,t=3,p=1$AsYSFAytMs7sv5Y7Hc2OAQ$3p1hI1itfxeg2mKSTVCE8M6njkrHZkMOTugWVdxUPhA	Operations Lead	\N	SUPPORT	2026-11-16 10:52:00.294	2026-11-16 10:52:00.319	2026-11-16 10:52:00.292	\N	ops.lead.mwj58z1h@rasoiiq.in	ACTIVE	\N	\N	\N
cmwj4tzu40000l3rcqmpkfu8l	rogue.admin.mwj4tzkq@test.in	$argon2id$v=19$m=65536,t=3,p=1$Hjtjeeqs3VgJLoLEdfOL2g$M1eA8HxuRmdihCTZtgcdvSzclXovr2mbfW9BgzpIVyk	Rogue Admin Attempt	\N	RETAILER	2026-11-16 10:40:20.141	2026-11-16 10:40:20.719	\N	\N	rogue.admin.mwj4tzkq@test.in	ACTIVE	\N	\N	\N
cmwj4u0q5000ll3rc65255uth	ops.lead.mwj4tzkq@rasoiiq.in	$argon2id$v=19$m=65536,t=3,p=1$jjUTYYkPjoHjq0K+IKijeA$4hvyu8bxMAQFw5u62Zx0vQl4DMHffgTQ5YMs31DgM60	Operations Lead	\N	SUPPORT	2026-11-16 10:40:21.294	2026-11-16 10:40:21.319	2026-11-16 10:40:21.288	\N	ops.lead.mwj4tzkq@rasoiiq.in	ACTIVE	\N	\N	\N
cmwj5wmbu0000l31w7jzpotps	rogue.admin.mwj5wm2p@test.in	$argon2id$v=19$m=65536,t=3,p=1$nRJoYEf62DiszfKeHw/otg$LIA27rsSnCI0H+8/OsCBbnYk6iLou/RgAKRuKK/LOOw	Rogue Admin Attempt	\N	RETAILER	2026-11-16 11:10:22.219	2026-11-16 11:10:22.858	\N	\N	rogue.admin.mwj5wm2p@test.in	ACTIVE	\N	\N	\N
cmwj5gpi9004hl308a296szof	rogue.admin.mwj5gp68@test.in	$argon2id$v=19$m=65536,t=3,p=1$+aJDJe+TGHVrWWOxuxP2lQ$2Eys1lEEjUDzvjr5AeKyW1Wn8lh7gkSmlKjvWH3YOjI	Rogue Admin Attempt	\N	RETAILER	2026-11-16 10:57:59.842	2026-11-16 10:58:00.539	\N	\N	rogue.admin.mwj5gp68@test.in	ACTIVE	\N	\N	\N
cmwj5dzzh0000l3087zcubc03	rogue.admin.mwj5dzq9@test.in	$argon2id$v=19$m=65536,t=3,p=1$TokvetHMcfQfek0yR+5sIw$05BisPe0QaZWXUAOp7cJP8e50M73cIICcQnSIVDJJMs	Rogue Admin Attempt	\N	RETAILER	2026-11-16 10:55:53.453	2026-11-16 10:55:54.013	\N	\N	rogue.admin.mwj5dzq9@test.in	ACTIVE	\N	\N	\N
cmwj4yehu005gl3rcm5kmhc9c	rogue.admin.mwj4ye8x@test.in	$argon2id$v=19$m=65536,t=3,p=1$gLC3QhBx9fdnS8qJr+8zmw$xvMq0WP/X+htuzaeETrppRY7tE74qkLvhWk9VuT1W88	Rogue Admin Attempt	\N	RETAILER	2026-11-16 10:43:45.763	2026-11-16 10:43:46.267	\N	\N	rogue.admin.mwj4ye8x@test.in	ACTIVE	\N	\N	\N
cmwj4yfd80061l3rcjsgyes91	ops.lead.mwj4ye8x@rasoiiq.in	$argon2id$v=19$m=65536,t=3,p=1$b0tkP3P8lkz6rx2mCH4U/w$R2A0amMXfVG4xNALlj1wgPqdmgkOK0FpfiUwWPvD2Wc	Operations Lead	\N	SUPPORT	2026-11-16 10:43:46.892	2026-11-16 10:43:46.916	2026-11-16 10:43:46.89	\N	ops.lead.mwj4ye8x@rasoiiq.in	ACTIVE	\N	\N	\N
cmwj5e0uk000ll308ne6457g6	ops.lead.mwj5dzq9@rasoiiq.in	$argon2id$v=19$m=65536,t=3,p=1$x0zXfQj1if+9jCXjaB+zbA$pRr0wYRPq2xayV5x1k+KNBVIGRMHoRsHSMSHaVhvU+w	Operations Lead	\N	SUPPORT	2026-11-16 10:55:54.572	2026-11-16 10:55:54.598	2026-11-16 10:55:54.564	\N	ops.lead.mwj5dzq9@rasoiiq.in	ACTIVE	\N	\N	\N
cmwj5gqoj0052l308dnub9leg	ops.lead.mwj5gp68@rasoiiq.in	$argon2id$v=19$m=65536,t=3,p=1$AuW5pFounGTsXqUi2Q75XQ$drDAdqocRZQFxG3C07+471vI87BCIvqhebWmD5qVH48	Operations Lead	\N	SUPPORT	2026-11-16 10:58:01.363	2026-11-16 10:58:01.397	2026-11-16 10:58:01.358	\N	ops.lead.mwj5gp68@rasoiiq.in	ACTIVE	\N	\N	\N
cmwj4vqu8000zl3rcxghmhy5s	rogue.admin.mwj4vql1@test.in	$argon2id$v=19$m=65536,t=3,p=4$HfnRFgSdDkXALHYkE34h/g$KcHQzT4u6++NQ5v3uIdbQ6RKt4qPchXP9mLQkxst9ak	Rogue Admin Attempt	\N	RETAILER	2026-11-16 10:41:41.792	2026-11-16 11:29:56.619	\N	2026-11-16 11:27:06.539	rogue.admin.mwj4vql1@test.in	ACTIVE	\N	\N	\N
cmwj5wn96000ll31wm16axgtg	ops.lead.mwj5wm2p@rasoiiq.in	$argon2id$v=19$m=65536,t=3,p=1$UAKeIQ1u4HVLaVA+X2oeNw$b9uU/ah1CVcLOPaoGVa32TgiPAHnJFdwVjUhoWkd0Xc	Operations Lead	\N	SUPPORT	2026-11-16 11:10:23.418	2026-11-16 11:10:23.446	2026-11-16 11:10:23.413	\N	ops.lead.mwj5wm2p@rasoiiq.in	ACTIVE	\N	\N	\N
cmwj69i530014l31wj9xjtuq2	supp-1794828022272@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$0spn/D3Em6IxYpj+ixFXkw$ACYkGi4SB+eQPgZozayo8GkKE9hxg/sq1yRIFesbYGc	Staff SUPPORT	\N	SUPPORT	2026-11-16 11:20:23.32	2026-11-16 11:20:23.666	2026-11-16 11:20:23.309	2026-11-16 11:20:23.655	supp-1794828022272@rasoi.internal	ACTIVE	\N	\N	\N
cmwj69hkz000vl31wlw6uv5rv	cust-1794828022272@test.com	$argon2id$v=19$m=65536,t=3,p=1$l5QJFLL2OHQr8QKKKb/3UQ$8AolX1ACLIzCL6nnoBqgZReSHmheh+vWNfLFRThQhKE	Test Customer Role	\N	CUSTOMER	2026-11-16 11:20:22.595	2026-11-16 11:20:22.981	2026-11-16 11:20:22.62	2026-11-16 11:20:22.97	cust-1794828022272@test.com	ACTIVE	\N	\N	\N
cmwj69io5001bl31wubfm7tks	ops-1794828022272@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$b2y4FrUomHDElOdLkcUmQQ$oBwPqwXw5G8I3pgiKs0gg8DfMXUk8GeUc5vvQt+yL6Q	Staff OPERATIONS	\N	OPERATIONS	2026-11-16 11:20:24.006	2026-11-16 11:20:24.354	2026-11-16 11:20:23.994	2026-11-16 11:20:24.343	ops-1794828022272@rasoi.internal	ACTIVE	\N	\N	\N
cmwj69j7f001il31w0f1f7u85	adm-1794828022272@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$jV5+D1fxhyuZ4MAoH5P7VQ$GUguAlkvv1DkYR+n59730yB+sFs90XIMtgB4sKTVa60	Staff ADMIN	\N	ADMIN	2026-11-16 11:20:24.699	2026-11-16 11:20:25.047	2026-11-16 11:20:24.688	2026-11-16 11:20:25.036	adm-1794828022272@rasoi.internal	ACTIVE	\N	\N	\N
cmwj69jw1001pl31wlxz9v75z	victim-1794828025254@test.com	$argon2id$v=19$m=65536,t=3,p=1$k8zlEjbBr30fSphd+wszzQ$Rf3u7V0pH9EzcZ5KxpifHUTy7FlIH3jwLtfzmIoXr0U	Victim User	\N	CUSTOMER	2026-11-16 11:20:25.585	2026-11-16 11:20:26.525	2026-11-16 11:20:25.604	2026-11-16 11:20:26.514	victim-1794828025254@test.com	ACTIVE	\N	\N	\N
cmwj6a0o7002el31w6imlht2w	cust-1794828046990@test.com	$argon2id$v=19$m=65536,t=3,p=1$uh6q3YhOctAD2aVaOZiXjA$LBqikzWmy9buVWqMDJLJQJKdIeGU5JFt0uOtu1jPdVw	Test Customer Role	\N	CUSTOMER	2026-11-16 11:20:47.335	2026-11-16 11:20:47.703	2026-11-16 11:20:47.35	2026-11-16 11:20:47.693	cust-1794828046990@test.com	ACTIVE	\N	\N	\N
cmwj6a17w002nl31w11gbuhpy	supp-1794828046990@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$I2K6XaSybeNv8Bhw9aO1rg$q9ZF+WuJHwlIvwYpo8d+L5e47ROp3lYzPcxGNfLmqm4	Staff SUPPORT	\N	SUPPORT	2026-11-16 11:20:48.045	2026-11-16 11:20:48.383	2026-11-16 11:20:48.034	2026-11-16 11:20:48.373	supp-1794828046990@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6a1qq002ul31wd5hbzrci	ops-1794828046990@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$+TzDIpMi/JMWUi0x+pLT1w$LEi6QFmrXPB9LgIFVvHgzX70MelzOZRbw6MCnMLvuiw	Staff OPERATIONS	\N	OPERATIONS	2026-11-16 11:20:48.722	2026-11-16 11:20:49.066	2026-11-16 11:20:48.712	2026-11-16 11:20:49.055	ops-1794828046990@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6a29s0031l31wowndvpej	adm-1794828046990@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$Kib3G6qTJq77c6NGOBhDVA$XDiq+Grw2/vFfbV+ijB7eJLc4D0/MS1TdZMac8rNDsQ	Staff ADMIN	\N	ADMIN	2026-11-16 11:20:49.409	2026-11-16 11:20:49.765	2026-11-16 11:20:49.398	2026-11-16 11:20:49.755	adm-1794828046990@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6fsb00000l3rc0jdk9bkv	cust-1794828316096@test.com	$argon2id$v=19$m=65536,t=3,p=1$GjZs7FoLtatFGU+a9wRGNg$GC/5fvugK4KfB3sPcTjF7erpMHzlQrNTdoes3sGO0uY	Test Customer Role	\N	CUSTOMER	2026-11-16 11:25:16.428	2026-11-16 11:25:16.825	2026-11-16 11:25:16.459	2026-11-16 11:25:16.822	cust-1794828316096@test.com	ACTIVE	\N	\N	\N
cmwj6a2xj0038l31wu1m3t9lt	victim-1794828049942@test.com	$argon2id$v=19$m=65536,t=3,p=1$EahPlXZvBruEUh4vPp5d5g$gQfcGA+S1LW3Z2d8dDspddSx14+c7Wmy6UkjGjW0BNQ	Victim User	\N	CUSTOMER	2026-11-16 11:20:50.263	2026-11-16 11:20:51.302	2026-11-16 11:20:50.281	2026-11-16 11:20:51.292	victim-1794828049942@test.com	ACTIVE	\N	\N	\N
cmwj6a4eq0043l31wuhrlhgy6	c1-1794828051844@test.com	$argon2id$v=19$m=65536,t=3,p=1$ZY3v2P4JHeryCIznW2UmEQ$stiQc7bNtob19WMtL25YGO8g8lfbGuDX6dHFEvYA3eY	User One	\N	CUSTOMER	2026-11-16 11:20:52.178	2026-11-16 11:20:52.533	2026-11-16 11:20:52.196	2026-11-16 11:20:52.523	c1-1794828051844@test.com	ACTIVE	\N	\N	\N
cmwj6fsvv0009l3rckbhgn4cq	supp-1794828316096@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$pYPhd8NzCN63eliW+VD5Ng$AZTfx1lcI6jkwhhgj7CKBJpg1lHDF/PYIPZ061Vhry8	Staff SUPPORT	\N	SUPPORT	2026-11-16 11:25:17.18	2026-11-16 11:25:17.539	2026-11-16 11:25:17.177	2026-11-16 11:25:17.536	supp-1794828316096@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6a4yl004il31w4i1kjtj0	c2-1794828052573@test.com	$argon2id$v=19$m=65536,t=3,p=1$eSPuls0JTVWanHe8WHn9ww$2TDL3ZJ8ZyVY2opU13Ia/ObC77XFH+umITRbjTcfJZI	User Two	\N	CUSTOMER	2026-11-16 11:20:52.893	2026-11-16 11:20:53.253	2026-11-16 11:20:52.909	2026-11-16 11:20:53.243	c2-1794828052573@test.com	ACTIVE	\N	\N	\N
cmwj6ftf9000gl3rc1sho14lk	ops-1794828316096@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$XeMTBzYoA0H+V7hBQzZaVQ$/RtvzGX+s0nJ48ZAd+pPD1Q4hLxd9WbgxrUlwvW3x/U	Staff OPERATIONS	\N	OPERATIONS	2026-11-16 11:25:17.877	2026-11-16 11:25:18.252	2026-11-16 11:25:17.874	2026-11-16 11:25:18.249	ops-1794828316096@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6a5x9004xl31w884y0tym	merchant-cust-1794828053777@test.com	$argon2id$v=19$m=65536,t=3,p=1$eH1wpemlFHoYJDAjkL5Cjw$B+HEY7Je13DPd38cFsRWRYG8yN3wCyACzuRyRpAkYyw	Merchant Customer	\N	RETAILER	2026-11-16 11:20:54.141	2026-11-16 11:20:54.737	2026-11-16 11:20:54.159	2026-11-16 11:20:54.539	merchant-cust-1794828053777@test.com	ACTIVE	\N	\N	\N
cmwj6fu00000nl3rcd0k2dhcv	adm-1794828316096@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$0+JiHrtD9O1J0qOCOXMjIg$PWukNZlVXc/r4hf49yKOVhOxF6tD+vBe0BLg+w6I4QM	Staff ADMIN	\N	ADMIN	2026-11-16 11:25:18.625	2026-11-16 11:25:18.996	2026-11-16 11:25:18.622	2026-11-16 11:25:18.993	adm-1794828316096@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6a7di005rl31wsf3ezgrh	member-1794828055654@pilot.com	$argon2id$v=19$m=65536,t=3,p=1$VOjY3FcGHfZTcA9QUG3A9g$ndIinUwrYlQFJ+aYh+K2/bje/vCqC7KlUfC+H4/oMLE	Aarav Patel	\N	CUSTOMER	2026-11-16 11:20:56.022	2026-11-16 11:20:56.436	2026-11-16 11:20:56.04	2026-11-16 11:20:56.425	member-1794828055654@pilot.com	ACTIVE	\N	\N	\N
cmwj6fz2s003ll3rc0ijbu111	invited-1794828324807@pilot.com	$argon2id$v=19$m=65536,t=3,p=1$4VqnWW7kxpK7ZzOlCzQeeg$ZkE0rDFcDIxlWtb3NlXrliKTuM0s6vCL2Xx/JjzUFnc	Aarav Patel	\N	CUSTOMER	2026-11-16 11:25:25.205	2026-11-16 11:25:25.596	2026-11-16 11:25:25.222	2026-11-16 11:25:25.594	invited-1794828324807@pilot.com	ACTIVE	\N	\N	\N
cmwj6a6q1005cl31wjzejax5n	pilot-e2e-1794828054797@rasoi.pilot	$argon2id$v=19$m=65536,t=3,p=1$qETbut2K1xVhB7fRdb8hbQ$fqFxAe/10bFzQUKV2W02Ku8bJN9LYbKyQkd1/5PZvlo	Pilot Lead	\N	RETAILER	2026-11-16 11:20:55.177	2026-11-16 11:20:56.74	2026-11-16 11:20:55.196	2026-11-16 11:20:55.579	pilot-e2e-1794828054797@rasoi.pilot	SUSPENDED	2026-11-16 11:20:56.729	superadmin@rasoiiq.in	End-of-pilot verification suspension
cmwj6fwrk0024l3rcjrrzd6kw	c2-1794828321858@test.com	$argon2id$v=19$m=65536,t=3,p=1$7apnyTyfMIWm9u3qX5awWQ$03OvCIPuihnCTnzKVsil5TpniBfEg86sJSXGrFZsaBU	User Two	\N	CUSTOMER	2026-11-16 11:25:22.209	2026-11-16 11:25:22.599	2026-11-16 11:25:22.229	2026-11-16 11:25:22.596	c2-1794828321858@test.com	ACTIVE	\N	\N	\N
cmwj6fus4000ul3rcb7neh4zk	victim-1794828319244@test.com	$argon2id$v=19$m=65536,t=3,p=1$nV3NGaB4n3b17HBpSo+uVA$MajdJhxnnyBqAMs5GJlHf9chuVvmzcoxTItclFn+EbI	Victim User	\N	CUSTOMER	2026-11-16 11:25:19.637	2026-11-16 11:25:20.584	2026-11-16 11:25:19.655	2026-11-16 11:25:20.581	victim-1794828319244@test.com	ACTIVE	\N	\N	\N
cmwj6fyg50032l3rcif9xvg5z	pilot-e2e-1794828324043@rasoi.pilot	$argon2id$v=19$m=65536,t=3,p=1$6hXb2BUF3xApDWFImRWYuw$RhkK7BswvhnIIK5dvxHdNui+Yu658xtFg6koV3F9yt0	Pilot Lead	\N	RETAILER	2026-11-16 11:25:24.389	2026-11-16 11:25:25.902	2026-11-16 11:25:24.402	2026-11-16 11:25:24.769	pilot-e2e-1794828324043@rasoi.pilot	SUSPENDED	2026-11-16 11:25:25.886	superadmin@rasoiiq.in	End-of-pilot verification suspension
cmwj6fw6s001pl3rc4beefuss	c1-1794828321105@test.com	$argon2id$v=19$m=65536,t=3,p=1$2M6BfPDDiJxEjufNXnOlxQ$mHMQUibd4Y4rhe9Scz1jA4BQJXKbmXPPA13VypaINJ4	User One	\N	CUSTOMER	2026-11-16 11:25:21.461	2026-11-16 11:25:21.82	2026-11-16 11:25:21.474	2026-11-16 11:25:21.817	c1-1794828321105@test.com	ACTIVE	\N	\N	\N
cmwj6fxs9002jl3rcumdxv2q8	merchant-cust-1794828323197@test.com	$argon2id$v=19$m=65536,t=3,p=1$LJUqSxaZbuU5waBdH9QU7A$FuFOBPpLueLl5nUDIor/q7f4Y5vLMge7my9/ykZ+sQU	Merchant Customer	\N	RETAILER	2026-11-16 11:25:23.53	2026-11-16 11:25:23.986	2026-11-16 11:25:23.542	2026-11-16 11:25:23.896	merchant-cust-1794828323197@test.com	ACTIVE	\N	\N	\N
cmwj6i2qm000gl3y8pcqvlxgc	ops-1794828421473@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$ei7B0Y2NztlWEGme5dxfyw$AvjwMa3X2hLU38QyzALrOFmmIljpSn1wKR9KXtT0AdQ	Staff OPERATIONS	\N	OPERATIONS	2026-11-16 11:27:03.263	2026-11-16 11:27:03.662	2026-11-16 11:27:03.248	2026-11-16 11:27:03.648	ops-1794828421473@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6i3cr000nl3y8ue8rc6kq	adm-1794828421473@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$PrOCcZXpicslDQFs4EnWxQ$CsCBRPEPDCZEO2fwap7rk4SWKKuW7IQj1a9WJPQtre8	Staff ADMIN	\N	ADMIN	2026-11-16 11:27:04.059	2026-11-16 11:27:04.42	2026-11-16 11:27:04.044	2026-11-16 11:27:04.406	adm-1794828421473@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6i1mh0000l3y89i7lmtz5	cust-1794828421473@test.com	$argon2id$v=19$m=65536,t=3,p=1$8HDxUvWmviSNcp/GqGUqZQ$dy9+2vMxaFw8Srg+Pd+tK7lHMMXdVelrndPl5kjcM1M	Test Customer Role	\N	CUSTOMER	2026-11-16 11:27:01.817	2026-11-16 11:27:02.215	2026-11-16 11:27:01.845	2026-11-16 11:27:02.201	cust-1794828421473@test.com	ACTIVE	\N	\N	\N
cmwj6i27e0009l3y81t08q7fy	supp-1794828421473@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$6G2rI0IdVccpkmk1gvWg8A$H8E5GQCSV39IkBs+UtB4g94DQXq1T420d8rLV5Gb+UY	Staff SUPPORT	\N	SUPPORT	2026-11-16 11:27:02.57	2026-11-16 11:27:02.919	2026-11-16 11:27:02.556	2026-11-16 11:27:02.905	supp-1794828421473@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6i45g000ul3y88a15dh2l	victim-1794828424660@test.com	$argon2id$v=19$m=65536,t=3,p=1$uhSWvEDiiBMauvfwW31gIQ$BtVHVmheVaKkJXPrDw+ewyJyBNaz5wLlhwzCjAUYMTU	Victim User	\N	CUSTOMER	2026-11-16 11:27:05.092	2026-11-16 11:27:06.097	2026-11-16 11:27:05.11	2026-11-16 11:27:06.083	victim-1794828424660@test.com	ACTIVE	\N	\N	\N
cmwj6i5l7001pl3y8mka3cba2	c1-1794828426601@test.com	$argon2id$v=19$m=65536,t=3,p=1$6BOVX20li6PSJ0LxvkecHg$nY76rAkw73aNI38qi44ovLv3Ar38LWSWVzBAMHhJy/Y	User One	\N	CUSTOMER	2026-11-16 11:27:06.955	2026-11-16 11:27:07.386	2026-11-16 11:27:06.969	2026-11-16 11:27:07.372	c1-1794828426601@test.com	ACTIVE	\N	\N	\N
cmwj6i69z0024l3y82xdd2a3j	c2-1794828427432@test.com	$argon2id$v=19$m=65536,t=3,p=1$CkzC5vxkmq6tK0Q9Jh0Q3w$Z2PL2zjcwdnxk9t0AupemdO5Ngo83207PCRbc8ItQoU	User Two	\N	CUSTOMER	2026-11-16 11:27:07.847	2026-11-16 11:27:08.266	2026-11-16 11:27:07.861	2026-11-16 11:27:08.252	c2-1794828427432@test.com	ACTIVE	\N	\N	\N
cmwj6i7ax002jl3y8cvctzzmw	merchant-cust-1794828428835@test.com	$argon2id$v=19$m=65536,t=3,p=1$52Ghw8Q3oei+zZ2JDR5CFg$tJd9QazN3v0kjKKj8G8IApU4Yb9ZZtnzZ7QukqmB+4s	Merchant Customer	\N	RETAILER	2026-11-16 11:27:09.178	2026-11-16 11:27:09.66	2026-11-16 11:27:09.189	2026-11-16 11:27:09.548	merchant-cust-1794828428835@test.com	ACTIVE	\N	\N	\N
cmwj6i8oi003ll3y8ckc7swdj	invited-1794828430554@pilot.com	$argon2id$v=19$m=65536,t=3,p=1$OPyG1TNavI1UPDCMZA3yVQ$xyGAiFG6+eVxx6NI6WgY9qKXflCgOOQ6XHtUS/C745Q	Aarav Patel	\N	CUSTOMER	2026-11-16 11:27:10.962	2026-11-16 11:27:11.334	2026-11-16 11:27:10.978	2026-11-16 11:27:11.319	invited-1794828430554@pilot.com	ACTIVE	\N	\N	\N
cmwj6i80g0032l3y87a4qyxrq	pilot-e2e-1794828429721@rasoi.pilot	$argon2id$v=19$m=65536,t=3,p=1$sueF8kzlqb2QgwYFaAGqmw$8kUh9RBWg14Nyocs9OJ02Q9vx38u0CKojEQBoeJGe94	Pilot Lead	\N	RETAILER	2026-11-16 11:27:10.096	2026-11-16 11:27:11.665	2026-11-16 11:27:10.108	2026-11-16 11:27:10.503	pilot-e2e-1794828429721@rasoi.pilot	SUSPENDED	2026-11-16 11:27:11.651	superadmin@rasoiiq.in	End-of-pilot verification suspension
cmwj6x9tt0095l3y8z0swl428	victim-1794829131883@test.com	$argon2id$v=19$m=65536,t=3,p=1$JFpaMvVcbjmMPDVfgL43JQ$Jt6m06lNLQ0QLhxzEURaAOdHClZMnVTql/YBE/4k8NM	Victim User	\N	CUSTOMER	2026-11-16 11:38:52.289	2026-11-16 11:38:53.302	2026-11-16 11:38:52.324	2026-11-16 11:38:53.301	victim-1794829131883@test.com	ACTIVE	\N	\N	\N
cmwj6lru7007ol3y8kcaeerkv	victim-1794828595382@test.com	$argon2id$v=19$m=65536,t=3,p=1$Q6H4dEcw9lbpt/CpVonhwA$Jeq0AlQmxTUSmkpVDPbehUXQ+v6eegyal/0mCBm7zQ4	Victim User	\N	CUSTOMER	2026-11-16 11:29:55.759	2026-11-16 11:29:56.298	2026-11-16 11:29:55.781	2026-11-16 11:29:56.141	victim-1794828595382@test.com	ACTIVE	\N	\N	\N
cmwj6xbbf00a0l3y8gyrqt637	c1-1794829133836@test.com	$argon2id$v=19$m=65536,t=3,p=1$9in5cXi0FXh9x51tD6xedA$YL5ERbwtnS2mdmbpunaQKkT9jAJB8h5pJSsh/CBR/TU	User One	\N	CUSTOMER	2026-11-16 11:38:54.22	2026-11-16 11:38:54.644	2026-11-16 11:38:54.239	2026-11-16 11:38:54.642	c1-1794829133836@test.com	ACTIVE	\N	\N	\N
cmwj6x73q008bl3y80mv4nrrt	cust-1794829128395@test.com	$argon2id$v=19$m=65536,t=3,p=1$Ls2rCyKyA6ShXOeuHB2BiQ$xJheU5RutxTH8gp1N8EQoiITT1frZq7Yr6mQLwYUDiI	Test Customer Role	\N	CUSTOMER	2026-11-16 11:38:48.758	2026-11-16 11:38:49.164	2026-11-16 11:38:48.786	2026-11-16 11:38:49.162	cust-1794829128395@test.com	ACTIVE	\N	\N	\N
cmwj6x7qe008kl3y8a992cwtg	supp-1794829128395@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$/iFgeByCThyyv3CSqPU3Jg$DiK7iYPxf6LopbPX5880Q+rqZIoppnhqFHGolfCShAs	Staff SUPPORT	\N	SUPPORT	2026-11-16 11:38:49.575	2026-11-16 11:38:50.031	2026-11-16 11:38:49.572	2026-11-16 11:38:50.029	supp-1794829128395@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6lnqa0061l3y8x72iose3	rogue.admin.mwj6lngd@test.in	$argon2id$v=19$m=65536,t=3,p=1$HNGRuyKb4Ub5S/IxKqGpQw$R/KiKn2jcqmtmqConQX0TKt2IAcIkvr1XMFnmQ/UKC0	Rogue Admin Attempt	\N	RETAILER	2026-11-16 11:29:50.435	2026-11-16 11:29:50.983	\N	\N	rogue.admin.mwj6lngd@test.in	ACTIVE	\N	\N	\N
cmwj6lom7006ml3y82vyxlgqt	ops.lead.mwj6lngd@rasoiiq.in	$argon2id$v=19$m=65536,t=3,p=1$roslcS19Sh8ZpXenJFMmwA$z7ihi/ehWrz+Jg2vw0nttTlebZ6+nhS0EF0/q61DwmY	Operations Lead	\N	SUPPORT	2026-11-16 11:29:51.584	2026-11-16 11:29:51.612	2026-11-16 11:29:51.578	\N	ops.lead.mwj6lngd@rasoiiq.in	ACTIVE	\N	\N	\N
cmwj6lpdo006ul3y8avmmqk3e	cust-1794828592235@test.com	$argon2id$v=19$m=65536,t=3,p=1$EbSmshA2SjaLOjbMfRuCZw$yRCqVYcbagzC3w7gWMLWAgW04WYnqKIkUebYGU/bWVE	Test Customer Role	\N	CUSTOMER	2026-11-16 11:29:52.573	2026-11-16 11:29:52.952	2026-11-16 11:29:52.593	2026-11-16 11:29:52.947	cust-1794828592235@test.com	ACTIVE	\N	\N	\N
cmwj6lpzg0073l3y8l9hrhx3m	supp-1794828592235@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$W5EyDU2/MrWHcGVGdf9bGw$LOnnjnrljvjFj/Ni7fBReyq0v7NIhBjodJeGqDDq9bI	Staff SUPPORT	\N	SUPPORT	2026-11-16 11:29:53.356	2026-11-16 11:29:53.699	2026-11-16 11:29:53.35	2026-11-16 11:29:53.694	supp-1794828592235@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6lqjj007al3y8slbome7k	ops-1794828592235@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$18WyDgdSslyXbMhvaIjHVA$krOBtS+tuZjsL+IMwLGh/LOYME0f9Z4k6BxImwHoGTY	Staff OPERATIONS	\N	OPERATIONS	2026-11-16 11:29:54.079	2026-11-16 11:29:54.439	2026-11-16 11:29:54.073	2026-11-16 11:29:54.433	ops-1794828592235@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6lr4p007hl3y84mwsuw0j	adm-1794828592235@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$42TYkS3cc3WRv7ea3Wn8pw$riqL4gDSCAIK2Ay6D2k57KNercHaaaAuzxMTi4MrN7c	Staff ADMIN	\N	ADMIN	2026-11-16 11:29:54.841	2026-11-16 11:29:55.222	2026-11-16 11:29:54.835	2026-11-16 11:29:55.217	adm-1794828592235@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6x8dl008rl3y8skrrtrwr	ops-1794829128395@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$MPsy/iamWBQgunGy/eQRaw$7L9li6nY34W+xAO0AM1sB1NJId7WFpUKFVGe1KcZtNE	Staff OPERATIONS	\N	OPERATIONS	2026-11-16 11:38:50.41	2026-11-16 11:38:50.823	2026-11-16 11:38:50.408	2026-11-16 11:38:50.821	ops-1794829128395@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6x908008yl3y8d6w9fi4s	adm-1794829128395@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$eRw8yy7vtlqgptihu43Lwg$CfyDETGn7NVkvSmOQt+JvY4qZmzP0cLqKPQu04TmVS8	Staff ADMIN	\N	ADMIN	2026-11-16 11:38:51.224	2026-11-16 11:38:51.638	2026-11-16 11:38:51.222	2026-11-16 11:38:51.635	adm-1794829128395@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6xbyb00afl3y8paohnqpl	c2-1794829134686@test.com	$argon2id$v=19$m=65536,t=3,p=1$MIF6lCPDFJnLCnbf7WR8kQ$zdr1yKbDR2Xf+4l8btVETrZRJ7nS8oy4whrOzZf4lGo	User Two	\N	CUSTOMER	2026-11-16 11:38:55.043	2026-11-16 11:38:55.424	2026-11-16 11:38:55.06	2026-11-16 11:38:55.422	c2-1794829134686@test.com	ACTIVE	\N	\N	\N
cmwj6z5p300exl3y8wgdxik10	ops.lead.mwj6z4en@rasoiiq.in	$argon2id$v=19$m=65536,t=3,p=1$X/Z8VKYOT1EuFfWOf+KMCA$XExyz/QIVCkmbh1wzr/QggMt5i/dpgTzfT/KUdjnFsE	Operations Lead	\N	SUPPORT	2026-11-16 11:40:20.247	2026-11-16 11:40:20.277	2026-11-16 11:40:20.243	\N	ops.lead.mwj6z4en@rasoiiq.in	ACTIVE	\N	\N	\N
cmwj6xeit00bwl3y8yks7cd7r	invited-1794829137950@pilot.com	$argon2id$v=19$m=65536,t=3,p=1$1EnCgyKyoH7nb5FOf5G87Q$j0o/u61dwQdhkk9ELOR/f/2fSWx6S1qslhYR5zleGzk	Aarav Patel	\N	CUSTOMER	2026-11-16 11:38:58.373	2026-11-16 11:38:58.81	2026-11-16 11:38:58.391	2026-11-16 11:38:58.808	invited-1794829137950@pilot.com	ACTIVE	\N	\N	\N
cmwj6xd1w00aul3y8ll382ry0	merchant-cust-1794829136062@test.com	$argon2id$v=19$m=65536,t=3,p=1$TD6XO8vM/nzE1aDLcbopRw$BCgyW99qv2ApExbdLWnuLR7C68ZzmDRzKMi0rYbmJ8A	Merchant Customer	\N	RETAILER	2026-11-16 11:38:56.468	2026-11-16 11:38:56.954	2026-11-16 11:38:56.486	2026-11-16 11:38:56.86	merchant-cust-1794829136062@test.com	ACTIVE	\N	\N	\N
cmwj6xdtd00bdl3y825vovtmm	pilot-e2e-1794829137015@rasoi.pilot	$argon2id$v=19$m=65536,t=3,p=1$DxXufmMFaxpQ5tvNdtBDaA$2FarZCNuY89A8eyt9GBSpV6ZoT5TqYFANxjTbOKkh3g	Pilot Lead	\N	RETAILER	2026-11-16 11:38:57.457	2026-11-16 11:38:59.103	2026-11-16 11:38:57.483	2026-11-16 11:38:57.908	pilot-e2e-1794829137015@rasoi.pilot	SUSPENDED	2026-11-16 11:38:59.101	superadmin@rasoiiq.in	End-of-pilot verification suspension
cmwj6z4po00ecl3y84i7cp32h	rogue.admin.mwj6z4en@test.in	$argon2id$v=19$m=65536,t=3,p=1$KYXq65o41DIgzROUaPIeKQ$oh9Q6uceU4FkIp/98QunhSUaFJPREYNdyzNDUxQsowo	Rogue Admin Attempt	\N	RETAILER	2026-11-16 11:40:18.972	2026-11-16 11:40:19.642	\N	\N	rogue.admin.mwj6z4en@test.in	ACTIVE	\N	\N	\N
cmwj6z6hh00f5l3y8wly8d46b	cust-1794829220915@test.com	$argon2id$v=19$m=65536,t=3,p=1$9hOhBMRsj3BBuWD+ZzcPvA$GrTaSj/up1N3rHt3+MPrmLvLTQi7c8PzNvxb+cAUOZk	Test Customer Role	\N	CUSTOMER	2026-11-16 11:40:21.269	2026-11-16 11:40:21.68	2026-11-16 11:40:21.286	2026-11-16 11:40:21.677	cust-1794829220915@test.com	ACTIVE	\N	\N	\N
cmwj6z74200fel3y8b21ragl4	supp-1794829220915@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$TWa4QXh2BtUv9AN6CFxcKA$RIc203qUHFbHp7+P1TAXu7yiyI8Azu+B+wch7hgY7zU	Staff SUPPORT	\N	SUPPORT	2026-11-16 11:40:22.082	2026-11-16 11:40:22.456	2026-11-16 11:40:22.079	2026-11-16 11:40:22.452	supp-1794829220915@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6z7ou00fll3y8gipg5bo4	ops-1794829220915@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$0FS8pKl0/01TzJBvvDW6Xw$m/z4TYKntRV/wxGUgdPILvQQl8VhKpncL8rU6yTqBec	Staff OPERATIONS	\N	OPERATIONS	2026-11-16 11:40:22.83	2026-11-16 11:40:23.204	2026-11-16 11:40:22.826	2026-11-16 11:40:23.201	ops-1794829220915@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6z89z00fsl3y8z0848h4i	adm-1794829220915@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$xjbPWFLAngbBnEqA872KRw$W+sKwU7KYyYB1/wEn0ZNxXr53A823SQQCBOg/zH3GQI	Staff ADMIN	\N	ADMIN	2026-11-16 11:40:23.591	2026-11-16 11:40:23.996	2026-11-16 11:40:23.587	2026-11-16 11:40:23.992	adm-1794829220915@rasoi.internal	ACTIVE	\N	\N	\N
cmwj6z8ya00fzl3y8xja0epch	victim-1794829224150@test.com	$argon2id$v=19$m=65536,t=3,p=1$FNLr6LyzPxkvPBkJbXMNcQ$NTKsRTd0blT4awEmD+2JTK1lcG04hDmdkg3dhDnArSc	Victim User	\N	CUSTOMER	2026-11-16 11:40:24.466	2026-11-16 11:40:25.398	2026-11-16 11:40:24.478	2026-11-16 11:40:25.395	victim-1794829224150@test.com	ACTIVE	\N	\N	\N
cmwj6zabr00gul3y8iotaejmx	c1-1794829225928@test.com	$argon2id$v=19$m=65536,t=3,p=1$L2mM1JW42/iM5bO4w8vSSw$+WP4+ljyZnP9ErMakz3xsQw+7aYAfa55/e+s5f+YdUY	User One	\N	CUSTOMER	2026-11-16 11:40:26.247	2026-11-16 11:40:26.691	2026-11-16 11:40:26.263	2026-11-16 11:40:26.687	c1-1794829225928@test.com	ACTIVE	\N	\N	\N
cmwj6zb0b00h9l3y8jbf1bxsl	c2-1794829226743@test.com	$argon2id$v=19$m=65536,t=3,p=1$QLLczjTNFxErRyJ7zwLfjg$c5b30Or0A21u8BuJ59xrgeyNry0n7InJ14JyOIxTAxo	User Two	\N	CUSTOMER	2026-11-16 11:40:27.131	2026-11-16 11:40:27.515	2026-11-16 11:40:27.146	2026-11-16 11:40:27.511	c2-1794829226743@test.com	ACTIVE	\N	\N	\N
cmwj7lzfz000yl3jsoax6761b	reta-1794830284900@merchant.com	$argon2id$v=19$m=65536,t=3,p=1$XjSDrWcU05YFcjzmPSoc0g$CQBnYQBfWGm+TIQYE5bMVocl13kUr+zv2pd9/k8M2Ps	Merchant A Owner	\N	RETAILER	2026-11-16 11:58:05.231	2026-11-16 11:58:06.879	2026-11-16 11:58:05.257	2026-11-16 11:58:06.874	reta-1794830284900@merchant.com	ACTIVE	\N	\N	\N
cmwj6zc1800hol3y8bm6l3skb	merchant-cust-1794829228122@test.com	$argon2id$v=19$m=65536,t=3,p=1$ey4S0nHVMxlxO06rFswulg$LqJ1h+cOywL9g9gZOJZ9IGClxzSUz1Oku505Lv/4EmQ	Merchant Customer	\N	RETAILER	2026-11-16 11:40:28.46	2026-11-16 11:40:28.939	2026-11-16 11:40:28.474	2026-11-16 11:40:28.85	merchant-cust-1794829228122@test.com	ACTIVE	\N	\N	\N
cmwj7m01y001bl3js2hkruhrk	retb-1794830285691@merchant.com	$argon2id$v=19$m=65536,t=3,p=1$3EM3UlqRj4w9ZBbcB0uHjg$76c2ARhmdOgAlaxT8FerkUkZDHRZMiAWTAjf9l0RhdI	Merchant B Owner	\N	RETAILER	2026-11-16 11:58:06.023	2026-11-16 11:58:07.317	2026-11-16 11:58:06.042	2026-11-16 11:58:07.311	retb-1794830285691@merchant.com	ACTIVE	\N	\N	\N
cmwj6zddx00iql3y8wulseycc	invited-1794829229796@pilot.com	$argon2id$v=19$m=65536,t=3,p=1$bNz/dete9Pu+5tOZ6ptdUA$RbL1ZckyBPricyDk1kmoIiqE+Uew5IK0nc8p6tsWRM8	Aarav Patel	\N	CUSTOMER	2026-11-16 11:40:30.213	2026-11-16 11:40:30.608	2026-11-16 11:40:30.228	2026-11-16 11:40:30.604	invited-1794829229796@pilot.com	ACTIVE	\N	\N	\N
cmwj6zcpy00i7l3y8vp2u3gdx	pilot-e2e-1794829228985@rasoi.pilot	$argon2id$v=19$m=65536,t=3,p=1$EWVSMyeX77PykAFtd1z7EQ$PCaEnF46CqvEKo2mek8lQfiu+luQ1MraJVzl4MWgfAA	Pilot Lead	\N	RETAILER	2026-11-16 11:40:29.351	2026-11-16 11:40:30.898	2026-11-16 11:40:29.366	2026-11-16 11:40:29.754	pilot-e2e-1794829228985@rasoi.pilot	SUSPENDED	2026-11-16 11:40:30.894	superadmin@rasoiiq.in	End-of-pilot verification suspension
cmwj7n37w003hl3jsck0kq2ij	suspapp-1794830336455@pilot.com	$argon2id$v=19$m=65536,t=3,p=1$a+bBes0BPLQ6KlD4YGBlRA$+u8pKDysABRInLCEpw1kVTRMK2QJxsrlNfr0s3G8o+w	Suspended Applicant	\N	CUSTOMER	2026-11-16 11:58:56.78	2026-11-16 11:58:56.802	2026-11-16 11:58:56.798	\N	suspapp-1794830336455@pilot.com	SUSPENDED	\N	\N	\N
cmwj7l1cj0002l3jsbgwcbmwx	cust-susp-1794830240711@pilot.com	$argon2id$v=19$m=65536,t=3,p=1$eYMiD/OfpNIKRVdIHpSTuQ$MMn+Kf22XbN3hlaS1RE5ubPJo2PzzMhBOb/H/UChQv8	Suspension Test Customer	\N	CUSTOMER	2026-11-16 11:57:21.043	2026-11-16 11:57:21.436	2026-11-16 11:57:21.073	2026-11-16 11:57:21.43	cust-susp-1794830240711@pilot.com	ACTIVE	\N	\N	\N
cmwj7n0n7001yl3jsz11tqw4e	cust-susp-1794830333112@pilot.com	$argon2id$v=19$m=65536,t=3,p=1$6faXfJx+Xk3svAUlMRbnEA$U1fh/P1gC4Xu82R/C4SdH5sWmvGDVJJnByCv0PneVws	Suspension Test Customer	\N	CUSTOMER	2026-11-16 11:58:53.444	2026-11-16 11:58:53.972	2026-11-16 11:58:53.461	2026-11-16 11:58:53.792	cust-susp-1794830333112@pilot.com	ACTIVE	\N	\N	\N
cmwj7lyng000dl3js8tqyxiym	cust-susp-1794830283859@pilot.com	$argon2id$v=19$m=65536,t=3,p=1$cM3aSFXRudYNMlG/EVY56g$aeGhN/+fYNIT2P0ekHl6NOej5AYYBhK3WfmyFWYtjeQ	Suspension Test Customer	\N	CUSTOMER	2026-11-16 11:58:04.205	2026-11-16 11:58:04.779	2026-11-16 11:58:04.233	2026-11-16 11:58:04.587	cust-susp-1794830283859@pilot.com	ACTIVE	\N	\N	\N
cmwj7o7bg0047l3js67k4d347	reta-1794830388421@merchant.com	$argon2id$v=19$m=65536,t=3,p=1$j6SagDJSuKMifc8mDCuFkw$efasCfc7O62vcca69/iQgTrw9VMkbR1EMxhB/PTNBXY	Merchant A Owner	\N	RETAILER	2026-11-16 11:59:48.749	2026-11-16 11:59:50.233	2026-11-16 11:59:48.768	2026-11-16 11:59:50.217	reta-1794830388421@merchant.com	ACTIVE	\N	\N	\N
cmwj7o7w0004kl3jsjpz2qr0v	retb-1794830389167@merchant.com	$argon2id$v=19$m=65536,t=3,p=1$VP8/vja3Q0kwsFx0WqEhVQ$WuKDZkID/P0CmP5AITjw39pcVrUN96k/nLolAIGogC8	Merchant B Owner	\N	RETAILER	2026-11-16 11:59:49.488	2026-11-16 11:59:50.584	2026-11-16 11:59:49.508	2026-11-16 11:59:50.567	retb-1794830389167@merchant.com	ACTIVE	\N	\N	\N
cmwj7o6ko003ml3jsfxik77ut	cust-susp-1794830387457@pilot.com	$argon2id$v=19$m=65536,t=3,p=1$u3MWLQwtwRK1oxQ6kCmTDw$Fo4tvNrQiBCHTFgZD9hqswXSF6d4yPdHlws5DKyBh38	Suspension Test Customer	\N	CUSTOMER	2026-11-16 11:59:47.784	2026-11-16 11:59:48.318	2026-11-16 11:59:47.806	2026-11-16 11:59:48.143	cust-susp-1794830387457@pilot.com	ACTIVE	\N	\N	\N
cmwj7ore8006xl3jslfdqmo7e	suspapp-1794830414449@pilot.com	$argon2id$v=19$m=65536,t=3,p=1$P8Y+tLkUod42KdOqijG7Yg$rh+Y/l8UFs0dI/reb8WKVvpE86MMQGCU+V7eX9du06I	Suspended Applicant	\N	CUSTOMER	2026-11-16 12:00:14.768	2026-11-16 12:00:14.79	2026-11-16 12:00:14.788	\N	suspapp-1794830414449@pilot.com	SUSPENDED	\N	\N	\N
cmwj7n1e0002jl3jsh9vx8s87	reta-1794830334083@merchant.com	$argon2id$v=19$m=65536,t=3,p=1$qBc+y4uheImbKyDbgKwXtg$tVVHSjjVCDKDRJnFNIHg5V/klz8Xafm2qn79pdxeFD4	Merchant A Owner	\N	RETAILER	2026-11-16 11:58:54.408	2026-11-16 11:58:55.949	2026-11-16 11:58:54.424	2026-11-16 11:58:55.933	reta-1794830334083@merchant.com	ACTIVE	\N	\N	\N
cmwj7n1yu002wl3jsr6auh782	retb-1794830334839@merchant.com	$argon2id$v=19$m=65536,t=3,p=1$Djtow3BWKfVp/R3ciqA9ZA$chcpSqZ/ofl0lEsLfy3U/Eb6rXecv5cTb8XMZ3DdyWc	Merchant B Owner	\N	RETAILER	2026-11-16 11:58:55.158	2026-11-16 11:58:56.344	2026-11-16 11:58:55.176	2026-11-16 11:58:56.328	retb-1794830334839@merchant.com	ACTIVE	\N	\N	\N
cmwj7oodb0055l3js8v9wpnko	cust-susp-1794830410495@pilot.com	$argon2id$v=19$m=65536,t=3,p=1$6J/5/b3oZ989+8XPwofKwQ$u7FnRU6V/wU36ELSPWimNKMtWA1qAjszSs/VHnGq5MU	Suspension Test Customer	\N	CUSTOMER	2026-11-16 12:00:10.847	2026-11-16 12:00:11.373	2026-11-16 12:00:10.869	2026-11-16 12:00:11.214	cust-susp-1794830410495@pilot.com	ACTIVE	\N	\N	\N
cmwj7op3r005ql3jsb2wkt4j7	reta-1794830411477@merchant.com	$argon2id$v=19$m=65536,t=3,p=1$AAJ2NQ6efk0TCyOvICqVtA$GL/ebGj6hB8EbYWZuQSRr7/d0YoyyBqV2FlwZMiN6PQ	Merchant A Owner	\N	RETAILER	2026-11-16 12:00:11.8	2026-11-16 12:00:13.31	2026-11-16 12:00:11.818	2026-11-16 12:00:13.307	reta-1794830411477@merchant.com	ACTIVE	\N	\N	\N
cmwj7opoi0063l3jsb4gz7quy	retb-1794830412220@merchant.com	$argon2id$v=19$m=65536,t=3,p=1$FtIxzA+vInT/SBc820+5/g$l5l7pUGFHCfMXruhqsZLukOaSjBJcZXVUou06UK3/ak	Merchant B Owner	\N	RETAILER	2026-11-16 12:00:12.546	2026-11-16 12:00:13.65	2026-11-16 12:00:12.568	2026-11-16 12:00:13.648	retb-1794830412220@merchant.com	ACTIVE	\N	\N	\N
cmwj7oqu3006ol3jscxsley7w	selfreview-1794830413706@rasoi.internal	$argon2id$v=19$m=65536,t=3,p=1$Fj8eZPOmzXgfoMyxf93i/A$c5P2+szcfaWtbsJdPBVGIV/6tJnlSGkQ5b1A/F6+ghY	Self Review Admin	\N	ADMIN	2026-11-16 12:00:14.043	2026-11-16 12:00:14.393	2026-11-16 12:00:14.041	2026-11-16 12:00:14.391	selfreview-1794830413706@rasoi.internal	ACTIVE	\N	\N	\N
\.


--
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: BasketItem BasketItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BasketItem"
    ADD CONSTRAINT "BasketItem_pkey" PRIMARY KEY (id);


--
-- Name: Basket Basket_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Basket"
    ADD CONSTRAINT "Basket_pkey" PRIMARY KEY (id);


--
-- Name: EmailVerificationToken EmailVerificationToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailVerificationToken"
    ADD CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY (id);


--
-- Name: Feedback Feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Feedback"
    ADD CONSTRAINT "Feedback_pkey" PRIMARY KEY (id);


--
-- Name: HouseholdInvitation HouseholdInvitation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HouseholdInvitation"
    ADD CONSTRAINT "HouseholdInvitation_pkey" PRIMARY KEY (id);


--
-- Name: HouseholdMember HouseholdMember_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HouseholdMember"
    ADD CONSTRAINT "HouseholdMember_pkey" PRIMARY KEY (id);


--
-- Name: Household Household_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Household"
    ADD CONSTRAINT "Household_pkey" PRIMARY KEY (id);


--
-- Name: Ingredient Ingredient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Ingredient"
    ADD CONSTRAINT "Ingredient_pkey" PRIMARY KEY (id);


--
-- Name: MealPlanItem MealPlanItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MealPlanItem"
    ADD CONSTRAINT "MealPlanItem_pkey" PRIMARY KEY (id);


--
-- Name: MealPlan MealPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MealPlan"
    ADD CONSTRAINT "MealPlan_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PantryItem PantryItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PantryItem"
    ADD CONSTRAINT "PantryItem_pkey" PRIMARY KEY (id);


--
-- Name: PasswordResetToken PasswordResetToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: ProductVariant ProductVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: RecipeIngredient RecipeIngredient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RecipeIngredient"
    ADD CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY (id);


--
-- Name: RecipeStep RecipeStep_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RecipeStep"
    ADD CONSTRAINT "RecipeStep_pkey" PRIMARY KEY (id);


--
-- Name: Recipe Recipe_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recipe"
    ADD CONSTRAINT "Recipe_pkey" PRIMARY KEY (id);


--
-- Name: RefreshSession RefreshSession_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshSession"
    ADD CONSTRAINT "RefreshSession_pkey" PRIMARY KEY (id);


--
-- Name: RetailerApplication RetailerApplication_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RetailerApplication"
    ADD CONSTRAINT "RetailerApplication_pkey" PRIMARY KEY (id);


--
-- Name: Retailer Retailer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Retailer"
    ADD CONSTRAINT "Retailer_pkey" PRIMARY KEY (id);


--
-- Name: RevokedToken RevokedToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RevokedToken"
    ADD CONSTRAINT "RevokedToken_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: StoreProduct StoreProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreProduct"
    ADD CONSTRAINT "StoreProduct_pkey" PRIMARY KEY (id);


--
-- Name: Store Store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Store"
    ADD CONSTRAINT "Store_pkey" PRIMARY KEY (id);


--
-- Name: SystemSetting SystemSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SystemSetting"
    ADD CONSTRAINT "SystemSetting_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_action_idx" ON public."AuditLog" USING btree (action);


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_userId_idx" ON public."AuditLog" USING btree ("userId");


--
-- Name: EmailVerificationToken_tokenHash_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON public."EmailVerificationToken" USING btree ("tokenHash");


--
-- Name: EmailVerificationToken_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmailVerificationToken_userId_idx" ON public."EmailVerificationToken" USING btree ("userId");


--
-- Name: HouseholdInvitation_householdId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "HouseholdInvitation_householdId_idx" ON public."HouseholdInvitation" USING btree ("householdId");


--
-- Name: HouseholdInvitation_invitedEmail_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "HouseholdInvitation_invitedEmail_idx" ON public."HouseholdInvitation" USING btree ("invitedEmail");


--
-- Name: HouseholdInvitation_tokenHash_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "HouseholdInvitation_tokenHash_key" ON public."HouseholdInvitation" USING btree ("tokenHash");


--
-- Name: HouseholdMember_householdId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "HouseholdMember_householdId_idx" ON public."HouseholdMember" USING btree ("householdId");


--
-- Name: HouseholdMember_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "HouseholdMember_userId_idx" ON public."HouseholdMember" USING btree ("userId");


--
-- Name: Ingredient_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Ingredient_name_key" ON public."Ingredient" USING btree (name);


--
-- Name: PasswordResetToken_tokenHash_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON public."PasswordResetToken" USING btree ("tokenHash");


--
-- Name: PasswordResetToken_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PasswordResetToken_userId_idx" ON public."PasswordResetToken" USING btree ("userId");


--
-- Name: Payment_orderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payment_orderId_key" ON public."Payment" USING btree ("orderId");


--
-- Name: Payment_transactionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payment_transactionId_key" ON public."Payment" USING btree ("transactionId");


--
-- Name: ProductVariant_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductVariant_sku_key" ON public."ProductVariant" USING btree (sku);


--
-- Name: Recipe_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Recipe_slug_key" ON public."Recipe" USING btree (slug);


--
-- Name: RefreshSession_tokenFamilyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RefreshSession_tokenFamilyId_idx" ON public."RefreshSession" USING btree ("tokenFamilyId");


--
-- Name: RefreshSession_tokenHash_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RefreshSession_tokenHash_key" ON public."RefreshSession" USING btree ("tokenHash");


--
-- Name: RefreshSession_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RefreshSession_userId_idx" ON public."RefreshSession" USING btree ("userId");


--
-- Name: RetailerApplication_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RetailerApplication_userId_idx" ON public."RetailerApplication" USING btree ("userId");


--
-- Name: Retailer_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Retailer_name_key" ON public."Retailer" USING btree (name);


--
-- Name: Retailer_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Retailer_slug_key" ON public."Retailer" USING btree (slug);


--
-- Name: RevokedToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RevokedToken_token_key" ON public."RevokedToken" USING btree (token);


--
-- Name: Session_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_token_key" ON public."Session" USING btree (token);


--
-- Name: SystemSetting_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SystemSetting_key_key" ON public."SystemSetting" USING btree (key);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: AuditLog trg_audit_log_immutable_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_log_immutable_delete BEFORE DELETE ON public."AuditLog" FOR EACH ROW EXECUTE FUNCTION public.audit_log_immutable_trigger();


--
-- Name: AuditLog trg_audit_log_immutable_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_log_immutable_update BEFORE UPDATE ON public."AuditLog" FOR EACH ROW EXECUTE FUNCTION public.audit_log_immutable_trigger();


--
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BasketItem BasketItem_basketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BasketItem"
    ADD CONSTRAINT "BasketItem_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES public."Basket"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BasketItem BasketItem_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BasketItem"
    ADD CONSTRAINT "BasketItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Basket Basket_householdId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Basket"
    ADD CONSTRAINT "Basket_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES public."Household"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Basket Basket_selectedRetailerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Basket"
    ADD CONSTRAINT "Basket_selectedRetailerId_fkey" FOREIGN KEY ("selectedRetailerId") REFERENCES public."Retailer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EmailVerificationToken EmailVerificationToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailVerificationToken"
    ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Feedback Feedback_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Feedback"
    ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: HouseholdInvitation HouseholdInvitation_householdId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HouseholdInvitation"
    ADD CONSTRAINT "HouseholdInvitation_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES public."Household"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: HouseholdMember HouseholdMember_householdId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HouseholdMember"
    ADD CONSTRAINT "HouseholdMember_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES public."Household"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: HouseholdMember HouseholdMember_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HouseholdMember"
    ADD CONSTRAINT "HouseholdMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Household Household_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Household"
    ADD CONSTRAINT "Household_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MealPlanItem MealPlanItem_mealPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MealPlanItem"
    ADD CONSTRAINT "MealPlanItem_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES public."MealPlan"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MealPlanItem MealPlanItem_recipeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MealPlanItem"
    ADD CONSTRAINT "MealPlanItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES public."Recipe"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MealPlan MealPlan_householdId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MealPlan"
    ADD CONSTRAINT "MealPlan_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES public."Household"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PantryItem PantryItem_householdId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PantryItem"
    ADD CONSTRAINT "PantryItem_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES public."Household"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PantryItem PantryItem_ingredientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PantryItem"
    ADD CONSTRAINT "PantryItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES public."Ingredient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PasswordResetToken PasswordResetToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductVariant ProductVariant_ingredientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES public."Ingredient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductVariant ProductVariant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RecipeIngredient RecipeIngredient_ingredientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RecipeIngredient"
    ADD CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES public."Ingredient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RecipeIngredient RecipeIngredient_recipeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RecipeIngredient"
    ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES public."Recipe"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RecipeStep RecipeStep_recipeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RecipeStep"
    ADD CONSTRAINT "RecipeStep_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES public."Recipe"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RefreshSession RefreshSession_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshSession"
    ADD CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RetailerApplication RetailerApplication_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RetailerApplication"
    ADD CONSTRAINT "RetailerApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StoreProduct StoreProduct_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreProduct"
    ADD CONSTRAINT "StoreProduct_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StoreProduct StoreProduct_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreProduct"
    ADD CONSTRAINT "StoreProduct_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Store Store_retailerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Store"
    ADD CONSTRAINT "Store_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES public."Retailer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict yBn2guBsFSqjvYle2ifBWvEVAEaadXfxFhPn57stejON0aG9laIhVUHyW6VuMsI

