# SP Commission — Structured Analysis

> **Source**: PRD v1.5, BRD v1.3 (EPIC-11), commission meeting notes, system context from stakeholders
> **Scope**: SP Commission only — Seller Sales Commission is out of scope for this module
> **Business Rules**: BR-179 to BR-207

---

## 1. Commission Types

| Type | For | System | In Scope? |
|------|-----|--------|-----------|
| **Seller Sales Commission** | Store sales reps (existing) | Fee Management | ❌ Out of scope |
| **SP Commission** | Startup Partners (new) | Fee Management | ✅ In scope |

**Important**: A person can be both a Seller Sales rep AND a Startup Partner simultaneously, earning both types of commission on different transactions.

---

## 2. 3-Layer Transaction Model

Every SP commission originates from a completed purchase. The fee flows through 3 layers:

```
Layer 1: Buyer ↔ Seller          Purchase transaction (Sale Order)
                                         ↓
Layer 2: Seller ↔ Allkons        Platform Fee = 2% of Sale Order
                                         ↓
Layer 3: Allkons ↔ SP            SP Commission = Platform Fee × Base Rate
```

All 3 layers reference the same transaction (tx-01). Commission only exists if Layer 1 completes successfully.

---

## 3. Fee Structure

| Fee Type | Calculation | Used for Commission? |
|----------|-------------|---------------------|
| **Platform Fee** | 2% of Sale Order amount | ✅ YES — this is the commission base |
| **Payment Fee** | Service fee for Allkons Payment Gateway usage | ❌ NO — excluded from commission calculation |

**Formula**:
```
SP Commission = Platform Fee × Base Commission Rate
             = (Sale Order × 2%) × Base Rate%
```

**Example**: Sale Order = 100,000 THB
- Platform Fee = 100,000 × 2% = 2,000 THB
- If Base Rate = 30% → SP Commission = 2,000 × 30% = 600 THB

---

## 4. Related Systems

```
┌──────────────┐    Order data     ┌──────────────────┐
│   Mac 5      │ ───────────────→  │  Fee Management  │
│ (Order       │                   │ (Calculate Fee   │
│  System)     │                   │  + Commission    │
│              │                   │  for Sale & SP)  │
│ • Orders     │                   │                  │
│ • Delivery   │                   │ • Accounting data│
│ • Completion │                   │   from EBPP      │
└──────────────┘                   └────────┬─────────┘
                                            │ Fee data
                                            ↓
                                   ┌──────────────────┐
                                   │     EBPP         │
                                   │ (Billing &       │
                                   │  Collection)     │
                                   │                  │
                                   │ • Issue invoices │
                                   │ • Collect fees   │
                                   │   from Sellers   │
                                   │ • ERP data       │
                                   └────────┬─────────┘
                                            │ Fee collected
                                            ↓
                                   ┌──────────────────┐
                                   │ Payment Gateway  │
                                   │                  │
                                   │ • SP commission  │
                                   │   withdrawals    │
                                   │ • 5 THB per tx   │
                                   └──────────────────┘
```

| System | Role | Key Data |
|--------|------|----------|
| **Mac 5** (Order System) | Source of truth for orders | Order ID, amounts, delivery status, completion date |
| **Fee Management** | Calculates Fee & Commission (both Sale and SP types) | Platform Fee amount, commission rate, estimated/confirmed commission |
| **EBPP** (Billing/Collection) | Allkons ERP — invoices and collects Platform Fee from Sellers | Invoice status, collection status, payment confirmation |
| **Payment Gateway** | Processes SP commission payouts | Payout transactions, 5 THB withdrawal fee |

---

## 5. Fee Collection Methods

Allkons collects Platform Fee from Sellers in 3 ways. The method affects **when commission becomes confirmed**:

| Method | Description | Fee Timing | Commission Impact |
|--------|-------------|-----------|-------------------|
| **1. Payment Gateway** | Seller pays via Allkons payment gateway | Seller can choose: include in Order OR collect later | If included in Order → confirmed immediately; If later → awaits collection |
| **2. Direct Transfer** | Seller transfers directly to store/bank | Always collected separately later | Commission stays "Awaiting Fee Collection" until EBPP confirms |
| **3. Store Credit** | Seller uses store credit balance | Seller can choose: include in Order OR collect later | Same as Method 1 |

**CRITICAL**: The fee collection method and timing directly impacts the commission lifecycle — this must be reflected in the UI design for both Estimated and Confirmed commission displays.

---

## 6. Commission Lifecycle (Transaction Flow)

```
 Step   Event                           System          Commission Status
 ────   ─────                           ──────          ─────────────────
  1     Order created                   Mac 5           —
  2     Delivery dispatched             Mac 5           —
  3     Delivery confirmed (completed)  Mac 5           —
  4     Fee calculated                  Fee Management  → Estimated Commission created
  ─── ─── ─── ─── TRIGGER POINT ─── ─── ─── ───
  5     Invoice issued to Seller        EBPP            → Awaiting Fee Collection
  6a    Fee collected (in Order)        EBPP            → Confirmed (immediate)
  6b    Fee collected (later)           EBPP            → Confirmed (after payment)
  7     SP requests payout              Payment Gateway → Payout Processing
  8     Payout completed                Payment Gateway → Paid
```

### CRITICAL TRIGGER

The transition from **Estimated → Confirmed** depends on EBPP collecting the Platform Fee from the Seller.

This trigger affects 3 UX design areas:
1. **Commission Dashboard**: Must show Estimated vs Confirmed amounts separately
2. **Withdrawal Eligibility**: Only Confirmed commissions can be withdrawn
3. **Order Display**: Commission status badges on orders show fee collection dependency

---

## 7. Commission Status Lifecycle

```
Not Eligible
     ↓ (order completed + fee calculated)
Estimated
     ↓ (invoice issued to seller)
Awaiting Fee Collection
     ↓ (platform fee collected by EBPP)
Confirmed
     ↓ (above 500 THB threshold)
Ready for Payout
     ↓ (SP requests + Admin batch processes)
Payout Processing
     ↓
Paid ─────────── or ─────────── Failed (retry without duplication)
                                     │
                              Reversed / Clawed Back (refund scenario)
```

---

## 8. Fee Status Lifecycle

```
Not Calculated
     ↓ (order completed)
Calculated
     ↓ (invoice generated by EBPP)
Invoiced / Billed
     ↓ (payment initiated)
Collection Pending
     ↓
Collected ────── or ────── Collection Failed / Waived / Adjusted
```

---

## 9. Role-Based Visibility

| Role | Commission View | Scope |
|------|----------------|-------|
| **SP (Member)** | Own commissions only | Personal transactions, payouts, adjustments |
| **SP Leader** | Team member commissions (read-only) | View team transaction data, cannot edit |
| **Allkons Admin** | All commissions | Full management: policies, monitoring, batches, exceptions, audit |

---

## 10. Payout Rules

| Rule | Value |
|------|-------|
| Minimum payout threshold | 500 THB |
| Withdrawal fee | 5 THB per payout transaction |
| Payout method | Via Allkons Payment Gateway |
| Display | Gross amount → Withdrawal fee (5 THB) → Net amount |
| Processing | Admin creates payout batches from confirmed commissions |
| Retry | Failed payouts can be retried without duplication |

---

## 11. Adjustment & Clawback

| Scenario | Action | Calculation |
|----------|--------|-------------|
| Full refund | Full commission clawback | 100% of commission reversed |
| Partial refund | Proportional adjustment | Commission reduced proportionally |
| Fee collection failure | Commission stays Estimated | Does not become Confirmed |
| Fee waiver | Exception handling | Admin manual decision |
| Manual correction | Requires Admin approval + reason | Logged in audit trail |

---

## 12. Admin Commission Management

### Policy Configuration

| Scope Type | Example | Priority (highest first) |
|-----------|---------|-------------------------|
| Campaign / Override | Special promotion rate | 1 (highest) |
| Seller + Category | Store A × Building Materials | 2 |
| Category | Building Materials category | 3 |
| Seller | Store A across all categories | 4 |
| SP Tier | Gold tier SPs | 5 |
| Global | Default base rate | 6 (lowest) |

- Single rule per transaction (no stacking)
- Non-retroactive (changes apply to future transactions only)
- Conflict detection with warnings
- Policy versioning and audit trail

### Admin Dashboards

| Dashboard | Purpose |
|-----------|---------|
| Fee Monitoring | Track orders by fee status (Not Calculated → Collected) |
| Commission Monitoring | Track commissions by status (Estimated → Paid) |
| Exception Queue | Stuck commissions, failed collections, anomalies |
| Payout Batch Management | Create, process, track payout batches |
| Audit Logs | All policy changes, payout actions, manual adjustments |

### Admin Roles

| Role | Capabilities |
|------|-------------|
| Viewer | Read-only access to dashboards |
| Manager | Manage policies, view exceptions |
| Payout Manager | Create and process payout batches |
| Finance Admin | Full payout + adjustment access |
| Super Admin | Full access including audit |

---

## 13. Menu Separation (UX Architecture)

**Orders** and **Commissions** are **SEPARATE menus** in the SP Portal:

| Menu | Purpose | Content |
|------|---------|---------|
| **Orders** (เมนูคำสั่งซื้อ) | Operational — transaction tracking | Order list, delivery status, order detail. Shows commission status badge (link to Commissions menu) |
| **Commissions** (เมนูค่าคอมมิชชัน) | Financial — earnings tracking | Overview dashboard, transaction list, payout history, adjustments |

### Commission Status Badges on Orders Menu

| Badge | Meaning |
|-------|---------|
| No Commission Yet | Order not yet eligible |
| Estimated | Fee calculated, awaiting collection |
| Awaiting Fee Collection | Invoice issued, payment pending |
| Confirmed | Fee collected, commission confirmed |
| Paid | Commission paid out to SP |
| Adjusted / Reversed | Refund or correction applied |

Clicking a badge navigates to the Commissions menu for details.
