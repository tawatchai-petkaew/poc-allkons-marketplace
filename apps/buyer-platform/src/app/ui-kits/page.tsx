'use client';

import { FC, useState } from 'react';
import Button from '@/components/Button';
import ErrorPopup from '@/components/Popup/Error';
import CustomButton from '@/components/Button';
import { Grid } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const uiKitsPage: FC = () => {
  const [isErrorVisible, setIsErrorVisible] = useState<boolean>(false);
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const t = useTranslations();
  const router = useRouter();
  const switchToLocale = (locale: string) => {
    Cookies.set('NEXT_LOCALE', locale, { expires: 365 });
    router.refresh();
  };
  return (
    <div className="container mx-auto py-8">
      <h1>{t('title')}</h1>
      <Button onClick={() => setIsErrorVisible(true)}>ERROR 400</Button>
      <Button onClick={() => switchToLocale('en')}>EN</Button>
      <Button onClick={() => switchToLocale('th')}>TH</Button>
      <ErrorPopup
        visible={isErrorVisible}
        onClose={() => {
          setIsErrorVisible(false);
        }}
        statusCode={400}
        buttonElement={
          <div className="mt-[2rem] flex flex-col gap-3 w-full md:flex-row md:justify-center">
            <CustomButton
              icon={<i className="ri-arrow-right-line"></i>}
              iconPosition="end"
              onClick={() => (window.location.href = '/')}
              className={isMobile ? '' : 'order-2'}
            >
              ไปยังหน้าหลัก
            </CustomButton>
            <CustomButton
              variant="outlined"
              color="neutral"
              icon={<i className="ri-refresh-line"></i>}
              iconPosition="end"
              onClick={() => window.location.reload()}
              className={isMobile ? '' : 'order-1'}
            >
              รีเฟรช
            </CustomButton>
          </div>
        }
      />
    </div>
  );
};

export default uiKitsPage;
