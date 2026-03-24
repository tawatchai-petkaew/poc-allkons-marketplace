'use client';

import SectionIcon from '@/components/Sections/SectionIcon';
import Typography from '@/components/Typography';
import { useEffect } from 'react';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const errorMessage = [
    {
      code: '502',
      title: '502 Bad Gateway',
      message: 'ระบบไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
    },
    {
      code: '503',
      title: '503 Service Unavailable',
      message: 'ระบบไม่พร้อมใช้งานในขณะนี้ กรุณาลองใหม่อีกครั้งในภายหลัง',
    },
    {
      code: '504',
      title: '504 Gateway Timeout',
      message:
        'ไม่สามารถเชื่อมต่อกับระบบปลายทางได้ในเวลาที่กำหนด กรุณาลองใหม่อีกครั้งในภายหลัง',
    },
  ];

  return (
    <div className="h-[60vh] w-full flex flex-col justify-center items-center">
      <SectionIcon iconClass="ri-information-fill" />
      <div className="flex flex-col gap-2 items-center">
        <Typography variant="h2">
          {errorMessage.find((item) => item.code === error.digest)?.title ||
            'ระบบขัดข้อง'}
        </Typography>
        <Typography variant="paragraph-big" className="!text-text-quarternary">
          {errorMessage.find((item) => item.code === error.digest)?.message ||
            'กรุณาลองใหม่ภายหลัง'}
        </Typography>
      </div>
    </div>
  );
}
