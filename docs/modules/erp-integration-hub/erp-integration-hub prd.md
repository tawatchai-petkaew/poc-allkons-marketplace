# Product Requirements Document (PRD)
**Author/Owner**: Product Owner (PO)
**Module**: ERP Integration Hub & Canonical API Gateway
**Date**: 2026-03-17
**Status**: ⚪ Draft
**Priority**: P1 (High)
**Target Release**: TBD

## Change Log
| Version | Date | Changes | Updated By | Status |
|---------|------|---------|------------|--------|
| v1.0 | 2026-03-17 | Initial version | PO | ⚪ Draft |

> **💡 When updating:** Change Status to 🟢 Final / Approved ONLY AFTER explicit PO approval.

---

## 1. Executive Summary

The ERP Integration Hub is a vendor-agnostic, self-service connectivity layer that allows Sellers to link their existing ERP systems (SAP, Microsoft Dynamics, Oracle, and others) to Allkons M through a standardized Canonical API Gateway — eliminating the need for bespoke, point-to-point integration code written by the platform engineering team. By standardizing inbound and outbound data flows, the Hub protects the core Allkons M database from high-volume ERP data dumps and frees the engineering team to focus on core platform capabilities.

---

## 2. Business Context

- **Problem Statement**: Every Seller with an existing ERP requires a custom integration built by the Allkons M engineering team. This creates an ever-growing backlog of bespoke connector code, drains engineering capacity away from core feature development, and produces a fragile, hard-to-maintain codebase where a change to one Seller's ERP version can break their integration entirely.

- **Current State**: There is no standardized integration layer. Each ERP-connected Seller requires a dedicated engineering engagement. Sellers have no self-service option to manage, monitor, or debug their integration. Failed syncs are invisible to Sellers and must be investigated reactively by the engineering team.

- **Business Goal**: Eliminate platform engineering involvement in Seller ERP onboarding. Enable Sellers and their IT teams to self-service connect, configure, and monitor their own ERP connection within a single working day.

- **Business Value**:
  - **Cost reduction**: Remove recurring custom-integration engineering cost per Seller.
  - **Scalability**: Support an unlimited number of ERP-connected Sellers without linear increases in engineering overhead.
  - **Platform stability**: Asynchronous queue processing prevents bulk ERP data dumps from degrading database performance for all Sellers.
  - **Seller autonomy**: Sellers gain real-time visibility and control over their own data pipeline, reducing support ticket volume.

---

## 3. Goals & Success Metrics

### Business Goals
- Reduce average engineering time required to onboard a new ERP-connected Seller from days to **0 hours** of custom integration work.
- Achieve self-service ERP connection setup by a Seller IT team in **< 1 business day** without platform engineering assistance.
- Reduce ERP-related support tickets by **≥ 50%** within 3 months of launch, as Sellers use Sync Logs to self-diagnose issues.

### User Goals
- Sellers (Shop Managers / IT teams) can generate API credentials, configure webhooks, and view sync history entirely within the Seller Dashboard — without contacting Allkons M support.
- ERP systems and 3rd-party integrators can push or pull Quotations, Orders, Customers, and Pricing data to/from Allkons M using a single, stable, documented REST API.
- IT teams can inspect the exact JSON validation error for any failed API request directly in the UI, without needing to ask engineering for server logs.

### Key Performance Indicators (KPIs)
| KPI | Target | Measurement Method |
|-----|--------|--------------------|
| Seller ERP onboarding time (self-service) | < 1 business day | Time from API key generation to first successful API call, logged in Sync Logs |
| Engineering hours per new ERP-connected Seller | 0 hours of custom code | Tracked via engineering sprint records post-launch |
| Sync Log `400 Bad Request` self-resolution rate | ≥ 60% resolved without a support ticket | Support ticket tagging vs. Sync Log `400` event volume |
| Inbound API p95 response time (GET) | < 500ms | APM monitoring |
| Kafka queue processing lag | < 5 minutes under normal load | Kafka consumer group lag metrics |
| Webhook delivery success rate | ≥ 98% within 60 seconds of event | Webhook delivery log tracking |

---

## 4. User Personas

| Persona | Role | Description | Key Needs |
|---------|------|-------------|-----------|
| **Seller IT Admin** | Shop's internal IT team or 3rd-party systems integrator | Technically proficient. Responsible for connecting the Seller's ERP to Allkons M. May work without ongoing support from Allkons M engineering. | Generate API keys, understand the canonical API schema, map their ERP fields to our standard, configure webhook URLs, monitor sync success/failure in real time. |
| **Shop Manager** | Seller-side business owner / operations lead | Non-technical. Needs high-level visibility that the integration is working correctly. | View a health summary of the integration; understand when syncs fail without reading raw JSON. |
| **Allkons M Admin** | Internal platform administrator | Responsible for platform health and Seller onboarding oversight. | View integration activity across all Sellers; identify Sellers with persistent sync failures; disable compromised API keys. |
| **ERP System / Bot** | Automated ERP system or middleware (machine-to-machine) | Not a human. Authenticates with an API Key and calls Allkons M REST endpoints. | Receive a `202 Accepted` for bulk writes; receive predictable JSON error responses for `400 Bad Request` with actionable field-level detail. |

---

## 5. Scope

### 5.1 In Scope
- **Integration Hub UI**: A dedicated tab in the Seller Dashboard with three sections:
  - **API Credentials (Inbound)**: Generate, view (once), and revoke API Keys.
  - **Webhooks (Outbound)**: Configure destination URLs and subscribe to platform events.
  - **Sync Logs**: A 7-day history of all inbound API calls and outbound webhook deliveries.
- **API Key Authentication**: Secure key generation; key shown to Seller exactly once; only the hashed value stored in the database; Redis-backed hash validation for high-throughput requests.
- **Inbound Canonical REST API** supporting four entities:
  - `Quotations` (GET, POST, PUT)
  - `Orders` (GET, POST, PUT)
  - `Customers` (GET, POST, PUT)
  - `Pricing Matrix` (GET, POST, PUT)
- **Asynchronous processing via Apache Kafka**: Bulk inbound POST/PUT requests return `202 Accepted` and are queued; background workers process the queue at a rate safe for the database.
- **Outbound Webhooks**: Sellers subscribe to platform events (`order.paid`, `quotation.created`, `customer.registered`) and receive POST payloads at their configured URL when events occur.
- **Sync Logs UI**: Table with 7-day log history showing timestamp, HTTP method, endpoint, HTTP status code, and — for `400 Bad Request` entries — a modal with the full JSON validation error body.
- **Allkons M Admin visibility**: Admins can view Integration Hub activity and revoke Seller API keys.

### 5.2 Out of Scope
- **Custom ERP field mapping / transformation code**: Allkons M will NOT write vendor-specific adapters (e.g., SAP iDoc mapping, Dynamics OData translation). Sellers are responsible for mapping their ERP data to the Allkons M canonical JSON schema.
- **Inventory entity** (Phase 1): The Inventory sync endpoint will be visible in the UI but disabled/greyed out and non-functional in Phase 1.
- **Keycloak / OAuth 2.0 M2M for API auth**: The standard Keycloak authentication flow is bypassed for machine-to-machine API authentication in Phase 1. A hashed API Key model is used instead.
- **ERP vendor certification program or partner portal**: No formal vendor certification or marketplace listing of certified ERP connectors.
- **Real-time streaming / persistent WebSocket connections**: All inbound integrations use standard REST (HTTP). Outbound uses webhook POST callbacks, not persistent connections.
- **Retry logic on the ERP side**: The platform delivers webhooks on a best-effort basis with one retry on failure. Advanced retry orchestration is the ERP system's responsibility.
- **Sync Logs beyond 7 days**: Long-term log archival and export are out of scope for Phase 1.

---

## 6. Key Product Requirements

### 6.1 Self-Service Integration Hub UI
**As a** Seller IT Admin, **I want to** access an Integration Hub section in my Seller Dashboard, **so that** I can manage my ERP connection independently without contacting Allkons M support.

**High-Level Acceptance Criteria:**
- [ ] A dedicated "Integration Hub" tab or section is visible in the Seller Dashboard navigation for all Sellers with ERP integration enabled.
- [ ] The Hub contains exactly three sub-sections: **API Credentials**, **Webhooks**, and **Sync Logs**, all accessible from a single page without full page reloads.
- [ ] The UI is accessible only to Seller accounts with the appropriate permission level (Shop Manager or IT Admin role); unauthorized access returns a permission-denied state, not an error page.

---

### 6.2 API Key Generation & Management (Inbound Authentication)
**As a** Seller IT Admin, **I want to** generate a secure API Key for my ERP system, **so that** my ERP can authenticate with Allkons M's API without using user login credentials.

**High-Level Acceptance Criteria:**
- [ ] The Seller can generate one active API Key per integration connection from the API Credentials section.
- [ ] Upon generation, the full API Key (plaintext) is displayed to the Seller **exactly once**, with a clear warning that it cannot be retrieved again after the modal is closed.
- [ ] Only the hashed value of the API Key is stored in the Allkons M database; the plaintext value is never persisted server-side.
- [ ] The Seller can revoke the current API Key at any time. Revocation takes effect immediately; subsequent API calls using the revoked key receive a `401 Unauthorized` response.
- [ ] Key validation on inbound API requests uses Redis caching to avoid a database lookup on every request, ensuring high-throughput scenarios remain performant.
- [ ] If the Seller generates a new key, the previous key is automatically revoked.

---

### 6.3 Inbound Canonical REST API
**As an** ERP System (machine), **I want to** push and pull Quotation, Order, Customer, and Pricing Matrix data using a single, stable REST API, **so that** my ERP stays synchronized with the Allkons M platform without requiring custom connector code per entity.

**High-Level Acceptance Criteria:**
- [ ] The API exposes standardized endpoints for four entities: `Quotations`, `Orders`, `Customers`, and `Pricing Matrix`.
- [ ] Each entity supports `GET` (pull), `POST` (create/push), and `PUT` (update/push) methods.
- [ ] All requests must include a valid API Key in the `Authorization` header. An invalid or missing key returns `401 Unauthorized`.
- [ ] Payloads that fail schema validation return `400 Bad Request` with a structured JSON body detailing which fields failed validation and why (e.g., `{"field": "unit_price", "error": "must be a positive number"}`).
- [ ] Lightweight `GET` requests (single record or paginated list) return a synchronous `200 OK` response in < 500ms under normal load.
- [ ] Bulk `POST`/`PUT` requests (e.g., uploading hundreds of pricing records) return `202 Accepted` immediately, with a reference ID the ERP can use to check processing status.
- [ ] The `Inventory` endpoint is visible in API documentation but returns `503 Service Unavailable` (or equivalent "coming soon" response) in Phase 1.

---

### 6.4 Asynchronous Processing (Kafka Queue)
**As a** platform, **I want to** queue heavy inbound bulk writes in an event stream and process them at a controlled rate, **so that** large ERP data dumps never degrade database performance for Allkons M and other Sellers.

**High-Level Acceptance Criteria:**
- [ ] Any inbound `POST`/`PUT` request containing bulk data (e.g., bulk Pricing Matrix update) is immediately dropped into the Apache Kafka event stream after a payload validation check.
- [ ] The system returns `202 Accepted` to the caller within < 2 seconds of receiving the bulk request — before processing is complete.
- [ ] Background worker(s) consume the Kafka queue and write to the database at a rate that does not cause database performance degradation under peak load (specific rate to be determined by engineering).
- [ ] If the Kafka event is successfully consumed and written to the database, the corresponding Sync Log entry is updated to `200 OK`. If it fails after processing, the entry is updated to the relevant error status.
- [ ] The queue is durable: if a worker crashes, queued events are not lost and will be reprocessed upon worker restart.

---

### 6.5 Outbound Webhooks (Event Subscriptions)
**As a** Seller IT Admin, **I want to** configure a webhook URL and subscribe to platform events, **so that** my ERP system receives real-time notifications when business-critical events occur in Allkons M without polling the API.

**High-Level Acceptance Criteria:**
- [ ] The Seller can add one or more webhook endpoints (destination URL + event subscription set) from the Webhooks section.
- [ ] Supported events for Phase 1 subscriptions: `order.paid`, `quotation.created`, `customer.registered`.
- [ ] When a subscribed event occurs, the platform POSTs the event payload to the Seller's configured URL within 60 seconds of the event.
- [ ] Webhook deliveries that receive a non-`2xx` response are retried at least once. The final delivery status (success or failure) is recorded in the Sync Logs.
- [ ] The Seller can test a webhook endpoint from the UI (sends a test `ping` payload to the configured URL and shows the HTTP response status).
- [ ] The Seller can enable/disable individual webhook endpoints without deleting them.

---

### 6.6 Sync Logs & Diagnostics
**As a** Seller IT Admin, **I want to** see a detailed 7-day history of all API calls and webhook deliveries, **so that** I can self-diagnose integration failures without needing to contact Allkons M support.

**High-Level Acceptance Criteria:**
- [ ] The Sync Logs table displays the last 7 days of activity, with each row showing: **Timestamp**, **Type** (Inbound API / Outbound Webhook), **Method** (GET, POST, PUT), **Endpoint/Event**, and **HTTP Status** (200, 202, 400, 401, 500, etc.).
- [ ] Status codes are displayed with visual differentiation: success codes (2xx) in green, client errors (4xx) in amber/yellow, server errors (5xx) in red.
- [ ] Clicking a `400 Bad Request` row opens a modal that displays the exact JSON validation error body returned by the API — enabling the IT team to identify and fix the data mapping issue in their ERP without a support ticket.
- [ ] The log table supports filtering by Type, Status, and Date Range (within the 7-day window).
- [ ] The Sync Logs section is read-only; no log entries can be deleted or modified by the Seller.
- [ ] Allkons M Admins can view the Sync Logs for any Seller from the Admin Portal.

---

## 7. Non-Functional Requirements

- **Security**:
  - API Keys must be generated using a cryptographically secure random method (minimum 256-bit entropy).
  - Only the SHA-256 (or stronger) hash of the API Key is stored in the database. The salt strategy must be defined by the engineering team (e.g., bcrypt or Argon2).
  - All API endpoints and the Hub UI are served exclusively over HTTPS/TLS.
  - API Key scope is limited to the issuing Seller's data; cross-Seller data access via API Key must be technically impossible.

- **Performance**:
  - Synchronous API `GET` requests: p95 response time < 500ms.
  - `202 Accepted` response for bulk inbound writes: < 2 seconds.
  - Redis-backed API Key validation: < 10ms per lookup (cache hit).
  - Sync Logs UI: initial load < 3 seconds for 7-day history.
  - Kafka queue processing lag under normal load: < 5 minutes.

- **Scalability**:
  - The Canonical API must handle a minimum of 1,000 concurrent authenticated requests without degradation.
  - The Kafka consumer architecture must allow horizontal scaling of worker instances to increase throughput as Seller volume grows.

- **Availability**:
  - Integration Hub UI and Canonical API: 99.9% uptime SLA.
  - Kafka queue must be durable (no message loss on worker failure).

- **Maintainability**:
  - The Canonical API schema must be versioned (e.g., `/api/v1/erp/...`) so that future breaking changes can be introduced without disrupting existing ERP integrations.
  - All API endpoints must be documented in a machine-readable format (e.g., OpenAPI/Swagger) maintainable by the engineering team.

- **Compliance**:
  - API Key credentials must be treated with the same sensitivity as passwords; plaintext values must never appear in server logs.
  - Sync Log data is considered operational data and subject to the platform's standard data retention policy.

---

## 8. Dependencies

| Dependency | Type | Status | Owner |
|------------|------|--------|-------|
| Seller Dashboard (shell / navigation) | Internal | Ready | Frontend Team |
| Seller permission/role model (Shop Manager, IT Admin roles) | Internal | In Progress | Auth/IAM Team |
| Apache Kafka cluster (provisioned, accessible to application) | Infrastructure | In Progress / TBD | DevOps / Platform Infra |
| Redis cluster (for API Key hash caching) | Infrastructure | In Progress / TBD | DevOps / Platform Infra |
| Core domain events (`order.paid`, `quotation.created`, `customer.registered`) — must be emittable | Internal | In Progress / TBD | Core Platform Team |
| Allkons M Admin Portal (for cross-Seller log visibility and key revocation) | Internal | In Progress | Admin Portal Team |
| API documentation portal / OpenAPI toolchain | Internal | TBD | Engineering |

---

## 9. Open Questions & Assumptions

### Open Questions
| # | Question | Raised By | Status | Answer |
|---|----------|-----------|--------|--------|
| OQ-01 | What is the maximum payload size (in MB) accepted for a single bulk `POST`/`PUT` request before it is rejected at the gateway level? | PO | Open | — |
| OQ-02 | Should each Seller be allowed multiple simultaneous active API Keys (e.g., for staging vs. production ERP environments), or is one active key per Seller sufficient for Phase 1? | PO | Open | — |
| OQ-03 | What is the exact retry policy for failed outbound webhook deliveries (number of retries, back-off interval)? | PO | Open | — |
| OQ-04 | Who owns the OpenAPI / Swagger documentation for the Canonical API — the engineering team unilaterally, or does the PO sign off on schema changes as product changes? | PO | Open | — |
| OQ-05 | Is there a rate limit per API Key (requests per minute/hour) that needs to be enforced at the gateway level in Phase 1? | PO | Open | — |
| OQ-06 | For the `202 Accepted` Kafka-queued flows: should the Sync Log entry show `202` immediately and update asynchronously, or should it only appear once processing is complete? | PO | Open | — |

### Assumptions
| # | Assumption | Impact if Wrong |
|---|------------|-----------------|
| A-01 | Sellers are responsible for mapping their ERP data fields to the Allkons M canonical JSON schema. No transformation code will be written by the Allkons M team. | If incorrect (e.g., enterprise Sellers demand hosted mapping), Phase 1 scope must expand significantly. |
| A-02 | A Kafka cluster and Redis cluster can be provisioned and made available to the application before Phase 1 development begins. | If infrastructure is not ready, the async processing and key validation features will be blocked. |
| A-03 | Core platform events (`order.paid`, `quotation.created`, `customer.registered`) already exist or can be emitted from the core domain services before webhook subscriptions can be activated. | If core events are not available, outbound webhook functionality cannot be tested end-to-end. |
| A-04 | The Seller IT Admin persona is technically capable of reading JSON error messages and mapping their ERP fields accordingly. | If target Sellers are non-technical, additional guided error messaging or a visual field-mapper tool would be required. |
| A-05 | Phase 1 is scoped to the four listed entities (Quotations, Orders, Customers, Pricing Matrix). The Inventory entity is deferred to a future phase. | If Sellers require Inventory sync at launch, Phase 1 scope and timeline must be revised. |

---

## 10. Questions for BSA

- [ ] Define the complete Allkons M canonical JSON schema for each entity (Quotations, Orders, Customers, Pricing Matrix) — field names, data types, required vs. optional fields, and validation rules — for inclusion in the BRD.
- [ ] Specify the exact Redis caching strategy for API Key hash validation: TTL, cache invalidation on key revocation, and behavior on cache miss (fallback to database lookup).
- [ ] Specify the Kafka topic structure: how many topics, partitions, consumer group configuration, and dead-letter queue strategy for messages that fail processing after repeated retries.
- [ ] Design the Sync Log data model: what data is captured per log entry, how `202` entries are updated post-processing, and how the 7-day retention window is enforced (TTL, scheduled deletion, archival).
- [ ] Define the webhook delivery mechanism: which internal service triggers the outbound POST, retry count, back-off strategy, and how delivery status is written back to the Sync Log.
- [ ] Clarify the Seller permission model for the Integration Hub: which existing roles (Shop Manager, Staff, etc.) have access to which sections (e.g., only Shop Manager can generate/revoke keys; IT Admin can view Sync Logs).
- [ ] Define the API versioning strategy and the process for deprecating older API versions when the canonical schema evolves.
- [ ] Specify how Allkons M Admins access cross-Seller Sync Logs and API key management in the Admin Portal — is this a new Admin section or an extension of existing Seller management screens?
