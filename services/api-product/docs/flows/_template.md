# [API Name] Flow

> [Brief description in Thai/English]

## Overview Flowchart

```mermaid
flowchart TD
    subgraph Client["🖥️ Client"]
        A[Request]
    end

    subgraph API["🔌 API Layer"]
        B[Controller]
        C[Service]
    end

    subgraph Database["💾 Database"]
        D[(Database)]
    end

    A --> B --> C --> D

    style A fill:#dbeafe,stroke:#3b82f6
    style D fill:#dcfce7,stroke:#22c55e
```

## Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant Controller
    participant Service
    participant Repository
    participant DB as Database

    Client->>+Controller: Request
    Controller->>+Service: process()
    Service->>+Repository: findOne()
    Repository->>+DB: SELECT
    DB-->>-Repository: result
    Repository-->>-Service: entity
    Service-->>-Controller: DTO
    Controller-->>-Client: Response
```

## Error Handling

```mermaid
flowchart TD
    subgraph Errors["❌ Error Types"]
        E1[Error Type 1]
        E2[Error Type 2]
    end

    subgraph Response["📤 HTTP Response"]
        R1[400 Bad Request]
        R2[404 Not Found]
        R3[500 Internal Server Error]
    end

    E1 --> R1
    E2 --> R2

    style E1 fill:#fee2e2,stroke:#ef4444
    style E2 fill:#fee2e2,stroke:#ef4444
```

## State Diagram (Optional)

```mermaid
stateDiagram-v2
    [*] --> Initial
    Initial --> Processing
    Processing --> Success
    Processing --> Failed
    Success --> [*]
    Failed --> [*]
```

## Entity Relationship (Optional)

```mermaid
erDiagram
    TABLE_A {
        int id PK
        string name
        datetime created_at
    }

    TABLE_B {
        int id PK
        int table_a_id FK
        string value
    }

    TABLE_A ||--o{ TABLE_B : has
```

## Component Architecture (Optional)

```mermaid
graph TB
    subgraph Controller["Controller Layer"]
        C[Controller]
    end

    subgraph Service["Service Layer"]
        S[Service]
    end

    subgraph Repository["Data Layer"]
        R[Repository]
    end

    C --> S --> R

    style C fill:#dbeafe,stroke:#3b82f6
    style S fill:#fef3c7,stroke:#f59e0b
    style R fill:#dcfce7,stroke:#22c55e
```

---

## Notes

- Add any additional notes or considerations here
- Document any edge cases or special handling

## Related Documentation

- [Link to related docs]
- [Link to API specification]
