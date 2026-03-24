'use client';

import { getConsentMessage } from '@/common/api/customer-service/consent-message.api';
import { ConsentType } from '@/common/enum/consent-type.enum';
import { FloatButtons } from '@/components/FloatButtons';
import { sanitizeHtml } from '@/lib/dom-purify';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

const Terms: FC = () => {
  const { data: dataTerms } = useQuery({
    queryKey: ['terms', ConsentType.TERMS_OF_SERVICE],
    queryFn: () => getConsentMessage({ type: ConsentType.TERMS_OF_SERVICE }),
  });
  const content = dataTerms?.data?.content || '';
  return (
    <div className="mx-auto !mt-5">
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
      <FloatButtons />
    </div>
  );
};

export default Terms;
