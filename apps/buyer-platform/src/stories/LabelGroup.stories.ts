import { LabelGroup } from '@/components/Label';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof LabelGroup> = {
  title: 'Example/LabelGroup',
  component: LabelGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'warning',
        'primary',
        'gray',
        'success',
        'info',
        'white',
      ],
    },
    context: { table: { disable: true } },
    label: { table: { disable: true } },
  },
};

export default meta;

type Story = StoryObj<typeof LabelGroup>;

export const Default: Story = {
  args: {
    theme: 'default',
    context: 'Context',
    label: 'Label',
  },
};
export const Destructive: Story = {
  args: {
    theme: 'destructive',
    context: 'Context',
    label: 'Label',
  },
};
export const Warning: Story = {
  args: {
    theme: 'warning',
    context: 'Context',
    label: 'Label',
  },
};
export const Gray: Story = {
  args: {
    theme: 'gray',
    context: 'Context',
    label: 'Label',
  },
};
export const Info: Story = {
  args: {
    theme: 'info',
    context: 'Context',
    label: 'Label',
  },
};
export const Primary: Story = {
  args: {
    theme: 'primary',
    context: 'Context',
    label: 'Label',
  },
};
export const White: Story = {
  args: {
    theme: 'white',
    context: 'Context',
    label: 'Label',
  },
};
export const Success: Story = {
  args: {
    theme: 'success',
    context: 'Context',
    label: 'Label',
  },
};
