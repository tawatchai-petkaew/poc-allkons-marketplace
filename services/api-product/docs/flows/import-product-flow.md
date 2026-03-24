# Import Product Flow

> กระบวนการนำเข้าสินค้าจากไฟล์ Excel เข้าสู่ระบบ

## Overview Flowchart

```mermaid
flowchart TD
    subgraph Client["🖥️ Client"]
        A[Upload Excel File]
    end

    subgraph API["🔌 API Gateway"]
        B[POST /v1/import-products/upload]
    end

    subgraph Validation["✅ Validation Layer"]
        C{Validate File}
        C1[Check File Exists]
        C2[Check .xlsx Extension]
        C3[Check File Not Empty]
        D{Validate Template Format}
        D1[Check Column Count]
        D2[Check Column Headers]
        E{Validate Data Exists}
    end

    subgraph Processing["⚙️ Processing Layer"]
        F[Load Workbook]
        G[Get Worksheet]
        H[Extract Column Keys]
        I[Process Rows]
        J[Calculate Results]
    end

    subgraph Storage["💾 Storage Layer"]
        K[Generate Result Excel]
        L[Upload Original to S3]
        M[Upload Result to S3]
        N[Create Batch Record in DB]
    end

    subgraph Response["📤 Response"]
        O[Return Response with Batch UUID]
    end

    A --> B
    B --> C
    C --> C1 & C2 & C3
    C1 & C2 & C3 --> D
    D --> D1 & D2
    D1 & D2 --> E
    E --> F
    F --> G --> H --> I --> J
    J --> K --> L --> M --> N --> O

    style A fill:#dbeafe,stroke:#3b82f6
    style O fill:#dcfce7,stroke:#22c55e
    style C fill:#fef9c3,stroke:#eab308
    style D fill:#fef9c3,stroke:#eab308
    style E fill:#fef9c3,stroke:#eab308
```

## Detailed Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant Controller as ImportProductController
    participant Service as ImportProductService
    participant ExcelParser as ExcelParserService
    participant RowProcessor as ProductExcelRowProcessor
    participant ResultCalc as ResultCalculator
    participant BatchService as ImportProductBatchService
    participant S3 as S3Service
    participant DB as Database

    Client->>+Controller: POST /upload (Excel file)
    Controller->>+Service: importAndValidateProductsExcel()

    Note over Service: File Validation
    Service->>Service: validateFile()
    alt File Invalid
        Service-->>Client: 400 Bad Request
    end

    Service->>Service: convertToBuffer()

    Note over Service,ExcelParser: Template Validation
    Service->>+ExcelParser: loadWorkbook(buffer)
    ExcelParser-->>-Service: workbook

    Service->>+ExcelParser: getWorksheet(workbook, 1)
    ExcelParser-->>-Service: worksheet

    Service->>+ExcelParser: validateTemplateFormat()
    alt Template Invalid
        ExcelParser-->>Client: 400 Invalid Template
    end
    ExcelParser-->>-Service: ✓ valid

    Service->>+ExcelParser: validateDataExists()
    ExcelParser-->>-Service: ✓ data exists

    Note over Service,RowProcessor: Data Processing
    Service->>+ExcelParser: getColumnKeys()
    ExcelParser-->>-Service: keys[]

    Service->>+RowProcessor: processRows(worksheet, keys)
    loop Each Row
        RowProcessor->>RowProcessor: validateRow()
        RowProcessor->>RowProcessor: transformData()
    end
    RowProcessor-->>-Service: DataSheet[]

    Service->>+ResultCalc: calculateResult(dataSheets)
    ResultCalc-->>-Service: {all, pass, fail}

    Note over Service,S3: Storage & Batch Creation
    Service->>Service: generateResultExcelBuffer()

    Service->>+BatchService: createBatchWithS3Upload()
    BatchService->>+S3: uploadOriginalFile()
    S3-->>-BatchService: originalFileUrl
    BatchService->>+S3: uploadResultFile()
    S3-->>-BatchService: resultFileUrl
    BatchService->>+DB: createBatchRecord()
    DB-->>-BatchService: batchRecord
    BatchService-->>-Service: batchInfo

    Service-->>-Controller: ExtractExcelResponseDto
    Controller-->>-Client: 200 OK {batchUuid, result}
```

## Error Handling Flow

```mermaid
flowchart TD
    subgraph Errors["❌ Error Types"]
        E1[TEMPLATE_FORMAT_ERROR]
        E2[INVALID_FILE_EXTENSION_ERROR]
        E3[EMPTY_FILE_ERROR]
        E4[WORKSHEET_NOT_FOUND_ERROR]
        E5[INVALID_FILE_FORMAT_ERROR]
    end

    subgraph Causes["📋 Causes"]
        C1[File is null/undefined]
        C2[File is not .xlsx]
        C3[File size is 0]
        C4[Worksheet index invalid]
        C5[Corrupted Excel file]
    end

    subgraph Response["📤 HTTP Response"]
        R1[400 Bad Request]
        R2[500 Internal Server Error]
    end

    C1 --> E1 --> R1
    C2 --> E2 --> R1
    C3 --> E3 --> R1
    C4 --> E4 --> R1
    C5 --> E5 --> R1

    style E1 fill:#fee2e2,stroke:#ef4444
    style E2 fill:#fee2e2,stroke:#ef4444
    style E3 fill:#fee2e2,stroke:#ef4444
    style E4 fill:#fee2e2,stroke:#ef4444
    style E5 fill:#fee2e2,stroke:#ef4444
```

## Row Processing State Diagram

```mermaid
stateDiagram-v2
    [*] --> ReadRow: Start Processing

    ReadRow --> ValidateColumns: Extract Data

    ValidateColumns --> CheckBarcode: Validate Required Fields

    CheckBarcode --> CheckProductName: Barcode Valid
    CheckBarcode --> MarkError: Barcode Invalid/Empty

    CheckProductName --> CheckPrice: Name Valid
    CheckProductName --> MarkError: Name Invalid

    CheckPrice --> CheckStock: Price Valid
    CheckPrice --> MarkError: Price Invalid

    CheckStock --> MarkPass: Stock Valid
    CheckStock --> MarkError: Stock Invalid

    MarkPass --> NextRow: Add to Pass List
    MarkError --> NextRow: Add to Fail List

    NextRow --> ReadRow: More Rows
    NextRow --> [*]: No More Rows
```

## Data Model Diagram

```mermaid
erDiagram
    IMPORT_PRODUCT_BATCH {
        uuid id PK
        int merchant_id FK
        int user_id FK
        string original_file_url
        string result_file_url
        int total_rows
        int pass_count
        int fail_count
        string status
        datetime created_at
    }

    IMPORT_PRODUCT_ITEM {
        uuid id PK
        uuid batch_id FK
        int row_number
        string barcode
        string product_name
        decimal price
        int stock
        boolean is_valid
        json errors
        datetime created_at
    }

    MERCHANT {
        int id PK
        string name
        string type
    }

    PRODUCT {
        int id PK
        string barcode
        string name
        decimal price
    }

    IMPORT_PRODUCT_BATCH ||--o{ IMPORT_PRODUCT_ITEM : contains
    MERCHANT ||--o{ IMPORT_PRODUCT_BATCH : creates
    IMPORT_PRODUCT_ITEM }o--|| PRODUCT : matches
```

## Component Architecture

```mermaid
graph TB
    subgraph Controller["Controller Layer"]
        IC[ImportProductController]
    end

    subgraph Service["Service Layer"]
        IS[ImportProductService]
        BS[ImportProductBatchService]
        MS[ProductMatchingAdapterService]
    end

    subgraph Helper["Helper Services"]
        EP[ExcelParserService]
        RP[ProductExcelRowProcessor]
        RC[ResultCalculatorService]
    end

    subgraph External["External Services"]
        S3[S3Service]
        KAFKA[Kafka Producer]
    end

    subgraph Consumer["Background Consumer"]
        PMC[ProductMatchingConsumer]
        PMS[ProductMatchingService]
    end

    IC --> IS
    IS --> EP
    IS --> RP
    IS --> RC
    IS --> BS
    BS --> S3
    BS --> KAFKA

    KAFKA -.->|async| PMC
    PMC --> PMS
    PMS --> MS

    style IC fill:#dbeafe,stroke:#3b82f6
    style IS fill:#fef3c7,stroke:#f59e0b
    style KAFKA fill:#fce7f3,stroke:#ec4899
    style PMC fill:#e0e7ff,stroke:#6366f1
```

---

## How to Generate Diagrams

### Option 1: View in VS Code

Install the "Markdown Preview Mermaid Support" extension in VS Code.

### Option 2: Generate PNG/SVG

```bash
# Generate single diagram
yarn docs:mermaid:generate docs/flows/import-product-flow.md

# Generate all diagrams
yarn docs:mermaid:all
```

### Option 3: View Online

Copy the Mermaid code to [Mermaid Live Editor](https://mermaid.live)
