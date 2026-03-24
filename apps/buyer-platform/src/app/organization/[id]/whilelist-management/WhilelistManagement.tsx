import { addPhoneWhitelist } from '@/common/api/customer-service/organization.api';
import Button from '@/components/Button';
import Typography from '@/components/Typography';
import { useNotification } from '@/hooks/notification.hook';
import { useTab } from '@/hooks/useTab';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsProps } from 'antd';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import AddPhoneWhitelistModal from './AddPhoneWhitelistModal';
import PhoneWhitelistInfo from './PhoneWhitelistInfo';

enum SubTabType {
  TEL = 'tel',
  REQUEST = 'request',
}

const WhitelistManagement = () => {
  const params = useParams();
  const { id: organizeId } = params as { id: string };
  const { notification } = useNotification();
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { activeTab, handleTabChange } = useTab<SubTabType>(
    'subTab',
    SubTabType.TEL,
    Object.values(SubTabType)
  );

  const handleSubmitPhoneNumbers = async (phoneNumbers: string[]) => {
    try {
      // Transform phone numbers to API payload format
      const payload = phoneNumbers.map((phone) => ({
        phoneNumber: phone.replace(/^0/, ''), // Remove leading 0
        countryCode: '66',
        isActive: false,
      }));

      await addPhoneWhitelist(payload);
      notification.success({
        message: 'สำเร็จ',
        description: 'เพิ่มเบอร์โทรศัพท์เรียบร้อยแล้ว',
      });
      queryClient.invalidateQueries({
        queryKey: ['getAllPhoneWhitelistByOrganization'],
      });
      setIsModalVisible(false);
    } catch (error: any) {
      notification.error({
        message: 'ลงทะเบียนไม่สำเร็จ',
        description:
          error?.response?.data?.message ||
          'ไม่สามารถบันทึกการเปลี่ยนแปลงได้ โปรดลองใหม่อีกครั้ง',
      });
    }
  };
  const tabItems: TabsProps['items'] = [
    {
      key: SubTabType.TEL,
      label: 'หมายเลขโทรศัพท์',
      children: <PhoneWhitelistInfo />,
    },
    {
      key: SubTabType.REQUEST,
      label: 'คำขออนุมัติ',
      children: (
        <div className="py-4">
          <Typography variant="paragraph-medium">รายการผู้ดูแลระบบ</Typography>
        </div>
      ),
    },
  ];
  return (
    <div className="w-full bg-white p-0 md:p-4 rounded-xl">
      <div className="mt-3 flex flex-col md:flex-row gap-2 justify-between items-start md:items-end">
        <div>
          <Typography variant="h5" className="!text-text-secondary">
            เบอร์โทรในนามองค์กร
          </Typography>
          <Typography
            variant="paragraph-medium"
            className="!text-text-secondary"
          >
            ลงทะเบียน และลบเบอร์โทรในนามองค์กร
          </Typography>
        </div>
        <Button
          icon={<i className="ri-add-line"></i>}
          onClick={() => setIsModalVisible(true)}
        >
          ลงทะเบียนเบอร์
        </Button>
      </div>
      <div className="mt-6">
        <Tabs
          defaultActiveKey={activeTab}
          items={tabItems}
          size="large"
          onChange={(e) => handleTabChange(e as SubTabType)}
        />
      </div>

      <AddPhoneWhitelistModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleSubmitPhoneNumbers}
        organizationId={Number(organizeId)}
      />
    </div>
  );
};

export default WhitelistManagement;
