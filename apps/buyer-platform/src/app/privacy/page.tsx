'use client';

import { getConsentMessage } from '@/common/api/customer-service/consent-message.api';
import { ConsentType } from '@/common/enum/consent-type.enum';
import { FloatButtons } from '@/components/FloatButtons';
import { sanitizeHtml } from '@/lib/dom-purify';
import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useRef } from 'react';

const Privacy: FC = () => {
  const privacyRef = useRef<HTMLDivElement>(null);
  const marketingRef = useRef<HTMLDivElement>(null);
  const cookiesRef = useRef<HTMLDivElement>(null);

  const { data: dataPrivacy } = useQuery({
    queryKey: ['dataPrivacy', ConsentType.PRIVACY_POLICY],
    queryFn: () => getConsentMessage({ type: ConsentType.PRIVACY_POLICY }),
  });
  const { data: dataMarketing } = useQuery({
    queryKey: ['dataMarketing', ConsentType.MARKETING_CONSENT],
    queryFn: () => getConsentMessage({ type: ConsentType.MARKETING_CONSENT }),
  });
  const { data: dataCookies } = useQuery({
    queryKey: ['dataCookies', ConsentType.COOKIE_CONSENT],
    queryFn: () => getConsentMessage({ type: ConsentType.COOKIE_CONSENT }),
  });

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        let targetRef: React.RefObject<HTMLDivElement | null> | null = null;

        switch (hash) {
          case '#privacy':
            targetRef = privacyRef;
            break;
          case '#marketing':
            targetRef = marketingRef;
            break;
          case '#cookies':
            targetRef = cookiesRef;
            break;
          default:
            return;
        }

        if (targetRef?.current) {
          targetRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
    };

    const timer = setTimeout(handleScroll, 500);
    return () => clearTimeout(timer);
  }, [dataPrivacy, dataMarketing, dataCookies]);

  const contentPrivacy = dataPrivacy?.data?.content || '';
  const contentMarketing = dataMarketing?.data?.content || '';
  const contentCookies = dataCookies?.data?.content || '';

  return (
    <div className="!mt-5 flex flex-col gap-4">
      <div
        ref={privacyRef}
        id="privacy"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentPrivacy) }}
      />
      <div
        ref={marketingRef}
        id="marketing"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentMarketing) }}
        style={{ scrollMarginTop: '100px' }}
      />
      <div
        ref={cookiesRef}
        id="cookies"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentCookies) }}
      />
      <FloatButtons />
    </div>
  );
};

export default Privacy;
