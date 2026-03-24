import type { Meta, StoryObj } from '@storybook/react';
import ToggleSwitch from '@/components/DataEntry/ToggleSwitch';

const meta: Meta<typeof ToggleSwitch> = {
  title: 'Example/ToggleSwitch',
  component: ToggleSwitch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'large'],
      description: 'Size of the toggle switch',
    },
    showLabel: {
      control: 'boolean',
      description: 'Whether to show ON/OFF labels',
    },
    color: {
      control: 'select',
      options: ['success', 'brand'],
      description: 'Color theme of the toggle switch',
    },
    isChecked: {
      control: 'boolean',
      description: 'Whether the toggle switch is checked',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether the toggle switch is disabled',
    },
    type: {
      control: 'select',
      options: ['default', 'text'],
      description: 'Type of toggle switch display',
    },
    title: {
      table: { disable: true },
    },
    supportingText: {
      table: { disable: true },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToggleSwitch>;

export const Default: Story = {
  args: {
    size: 'large',
    showLabel: true,
    color: 'success',
    isChecked: false,
    isDisabled: false,
    type: 'default',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    showLabel: true,
    color: 'success',
    isChecked: false,
    isDisabled: false,
    type: 'default',
  },
};

export const NoLabel: Story = {
  args: {
    size: 'large',
    showLabel: false,
    color: 'success',
    isChecked: false,
    isDisabled: false,
    type: 'default',
  },
};

export const BrandColor: Story = {
  args: {
    size: 'large',
    showLabel: true,
    color: 'brand',
    isChecked: true,
    isDisabled: false,
    type: 'default',
  },
};

export const Checked: Story = {
  args: {
    size: 'large',
    showLabel: true,
    color: 'success',
    isChecked: true,
    isDisabled: false,
    type: 'default',
  },
};

export const Disabled: Story = {
  args: {
    size: 'large',
    showLabel: true,
    color: 'success',
    isChecked: false,
    isDisabled: true,
    type: 'default',
  },
};

export const DisabledChecked: Story = {
  args: {
    size: 'large',
    showLabel: true,
    color: 'success',
    isChecked: true,
    isDisabled: true,
    type: 'default',
  },
};

export const WithText: Story = {
  args: {
    size: 'large',
    showLabel: true,
    color: 'success',
    isChecked: false,
    isDisabled: false,
    type: 'text',
    title: 'Remember me',
    supportingText: 'Save my login details for next time.',
  },
};

export const CompleteExample: Story = {
  args: {
    size: 'large',
    showLabel: true,
    color: 'brand',
    isChecked: true,
    isDisabled: false,
    type: 'text',
    title: 'Enable notifications',
    supportingText:
      'You will receive updates about new features and promotions.',
  },
};
