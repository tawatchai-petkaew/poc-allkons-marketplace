import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Dropdown } from '@/design-system';
import type { DropdownProps, DropdownType, DropdownOption } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Components/Dropdown',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Dropdown** — Allkons Design System

Sources:
- [Figma: Input Dropdown](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001604-8780)

\`\`\`tsx
<Dropdown
  type="default"
  label="Label"
  required
  hintText="This is a hint text to help user."
  placeholder="Select item"
  options={[
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
  ]}
  onChange={(value) => console.log(value)}
/>
\`\`\`
        `.trim(),
      },
    },
  },
};

export default meta;

// ─── Sample data ──────────────────────────────────────────────────────────────

const OPTIONS: DropdownOption[] = [
  { value: 'figma',    label: 'Figma',    supportingText: '@figma' },
  { value: 'sketch',   label: 'Sketch',   supportingText: '@sketch' },
  { value: 'framer',   label: 'Framer',   supportingText: '@framer' },
  { value: 'invision', label: 'InVision', supportingText: '@invision' },
  { value: 'zeplin',   label: 'Zeplin',   supportingText: '@zeplin' },
];

const OPTIONS_SIMPLE: DropdownOption[] = [
  { value: 'figma',    label: 'Figma' },
  { value: 'sketch',   label: 'Sketch' },
  { value: 'framer',   label: 'Framer' },
  { value: 'invision', label: 'InVision' },
  { value: 'zeplin',   label: 'Zeplin' },
];

const OPTIONS_ICON: DropdownOption[] = [
  { value: 'john',  label: 'John Doe',     supportingText: '@john',  itemType: 'icon-leading' },
  { value: 'jane',  label: 'Jane Smith',   supportingText: '@jane',  itemType: 'icon-leading' },
  { value: 'alice', label: 'Alice Johnson', supportingText: '@alice', itemType: 'icon-leading' },
];

const OPTIONS_DOT: DropdownOption[] = [
  { value: 'active',   label: 'Active',   supportingText: '@active',   itemType: 'dot-leading', dotColor: '#00AF43' },
  { value: 'pending',  label: 'Pending',  supportingText: '@pending',  itemType: 'dot-leading', dotColor: '#F59E0B' },
  { value: 'inactive', label: 'Inactive', supportingText: '@inactive', itemType: 'dot-leading', dotColor: '#9DA6B5' },
];

const OPTIONS_AVATAR: DropdownOption[] = [
  { value: 'john',  label: 'John Doe',      supportingText: '@john',  itemType: 'avatar-leading', avatar: { name: 'John Doe' } },
  { value: 'jane',  label: 'Jane Smith',    supportingText: '@jane',  itemType: 'avatar-leading', avatar: { name: 'Jane Smith' } },
  { value: 'alice', label: 'Alice Johnson', supportingText: '@alice', itemType: 'avatar-leading', avatar: { name: 'Alice Johnson' } },
];

const AVATAR = { name: 'John Doe', src: undefined };

// ─── All Types ────────────────────────────────────────────────────────────────

export const AllTypes: StoryObj = {
  name: 'All Types',
  render: () => (
    <div className="flex flex-col gap-8 max-w-sm">

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Default</p>
        <Dropdown
          type="default"
          label="Label"
          required
          showHelpIcon
          hintText="This is a hint text to help user."
          placeholder="Select item"
          options={OPTIONS_SIMPLE}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Search</p>
        <Dropdown
          type="search"
          label="Label"
          required
          showHelpIcon
          hintText="This is a hint text to help user."
          placeholder="Select item"
          options={OPTIONS}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Icon leading</p>
        <Dropdown
          type="icon-leading"
          label="Label"
          required
          showHelpIcon
          hintText="This is a hint text to help user."
          placeholder="Select item"
          options={OPTIONS_ICON}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Avatar leading</p>
        <Dropdown
          type="avatar-leading"
          label="Label"
          required
          showHelpIcon
          hintText="This is a hint text to help user."
          placeholder="Select item"
          avatar={AVATAR}
          options={OPTIONS_AVATAR}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Multi Select</p>
        <Dropdown
          type="multi-select"
          label="Label"
          required
          showHelpIcon
          hintText="This is a hint text to help user."
          placeholder="Select item"
          options={OPTIONS}
        />
      </div>

    </div>
  ),
};

// ─── Menu Item Types ──────────────────────────────────────────────────────────

export const MenuItemTypes: StoryObj = {
  name: 'Menu Item Types',
  render: () => (
    <div className="flex flex-col gap-8 max-w-sm">

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Default items</p>
        <Dropdown
          type="default"
          label="Label"
          hintText="This is a hint text to help user."
          placeholder="Select item"
          options={OPTIONS}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Icon leading items</p>
        <Dropdown
          type="icon-leading"
          label="Label"
          placeholder="Select item"
          options={OPTIONS_ICON}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Dot leading items</p>
        <Dropdown
          type="default"
          label="Status"
          placeholder="Select status"
          options={OPTIONS_DOT}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Avatar leading items</p>
        <Dropdown
          type="avatar-leading"
          label="Assigned to"
          placeholder="Select user"
          avatar={AVATAR}
          options={OPTIONS_AVATAR}
        />
      </div>

    </div>
  ),
};

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: StoryObj = {
  name: 'Default',
  render: () => (
    <div className="flex flex-col gap-6 max-w-sm">
      <Dropdown
        type="default"
        label="Label"
        required
        showHelpIcon
        hintText="This is a hint text to help user."
        placeholder="Select item"
        options={OPTIONS_SIMPLE}
      />
      <Dropdown
        type="default"
        label="Label (selected)"
        required
        placeholder="Select item"
        value="figma"
        options={OPTIONS_SIMPLE}
      />
      <Dropdown
        type="default"
        label="Label (disabled)"
        placeholder="Select item"
        disabled
        options={OPTIONS_SIMPLE}
      />
    </div>
  ),
};

// ─── Search ───────────────────────────────────────────────────────────────────

export const Search: StoryObj = {
  name: 'Search',
  render: () => (
    <div className="flex flex-col gap-6 max-w-sm">
      <Dropdown
        type="search"
        label="Label"
        required
        showHelpIcon
        hintText="This is a hint text to help user."
        placeholder="Select item"
        options={OPTIONS}
      />
      <Dropdown
        type="search"
        label="Label"
        required
        placeholder="Select item"
        value="sketch"
        options={OPTIONS}
      />
    </div>
  ),
};

// ─── Icon leading ─────────────────────────────────────────────────────────────

export const IconLeading: StoryObj = {
  name: 'Icon leading',
  render: () => (
    <div className="flex flex-col gap-6 max-w-sm">
      <Dropdown
        type="icon-leading"
        label="Label"
        required
        showHelpIcon
        hintText="This is a hint text to help user."
        placeholder="Select item"
        options={OPTIONS}
      />
      <Dropdown
        type="icon-leading"
        label="Label"
        value="framer"
        options={OPTIONS}
      />
    </div>
  ),
};

// ─── Avatar leading ───────────────────────────────────────────────────────────

export const AvatarLeading: StoryObj = {
  name: 'Avatar leading',
  render: () => (
    <div className="flex flex-col gap-6 max-w-sm">
      <Dropdown
        type="avatar-leading"
        label="Assigned to"
        required
        showHelpIcon
        hintText="This is a hint text to help user."
        placeholder="Select user"
        avatar={{ name: 'John Doe' }}
        options={[
          { value: 'john',  label: 'John Doe' },
          { value: 'jane',  label: 'Jane Smith' },
          { value: 'alice', label: 'Alice Johnson' },
        ]}
      />
      <Dropdown
        type="avatar-leading"
        label="Assigned to"
        placeholder="Select user"
        value="jane"
        avatar={{ name: 'Jane Smith' }}
        options={[
          { value: 'john',  label: 'John Doe' },
          { value: 'jane',  label: 'Jane Smith' },
          { value: 'alice', label: 'Alice Johnson' },
        ]}
      />
    </div>
  ),
};

// ─── Multi Select ─────────────────────────────────────────────────────────────

export const MultiSelect: StoryObj = {
  name: 'Multi Select',
  render: () => (
    <div className="flex flex-col gap-6 max-w-sm">
      <Dropdown
        type="multi-select"
        label="Label"
        required
        showHelpIcon
        hintText="This is a hint text to help user."
        placeholder="Select item"
        options={OPTIONS}
      />
      <Dropdown
        type="multi-select"
        label="Label"
        placeholder="Select items"
        defaultValues={['figma', 'framer']}
        options={OPTIONS}
      />
    </div>
  ),
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: StoryObj = {
  name: 'Disabled',
  render: () => (
    <div className="flex flex-col gap-6 max-w-sm">
      <Dropdown
        type="default"
        label="Disabled (empty)"
        placeholder="Select item"
        disabled
        options={OPTIONS_SIMPLE}
      />
      <Dropdown
        type="default"
        label="Disabled (selected)"
        value="figma"
        disabled
        options={OPTIONS_SIMPLE}
      />
      <Dropdown
        type="search"
        label="Disabled search"
        placeholder="Select item"
        disabled
        options={OPTIONS}
      />
    </div>
  ),
};

// ─── No label ─────────────────────────────────────────────────────────────────

export const NoLabel: StoryObj = {
  name: 'No label',
  render: () => (
    <div className="max-w-sm">
      <Dropdown
        type="default"
        placeholder="Select item"
        options={OPTIONS_SIMPLE}
      />
    </div>
  ),
};

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: StoryObj<DropdownProps> = {
  name: 'Playground',
  args: {
    type:        'default',
    label:       'Label',
    required:    true,
    showHelpIcon:true,
    hintText:    'This is a hint text to help user.',
    placeholder: 'Select item',
    disabled:    false,
    options:     OPTIONS,
  },
  argTypes: {
    type:     { control: 'radio', options: ['default', 'search', 'icon-leading', 'avatar-leading', 'multi-select'] as DropdownType[] },
    label:    { control: 'text' },
    required: { control: 'boolean' },
    showHelpIcon: { control: 'boolean' },
    hintText: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  render: (args) => (
    <div className="max-w-sm">
      <Dropdown {...args} />
    </div>
  ),
};
