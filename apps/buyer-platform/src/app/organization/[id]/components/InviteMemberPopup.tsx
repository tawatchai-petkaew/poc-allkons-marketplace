import {
  checkDuplicateEmail,
  createinviteUserToOrganization,
  validateInvitePhoneNumber,
} from '@/common/api/customer-service/organization.api';
import { getRoleList } from '@/common/api/customer-service/role.api';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { UserInviteStatus } from '@/common/enum/invitation.enum';
import { IRole } from '@/common/interfaces/role.interface';
import CustomButton from '@/components/Button';
import SelectField from '@/components/DataEntry/Select';
import TextField from '@/components/DataEntry/TextField';
import ToggleSwitch from '@/components/DataEntry/ToggleSwitch';
import ResponsivePopup from '@/components/Popup';
import Typography from '@/components/Typography';
import { useNotification } from '@/hooks/notification.hook';
import { PopupParams, PopupType } from '@/hooks/usePopup';
import { hashEmail, hashName, removeLeadingZero } from '@/utils/format';
import { validateEmail } from '@/utils/validate';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Divider, Form } from 'antd';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  showPopup: (type: PopupType, params: PopupParams) => void;
}

interface IInviteForm {
  tel: string;
  name: string;
  lastName: string;
  email: string;
  role: number;
  addInWhiteList: boolean;
}

export default function InviteMemberPopup({
  isVisible,
  onClose,
  showPopup,
}: Props) {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<IInviteForm>();
  const { notification } = useNotification();

  const [checkedPhoneNumber, setCheckedPhoneNumber] = useState<string | null>(
    null
  );
  const [warningList, setWarningList] = useState<
    { key: string; message: string[] }[]
  >([]);
  const [isDisableTextFields, setDisableTextFields] = useState({
    name: true,
    lastName: true,
    email: true,
    switch: true,
  });

  const [isHashed, setIsHashed] = useState({
    firstName: false,
    lastName: false,
    email: false,
  });
  const [, forceUpdate] = useState({});

  const [hasPrefillData, setHasPrefillData] = useState({
    firstName: false,
    lastName: false,
    email: false,
  });

  const {
    data: rolesQuery,
    error: errorRole,
    refetch: refetchRoles,
  } = useQuery({
    queryKey: ['roles-organize'],
    queryFn: () => getRoleList({ page: 1, pageLimit: 9999 }),
    enabled: isVisible,
  });

  const { mutate: validateEmailMutation, isPending: isCheckingEmail } =
    useMutation({
      mutationFn: async (email: string) => {
        const response = await checkDuplicateEmail(email);
        return { response, email };
      },
      onSuccess: (e) => {
        if (!e.response.data.exists) {
          return;
        } else {
          form.setFields([
            {
              name: 'email',
              errors: ['อีเมลนี้ถูกใช้งานแล้ว'],
            },
          ]);
        }
      },
    });

  const { mutate: validatePhoneNumber, isPending: isCheckingPhoneNumber } =
    useMutation({
      mutationFn: async (phoneNumber: string) => {
        const response = await validateInvitePhoneNumber(phoneNumber);
        return { response, phoneNumber };
      },
      onSuccess: (e) => {
        setWarningList([]);

        const phoneNumber = e.phoneNumber;
        const data = e.response;

        if (data?.data.isUserInMyOrg) {
          form.setFields([
            {
              name: 'tel',
              errors: ['เบอร์โทรศัพท์นี้เป็นสมาชิกในองค์กรของท่านแล้ว'],
            },
          ]);
          return;
        }

        const warningList = [];
        if (data?.data.isInMyOrgWhitelist) {
          warningList.push({
            key: 'isInMyOrgWhitelist',
            message: [
              'เบอร์โทรนี้ ถูกลงทะเบียนในนามองค์กรของท่านแล้ว ไม่สามารถเพิ่มเบอร์โทรในนามองค์กรได้',
            ],
          });
        }
        if (data?.data.isUserInOtherOrg) {
          warningList.push({
            key: 'isUserInOtherOrg',
            message: [
              'หมายเลขนี้มีองค์กรอื่นแล้ว ไม่สามารถลงทะเบียนเบอร์โทรในนามองค์กรได้',
              'การเชิญสมาชิกนี้ต้องถูกอนุมัติจากผู้มีอำนาจในองค์กรต้นสังกัด',
            ],
          });
        }
        if (data?.data.isInOtherWhitelist) {
          warningList.push({
            key: 'isInOtherWhitelist',
            message: ['หมายเลขนี้ถูกลงทะเบียนเบอร์โทรในนามองค์กรอื่นแล้ว'],
          });
        }

        if (data?.data.isInviting) {
          warningList.push({
            key: 'isInviting',
            message: [],
          });
        }

        setCheckedPhoneNumber(`0${phoneNumber}`);
        setWarningList(warningList);
        form.setFieldsValue({
          name: data?.data?.userInfo?.firstName || undefined,
          lastName: data?.data?.userInfo?.lastName || undefined,
          email: data?.data?.userInfo?.email || undefined,
          addInWhiteList: false,
        });
        setIsHashed({
          firstName: !!data?.data?.userInfo?.firstName,
          lastName: !!data?.data?.userInfo?.lastName,
          email: !!data?.data?.userInfo?.email,
        });
        setDisableTextFields({
          name: !!data?.data?.userInfo?.firstName,
          lastName: !!data?.data?.userInfo?.lastName,
          email: !!data?.data?.userInfo?.email,
          switch:
            warningList.filter(
              (w) => w.key !== UserInviteStatus.IS_INVITING_USER
            ).length > 0,
        });
        setHasPrefillData({
          firstName: !!data?.data?.userInfo?.firstName,
          lastName: !!data?.data?.userInfo?.lastName,
          email: !!data?.data?.userInfo?.email,
        });
      },
      onError: () => {
        notification.error({
          message: 'ระบบขัดข้อง',
          description: 'กรุณาลองใหม่ภายหลัง',
          icon: <i className="ri-information-line text-error" />,
        });
      },
    });

  const { mutate: createInvite, isPending: isCreatingInvitation } = useMutation(
    {
      mutationFn: async (payload: {
        email: string;
        firstName: string;
        lastName: string;
        countryCode: string;
        phoneNumber: string;
        roleId: number;
        addInWhiteList: boolean;
        confirmInvite?: boolean;
      }) => {
        return createinviteUserToOrganization(payload);
      },
      onSuccess: () => {
        form.resetFields();
        form.setFieldValue(
          'role',
          rolesQuery?.data?.roles?.find((role: IRole) => role.name === 'MEMBER')
            ?.id
        );
        setCheckedPhoneNumber(null);
        setWarningList([]);
        onClose();
        queryClient.refetchQueries({
          queryKey: ['organizationMembers', { page: 1, pageLimit: 10 }],
        });
        notification.success({
          message: 'ส่งคำเชิญสำเร็จ',
          description: 'ส่งคำเชิญเข้าร่วมองค์กรเรียบร้อย',
          icon: <i className="ri-information-line text-success" />,
        });
      },
      onError: (e: any) => {
        if (e?.response?.data?.error?.code === ErrorCode.INVITATION_PENDING) {
          showPopup('error', {
            title: 'ไม่สามารถส่งคำเชิญได้',
            description:
              'เบอร์โทรศัพท์นี้อยู่ระหว่างถูกเชิญ กรุณาลองใหม่ภายหลัง',
          });
          return;
        }
        if (e?.response?.data?.error?.code === ErrorCode.EMAIL_DUPLICATE) {
          form.setFields([
            {
              name: 'email',
              errors: ['อีเมลนี้ถูกใช้งานแล้ว'],
            },
          ]);
          return;
        }
        notification.error({
          message: 'ระบบขัดข้อง',
          description: 'กรุณาลองใหม่ภายหลัง',
        });
      },
    }
  );

  const handleClose = () => {
    form.resetFields();
    form.setFieldValue(
      'role',
      rolesQuery?.data?.roles?.find((role: IRole) => role.name === 'MEMBER')?.id
    );
    form.setFieldValue('addInWhiteList', false);
    setWarningList([]);
    setCheckedPhoneNumber(null);
    setDisableTextFields({
      name: true,
      lastName: true,
      email: true,
      switch: true,
    });
    onClose();
  };

  const isDisableCheckPhoneNumber =
    checkedPhoneNumber === Form.useWatch(['tel'], form);

  const allWarnings = warningList.map((warning) => warning.key);

  const resolveWarningMessage = () => {
    if (allWarnings.includes(UserInviteStatus.IS_INVITING_USER)) {
      return 'เบอร์โทรศัพท์นี้อยู่ระหว่างถูกเชิญ กรุณาลองใหม่ภายหลัง';
    } else if (allWarnings.includes(UserInviteStatus.IN_MY_ORG_WHITELIST)) {
      return 'เบอร์โทรศัพท์นี้ถูกลงทะเบียนในนามองค์กรท่านแล้ว ไม่สามารถเพิ่มเบอร์โทรในนามองค์กรได้';
    } else if (allWarnings.includes(UserInviteStatus.IN_OTHER_WHITELIST)) {
      return 'เบอร์โทรศัพท์นี้ถูกลงทะเบียนในนามองค์กรอื่นแล้ว ต้องการเชิญโดยไม่เพิ่มเป็นเบอร์โทรในนามองค์กรหรือไม่';
    } else if (allWarnings.includes(UserInviteStatus.USER_IN_OTHER_ORG)) {
      return 'เบอร์นี้อยู่ในองค์กรอื่น ต้องการเชิญบุคคลนี้หรือไม่';
    }
  };

  useEffect(() => {
    if (rolesQuery?.data?.roles) {
      const memberRole = rolesQuery?.data?.roles.find(
        (role: IRole) => role.name === 'MEMBER'
      );
      if (memberRole) {
        form.setFieldValue('role', memberRole.id);
      }
    }
  }, [rolesQuery?.data?.roles]);

  useEffect(() => {
    if (errorRole) {
      {
        showPopup('error', {
          title: 'เกิดข้อผิดพลาด',
          description: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
          showRetry: true,
          onRetry: () => {
            refetchRoles();
          },
        });
      }
    }
  }, [errorRole]);

  const toggleHash = (field: 'firstName' | 'lastName' | 'email') => {
    setIsHashed((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
    forceUpdate({});
  };

  const debouncedValidateEmail = useDebouncedCallback((email: string) => {
    validateEmailMutation(email);
  }, 300);

  return (
    <ResponsivePopup
      drawerProps={{ closable: true, maskClosable: true }}
      visible={isVisible}
      onClose={handleClose}
      modalProps={{ className: '!w-[calc(100vw-32px)] !max-w-[960px]' }}
      modalTitle={
        <div>
          <Typography variant="h4">เชิญสมาชิก</Typography>
          <Typography variant="paragraph-medium" className="text-text-tertiary">
            เชิญสมาชิกเข้าองค์กร และร้านค้า/สาขา
          </Typography>
        </div>
      }
      drawerTitle={
        <div>
          <Typography variant="h4">เชิญสมาชิก</Typography>
          <Typography variant="paragraph-medium" className="text-text-tertiary">
            เชิญสมาชิกเข้าองค์กร และร้านค้า/สาขา
          </Typography>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <div className="flex flex-col md:flex-row md:items-end md:gap-4 w-full h-auto">
          <div className="flex items-end gap-4 w-full md:max-w-[70%] md:mb-4 md:mt-6">
            <div className="w-full h-auto">
              <TextField
                label="เบอร์โทรศัพท์"
                required
                name="tel"
                rules={[
                  { required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' },
                  {
                    pattern: /^0[689]\d{8}$/,
                    message: 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง',
                  },
                ]}
                placeholder="กรอกเบอร์โทรศัพท์"
                type="text"
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^0-9]/g, '');
                  if (input.value.includes(' ')) {
                    input.value = input.value.replaceAll(' ', '');
                  }
                  if (input.value.length > 10) {
                    input.value = input.value.slice(0, 10);
                  }
                  e.currentTarget.value = input.value;
                }}
                onChange={(e) => {
                  form.setFieldValue('tel', e.target.value);
                }}
              />
            </div>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue, getFieldError }) => {
                return (
                  <CustomButton
                    icon={
                      isDisableCheckPhoneNumber ? (
                        <i className="ri-check-line"></i>
                      ) : null
                    }
                    disabled={isDisableCheckPhoneNumber}
                    variant="outlined"
                    className={`!mt-2 ${
                      getFieldError('tel').length > 0 ? '!mb-[22px]' : ''
                    }`}
                    loading={isCheckingPhoneNumber}
                    onClick={async () => {
                      await form.validateFields(['tel']);
                      validatePhoneNumber(
                        removeLeadingZero(getFieldValue('tel'))
                      );
                    }}
                  >
                    ตรวจสอบ
                  </CustomButton>
                );
              }}
            </Form.Item>
          </div>
          <Form.Item shouldUpdate noStyle>
            {({ getFieldError, getFieldValue }) => {
              return (
                <Form.Item
                  name="addInWhiteList"
                  initialValue={false}
                  className="!mb-0"
                >
                  <div
                    className={`flex items-center gap-3 my-6 ${
                      getFieldError('tel').length > 0 ? 'md:!pb-[22px]' : ''
                    }`}
                  >
                    <ToggleSwitch
                      isChecked={getFieldValue('addInWhiteList')}
                      showLabel={false}
                      isDisabled={isDisableTextFields.switch}
                      onChange={(e) => {
                        form.setFieldValue('addInWhiteList', e);
                      }}
                      title="เพิ่มเบอร์ในนามองค์กร"
                      type="text"
                    />
                  </div>
                </Form.Item>
              );
            }}
          </Form.Item>
        </div>
        {warningList.filter((w) => w.key !== UserInviteStatus.IS_INVITING_USER)
          .length > 0 && (
          <Alert
            type="warning"
            showIcon
            icon={
              <i className="ri-information-line text-xl text-warning mt-3"></i>
            }
            className="!p-4 !rounded-2xl "
            message={
              <Typography
                variant="paragraph-medium"
                className="!text-text-primary"
              >
                ไม่สามารถเพิ่มเบอร์โทรในนามองค์กร
              </Typography>
            }
            description={
              <ul className="list-disc ml-5">
                {warningList.map((warning) =>
                  warning.message.map((message, idx) => (
                    <li key={idx}>
                      <Typography
                        variant="paragraph-small"
                        className="!text-text-secondary"
                      >
                        {message}
                      </Typography>
                    </li>
                  ))
                )}
              </ul>
            }
          ></Alert>
        )}
        <Divider className="!mt-0 md:!mt-0 md:!mb-4" />
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <TextField
                label="ชื่อ"
                name="name"
                rules={[
                  { required: true, message: 'กรุณาระบุชื่อ' },
                  {
                    pattern: /^[a-zA-Zก-๙\s]+$/,
                    message: 'ไม่อนุญาตให้กรอกอักขระพิเศษและตัวเลข',
                  },
                  ,
                ]}
                disabled={isDisableTextFields.name}
                placeholder="กรอกชื่อ"
                required
                getValueProps={(value) => ({
                  value: isHashed.firstName && value ? hashName(value) : value,
                })}
                suffix={
                  hasPrefillData.firstName && (
                    <i
                      className={
                        isHashed.firstName
                          ? 'ri-eye-off-line cursor-pointer'
                          : 'ri-eye-line cursor-pointer'
                      }
                      onClick={() => toggleHash('firstName')}
                    />
                  )
                }
                onInput={(e) => {
                  let val = e.currentTarget.value;
                  if (val.includes(' ')) {
                    val = val.replaceAll(' ', '');
                  }
                  e.currentTarget.value = val;
                }}
                onChange={(e) => form.setFieldValue('name', e.target.value)}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <TextField
                label="นามสกุล"
                name="lastName"
                rules={[
                  { required: true, message: 'กรุณาระบุนามสกุล' },
                  {
                    pattern: /^[a-zA-Zก-๙\s]+$/,
                    message: 'ไม่อนุญาตให้กรอกอักขระพิเศษและตัวเลข',
                  },
                ]}
                disabled={isDisableTextFields.lastName}
                placeholder="กรอกนามสกุล"
                getValueProps={(value) => ({
                  value: isHashed.lastName && value ? hashName(value) : value,
                })}
                suffix={
                  hasPrefillData.lastName && (
                    <i
                      className={
                        isHashed.lastName
                          ? 'ri-eye-off-line cursor-pointer'
                          : 'ri-eye-line cursor-pointer'
                      }
                      onClick={() => toggleHash('lastName')}
                    />
                  )
                }
                onInput={(e) => {
                  let val = e.currentTarget.value;
                  if (val.includes(' ')) {
                    val = val.replaceAll(' ', '');
                  }
                  e.currentTarget.value = val;
                }}
                onChange={(e) => form.setFieldValue('lastName', e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <div>
                <TextField
                  required
                  label="อีเมล"
                  name="email"
                  rules={[
                    { required: true, message: 'กรุณากรอกอีเมล' },
                    {
                      type: 'email',
                      message: 'กรุณากรอกอีเมลที่ถูกต้อง',
                    },
                  ]}
                  disabled={isDisableTextFields.email || isCheckingEmail}
                  placeholder="กรอกอีเมล"
                  type="email"
                  getValueProps={(value) => ({
                    value: isHashed.email && value ? hashEmail(value) : value,
                  })}
                  suffix={
                    hasPrefillData.email && (
                      <i
                        className={
                          isHashed.email
                            ? 'ri-eye-off-line cursor-pointer'
                            : 'ri-eye-line cursor-pointer'
                        }
                        onClick={() => toggleHash('email')}
                      />
                    )
                  }
                  onInput={(e) => {
                    let val = e.currentTarget.value;
                    if (val.includes(' ')) {
                      val = val.replaceAll(' ', '');
                    }
                    e.currentTarget.value = val;

                    if (validateEmail(e.currentTarget.value)) {
                      debouncedValidateEmail(e.currentTarget.value);
                    }
                  }}
                  onChange={(e) => form.setFieldValue('email', e.target.value)}
                />
                {isCheckingEmail && (
                  <span className="text-error">กำลังตรวจสอบอีเมล...</span>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <SelectField
                label="บทบาทในองค์กร"
                defaultValue={
                  rolesQuery?.data?.roles?.find(
                    (role: IRole) => role.name === 'MEMBER'
                  )?.id
                }
                name="role"
                options={rolesQuery?.data?.roles
                  ?.filter((role: IRole) => role.name !== 'OWNER')
                  .map((role: IRole) => ({
                    label: role.displayName,
                    value: role.id,
                  }))}
                required
                onChange={(e) => form.setFieldValue('role', e)}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end mt-4">
          <CustomButton
            variant="outlined"
            color="neutral"
            onClick={handleClose}
          >
            ยกเลิก
          </CustomButton>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldsValue, getFieldsError }) => {
              const errors = getFieldsError();
              const values = getFieldsValue();
              const shouldDisableSubmit =
                checkedPhoneNumber !== values['tel'] ||
                Object.values(values).some(
                  (v) =>
                    v == undefined || v == null || v.toString().trim() === ''
                ) ||
                Object.values(errors).some((v) => v.errors.length > 0);
              return (
                <CustomButton
                  color="primary"
                  disabled={shouldDisableSubmit}
                  onClick={() => {
                    if (allWarnings.length === 0) {
                      createInvite({
                        countryCode: '66',
                        phoneNumber: removeLeadingZero(values['tel']),
                        addInWhiteList: values['addInWhiteList'],
                        firstName: values['name'],
                        lastName: values['lastName'],
                        email: values['email'],
                        roleId: values['role'],
                        confirmInvite: true,
                      });
                    } else {
                      showPopup(
                        allWarnings.includes(UserInviteStatus.IS_INVITING_USER)
                          ? 'error'
                          : 'warning',
                        {
                          title: allWarnings.includes(
                            UserInviteStatus.IS_INVITING_USER
                          )
                            ? 'ไม่สามารถส่งคำเชิญได้'
                            : 'ยืนยันส่งคำเชิญ?',
                          description: resolveWarningMessage(),
                          showCancel: !allWarnings.includes(
                            UserInviteStatus.IS_INVITING_USER
                          ),
                          showConfirm: !allWarnings.includes(
                            UserInviteStatus.IS_INVITING_USER
                          ),
                          okText: 'ยืนยันส่งคำเชิญ',
                          onOk: () => {
                            createInvite({
                              countryCode: '66',
                              phoneNumber: removeLeadingZero(values['tel']),
                              addInWhiteList: values['addInWhiteList'],
                              firstName: values['name'],
                              lastName: values['lastName'],
                              email: values['email'],
                              roleId: values['role'],
                              confirmInvite: true,
                            });
                          },
                          //   isLoading: isCreatingInvitation,
                        }
                      );
                    }
                  }}
                >
                  ส่งคำเชิญ
                </CustomButton>
              );
            }}
          </Form.Item>
        </div>
      </Form>
    </ResponsivePopup>
  );
}
