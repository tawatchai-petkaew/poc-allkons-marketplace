'use client';

import { FC, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Typography from '../Typography';
import Button from '../Button';
import { Drawer, Grid } from 'antd';
import ToggleSwitch from '../DataEntry/ToggleSwitch';
import Image from 'next/image';

type AcceptCookieProps = {};

const COOKIE_NAME = '_acepata';

interface CookieSettings {
  necessary: boolean;
  functional: boolean;
  performance: boolean;
  marketing: boolean;
}

const AcceptCookie: FC<AcceptCookieProps> = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [cookieSettings, setCookieSettings] = useState<CookieSettings>({
    necessary: true,
    functional: true,
    performance: true,
    marketing: true,
  });

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  useEffect(() => {
    const consent = Cookies.get(COOKIE_NAME);
    if (!consent) {
      setShowBanner(true);
    } else {
      // Load existing cookie settings
      try {
        const settings = JSON.parse(consent);
        setCookieSettings(settings);
      } catch (error) {
        console.error('Error parsing cookie settings:', error);
        setShowBanner(true);
      }
    }
  }, []);

  const saveCookieSettings = (settings: CookieSettings) => {
    Cookies.set(COOKIE_NAME, JSON.stringify(settings), {
      expires: 180,
      path: '/',
    });
    setCookieSettings(settings);
    setShowBanner(false);
  };

  const handleAcceptAll = () => {
    const allAcceptedSettings = {
      necessary: true,
      functional: true,
      performance: true,
      marketing: true,
    };
    saveCookieSettings(allAcceptedSettings);
  };

  const handleRejectAll = () => {
    const onlyNecessarySettings = {
      necessary: true,
      functional: false,
      performance: false,
      marketing: false,
    };
    saveCookieSettings(onlyNecessarySettings);
  };

  const handleToggleChange = (cookieType: keyof CookieSettings) => {
    if (cookieType === 'necessary') return; // Cannot change necessary cookies

    setCookieSettings((prev) => ({
      ...prev,
      [cookieType]: !prev[cookieType],
    }));
  };

  const handleConfirmSettings = () => {
    saveCookieSettings(cookieSettings);
    setIsOpenDrawer(false);
  };

  const handleAcceptAllInDrawer = () => {
    const allAcceptedSettings = {
      necessary: true,
      functional: true,
      performance: true,
      marketing: true,
    };
    setCookieSettings(allAcceptedSettings);
    saveCookieSettings(allAcceptedSettings);
    setIsOpenDrawer(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {!isOpenDrawer && (
        <div className="fixed bottom-4 z-50 rounded-2xl w-full md:w-[90%] max-w-[1440px] p-4 bg-white left-1/2 transform -translate-x-1/2 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-[96px] h-[96px] md:w-[56px] md:h-[56px] rounded-full bg-background-secondary flex justify-center items-center">
              <Image
                src="assets/icons/cookies.svg"
                alt="cookies-icon"
                className="mx-auto"
                width={isMobile ? 64 : 32}
                height={isMobile ? 64 : 32}
              />
            </div>
            <div className="w-full md:w-[calc(100%_-_56px)] flex flex-col md:flex-row items-center gap-4">
              <div>
                <div className="mb-1">
                  <Typography
                    variant="h5"
                    className="!text-text-secondary font-bold text-center md:text-left"
                  >
                    เว็บไซต์นี้ใช้คุกกี้
                  </Typography>
                </div>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-tertiary text-center md:text-left"
                >
                  เพื่อเพิ่มประสบการณ์การใช้งานเว็บไซต์และการปรับปรุงประสบการณ์การใช้งานของคุณให้ดียิ่งขึ้นคุณเลือกที่จะให้ความยินยอมหรือไม่ก็ได้ในการเลือกจัดการความเป็นส่วนตัวของคุณได้เองโดยคลิกที่ปุ่มตั้งค่าและคุณสามารถอ่านและศึกษาเพื่อทำความเข้าใจเกี่ยวกับ
                  <span
                    className="underline mx-1 text-primary cursor-pointer"
                    onClick={() => window.open('/privacy#privacy', '_blank')}
                  >
                    นโยบายส่วนบุคคล
                  </span>
                  ของเราและ
                  <span
                    className="underline mx-1 text-primary cursor-pointer"
                    onClick={() => window.open('/privacy#cookies', '_blank')}
                  >
                    นโยบายการใช้คุกกี้
                  </span>
                </Typography>
              </div>
              <div className="w-full flex flex-col-reverse md:flex-row h-full justify-center items-center gap-3">
                <Button
                  variant="ghost"
                  bold="600"
                  color="neutral"
                  onClick={() => setIsOpenDrawer(true)}
                  icon={
                    <i className="ri-settings-2-line text-xl text-neutral-40"></i>
                  }
                  fullWidth={isMobile}
                >
                  การตั้งค่า
                </Button>
                <Button
                  variant="outlined"
                  bold="600"
                  color="neutral"
                  onClick={handleRejectAll}
                  fullWidth={isMobile}
                >
                  ไม่ยอมรับ
                </Button>
                <Button
                  bold="600"
                  onClick={handleAcceptAll}
                  fullWidth={isMobile}
                >
                  ยอมรับทั้งหมด
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Drawer
        open={isOpenDrawer}
        onClose={() => setIsOpenDrawer(false)}
        placement="left"
        closable={false}
        width={isMobile ? '100%' : 418}
        className="[&_.ant-drawer-body]:!py-8 [&_.ant-drawer-body]:!px-6"
      >
        <div className="relative pb-[60px]">
          <div className="absolute -top-4 flex justify-end w-full">
            <Button
              onClick={() => setIsOpenDrawer(false)}
              variant="outlined"
              className="absolute !right-0 !px-0"
              color="neutral"
              bold="400"
            >
              <i className="ri-close-line text-xl text-neutral-40"></i>
            </Button>
          </div>
          <div>
            <Typography variant="h4" className="font-bold !text-2xl">
              การตั้งค่าคุกกี้
            </Typography>
            <Typography
              variant="paragraph-medium"
              className="font-bold !text-text-tertiary"
            >
              ความยินยอมในการอำนวยความสะดวกและพัฒนาการใช้บริการ
            </Typography>
            <div className="mt-4">
              <Typography
                variant="paragraph-small"
                className="!text-text-tertiary whitespace-pre-line"
              >
                เพื่อให้คุณใช้งานได้สะดวกและตรงใจมากขึ้นเราอาจเก็บข้อมูลของ ท่าน
                และนำมาวิเคราะห์ และปรับปรุงบริการของเรา
                รวมไปถึงการอำนวยความสะดวกเพื่อให้ประสบการณ์ใช้งานที่รวดเร็วตอบสนองต่อความต้องการ
                และพึงพอใจของผู้ใช้ คุณยินยอมให้เก็บรวบรวม นำไปใช้
                และเปิดเผยข้อมูลของคุณเพื่อจุดประสงค์ที่กล่าวมาข้างต้น
              </Typography>
            </div>
          </div>
          <div className="flex flex-col gap-5 mt-5">
            <div className="p-4 bg-background-secondary rounded-xl">
              <div className="flex justify-between items-start">
                <Typography
                  variant="paragraph-medium"
                  className="!font-semibold !text-text-secondary"
                >
                  คุกกี้ประเภทจำเป็นถาวร
                </Typography>
                <div className="rounded-full gap-1 border border-success-p60 text-success-p20 bg-success-p90 text-xs flex py-[2px] pl-1 pr-2">
                  <i className="ri-checkbox-circle-fill"></i>
                  เปิดใช้งานตลอด
                </div>
              </div>
              <div className="mt-2">
                <Typography
                  variant="paragraph-small"
                  className="!text-text-tertiary"
                >
                  คุกกี้ประเภทนี้ช่วยให้ประสบการณ์การใช้งานบริการของท่าน
                  เป็นไปอย่างต่อเนื่อง เช่น การจดจำการเข้าสู่ระบบ
                  การจดจำข้อมูลที่ท่านให้ไว้บนเว็บไซต์และหรือแอปพลิเคชัน
                </Typography>
              </div>
            </div>
            <div className="p-4 bg-background-secondary rounded-xl">
              <div className="flex justify-between items-start">
                <Typography
                  variant="paragraph-medium"
                  className="!font-semibold !text-text-secondary w-3/4"
                >
                  คุกกี้ประเภทการทำงาน
                </Typography>
                <ToggleSwitch
                  isChecked={cookieSettings.performance}
                  showLabel={false}
                  onChange={() => handleToggleChange('performance')}
                />
              </div>
              <div className="mt-2">
                <Typography
                  variant="paragraph-small"
                  className="!text-text-tertiary "
                  // ellipsis
                  // ellipsisOptions={{
                  //   rows: 3,
                  //   expandable: "collapsible",
                  //   symbolNotExpanded: "อ่านต่อ",
                  //   symbolExpanded: "ย่อลง",
                  // }}
                >
                  คุกกี้ประเภทนี้จะช่วยอำนวยความสะดวกเมื่อท่านกลับเข้ามาใช้งานเว็บไซต์อีกครั้งโดยบริษัทจะใช้ข้อมูลเพื่อปรับแต่งเว็บไซต์ตามลักษณะการใช้งานของท่าน
                  <span
                    className="underline mx-1 text-primary cursor-pointer"
                    onClick={() => window.open('/privacy#cookies', '_blank')}
                  >
                    อ่านรายละเอียด
                  </span>
                </Typography>
              </div>
            </div>
            <div className="p-4 bg-background-secondary rounded-xl">
              <div className="flex justify-between items-start">
                <Typography
                  variant="paragraph-medium"
                  className="!font-semibold !text-text-secondary w-3/4"
                >
                  คุกกี้ประเภทการวิเคราะห์และวัดผลการทำงาน
                </Typography>
                <ToggleSwitch
                  isChecked={cookieSettings.functional}
                  showLabel={false}
                  onChange={() => handleToggleChange('functional')}
                />
              </div>
              <div className="mt-2">
                <Typography
                  variant="paragraph-small"
                  className="!text-text-tertiary"
                  // ellipsis
                  // ellipsisOptions={{
                  //   rows: 3,
                  //   expandable: "collapsible",
                  //   symbolNotExpanded: "อ่านต่อ",
                  //   symbolExpanded: "ย่อลง",
                  // }}
                >
                  คุกกี้ประเภทนี้ช่วยให้บริษัทสามารถวัดผลการทำงาน เช่น
                  ประมวลจำนวนหน้าที่ท่านเข้าใช้งานจำนวนลักษณะเฉพาะของกลุ่มผู้ใช้งานนั้นๆ
                  โดยข้อมูลดังกล่าวจะนำมาใช้ในการวิเคราะห์รูปแบบพฤติกรรมของผู้ใช้งาน
                  <span
                    className="underline mx-1 text-primary cursor-pointer"
                    onClick={() => window.open('/privacy#cookies', '_blank')}
                  >
                    อ่านรายละเอียด
                  </span>
                </Typography>
              </div>
            </div>
            <div className="p-4 bg-background-secondary rounded-xl">
              <div className="flex justify-between items-start">
                <Typography
                  variant="paragraph-medium"
                  className="!font-semibold !text-text-secondary w-3/4"
                >
                  คุกกี้เพื่อการโฆษณา
                </Typography>
                <ToggleSwitch
                  isChecked={cookieSettings.marketing}
                  showLabel={false}
                  onChange={() => handleToggleChange('marketing')}
                />
              </div>
              <div className="mt-2">
                <Typography
                  variant="paragraph-small"
                  className="!text-text-tertiary"
                  // ellipsis
                  // ellipsisOptions={{
                  //   rows: 3,
                  //   expandable: "collapsible",
                  //   symbolNotExpanded: "อ่านต่อ",
                  //   symbolExpanded: "ย่อลง",
                  // }}
                >
                  คุกกี้ประเภทนี้จะถูกบันทึกบนอุปกรณ์ของท่านเพื่อเก็บข้อมูลการเข้าใช้งานและ
                  ลิงก์ที่ท่านได้เยี่ยมชมและติดตาม
                  นอกจากนี้คุกกี้จากบุคคลที่สามอาจใช้ข้อมูลที่มีการส่งต่อข่าวสารในสื่อออนไลน์
                  และเนื้อหาที่จัดเก็บจากการให้บริการ
                  เพื่อเข้าใจความต้องการของผู้ใช้งานโดยมีวัตถุประสงค์ในการปรับแต่งเว็บไซต์
                  แคมเปญ โฆษณาให้เหมาะสมกับความสนใจของท่าน
                  <span
                    className="underline mx-1 text-primary cursor-pointer"
                    onClick={() => window.open('/privacy#cookies', '_blank')}
                  >
                    อ่านรายละเอียด
                  </span>
                </Typography>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 w-[calc(100%_-_48px)] gap-3 flex items-center justify-end h-[60px] bg-white">
          <Button
            bold="600"
            color="neutral"
            variant="outlined"
            fullWidth
            onClick={handleConfirmSettings}
          >
            ยืนยันการตั้งค่า
          </Button>
          <Button fullWidth bold="600" onClick={handleAcceptAllInDrawer}>
            ยอมรับทั้งหมด
          </Button>
        </div>
      </Drawer>
    </>
  );
};

export default AcceptCookie;
