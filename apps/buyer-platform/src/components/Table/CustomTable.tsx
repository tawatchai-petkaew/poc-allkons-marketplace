import { Pagination, Table, TableProps } from 'antd';
import React from 'react';
import { EmptyStateComponent } from '../EmptyState';
import Typography from '../Typography';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CustomTableProps<T = any> {
  columns?: TableProps<T>['columns'];
  items?: T[];
  dataSource?: T[];
  loading?: boolean;
  pagination?: {
    current?: number;
    pageSize?: number;
    total?: number;
    onChange?: (page: number, pageSize: number) => void;
    pageSizeOptions?: string[];
    showSizeChanger?: boolean;
  } | false;
  onChange?: TableProps<T>['onChange'];
  rowKey?: string | ((record: T) => string);
  onRow?: TableProps<T>['onRow'];
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  scroll?: TableProps<T>['scroll'];
  rowSelection?: TableProps<T>['rowSelection'];
  emptyText?: React.ReactNode;
  emptyStateHeight?: number;
  showSorterTooltip?: boolean;
  tableLayout?: 'auto' | 'fixed';
  sticky?: boolean | TableProps<T>['sticky'];
}

/**
 * CustomTable - A wrapper component for Ant Design Table with custom styling
 * Pagination is rendered separately at the bottom of the container
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTable = <T extends Record<string, any> = any>({
  columns = [],
  items,
  dataSource,
  loading = false,
  pagination,
  onChange,
  rowKey = 'id',
  onRow,
  size = 'middle',
  bordered = false,
  scroll,
  rowSelection,
  emptyText,
  emptyStateHeight,
  showSorterTooltip = true,
  tableLayout = 'auto',
  sticky,
  ...restProps
}: CustomTableProps<T>): React.ReactElement => {
  // Use items if provided, otherwise use dataSource
  const data = items || dataSource || [];

  // Default empty state
  const defaultEmptyText = <EmptyStateComponent descriptionNode={emptyText} height={emptyStateHeight} />;

  // Pagination config
  const paginationConfig = pagination !== false && pagination ? {
    current: pagination.current ?? 1,
    pageSize: pagination.pageSize ?? 10,
    total: pagination.total ?? 0,
    pageSizeOptions: pagination.pageSizeOptions ?? ['10', '20', '50', '100'],
    showSizeChanger: pagination.showSizeChanger ?? true,
    onChange: pagination.onChange,
  } : null;

  const showTotal = (total: number, range: [number, number]) =>
    total > 0
      ? `แสดง ${range[0]}-${range[1]} จาก ${total} รายการ`
      : '0-0 จาก 0 รายการ';

  // Add event listener to prevent typing in pagination input
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent | Event) => {
      const target = e.target as HTMLElement;
      if (
        target?.classList?.contains('ant-select-selection-search-input') &&
        target?.closest('.ant-pagination-options-size-changer')
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keypress', handleKeyDown, true);
    document.addEventListener('input', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keypress', handleKeyDown, true);
      document.removeEventListener('input', handleKeyDown, true);
    };
  }, []);

  return (
    <div className="custom-table-wrapper flex flex-col flex-1">
      {/* Table Section */}
      <div className={data.length === 0 ? 'flex-1 flex flex-col' : 'flex-shrink-0'}>
        <Table<T>
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          onChange={onChange}
          rowKey={rowKey}
          onRow={onRow}
          size={size}
          bordered={bordered}
          scroll={scroll}
          rowSelection={rowSelection}
          locale={{
            emptyText: defaultEmptyText,
          }}
          showSorterTooltip={showSorterTooltip}
          tableLayout={tableLayout}
          sticky={sticky}
          {...restProps}
          className="
              [&_.ant-table]:!bg-background-secondary
              [&_.ant-table]:!rounded-none
              [&_.ant-table-thead>tr>th]:!border-none
              [&_.ant-table-thead>tr>th]:!font-normal
              [&_.ant-table-thead>tr>th]:!bg-background-secondary
              [&_.ant-table-thead>tr>th::before]:!hidden
              [&_.ant-table-container]:!border-none
              [&_.ant-table-content]:!border-none
              [&_.ant-table-tbody>tr]:!border-none
              [&_td.ant-table-cell]:!bg-white
              [&_td.ant-table-cell]:!py-3
              [&_td.ant-table-cell]:!px-4
              [&_th.ant-table-cell]:!p-4
              [&_.ant-table-tbody_td]:!text-ellipsis
              [&_.ant-table-tbody_td]:!overflow-hidden
              [&_.ant-table-selection-column]:!overflow-visible
              [&_td.ant-table-selection-column]:!text-clip
              [&_th.ant-table-selection-column]:!overflow-visible
              [&_.ant-table-selection-column_.ant-checkbox-inner]:!w-5
              [&_.ant-table-selection-column_.ant-checkbox-inner]:!h-5
              [&_td.ant-table-cell-fix-left]:!bg-white
              [&_th.ant-table-cell-fix-left]:!bg-background-secondary
              [&_th.ant-table-cell-fix-left]:!z-[20]
              [&_td.ant-table-cell-fix-right]:!bg-white
              [&_th.ant-table-cell-fix-right]:!bg-background-secondary
              [&_th.ant-table-cell-fix-right]:!z-[20]
              [&_.ant-table-placeholder>td]:!border-none
          "
        />
      </div>

      {/* Pagination Section - pinned to bottom */}
      {paginationConfig && paginationConfig.total > 0 && (
        <div className="mt-auto flex flex-col lg:flex-row items-center justify-between gap-4 px-4 py-4 md:pb-0">
          <Typography variant="paragraph-medium" className="!text-text-secondary">
            {showTotal(paginationConfig.total, [
              Math.min((paginationConfig.current - 1) * paginationConfig.pageSize + 1, paginationConfig.total),
              Math.min(paginationConfig.current * paginationConfig.pageSize, paginationConfig.total),
            ])}
          </Typography>
          <Pagination
            current={paginationConfig.current}
            pageSize={paginationConfig.pageSize}
            total={paginationConfig.total}
            showSizeChanger={paginationConfig.showSizeChanger}
            pageSizeOptions={paginationConfig.pageSizeOptions}
            onChange={(page, pageSize) => {
              paginationConfig.onChange?.(page, pageSize);
            }}
            className="
              [&_.ant-pagination-item]:!min-w-[40px]
              [&_.ant-pagination-item]:!h-[40px]
              [&_.ant-pagination-item]:!leading-[38px]
              [&_.ant-pagination-item]:!border-neutral-30
              [&_.ant-pagination-item]:!rounded-lg
              [&_.ant-pagination-item-active]:!bg-primary
              [&_.ant-pagination-item-active]:!border-primary
              [&_.ant-pagination-item-active>a]:!text-white
              [&_.ant-pagination-prev]:!min-w-[40px]
              [&_.ant-pagination-prev]:!h-[40px]
              [&_.ant-pagination-prev]:!leading-[38px]
              [&_.ant-pagination-prev]:!border
              [&_.ant-pagination-prev]:!border-neutral-30
              [&_.ant-pagination-prev]:!rounded-lg
              [&_.ant-pagination-prev]:!mr-3
              [&_.ant-pagination-next]:!min-w-[40px]
              [&_.ant-pagination-next]:!h-[40px]
              [&_.ant-pagination-next]:!leading-[38px]
              [&_.ant-pagination-next]:!border-neutral-30
              [&_.ant-pagination-next]:!rounded-lg
              [&_.ant-pagination-next]:!border
              [&_.ant-pagination-next]:!ml-3
              [&_.ant-pagination-next]:!mr-0
              [&_.ant-pagination-options]:!h-[40px]
              [&_.ant-pagination-item]:!mx-[2px]
              [&_.ant-select-selector]:!h-[40px]
              [&_.ant-select-selector]:!p-2
              [&_.ant-select-selector]:!rounded-lg
              [&_.ant-select-selector]:!cursor-pointer
              [&_.ant-select-selection-item]:!leading-[38px]
              [&_.ant-select-selection-item]:!cursor-pointer
              [&_.ant-select-arrow]:!top-[20px]
              [&_.ant-pagination-options-size-changer_.ant-select-selector]:!outline-none
              [&_.ant-pagination-options-size-changer_.ant-select-selector]:focus:!shadow-none
              [&_.ant-pagination-options-size-changer_.ant-select-selector]:focus:!outline-none
              [&_.ant-select-item-option-selected]:!bg-transparent
              [&_.ant-select-item-option-selected:hover]:!bg-neutral-10
              [&_.ant-select-selection-search-input]:!cursor-pointer
              [&_.ant-select-selection-search-input]:!pointer-events-none
              [&_.ant-select-selection-search-input]:!caret-transparent
              [&_.ant-select-selection-search-input]:!opacity-0
              [&_.ant-select-selection-search-input]:!w-0
              [&_.ant-select-selection-search-input]:!h-0
              [&_.ant-select-selection-item]:!select-none
              [&_.ant-select-selector]:!select-none
              [&_.ant-select-suffix.anticon-search]:!hidden
            "
          />
        </div>
      )}
    </div>
  );
};

export default CustomTable;
