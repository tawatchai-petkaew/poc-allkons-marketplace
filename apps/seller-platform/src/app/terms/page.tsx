"use client";

import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import { sanitizeHtml } from "@/libs/dom-purify";
import { ConsentType } from "@/constants/enum/consent.enum";
import { getConsentMessage } from "@/api/consent.api";
import Typography from "@/components/Typography";
import BadgeLabel from "@/components/BadgeLabel";

const Terms: FC = () => {
  const { data: dataTerms } = useQuery({
    queryKey: ["terms", ConsentType.TERMS_OF_SERVICE],
    queryFn: () => getConsentMessage({ type: ConsentType.TERMS_OF_SERVICE }),
  });
  const consent = dataTerms?.data;

  return (
    <div className="mx-auto !mt-5 container">
      {consent && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Typography variant="h4" className="!text-text-primary">
                เงื่อนไขการให้บริการ
              </Typography>
              <BadgeLabel
                text={`เวอร์ชัน ${consent?.version || ""}`}
                rounding="pill"
                variant="outlined"
                color="neutral"
              />
            </div>
          </div>
          {consent?.subject && (
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(consent.subject),
              }}
            />
          )}
          {consent?.content && (
            <div
              className="rounded-xl bg-background-secondary"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(consent.content),
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Terms;
