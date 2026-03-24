// ไฟล์ app/layout.tsx ที่ถูกปรับใหม่สำหรับ App Router

import type { Metadata } from 'next';
import { Noto_Sans_Thai_Looped } from 'next/font/google';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

import './globals.css';

// import "antd/dist/reset.css";
import AcceptCookie from '@/components/AcceptCookie';
import AntdProvider from '@/components/AntdProvider'; // นำเข้า AntdProvider ที่เป็น Client Component
import Navbar from '@/components/Navbar';
import QueryProvider from '@/components/Providers/QueryProvider';
import GuestModeHandler from '@/components/GuestModeHandler';
import RouteGuard from '@/components/RouteGuard';
import LogoutSyncListener from '@/components/LogoutSyncListener';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import 'remixicon/fonts/remixicon.css';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import { App } from 'antd';

const notoSansThaiLooped = Noto_Sans_Thai_Looped({
  weight: ['300', '400', '500', '700'],
  subsets: ['thai'],
});

export const metadata: Metadata = {
  title: 'Allkons Marketplace',
  description: 'Change for growth by ALLKONS',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang="en">
      <NextIntlClientProvider locale={locale} messages={messages}>
        <QueryProvider>
          <body
            className={`${notoSansThaiLooped.className} antialiased relative`}
          >
            <AntdProvider>
              <LogoutSyncListener />
              <App>
                <RouteGuard>
                  <GuestModeHandler>
                    <Navbar />
                    <AcceptCookie />
                    {children}
                    {/* <Footer slug={slug} /> */}
                  </GuestModeHandler>
                </RouteGuard>
              </App>
            </AntdProvider>
          </body>
        </QueryProvider>
      </NextIntlClientProvider>
    </html>
  );
}
