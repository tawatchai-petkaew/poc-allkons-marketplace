import type { Meta, StoryObj } from '@storybook/react';
import Button from '@/components/Button';

const meta: Meta<typeof Button> = {
  title: 'Example/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['small', 'middle', 'large'] },
    color: { control: 'select', options: ['primary', 'error', 'neutral'] },
    icon: { table: { disable: true } },
    onClick: { table: { disable: true } },
    htmlType: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  args: {
    color: 'primary',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    variant: 'outlined',
    children: 'Button',
    color: 'neutral',
  },
};

export const ButtonIcon: Story = {
  args: {
    icon: <i className="ri-user-line"></i>,
    color: 'primary',
  },
};

export const ButtonWithIcon: Story = {
  args: {
    icon: <i className="ri-user-line"></i>,
    color: 'primary',
    children: 'test',
    iconPosition: 'start',
  },
};
