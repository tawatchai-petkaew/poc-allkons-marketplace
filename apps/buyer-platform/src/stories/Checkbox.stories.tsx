// Checkbox.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import Checkbox from '@/components/DataEntry/Checkbox';
import { useState } from 'react';

const meta: Meta<typeof Checkbox> = {
  title: 'Example/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    supportingText: { control: 'text' },
    disabled: { control: 'boolean' },
    checked: { control: 'boolean' },
    vertical: { table: { disable: true } },
    indeterminate: { table: { disable: true } },
    rules: { table: { disable: true } },
    defaultChecked: { table: { disable: true } },
    formItemProps: { table: { disable: true } },
    name: { table: { disable: true } },
    onChange: { table: { disable: true } },
  },
  args: {
    label: 'I agree to the terms',
    rules: [{ required: true, message: 'Please select gender' }],
    supportingText: 'make sure to do sth',
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<boolean>(false);
    return (
      <Checkbox
        {...args}
        checked={value}
        onChange={(e) => {
          setValue(e.target.checked);
        }}
      />
    );
  },
};
