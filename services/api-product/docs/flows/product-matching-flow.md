# Product Matching Flow

> กระบวนการจับคู่สินค้าที่นำเข้าจากไฟล์ Excel กับสินค้าในระบบ

## Overview Flowchart

```mermaid
flowchart TD
    subgraph Upload["📤 Upload Phase"]
        A[Excel File Uploaded] --> B[Create Import Batch]
        B --> C[Queue Matching Job]
    end

    subgraph Queue["🔄 Background Queue"]
        C --> D[Product Matching Consumer]
    end

    subgraph Processing["⚙️ Matching Phase"]
        D --> E[Cleanup Existing Items]
        E --> F[Process Matching]
        F --> G[Prepare Batch Requests]
        G --> H[Call External Matching API]
    end

    subgraph External["🌐 External Matching API"]
        H --> I{Match Type}
        I -->|Exact Match| J[matchBarcode]
        I -->|Similar Products| K[matchSuggestion]
        I -->|No Match| L[notMatch]
    end

    subgraph Verify["✅ Verification Phase"]
        J --> M[Collect SKU UUIDs]
        K --> M
        L --> M
        M --> N[Verify in Database]
        N --> O[Enrich Product Data]
    end

    subgraph Result["📊 Result Mapping"]
        O --> P{Map Status}
        P -->|Exact Match| Q[FOUND + matched variant]
        P -->|Similar| R[SIMILAR + suggestions]
        P -->|Not Found/Invalid| S[NOT_FOUND]
    end

    subgraph Complete["✅ Completion"]
        Q --> T[Update Batch Counts]
        R --> T
        S --> T
        T --> U[Return Result]
    end

    style A fill:#dbeafe,stroke:#3b82f6
    style H fill:#fce7f3,stroke:#ec4899
    style I fill:#fef9c3,stroke:#eab308
    style N fill:#e0e7ff,stroke:#6366f1
    style U fill:#dcfce7,stroke:#22c55e
```

## Detailed Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant API as Import API
    participant Queue as Bull Queue
    participant Consumer as ProductMatchingConsumer
    participant Adapter as ProductMatchingAdapter
    participant ExternalAPI as External Matching API
    participant DB as Database

    Client->>+API: Upload Excel File
    API->>API: Create Import Batch
    API->>+Queue: Add Job (batchUuid, merchantId, userId)
    Queue-->>-API: Job Queued
    API-->>-Client: 200 OK {batchUuid}

    Note over Queue,Consumer: Background Processing

    Queue->>+Consumer: Process Job
    Consumer->>Consumer: Cleanup Existing Items (if retry)

    Consumer->>+Adapter: matchProductsBatch(inputs[])

    Note over Adapter: Prepare Requests
    Adapter->>Adapter: Map to SuggestionRequest[]<br/>(barcode, name, brand)

    Adapter->>+ExternalAPI: POST /product/suggestions
    Note over ExternalAPI: Batch Processing<br/>Returns match results for all products

    ExternalAPI-->>-Adapter: Response[]<br/>(matchType, product/suggestions)

    Note over Adapter: Step 1: Collect SKU UUIDs
    loop Each Response
        Adapter->>Adapter: Extract skuUuids from matches
    end

    Note over Adapter: Step 2: Verify in Database
    Adapter->>+DB: Find ProductVariants by skuUuids<br/>with Product, Brand, Images
    DB-->>-Adapter: ProductVariant[]

    Note over Adapter: Step 3: Map to Internal Format
    loop Each Response
        alt matchBarcode (Exact Match)
            Adapter->>Adapter: Verify variant exists in DB
            alt Variant Found
                Adapter->>Adapter: Status = FOUND<br/>matchedProductVariantId = variant.id
            else Variant Not Found
                Adapter->>Adapter: Status = NOT_FOUND
            end
        else matchSuggestion (Similar)
            Adapter->>Adapter: Verify all suggestions in DB
            Adapter->>Adapter: Status = SIMILAR<br/>suggestedProducts = verified[]
        else notMatch (No Match)
            Adapter->>Adapter: Status = NOT_FOUND
        end
    end

    Adapter-->>-Consumer: BatchMatchResult[]

    Consumer->>+DB: Update ImportProductItems<br/>(matchStatus, matchedVariantId, suggestions)
    DB-->>-Consumer: Updated

    Consumer->>+DB: Update Batch Counts<br/>(matchedCount, similarCount, notFoundCount)
    DB-->>-Consumer: Updated

    Consumer-->>-Queue: Job Complete

    Note over Client: User can review results via API
```

## Match Type Decision Tree

```mermaid
flowchart TD
    Start[External API Processes Request] --> Check{Match Type?}

    Check -->|matchBarcode| A[Exact Barcode Match]
    Check -->|matchSuggestion| B[Similar Products Found]
    Check -->|notMatch| C[No Match Found]

    A --> A1{Verify in Database}
    A1 -->|Product Exists| A2[✅ FOUND<br/>matchedProductVariantId = variant.id<br/>suggestedProducts = single item]
    A1 -->|Product Not Found| A3[❌ NOT_FOUND<br/>External API outdated]

    B --> B1{Verify Suggestions}
    B1 -->|Some Valid| B2[⚠️ SIMILAR<br/>matchedProductVariantId = first.id<br/>suggestedProducts = verified list]
    B1 -->|None Valid| B3[❌ NOT_FOUND<br/>All suggestions invalid]

    C --> C1[❌ NOT_FOUND<br/>No matching products]

    style A2 fill:#dcfce7,stroke:#22c55e
    style B2 fill:#fef9c3,stroke:#eab308
    style A3 fill:#fee2e2,stroke:#ef4444
    style B3 fill:#fee2e2,stroke:#ef4444
    style C1 fill:#fee2e2,stroke:#ef4444
```

## Match Status States

```mermaid
stateDiagram-v2
    [*] --> PENDING: Import Item Created

    PENDING --> PROCESSING: Matching Job Started

    PROCESSING --> FOUND: Exact Barcode Match<br/>+ Verified in DB
    PROCESSING --> SIMILAR: Similar Products Found<br/>+ At least 1 verified
    PROCESSING --> NOT_FOUND: No Match or<br/>All Invalid

    FOUND --> CONFIRMED: User Confirms Match
    SIMILAR --> CONFIRMED: User Selects Product
    NOT_FOUND --> CONFIRMED: User Manually Links

    SIMILAR --> REJECTED: User Rejects All
    NOT_FOUND --> REJECTED: User Skips Item

    CONFIRMED --> [*]
    REJECTED --> [*]

    note right of FOUND
        matchedProductVariantId set
        suggestedProducts has 1 item
    end note

    note right of SIMILAR
        matchedProductVariantId = first suggestion
        suggestedProducts has multiple items
    end note

    note right of NOT_FOUND
        matchedProductVariantId = null
        suggestedProducts = null
    end note
```

## Adapter Service Flow

```mermaid
flowchart TD
    subgraph Input["📥 Input"]
        A[BatchMatchInput[]]
        A1[- rowNo<br/>- productName<br/>- brand<br/>- barcode]
    end

    subgraph Prepare["🔧 Prepare"]
        B[Map to SuggestionRequest[]]
        B1[- barcode<br/>- name<br/>- brand]
    end

    subgraph External["🌐 External API Call"]
        C[POST /product/suggestions]
        C1[Returns Response[] with<br/>matchType + products]
    end

    subgraph Collect["📦 Collect UUIDs"]
        D{Extract skuUuids}
        D1[From matchBarcode products]
        D2[From matchSuggestion suggestions]
        D3[Create Set of unique UUIDs]
    end

    subgraph Verify["✅ Database Verification"]
        E[Batch Query ProductVariants]
        E1[JOIN Product<br/>JOIN Brand<br/>JOIN Images]
        E2[WHERE skuUuid IN (...)]
        E3[AND status != Deleted]
    end

    subgraph Enrich["🎨 Enrich Data"]
        F[Create Map: skuUuid → VariantData]
        F1[- id: variant.id<br/>- productId<br/>- name<br/>- brand<br/>- barcode<br/>- imageUrl]
    end

    subgraph Map["🗺️ Map Results"]
        G[Loop Each Response]
        G1{matchType?}
        G2[matchBarcode]
        G3[matchSuggestion]
        G4[notMatch]

        G2 --> H1{Verified?}
        H1 -->|Yes| H2[FOUND + variant.id]
        H1 -->|No| H3[NOT_FOUND]

        G3 --> I1{Any Verified?}
        I1 -->|Yes| I2[SIMILAR + suggestions]
        I1 -->|No| I3[NOT_FOUND]

        G4 --> J1[NOT_FOUND]
    end

    subgraph Output["📤 Output"]
        K[BatchMatchResult[]]
        K1[- rowNo<br/>- matchStatus<br/>- matchedProductVariantId<br/>- suggestedProducts]
    end

    A --> B --> C --> D
    D --> D1 & D2 --> D3
    D3 --> E --> E1 & E2 & E3
    E --> F --> F1
    F --> G --> G1
    G1 --> G2 & G3 & G4
    H2 & H3 & I2 & I3 & J1 --> K

    style C fill:#fce7f3,stroke:#ec4899
    style E fill:#e0e7ff,stroke:#6366f1
    style F fill:#dbeafe,stroke:#3b82f6
    style K fill:#dcfce7,stroke:#22c55e
```

## Data Model

```mermaid
erDiagram
    IMPORT_PRODUCT_BATCH ||--o{ IMPORT_PRODUCT_ITEM : contains
    IMPORT_PRODUCT_ITEM }o--|| PRODUCT_VARIANT : "matched to"

    IMPORT_PRODUCT_BATCH {
        uuid id PK
        int merchant_id FK
        enum status "PENDING, MATCHING, READY, etc"
        int matched_count
        int similar_count
        int not_found_count
        datetime created_at
    }

    IMPORT_PRODUCT_ITEM {
        uuid id PK
        uuid batch_id FK
        int row_number
        string barcode
        string product_name
        string brand
        enum match_status "PENDING, FOUND, SIMILAR, NOT_FOUND"
        int matched_product_variant_id FK
        json suggested_products "Array of SuggestedProduct"
        datetime created_at
    }

    PRODUCT_VARIANT {
        int id PK
        uuid sku_uuid UK "From External API"
        int product_id FK
        string barcode
        string alias
        enum status
    }

    PRODUCT {
        int id PK
        string name
        int brand_id FK
    }

    BRAND {
        int id PK
        string name
    }

    PRODUCT_VARIANT ||--|| PRODUCT : belongs_to
    PRODUCT }o--|| BRAND : has
```

## Suggested Product Structure

```mermaid
classDiagram
    class SuggestedProduct {
        +number id
        +string name
        +string brand
        +string barcode
        +string imageUrl
        +number score
    }

    class ImportProductItem {
        +uuid id
        +int matchedProductVariantId
        +SuggestedProduct[] suggestedProducts
        +MatchStatus matchStatus
    }

    class MatchStatus {
        <<enumeration>>
        PENDING
        FOUND
        SIMILAR
        NOT_FOUND
    }

    ImportProductItem --> MatchStatus
    ImportProductItem "1" --> "*" SuggestedProduct : contains

    note for SuggestedProduct "Stored as JSONB array\nFor FOUND: single item\nFor SIMILAR: multiple items\nFor NOT_FOUND: null"
```

## Error Handling Flow

```mermaid
flowchart TD
    Start[Matching Job Start] --> Try{Try Process}

    Try -->|Success| Success[Update Batch Status]
    Try -->|Error| Retry{Retry Count?}

    Retry -->|< Max Retries| Queue[Re-queue Job]
    Retry -->|>= Max Retries| Failed[OnQueueFailed Handler]

    Queue --> Wait[Wait for Retry]
    Wait --> Cleanup[Cleanup Existing Items]
    Cleanup --> Start

    Failed --> UpdateStatus[Update Batch Status = CANCELLED]
    UpdateStatus --> LogError[Log Error Details]

    Success --> Complete[✅ Job Complete]
    LogError --> Complete[❌ Job Failed]

    style Success fill:#dcfce7,stroke:#22c55e
    style Failed fill:#fee2e2,stroke:#ef4444
    style Retry fill:#fef9c3,stroke:#eab308
```

## Component Architecture

```mermaid
graph TB
    subgraph Consumer["Consumer Layer"]
        PMC[ProductMatchingConsumer<br/>@Processor: product-matching-queue]
    end

    subgraph Service["Service Layer"]
        IPBS[ImportProductBatchService<br/>processMatching]
        PMA[ProductMatchingAdapterService<br/>matchProductsBatch]
        PMS[ProductMatchingService<br/>getSuggestions]
    end

    subgraph External["External Services"]
        API[External Matching API<br/>POST /product/suggestions]
    end

    subgraph Database["Database"]
        IPBR[ImportProductBatch<br/>Repository]
        IPIR[ImportProductItem<br/>Repository]
        PVR[ProductVariant<br/>Repository]
    end

    subgraph Queue["Message Queue"]
        BQ[Bull Queue<br/>product-matching-queue]
    end

    BQ -.->|consume| PMC
    PMC --> IPBS
    IPBS --> PMA
    PMA --> PMS
    PMS --> API

    PMA --> PVR
    IPBS --> IPIR
    PMC --> IPBR

    style PMC fill:#e0e7ff,stroke:#6366f1
    style API fill:#fce7f3,stroke:#ec4899
    style BQ fill:#fef3c7,stroke:#f59e0b
```

## Batch Processing Performance

```mermaid
flowchart LR
    subgraph Sequential["❌ Without Batch (Slow)"]
        S1[Item 1] --> S2[API Call 1]
        S2 --> S3[DB Query 1]
        S3 --> S4[Item 2]
        S4 --> S5[API Call 2]
        S5 --> S6[DB Query 2]
        S6 --> S7[...]
    end

    subgraph Batch["✅ With Batch (Fast)"]
        B1[Items 1-100]
        B2[Single API Call]
        B3[Single DB Query]
        B4[Map Results]

        B1 --> B2 --> B3 --> B4
    end

    style Sequential fill:#fee2e2,stroke:#ef4444
    style Batch fill:#dcfce7,stroke:#22c55e
```

---

## Key Features

### 1. Batch Processing

- Processes multiple products in a single API call
- Reduces network overhead
- Single database query for verification

### 2. UUID to ID Mapping

- External API uses UUID (skuUuid)
- Internal system uses integer ID (variant.id)
- Adapter service handles the mapping seamlessly

### 3. Database Verification

- Validates all external API results against local database
- Ensures products exist and are not deleted
- Enriches with relations (Product, Brand, Images)

### 4. Three-Tier Matching

1. **FOUND**: Exact barcode match + verified in DB
2. **SIMILAR**: Similar products found + at least one verified
3. **NOT_FOUND**: No match or all suggestions invalid

### 5. Error Resilience

- Automatic retry on failure
- Cleanup on retry to prevent duplicates
- Graceful degradation to CANCELLED status

## Usage Example

```typescript
// Input from Excel rows
const inputs: BatchMatchInput[] = [
  {
    rowNo: 1,
    productName: 'Coca Cola',
    brand: 'Coca Cola',
    barcode: '8850999320057',
  },
  {
    rowNo: 2,
    productName: 'Pepsi',
    brand: 'PepsiCo',
    barcode: '8850100823311',
  },
];

// Process matching
const results = await adapter.matchProductsBatch(inputs);

// Results
// [
//   { rowNo: 1, matchStatus: 'FOUND', matchedProductVariantId: 12345, suggestedProducts: [...] },
//   { rowNo: 2, matchStatus: 'SIMILAR', matchedProductVariantId: 67890, suggestedProducts: [...] }
// ]
```
