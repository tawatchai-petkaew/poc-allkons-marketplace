import { LabelStatus } from '@/components/Label';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof LabelStatus> = {
  title: 'Example/LabelStatus',
  component: LabelStatus,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: [
        'closed',
        'todo',
        'edit',
        'failed',
        'pending',
        'success',
        'canceled',
        'draft',
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof LabelStatus>;

export const Closed: Story = {
  args: {
    status: 'closed',
  },
};

export const Todo: Story = {
  args: {
    status: 'todo',
  },
};

export const Edit: Story = {
  args: {
    status: 'edit',
  },
};

export const Failed: Story = {
  args: {
    status: 'failed',
  },
};

export const Pending: Story = {
  args: {
    status: 'pending',
  },
};

export const Success: Story = {
  args: {
    status: 'success',
  },
};

export const Canceled: Story = {
  args: {
    status: 'canceled',
  },
};

export const Draft: Story = {
  args: {
    status: 'draft',
  },
};
