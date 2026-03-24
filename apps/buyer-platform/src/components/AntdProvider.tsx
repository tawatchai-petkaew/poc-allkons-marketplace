'use client';

import '@ant-design/v5-patch-for-react-19';
import React from 'react';
import { ConfigProvider } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import NotificationProvider from '@/context/notification.context';
import thTH from 'antd/locale/th_TH';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';

// Set up dayjs globally
dayjs.locale('th');
dayjs.extend(buddhistEra);

export default function AntdProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AntdRegistry>
      <ConfigProvider
        locale={thTH}
        theme={{
          token: {
            colorPrimary: '#00AF43',
            colorError: '#DA2110',
            screenSM: 640,
            screenSMMin: 640,
            screenSMMax: 767,
            screenMD: 768,
            screenMDMin: 768,
            screenMDMax: 1023,
            screenLG: 1024,
            screenLGMin: 1024,
            screenLGMax: 1279,
            screenXL: 1280,
            screenXLMin: 1280,
            screenXLMax: 1535,
            screenXXL: 1536,
            screenXXLMin: 1536,
          },
          components: {
            Input: {
              controlHeightLG: 48, // large
              controlHeight: 40, // middle
              controlHeightSM: 32, // small
            },
          },
        }}
      >
        <NotificationProvider>{children}</NotificationProvider>
      </ConfigProvider>
    </AntdRegistry>
  );
}
