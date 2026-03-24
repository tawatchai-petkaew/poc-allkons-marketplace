import type { Meta, StoryObj } from '@storybook/react';
import Typography from '@/components/Typography';

const meta: Meta<typeof Typography> = {
  title: 'Example/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: { table: { disable: true } },
    style: { table: { disable: true } },
    onClick: { table: { disable: true } },
    href: { table: { disable: true } },
    target: { table: { disable: true } },
  },
  args: {
    children: 'test',
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Default: Story = {
  args: {
    variant: 'page-title',
    children: 'Typography',
  },
};
