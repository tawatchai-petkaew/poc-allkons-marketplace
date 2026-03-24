# Architecture & Patterns

## Module Organization

### Dual-Version Architecture

The codebase uses two parallel module structures:

**V1 Modules** (`src/modules/`)
- 100+ feature modules (legacy/current production)
- Organized by domain: merchant, product, order, customer, etc.
- Consolidated in `AppV1Module` (src/app-v1.module.ts)

**V2 Modules** (`src/modules-v2/`)
- Cleaner, refactored architecture
- Fewer, more focused modules
- Organized by business capability
- User authentication split into separate modules
- Consolidated in `AppV2Module` (src/app-v2.module.ts)

Both coexist in `AppModule` serving different API endpoints.

## Directory Structure

```
src/
├── app.module.ts           # Main module (V1 + V2)
├── app-v1.module.ts        # V1 aggregation
├── app-v2.module.ts        # V2 aggregation
├── main.ts                 # Bootstrap
├── guard/                  # Authentication guards
├── auth/                   # V1 authentication
├── config/                 # Database, Kafka config
├── model/                  # TypeORM entities (170+ files)
├── migration/              # Database migrations (320+ files)
├── modules/                # V1 modules (100+)
├── modules-v2/             # V2 refactored modules
├── utils/                  # Shared utilities
├── decorators/             # Custom decorators
├── interceptors/           # Response interceptors
├── mail/                   # Email templates
├── i18n/                   # Internationalization
├── scripts/                # Seeding scripts
└── data/                   # Static data files
```

## Core Architectural Patterns

### Authentication Flow

**ActJwtGuard** (`src/guard/act-jwt.guard.ts`)
- JWKS-based token verification with Keycloak
- Supports Cookie (`accessToken`) and Bearer tokens
- Redis caching (2min TTL) for verified tokens
- Platform detection from `app-id` header

**MerchantGuard** (`src/guard/merchant.guard.ts`)
- Validates user membership via user_merchants_merchant
- Redis caching (5min TTL) for merchant access
- Extracts merchant slug from route params or header

**UserOrgPermissionGuard**
- Organization access validation
- Permission checking with caching

### Multi-Tenancy

- Merchant middleware extracts context from requests
- Entities have merchant_id relationships
- Guards enforce tenant isolation

### Event-Driven Architecture

**Bull Queues (Redis):**
- message-queue
- organization-queue
- subdomain-queue
- invite-member-queue
- approve-member-queue
- user-queue

**Consumers:** `*.consumer.ts` files process jobs

**Kafka (AWS MSK):**
- Only in non-dev environments
- IAM authentication
- Consumer group configured via KAFKA_CONSUMER env

### API Documentation

- Full API with JWT auth: `/api/doc` (Swagger)
- Public API: `/api/open-api` (merchant/product/order endpoints)

## Common Module Pattern

V2 modules follow this structure:

```
modules-v2/feature-name/
├── dto/
│   ├── create-feature.dto.ts
│   └── update-feature.dto.ts
├── feature.controller.ts
├── feature.service.ts
├── feature.module.ts
├── feature.controller.spec.ts
└── feature.service.spec.ts
```

## External Integrations

- **Payment:** Omise, KSher Payment
- **Google Cloud:** BigQuery, Retail API
- **AWS:** S3 file uploads
- **Platforms:** Shopee, Lazada integration
- **Monitoring:** Sentry error tracking
