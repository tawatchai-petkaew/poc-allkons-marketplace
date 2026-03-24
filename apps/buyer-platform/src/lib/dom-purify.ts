import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string): string => {
  try {
    return DOMPurify.sanitize(html || '', {
      ALLOW_DATA_ATTR: true,
      FORCE_BODY: true,
    });
  } catch {
    return html || '';
  }
};
