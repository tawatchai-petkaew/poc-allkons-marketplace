import type { Preview } from '@storybook/nextjs-vite';
import React from 'react';
import { App, ConfigProvider } from 'antd';
import thTH from 'antd/locale/th_TH';
import { antdTheme } from '../src/design-system';
import '../src/app/globals.css';

const withDesignSystem = (Story: React.ComponentType) => (
  <ConfigProvider locale={thTH} theme={antdTheme}>
    <App>
      <Story />
    </App>
  </ConfigProvider>
);

const preview: Preview = {
  decorators: [withDesignSystem],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'white',
      values: [
        { name: 'white',     value: '#FFFFFF' },
        { name: 'secondary', value: '#F7F8F9' },
        { name: 'dark',      value: '#12151A' },
      ],
    },
    viewport: {
      viewports: {
        xs:  { name: 'XS (320px)',   styles: { width: '320px',  height: '900px' } },
        sm:  { name: 'SM (576px)',   styles: { width: '576px',  height: '900px' } },
        md:  { name: 'MD (768px)',   styles: { width: '768px',  height: '900px' } },
        lg:  { name: 'LG (1024px)', styles: { width: '1024px', height: '900px' } },
        xl:  { name: 'XL (1280px)', styles: { width: '1280px', height: '900px' } },
        xxl: { name: '2XL (1536px)', styles: { width: '1536px', height: '900px' } },
      },
    },
  },
};

export default preview;
