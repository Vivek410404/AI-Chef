--
-- PostgreSQL database dump
--

\restrict qw8SRf6O2P7Ep9lJAUBdOfbgFaiBeDBtfwlAjQ20w47SfJNzT90KsL7lPnG21gg

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
    'ADMIN'
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
    "updatedAt" timestamp(3) without time zone NOT NULL
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
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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
    rating double precision DEFAULT 4.7 NOT NULL
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
    "reviewedBy" text
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
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL
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
hh-patel-family	user-demo-patel	Patel Family	MEDIUM	99999	Daily Fresh	2026-11-16 06:15:05.059	2026-11-16 10:00:31.218	Ahmedabad	India	ALL_INDIAN	JAIN	\N	4	Gujarat
hh-sharma-family	user-demo-1	Sharma Family	MEDIUM	4500	Daily Fresh	2026-11-16 06:15:04.99	2026-11-16 10:00:35.74	Ahmedabad	India	ALL_INDIAN	VEGETARIAN	\N	4	Gujarat
\.


--
-- Data for Name: HouseholdInvitation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."HouseholdInvitation" (id, "householdId", "invitedEmail", "invitedByUserId", "tokenHash", role, "expiresAt", "acceptedAt", "revokedAt", "createdAt") FROM stdin;
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
\.


--
-- Data for Name: MealPlanItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MealPlanItem" (id, "mealPlanId", "dayOfWeek", "mealCategory", "recipeId", servings, notes) FROM stdin;
plan-item-1794823230126-43j98	mp-hh-sharma-family	monday	breakfast	recipe-kanda-poha	4	\N
plan-item-1794823230126-969if	mp-hh-sharma-family	monday	lunch	recipe-gujarati-khatti-meethi-dal	4	\N
plan-item-1794823230126-o7ovk	mp-hh-sharma-family	monday	dinner	recipe-paneer-butter-masala	4	\N
plan-item-1794823230126-cfm5u	mp-hh-sharma-family	tuesday	breakfast	recipe-rava-upma	4	\N
plan-item-1794823230126-u1drw	mp-hh-sharma-family	tuesday	lunch	recipe-rajma-chawal	4	\N
plan-item-1794823230126-u44h6	mp-hh-sharma-family	tuesday	dinner	recipe-amritsari-chole	4	\N
plan-item-1794823230126-saduk	mp-hh-sharma-family	wednesday	breakfast	recipe-masala-dosa	4	\N
plan-item-1794823230126-e0kz5	mp-hh-sharma-family	wednesday	dinner	recipe-baingan-bharta	4	\N
plan-item-1794823230126-3joc2	mp-hh-sharma-family	thursday	breakfast	recipe-idli-sambar	4	\N
plan-item-1794823230126-bijs6	mp-hh-sharma-family	thursday	lunch	recipe-sev-tameta-nu-shaak	4	\N
plan-item-1794823230126-ezqhd	mp-hh-sharma-family	thursday	dinner	recipe-bajra-no-rotlo	4	\N
plan-item-1794823230126-jh3ij	mp-hh-sharma-family	friday	breakfast	recipe-gujarati-handvo	4	\N
plan-item-1794823230126-7v74b	mp-hh-sharma-family	friday	lunch	recipe-ringna-no-olo	4	\N
plan-item-1794823230126-5eif1	mp-hh-sharma-family	friday	dinner	recipe-bajra-no-rotlo-vegan	4	\N
plan-item-1794823230126-qkf7y	mp-hh-sharma-family	saturday	breakfast	recipe-khaman-dhokla	4	\N
plan-item-1794823230126-yua33	mp-hh-sharma-family	saturday	lunch	recipe-surati-undhiyu-jain	4	\N
plan-item-1794823230126-fadcx	mp-hh-sharma-family	saturday	dinner	recipe-palak-paneer	4	\N
plan-item-1794823230126-lfoj6	mp-hh-sharma-family	sunday	breakfast	recipe-methi-na-gota	4	\N
plan-item-1794823230126-6i2sj	mp-hh-sharma-family	sunday	lunch	recipe-surati-undhiyu	4	\N
plan-item-1794823230126-eau74	mp-hh-sharma-family	sunday	dinner	recipe-gujarati-kadhi	4	\N
plan-item-1794823230126-dezfn	mp-hh-sharma-family	wednesday	lunch	recipe-paneer-butter-masala	4	\N
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "userId", "retailerName", status, "totalAmountInr", "deliveryFeeInr", "deliveryAddress", "createdAt", "updatedAt") FROM stdin;
ord-1794810679972	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794810679970)	2026-11-16 06:31:19.974	2026-11-16 06:31:19.974
ord-1794810679985	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794810679970)	2026-11-16 06:31:19.986	2026-11-16 06:31:19.986
ord-1794810680000	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794810679970)	2026-11-16 06:31:20.002	2026-11-16 06:31:20.002
ord-1794810680007	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794810679970)	2026-11-16 06:31:20.008	2026-11-16 06:31:20.008
ord-1794810680011	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794810679970)	2026-11-16 06:31:20.012	2026-11-16 06:31:20.012
ord-1794810685357	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 06:31:25.359	2026-11-16 06:31:25.359
ord-1794810807797	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	0	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:33:27.801	2026-11-16 06:33:27.801
ord-1794810810125	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	0	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:33:30.129	2026-11-16 06:33:30.129
ord-1794811140988	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:39:00.996	2026-11-16 06:39:00.996
ord-1794811143232	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:39:03.238	2026-11-16 06:39:03.238
ord-1794811385019	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:43:05.021	2026-11-16 06:43:05.021
ord-1794811387312	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:43:07.314	2026-11-16 06:43:07.314
ord-1794811387318	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 06:43:07.32	2026-11-16 06:43:07.32
ord-1794811429516	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:43:49.518	2026-11-16 06:43:49.518
ord-1794811431745	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:43:51.747	2026-11-16 06:43:51.747
ord-1794811431751	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 06:43:51.753	2026-11-16 06:43:51.753
ord-1794811550892	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	1563	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 06:45:50.898	2026-11-16 06:45:50.898
ord-1794811560233	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	1976	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 06:46:00.239	2026-11-16 06:46:00.239
ord-1794811560548	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794811560549)	2026-11-16 06:46:00.554	2026-11-16 06:46:00.554
ord-1794811560557	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794811560549)	2026-11-16 06:46:00.563	2026-11-16 06:46:00.563
ord-1794811560566	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794811560549)	2026-11-16 06:46:00.572	2026-11-16 06:46:00.572
ord-1794811560574	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794811560549)	2026-11-16 06:46:00.58	2026-11-16 06:46:00.58
ord-1794811560578	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794811560549)	2026-11-16 06:46:00.584	2026-11-16 06:46:00.584
ord-1794811560837	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 06:46:00.843	2026-11-16 06:46:00.843
ord-1794811561424	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:46:01.43	2026-11-16 06:46:01.43
ord-1794811563666	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:46:03.672	2026-11-16 06:46:03.672
ord-1794811563674	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 06:46:03.68	2026-11-16 06:46:03.68
ord-1794811689362	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794811689362)	2026-11-16 06:48:09.365	2026-11-16 06:48:09.365
ord-1794811689377	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794811689362)	2026-11-16 06:48:09.38	2026-11-16 06:48:09.38
ord-1794811689387	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794811689362)	2026-11-16 06:48:09.389	2026-11-16 06:48:09.389
ord-1794811689391	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794811689362)	2026-11-16 06:48:09.394	2026-11-16 06:48:09.394
ord-1794811689396	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794811689362)	2026-11-16 06:48:09.399	2026-11-16 06:48:09.399
ord-1794811709720	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:48:29.723	2026-11-16 06:48:29.723
ord-1794811711940	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:48:31.942	2026-11-16 06:48:31.942
ord-1794811711945	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 06:48:31.947	2026-11-16 06:48:31.947
ord-1794811739645	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:48:59.647	2026-11-16 06:48:59.647
ord-1794811741991	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:49:01.992	2026-11-16 06:49:01.992
ord-1794811742003	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 06:49:02.005	2026-11-16 06:49:02.005
ord-1794811885447	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2680	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 06:51:25.449	2026-11-16 06:51:25.449
ord-1794811929962	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:52:09.966	2026-11-16 06:52:09.966
ord-1794811932183	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 06:52:12.186	2026-11-16 06:52:12.186
ord-1794811932190	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 06:52:12.193	2026-11-16 06:52:12.193
ord-1794814450004	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2680	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 07:34:10.007	2026-11-16 07:34:10.007
ord-1794814456824	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2534	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 07:34:16.826	2026-11-16 07:34:16.826
ord-1794814457196	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794814457182)	2026-11-16 07:34:17.198	2026-11-16 07:34:17.198
ord-1794814457205	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794814457182)	2026-11-16 07:34:17.207	2026-11-16 07:34:17.207
ord-1794814457219	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794814457182)	2026-11-16 07:34:17.22	2026-11-16 07:34:17.22
ord-1794814457226	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794814457182)	2026-11-16 07:34:17.228	2026-11-16 07:34:17.228
ord-1794814457232	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794814457182)	2026-11-16 07:34:17.233	2026-11-16 07:34:17.233
ord-1794814457483	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 07:34:17.485	2026-11-16 07:34:17.485
ord-1794814458050	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:34:18.052	2026-11-16 07:34:18.052
ord-1794814460343	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:34:20.345	2026-11-16 07:34:20.345
ord-1794814460351	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 07:34:20.353	2026-11-16 07:34:20.353
ord-1794814626095	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:37:06.104	2026-11-16 07:37:06.104
ord-1794814628341	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:37:08.35	2026-11-16 07:37:08.35
ord-1794814628348	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 07:37:08.357	2026-11-16 07:37:08.357
ord-1794814892625	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 07:41:32.635	2026-11-16 07:41:32.635
ord-1794815003346	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2534	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 07:43:23.351	2026-11-16 07:43:23.351
ord-1794815057256	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794815055188)	2026-11-16 07:44:17.269	2026-11-16 07:44:17.269
ord-1794815058843	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794815055188)	2026-11-16 07:44:18.856	2026-11-16 07:44:18.856
ord-1794815058852	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794815055188)	2026-11-16 07:44:18.864	2026-11-16 07:44:18.864
ord-1794815058858	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794815055188)	2026-11-16 07:44:18.871	2026-11-16 07:44:18.871
ord-1794815059257	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 07:44:19.269	2026-11-16 07:44:19.269
ord-1794815061238	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:44:21.25	2026-11-16 07:44:21.25
ord-1794815063531	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:44:23.543	2026-11-16 07:44:23.543
ord-1794815063536	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 07:44:23.549	2026-11-16 07:44:23.549
ord-1794815064076	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 07:44:24.088	2026-11-16 07:44:24.088
ord-1794815302442	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2502	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 07:48:22.444	2026-11-16 07:48:22.444
ord-1794815434576	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:50:34.578	2026-11-16 07:50:34.578
ord-1794815436819	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:50:36.821	2026-11-16 07:50:36.821
ord-1794815436826	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 07:50:36.828	2026-11-16 07:50:36.828
ord-1794815437417	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 07:50:37.418	2026-11-16 07:50:37.418
ord-1794815751185	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2569	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 07:55:51.196	2026-11-16 07:55:51.196
ord-1794815758045	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2775	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 07:55:58.057	2026-11-16 07:55:58.057
ord-1794815758521	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794815758527)	2026-11-16 07:55:58.532	2026-11-16 07:55:58.532
ord-1794815758535	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794815758527)	2026-11-16 07:55:58.546	2026-11-16 07:55:58.546
ord-1794815758552	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794815758527)	2026-11-16 07:55:58.563	2026-11-16 07:55:58.563
ord-1794815758562	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794815758527)	2026-11-16 07:55:58.573	2026-11-16 07:55:58.573
ord-1794815758570	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794815758527)	2026-11-16 07:55:58.581	2026-11-16 07:55:58.581
ord-1794815758893	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 07:55:58.904	2026-11-16 07:55:58.904
ord-1794815759614	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:55:59.625	2026-11-16 07:55:59.625
ord-1794815761985	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 07:56:01.996	2026-11-16 07:56:01.996
ord-1794815761995	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 07:56:02.006	2026-11-16 07:56:02.006
ord-1794815762738	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 07:56:02.749	2026-11-16 07:56:02.749
ord-1794817209291	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2852	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 08:20:09.293	2026-11-16 08:20:09.293
ord-1794817219541	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2367	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 08:20:19.543	2026-11-16 08:20:19.543
ord-1794817220036	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794817220033)	2026-11-16 08:20:20.038	2026-11-16 08:20:20.038
ord-1794817220049	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794817220033)	2026-11-16 08:20:20.051	2026-11-16 08:20:20.051
ord-1794817220070	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794817220033)	2026-11-16 08:20:20.072	2026-11-16 08:20:20.072
ord-1794817220081	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794817220033)	2026-11-16 08:20:20.083	2026-11-16 08:20:20.083
ord-1794817220088	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794817220033)	2026-11-16 08:20:20.09	2026-11-16 08:20:20.09
ord-1794817220427	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 08:20:20.429	2026-11-16 08:20:20.429
ord-1794817221225	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 08:20:21.227	2026-11-16 08:20:21.227
ord-1794817223639	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 08:20:23.641	2026-11-16 08:20:23.641
ord-1794817223649	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 08:20:23.651	2026-11-16 08:20:23.651
ord-1794817224528	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 08:20:24.53	2026-11-16 08:20:24.53
ord-1794817822270	user-demo-patel	DMart Ready	DEMO ORDER CONFIRMED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 08:30:22.278	2026-11-16 08:30:22.278
ord-1794818154448	user-demo-patel	DMart Ready	DEMO ORDER CONFIRMED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 08:35:54.451	2026-11-16 08:35:54.451
ord-1794818318403	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2633	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 08:38:38.413	2026-11-16 08:38:38.413
ord-1794818318851	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794818318854)	2026-11-16 08:38:38.861	2026-11-16 08:38:38.861
ord-1794818318865	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794818318854)	2026-11-16 08:38:38.875	2026-11-16 08:38:38.875
ord-1794818318881	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794818318854)	2026-11-16 08:38:38.891	2026-11-16 08:38:38.891
ord-1794818318889	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794818318854)	2026-11-16 08:38:38.899	2026-11-16 08:38:38.899
ord-1794818318898	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794818318854)	2026-11-16 08:38:38.908	2026-11-16 08:38:38.908
ord-1794818319229	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 08:38:39.238	2026-11-16 08:38:39.238
ord-1794818320015	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 08:38:40.024	2026-11-16 08:38:40.024
ord-1794818322341	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 08:38:42.351	2026-11-16 08:38:42.351
ord-1794818322350	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 08:38:42.359	2026-11-16 08:38:42.359
ord-1794818323039	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 08:38:43.049	2026-11-16 08:38:43.049
ord-1794818323463	user-demo-patel	DMart Ready	DEMO ORDER CONFIRMED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 08:38:43.473	2026-11-16 08:38:43.473
ord-1794818377176	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 08:39:37.18	2026-11-16 08:39:37.18
ord-1794818554226	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2827	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 08:42:34.231	2026-11-16 08:42:34.231
ord-1794818567353	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2342	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 08:42:47.355	2026-11-16 08:42:47.355
ord-1794818567850	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794818567848)	2026-11-16 08:42:47.853	2026-11-16 08:42:47.853
ord-1794818567865	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794818567848)	2026-11-16 08:42:47.867	2026-11-16 08:42:47.867
ord-1794818567882	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794818567848)	2026-11-16 08:42:47.885	2026-11-16 08:42:47.885
ord-1794818567891	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794818567848)	2026-11-16 08:42:47.894	2026-11-16 08:42:47.894
ord-1794818567899	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794818567848)	2026-11-16 08:42:47.901	2026-11-16 08:42:47.901
ord-1794818568267	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 08:42:48.27	2026-11-16 08:42:48.27
ord-1794818569015	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 08:42:49.017	2026-11-16 08:42:49.017
ord-1794818571364	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 08:42:51.367	2026-11-16 08:42:51.367
ord-1794818571375	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 08:42:51.378	2026-11-16 08:42:51.378
ord-1794818572170	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 08:42:52.172	2026-11-16 08:42:52.172
ord-1794818572579	user-demo-patel	DMart Ready	DEMO ORDER CONFIRMED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 08:42:52.582	2026-11-16 08:42:52.582
ord-1794822041138	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794822031100)	2026-11-16 09:40:41.139	2026-11-16 09:40:41.139
ord-1794822041797	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794822031100)	2026-11-16 09:40:41.799	2026-11-16 09:40:41.799
ord-1794822041810	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794822031100)	2026-11-16 09:40:41.812	2026-11-16 09:40:41.812
ord-1794822041822	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794822031100)	2026-11-16 09:40:41.824	2026-11-16 09:40:41.824
ord-1794822678759	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794822678756)	2026-11-16 09:51:18.761	2026-11-16 09:51:18.761
ord-1794822678778	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794822678756)	2026-11-16 09:51:18.781	2026-11-16 09:51:18.781
ord-1794822678800	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794822678756)	2026-11-16 09:51:18.802	2026-11-16 09:51:18.802
ord-1794822678810	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794822678756)	2026-11-16 09:51:18.812	2026-11-16 09:51:18.812
ord-1794822678820	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794822678756)	2026-11-16 09:51:18.823	2026-11-16 09:51:18.823
ord-1794822740009	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2689	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 09:52:20.014	2026-11-16 09:52:20.014
ord-1794822741933	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2333	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 09:52:21.938	2026-11-16 09:52:21.938
ord-1794822742958	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794822742955)	2026-11-16 09:52:22.963	2026-11-16 09:52:22.963
ord-1794822742988	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794822742955)	2026-11-16 09:52:22.992	2026-11-16 09:52:22.992
ord-1794822743020	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794822742955)	2026-11-16 09:52:23.025	2026-11-16 09:52:23.025
ord-1794822743037	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794822742955)	2026-11-16 09:52:23.041	2026-11-16 09:52:23.041
ord-1794822743054	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794822742955)	2026-11-16 09:52:23.058	2026-11-16 09:52:23.058
ord-1794822743811	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 09:52:23.816	2026-11-16 09:52:23.816
ord-1794822745019	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 09:52:25.023	2026-11-16 09:52:25.023
ord-1794822747527	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 09:52:27.531	2026-11-16 09:52:27.531
ord-1794822747540	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 09:52:27.544	2026-11-16 09:52:27.544
ord-1794822748460	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 09:52:28.464	2026-11-16 09:52:28.464
ord-1794822748988	user-demo-patel	DMart Ready	DEMO ORDER CONFIRMED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 09:52:28.992	2026-11-16 09:52:28.992
ord-1794822915943	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 09:55:15.947	2026-11-16 09:55:15.947
ord-1794822931859	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 09:55:31.862	2026-11-16 09:55:31.862
ord-1794822934281	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 09:55:34.284	2026-11-16 09:55:34.284
ord-1794822934290	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 09:55:34.293	2026-11-16 09:55:34.293
ord-1794822948567	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 09:55:48.571	2026-11-16 09:55:48.571
ord-1794822958891	user-demo-patel	DMart Ready	DEMO ORDER CONFIRMED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 09:55:58.894	2026-11-16 09:55:58.894
ord-1794823004627	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2372	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 09:56:44.631	2026-11-16 09:56:44.631
ord-1794823005755	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794823005753)	2026-11-16 09:56:45.758	2026-11-16 09:56:45.758
ord-1794823005766	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794823005753)	2026-11-16 09:56:45.769	2026-11-16 09:56:45.769
ord-1794823005785	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794823005753)	2026-11-16 09:56:45.788	2026-11-16 09:56:45.788
ord-1794823005793	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794823005753)	2026-11-16 09:56:45.796	2026-11-16 09:56:45.796
ord-1794823005800	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794823005753)	2026-11-16 09:56:45.803	2026-11-16 09:56:45.803
ord-1794823006121	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 09:56:46.124	2026-11-16 09:56:46.124
ord-1794823007828	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 09:56:47.831	2026-11-16 09:56:47.831
ord-1794823010273	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 09:56:50.276	2026-11-16 09:56:50.276
ord-1794823010285	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 09:56:50.288	2026-11-16 09:56:50.288
ord-1794823010988	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 09:56:50.992	2026-11-16 09:56:50.992
ord-1794823011360	user-demo-patel	DMart Ready	DEMO ORDER CONFIRMED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 09:56:51.363	2026-11-16 09:56:51.363
ord-1794823210498	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2350	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 10:00:10.503	2026-11-16 10:00:10.503
ord-1794823229199	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2350	25	Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103	2026-11-16 10:00:29.203	2026-11-16 10:00:29.203
ord-1794823230317	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	2505	25	Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru 560103 (Karnataka)	2026-11-16 10:00:30.323	2026-11-16 10:00:30.323
ord-1794823231293	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	940	25	Flat 402, Green Glen Layout, Bengaluru 560103 (1794823231286)	2026-11-16 10:00:31.301	2026-11-16 10:00:31.301
ord-1794823231322	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	850	25	Flat 505, Idempotency Tower, Bengaluru 560103 (1794823231286)	2026-11-16 10:00:31.327	2026-11-16 10:00:31.327
ord-1794823231353	user-demo-1	Blinkit	DEMO ORDER CONFIRMED	320	25	Corrected Address, Bengaluru (1794823231286)	2026-11-16 10:00:31.357	2026-11-16 10:00:31.357
ord-1794823231370	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr A (1794823231286)	2026-11-16 10:00:31.374	2026-11-16 10:00:31.374
ord-1794823231385	user-demo-1	Zepto	DEMO ORDER CONFIRMED	500	29	Addr B (1794823231286)	2026-11-16 10:00:31.39	2026-11-16 10:00:31.39
ord-1794823231891	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	85	25	402, Shivalik Highstreet, Bodakdev, Ahmedabad	2026-11-16 10:00:31.895	2026-11-16 10:00:31.895
ord-1794823233090	user-demo-patel	Zepto	DEMO ORDER CONFIRMED	290	29	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 10:00:33.094	2026-11-16 10:00:33.094
ord-1794823235686	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	340	25	304 Shivalik Highstreet, Bodakdev, Ahmedabad - 380054	2026-11-16 10:00:35.691	2026-11-16 10:00:35.691
ord-1794823235701	user-demo-mehta	DMart Ready	DEMO ORDER CONFIRMED	255	49	B-702 Palm Court, Malabar Hill, Mumbai - 400006	2026-11-16 10:00:35.706	2026-11-16 10:00:35.706
ord-1794823236933	user-demo-patel	Blinkit	DEMO ORDER CONFIRMED	1259	25	Bodakdev, Ahmedabad, Gujarat 380054	2026-11-16 10:00:36.938	2026-11-16 10:00:36.938
ord-1794823237743	user-demo-patel	DMart Ready	DEMO ORDER CONFIRMED	130	49	Flat 402, Bodakdev, Ahmedabad	2026-11-16 10:00:37.748	2026-11-16 10:00:37.748
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
cmwivcvo000e1l3q4teh4nxo1	hh-sharma-family	ing-mustard-seeds	200	g	f	\N	2026-11-16 10:00:33.076
pantry-1794817781894	hh-patel-family	ing-bajra-flour	2000	g	f	\N	2026-11-16 10:00:37.613
pantry-1794817791932	hh-mehta-family	ing-raw-banana	1500	g	f	\N	2026-11-16 10:00:37.638
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

COPY public."Recipe" (id, title, slug, description, cuisine, "dietaryTags", "mealTypes", "prepTimeMinutes", "cookTimeMinutes", "defaultServings", difficulty, "caloriesPerServing", "proteinGrams", "carbsGrams", "fatGrams", "fiberGrams", "imageUrl", "estimatedCostInr", "isJainFriendly", "jainAlternativeNotes", rating, "ratingCount", "createdAt") FROM stdin;
recipe-gujarati-khatti-meethi-dal	Authentic Gujarati Khatti Meethi Dal	gujarati-khatti-meethi-dal	A delicate harmony of sweet organic jaggery and tangy kokum or lemon, tempered with mustard, cumin, and fragrant curry leaves. A Jain dietary staple.	Gujarati	{"Pure Vegetarian",Vegetarian,"Jain Friendly",Diabetic-Friendly}	{lunch,dinner}	10	20	4	Easy	185	8	30	4	6	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	95	t	\N	4.8	120	2026-11-16 06:15:04.323
recipe-methi-thepla	Spiced Gujarati Methi Thepla	methi-thepla	Golden spiced flatbreads made with whole wheat flour, fresh fenugreek leaves, sesame, and yogurt. The iconic travel and breakfast food of Gujarat.	Gujarati	{"Pure Vegetarian",Vegetarian,"Jain Friendly",Kid-Friendly}	{breakfast,snack}	15	15	4	Easy	210	6	32	7	5	https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80	80	t	\N	4.8	120	2026-11-16 06:15:04.341
recipe-masala-dosa	Crispy Bengaluru Masala Dosa	bengaluru-masala-dosa	Golden fermented rice and urad dal crepe slathered with red garlic chutney and stuffed with comforting spiced potato palya.	South Indian	{Vegetarian,Gluten-Free}	{breakfast,dinner}	10	20	4	Medium	310	7	52	9	4	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80	120	f	Replace potato palya with raw banana (kacha kela) palya cooked with mustard and turmeric.	4.8	120	2026-11-16 06:15:04.353
recipe-rajma-chawal	Dhaba Style Kashmiri Rajma Chawal	punjabi-rajma-chawal	Slow-simmered red kidney beans in an aromatic ginger-garlic and tomato masala served over steaming cumin-scented basmati rice.	Punjabi	{"Pure Vegetarian",Vegetarian,High-Protein,Gluten-Free}	{lunch,dinner}	20	35	4	Medium	420	18	68	8	12	https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80	160	f	\N	4.8	120	2026-11-16 06:15:04.366
recipe-palak-paneer	Creamy Homestyle Palak Paneer	homestyle-palak-paneer	Blanched fresh green spinach puree infused with garlic, cumin, and mild spices, gently folded with soft paneer cubes.	North Indian	{"Pure Vegetarian",Vegetarian,High-Protein,Gluten-Free}	{lunch,dinner}	15	20	4	Easy	320	15	10	24	5	https://images.unsplash.com/photo-1589647363585-745280b57b8f?auto=format&fit=crop&w=800&q=80	210	f	\N	4.8	120	2026-11-16 06:15:04.378
recipe-kanda-poha	Mumbai Style Batata Kanda Poha	batata-kanda-poha	Fluffy flattened rice tossed with crunchy peanuts, diced potatoes, caramelized onions, mustard seeds, and fresh lime.	Maharashtrian	{"Pure Vegetarian",Vegetarian,Kid-Friendly}	{breakfast,snack}	10	15	4	Easy	240	5	42	6	3	https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=800&q=80	70	f	\N	4.8	120	2026-11-16 06:15:04.389
recipe-moong-dal-khichdi	Sattvic Moong Dal Khichdi with Desi Ghee	moong-dal-khichdi	The ultimate comforting, gut-healing Indian one-pot meal made with yellow moong dal, basmati rice, turmeric, and aromatic cumin ghee tadka.	Gujarati	{"Pure Vegetarian",Vegetarian,"Jain Friendly",Diabetic-Friendly,Kid-Friendly}	{lunch,dinner}	10	15	4	Easy	260	10	45	6	5	https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80	90	t	\N	4.8	120	2026-11-16 06:15:04.398
recipe-egg-curry	Dhaba Style Masala Egg Curry	dhaba-style-egg-curry	Golden shallow-fried boiled eggs enveloped in a spiced onion, tomato, and garam masala gravy.	North Indian	{Eggetarian,High-Protein,Gluten-Free}	{lunch,dinner}	15	20	4	Easy	280	14	12	18	3	https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80	130	f	\N	4.8	120	2026-11-16 06:15:04.408
recipe-khaman-dhokla	Surati Nylon Khaman Dhokla	surati-khaman-dhokla	Feather-light, spongy savory steamed cakes made from gram flour, drizzled with sweet-tangy mustard and green chilli tempering.	Gujarati	{"Pure Vegetarian",Vegetarian,"Jain Friendly",Kid-Friendly}	{breakfast,snack}	10	20	4	Easy	160	6	24	4	3	https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80	65	t	\N	4.8	120	2026-11-16 06:15:04.419
recipe-amritsari-chole	Authentic Amritsari Pindi Chole	amritsari-chole	Dark, tangy and robust Punjabi chickpeas slow-simmered with pomegranate seeds, amchoor, and aromatic whole spices.	Punjabi	{"Pure Vegetarian",Vegetarian,High-Protein,Gluten-Free}	{lunch,dinner}	15	30	4	Medium	320	16	48	8	11	https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80	110	f	\N	4.8	120	2026-11-16 06:15:04.43
recipe-dal-tadka	Dhaba Style Yellow Dal Tadka	dal-tadka	Creamy slow-simmered yellow toor and moong lentils finished with a double sizzling tadka of cow ghee, cumin, and garlic.	North Indian	{"Pure Vegetarian",Vegetarian,High-Protein,Gluten-Free}	{lunch,dinner}	10	20	4	Easy	210	11	32	6	7	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	85	f	\N	4.8	120	2026-11-16 06:15:04.443
recipe-aloo-gobi	Homestyle Adraki Aloo Gobi	adraki-aloo-gobi	Tender cauliflower florets and golden potatoes sautéed with loads of freshly julienned ginger, turmeric, and roasted cumin.	North Indian	{"Pure Vegetarian",Vegetarian,Vegan,Gluten-Free}	{lunch,dinner}	15	20	4	Easy	195	5	28	7	6	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80	75	f	\N	4.8	120	2026-11-16 06:15:04.452
recipe-rava-upma	Spiced Vegetable Rava Upma	rava-upma	Classic South Indian roasted semolina breakfast tempered with mustard, crunchy roasted peanuts, ginger, and curry leaves.	South Indian	{"Pure Vegetarian",Vegetarian,Kid-Friendly}	{breakfast,snack}	10	12	4	Easy	230	6	38	7	4	https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80	60	f	\N	4.8	120	2026-11-16 06:15:04.472
recipe-bhindi-masala	Chatpati Homestyle Bhindi Masala	bhindi-masala	Crisp-tender okra tossed in tangy amchoor, roasted coriander powder, cumin, and sliced green chillies.	North Indian	{"Pure Vegetarian",Vegetarian,Vegan,Gluten-Free,"Jain Friendly"}	{lunch,dinner}	15	15	4	Easy	165	4	16	9	5	https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80	70	t	\N	4.8	120	2026-11-16 06:15:04.481
recipe-sambhar-rice	Chennai Sambar Sadam (One-Pot Sambar Rice)	sambar-sadam	Hearty Tamil Nadu style one-pot rice and toor dal simmered with country vegetables, tangy tamarind, and fragrant ghee tadka.	South Indian	{"Pure Vegetarian",Vegetarian,Gluten-Free}	{lunch,dinner}	10	20	4	Easy	290	9	52	6	6	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	95	f	\N	4.8	120	2026-11-16 06:15:04.49
recipe-baingan-bharta	Dhaba Style Smoked Baingan Bharta	baingan-bharta	Charcoal-roasted large eggplant mashed and braised with browned onions, ripe tomatoes, fresh green chillies, and ginger.	Punjabi	{"Pure Vegetarian",Vegetarian,Vegan,Gluten-Free}	{lunch,dinner}	15	20	4	Medium	180	4	18	9	7	https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80	80	f	\N	4.8	120	2026-11-16 06:15:04.498
recipe-punjabi-chicken-curry	Dhaba Style Tariwala Chicken Curry	tariwala-chicken-curry	Rustic homestyle Punjabi chicken curry simmered in a golden onion-tomato gravy with bone-in chicken cuts, garlic, and freshly crushed spices.	Punjabi	{Non-Vegetarian,High-Protein,Gluten-Free}	{lunch,dinner}	15	30	4	Medium	340	28	10	16	3	https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80	280	f	\N	4.8	120	2026-11-16 06:15:04.508
recipe-bengali-macher-jhol	Authentic Bengali Macher Jhol	bengali-macher-jhol	Light and comforting Kolkata style fish curry made with fresh fish steaks, potato wedges, kalonji, turmeric, and green chillies in mustard oil.	Bengali	{Non-Vegetarian,High-Protein,Gluten-Free}	{lunch,dinner}	15	20	4	Medium	280	24	16	12	2	https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80	260	f	\N	4.8	120	2026-11-16 06:15:04.517
recipe-bengali-cholar-dal	Traditional Bengali Narkel Cholar Dal	bengali-cholar-dal	Festive festive Bengal chana dal slow-simmered with ginger, cumin, bay leaf, and crisp fried coconut chips. Naturally plant-based and Jain permissible.	Bengali	{"Pure Vegetarian",Vegetarian,Vegan,"Jain Friendly",High-Protein}	{lunch,dinner}	15	25	4	Easy	230	12	36	6	8	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	105	t	\N	4.8	120	2026-11-16 06:15:04.526
recipe-jain-paneer-bhurji	Sattvic Jain Malai Paneer Bhurji	jain-paneer-bhurji	Scrambled fresh paneer tossed with ripe country tomatoes, fresh green chillies, crushed kasuri methi, and fragrant cumin ghee tadka. 100% root-vegetable free.	North Indian	{"Pure Vegetarian",Vegetarian,"Jain Friendly",High-Protein,Gluten-Free}	{lunch,dinner}	10	12	4	Easy	280	16	8	20	2	https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80	160	t	\N	4.8	120	2026-11-16 06:15:04.535
recipe-jain-moong-dal-tadka	Sattvic Homestyle Moong Dal Tadka	jain-moong-dal-tadka	Golden yellow moong dal simmered with turmeric and tempered with sizzling cow ghee, cumin seeds, fresh curry leaves, and green chillies.	North Indian	{"Pure Vegetarian",Vegetarian,"Jain Friendly",High-Protein,Gluten-Free}	{lunch,dinner}	10	20	4	Easy	210	11	30	5	6	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	85	t	\N	4.8	120	2026-11-16 06:15:04.543
recipe-sev-tameta-nu-shaak	Kathiyawadi Sev Tameta nu Shaak	kathiyawadi-sev-tameta-nu-shaak	Iconic sweet, tangy, and spicy tomato curry tempered with mustard and cumin, topped with crisp Ratlami nylon sev right before serving.	Kathiyawadi	{"Pure Vegetarian",Vegetarian,"Jain Friendly"}	{lunch,dinner}	10	15	4	Easy	245	7.2	28.5	11.8	3.2	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	90	t	\N	4.8	120	2026-11-16 06:15:04.552
recipe-ringna-no-olo	Kathiyawadi Ringna no Olo (Baingan Bharta)	kathiyawadi-ringna-no-olo	Rustic Kathiyawadi roasted eggplant mash infused with green garlic, chillies, and mustard oil, served with hot Bajra no Rotlo.	Kathiyawadi	{"Pure Vegetarian",Vegetarian,Vegan,Gluten-Free}	{lunch,dinner}	15	25	4	Medium	165	3.8	18.2	8.5	6.2	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	95	f	Jain variation substitutes roasted green plantain or bottle gourd mash without garlic or onions.	4.8	120	2026-11-16 06:15:04.561
recipe-bajra-no-rotlo	Traditional Kathiyawadi Bajra no Rotlo	traditional-kathiyawadi-bajra-no-rotlo	Thick, wholesome gluten-free flatbread hand-patted from pearl millet flour and roasted on a clay tava, slathered with pure desi ghee.	Kathiyawadi	{"Pure Vegetarian",Vegetarian,Gluten-Free,"Jain Friendly"}	{lunch,dinner}	10	15	4	Medium	195	5.8	34.2	4.1	6	https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80	60	t	\N	4.8	120	2026-11-16 06:15:04.57
recipe-paneer-butter-masala	Restaurant Style Paneer Butter Masala	paneer-butter-masala	Tender cottage cheese cubes simmered in a velvety, rich tomato, cashew, and butter gravy perfumed with kasuri methi.	North Indian	{"Pure Vegetarian",Vegetarian,High-Protein}	{lunch,dinner}	15	25	4	Medium	380	16	14	28	4	https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80	280	f	Replace onion and garlic paste with pure tomato-ginger puree and a pinch of asafoetida (hing).	4.8	120	2026-11-16 06:15:04.273
recipe-idli-sambar	Steamed Idli with Drumstick Vegetable Sambar	idli-sambar	Pillowy soft fermented steamed rice cakes served with aromatic Madras lentil sambar and fresh coconut chutney.	South Indian	{"Pure Vegetarian",Vegetarian,Vegan,Gluten-Free,"Jain Friendly"}	{breakfast}	10	15	4	Easy	220	8	42	3	5	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80	90	t	\N	4.8	120	2026-11-16 06:15:04.462
recipe-bajra-no-rotlo-vegan	Kathiyawadi Bajra no Rotlo (Vegan / Til Oil)	kathiyawadi-bajra-no-rotlo-vegan	Authentic rustic Gujarati pearl millet flatbread hand-patted and roasted over fire, brushed with cold-pressed sesame oil (til tel) for a 100% plant-based, gluten-free traditional meal.	Kathiyawadi	{"Pure Vegetarian",Vegetarian,Vegan,Gluten-Free,"Jain Friendly"}	{lunch,dinner}	10	15	4	Medium	190	5.8	34.2	4	6	https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80	55	t	\N	4.8	120	2026-11-16 07:27:44.02
recipe-surati-undhiyu	Authentic Surati Undhiyu with Methi Muthiya	authentic-surati-undhiyu	Celebrated Gujarati winter specialty uniting tender Surti papdi, tuver lilva, purple yam, baby eggplants, and spiced fenugreek dumplings.	Gujarati	{"Pure Vegetarian",Vegetarian}	{lunch,dinner}	30	40	4	Advanced	385	11.2	48.6	16.5	10.5	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	180	f	Authentic Jain Undhiyu replaces purple yam and potatoes with firm raw green plantain (Kacha Kela) and extra Surti papdi.	4.8	120	2026-11-16 06:15:04.578
recipe-surati-undhiyu-jain	Authentic Jain Surati Undhiyu (Kacha Kela & Papdi)	authentic-jain-surati-undhiyu	Revered Jain Gujarati winter banquet preparation slow-cooked strictly without root vegetables, onions, or garlic, using fresh Surti papdi, tuver lilva, raw green plantain (kacha kela), and steamed methi muthiya.	Gujarati	{"Pure Vegetarian",Vegetarian,"Jain Friendly"}	{lunch,dinner}	30	35	4	Advanced	350	10.8	46.2	14.5	11	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	175	t	\N	4.8	120	2026-11-16 07:27:44.046
recipe-gujarati-dal-dhokli	Traditional Gujarati One-Pot Dal Dhokli	traditional-gujarati-dal-dhokli	Wholesome one-pot meal where thin spiced whole wheat pasta diamonds are simmered in a sweet, tangy, and aromatic toor dal curry.	Gujarati	{"Pure Vegetarian",Vegetarian,"Jain Friendly"}	{lunch,dinner}	20	25	4	Medium	320	12.5	52	6.8	7.8	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	110	t	\N	4.8	120	2026-11-16 06:15:04.588
recipe-gujarati-kadhi	Traditional Sweet & Sour Gujarati Kadhi	traditional-sweet-and-sour-gujarati-kadhi	Thin, soothing sweet-tangy soup made with churned yogurt and chickpea flour, tempered with cinnamon, cloves, mustard seeds, and curry leaves.	Gujarati	{"Pure Vegetarian",Vegetarian,Gluten-Free,"Jain Friendly"}	{lunch,dinner}	10	15	4	Easy	145	5.2	16.8	6.5	1.5	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	75	t	\N	4.8	120	2026-11-16 06:15:04.596
recipe-vaghireli-khichdi	Kathiyawadi Vaghireli Khichdi with Desi Ghee	kathiyawadi-vaghireli-khichdi	Comforting spicy tempered rice and split yellow moong dal infused with whole spices, tomatoes, curry leaves, and a generous dollop of ghee.	Kathiyawadi	{"Pure Vegetarian",Vegetarian,Gluten-Free,"Jain Friendly"}	{dinner}	10	20	4	Easy	285	9.8	46.5	6.8	5.2	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	80	t	\N	4.8	120	2026-11-16 06:15:04.605
recipe-gujarati-handvo	Gujarati Baked Vegetable Handvo (Savory Lentil Cake)	gujarati-baked-vegetable-handvo	Traditional Gujarati savory baked cake made with fermented rice and mixed lentils, bottle gourd, and a crunchy sesame-mustard seed crust.	Gujarati	{"Pure Vegetarian",Vegetarian,"Jain Friendly",Gluten-Free}	{breakfast,snack,dinner}	15	35	4	Medium	260	9.5	36.8	8.5	4.8	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	100	t	\N	4.8	120	2026-11-16 06:15:04.614
recipe-methi-na-gota	Crispy Gujarati Methi na Gota (Dakor Style)	crispy-gujarati-methi-na-gota	Pillowy soft inside and crisp outside fenugreek fritters spiced with crushed pepper, ajwain, and jaggery, famously served at Dakor temple.	Gujarati	{"Pure Vegetarian",Vegetarian,"Jain Friendly"}	{breakfast,snack}	15	15	4	Easy	230	7.8	26.2	10.5	4.2	https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80	70	t	\N	4.8	120	2026-11-16 06:15:04.624
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
cmwj33fo9001ll33ksqrhin9z	cmwj2fa4w0000l3s4x4q1jmst	0a88bbe62b2c90df8f962c27be5c70fcb4a051c46edad5d2ea8b7ccd4916a70b	fam_3cb50e83-6c00-48e2-8dc5-0bfbdd57ff44	Web Browser	node	2026-11-16 09:51:41.337	2026-11-16 09:51:41.337	2026-11-23 09:51:41.333	\N
cmwj39g35001pl3i4ovfyws6j	cmwj2fa4w0000l3s4x4q1jmst	129292068ce1b8f6f847aee1daa4627fae8a354f4935271aa282f1b922cc664b	fam_7b702b3b-b3a3-4316-b512-1b4ade491bbc	Web Browser	node	2026-11-16 09:56:21.809	2026-11-16 09:56:21.809	2026-11-23 09:56:21.806	\N
cmwj3f5l3001pl3g0uor6vqmv	cmwj2fa4w0000l3s4x4q1jmst	c3a5f2fe76c4c273af09ce5b1337d48a56035979a30d4f8afff28968a5308b1d	fam_665c3cb8-668f-4db9-92bf-2f19ac483253	Web Browser	node	2026-11-16 10:00:48.135	2026-11-16 10:00:48.135	2026-11-23 10:00:48.132	\N
\.


--
-- Data for Name: Retailer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Retailer" (id, name, slug, "logoUrl", "deliveryTimeEstimate", "deliveryFeeInr", "freeDeliveryThresholdInr", "minOrderValueInr", rating) FROM stdin;
ret-blinkit	Blinkit	blinkit	https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=200&q=80	10-15 mins	25	399	99	4.8
ret-zepto	Zepto	zepto	https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80	10 mins	29	499	99	4.9
ret-dmart	DMart Ready	dmart-ready	https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=200&q=80	Tomorrow Morning	49	1000	500	4.7
ret-bigbasket	BigBasket	bigbasket	https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80	Same Day (2-4 hrs)	35	600	200	4.6
\.


--
-- Data for Name: RetailerApplication; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RetailerApplication" (id, "userId", "businessName", "contactInformation", "applicationStatus", "submittedAt", "reviewedAt", "reviewedBy") FROM stdin;
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
cmwj39g4x001sl3i42mylbw53	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXdqMzlkOTkwMDA0bDNpNGRmYXRyNzJqIiwiaWQiOiJjbXdqMzlkOTkwMDA0bDNpNGRmYXRyNzJqIiwiZW1haWwiOiJwaWxvdC51c2VyLm13ajM5Y3N4QHRlc3RyYXNvaS5pbiIsImZ1bGxOYW1lIjoiVml2ZWsgSm9zaGkiLCJyb2xlIjoiQ1VTVE9NRVIiLCJob3VzZWhvbGRSb2xlIjoiTUVNQkVSIiwianRpIjoiMTc5NDgyMjk4MDMwNC03MTFiNDhjODIyMmRlM2I3NTgxNjQ1YzZhYTkwMjI5ZiIsImlhdCI6MTc5NDgyMjk4MCwiZXhwIjoxNzk0ODIzODgwLCJhdWQiOiJyYXNvaS1pcS1hcHAiLCJpc3MiOiJyYXNvaS1pcSJ9.qCy90WWTt-ZPkhRKQ7eUMqk7mu05Nh0mE1PbyzQnHhk	User logout	2026-11-16 09:56:21.87	2026-11-16 10:11:20
cmwj3a1zj001ul3i4br0kr67v	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImp0aSI6IjE3OTQ4MjMwMTAxNjcteHBwaXM3ZCIsImlhdCI6MTc5NDgyMzAxMCwiZXhwIjoxNzk1NDI3ODEwfQ.-qIS9ziBdzG47VDBIWCvA9U6Ov13pqgQWk63i1mj65g	User logout	2026-11-16 09:56:50.188	2026-11-23 09:56:50
cmwj3a2ku001wl3i4fb0vlmx3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwianRpIjoiMTc5NDgyMzAxMDk0Mi16azM2ejJlIiwiaWF0IjoxNzk0ODIzMDEwLCJleHAiOjE3OTU0Mjc4MTB9.3VZYc3rd0Fvwvr_xHe61rwYEieUMAUysMh87H8g7-nc	User logout	2026-11-16 09:56:50.955	2026-11-23 09:56:50
cmwj3evw80000l3g0k6q75lot	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwiZW1haWwiOiJkZW1vQHJhc29paXEuaW4iLCJmdWxsTmFtZSI6IlBvb2phIFNoYXJtYSIsInJvbGUiOiJDVVNUT01FUiIsImhvdXNlaG9sZElkIjoiaGgtc2hhcm1hLWZhbWlseSIsImp0aSI6IjE3OTQ4MjMyMzU1NDgtazUyM3dtaSIsImlhdCI6MTc5NDgyMzIzNSwiZXhwIjoxNzk1NDI4MDM1fQ.bJhRMFaLPG885ynu3RAXm_v6YfoO_nILlj-kYR-e-pc	User logout	2026-11-16 10:00:35.572	2026-11-23 10:00:35
cmwj3eww50002l3g0y97u7lk1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdGVtcC1yZXZva2UiLCJlbWFpbCI6ImRlbW9AcmFzb2lpcS5pbiIsImZ1bGxOYW1lIjoiUG9vamEgU2hhcm1hIiwicm9sZSI6IkNVU1RPTUVSIiwiaG91c2Vob2xkSWQiOiJoaC1zaGFybWEtZmFtaWx5IiwianRpIjoiMTc5NDgyMzIzNjgzMy0wMm1ma3AwIiwiaWF0IjoxNzk0ODIzMjM2LCJleHAiOjE3OTU0MjgwMzZ9.IzVQeTpdZW6nkedADK_iD40_KVjgKbC2R-u47uwZRzI	User logout	2026-11-16 10:00:36.864	2026-11-23 10:00:36
cmwj3f5ov001sl3g0dov0l84l	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXdqM2Yxam0wMDA0bDNnMGlsYnp6YW5hIiwiaWQiOiJjbXdqM2Yxam0wMDA0bDNnMGlsYnp6YW5hIiwiZW1haWwiOiJwaWxvdC51c2VyLm13ajNmMHlzQHRlc3RyYXNvaS5pbiIsImZ1bGxOYW1lIjoiVml2ZWsgSm9zaGkiLCJyb2xlIjoiQ1VTVE9NRVIiLCJob3VzZWhvbGRSb2xlIjoiTUVNQkVSIiwianRpIjoiMTc5NDgyMzI0NjEwMC02NzNjOTg1YjM5Y2EzYTllYjM5MjkwMzQwNDZiYmNiYiIsImlhdCI6MTc5NDgyMzI0NiwiZXhwIjoxNzk0ODI0MTQ2LCJhdWQiOiJyYXNvaS1pcS1hcHAiLCJpc3MiOiJyYXNvaS1pcSJ9.sl3vR6FSFv8GtlBH6pFALrlHDlgDoHCjCjdcOP8l4F4	User logout	2026-11-16 10:00:48.267	2026-11-16 10:15:46
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
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, "passwordHash", "fullName", "phoneNumber", role, "createdAt", "updatedAt", "emailVerifiedAt", "lastLoginAt", "normalizedEmail", status) FROM stdin;
user-demo-1	demo@rasoiiq.in	$2b$10$demo_hash_rasoi_iq_2026	Pooja Sharma	+91 98765 43210	CUSTOMER	2026-11-16 06:15:04.98	2026-11-16 07:27:44.381	\N	\N		ACTIVE
user-demo-patel	patel.family@rasoiiq.demo	$2b$10$demo_hash_rasoi_iq_2026	Rameshbhai Patel	+91 98250 11223	CUSTOMER	2026-11-16 06:15:05.055	2026-11-16 07:27:44.411	\N	\N		ACTIVE
user-demo-mehta	mehta.family@rasoiiq.demo	$2b$10$demo_hash_rasoi_iq_2026	Kirit Mehta	+91 98980 44556	CUSTOMER	2026-11-16 06:15:05.091	2026-11-16 07:27:44.426	\N	\N		ACTIVE
cmwj2fa4w0000l3s4x4q1jmst	admin@rasoiiq.in	$argon2id$v=19$m=65536,t=3,p=1$TfUYCY8ObBkFhXavknrTrA$M0D5ShbMC+KqI6phtRMy2I3B998moRxFpt8IgFf8Bqo	Platform Administrator	\N	ADMIN	2026-11-16 09:32:54.416	2026-11-16 10:00:48.146	2026-11-16 09:32:54.413	2026-11-16 10:00:48.143	admin@rasoiiq.in	ACTIVE
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
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


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

\unrestrict qw8SRf6O2P7Ep9lJAUBdOfbgFaiBeDBtfwlAjQ20w47SfJNzT90KsL7lPnG21gg

