# UX Writing & Copy Standards

Central rules for consistent UX writing across the entire Allkons system. All roles that produce or consume UI text **must** follow these standards.

> **Rule:** Before writing any new Thai UI text (labels, buttons, messages, errors, placeholders), check `docs/shared/glossary.md` first. If the term exists, reuse it exactly. If not, add it to the glossary before using it.

---

## Who Must Follow This

| Role | When |
|------|------|
| **Product Owner** | Writing acceptance criteria with UI text in PRD |
| **Business Analyst** | Writing validation rules, error messages, state descriptions in BRD/Epic |
| **UX Designer** | Designing screen copy, empty states, error states, validation UX |
| **UI Developer** | Writing mock TSX with hardcoded strings |
| **Developer** | Implementing UI components with labels/messages |
| **QA Analyst** | Writing expected results that verify UI text |
| **Tech Lead** | Designing API error response messages |

---

## Core Principles

### 1. Glossary-First Workflow

```
Need UI text → Check docs/shared/glossary.md
  ├── Term exists → Reuse EXACTLY (same wording, same Thai)
  └── Term missing → Add to glossary FIRST → Then use in your document/code
```

**Mandatory references:**
- `docs/shared/glossary.md` — All UI text: labels, buttons, placeholders, errors, success, consent
- `docs/shared/error-handling.md` — Error display patterns (Alert Banner / Inline / Blocked / Modal)
- `docs/ai/rules/ux-designer/01-validation-rules.md` — Field validation rules with exact error messages

### 2. No Rogue Strings

Every Thai string visible to the user must exist in `docs/shared/glossary.md`. This applies to:
- Button labels
- Form field labels & placeholders
- Validation error messages
- Success/confirmation messages
- Empty state messages
- Loading messages
- Modal titles & body text
- Consent text
- Navigation labels
- Toast/notification messages

---

## Tone & Voice

| Attribute | Standard |
|-----------|----------|
| **Language** | Thai primary (ภาษาไทย) — English only for technical terms (email, OTP, URL) |
| **Register** | Formal-but-friendly (สุภาพ ไม่เป็นทางการเกินไป) |
| **Person** | Address user implicitly (กรุณา…) — not "คุณต้อง…" |
| **Brevity** | Concise — say it in the fewest words possible |
| **Actionable** | Tell the user what to DO, not just what went wrong |
| **Consistent** | Same action = same wording everywhere in the system |

### Examples

| ❌ Inconsistent | ✅ Consistent (Glossary) |
|----------------|------------------------|
| กรุณาใส่เบอร์โทร | กรุณากรอกหมายเลขโทรศัพท์ |
| ชื่อร้านห้ามว่าง | กรุณากรอกชื่อร้านค้า |
| บันทึกข้อมูลแล้ว | บันทึกสำเร็จ |
| เกิดข้อผิดพลาด ลองอีกครั้ง | เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง |

---

## Message Templates

All messages must follow these templates. Placeholders in `[brackets]` are replaced with the specific field/action name.

### Validation Messages (Inline — Field Level)

| Pattern | Template | Example |
|---------|----------|---------|
| **Required field** | `กรุณากรอก[ชื่อฟิลด์]` | กรุณากรอกหมายเลขโทรศัพท์ |
| **Required selection** | `กรุณาเลือก[ชื่อฟิลด์]` | กรุณาเลือกจังหวัด |
| **Invalid format** | `กรุณากรอก[ชื่อฟิลด์]ที่ถูกต้อง` | กรุณากรอกเบอร์มือถือที่ถูกต้อง |
| **Max length exceeded** | `ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด ([N] ตัวอักษร)` | ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (100 ตัวอักษร) |
| **Min length** | `[ชื่อฟิลด์]ต้องมีอย่างน้อย [N] ตัวอักษร` | รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร |
| **Thai only** | `กรุณากรอกเฉพาะภาษาไทย` | — |
| **No Thai** | `ไม่อนุญาตให้กรอกภาษาไทย` | — |
| **Numeric only** | `กรุณากรอกเฉพาะตัวเลข` | — |
| **Duplicate** | `[ชื่อฟิลด์]นี้ถูกใช้งานแล้ว` | อีเมลนี้ถูกใช้งานแล้ว |

### Error Messages (Alert Banner — Page/Form Level)

| Pattern | Template | Example |
|---------|----------|---------|
| **General API error** | `เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง` | — |
| **Network error** | `ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่อีกครั้ง` | — |
| **Session expired** | `เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่` | — |
| **Unauthorized** | `คุณไม่มีสิทธิ์เข้าถึงหน้านี้` | — |
| **Not found** | `ไม่พบข้อมูลที่ร้องขอ` | — |
| **Specific API error** | Use `message` from API response if available, else fallback to general | — |

### Success Messages (Toast / Inline)

| Pattern | Template | Example |
|---------|----------|---------|
| **Create success** | `สร้าง[รายการ]สำเร็จ` | สร้างร้านค้าสำเร็จ |
| **Update success** | `บันทึก[รายการ]สำเร็จ` | บันทึกข้อมูลสำเร็จ |
| **Delete success** | `ลบ[รายการ]สำเร็จ` | ลบสินค้าสำเร็จ |
| **General save** | `บันทึกสำเร็จ` | — |
| **Submit success** | `ส่ง[รายการ]สำเร็จ` | ส่งใบเสนอราคาสำเร็จ |

### Confirmation Messages (Modal)

| Pattern | Template | Example |
|---------|----------|---------|
| **Delete confirm** | `คุณต้องการลบ[รายการ]นี้หรือไม่?` | คุณต้องการลบสินค้านี้หรือไม่? |
| **Discard confirm** | `คุณต้องการยกเลิกการเปลี่ยนแปลงหรือไม่?` | — |
| **Submit confirm** | `คุณต้องการส่ง[รายการ]นี้หรือไม่?` | คุณต้องการส่งใบเสนอราคานี้หรือไม่? |

### Empty State Messages

| Pattern | Template | Example |
|---------|----------|---------|
| **No data** | `ยังไม่มี[รายการ]` | ยังไม่มีสินค้า |
| **No search results** | `ไม่พบ[รายการ]ที่ค้นหา` | ไม่พบสินค้าที่ค้นหา |

### Button Labels

| Action | Label |
|--------|-------|
| **Primary action** | Action-oriented verb: `บันทึก`, `ส่ง`, `สร้าง`, `ยืนยัน` |
| **Cancel** | `ยกเลิก` |
| **Back** | `กลับ` |
| **Next** | `ถัดไป` |
| **Delete** | `ลบ` |
| **Edit** | `แก้ไข` |
| **Search** | `ค้นหา` |
| **Filter** | `กรอง` |
| **Clear** | `ล้าง` |
| **Retry** | `ลองใหม่` |
| **Close** | `ปิด` |
| **Confirm** | `ยืนยัน` |
| **Login** | `เข้าสู่ระบบ` |
| **Logout** | `ออกจากระบบ` |
| **Register** | `สมัครสมาชิก` |

---

## Error Display Pattern Reference

When choosing **how** to display an error, reference `docs/shared/error-handling.md`:

| Pattern | When to Use |
|---------|-------------|
| **Alert Banner** (P-01) | API-level errors above forms (e.g., login failed, save failed) |
| **Inline Validation** | Field-level validation errors below the field |
| **Blocked State** | Full-page error (500, 403, 404) — no partial UI |
| **Modal** | Destructive action confirmation, critical warnings |
| **Toast** | Transient success/info messages (auto-dismiss 3–5s) |

---

## Cross-Module Consistency Checklist

Use this checklist whenever producing or reviewing UI text in any document or code:

- [ ] **Glossary check**: Every Thai string exists in `docs/shared/glossary.md`
- [ ] **Template match**: Validation messages follow the template patterns above
- [ ] **Error pattern**: Error display type matches `docs/shared/error-handling.md`
- [ ] **Tone**: Formal-but-friendly, uses กรุณา for requests, concise
- [ ] **No synonyms**: Same concept = same word everywhere (e.g., always `ร้านค้า` never `ร้าน` or `shop`)
- [ ] **Button labels**: Action-oriented, match the standard labels table
- [ ] **Empty states**: Follow `ยังไม่มี[รายการ]` template
- [ ] **Success messages**: Follow `[Action][รายการ]สำเร็จ` template
- [ ] **New terms added**: Any new UI text has been added to `docs/shared/glossary.md`
- [ ] **New error codes added**: Any new error codes have been added to `docs/shared/error-handling.md`
- [ ] **New validation rules added**: Any new field types have been added to `docs/ai/rules/ux-designer/01-validation-rules.md`

---

## Update Workflow

When a role introduces **new** UI text that doesn't exist in the glossary:

1. **Check** `docs/shared/glossary.md` — confirm the term is truly new
2. **Add** the new term to the appropriate section in `docs/shared/glossary.md`
3. **If it's a validation message**, also check `docs/ai/rules/ux-designer/01-validation-rules.md` and add if new field type
4. **If it's a new error code/pattern**, also update `docs/shared/error-handling.md`
5. **Use** the newly added term in your document/code

> **Never** introduce Thai UI text in a BRD, UX spec, mock TSX, or production code without first ensuring it exists in the glossary.

---

## Change Log

| Date | Change |
|------|--------|
| 2025-06-24 | Initial UX Writing & Copy Standards from glossary and error-handling alignment |
