SP Commission

Commission มี 2 แบบ
แบบที่ 1 สำหรับ Sale ของร้านนั้นๆ ปกติจะมีอยู่แล้ว
แบบที่ 2 สำหรับ SP จากเป็นอีกแบบ
สำคัญ : มีโอกาศที่ Sale รับ Comm รูปแบบ Sale ปกติแล้วสมัคร SP เพื่อรับค่าคอม อีกต่อได้

Layer ของการเกิดค่า Fee จะเกิดขึ้นก็ต่อเมื่อมี Transaction
Layer 01 Buyer <> Seller เกิดการซื้อขายสำเร็จ (tx-01)
Layer 02 Seller <> Allkons ชำระค่า Platform Fee สำเร็จ (tx-01)
Layer 03 Allkons <> Startup Partner ค่า Fee ถูกคำนวณจาก Platform Fee (base comm rate xx%) (tx-01) Allkons ชำระ Comm

ข้อมูลค่าธรรมเนียม (Fee)
- Platform fee : Sale order (2%) จาก Order
- Payment fee : Service เมื่อมีการชำระผ่าน Allkons payment gateway
สำคัญ : การคำนวณค่า Comm เกิดจาก Platform fee เท่านั้น

ระบบที่เกี่ยวข้อง
EBPP คือระบบ ERP ของ Allkons
Fee management ใช้คำนวนค่า Fee โดยมีข้อมูลทางบัญชี และการขายจาก EBPP
Payment Gateway
สำคัญ :
- การถอนค่า Comm ของ SP จะผ่าน Payment gateway ของ Allkons ค่าบริการ  5 บาท  ต่อ tx
- การเก็บค่า Fee มี 3 แบบ
- ต้องเรียกข้อมูล Orrder + Fee มาเพื่อคำนวณ Comm โดยขึ้นอยู่กับ View แต่ละประเภท เช่น SP เห็นของตัวเอง , SP leader เห็นของทั้งทีม / Allkons หียำพ admin เห็นทั้งหมด

แบบที่ 1. ใช้ Payment gateway สามารถให้ Seller เลือกได้ว่าจะรวมไปใน Order หรือ เรียกเก็บทีหลัง
แบบที่ 2. โอนชำระตรงที่ร้าน เรยกเก็บภายหลังแยกอย่างเดียว
แบบที่ 3. ใช้เป็น Store credit สามารถให้ Seller เลือกได้ว่าจะรวมไปใน Order หรือ เรียกเก็บทีหลัง
สำคัญ Trigger สำหรับการเริ่ม Loop เปลี่ยนจากเลขประมาณการค่า Comm เป็น Comm จริง คือ ออกใบจ่ายเงิน รอให้ร้านชำระค่า fee สำเร็จ

Flow ในการการคำนวณคร่าวๆ ช่วยแนะนำวิธีการสร้าง Flow ให้ถูกต้องตามที่ควรได้ ช่วยคิดเมนู และข้อมูลสำหรับ SP ในหน้า Comm เช่น สถานะดำเนินการควรมาจาก Step ไหนของ Flow การประมาณการชำระ ยอดที่สามารถถอนได้หรือยอดที่จะจ่าย comm รอบถัดไป ข้อมูลธุรกรรมในมุมของ Comm  ---------------------------------------------- 
1. เกิดการสั่งซื้อ (Order)
2. เกิดการจัดส่งสินค้า (Delivery) - 
3. เกิดการจัดส่งสำเร็จ (Delivered)
4. ระบบ Fee management ทำการ (calculate Fee) - completed 
———

5. Allkons เรียกเก็บค่า Fee (Collect fee) - completed
- ในรูปแบบเก็บตามหลังสำเร็จ
- ถ้ารวมใน Order ถือว่าสำเร็จทันที
6. ชำระค่า Comm  (การชำระค่าคอมขึ้นอยู่กับสถานะการ Collect fee ตรงนี้ส่งผลต่อการออกแบบ รูปแบบการถอน Comm และ Display order และ comm)

——

ต้องการบริหารยอดขายต้องทำยังไง
