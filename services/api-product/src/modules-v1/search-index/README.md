# Search Index Module

Module for managing the search system using Elasticsearch.
Supports product search, autocomplete, and index management (Rebuild/Sync).

---

## Folder Structure

```
search-index/
├── cdc/                         # Change Data Capture services
│   ├── aggregator.service.ts    # Batches frequent changes (30s buffer)
│   ├── cdc-notification.service.ts # Slack notification
│   ├── cdc-worker.service.ts    # Poll changes_queue table
│   └── index.ts
├── core/                        # Shared services (used by all index types)
│   ├── cache.service.ts         # Multi-level cache (L1 Memory, L2 Redis)
│   ├── elasticsearch-client.service.ts
│   ├── queue-producer.service.ts # BullMQ producer
│   ├── synonym-cache.service.ts # Synonym cache (hourly refresh)
│   └── index.ts
├── constants/                   # Constants and config values
├── dto/                         # Shared DTOs
│   ├── rebuild-index.dto.ts
│   └── index.ts                 # Re-exports from merchant-product
├── entities/                    # TypeORM entities
├── indices/                     # Index-specific implementations
│   ├── merchant-product/        # Products currently being sold
│   │   ├── data-fetcher.service.ts
│   │   ├── elasticsearch.service.ts
│   │   ├── search-index.processor.ts
│   │   ├── search-model-builder.service.ts
│   │   ├── search-document.dto.ts
│   │   ├── search-product-request.dto.ts
│   │   ├── search-product-response.dto.ts
│   │   └── index.ts
│   └── product/                 # Reserved: All products (future)
├── interfaces/                  # TypeScript interfaces
├── search-index.controller.ts   # Admin/Management endpoints
├── search.controller.ts         # Public search endpoints
└── search-index.module.ts       # Module definition
```

---

## API Endpoints

### 1. Public Search API (`/search`)

| Method | Endpoint                  | Description              | Params                                  |
| ------ | ------------------------- | ------------------------ | --------------------------------------- |
| GET    | `/search/autocomplete`    | Autocomplete suggestions | `q` (required), `merchantId` (optional) |
| POST   | `/search/products/search` | Full product search      | Body: `SearchProductRequestDto`         |

#### Autocomplete Response:

```json
{
  "name": "iPhone 15 Pro Black",
  "productName": "iPhone 15 Pro",
  "productVariantName": "iPhone 15 Pro Black",
  "categoryId": 11,
  "categoryName": "Smartphones",
  "categoryPath": "Electronics > Phones > Smartphones"
}
```

#### Search Request:

```json
{
  "searchText": "iphone",
  "merchantId": 123,
  "page": 1,
  "pageLimit": 20,
  "sortByField": "minPrice",
  "sortOrder": "asc",
  "termFilters": [{ "fieldName": "brandName", "filterValues": ["Apple"] }],
  "aggregations": ["brandName", "categoryName"]
}
```

---

### 2. Management API (`/search-index`)

| Method | Endpoint                          | Description                           |
| ------ | --------------------------------- | ------------------------------------- |
| GET    | `/search-index/status`            | System status (ES, Queue, CDC, Cache) |
| POST   | `/search-index/rebuild`           | Rebuild entire index (Blue-Green)     |
| GET    | `/search-index/rebuild/status`    | Rebuild status                        |
| POST   | `/search-index/sync`              | Sync specific IDs                     |
| POST   | `/search-index/cdc/force-process` | Force CDC process immediately         |
| POST   | `/search-index/synonyms/refresh`  | Refresh synonym cache                 |
| POST   | `/search-index/cache/clear`       | Clear all cache                       |
| POST   | `/search-index/queue/pause`       | Pause queue temporarily               |
| POST   | `/search-index/queue/resume`      | Resume queue                          |
| GET    | `/search-index/health`            | Health check                          |

---

## Index Fields (Elasticsearch Mapping)

| Field                  | Type      | Description                                  |
| ---------------------- | --------- | -------------------------------------------- |
| `id`                   | integer   | Product Variant ID                           |
| `productId`            | integer   | Product ID                                   |
| `name`                 | text      | Display name (uses alias if available)       |
| `productName`          | text      | Original product name (product.name)         |
| `productVariantName`   | text      | Variant name (product_variant.alias)         |
| `slug`                 | keyword   | URL slug                                     |
| `sku`                  | keyword   | SKU code                                     |
| `barcode`              | keyword   | Barcode                                      |
| `productStatus`        | keyword   | Product status                               |
| `variantStatus`        | keyword   | Variant status                               |
| `minPrice`             | float     | Minimum price (from merchant_product)        |
| `maxPrice`             | float     | Maximum price                                |
| `categoryId`           | integer   | Category ID                                  |
| `categoryName`         | keyword   | Category name                                |
| `categoryPath`         | text      | Category path (e.g., "Electronics > Phones") |
| `brandId`              | integer   | Brand ID                                     |
| `brandName`            | keyword   | Brand name                                   |
| `boostScore`           | float     | Search ranking boost score                   |
| `sellingMerchantCount` | integer   | Number of merchants selling this product     |
| `merchantIds`          | integer[] | Array of merchant IDs                        |
| `createdAt`            | date      | Created timestamp                            |
| `updatedAt`            | date      | Updated timestamp                            |
| `isActive`             | boolean   | true if product & variant are Active         |

---

## Architecture Highlights

### 1. Data Fetching (Single Query)

```
FIX: N+1 Problem
- OLD: 10-15 queries per product variant
- NEW: Single optimized JOIN query
```

### 2. Blue-Green Deployment

```
Rebuild Flow:
1. Create new index: products_1707123456
2. Index all documents to new index
3. Atomic alias switch: products -> products_1707123456
4. Delete old index
5. Zero downtime!
```

### 3. CDC (Change Data Capture)

```
Database Trigger -> changes_queue table
                       |
CdcWorkerService (polls every 10s)
                       |
AggregatorService (30s buffer, deduplicate)
                       |
BullMQ Job -> SearchIndexProcessor
                       |
Elasticsearch (bulk index)
```

### 4. Boost Score Calculation

```typescript
score = 1.0
  + min(sellingMerchantCount / 10, 2.0)  // Popularity boost
  + 0.5                                    // Has product
  + (brandId ? 0.3 : 0)                   // Has brand
  + (recency boost if updated < 30 days)
```

---

## Search Features

- **Multi-field search**: name, brandName, sku, barcode
- **Fuzzy matching**: Typo-tolerant search
- **Thai tokenizer**: Thai language support
- **N-gram autocomplete**: Partial word matching
- **Merchant filter**: Filter products by merchant
- **Faceted search**: Aggregations for filters
- **Boost ranking**: function_score with boostScore

---

## Environment Variables

| Variable                           | Default                 | Description           |
| ---------------------------------- | ----------------------- | --------------------- |
| `ELASTICSEARCH_URI`                | `http://localhost:9200` | ES endpoint           |
| `ELASTICSEARCH_API_KEY`            | -                       | ES API key            |
| `ELASTICSEARCH_INDEX_PREFIX`       | `products`              | Index/Alias name      |
| `SEARCH_INDEX_ES_BULK_SIZE`        | `500`                   | Bulk batch size       |
| `SEARCH_INDEX_ES_PARALLEL_WORKERS` | `3`                     | Parallel workers      |
| `REDIS_HOST`                       | `localhost`             | Redis host for BullMQ |
| `REDIS_PORT`                       | `6379`                  | Redis port            |

---

## Notes

- **Index Condition**: Only product variants with active merchants (INNER JOIN merchant_product WHERE status='Active' AND merchantProductStatus='Selling')
- **Price Calculation**: minPrice/maxPrice calculated from merchant_product including special price
- **isActive**: Dynamic based on `productStatus === 'Active' && variantStatus === 'Active'`
