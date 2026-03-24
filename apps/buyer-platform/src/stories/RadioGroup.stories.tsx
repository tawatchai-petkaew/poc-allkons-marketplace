import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import RadioGroup from '@/components/DataEntry/RadioGroup';

const meta: Meta<typeof RadioGroup> = {
  title: 'Example/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    rules: { table: { disable: true } },
    formItemProps: { table: { disable: true } },
    name: { table: { disable: true } },
    options: { table: { disable: true } },
    vertical: { table: { disable: true } },
    radioGroupProps: { table: { disable: true } },
    useRadioButton: { table: { disable: true } },
    validateStatus: { table: { disable: true } },
    help: { table: { disable: true } },
    block: { table: { disable: true } },
  },
  args: {
    label: 'Gender',
    vertical: true,
    rules: [{ required: true, message: 'Please select gender' }],
    options: [
      {
        label: (
          <div className="flex-col gap-1">
            <div>Male</div>
            <div className="text-gray">supported text</div>
          </div>
        ),
        value: 'male',
      },
      {
        label: (
          <div className="flex-col gap-1">
            <div>Female</div>
            <div className="text-gray">supported text</div>
          </div>
        ),
        value: 'female',
      },
      {
        label: (
          <div className="flex-col gap-1">
            <div>Other</div>
            <div className="text-gray">supported text</div>
          </div>
        ),
        value: 'other',
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('male');
    return (
      <RadioGroup
        {...args}
        vertical={true}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const Error: Story = {
  render: (args) => {
    return (
      <RadioGroup
        {...args}
        vertical={true}
        help="Enter a gender"
        validateStatus="error"
      />
    );
  },
};

export const NoSupportText: Story = {
  args: {
    label: 'Gender',
    vertical: true,
    rules: [{ required: true, message: 'Please select gender' }],
    options: [
      {
        label: (
          <div className="flex-col gap-1">
            <div>Male</div>
          </div>
        ),
        value: 'male',
      },
      {
        label: (
          <div className="flex-col gap-1">
            <div>Female</div>
          </div>
        ),
        value: 'female',
      },
      {
        label: (
          <div className="flex-col gap-1">
            <div>Other</div>
          </div>
        ),
        value: 'other',
      },
    ],
  },
};
