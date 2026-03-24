'use client';

import TextField from '@/components/DataEntry/TextField';
import Label from '@/components/BadgeLabel';
import Typography from '@/components/Typography';
import { Divider } from 'antd';
import AddRoleTable from './Table/AddRoleTable';
import CustomButton from '@/components/Button';

interface Props {
  checkedPermissionList: number[];
  setCheckedPermissionList: (
    value: number[] | ((prev: number[]) => number[])
  ) => void;
  setRoleDisplayName: (value: string) => void;
  roleDisplayName: string;
  action?: 'create' | 'view' | 'edit';
  roleId?: number;
  setIsAddingRole?: (value: boolean) => void;
  handleClose: () => void;
}

export default function AddRoleSection({
  checkedPermissionList,
  setCheckedPermissionList,
  setRoleDisplayName,
  roleDisplayName,
  action = 'create',
  handleClose,
}: Props) {
  const isViewMode = action === 'view';

  const getTitle = () => {
    switch (action) {
      case 'view':
        return 'ดูรายละเอียดบทบาท';
      case 'edit':
        return 'แก้ไขบทบาท';
      default:
        return 'เพิ่มบทบาทใหม่';
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <CustomButton
          variant="outlined"
          color="neutral"
          icon={<i className="ri-arrow-left-line"></i>}
          iconPosition="start"
          size="small"
          onClick={handleClose}
        />
        <Typography variant="h5" className="!text-text-secondary">
          {getTitle()}
        </Typography>
      </div>
      <Divider />
      <div className="flex flex-col gap-4 md:gap-0 md:flex-row">
        <div className="md:w-[35%]">
          <div className="flex items-center gap-2">
            <Typography
              variant="paragraph-medium"
              className="!text-text-secondary"
            >
              ข้อมูลบทบาท
            </Typography>
            <Label
              variant="ghost"
              color="success"
              text="กำหนดเอง"
              rounding="pill"
            />
          </div>
          <Typography
            variant="paragraph-medium"
            className="!text-text-quarternary"
          >
            แก้ไขข้อมูลบทบาท
          </Typography>
        </div>
        <div className="md:w-[65%]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary"
              >
                ชื่อบทบาท
              </Typography>
              <div className="text-red-500">*</div>
            </div>
            <TextField
              placeholder="กรอกชื่อบทบาท"
              onChange={(e) => setRoleDisplayName(e.target.value)}
              value={roleDisplayName}
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>
      <Divider />
      <div className="flex flex-col gap-4 md:gap-0 md:flex-row">
        <div className="md:w-[35%]">
          <div>
            <Typography
              variant="paragraph-medium"
              className="!text-text-secondary"
            >
              สิทธิ์การเข้าถึง และการจัดการ
            </Typography>
            <Typography
              variant="paragraph-medium"
              className="!text-text-quarternary"
            >
              แก้ไขสิทธิ์การเข้าถึง และการจัดการตามบทบาทสิทธิ์การเข้าถึง
              และการจัดการ
            </Typography>
          </div>
        </div>
        <div className="md:w-[65%]">
          <AddRoleTable
            checkedPermissionList={checkedPermissionList}
            setCheckedPermissionList={setCheckedPermissionList}
            action={action}
          />
        </div>
      </div>
    </div>
  );
}
