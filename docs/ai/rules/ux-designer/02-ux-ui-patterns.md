# UX/UI Pattern Library

Central library of reusable UX/UI patterns used across the application. All frontend specs must reference existing patterns before creating new ones.

> **Rule:** When a new UI pattern is introduced, add it here with a description, code example, and usage context. All modules should reuse patterns from this library.

---

## How to Use

1. **UX Designer**: Reference these patterns in Section 4 (Interactions & Transitions) of `03-frontend-spec.md`
2. **UI Developer**: Follow these patterns when implementing new screens
3. **When adding a new pattern**: Copy the template at the bottom and fill in details

---

## Pattern Catalog

### P-01: Error Alert Banner

**Purpose:** Display API-level errors above forms.

**Visual:**
```
┌─────────────────────────────────────────┐
│ ⓘ  [error message text]                │
└─────────────────────────────────────────┘
```

**Implementation:**
```tsx
<Alert
  message={<Typography variant="paragraph-medium" className="!text-text-primary">{errorMessage}</Typography>}
  type="error"
  className="!p-4 !rounded-xl"
  showIcon
  icon={<i className="ri-information-line text-xl" />}
/>
```

**Behavior:**
- Appears immediately after API error response
- Clears when user starts editing any field (`onChange → clearError`)
- Placed between title and form

**Used in:** Login (phone/username), Register, OTP
**Source:** `src/app/login/components/FormLogin.tsx:82-99`

---

### P-02: Multi-Step Form with Slide Animation

**Purpose:** Navigate between form steps with smooth transitions.

**Visual:**
```
[Step 1] ──slide──> [Step 2] ──slide──> [Step 3]
                  <──slide──           <──slide──
```

**Implementation:**
```tsx
// State machine: useAuthFlow() from useLoginState.ts
const { state, actions, utils } = useAuthFlow();

// Each step panel:
<div className={`transition-transform duration-300 ${utils.getTransformClass(Step.XXX)}`}>
  <StepComponent />
</div>
```

**Structure:**
- `useLoginState.ts` manages: current step, flow type, navigation
- `FLOW_STEPS` defines step order per flow
- `getTransformClass()` returns CSS transform for slide animation
- Back navigation via `goBack()` (only when `STEP_CONFIG[step].canGoBack`)

**Used in:** Authentication (Login + Register flows)
**Source:** `src/hooks/useLoginState.ts`, `src/app/login/constants.ts`

---

### P-03: Form Layout Card

**Purpose:** Standard form container with consistent width and padding.

**Visual:**
```
┌──────────────────────────────┐
│  [Title]                     │
│  [Subtitle]                  │
│                              │
│  [Form fields]               │
│                              │
│  [═══ Submit Button ═══]     │
└──────────────────────────────┘
```

**Implementation:**
```tsx
<div className="flex justify-center items-center w-full">
  <div className="flex flex-col justify-start w-[400px]">
    {/* Title */}
    <Typography variant="paragraph-small" className="!text-text-quinary">[subtitle]</Typography>
    <Typography variant="h3" className="!text-text-secondary">[title]</Typography>

    {/* Form */}
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <div className="flex flex-col gap-4">
        {/* fields */}
      </div>
      <Button htmlType="submit" fullWidth loading={loading}>
        [submit text]
      </Button>
    </Form>
  </div>
</div>
```

**Widths:**
- Login/Register forms: `w-[400px]`
- Profile/Organization forms: `w-[500px]` (`sm:w-[500px]`)

**Used in:** All authentication forms
**Source:** `src/app/login/components/FormLogin.tsx`, `SetProfileStep.tsx`

---

### P-04: Radio Toggle (Mode Switcher)

**Purpose:** Switch between two modes (e.g., phone vs username login).

**Visual:**
```
┌─────────────────┬─────────────────┐
│ ● Phone Number  │   Username      │
└─────────────────┴─────────────────┘
```

**Implementation:**
```tsx
<RadioGroup
  value={currentMode}
  options={[
    { label: "หมายเลขโทรศัพท์", value: "phone" },
    { label: "ชื่อผู้ใช้", value: "username" },
  ]}
  onChange={(e) => {
    setMode(e.target.value);
    form.resetFields();  // Always reset form when switching
    clearError?.();      // Always clear errors when switching
  }}
  useRadioButton={true}
  buttonStyle="solid"
  block
/>
```

**Behavior:**
- Reset form fields on mode switch
- Clear any existing errors on mode switch
- Full-width (`block`) with solid button style

**Used in:** Login page
**Source:** `src/app/login/components/FormLogin.tsx:59-80`

---

### P-05: Password Strength Meter

**Purpose:** Visual feedback for password complexity.

**Visual:**
```
Password: [••••••••]
Strength: [████████░░░░░░░░] ดี
```

**Implementation:**
```tsx
<Progress
  percent={passwordStrength.level}
  strokeColor={passwordStrength.color}
  trailColor={passwordStrength.trailColor}
  showInfo={false}
/>
<Typography>{passwordStrength.text}</Typography>
```

**Levels:** อ่อน (25%, red) → พอใช้ (50%, amber) → ดี (75%, green) → ดีมาก (100%, green)

**Used in:** Set Password step
**Source:** `src/app/login/components/FormSetPassword.tsx:33-80`

---

### P-06: Consent Checkbox with Links

**Purpose:** Terms of service and privacy policy acceptance.

**Visual:**
```
☐ ยอมรับ เงื่อนไขการให้บริการ และ นโยบายความเป็นส่วนตัว
☐ ยอมรับ การนำข้อมูลไปใช้เพื่อการตลาด
```

**Implementation:**
```tsx
<Checkbox
  name="consent"
  size="small"
  label={
    <span className="text-sm">
      ยอมรับ{" "}
      <span className="text-primary cursor-pointer underline"
        onClick={() => window.open("/terms", "_blank")}>
        เงื่อนไขการให้บริการ
      </span>{" "}และ{" "}
      <span className="text-primary cursor-pointer underline"
        onClick={() => window.open("/privacy#privacy", "_blank")}>
        นโยบายความเป็นส่วนตัว
      </span>
    </span>
  }
/>
```

**Behavior:**
- Links open in new tab (`_blank`)
- Required consent blocks form submission (Submit button disabled)
- Marketing consent is optional

**Used in:** Set Profile step
**Source:** `src/app/login/components/steps/SetProfileStep.tsx:164-214`

---

### P-07: Conditional Submit Button

**Purpose:** Submit button that disables based on form state.

**Implementation:**
```tsx
<Form.Item shouldUpdate className="!mt-6 !mb-0">
  {({ getFieldsError, getFieldValue }) => {
    const hasErrors = getFieldsError().some(({ errors }) => errors.length);
    const hasEmptyRequired = requiredFields.some(f => !getFieldValue(f));
    const consentAccepted = getFieldValue("consent");

    return (
      <Button
        htmlType="submit"
        fullWidth
        disabled={hasErrors || hasEmptyRequired || !consentAccepted || loading}
        loading={loading}
      >
        [submit text]
      </Button>
    );
  }}
</Form.Item>
```

**Behavior:**
- Disabled when: validation errors exist, required fields empty, consent not accepted, or loading
- Shows loading spinner during API call
- Always full-width

**Used in:** Set Profile step, Organization step
**Source:** `src/app/login/components/steps/SetProfileStep.tsx:218-244`

---

### P-08: Modal Form (Merchant Creation)

**Purpose:** Modal dialog with form for creating an entity.

**Visual:**
```
┌──────────────────────────────────────┐
│  Welcome message                     │
│  Username display                    │
│                                      │
│  [Shop Name input]                   │
│                                      │
│  [═══ Create Store ═══]              │
└──────────────────────────────────────┘
```

**Behavior:**
- Modal opens after successful registration/organization setup
- Not closable (no X button, no backdrop click to close)
- Form validation before submit
- Loading state on button during API call

**Used in:** Post-registration merchant creation
**Source:** `src/app/(auth)/organizations/create/components/MerchantFormModal.tsx`

---

### P-09: KYC Document Upload with Preview

**Purpose:** File upload zone with image preview, replace/delete actions, and validation feedback for KYC documents.

**Visual:**
```
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│                                       │  ← Empty: dashed border
│     📄  สำเนาบัตรประชาชน               │
│     รองรับ JPG, PNG ไม่เกิน 10 MB     │
│     [══ อัปโหลด ══]                   │
│                                       │
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘

┌───────────────────────────────────────┐
│  ┌─────────┐                          │  ← Uploaded: solid border + preview
│  │  Image  │  id-card.jpg             │
│  │ Preview │  2.4 MB                  │
│  │   ✅    │  [เปลี่ยน] [ลบ]           │
│  └─────────┘                          │
└───────────────────────────────────────┘
```

**Behavior:**
- Click or drag-and-drop to upload file
- Client-side validation: file type (JPG/PNG) and size (≤ 10 MB)
- Progress bar during upload
- Image thumbnail preview after upload
- "เปลี่ยน" replaces file, "ลบ" removes file
- Red dashed border + inline error on validation failure
- Mobile: `accept="image/*" capture="environment"` for camera
- Multiple upload zones stacked vertically (3 for KYC)

**Used in:** SP Registration Documents (US-02), SP Application (US-01), Application Resubmit (US-05)
**Source:** `03-frontend-spec.md` Section 3.1.10–3.1.13, 3.2.2–3.2.4

---

### P-10: Cascading Area-Shop Selector

**Purpose:** Province → District cascading dropdown with chip display, followed by shop multi-select filtered by selected areas.

**Visual:**
```
┌───────────────────────────────────────┐
│ พื้นที่บริการ                           │
│ ┌──────────────┐ ┌──────────────┐     │
│ │ จังหวัด    ▼ │ │ อำเภอ/เขต ▼ │     │
│ └──────────────┘ └──────────────┘     │
│                                       │
│ [กรุงเทพฯ > พระนคร ✕] [ชลบุรี > ... ✕] │  ← Chips
│                                       │
│ [+ เพิ่มพื้นที่]                        │
│                                       │
│ ร้านค้าเป้าหมาย                        │
│ ┌──────────────────────────────┐      │
│ │ 🔍 ค้นหาร้านค้า              │      │
│ └──────────────────────────────┘      │
│ ☑ ร้าน ABC (พระนคร)                   │
│ ☑ ร้าน XYZ (พระนคร)                   │
│ ☐ ร้าน DEF (บางรัก)                    │
└───────────────────────────────────────┘
```

**Behavior:**
- Province loads on mount; district loads on province select
- Selected area appears as removable chip/tag
- "เพิ่มพื้นที่" adds another area (resets province/district dropdowns)
- Shop list filtered by all selected areas
- Shop search by name (debounced 300ms)
- Empty state: "ไม่มีร้านค้าในพื้นที่นี้ กรุณาเลือกพื้นที่อื่น"
- Closed shop warning via alert banner
- Mobile: province/district as bottom sheet; shop list as full-screen search modal

**Used in:** SP Registration Application step (US-02), SP Application (US-01)
**Source:** `03-frontend-spec.md` Section 3.1.14, 4.4

---

### P-11: Status Timeline

**Purpose:** Vertical timeline displaying application status history with timestamps, actors, and reasons.

**Visual:**
```
┌───────────────────────────────────────┐
│ ประวัติสถานะ                            │
│                                       │
│ ● ส่งคำขอ                              │
│ │ 2026-03-08 20:00                    │
│ │ โดย: สมชาย                           │
│ │                                     │
│ ● ขอข้อมูลเพิ่มเติม                      │
│ │ 2026-03-09 10:00                    │
│ │ โดย: Admin                          │
│ │ เหตุผล: กรุณาอัปโหลดสำเนาบัตรใหม่      │
│ │                                     │
│ ○ รอการอนุมัติ  ← current (hollow dot)  │
│   2026-03-09 15:00                    │
└───────────────────────────────────────┘
```

**Behavior:**
- Filled dot (●) for past statuses, hollow dot (○) for current status
- Each entry shows: status label, timestamp, actor name, reason (if any)
- Sorted chronologically (newest at bottom)
- Color-coded dots: green (approved), red (rejected), yellow (pending), orange (info requested)
- Responsive: always vertical, left-aligned

**Used in:** Application Status Page (US-05), Admin Application Detail (US-03)
**Source:** `03-frontend-spec.md` Section 3.4.1–3.4.4, 3.3.5

---

### P-12: Admin Action with Optimistic Lock

**Purpose:** Admin action buttons (approve/reject/request-info) that include `version` parameter for optimistic locking, with concurrent modification handling.

**Visual:**
```
┌───────────────────────────────────────┐
│                                       │
│ [══ อนุมัติ ══] [ปฏิเสธ] [ขอข้อมูลฯ]  │
│                                       │
│ ─── On 409: ──────────────────────── │
│ ⚠️ คำขอนี้ถูกดำเนินการแล้ว              │
│ (auto-refresh in 3s)                  │
└───────────────────────────────────────┘
```

**Behavior:**
- Each action sends `{ version: N }` from last-fetched application data
- Approve: confirmation modal → loading → toast → redirect
- Reject: modal with required textarea → loading → toast → redirect
- Request Info: modal with message + optional doc checklist → loading → toast → redirect
- On 409: show alert banner "คำขอนี้ถูกดำเนินการแล้ว", auto-refresh after 3s
- Action buttons only shown when status = PENDING
- Loading spinner on button during API call; modal buttons disabled

**Used in:** Admin Application Detail (US-03)
**Source:** `03-frontend-spec.md` Section 3.3.5–3.3.9, 4.7–4.9

---

## Adding a New Pattern

Template:

```markdown
### P-XX: [Pattern Name]

**Purpose:** [one sentence]

**Visual:** (ASCII diagram)

**Implementation:** (code snippet)

**Behavior:** (list of behaviors)

**Used in:** [module/screen]
**Source:** [file path]
```

---

## Change Log

| Date | Change |
|------|--------|
| 2026-03-08 | Initial 8 patterns from authentication module |
| 2026-03-08 | Added P-09 (KYC Document Upload), P-10 (Cascading Area-Shop Selector), P-11 (Status Timeline), P-12 (Admin Action with Optimistic Lock) from SP enrollment UX Spec Phase 1 |
