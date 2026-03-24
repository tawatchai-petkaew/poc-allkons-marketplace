# UX Writing / Copy Glossary

Central glossary for all UI text, labels, and terminology used across the application. Ensures consistent language between modules.

> **Rule:** When new UI text is introduced in any module, update this file. All frontend specs and prototypes must use terms from this glossary.

---

## How to Use

1. **UX Designer**: Check this file before writing UI text. Use existing terms where possible.
2. **UI Developer**: Reference this file when implementing labels, placeholders, and messages.
3. **QA Analyst**: Verify that UI text matches this glossary during testing.
4. **Adding new terms**: Append to the relevant category table below.

---

## Navigation & Actions

| Key (EN) | Label (TH) | Context | Used In |
|----------|-----------|---------|---------|
| Login | เข้าสู่ระบบ | Main login action | Login page title, button |
| Register | สมัครสมาชิก | Main register action | Register page title, button |
| Register (link) | สมัครบัญชี | Link text to switch to register | Login page |
| Next | ถัดไป | Proceed to next step | Multi-step forms |
| Back | ย้อนกลับ | Go to previous step | Multi-step forms |
| Submit | ยืนยัน | Confirm and submit | Form submission |
| Cancel | ยกเลิก | Cancel current action | Modals, forms |
| Forgot Password | ลืมรหัสผ่าน | Link to password recovery | Login (username mode) |
| Create Store | สร้างร้านค้า | Create merchant shop | Merchant modal |

## Page Titles & Subtitles

| Key (EN) | Text (TH) | Context |
|----------|----------|---------|
| Welcome | ยินดีต้อนรับสู่ Allkons Seller Center | Login page subtitle |
| Login title | เข้าสู่ระบบเพื่อใช้งาน | Login page main title |
| Register title | ลงทะเบียน | Register flow title |
| OTP title | ยืนยัน OTP | OTP verification step |
| Set Password title | ตั้งรหัสผ่าน | Password creation step |
| Personal Info subtitle | ข้อมูลส่วนตัว | Profile step subtitle |
| Organization Info title | ข้อมูลองค์กร | Organization step title |
| Blocked title | ถูกบล็อค | Blocked state title |
| Success title | สำเร็จ | Success state title |

## Form Labels

| Key (EN) | Label (TH) | Placeholder (TH) | Field Type |
|----------|-----------|------------------|------------|
| Phone Number | หมายเลขโทรศัพท์ | กรอกหมายเลขโทรศัพท์ | tel (10 digits) |
| Username | ชื่อผู้ใช้ | กรอกเบอร์โทรศัพท์หรืออีเมล | text |
| Password | รหัสผ่าน | กรอกรหัสผ่าน | password |
| First Name | ชื่อ | กรุณากรอกชื่อ | text (Thai) |
| Last Name | นามสกุล | กรุณากรอกนามสกุล | text (Thai) |
| Email | อีเมล | กรุณากรอกอีเมล | email |
| Shop Name | ชื่อร้านค้า | กรุณากรอกชื่อร้านค้า | text |

## Radio / Toggle Labels

| Key (EN) | Label (TH) | Context |
|----------|-----------|---------|
| Phone login mode | หมายเลขโทรศัพท์ | Login type toggle |
| Username login mode | ชื่อผู้ใช้ | Login type toggle |
| Registered Individual | บุคคลธรรมดาที่จดทะเบียนพาณิชย์ | Organization type selection |
| Juristic Person | นิติบุคคล | Organization type selection |

## Consent Text

| Key (EN) | Text (TH) | Link Target |
|----------|----------|-------------|
| Terms consent | ยอมรับ เงื่อนไขการให้บริการ และ นโยบายความเป็นส่วนตัว | `/terms`, `/privacy#privacy` |
| Marketing consent | ยอมรับ การนำข้อมูลไปใช้เพื่อการตลาด | `/privacy#marketing` |

## Helper Text

| Key (EN) | Text (TH) | Context |
|----------|----------|---------|
| Not a member | หากท่านยังไม่เป็นสมาชิก เราแนะนำให้ท่าน | Login page, before register link |

## Success Messages

| Key (EN) | Title (TH) | Message (TH) | Context |
|----------|-----------|-------------|---------|
| Login success | เข้าสู่ระบบสำเร็จ | — | After successful login |
| Register success | สมัครสมาชิกสำเร็จ | เข้าสู่ระบบเพื่อเริ่มต้นใช้งานและเข้าถึงบริการทั้งหมด | After registration complete |

## Error Messages

| Key (EN) | Message (TH) | Trigger |
|----------|-------------|---------|
| Phone not registered | เบอร์โทรศัพท์นี้ยังไม่เคยสมัคร กรุณาสมัครสมาชิกก่อน | Login — phone not found |
| Phone already registered | เบอร์โทรศัพท์นี้ถูกใช้สมัครแล้วในระบบ กรุณาใช้เบอร์อื่น | Register — duplicate |
| OTP invalid | OTP ไม่ถูกต้อง กรุณากรอกใหม่ (เหลือ N ครั้ง) | Wrong OTP code |
| OTP blocked title | คุณกรอก OTP ผิดเกินจำนวนที่กำหนด | Max OTP attempts |
| OTP blocked message | เพื่อทำการลงทะเบียนอีกครั้ง | Blocked step subtitle |
| Wrong credentials | ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง | Username login fail |
| Account blocked | บัญชีนี้ถูกระงับการใช้งาน | Blocked account |

## Validation Messages

| Rule Type | Message Template (TH) |
|-----------|-----------------------|
| Required | กรุณากรอก[ชื่อฟิลด์] |
| Max length | ข้อมูลที่กรอกมีความยาวเกินกว่ากำหนด (N ตัวอักษร) |
| Phone format | กรุณากรอกเบอร์มือถือที่ถูกต้อง |
| Email format | รูปแบบอีเมลไม่ถูกต้อง |
| Thai only | กรุณากรอกเฉพาะภาษาไทย |
| No Thai | ไม่อนุญาตให้กรอกภาษาไทย |
| No special chars | ไม่อนุญาตให้กรอกอักขระพิเศษ |

## Password Strength Labels

| Level | Label (TH) | Score Range |
|-------|-----------|-------------|
| Weak | อ่อน | 0–1 |
| Fair | พอใช้ | 2 |
| Good | ดี | 3 |
| Strong | ดีมาก | 4 |

---

## SP Center — Domain Terms

| Key (EN) | Thai (TH) | Definition | Used In |
|----------|-----------|------------|---------|
| Startup Partner | Startup Partner | Affiliate seller user role | SP Center, Admin Portal |
| Member (ลูกทีม) | ลูกทีม | SP Member — 2nd level in hierarchy, reports to Leader | SP Center hierarchy |
| Leader (แม่ทีม) | แม่ทีม | SP Leader — 1st level in hierarchy, manages Members | SP Center hierarchy |
| Service Area | พื้นที่บริการ | Geographic area (province + district) where SP can operate | SP application, shop matching |
| Quotation | ใบเสนอราคา | Price quote from shop to buyer via SP | RFQ flow, quotation comparison |
| Request for Quotation (RFQ) | ใบขอเสนอราคา (RFQ) | Request sent by SP to shops for pricing | RFQ cart, submission |
| Quotation Bundle | ชุดใบเสนอราคา | Merged quotations from multiple shops, shared via link | Buyer link |
| ProfileType | ประเภทผู้ใช้งาน | User type identifier (SP = Startup Partner) | Access control |
| Approve | อนุมัติ | Admin approval action | Admin portal |
| Reject | ปฏิเสธ | Admin rejection action | Admin portal |
| Buyer | ผู้ซื้อ | End customer who purchases via quotation bundle link | Buyer link |
| My Team | ทีมของฉัน | Leader's team management page | SP Center navigation |
| Pending Approval | รอการอนุมัติ | Application awaiting admin review | Application status |
| KYC (การยืนยันตัวตน) | การยืนยันตัวตน | Know Your Customer — identity verification via documents | SP application, platform KYC |
| SP Home (หน้าหลัก SP) | หน้าหลัก SP | Landing page after SP approval with main actions | SP Center post-approval |
| Deep-Link (ลิงก์ตรง) | ลิงก์ตรง | URL in SMS that opens a specific page directly | SMS notifications |

## SP Center — Navigation & Actions

| Key (EN) | Label (TH) | Context | Used In |
|----------|-----------|---------|---------|
| Add to RFQ | เพิ่มใน RFQ | Add product to RFQ cart | Product discovery |
| Submit RFQ | ส่ง RFQ | Submit RFQ to shops | RFQ cart |
| Edit & Re-submit | แก้ไขและส่งใหม่ | Edit application and re-submit after INFO_REQUESTED | Application status page |
| Create RFQ | สร้าง RFQ | Create new RFQ from SP Home | SP Home action card |
| Search Products | ค้นหาสินค้า | Browse/search products from SP Home | SP Home action card |
| View Application Status | ดูสถานะคำขอ | View application status from SP Home | SP Home action card |
| Create Bundle Link | สร้างลิงก์ชุดใบเสนอราคา | Generate shareable quotation bundle link | Quotation comparison |
| Preview | ดูตัวอย่าง | Preview buyer view of bundle | Quotation bundle |
| Pay | ชำระเงิน | Proceed to payment | Buyer quotation link |
| Open All | เปิดทั้งหมด | Bulk toggle affiliate program ON | Shop settings |
| Close All | ปิดทั้งหมด | Bulk toggle affiliate program OFF | Shop settings |

## SP Center — Form Labels

| Key (EN) | Label (TH) | Placeholder (TH) | Field Type |
|----------|-----------|------------------|------------|
| Service Area | พื้นที่บริการ | กรุณาเลือกพื้นที่บริการ | select (province + district) |
| Target Shops | ร้านค้าเป้าหมาย | กรุณาเลือกร้านค้า | multi-select |
| ID Card Number | เลขบัตรประชาชน | กรุณากรอกเลขบัตรประชาชน 13 หลัก | text (13 digits) |
| ID Card Copy | สำเนาบัตรประชาชน | กรุณาอัปโหลดสำเนาบัตรประชาชน | file (JPG/PNG, max 10 MB) |
| Bank Book Copy | สำเนาหน้าสมุดบัญชี | กรุณาอัปโหลดสำเนาหน้าสมุดบัญชี | file (JPG/PNG, max 10 MB) |
| Selfie with ID Card | รูปถ่ายคู่บัตรประชาชน | กรุณาอัปโหลดรูปถ่ายคู่บัตรประชาชน | file (JPG/PNG, max 10 MB) |
| Quantity | จำนวน | กรอกจำนวน | number (min 1) |
| Notes | หมายเหตุ | กรอกหมายเหตุ (ถ้ามี) | textarea |

## SP Center — Validation Messages

| Rule Type | Message (TH) | Trigger |
|-----------|-------------|---------|
| Service area required | กรุณาเลือกพื้นที่บริการอย่างน้อย 1 พื้นที่ | SP application — no area selected |
| Shop required | กรุณาเลือกร้านค้าที่ต้องการขายอย่างน้อย 1 ร้าน | SP application — no shop selected |
| Terms required | กรุณายอมรับข้อกำหนดและเงื่อนไข | SP application — T&C not accepted |
| ID Card format | กรุณากรอกเลขบัตรประชาชน 13 หลัก | Invalid ID card number |
| ID card image required | กรุณาอัปโหลดสำเนาบัตรประชาชน | SP application — no ID card image |
| Bank book image required | กรุณาอัปโหลดสำเนาหน้าสมุดบัญชี | SP application — no bank book image |
| Selfie image required | กรุณาอัปโหลดรูปถ่ายคู่บัตรประชาชน | SP application — no selfie with ID |
| File size exceeded | ไฟล์มีขนาดเกิน 10 MB กรุณาเลือกไฟล์ใหม่ | File upload > 10 MB |
| Unsupported file format | รองรับเฉพาะไฟล์ JPG และ PNG เท่านั้น | File not JPG/PNG |
| Province required | กรุณาเลือกจังหวัด | Service area — no province |
| District required | กรุณาเลือกอำเภอ/เขต | Service area — no district |

## SP Center — Error Messages

| Key (EN) | Message (TH) | Trigger |
|----------|-------------|---------|
| Already SP | คุณเป็น Startup Partner อยู่แล้ว | User with active SP tries to apply |
| Duplicate application | คุณมีคำขอสมัครที่รอดำเนินการอยู่แล้ว | User with pending application tries to apply again |
| Invalid service area | พื้นที่บริการที่เลือกไม่ถูกต้อง | Selected area not in master data |
| Shop unavailable | ร้านค้าที่เลือกไม่เปิดรับ SP แล้ว | Shop closed affiliate program |
| Shop closed warning | ร้านค้าบางร้านปิดรับ SP แล้ว กรุณาตรวจสอบอีกครั้ง | Shop closes affiliate after selection but before submission |
| No shops in area | ไม่มีร้านค้าในพื้นที่นี้ กรุณาเลือกพื้นที่อื่น | No participating shops in selected area |
| No shops for SP | ไม่มีร้านค้าในพื้นที่ของคุณ | SP has no approved shops (all closed) |
| Product unavailable | สินค้านี้ไม่พร้อมจำหน่ายแล้ว | Product becomes unavailable after adding to cart |
| Add product first | กรุณาเพิ่มสินค้าก่อนเปิดรับ SP | Shop tries to open affiliate with no products |
| Concurrent modification | คำขอนี้ถูกดำเนินการแล้ว | Two admins process same application |
| ProfileType update failed | ไม่สามารถอัปเดตสิทธิ์ได้ | Backend fails to add SP profileType |
| Cannot add under member | ไม่สามารถเพิ่มลูกทีมภายใต้ลูกทีมได้ | Admin tries to nest member under member |
| Cannot delete default SP | ไม่สามารถลบบัญชี Sales Thammasorn ได้ | Admin tries to delete default leader |
| ID Card duplicate | เลขบัตรประชาชนนี้ถูกใช้สมัครแล้วในระบบ | Duplicate ID card in system |
| Old KYC docs note | เอกสารจากระบบเดิม กรุณาตรวจสอบว่าเอกสารยังเป็นปัจจุบัน | Platform KYC docs may be outdated |
| RFQ expired | RFQ หมดอายุ — ร้านค้า [shop] ไม่ตอบกลับ | Shop doesn't respond within 7 days |
| RFQ cancel warning | ร้านค้ากำลังทำใบเสนอราคา ต้องการยกเลิกหรือไม่? | SP cancels RFQ after shop started quotation |
| Link revoked | ลิงก์นี้ถูกยกเลิก กรุณาขอลิงก์ใหม่จาก SP | Old bundle link accessed after regeneration |
| Link expired | ลิงก์หมดอายุแล้ว กรุณาติดต่อผู้ขาย | Bundle link accessed after 30-day expiration |
| All quotations expired | ใบเสนอราคาทั้งหมดหมดอายุแล้ว | All quotations in bundle expired |
| Quotation expired badge | ใบเสนอราคาหมดอายุ | Single quotation expires during comparison |
| Single quotation note | ได้รับใบเสนอราคาจาก 1 ร้านค้า | Only 1 shop quoted |

## SP Center — Success Messages

| Key (EN) | Message (TH) | Context |
|----------|-------------|---------|
| Link copied | คัดลอกลิงก์แล้ว | Bundle link copied to clipboard |
| Application submitted | ส่งคำขอสมัครสำเร็จ | SP application submitted successfully |
| Application re-submitted | แก้ไขและส่งคำขอใหม่สำเร็จ | SP application re-submitted after INFO_REQUESTED |

## SP Center — Status Labels

| Key (EN) | Label (TH) | Context |
|----------|-----------|---------|
| Pending | รอการอนุมัติ | Application status |
| Info Requested | ต้องการข้อมูลเพิ่มเติม | Admin requests more info/documents |
| Approved | อนุมัติแล้ว | Application approved |
| Rejected | ถูกปฏิเสธ | Application rejected |
| Submitted | ส่งแล้ว | RFQ submitted to shop |
| Quoted | ได้รับใบเสนอราคาแล้ว | Shop responded with quotation |
| Expired | หมดอายุ | RFQ or quotation expired |
| Cancelled | ยกเลิกแล้ว | RFQ cancelled by SP |

## SP Center — Empty States

| Key (EN) | Message (TH) | Context |
|----------|-------------|---------|
| No products | ยังไม่มีสินค้า | Shop has 0 products |
| No search results | ไม่พบสินค้าที่ค้นหา | Product search returns 0 |
| No members | ยังไม่มีลูกทีม | Leader has no team members |
| Member not found | ไม่พบลูกทีม | Leader searches for member not in team |

---

## SP Center — Admin Actions

| Key (EN) | Label (TH) | Context |
|----------|-----------|---------|
| Approve | อนุมัติ | Admin approves SP application |
| Reject | ปฏิเสธ | Admin rejects SP application |
| Request Info | ขอข้อมูลเพิ่มเติม | Admin requests additional docs/info |
| Confirm Approve | ยืนยันการอนุมัติ | Approve confirmation modal title |
| Confirm Approve Msg | คุณต้องการอนุมัติคำขอสมัครของ [name] หรือไม่? | Approve confirmation modal body |
| Rejection Reason Title | เหตุผลในการปฏิเสธ | Reject modal title |
| Rejection Reason Placeholder | กรุณาระบุเหตุผล | Reject modal textarea placeholder |
| Request Info Title | ขอข้อมูลเพิ่มเติม | Request-info modal title |
| Request Info Placeholder | กรุณาระบุข้อความถึงผู้สมัคร | Request-info modal textarea placeholder |
| Approve Success | อนุมัติสำเร็จ | Toast after successful approval |
| Reject Success | ปฏิเสธสำเร็จ | Toast after successful rejection |
| Request Info Success | ส่งคำขอข้อมูลเพิ่มเติมสำเร็จ | Toast after request-info sent |
| Concurrent Error | คำขอนี้ถูกดำเนินการแล้ว | 409 version mismatch |
| Rejection Reason Required | กรุณาระบุเหตุผลในการปฏิเสธ | Reject modal validation |
| Message Required | กรุณาระบุข้อความ | Request-info modal validation |

## SP Center — Application Status Messages

| Key (EN) | Message (TH) | Context |
|----------|-------------|---------|
| Pending Message | คำขอสมัครของคุณอยู่ระหว่างการตรวจสอบ | Status page — PENDING |
| Approved Message | คำขอสมัครของคุณได้รับการอนุมัติแล้ว | Status page — APPROVED |
| Go to SP Home | ไปหน้าหลัก SP | CTA on approved status |
| Reapply After | สามารถสมัครใหม่ได้หลังวันที่ [date] | Status page — REJECTED |
| Reapply Button | สมัครใหม่ | Reapply CTA (enabled after cooldown) |
| Edit and Resubmit | แก้ไขและส่งใหม่ | CTA on INFO_REQUESTED status |
| Resubmit Title | แก้ไขคำขอสมัคร | Resubmit form title |
| Resubmit Success | แก้ไขและส่งคำขอใหม่สำเร็จ | Toast after resubmit |
| Status Not Editable | สถานะคำขอไม่อนุญาตให้แก้ไข | 409 on resubmit |
| No Application | ไม่พบคำขอสมัคร | 404 on status page |
| No Applications (Admin) | ยังไม่มีคำขอสมัคร | Admin list empty state |

## SP Center — Registration Flow Messages

| Key (EN) | Message (TH) | Context |
|----------|-------------|---------|
| Gen-Link Note | ข้อมูลจากลิงก์แนะนำ (สามารถแก้ไขได้) | Gen-link pre-filled info |
| Password SMS Notice | รหัสผ่านสำหรับเข้าสู่ระบบจะถูกส่งทาง SMS | Confirmation step sub-message |
| Already SP | คุณเป็น Startup Partner อยู่แล้ว | 403 error on existing account |
| Pending Application | คุณมีคำขอสมัครที่รอดำเนินการอยู่แล้ว | 409 error on existing account |
| View Status | ดูสถานะคำขอ | CTA on pending application error |
| Incomplete Profile | กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วนก่อนสมัคร SP | 422 error on existing account |
| Go Fill Profile | ไปกรอกข้อมูล | CTA for incomplete profile |
| Old System Docs | เอกสารจากระบบเดิม กรุณาตรวจสอบว่าเอกสารยังเป็นปัจจุบัน | KYC docs from old system |
| Session Expired | เซสชันหมดอายุ กรุณาเริ่มใหม่ | 401 on registration |
| No Shops In Area | ไม่มีร้านค้าในพื้นที่นี้ กรุณาเลือกพื้นที่อื่น | Empty shop selector |
| Shop Closed Warning | ร้านค้าบางร้านปิดรับ SP แล้ว กรุณาตรวจสอบอีกครั้ง | Shop closed during selection |

---

## Change Log

| Date | Change |
|------|--------|
| 2026-03-08 | Initial glossary from authentication module |
| 2026-03-08 | Added SP Center sections: domain terms, navigation, form labels, validation, errors, success, status labels, empty states |
| 2026-03-08 | Added KYC terms (document labels, validation), SP Home actions, deep-link, edit & re-submit, file upload error messages |
| 2026-03-08 | Added SP Center admin actions, application status messages, registration flow messages (from UX Spec Phase 1) |
