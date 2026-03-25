import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Pagination } from '@/design-system';
import type { PaginationProps, PaginationSize, PaginationVariant } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<PaginationProps> = {
  title: 'Design System/Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Pagination** — Allkons Design System

Sources:
- [Figma: PaginationNumberBase](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001706-32829)
- [Figma: CarouselArrow](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001706-32830)
- [Figma: Pagination](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001756-34415)

\`\`\`tsx
<Pagination
  page={currentPage}
  totalPages={20}
  totalItems={400}
  pageSize={20}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>

// Outline variant, medium size
<Pagination
  page={currentPage}
  totalPages={10}
  variant="outline"
  size="md"
  onPageChange={setPage}
/>
\`\`\`
        `.trim(),
      },
    },
  },
  argTypes: {
    variant:          { control: 'radio',   options: ['default', 'outline'] as PaginationVariant[] },
    size:             { control: 'radio',   options: ['sm', 'md'] as PaginationSize[] },
    page:             { control: { type: 'number', min: 1 } },
    totalPages:       { control: { type: 'number', min: 1 } },
    totalItems:       { control: 'number' },
    pageSize:         { control: { type: 'select' }, options: [10, 20, 50, 100] },
    showPageSize:     { control: 'boolean' },
    showPageSizeLabel:{ control: 'boolean' },
    showDivider:      { control: 'boolean' },
  },
  args: {
    page:              3,
    totalPages:        10,
    totalItems:        200,
    pageSize:          20,
    variant:           'default',
    size:              'sm',
    showPageSize:      true,
    showPageSizeLabel: false,
    showDivider:       true,
  },
};

export default meta;
type Story = StoryObj<PaginationProps>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  name: 'Playground',
  render: (args) => {
    const [page, setPage] = useState(args.page);
    const [pageSize, setPageSize] = useState(args.pageSize ?? 20);
    return (
      <Pagination
        {...args}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    );
  },
};

// ─── Variants ─────────────────────────────────────────────────────────────────

export const Variants: Story = {
  name: 'Variants',
  render: () => {
    const [pages, setPages] = useState({ default: 3, outline: 3 });

    return (
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: -24 }}>Variants</h2>

        {(['default', 'outline'] as PaginationVariant[]).map(variant => (
          <div key={variant}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              variant="{variant}"
            </p>
            <Pagination
              page={pages[variant]}
              totalPages={10}
              totalItems={200}
              pageSize={20}
              variant={variant}
              onPageChange={p => setPages(v => ({ ...v, [variant]: p }))}
            />
          </div>
        ))}
      </div>
    );
  },
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  name: 'Sizes',
  render: () => {
    const [pages, setPages] = useState({ sm: 3, md: 3 });

    return (
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: -24 }}>Sizes</h2>

        {(['sm', 'md'] as PaginationSize[]).map(size => (
          <div key={size}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              size="{size}" — {size === 'sm' ? '32px' : '40px'} buttons
            </p>
            {(['default', 'outline'] as PaginationVariant[]).map(variant => (
              <div key={variant} style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, color: '#9DA6B5', marginBottom: 12, fontFamily: 'monospace' }}>
                  variant="{variant}"
                </p>
                <Pagination
                  page={pages[size]}
                  totalPages={10}
                  totalItems={200}
                  pageSize={20}
                  size={size}
                  variant={variant}
                  onPageChange={p => setPages(v => ({ ...v, [size]: p }))}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

// ─── Page Counts ──────────────────────────────────────────────────────────────

export const PageCounts: Story = {
  name: 'Page Counts',
  render: () => {
    const configs = [
      { label: '1 page',        totalPages: 1,  totalItems: 15,   pageSize: 20  },
      { label: '< 5 pages',     totalPages: 4,  totalItems: 70,   pageSize: 20  },
      { label: '5–7 pages',     totalPages: 7,  totalItems: 130,  pageSize: 20  },
      { label: '10+ pages',     totalPages: 20, totalItems: 400,  pageSize: 20  },
      { label: '100+ pages',    totalPages: 100, totalItems: 2000, pageSize: 20 },
    ];
    const [pages, setPages] = useState<Record<string, number>>(
      Object.fromEntries(configs.map(c => [c.label, 1]))
    );

    return (
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: -16 }}>Page Counts</h2>
        <p style={{ color: '#7C889C', marginBottom: -16 }}>
          How the component adapts from 1 to 100+ pages
        </p>

        {configs.map(({ label, totalPages, totalItems, pageSize }) => (
          <div key={label}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 16 }}>
              {label} ({totalPages} total)
            </p>
            <Pagination
              page={pages[label]}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={p => setPages(v => ({ ...v, [label]: p }))}
            />
          </div>
        ))}
      </div>
    );
  },
};

// ─── Page Positions ───────────────────────────────────────────────────────────

export const PagePositions: Story = {
  name: 'Page Positions',
  render: () => (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: -8 }}>Page Positions</h2>
      <p style={{ color: '#7C889C', marginBottom: -8 }}>First · Middle · Last — prev/next disabled correctly</p>

      {[
        { label: 'First page  (prev disabled)', page: 1  },
        { label: 'Middle page (page 5 of 10)',  page: 5  },
        { label: 'Last page   (next disabled)', page: 10 },
      ].map(({ label, page }) => (
        <div key={label}>
          <p style={{ fontSize: 12, color: '#7C889C', marginBottom: 12 }}>{label}</p>
          <Pagination
            page={page}
            totalPages={10}
            totalItems={200}
            pageSize={20}
            onPageChange={() => {}}
          />
        </div>
      ))}
    </div>
  ),
};

// ─── Options ──────────────────────────────────────────────────────────────────

export const Options: Story = {
  name: 'Options',
  render: () => {
    const [page, setPage] = useState(3);
    const [pageSize, setPageSize] = useState(20);

    return (
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: -16 }}>Options</h2>

        {[
          { label: 'showDivider=false',              props: { showDivider: false } },
          { label: 'showPageSize=false',             props: { showPageSize: false } },
          { label: 'showPageSizeLabel=true',         props: { showPageSizeLabel: true } },
          { label: 'All options shown',              props: { showDivider: true, showPageSize: true, showPageSizeLabel: true } },
        ].map(({ label, props }) => (
          <div key={label}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 16 }}>
              {label}
            </p>
            <Pagination
              page={page}
              totalPages={10}
              totalItems={200}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              {...props}
            />
          </div>
        ))}
      </div>
    );
  },
};

// ─── Interactive ──────────────────────────────────────────────────────────────

export const Interactive: Story = {
  name: 'Interactive',
  render: () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const TOTAL_ITEMS = 237;
    const totalPages = Math.ceil(TOTAL_ITEMS / pageSize);

    const start = (page - 1) * pageSize + 1;
    const end   = Math.min(page * pageSize, TOTAL_ITEMS);

    // Mock table rows
    const rows = Array.from({ length: end - start + 1 }, (_, i) => ({
      id:     start + i,
      name:   `User ${start + i}`,
      email:  `user${start + i}@example.com`,
      status: (start + i) % 3 === 0 ? 'Inactive' : 'Active',
    }));

    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Interactive</h2>
        <p style={{ color: '#7C889C', marginBottom: 24 }}>
          {TOTAL_ITEMS} users — navigate pages and change page size
        </p>

        {/* Mock table */}
        <div style={{ border: '1px solid #DEE1E6', borderRadius: 12, overflow: 'hidden', marginBottom: 0 }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 80px', gap: 0, background: '#F7F8F9', borderBottom: '1px solid #DEE1E6' }}>
            {['#', 'Name', 'Email', 'Status'].map(h => (
              <div key={h} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#7C889C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={row.id}
              style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 1fr 80px',
                borderBottom: i < rows.length - 1 ? '1px solid #EFF0F3' : 'none',
                background: 'white',
              }}
            >
              <div style={{ padding: '12px 16px', fontSize: 14, color: '#9DA6B5' }}>{row.id}</div>
              <div style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500, color: '#12151A' }}>{row.name}</div>
              <div style={{ padding: '12px 16px', fontSize: 14, color: '#495569' }}>{row.email}</div>
              <div style={{ padding: '12px 16px' }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                  background: row.status === 'Active' ? '#E5F7EC' : '#F7F8F9',
                  color: row.status === 'Active' ? '#008C36' : '#7C889C',
                }}>
                  {row.status}
                </span>
              </div>
            </div>
          ))}

          {/* Pagination inside the card */}
          <div style={{ padding: '0 16px' }}>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={TOTAL_ITEMS}
              pageSize={pageSize}
              onPageChange={p => { setPage(p); }}
              onPageSizeChange={s => { setPageSize(s); setPage(1); }}
              showDivider
              showPageSizeLabel
            />
          </div>
        </div>
      </div>
    );
  },
};

// ─── All Variants ─────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: -16 }}>All Variants</h2>

      {(['default', 'outline'] as PaginationVariant[]).map(variant => (
        <div key={variant}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#37404F', marginBottom: 24 }}>
            variant="{variant}"
          </h3>
          {(['sm', 'md'] as PaginationSize[]).map(size => (
            <div key={size} style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#9DA6B5', marginBottom: 12 }}>
                size="{size}"
              </p>
              <Pagination
                page={5}
                totalPages={20}
                totalItems={400}
                pageSize={20}
                variant={variant}
                size={size}
                onPageChange={() => {}}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
