import { IUser } from '@/common/interfaces/user.interface';
import { Avatar } from 'antd';
import Typography from '../../Typography';
import { FC } from 'react';

type UserProfileProps = {
  user: IUser | null;
};

const UserProfile: FC<UserProfileProps> = ({ user }) => {
  if (!user) return null;
  return (
    <div className="flex items-center gap-3 p-2 mb-2">
      <Avatar
        size={48}
        className="!bg-primary-subtle"
        src={user?.imageUpload}
        icon={<i className="ri-user-line text-primary-dark text-2xl"></i>}
      />
      <div className="flex flex-col overflow-hidden">
        <Typography
          variant="paragraph-small"
          className="!text-text-secondary !font-normal truncate"
        >
          {user?.name || 'ไม่พบข้อมูลผู้ใช้'}
        </Typography>
        <Typography
          variant="paragraph-small"
          className="!text-text-quinary truncate !font-normal"
        >
          {user?.email || '-'}
        </Typography>
      </div>
    </div>
  );
};

export default UserProfile;
