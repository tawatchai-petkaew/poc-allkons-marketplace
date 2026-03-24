import type { Meta, StoryObj } from '@storybook/react';
import TextField from '@/components/DataEntry/TextField';

const meta = {
  title: 'Example/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['small', 'middle', 'large'] },
    variant: { control: 'select', options: ['outlined', 'underlined'] },
    placeholder: { control: 'text' },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    allowClear: { control: 'boolean' },
    vertical: { control: 'boolean' },
    name: { table: { disable: true } },
    rules: { table: { disable: true } },
    formItemProps: { table: { disable: true } },
    prefix: { table: { disable: true } },
    suffix: { table: { disable: true } },
    className: { table: { disable: true } },
    validateStatus: { table: { disable: true } },
  },
  args: {
    label: 'Username',
    name: 'username',
    rules: [{ required: true, message: 'Please input your username!' }],
    placeholder: 'Enter your username',
    allowClear: true,
    size: 'large',
    vertical: true,
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'middle',
    placeholder: 'Enter text Name',
    disabled: false,
    allowClear: true,
    label: 'Name',
  },
};

export const WithIcon: Story = {
  args: {
    size: 'middle',
    prefix: <i className="ri-user-line"></i>,
    suffix: <i className="ri-user-line"></i>,
    disabled: false,
    allowClear: false,
  },
};

export const Error: Story = {
  args: {
    size: 'middle',
    prefix: <i className="ri-user-line"></i>,
    placeholder: 'Enter message',
    allowClear: false,
    help: 'Enter message',
    validateStatus: 'error',
  },
};
