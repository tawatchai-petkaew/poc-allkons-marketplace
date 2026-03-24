# Global Validation Rules

Defines reusable field validation rules for the entire application. All frontend specs and components must reference this file before defining field-level validation.

> **Rule:** When a new field type is introduced, check this file first. If it exists, reuse the existing rule. If not, add it here.

---

## How to Use

1. **UX Designer**: Reference these rules in Section 7 (Validation UX) of `03-frontend-spec.md`
2. **UI Developer**: Import validation patterns from this file when implementing forms
3. **QA Analyst**: Use these rules to verify form validation in test cases

---

## Field Validation Catalog

### Phone Number

| Property | Value |
|----------|-------|
| **Field name** | `phoneNumber` |
| **Type** | `tel` |
| **Required** | Yes |
| **Regex** | `/^0[689]\d{8}$/` |
| **Length** | Exactly 10 digits |
| **Charset** | Numbers only (0–9) |
| **Input restriction** | `type="tel"` blocks non-numeric input |
| **Error: empty** | กรุณากรอกหมายเลขโทรศัพท์ |
| **Error: format** | กรุณากรอกเบอร์มือถือที่ถูกต้อง |
| **Source** | `src/app/login/components/FormLogin.tsx:110-116` |

### Email

| Property | Value |
|----------|-------|
| **Field name** | `email` |
| **Type** | `email` |
| **Required** | Yes |
| **Regex** | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| **Max length** | 100 characters |
| **Charset** | No Thai characters (`/[\u0E00-\u0E7F]/` = reject) |
| **Error: empty** | กรุณากรอกอีเมล |
| **Error: format** | รูปแบบอีเมลไม่ถูกต้อง |
| **Error: Thai chars** | ไม่อนุญาตให้กรอกภาษาไทย |
| **Error: max length** | ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (100 ตัวอักษร) |
| **Source** | `src/app/login/components/steps/SetProfileStep.tsx:130-160` |

### Name (Thai)

Applies to: First Name, Last Name

| Property | Value |
|----------|-------|
| **Field name** | `firstName`, `lastName` |
| **Type** | `text` |
| **Required** | Yes |
| **Regex** | `/^[ก-๙\s]+$/` |
| **Max length** | 50 characters |
| **Charset** | Thai characters only |
| **Input restriction** | Spaces stripped on input (`onInput → replace(/\s/g, "")`) |
| **Error: empty** | กรุณากรอก[ชื่อ/นามสกุล] |
| **Error: format** | กรุณากรอกเฉพาะภาษาไทย |
| **Error: max length** | ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (50 ตัวอักษร) |
| **Source** | `src/app/login/components/steps/SetProfileStep.tsx:58-77` |

### Password

| Property | Value |
|----------|-------|
| **Field name** | `password`, `confirmPassword` |
| **Type** | `password` |
| **Required** | Yes |
| **Min length** | 8 characters |
| **Charset** | Letters + numbers required |
| **Input restriction** | No spaces (`noSpace` prop) |
| **Error: empty** | กรุณากรอกรหัสผ่าน |
| **Strength meter** | 4 levels (see below) |
| **Source** | `src/app/login/components/FormSetPassword.tsx:45-80` |

**Password Strength Scoring:**

| Criteria | Score |
|----------|-------|
| Length ≥ 8 | +1 |
| Contains letters AND numbers | +1 |
| Contains special characters (`!@#$%^&*(),.?":{}|<>`) | +1 |
| Contains uppercase letter | +1 |

| Total Score | Level | Label (TH) | Color | Trail Color |
|-------------|-------|------------|-------|-------------|
| 0–1 | 25% | อ่อน | `#da2110` | `#fbe8e7` |
| 2 | 50% | พอใช้ | `#ffab08` | `#ffeece` |
| 3 | 75% | ดี | `#00af43` | `#ccefd9` |
| 4 | 100% | ดีมาก | `#00af43` | `#ccefd9` |

### Username

| Property | Value |
|----------|-------|
| **Field name** | `username` |
| **Type** | `text` |
| **Required** | Yes |
| **Input restriction** | No spaces (`noSpace` prop) |
| **Error: empty** | กรุณากรอกชื่อผู้ใช้ |
| **Source** | `src/app/login/components/FormLogin.tsx:154-162` |

### OTP

| Property | Value |
|----------|-------|
| **Field name** | `otp` |
| **Type** | `number` |
| **Required** | Yes |
| **Length** | Exactly 6 digits |
| **Max attempts** | 5 per session |
| **Blocked duration** | 300 seconds |
| **Source** | `src/app/login/components/FormOtp.tsx` |

### Shop Name

| Property | Value |
|----------|-------|
| **Field name** | `shopName` |
| **Type** | `text` |
| **Required** | Yes |
| **Max length** | 100 characters |
| **Error: empty** | กรุณากรอกชื่อร้านค้า |
| **Source** | `src/app/(auth)/organizations/create/components/MerchantFormModal.tsx` |

---

## Validation Rule Templates

### Required Field
```tsx
{ required: true, message: "กรุณากรอก[ชื่อฟิลด์]" }
```

### Max Length
```tsx
{ max: N, message: "ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (N ตัวอักษร)" }
```

### Regex Pattern
```tsx
{ pattern: /regex/, message: "[error message]" }
```

### Custom Validator (multiple checks)
```tsx
{
  validator: (_: unknown, value: string) => {
    if (!value) return Promise.resolve();
    if (value.length > MAX) return Promise.reject("[max length message]");
    if (/[forbidden]/.test(value)) return Promise.reject("[charset message]");
    if (!/[format]/.test(value)) return Promise.reject("[format message]");
    return Promise.resolve();
  }
}
```

---

## Field: ID Card Number (เลขบัตรประชาชน)

| Property | Value |
|----------|-------|
| **Field Name** | `idCardNumber` |
| **Label (TH)** | เลขบัตรประชาชน |
| **Regex** | `/^\d{13}$/` |
| **Max Length** | 13 |
| **Character Set** | Digits only |
| **Input Type** | `tel` (numeric keypad on mobile) |
| **Required Message** | "กรุณากรอกเลขบัตรประชาชน" |
| **Format Message** | "กรุณากรอกเลขบัตรประชาชน 13 หลัก" |
| **Duplicate Message** | "เลขบัตรประชาชนนี้ถูกใช้สมัครแล้วในระบบ" (API 409) |
| **Used in** | SP Registration (US-02), SP Application (US-01) |
| **Source** | `01-epic.md` BR-009 |

---

## Field: File Upload (KYC Document)

| Property | Value |
|----------|-------|
| **Field Name** | `idCardImage`, `bankBookImage`, `selfieWithIdCard` |
| **Label (TH)** | สำเนาบัตรประชาชน, สำเนาหน้าสมุดบัญชี, รูปถ่ายคู่บัตรประชาชน |
| **Accepted Types** | `image/jpeg`, `image/png` |
| **Max Size** | 10 MB |
| **Required** | Yes (all 3 for new users; conditional for existing with KYC) |
| **Required Message** | "กรุณาอัปโหลด[document label]" |
| **Size Error** | "ไฟล์มีขนาดเกิน 10 MB กรุณาเลือกไฟล์ใหม่" |
| **Type Error** | "รองรับเฉพาะไฟล์ JPG และ PNG เท่านั้น" |
| **Used in** | SP Registration (US-02), SP Application (US-01), Application Resubmit (US-05) |
| **Source** | `01-epic.md` BR-007b, BR-007c, BR-007d, BR-007e |

---

## Field: Service Area (พื้นที่บริการ)

| Property | Value |
|----------|-------|
| **Field Name** | `serviceAreas` |
| **Label (TH)** | พื้นที่บริการ |
| **Type** | Array of `{ provinceCode, districtCode }` |
| **Min Items** | 1 |
| **Required Message** | "กรุณาเลือกพื้นที่บริการอย่างน้อย 1 พื้นที่" |
| **Province Required** | "กรุณาเลือกจังหวัด" |
| **District Required** | "กรุณาเลือกอำเภอ/เขต" |
| **Used in** | SP Registration (US-02), SP Application (US-01) |
| **Source** | `01-epic.md` BR-003 |

---

## Field: Target Shops (ร้านค้าเป้าหมาย)

| Property | Value |
|----------|-------|
| **Field Name** | `targetShopIds` |
| **Label (TH)** | ร้านค้าเป้าหมาย |
| **Type** | Array of UUIDs |
| **Min Items** | 1 |
| **Required Message** | "กรุณาเลือกร้านค้าที่ต้องการขายอย่างน้อย 1 ร้าน" |
| **Empty Area Message** | "ไม่มีร้านค้าในพื้นที่นี้ กรุณาเลือกพื้นที่อื่น" |
| **Closed Warning** | "ร้านค้าบางร้านปิดรับ SP แล้ว กรุณาตรวจสอบอีกครั้ง" |
| **Used in** | SP Registration (US-02), SP Application (US-01) |
| **Source** | `01-epic.md` BR-005 |

---

## Field: Rejection Reason (เหตุผลในการปฏิเสธ)

| Property | Value |
|----------|-------|
| **Field Name** | `rejectionReason` |
| **Label (TH)** | เหตุผลในการปฏิเสธ |
| **Max Length** | 500 |
| **Required** | Yes (when rejecting) |
| **Required Message** | "กรุณาระบุเหตุผลในการปฏิเสธ" |
| **Max Length Message** | "ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (500 ตัวอักษร)" |
| **Used in** | Admin: Reject Application (US-03) |
| **Source** | `02-technical-spec.md` Section 3.13 |

---

## Field: Info Request Message (ข้อความขอข้อมูลเพิ่มเติม)

| Property | Value |
|----------|-------|
| **Field Name** | `message` (in request-info context) |
| **Label (TH)** | ข้อความถึงผู้สมัคร |
| **Max Length** | 1000 |
| **Required** | Yes (when requesting info) |
| **Required Message** | "กรุณาระบุข้อความ" |
| **Used in** | Admin: Request Info (US-03) |
| **Source** | `02-technical-spec.md` Section 3.14 |

---

## Change Log

| Date | Change |
|------|--------|
| 2026-03-08 | Initial validation rules from authentication module |
| 2026-03-08 | Added SP enrollment fields: ID card number, file upload (KYC), service area, target shops, rejection reason, info request message (from UX Spec Phase 1) |
