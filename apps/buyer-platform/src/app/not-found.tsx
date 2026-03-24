'use client';
import SectionIcon from '@/components/Sections/SectionIcon';
import Typography from '@/components/Typography';
import CustomButton from '@/components/Button';

export default function NotFound() {
  return (
    <div className="h-[60vh] w-full flex flex-col justify-center items-center">
      <SectionIcon iconClass="ri-information-fill" />
      <div className="flex flex-col gap-2 items-center">
        <Typography variant="h2">ไม่พบหน้าหรือข้อมูลที่คุณต้องการ</Typography>
        <Typography variant="paragraph-big" className="!text-text-quarternary">
          กรุณาตรวจสอบ URL หรือลองใหม่อีกครั้ง
        </Typography>
        <div className="flex gap-3 mt-[48px]">
          <CustomButton
            variant="outlined"
            color="neutral"
            icon={<i className="ri-arrow-left-line"></i>}
            iconPosition="start"
            onClick={() => window.history.back()}
          >
            ย้อนกลับ
          </CustomButton>
          <CustomButton
            variant="solid"
            color="primary"
            icon={<i className="ri-home-6-line"></i>}
            iconPosition="start"
            onClick={() => (window.location.href = '/')}
          >
            กลับหน้าหลัก
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
