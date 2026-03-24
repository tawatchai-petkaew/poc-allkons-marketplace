"use client";

import { useQuery } from "@tanstack/react-query";
import { FC, useEffect, useRef } from "react";
import { sanitizeHtml } from "@/libs/dom-purify";
import { ConsentType } from "@/constants/enum/consent.enum";
import { getConsentMessage } from "@/api/consent.api";
import Typography from "@/components/Typography";
import BadgeLabel from "@/components/BadgeLabel";

const Privacy: FC = () => {
  const privacyRef = useRef<HTMLDivElement>(null);
  const marketingRef = useRef<HTMLDivElement>(null);
  const cookiesRef = useRef<HTMLDivElement>(null);

  const { data: dataPrivacy } = useQuery({
    queryKey: ["dataPrivacy", ConsentType.PRIVACY_POLICY],
    queryFn: () => getConsentMessage({ type: ConsentType.PRIVACY_POLICY }),
  });
  const { data: dataMarketing } = useQuery({
    queryKey: ["dataMarketing", ConsentType.MARKETING_CONSENT],
    queryFn: () => getConsentMessage({ type: ConsentType.MARKETING_CONSENT }),
  });
  const { data: dataCookies } = useQuery({
    queryKey: ["dataCookies", ConsentType.COOKIE_CONSENT],
    queryFn: () => getConsentMessage({ type: ConsentType.COOKIE_CONSENT }),
  });

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash;
        let targetRef: React.RefObject<HTMLDivElement | null> | null = null;

        switch (hash) {
          case "#privacy":
            targetRef = privacyRef;
            break;
          case "#marketing":
            targetRef = marketingRef;
            break;
          case "#cookies":
            targetRef = cookiesRef;
            break;
          default:
            return;
        }

        if (targetRef?.current) {
          targetRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    };

    const timer = setTimeout(handleScroll, 500);
    return () => clearTimeout(timer);
  }, [dataPrivacy, dataMarketing, dataCookies]);

  const consentPrivacy = dataPrivacy?.data;
  const consentMarketing = dataMarketing?.data;
  const consentCookies = dataCookies?.data;

  return (
    <div className="!mt-5 container mx-auto flex flex-col gap-4">
      {consentPrivacy && (
        <div ref={privacyRef} id="privacy" className="flex flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Typography variant="h4" className="!text-text-primary">
                นโยบายความเป็นส่วนตัว
              </Typography>
              <BadgeLabel
                text={`เวอร์ชัน ${consentPrivacy?.version || ""}`}
                rounding="pill"
                variant="outlined"
                color="neutral"
              />
            </div>
          </div>
          {consentPrivacy?.subject && (
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(consentPrivacy.subject),
              }}
            />
          )}
          {consentPrivacy?.content && (
            <div
              className="rounded-xl bg-background-secondary"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(consentPrivacy.content),
              }}
            />
          )}
        </div>
      )}
      {consentMarketing && (
        <div
          ref={marketingRef}
          id="marketing"
          className="flex flex-col gap-4"
          style={{ scrollMarginTop: "100px" }}
        >
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Typography variant="h4" className="!text-text-primary">
                นโยบายทางการตลาด
              </Typography>
              <BadgeLabel
                text={`เวอร์ชัน ${consentMarketing?.version || ""}`}
                rounding="pill"
                variant="outlined"
                color="neutral"
              />
            </div>
          </div>
          {consentMarketing?.subject && (
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(consentMarketing.subject),
              }}
            />
          )}
          {consentMarketing?.content && (
            <div
              className="rounded-xl bg-background-secondary"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(consentMarketing.content),
              }}
            />
          )}
        </div>
      )}
      {consentCookies && (
        <div ref={cookiesRef} id="cookies" className="flex flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Typography variant="h4" className="!text-text-primary">
                นโยบายคุกกี้
              </Typography>
              <BadgeLabel
                text={`เวอร์ชัน ${consentCookies?.version || ""}`}
                rounding="pill"
                variant="outlined"
                color="neutral"
              />
            </div>
          </div>
          {consentCookies?.subject && (
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(consentCookies.subject),
              }}
            />
          )}
          {consentCookies?.content && (
            <div
              className="rounded-xl bg-background-secondary"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(consentCookies.content),
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Privacy;
