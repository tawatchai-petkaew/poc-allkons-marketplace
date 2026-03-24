import React from 'react';
import { Dropdown, Popover } from 'antd';
import type { MenuProps } from 'antd';
import Button from '@/components/Button';
import Typography from '@/components/Typography';
import {
  STATUS_MAP,
  getStatusConfig,
  getButtonConfig,
  isMatchingStatus,
} from '@/app/(auth)/products/matching/constants';
import type { IProductImportBatch } from '@/interfaces/product/import-product.response.interface';
import { formatDateTime } from '@/utils/format';

export const createProductMatchingColumns = (
  onActionClick: (record: IProductImportBatch, actionType: string) => void,
  getMenuItems: (record: IProductImportBatch) => {
    config: { key: string; label: string; icon: string; iconColor?: string };
    handler: (record: IProductImportBatch) => void;
    record: IProductImportBatch;
  }[]
) => {
  const STATIC_COLUMNS = [
    {
      title: 'ชื่อไฟล์',
      dataIndex: 'filename',
      key: 'filename',
      width: 330,
      render: (_: React.ReactNode, record: IProductImportBatch) => {
        const fileName = record.filename;
        return (
          <div className="flex items-center gap-2">
            <div className="w-14 h-14 rounded-md bg-[#e8f5e9] text-[#008c36] flex items-center justify-center">
              <i className="ri-file-excel-2-fill text-3xl"></i>
            </div>
            <Popover
              content={
                <div className="max-w-[265px]">
                  <Typography variant="paragraph-small" className="!text-text-secondary">
                    {fileName}
                  </Typography>
                </div>
              }
              trigger="click"
              placement="top"
            >
              <div className="cursor-pointer" style={{ maxWidth: '270px' }}>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-secondary line-clamp-2"
                >
                  {fileName}
                </Typography>
              </div>
            </Popover>
          </div>
        );
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 190,
      render: (_: React.ReactNode, record: IProductImportBatch) => {
        const config = getStatusConfig(record.status);

        return (
          <div
            className="inline-flex items-center justify-start gap-[6px] py-[1px] pr-[12px] pl-[8px] rounded-[100px] w-fit text-white"
            style={{ backgroundColor: config.bgColor }}
          >
            <i className={`${config.icon} text-[14px] text-inherit`}></i>
            <Typography variant="paragraph-small" className="!text-inherit">
              {config.text}
            </Typography>
          </div>
        );
      },
    },
    {
      title: 'จำนวนสินค้า',
      dataIndex: 'validationPassCount',
      key: 'validationPassCount',
      width: 120,
      render: (_: React.ReactNode, record: IProductImportBatch) => (
        <Typography variant="paragraph-small" className="!text-text-secondary">
          {record.validationPassCount || 0}
        </Typography>
      ),
    },
    {
      title: 'ผลลัพธ์',
      dataIndex: 'result',
      key: 'result',
      width: 180,
      render: (_: React.ReactNode, record: IProductImportBatch) => {
        if (isMatchingStatus(record.status)) {
          return (
            <Typography variant="paragraph-small" className="!text-[#828282] cursor-default">
              กำลังดำเนินการ
            </Typography>
          );
        }
        return (
          <div className="flex items-center gap-4">
            <Popover
              content={
                <div className="min-w-[150px]">
                  <Typography
                    variant="paragraph-small"
                    className="!mb-0"
                    style={{ color: '#4A4A4A' }}
                  >
                    สินค้านำเข้าแล้ว {record.importedCount || 0} รายการ
                  </Typography>
                </div>
              }
              trigger="click"
              placement="top"
              styles={{
                body: {
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '8px 12px',
                },
              }}
            >
              <div className="inline-flex items-center px-[10px] py-[2px] rounded-[18px] !bg-[#e8f8ee] border border-[#97dfaf] w-fit cursor-pointer">
                <i className="ri-checkbox-circle-line text-sm mr-2 !text-[#228839]"></i>
                <Typography variant="paragraph-small" className="!text-[#228839]">
                  {record.importedCount || 0}
                </Typography>
              </div>
            </Popover>

            <Popover
              content={
                <div className="min-w-[150px]">
                  <Typography
                    variant="paragraph-small"
                    className="!mb-0"
                    style={{ color: '#4A4A4A' }}
                  >
                    สินค้ายังไม่ได้นำเข้า {record.notImportedCount || 0} รายการ
                  </Typography>
                </div>
              }
              trigger="click"
              placement="top"
              overlayInnerStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '8px 12px',
              }}
            >
              <div className="inline-flex items-center px-[10px] py-[2px] rounded-[18px] !bg-[#fbe8e7] border border-[#f0a69f] w-fit cursor-pointer">
                <i className="ri-close-circle-line text-sm mr-2 !text-[#ae1a0c]"></i>
                <Typography variant="paragraph-small" className="!text-[#ae1a0c]">
                  {record.notImportedCount || 0}
                </Typography>
              </div>
            </Popover>
          </div>
        );
      },
    },
    {
      title: 'ผู้นำเข้า',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 200,
      render: (_: React.ReactNode, record: IProductImportBatch) => {
        const importDate = record.createdAt ? formatDateTime(record.createdAt) : '-';

        return (
          <div className="flex flex-col">
            <Typography variant="paragraph-small" className="!text-text-secondary">
              {record.createdBy || '-'}
            </Typography>
            <Typography
              variant="paragraph-extra-small"
              className="!text-text-quaternary !text-[#828282]"
            >
              {importDate}
            </Typography>
          </div>
        );
      },
    },
    {
      title: 'ผู้แก้ไขล่าสุด',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      width: 200,
      render: (_: React.ReactNode, record: IProductImportBatch) => {
        const lastModifiedDate = record.updatedAt ? formatDateTime(record.updatedAt) : '-';

        return (
          <div className="flex flex-col">
            <Typography variant="paragraph-small" className="!text-text-secondary">
              {record.updatedBy || '-'}
            </Typography>
            <Typography
              variant="paragraph-extra-small"
              className="!text-text-quaternary !text-[#828282]"
            >
              {lastModifiedDate}
            </Typography>
          </div>
        );
      },
    },
  ];

  const createActionColumn = () => ({
    title: '',
    key: 'action',
    width: 220,
    fixed: 'right' as const,
    render: (_: React.ReactNode, record: IProductImportBatch) => {
      const buttonConfig = getButtonConfig(record.status);
      const menuItemsData = getMenuItems(record);

      const menuItems: MenuProps['items'] = menuItemsData.map(
        ({ config, handler, record: itemRecord }) => ({
          key: config.key,
          label: (
            <div className="flex items-center justify-between w-full min-w-[180px] h-[30px]">
              <span>{config.label}</span>
              <i
                className={config.icon}
                style={config.iconColor ? { color: config.iconColor } : undefined}
              ></i>
            </div>
          ),
          onClick: () => handler?.(itemRecord),
        })
      );

      return (
        <div className="flex items-center gap-4">
          <Button
            size="middle"
            variant={buttonConfig.variant as 'solid' | 'outlined' | 'ghost' | 'link' | 'dashed'}
            color={buttonConfig.color as 'primary' | 'neutral' | 'error'}
            onClick={() => onActionClick?.(record, record.status)}
            className={`!w-[180px] justify-center ${
              buttonConfig.className === 'confirmImportBtn' ||
              buttonConfig.className === 'manageResultBtn'
                ? '!bg-[#00af43] !border-[#00af43] !text-white hover:!bg-[#008c36] hover:!border-[#008c36]'
                : buttonConfig.className === 'cancelMatchingBtn' ||
                    buttonConfig.className === 'deleteItemBtn'
                  ? '!bg-white !border-[#ef4444] !text-[#ef4444] hover:!bg-[#fbe8e7]'
                  : ''
            }`}
          >
            {buttonConfig.text}
          </Button>
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <i className="ri-more-2-fill text-2xl !text-text-secondary cursor-pointer hover:!text-[#00af43] hover:scale-110 transition-all duration-200"></i>
          </Dropdown>
        </div>
      );
    },
  });

  return [...STATIC_COLUMNS, createActionColumn()];
};
