import { Avatar } from 'antd';
import Typography from '../../Typography';
import { FC } from 'react';
import { useGlobalStore } from '@/store/global.store';
import {
  IOrganizationWithRoleDto,
  OrganizationType,
} from '@/common/interfaces/organization/user-with-org.response.interface';
import Checkbox from '../../DataEntry/Checkbox';
import { getFirstChar, resolvedRoleDisplayName } from '@/utils/format';
import { useRouter } from 'next/navigation';

type UserOrganizationMenuProps = {
  setIsOpenPopoverUserMode: (e: boolean) => void;
};

const UserOrganizationMenu: FC<UserOrganizationMenuProps> = ({
  setIsOpenPopoverUserMode,
}) => {
  const { organizations, currentOrganization, setCurrentOrganization } =
    useGlobalStore();

  const router = useRouter();

  const personalOrgs = organizations?.filter(
    (org) => org.organization.organizationType === OrganizationType.PERSONAL
  );
  const registeredIndividualOrgs = organizations?.filter(
    (org) =>
      org.organization.organizationType ===
      OrganizationType.REGISTERED_INDIVIDUAL
  );
  const juristicOrgs = organizations?.filter(
    (org) => org.organization.organizationType === OrganizationType.JURISTIC
  );

  const handleClickMenu = (callback: () => void) => {
    callback();
    setIsOpenPopoverUserMode(false);
  };

  const OrganizationItem = ({ org }: { org: IOrganizationWithRoleDto }) => {
    const isActive =
      org.organization.id === currentOrganization?.organization.id;

    return (
      <div
        className="flex flex-col gap-2"
        onClick={() => handleClickMenu(() => setCurrentOrganization(org))}
      >
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-background-tertiary cursor-pointer group transition-colors">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar
                size={32}
                className="!bg-primary-subtle"
                src={org.organization.imageUpload}
              >
                {!org.organization.imageUpload && (
                  <Typography
                    variant="paragraph-middle-medium"
                    className="!text-primary-dark"
                  >
                    {getFirstChar(org.organization.organizeName)}
                  </Typography>
                )}
              </Avatar>
              <div
                className={`absolute -bottom-1 -right-1 rounded-full w-4 h-4 flex items-center justify-center shadow-sm border border-white ${
                  org.organization.organizationType ===
                  OrganizationType.JURISTIC
                    ? 'bg-info'
                    : org.organization.organizationType ===
                        OrganizationType.REGISTERED_INDIVIDUAL
                      ? 'bg-warning'
                      : 'bg-primary'
                }`}
              >
                {org.organization.organizationType ===
                OrganizationType.JURISTIC ? (
                  <i className="ri-briefcase-line text-[8px] text-white"></i>
                ) : org.organization.organizationType ===
                  OrganizationType.REGISTERED_INDIVIDUAL ? (
                  <i className="ri-team-line text-[8px] text-white"></i>
                ) : (
                  <i className="ri-user-3-line text-[8px] text-white"></i>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <Typography
                variant="paragraph-extra-small-medium"
                className="!text-text-secondary"
              >
                {org.organization.organizeName}
              </Typography>
              <Typography
                variant="paragraph-extra-small"
                className="!text-text-quarternary"
              >
                {resolvedRoleDisplayName(org.role?.displayName || 'เจ้าของ')}
              </Typography>
            </div>
          </div>
          <Checkbox
            checked={isActive}
            variant="rounded"
            className="!m-0"
            size="large"
          />
        </div>
        {isActive && (
          <div className="px-2 pb-2">
            <div className="flex items-center justify-center gap-2 p-2 rounded-lg border border-border-secondary bg-none cursor-pointer hover:bg-background-primary transition-colors">
              <i className="ri-edit-line text-text-secondary"></i>
              <Typography
                variant="button-small"
                className="!text-text-secondary !font-semibold"
                onClick={() =>
                  handleClickMenu(() => {
                    router.push(`/organization/${org.organization.id}`);
                  })
                }
              >
                แก้ไขข้อมูลองค์กร
              </Typography>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col max-h-[600px]">
      <div className="p-2 pb-0">
        <Typography
          variant="paragraph-small"
          className="!text-text-secondary !font-medium px-2 pt-2"
        >
          เลือกองค์กรในการซื้อของ
        </Typography>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 custom-scrollbar">
        {personalOrgs && personalOrgs.length > 0 && (
          <div className="flex flex-col gap-2 p-2 bg-background-secondary rounded-2xl">
            <Typography
              variant="paragraph-extra-small"
              className="!text-text-quinary px-2 !font-normal"
            >
              บุคคลธรรมดา
            </Typography>
            {personalOrgs.map((org) => (
              <OrganizationItem key={org.organization.id} org={org} />
            ))}
          </div>
        )}

        {registeredIndividualOrgs && registeredIndividualOrgs.length > 0 && (
          <div className="flex flex-col gap-2 p-2 bg-background-secondary rounded-2xl">
            <Typography
              variant="paragraph-extra-small"
              className="!text-text-quinary px-2 !font-normal"
            >
              บุคคลธรรมดา จดทะเบียนพาณิชย์
            </Typography>
            {registeredIndividualOrgs.map((org) => (
              <OrganizationItem key={org.organization.id} org={org} />
            ))}
          </div>
        )}

        {juristicOrgs && juristicOrgs.length > 0 && (
          <div className="flex flex-col gap-2 p-2 bg-background-secondary rounded-2xl">
            <Typography
              variant="paragraph-extra-small"
              className="!text-text-quinary px-2 !font-normal"
            >
              นิติบุคคล
            </Typography>
            {juristicOrgs.map((org) => (
              <OrganizationItem key={org.organization.id} org={org} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 p-2 pt-2 border-t border-border-primary">
        <div
          className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-background-secondary cursor-pointer transition-colors"
          onClick={() =>
            handleClickMenu(() => router.push('/organization?create=true'))
          }
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <i className="ri-add-circle-line text-xl text-text-secondary"></i>
          </div>
          <Typography
            variant="paragraph-small"
            className="!text-text-secondary !font-medium"
          >
            เพิ่มองค์กรใหม่
          </Typography>
        </div>
        <div
          className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-background-secondary cursor-pointer transition-colors"
          onClick={() => handleClickMenu(() => router.push('/organization'))}
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <i className="ri-settings-3-line text-xl text-text-secondary"></i>
          </div>
          <Typography
            variant="paragraph-small"
            className="!text-text-secondary !font-medium"
          >
            จัดการองค์กรทั้งหมด
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default UserOrganizationMenu;
