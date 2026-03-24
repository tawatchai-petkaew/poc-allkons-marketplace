import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async ({ locale }) => {
  let finalLocale = locale;

  if (!finalLocale) {
    const cookieStore = await cookies();
    finalLocale = cookieStore.get('NEXT_LOCALE')?.value;
  }

  const resolvedLocale = finalLocale || 'th';

  return {
    locale: resolvedLocale,
    messages: (await import(`../locales/${resolvedLocale}.json`)).default,
  };
});
