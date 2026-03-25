import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SelectionCardGroup, SelectionCardItem } from '@/design-system';
import type { SelectionCardGroupProps, SelectionCardItemData } from '@/design-system';
import { Button } from '@/design-system';

// ─── Sample actions ───────────────────────────────────────────────────────────

const PrimaryAction = () => (
  <Button variant="secondary-neutral" size="md">Primary</Button>
);

const SmPrimaryAction = () => (
  <Button variant="secondary-neutral" size="sm">Primary</Button>
);

// ─── Sample data ──────────────────────────────────────────────────────────────

const BASE_ITEMS: Omit<SelectionCardItemData, 'current' | 'actions'>[] = [
  { value: 'item-1', heading: 'Heading text', supportingText: 'Supporting text', badge: 'Label' },
  { value: 'item-2', heading: 'Heading text', supportingText: 'Supporting text' },
  { value: 'item-3', heading: 'Heading text', supportingText: 'Supporting text' },
  { value: 'item-4', heading: 'Heading text', supportingText: 'Supporting text' },
];

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Components/SelectionCard',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**SelectionCard** — Allkons Design System

Sources:
- [Figma: Checkbox group item](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40002708-24079)
- [Figma: Checkbox group](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40002708-24873)

Same layout logic as **CardTable** — replaces the feature-icon box with a radio indicator.
\`current=true\` renders the item as selected (green circle + green border + light bg).

\`\`\`tsx
<SelectionCardGroup
  items={items}
  onItemClick={(value) => setSelected(value)}
/>
\`\`\`
        `.trim(),
      },
    },
  },
};

export default meta;

// ─── Item sizes ───────────────────────────────────────────────────────────────

export const ItemSizes: StoryObj = {
  name: 'Item — All Sizes',
  render: () => (
    <div className="flex flex-col gap-8 max-w-xl">

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Large</p>
        <SelectionCardItem size="lg" heading="Heading text" supportingText="Supporting text" badge="Label" actions={<Button variant="secondary-neutral" size="md">Primary</Button>} />
        <SelectionCardItem size="lg" heading="Heading text" supportingText="Supporting text" current actions={<Button variant="secondary-neutral" size="md">Primary</Button>} />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Medium</p>
        <SelectionCardItem size="md" heading="Heading text" supportingText="Supporting text" badge="Label" actions={<PrimaryAction />} />
        <SelectionCardItem size="md" heading="Heading text" supportingText="Supporting text" current actions={<PrimaryAction />} />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Small</p>
        <SelectionCardItem size="sm" heading="Heading text" supportingText="Supporting text" badge="Label" actions={<SmPrimaryAction />} />
        <SelectionCardItem size="sm" heading="Heading text" supportingText="Supporting text" current actions={<SmPrimaryAction />} />
      </div>

    </div>
  ),
};

// ─── Item states ──────────────────────────────────────────────────────────────

export const ItemStates: StoryObj = {
  name: 'Item — States',
  render: () => (
    <div className="flex flex-col gap-3 max-w-xl">
      <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Unchecked (default)</p>
      <SelectionCardItem heading="Heading text" supportingText="Supporting text" actions={<PrimaryAction />} />
      <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Checked (current)</p>
      <SelectionCardItem heading="Heading text" supportingText="Supporting text" badge="Label" current actions={<PrimaryAction />} />
      <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Disabled</p>
      <SelectionCardItem heading="Heading text" supportingText="Supporting text" disabled actions={<PrimaryAction />} />
      <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">No supporting text</p>
      <SelectionCardItem heading="Heading text" badge="Label" actions={<PrimaryAction />} />
      <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">No actions</p>
      <SelectionCardItem heading="Heading text" supportingText="Supporting text" />
    </div>
  ),
};

// ─── Desktop — interactive (radio / single-select) ────────────────────────────

export const DesktopRadio: StoryObj = {
  name: 'Desktop — Radio (single select)',
  render: () => {
    const [selected, setSelected] = useState('item-1');
    const items: SelectionCardItemData[] = BASE_ITEMS.map((item) => ({
      ...item,
      current: item.value === selected,
      actions: <PrimaryAction />,
    }));
    return (
      <div className="max-w-xl">
        <SelectionCardGroup
          items={items}
          breakpoint="desktop"
          onItemClick={setSelected}
        />
      </div>
    );
  },
};

// ─── Mobile — interactive (radio / single-select) ─────────────────────────────

export const MobileRadio: StoryObj = {
  name: 'Mobile — Radio (single select)',
  render: () => {
    const [selected, setSelected] = useState('item-1');
    const items: SelectionCardItemData[] = BASE_ITEMS.map((item) => ({
      ...item,
      current: item.value === selected,
      actions: <SmPrimaryAction />,
    }));
    return (
      <div className="w-[343px]">
        <SelectionCardGroup
          items={items}
          breakpoint="mobile"
          onItemClick={setSelected}
        />
      </div>
    );
  },
};

// ─── Desktop — interactive (checkbox / multi-select) ──────────────────────────

export const DesktopCheckbox: StoryObj = {
  name: 'Desktop — Checkbox (multi select)',
  render: () => {
    const [selected, setSelected] = useState<Set<string>>(new Set(['item-1']));
    const toggle = (value: string) =>
      setSelected((prev) => {
        const next = new Set(prev);
        next.has(value) ? next.delete(value) : next.add(value);
        return next;
      });
    const items: SelectionCardItemData[] = BASE_ITEMS.map((item) => ({
      ...item,
      current: selected.has(item.value),
      actions: <PrimaryAction />,
    }));
    return (
      <div className="max-w-xl">
        <SelectionCardGroup
          items={items}
          breakpoint="desktop"
          onItemClick={toggle}
        />
      </div>
    );
  },
};

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: StoryObj<SelectionCardGroupProps> = {
  name: 'Playground',
  args: {
    breakpoint: 'desktop',
  },
  argTypes: {
    breakpoint: { control: 'radio', options: ['desktop', 'mobile'] },
    size:       { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
  render: (args) => {
    const [selected, setSelected] = useState('item-1');
    const items: SelectionCardItemData[] = BASE_ITEMS.map((item) => ({
      ...item,
      current: item.value === selected,
      actions: args.breakpoint === 'mobile' ? <SmPrimaryAction /> : <PrimaryAction />,
    }));
    return (
      <div className="max-w-xl">
        <SelectionCardGroup
          {...args}
          items={items}
          onItemClick={setSelected}
        />
      </div>
    );
  },
};
