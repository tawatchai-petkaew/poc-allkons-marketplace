# Central Error Handling Patterns

Defines how errors should be displayed across the application. All modules must follow these patterns for consistent UX.

> **Rule:** When a new error pattern is introduced, add it here. All frontend specs and prototypes must reference this file.

---

## Error Display Types

### Type 1: Alert Banner (API Errors)

Used for **API-level errors** that affect the entire form (e.g., wrong credentials, account blocked).

**Pattern:**
```tsx
<Alert
  message={<Typography variant="paragraph-medium">{errorMessage}</Typography>}
  type="error"
  className="!p-4 !rounded-xl"
  showIcon
  icon={<i className="ri-information-line text-xl" />}
/>
```

**Placement:** Above the form, below the title.
**Behavior:** Disappears when user starts editing any field (`onChange → clearError`).

**Example — Authentication:**

| Error Code | Message (TH) | Trigger |
|------------|--------------|---------|
| `PHONE_NOT_FOUND` | เบอร์โทรศัพท์นี้ยังไม่เคยสมัคร กรุณาสมัครสมาชิกก่อน | Phone login — not registered |
| `PHONE_ALREADY_REGISTERED` | เบอร์โทรศัพท์นี้ถูกใช้สมัครแล้วในระบบ กรุณาใช้เบอร์อื่น | Register — already exists |
| `AKM_ERR002` | ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง | Username login — wrong password |
| `OTP_INVALID` | OTP ไม่ถูกต้อง กรุณากรอกใหม่ (เหลือ N ครั้ง) | OTP verification — wrong code |

**Source:** `src/app/login/constants.ts` → `ERROR_MESSAGES`

---

### Type 2: Inline Validation (Field Errors)

Used for **field-level validation** errors shown directly below the input.

**Pattern:**
```tsx
<TextField
  name="fieldName"
  rules={[
    { required: true, message: "กรุณากรอก[ชื่อฟิลด์]" },
    { pattern: /regex/, message: "[error message]" },
    { max: N, message: "ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (N ตัวอักษร)" },
  ]}
/>
```

**Placement:** Below the input field (Ant Design Form.Item default).
**Behavior:** Appears on blur or form submit. Disappears when input becomes valid.

**Standard Messages:**

| Rule | Message Template (TH) |
|------|-----------------------|
| Required | กรุณากรอก[ชื่อฟิลด์] |
| Max length | ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (N ตัวอักษร) |
| Pattern (phone) | กรุณากรอกเบอร์มือถือที่ถูกต้อง |
| Pattern (email) | รูปแบบอีเมลไม่ถูกต้อง |
| Pattern (Thai only) | กรุณากรอกเฉพาะภาษาไทย |
| Pattern (no Thai) | ไม่อนุญาตให้กรอกภาษาไทย |

---

### Type 3: Blocked State (Full-Screen)

Used when user is **temporarily blocked** from an action (e.g., too many OTP attempts).

**Pattern:**
- Navigate to a dedicated "Blocked" step/screen
- Show countdown timer (large, centered)
- Show title explaining why blocked
- Show message with instructions
- Back button to return to previous step

**Example — Authentication:**

| Element | Content (TH) |
|---------|--------------|
| Title | คุณกรอก OTP ผิดเกินจำนวนที่กำหนด |
| Message | เพื่อทำการลงทะเบียนอีกครั้ง |
| Timer | Countdown from 300 seconds |
| Action | Back button → return to Login/Register |

**Source:** `src/app/login/constants.ts` → `ERROR_MESSAGES.OTP_BLOCKED_TITLE`, `OTP_BLOCKED_MESSAGE`

---

### Type 4: Popup / Modal (Confirmation or Critical)

Used for **critical actions** that require confirmation or display important information.

**Pattern:**
```tsx
showPopup({
  type: "error" | "warning" | "success",
  title: "[title]",
  description: "[description]",
  confirmText: "[button text]",
  onConfirm: () => { /* action */ },
});
```

**When to use:**
- Destructive actions (delete, cancel)
- Session expired
- Critical API failures

---

## Error Handling Checklist

When adding a new module, verify:

- [ ] All API error codes are mapped to Thai messages
- [ ] Alert Banner used for API errors (not inline)
- [ ] Inline validation for field-level errors
- [ ] Errors clear when user starts editing
- [ ] Blocked state has countdown timer and back action
- [ ] Error messages are added to `docs/shared/glossary.md`
- [ ] Error scenarios are documented in `docs/shared/test-data/[module]/test-data.md`

---

## Change Log

| Date | Change |
|------|--------|
| 2026-03-08 | Initial error handling patterns from authentication module |
