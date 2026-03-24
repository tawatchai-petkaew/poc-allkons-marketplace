1. data-testid="user-button-unknown" (ซ้ำหลายจุด)

✅เปลี่ยนเป็นเฉพาะจุด เช่น
สมัครสมาชิก (ใต้ login) → btn--go-register
เข้าสู่ระบบ (submit) → btn--login-submit
ขอรหัสใหม่ → btn--otp-resend
ยืนยัน OTP → btn--otp-confirm
ตรวจสอบเลขบัตร → btn--id-card-verify
ถัดไป/ดำเนินการต่อ → btn--personal-next, btn--password-next
กลับหน้าหลัก → btn--go-home

2. data-testid="user-text-field-phone-number" (ซ้ำทั้ง login/register start)
✅ แยกเป็น
login phone → input--login-phone
register phone → input--register-phone


โครงสร้างที่ใช้ตอนนี้คือแนวคิดคล้าย BEM
<type>--<module>-<detail>
ตัวอย่าง
btn--register-submit
แปลว่า:
btn = ประเภท element
register-submit = module ของมัน


ตัวอย่าง Scope

Scope	ใช้กับ
page	ระบุหน้าหลัก
modal	modal / dialog
section	กลุ่มใหญ่ในหน้า
form	ฟอร์ม
btn	ปุ่ม
input	ช่องกรอก
select	dropdown
checkbox	checkbox
radio	radio
table	ตาราง
row	แถว
cell	ช่อง
toast	notification
alert	error / warning




ชุดชื่อที่ dev ควรใส่แทน (แนะนำใช้ key เดียวคือ data-testid หรือ data-test-id ให้เป็นมาตรฐานเดียวกันทั้งระบบ)
1) Modal Shell (โครงหลักของทุก step)
เป้าหมาย: QA หา modal ได้ก่อน แล้วค่อยหา element ข้างใน
modal--auth (ตัว modal หลัก Login/Register)
btn--auth-close (ปุ่มกากบาทปิด modal)
img--auth-logo (โลโก้)
txt--auth-welcome (“ยินดีต้อนรับสู่ Allkons”)
title--auth (หัวข้อ เช่น “เข้าสู่ระบบเพื่อใช้งาน / สมัครสมาชิกกับเรา”)

2) Step: Login (Phone/Email toggle + phone input + CTA)
Toggle
tab--login-method-phone
tab--login-method-email
(optional state container) group--login-method
Field
input--login-phone
input--login-email (ถ้ามี flow email)
input--login-password (ถ้ามี flow password)
CTA / Navigation
btn--go-register (ปุ่ม “สมัครสมาชิก” ที่อยู่ใต้ login)
btn--login-submit (ปุ่ม “เข้าสู่ระบบ”)

3) Step: Register Start (Phone input + CTA)
form--register-start
input--register-phone
btn--go-login (ปุ่ม “เข้าสู่ระบบ” ใต้สมัครสมาชิก)
btn--register-submit (ปุ่ม “สมัครใช้งาน”)
จุดนี้สำคัญ: login/register มี input id ซ้ำ phoneNumber เหมือนกัน → ต้องแยกด้วย testid + scope ให้ชัด

4) Step: OTP
Container
form--otp
txt--otp-title
txt--otp-sent-to
txt--otp-ref-code
OTP inputs (แนะนำทำ “กลุ่ม” และ “แต่ละช่อง”)
group--otp
input--otp-1
input--otp-2
input--otp-3
input--otp-4
input--otp-5
input--otp-6
Actions
btn--otp-resend (ขอรหัสใหม่)
btn--otp-confirm (ยืนยัน)

5) Step: Set Password
form--register-password
input--password
btn--toggle-password-visibility (ตาเปิด/ปิด)
input--confirm-password
btn--toggle-confirm-password-visibility
Strength / rule checklist
bar--password-strength
txt--password-strength-label (เช่น “ความปลอดภัยรหัสผ่าน : อ่อน”)
rule--password-min-8
rule--password-alnum
rule--password-match
CTA
btn--password-next (ดำเนินการต่อ)

6) Step: Register Personal Info (ขั้นตอน 1/2)
Container / header
form--register-personal
badge--register-step (ขั้นตอน 1/2)
section--personal-info
Fields
input--first-name
input--mid-name
input--last-name
input--tel-number (ที่ disabled)
input--email
Consents
checkbox--consent-terms
link--terms-of-service
link--privacy-policy
checkbox--consent-marketing
link--marketing-policy (ถ้ามีลิงก์)
CTA
btn--personal-next (ถัดไป)

7) Step: Register Type + ID verify (ขั้นตอน 2/2)
Container
form--register-identity
badge--register-step-2 (ขั้นตอน 2/2)
group--account-type
Account type cards (เลือกแบบ card)
card--account-type-personal
card--account-type-sole-prop (บุคคลธรรมดาที่จดทะเบียนพาณิชย์)
card--account-type-corporate (นิติบุคคล)
ID Card
input--id-card
help--id-card
btn--id-card-verify (ตรวจสอบ)
CTA
btn--accept-register (ยอมรับและลงทะเบียน)

8) Result Screens
OTP locked (กรอกผิดเกินกำหนด)
screen--otp-locked
txt--otp-locked-title
txt--otp-locked-timer
Register success
screen--register-success
txt--register-success-title
btn--go-home
btn--go-login-after-success