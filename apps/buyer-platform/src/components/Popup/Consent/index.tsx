import React, { useRef, useState, useEffect } from 'react';
import ResponsivePopup from '..';
import Button from '@/components/Button';
import Typography from '@/components/Typography';
import { getAllConsentMessages } from '@/common/api/customer-service/consent-message.api';
import { useQuery } from '@tanstack/react-query';
import { Grid } from 'antd';
import ToggleSwitch from '@/components/DataEntry/ToggleSwitch';
import Checkbox from '@/components/DataEntry/Checkbox';
import { Label } from '@/components/Label';
import { sanitizeHtml } from '@/lib/dom-purify';

type PopupConsentProps = {
  visible: boolean;
  onClose: () => void;
  onSubmitConsent?: (data: {
    acceptConsent: boolean;
    acceptMarketing: boolean;
    consents: any[];
  }) => void;
};

const PopupConsent: React.FC<PopupConsentProps> = ({
  visible,
  onClose,
  onSubmitConsent,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;
  const [showScrollButton, setShowScrollButton] = useState(true);
  const [acceptConsent, setAcceptConsent] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(true);

  const consentTypes = [
    'terms_of_service',
    'privacy_policy',
    'marketing_consent',
  ];
  const { data: dataConsent } = useQuery({
    queryKey: ['dataConsent'],
    queryFn: () => getAllConsentMessages(consentTypes),
    enabled: visible,
  });
  const consentList = (dataConsent?.data || []).sort(
    (a: any, b: any) => a.id - b.id
  );

  // Reset consent states when popup opens
  useEffect(() => {
    if (visible) {
      setAcceptConsent(false);
      setAcceptMarketing(true);
    }
  }, [visible]);

  // Scroll to top when popup opens
  useEffect(() => {
    if (visible && consentList.length > 0) {
      // Reset scroll position to top after content is loaded
      setShowScrollButton(true);

      // Multiple attempts to ensure scroll happens
      const scrollToTop = () => {
        // For desktop
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }

        // For mobile
        const drawerBody = document.querySelector(
          '.popup-consent-drawer-body'
        ) as HTMLDivElement | null;
        if (drawerBody) {
          drawerBody.scrollTop = 0;
        }
      };

      // Immediate attempt
      scrollToTop();

      // Delayed attempts to handle animation/rendering
      setTimeout(scrollToTop, 100);
      setTimeout(scrollToTop, 300);
      setTimeout(() => {
        scrollToTop();
        handleScroll(); // Re-check scroll state
      }, 500);
    }
  }, [visible, consentList.length]);

  const scrollToBottom = () => {
    if (isMobile) {
      setTimeout(() => {
        const drawerBody = document.querySelector(
          '.popup-consent-drawer-body'
        ) as HTMLDivElement | null;
        if (drawerBody) {
          // Scroll to absolute bottom with smooth behavior
          const maxScroll = drawerBody.scrollHeight;
          drawerBody.scrollTo({
            top: maxScroll,
            behavior: 'smooth',
          });

          // Check scroll state after a delay
          setTimeout(() => {
            handleScroll();
          }, 600);
        }
      }, 100);
    } else {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;

        // Scroll to absolute bottom with smooth behavior
        const maxScroll = container.scrollHeight;
        container.scrollTo({
          top: maxScroll,
          behavior: 'smooth',
        });

        // Check scroll state after a delay for smooth scroll to complete
        setTimeout(() => {
          handleScroll();
        }, 600);
      }
    }
  };

  const handleScroll = () => {
    let container;

    if (isMobile) {
      // For mobile, check the drawer body scroll
      container = document.querySelector(
        '.popup-consent-drawer-body'
      ) as HTMLElement;
    } else {
      // For desktop, use the scroll container ref
      container = scrollContainerRef.current;
    }

    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;

      // Check if content is scrollable
      const hasScroll = scrollHeight > clientHeight;

      // Calculate how far from bottom
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      // Check if user is at the bottom (with 10px threshold for more accurate detection)
      const isAtBottom = distanceFromBottom <= 10;

      const shouldShowButton = hasScroll && !isAtBottom;
      setShowScrollButton(shouldShowButton);
    }
  };

  useEffect(() => {
    let scrollContainer: HTMLElement | null = null;
    let timer: NodeJS.Timeout;
    let retryCount = 0;

    if (isMobile) {
      // For mobile, listen to drawer body scroll with retry mechanism
      const setupScrollListener = () => {
        scrollContainer = document.querySelector(
          '.popup-consent-drawer-body'
        ) as HTMLElement;

        if (scrollContainer) {
          scrollContainer.addEventListener('scroll', handleScroll, {
            passive: true,
          });
          handleScroll(); // Initial check
        } else if (retryCount < 5) {
          retryCount++;
          timer = setTimeout(setupScrollListener, 500 * retryCount);
        }
      };

      // Start setup with initial delay
      timer = setTimeout(setupScrollListener, 300);

      return () => {
        clearTimeout(timer);
        if (scrollContainer) {
          scrollContainer.removeEventListener('scroll', handleScroll);
        }
      };
    } else {
      // For desktop, use scroll container ref
      if (scrollContainerRef.current) {
        scrollContainer = scrollContainerRef.current;
        scrollContainer.addEventListener('scroll', handleScroll);

        timer = setTimeout(() => {
          handleScroll();
        }, 200);

        return () => {
          if (scrollContainer) {
            scrollContainer.removeEventListener('scroll', handleScroll);
          }
          clearTimeout(timer);
        };
      }
    }
  }, [consentList, isMobile, handleScroll]); // Re-run when content loads or screen changes
  console.log('consentList', consentList);
  return (
    <ResponsivePopup
      visible={visible}
      onClose={onClose}
      drawerTitle={
        <div className={`flex justify-end`}>
          <Button
            onClick={onClose}
            variant="outlined"
            className="!px-0"
            color="neutral"
          >
            <i className="ri-close-line"></i>
          </Button>
        </div>
      }
      modalProps={{
        width: 960,
        centered: true,
        maskClosable: false,
        zIndex: 2000, // Higher z-index to overlay other popups
      }}
      drawerProps={{
        height: '90%',
        // destroyOnClose: true,
        classNames: {
          body: 'popup-consent-drawer-body',
        },
        styles: { body: { padding: '12px' } },
        maskClosable: false,
        zIndex: 2000, // Higher z-index to overlay other popups
      }}
    >
      <div className="relative">
        <Typography variant="h4" className="!text-text-primary">
          เงื่อนไขการให้บริการ นโยบายความเป็นส่วนตัว และการตลาด
        </Typography>

        {showScrollButton && (
          <div className="fixed w-full inset-x-0 flex justify-center md:hidden bottom-[80px] z-10">
            <Button
              icon={<i className="ri-arrow-down-line"></i>}
              onClick={scrollToBottom}
            >
              เลื่อนลงข้างล่าง
            </Button>
          </div>
        )}
        <div
          ref={scrollContainerRef}
          className="relative flex flex-col max-h-auto md:max-h-[600px] overflow-y-auto"
        >
          {consentList.length > 0 &&
            consentList.map((consent: any) => (
              <div key={consent.type} className="mt-6 flex flex-col gap-4">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Typography variant="h4" className="!text-text-primary">
                      {consent?.type === 'terms_of_service'
                        ? 'เงื่อนไขการให้บริการ'
                        : consent?.type === 'privacy_policy'
                          ? 'นโยบายความเป็นส่วนตัว'
                          : consent?.type === 'marketing_consent'
                            ? 'นโยบายทางการตลาด'
                            : ''}
                    </Typography>
                    <Typography
                      variant="h4"
                      className="text-underline !text-primary underline cursor-pointer"
                      onClick={() => {
                        window.open(
                          consent?.type === 'terms_of_service'
                            ? '/consent/terms-of-service'
                            : consent?.type === 'privacy_policy'
                              ? '/consent/privacy-and-policy'
                              : consent?.type === 'marketing_consent'
                                ? '/consent/marketing'
                                : '#',
                          '_blank'
                        );
                      }}
                    >
                      อ่านเพิ่มเติม
                    </Typography>
                    <Label
                      text={`เวอร์ชัน ${consent?.version || ''}`}
                      rounding="pill"
                      variant="outlined"
                      color="neutral"
                    />
                  </div>
                  {consent.type === 'marketing_consent' && (
                    <ToggleSwitch
                      type="text"
                      isChecked={acceptMarketing}
                      showLabel={false}
                      onChange={(checked) => setAcceptMarketing(checked)}
                    />
                  )}
                </div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(consent.subject),
                  }}
                ></div>
                {consent?.content && (
                  <div
                    className="p-4 rounded-xl bg-background-secondary"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(consent.content),
                    }}
                  ></div>
                )}
              </div>
            ))}
          {showScrollButton && (
            <div
              className={`sticky inset-0 h-fit w-full hidden md:flex justify-center top-[550px]`}
            >
              <Button
                icon={<i className="ri-arrow-down-line"></i>}
                onClick={scrollToBottom}
              >
                เลื่อนลงข้างล่าง
              </Button>
            </div>
          )}
          <div className="flex mt-5 justify-between">
            <Checkbox
              label="เงื่อนไขการให้บริการ และนโยบายความเป็นส่วนตัว"
              checked={acceptConsent}
              onChange={(e) => setAcceptConsent(e.target.checked)}
            />
            <Button
              disabled={!acceptConsent}
              onClick={() => {
                onClose();
                onSubmitConsent?.({
                  acceptConsent,
                  acceptMarketing,
                  consents: consentList,
                });
              }}
            >
              ตกลง
            </Button>
          </div>
        </div>
      </div>
    </ResponsivePopup>
  );
};

export default PopupConsent;
