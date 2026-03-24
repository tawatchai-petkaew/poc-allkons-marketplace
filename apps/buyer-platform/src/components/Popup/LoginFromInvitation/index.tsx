// 'use client';

// import {
//   loginOtp,
//   loginWithUsername,
// } from '@/common/api/customer-service/auth.api';
// import {
//   checkRegister,
//   registerAccount,
//   RegisterAccountRequest,
//   registerOrganizationProfile,
//   RegisterOrganizationProfileRequest,
//   registerUserProfile,
//   RegisterUserProfileRequest,
//   sendToken,
//   verifyOtp,
// } from '@/common/api/customer-service/register.api';
// import { sendOrganizationConsentMessage } from '@/common/api/customer-service/user-consent.api';
// import { OrganizationTypes } from '@/common/enum/organization.enum';
// import FormLoginFromInvitation from '@/components/Form/LoginFromInvitation';
// import FormOtpFromInvitation from '@/components/Form/OtpFromInvitation';
// import FormUserInfo from '@/components/Form/UserInfo';
// import { useNotification } from '@/hooks/notification.hook';
// import { redirectToIntendedPath } from '@/utils/auth';
// import { removeLeadingZero } from '@/utils/format';
// import { useMutation } from '@tanstack/react-query';
// import { Form, Grid } from 'antd';
// import { AxiosError } from 'axios';
// import Cookies from 'js-cookie';
// import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
// import { usePathname, useSearchParams } from 'next/navigation';
// import React, { useEffect, useState } from 'react';
// import Button from '../../Button';
// import FormSetPassword from '../../Form/SetPassword';
// import { FormSetUserFields } from '../../Form/SetUser';
// import SectionIcon from '../../Sections/SectionIcon';
// import Typography from '../../Typography';
// import PopupConsent from '../Consent';
// import ErrorPopup from '../Error';
// import ResponsivePopup from '../index';
// import { RegisterCode } from '@/common/enum/register.enum';

// interface PopupLoginProps {
//   visible: boolean;
//   onClose: () => void;
//   refCode: string;
//   router: AppRouterInstance;
//   prefillPhoneNumber?: string | undefined;
//   onLogout: (e: boolean) => void;
//   setIsShowInvitationPopup: (e: boolean) => void;
// }

// export type PopupMode =
//   | 'login'
//   | 'register'
//   | 'otp'
//   | 'setPassword'
//   | 'setUser'
//   | 'errorMode'
//   | 'registerSuccess';

// const PopupLoginFromInvitation: React.FC<PopupLoginProps> = ({
//   visible,
//   onClose,
//   refCode,
//   router,
//   prefillPhoneNumber,
//   onLogout,
//   setIsShowInvitationPopup,
// }) => {
//   const [loading, setLoading] = useState<boolean>(false);
//   const [currentMode, setCurrentMode] = useState<PopupMode>('login');
//   const [isErrorVisible, setIsErrorVisible] = useState<boolean>(false);
//   const [statusCode, setStatusCode] = useState<number | null>(null);
//   const [telNumber, setTelNumber] = useState<string | null>(null);
//   const [otpData, setOtpData] = useState<{ token: string; refNo: string }>({
//     token: '',
//     refNo: '',
//   });
//   const [isSuccessResendOtp, setIsSuccessResendOtp] = useState<boolean>(false);
//   const [countdownTime, setCountdownTime] = useState<number>(0);
//   const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
//   const [loginMode, setLoginMode] = useState<boolean>(true);

//   const [isOpenConsent, setIsOpenConsent] = useState<boolean>(false);
//   const [createUserValue, setCreateUserValue] =
//     useState<FormSetUserFields | null>(null);
//   const [loginForm] = Form.useForm();
//   const [registerForm] = Form.useForm();
//   const [otpForm] = Form.useForm();
//   const [passwordForm] = Form.useForm();
//   const [userInfoForm] = Form.useForm();

//   const { notification } = useNotification();
//   const { useBreakpoint } = Grid;
//   const screen = useBreakpoint();
//   const isMobile = !screen.sm;
//   const isMode = (mode: PopupMode) => currentMode === mode;

//   const [isUserExist, setIsUserExist] = useState<boolean>(true);

//   const switchToMode = (mode: PopupMode) => {
//     setCurrentMode(mode);

//     if (mode !== 'errorMode') {
//       setIsCountdownActive(false);
//     }
//   };

//   const searchParams = useSearchParams();
//   const pathname = usePathname();

//   const params = new URLSearchParams(searchParams?.toString());

//   useEffect(() => {
//     let intervalId: NodeJS.Timeout;

//     if (isCountdownActive && countdownTime > 0) {
//       intervalId = setInterval(() => {
//         setCountdownTime((prevTime) => {
//           if (prevTime <= 1) {
//             setIsCountdownActive(false);
//             switchToMode('register');
//             return 0;
//           }
//           return prevTime - 1;
//         });
//       }, 1000);
//     }

//     return () => {
//       if (intervalId) {
//         clearInterval(intervalId);
//       }
//     };
//   }, [isCountdownActive, countdownTime]);

//   const {
//     mutateAsync: registerAccountMutation,
//     isPending: isRegisterAccountPending,
//   } = useMutation({
//     mutationFn: (payload: RegisterAccountRequest) => registerAccount(payload),
//     onError: () => {
//       notification.error({
//         message: 'ระบบขัดข้อง',
//         description: 'กรุณาลองใหม่ภายหลัง',
//       });
//     },
//   });

//   const {
//     mutateAsync: registerUserProfileMutation,
//     isPending: isRegisterUserProfilePending,
//   } = useMutation({
//     mutationFn: ({
//       payload,
//       token,
//     }: {
//       payload: RegisterUserProfileRequest;
//       token: string;
//     }) => registerUserProfile(payload, token),
//     onError: () => {
//       notification.error({
//         message: 'ระบบขัดข้อง',
//         description: 'กรุณาลองใหม่ภายหลัง',
//       });
//     },
//   });

//   const {
//     mutateAsync: loginWithUsernameMutation,
//     isPending: isLoginWithUsernamePending,
//   } = useMutation({
//     mutationFn: async (payload: {
//       username: string;
//       password: string;
//       skipRedirect?: boolean;
//     }) => {
//       const response = await loginWithUsername(payload);
//       return response;
//     },
//     onSuccess: (data, variables) => {
//       notification.success({
//         message: 'เข้าสู่ระบบสำเร็จ',
//       });
//       Cookies.set('auth', JSON.stringify(data?.data));
//       otpForm.resetFields();
//       passwordForm.resetFields();
//       userInfoForm.resetFields();
//       registerForm.resetFields();
//       loginForm.resetFields();
//       onClose();
//       if (!variables.skipRedirect) {
//         params.delete('refcode');
//         router.replace(`${pathname}?${params.toString()}`);
//       }
//     },
//     onError: () => {
//       notification.error({
//         message: 'ระบบขัดข้อง',
//         description: 'กรุณาลองใหม่ภายหลัง',
//       });
//     },
//   });

//   const formatCountdownTime = (seconds: number): string => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes.toString().padStart(2, '0')} : ${remainingSeconds
//       .toString()
//       .padStart(2, '0')}`;
//   };

//   const handleLogin = async (values: { phoneNumber: string }) => {
//     setLoading(true);
//     try {
//       const payload = {
//         phoneNumber: values.phoneNumber.startsWith('0')
//           ? values.phoneNumber.slice(1)
//           : values.phoneNumber,
//         countryCode: '66',
//       };
//       const { data, statusCode } = await checkRegister(payload);
//       if (statusCode === 200) {
//         setIsUserExist(
//           data?.code !== RegisterCode.CHECK_PHONE_DOES_NOT_EXISTS ? true : false
//         );
//         try {
//           const { data } = await sendToken(payload);
//           if (data.status === 'success') {
//             setTelNumber(values.phoneNumber);
//             setOtpData({
//               token: data?.token || '',
//               refNo: data?.refno || '',
//             });
//             switchToMode('otp');
//             setIsSuccessResendOtp(true);
//           }
//         } catch (error: any) {
//           if (error.response.data.data.blockUntil) {
//             const blockUntilTime = new Date(
//               error.response.data.data.blockUntil
//             ).getTime();
//             const currentTime = new Date().getTime();
//             const countdownSeconds = Math.max(
//               Math.floor((blockUntilTime - currentTime) / 1000),
//               0
//             );
//             setCountdownTime(countdownSeconds);
//             setIsCountdownActive(true);
//             switchToMode('errorMode');
//           } else {
//             const errorStatusCode =
//               (error as AxiosError).response?.status || 500;
//             setStatusCode(errorStatusCode);
//             setIsErrorVisible(true);
//           }
//         }
//       } else {
//         setStatusCode(statusCode);
//         setIsErrorVisible(true);
//       }
//     } catch (error) {
//       const errorStatusCode = (error as AxiosError).response?.status || 500;
//       setStatusCode(errorStatusCode);
//       setIsErrorVisible(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendOtp = async (values: { otp: string }): Promise<void> => {
//     if (loginMode && isUserExist) {
//       setLoading(true);
//       try {
//         const payload = {
//           countryCode: '66',
//           phoneNumber: telNumber?.startsWith('0')
//             ? telNumber.slice(1)
//             : telNumber || '',
//           pin: values.otp,
//           token: otpData.token,
//         };
//         const data = await loginOtp(payload);
//         if (data) {
//           notification.success({
//             message: 'เข้าสู่ระบบสำเร็จ',
//             duration: 3,
//             icon: <i className="ri-information-line text-primary"></i>,
//           });
//           Cookies.set('auth', JSON.stringify(data.data));
//           handleClose();
//           params.delete('refcode');
//           router.replace(`${pathname}?${params.toString()}`);
//         }
//       } catch (error: any) {
//         if (error.response.data.data) {
//           if (error.response.data.data?.remaining > 0) {
//             otpForm.setFields([
//               {
//                 name: 'otp',
//                 errors: [
//                   `OTP ไม่ถูกต้อง กรุณากรอกใหม่ (เหลือ ${error.response.data.data.remaining} ครั้ง)`,
//                 ],
//               },
//             ]);
//           } else if (error.response.data.data.status !== 'success') {
//             if (error.response.data.data.blockUntil) {
//               const blockUntilTime = new Date(
//                 error.response.data.data.blockUntil
//               ).getTime();
//               const currentTime = new Date().getTime();
//               const countdownSeconds = Math.max(
//                 Math.floor((blockUntilTime - currentTime) / 1000),
//                 0
//               );
//               setCountdownTime(countdownSeconds);
//               setIsCountdownActive(true);
//               switchToMode('errorMode');
//             } else {
//               const errorStatusCode =
//                 (error as AxiosError).response?.status || 500;
//               setStatusCode(errorStatusCode);
//               setIsErrorVisible(true);
//             }
//           }
//         }
//       } finally {
//         setLoading(false);
//         redirectToIntendedPath();
//       }
//     } else {
//       await handleSendOtpRegister(values);
//     }
//   };

//   const handleSendOtpRegister = async (values: { otp: string }) => {
//     setLoading(true);
//     try {
//       const payload = {
//         otp: values.otp,
//         token: otpData.token,
//         phoneNumber: telNumber?.startsWith('0')
//           ? telNumber.slice(1)
//           : telNumber || '',
//         countryCode: '66',
//       };
//       const { data } = await verifyOtp(payload);
//       if (data) {
//         if (data?.remaining > 0) {
//           otpForm.setFields([
//             {
//               name: 'otp',
//               errors: [
//                 `OTP ไม่ถูกต้อง กรุณากรอกใหม่ (เหลือ ${data.remaining} ครั้ง)`,
//               ],
//             },
//           ]);
//         } else if (data.status !== 'success') {
//           if (data.blockUntil) {
//             const blockUntilTime = new Date(data.blockUntil).getTime();
//             const currentTime = new Date().getTime();
//             const countdownSeconds = Math.max(
//               Math.floor((blockUntilTime - currentTime) / 1000),
//               0
//             );
//             setCountdownTime(countdownSeconds);
//             setIsCountdownActive(true);
//             switchToMode('errorMode');
//           } else {
//             setStatusCode(500);
//             setIsErrorVisible(true);
//           }
//         } else {
//           switchToMode('setPassword');
//           otpForm.resetFields();
//         }
//       }
//     } catch (error) {
//       const errorStatusCode = (error as AxiosError).response?.status || 500;
//       setStatusCode(errorStatusCode);
//       setIsErrorVisible(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resendOtp = async (): Promise<void> => {
//     setLoading(true);
//     setIsSuccessResendOtp(false);
//     try {
//       const payload = {
//         phoneNumber: telNumber?.startsWith('0')
//           ? telNumber.slice(1)
//           : telNumber || '',
//         countryCode: '66',
//       };
//       const { data } = await sendToken(payload);
//       if (!data.statusCode) {
//         setOtpData({
//           token: data?.token || '',
//           refNo: data?.refno || '',
//         });
//         setIsSuccessResendOtp(true);
//       } else {
//         setStatusCode(data?.statusCode);
//         setIsErrorVisible(true);
//         setIsSuccessResendOtp(false);
//       }
//     } catch (error) {
//       const errorStatusCode = (error as AxiosError).response?.status || 500;
//       setStatusCode(errorStatusCode);
//       setIsErrorVisible(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSetPassword = async (): Promise<void> => {
//     userInfoForm.setFieldValue('telNumber', telNumber);
//     switchToMode('setUser');
//   };

//   const handleCreateUserAndLogin = async ({
//     skipRedirect = false,
//   }: {
//     skipRedirect: boolean;
//   }) => {
//     const auth = Cookies.get('auth');
//     if (auth) {
//       onLogout(false);
//     }

//     const account = await registerAccountMutation({
//       phoneNumber: removeLeadingZero(userInfoForm.getFieldValue('telNumber')),
//       countryCode: '66',
//       password: passwordForm.getFieldValue('password'),
//     });

//     await registerUserProfileMutation({
//       payload: {
//         phoneNumber: removeLeadingZero(userInfoForm.getFieldValue('telNumber')),
//         countryCode: '66',
//         userInfo: {
//           firstName: userInfoForm.getFieldValue('firstName'),
//           lastName: userInfoForm.getFieldValue('lastName'),
//           email: userInfoForm.getFieldValue('email'),
//         },
//         platform: 'BUYER',
//       },
//       token: account.data?.accessToken,
//     });

//     await loginWithUsernameMutation({
//       username: removeLeadingZero(userInfoForm.getFieldValue('telNumber')),
//       password: passwordForm.getFieldValue('password'),
//       skipRedirect,
//     });

//     setIsShowInvitationPopup(true);
//   };

//   const handleSubmitConsent = async (
//     consentData: {
//       acceptConsent: boolean;
//       acceptMarketing: boolean;
//       consents: any[];
//     },
//     values: FormSetUserFields
//   ) => {
//     const consentIds = consentData.consents
//       .filter((consent) => {
//         if (
//           !consentData.acceptMarketing &&
//           consent.type === 'marketing_consent'
//         ) {
//           return false;
//         }
//         return true;
//       })
//       .map((consent) => consent.id);
//     const akIdConsentIds = consentData.consents
//       .filter((consent) => {
//         if (
//           !consentData.acceptMarketing &&
//           consent.type === 'marketing_consent'
//         ) {
//           return false;
//         }
//         return true;
//       })
//       .map((consent) => consent.akIdConsentId);
//     try {
//       setLoading(true);
//       const payload = {
//         phoneNumber: values.telNumber.startsWith('0')
//           ? values.telNumber.slice(1)
//           : values.telNumber || '',
//         countryCode: '66',
//         password: passwordForm.getFieldValue('password'),
//       };
//       const { data: dataRegisterAccount } = await registerAccount(payload);
//       if (dataRegisterAccount.isSuccess === 'SUCCESS') {
//         const accessToken = dataRegisterAccount?.accessToken || '';
//         const userProfilePayload = {
//           phoneNumber: dataRegisterAccount.phoneNumber,
//           countryCode: '66',
//           userInfo: {
//             firstName: values.firstName || '',
//             lastName: values.lastName || '',
//           },
//           platform: 'BUYER',
//         };
//         try {
//           const { data: dataUserProfile } = await registerUserProfile(
//             userProfilePayload,
//             accessToken
//           );
//           if (dataUserProfile?.cisNumber) {
//             try {
//               const payload: RegisterOrganizationProfileRequest = {
//                 countryCode: '66',
//                 phoneNumber: dataUserProfile.phoneNumber,
//                 orgType: values.accountType as OrganizationTypes,
//                 orgPersonalInfo:
//                   values.accountType === OrganizationTypes.PERSONAL
//                     ? {
//                         idCard: values.idCard,
//                         acceptTerms: values.consent ? true : false,
//                         businessType: [],
//                       }
//                     : undefined,
//                 orgIndividualInfo:
//                   values.accountType === OrganizationTypes.REGISTERED_INDIVIDUAL
//                     ? {
//                         registrationName: values.registrationName,
//                         businessType: [],
//                         registrationNumber: values.registrationNumber,
//                         acceptTerms: values.consent ? true : false,
//                       }
//                     : undefined,
//                 orgJuristicInfo:
//                   values.accountType === OrganizationTypes.JURISTIC
//                     ? {
//                         juristicName: values.juristicName,
//                         businessType: [],
//                         taxId: values.taxId,
//                         juristicType: values.juristicType as string,
//                         remarkTypeOther: values.remarkTypeOther,
//                         juristicTypeId: values.juristicTypeId,
//                         branchType: values.branchType as string,
//                         branchNumber: values.branchNumber,
//                         branchName: values.branchName,
//                         acceptTerms: values.consent ? true : false,
//                       }
//                     : undefined,
//               };
//               const response = await registerOrganizationProfile(
//                 payload,
//                 accessToken
//               );
//               if (response.statusCode === 201) {
//                 const organizationId =
//                   values.accountType === OrganizationTypes.REGISTERED_INDIVIDUAL
//                     ? response.data.organizations.find(
//                         (org: any) =>
//                           org.organization.registrationNumber ===
//                           values.registrationNumber
//                       )?.organizeId
//                     : values.accountType === OrganizationTypes.PERSONAL
//                     ? response.data.organizations.find(
//                         (org: any) => org.organization.idCard === values.idCard
//                       )?.organizeId
//                     : response.data.organizations.find(
//                         (org: any) => org.organization.taxId === values.taxId
//                       )?.organizeId;
//                 try {
//                   const consentPayload = {
//                     organizationId: organizationId as number,
//                     consentIds: consentIds as number[],
//                     ...(akIdConsentIds.length > 0 &&
//                       akIdConsentIds.every((id) => typeof id === 'string') && {
//                         akIdConsentIds: akIdConsentIds as string[],
//                         tokenAllkonsId:
//                           dataRegisterAccount?.akidAccessToken as string,
//                       }),
//                   };
//                   const { data: dataConsent } =
//                     await sendOrganizationConsentMessage(consentPayload);
//                   if (dataConsent?.status === 'success') {
//                     setTelNumber(null);
//                     otpForm.resetFields();
//                     passwordForm.resetFields();
//                     userInfoForm.resetFields();
//                     registerForm.resetFields();
//                     loginForm.resetFields();
//                     switchToMode('registerSuccess');
//                   }
//                 } catch (error) {
//                   const errorStatusCode =
//                     (error as AxiosError).response?.status || 500;
//                   setStatusCode(errorStatusCode);
//                   setIsErrorVisible(true);
//                 }
//               }
//             } catch (error) {
//               const errorStatusCode =
//                 (error as AxiosError).response?.status || 500;
//               setStatusCode(errorStatusCode);
//               setIsErrorVisible(true);
//             }
//           }
//         } catch (error) {
//           const errorStatusCode = (error as AxiosError).response?.status || 500;
//           setStatusCode(errorStatusCode);
//           setIsErrorVisible(true);
//         }
//       }
//     } catch (error) {
//       const errorStatusCode = (error as AxiosError).response?.status || 500;
//       setStatusCode(errorStatusCode);
//       setIsErrorVisible(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSwitchToLogin = (): void => {
//     setLoginMode(true);
//     setIsSuccessResendOtp(false);
//     switchToMode('login');
//   };

//   const handleClose = (): void => {
//     switchToMode('login');
//     setIsCountdownActive(false); // Stop countdown when closing
//     onClose();
//   };

//   // Get back button navigation logic
//   const getBackNavigation = () => {
//     switch (currentMode) {
//       case 'otp':
//         return () => {
//           if (loginMode) {
//             switchToMode('login');
//           } else {
//             switchToMode('register');
//           }
//           setIsSuccessResendOtp(false);
//           setCountdownTime(0);
//           otpForm.resetFields();
//         };
//       case 'setPassword':
//         return () => {
//           switchToMode('register');
//           passwordForm.resetFields();
//         };
//       case 'setUser':
//         return () => switchToMode('setPassword');
//       case 'errorMode':
//         return () => {
//           if (loginMode) {
//             switchToMode('login');
//           } else {
//             switchToMode('register');
//           }
//           otpForm.resetFields();
//           setIsCountdownActive(false); // Stop countdown when going back
//         };
//       default:
//         return null;
//     }
//   };

//   const getTransformClass = (targetMode: PopupMode) => {
//     const modes: PopupMode[] = [
//       'login',
//       'register',
//       'otp',
//       'setPassword',
//       'setUser',
//       'errorMode',
//       'registerSuccess',
//     ];
//     const currentIndex = modes.indexOf(currentMode);
//     const targetIndex = modes.indexOf(targetMode);

//     if (currentIndex === targetIndex) {
//       return 'translate-x-0';
//     } else if (currentIndex < targetIndex) {
//       return '-translate-x-full';
//     } else {
//       return 'translate-x-full';
//     }
//   };

//   const backNavigation = getBackNavigation();

//   return (
//     <>
//       <ErrorPopup
//         visible={isErrorVisible}
//         onClose={() => {
//           setIsErrorVisible(false);
//         }}
//         statusCode={statusCode}
//       />
//       <ResponsivePopup
//         visible={visible}
//         onClose={handleClose}
//         modalTitle={
//           <>
//             {backNavigation && (
//               <Button
//                 variant="outlined"
//                 color="neutral"
//                 onClick={backNavigation}
//                 icon={<i className="ri-arrow-left-s-line text-xl"></i>}
//               />
//             )}
//           </>
//         }
//         drawerTitle={
//           <div
//             className={`flex ${
//               backNavigation ? 'justify-between' : 'justify-end'
//             }`}
//           >
//             {backNavigation && (
//               <Button
//                 variant="outlined"
//                 color="neutral"
//                 onClick={backNavigation}
//                 icon={<i className="ri-arrow-left-s-line text-xl"></i>}
//               />
//             )}
//             <Button
//               onClick={handleClose}
//               variant="outlined"
//               className="!px-0"
//               color="neutral"
//             >
//               <i className="ri-close-line"></i>
//             </Button>
//           </div>
//         }
//         modalProps={{
//           width: 960,
//           centered: true,
//           destroyOnHidden: true,
//           className: '!overflow-y-scroll',
//         }}
//         drawerProps={{
//           height: '90%',
//           destroyOnClose: true,
//           className: '!overflow-y-scroll',
//         }}
//       >
//         <div className="h-full sm:h-[600px] flex justify-center items-center w-full overflow-hidden">
//           <div
//             className={`relative w-full  h-full ${
//               isMode('setPassword') ||
//               isMode('setUser') ||
//               isMode('registerSuccess')
//                 ? 'mt-0'
//                 : 'mt-0'
//             }  md:mt-0 block sm:flex justify-center items-center overflow-hidden`}
//           >
//             {/* Login Form */}
//             <div
//               className={`absolute w-full h-full block sm:flex justify-center items-center transition-transform duration-800 ease-in-out ${getTransformClass(
//                 'login'
//               )}`}
//             >
//               <FormLoginFromInvitation
//                 onFinish={handleLogin}
//                 loading={loading}
//                 loginForm={loginForm}
//                 prefilledPhoneNumber={prefillPhoneNumber}
//               />
//             </div>

//             {/* Error Mode */}
//             <div
//               className={`absolute w-full h-full block md:flex justify-center items-center transition-transform duration-800 ease-in-out ${getTransformClass(
//                 'errorMode'
//               )}`}
//             >
//               <div className="flex flex-col h-full w-full gap-6 items-center justify-center">
//                 <SectionIcon iconClass="ri-lock-password-fill" type="error" />
//                 <div className="text-center">
//                   <Typography variant="h5" className="!text-text-secondary">
//                     คุณกรอก OTP ผิดเกินจำนวนที่กำหนด
//                   </Typography>
//                   <Typography
//                     variant="paragraph-medium"
//                     className="!text-text-secondary"
//                   >
//                     กรุณารอ{' '}
//                     <span className="!text-error mr-1">
//                       ({formatCountdownTime(countdownTime)} นาที)
//                     </span>
//                     เพื่อทำการลงทะเบียนอีกครั้ง
//                   </Typography>
//                 </div>
//               </div>
//             </div>

//             {/* OTP Form */}
//             <div
//               className={`absolute w-full h-full block md:flex overflow-auto justify-center items-center transition-transform duration-800 ease-in-out ${getTransformClass(
//                 'otp'
//               )}`}
//             >
//               <FormOtpFromInvitation
//                 otpForm={otpForm}
//                 otpData={otpData}
//                 onFinish={handleSendOtp}
//                 telNumber={telNumber}
//                 loading={loading}
//                 resendOtp={resendOtp}
//                 isSuccessResendOtp={isSuccessResendOtp}
//               />
//               {/* <Button
//                 variant="outlined"
//                 color="neutral"
//                 onClick={() => switchToMode("setPassword")}
//                 icon={<i className="ri-arrow-right-s-line text-xl"></i>}
//               /> */}
//             </div>

//             {/* Set Password Form */}
//             <div
//               className={`absolute w-full h-full block md:flex justify-center items-start transition-transform duration-800 ease-in-out ${getTransformClass(
//                 'setPassword'
//               )}`}
//             >
//               <FormSetPassword
//                 passwordForm={passwordForm}
//                 onFinish={handleSetPassword}
//                 loading={loading}
//               />
//               {/* <Button
//                 variant="outlined"
//                 color="neutral"
//                 onClick={() => {
//                   setUserForm.setFieldsValue({
//                     accountType: "personal",
//                     firstName: "",
//                     lastName: "",
//                     telNumber: telNumber,
//                     consent: true,
//                   });
//                   switchToMode("setUser");
//                 }}
//                 icon={<i className="ri-arrow-right-s-line text-xl"></i>}
//               /> */}
//             </div>

//             {/* Set Profile Form */}
//             <div
//               className={`absolute w-full h-full block md:flex justify-center items-center transition-transform duration-800 ease-in-out ${getTransformClass(
//                 'setUser'
//               )}`}
//             >
//               <FormUserInfo
//                 userInfoForm={userInfoForm}
//                 loading={
//                   isRegisterAccountPending ||
//                   isRegisterUserProfilePending ||
//                   isLoginWithUsernamePending
//                 }
//                 onFinish={(e: boolean) =>
//                   handleCreateUserAndLogin({ skipRedirect: e })
//                 }
//                 prefillPhoneNumber={prefillPhoneNumber}
//                 refCode={refCode}
//               />
//               {/* <Button
//                 variant="outlined"
//                 color="neutral"
//                 onClick={() => {
//                   switchToMode("registerSuccess");
//                 }}
//                 icon={<i className="ri-arrow-right-s-line text-xl"></i>}
//               /> */}
//             </div>
//             {/* Set Profile Form */}
//             <div
//               className={`absolute w-full h-full block md:flex justify-center items-center transition-transform duration-800 ease-in-out ${getTransformClass(
//                 'registerSuccess'
//               )}`}
//             >
//               <div className="flex flex-col h-full w-full items-center justify-center">
//                 <SectionIcon type="success" />
//                 <div className="text-center mt-5">
//                   <Typography variant="h2" className="!text-text-primary">
//                     สมัครสมาชิกสำเร็จ
//                   </Typography>
//                   <Typography
//                     variant="paragraph-big"
//                     className="!text-gray-light !mt-2 !font-normal"
//                   >
//                     เข้าสู่ระบบเพื่อเริ่มต้นใช้งานและเข้าถึงบริการทั้งหมด
//                   </Typography>
//                 </div>
//                 <div className="flex flex-col-reverse md:flex-row justify-center items-center gap-3 mt-5 pt-8 w-full">
//                   <Button
//                     variant="outlined"
//                     color="neutral"
//                     icon={<i className="ri-home-6-line"></i>}
//                     onClick={() => {
//                       handleClose();
//                     }}
//                     fullWidth={isMobile}
//                   >
//                     กลับหน้าหลัก
//                   </Button>
//                   <Button
//                     variant="solid"
//                     color="primary"
//                     onClick={() => {
//                       handleSwitchToLogin();
//                     }}
//                     fullWidth={isMobile}
//                   >
//                     เข้าสู่ระบบ
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </ResponsivePopup>
//       <PopupConsent
//         visible={isOpenConsent}
//         onClose={() => setIsOpenConsent(false)}
//         onSubmitConsent={(dataVal) => {
//           if (createUserValue) {
//             handleSubmitConsent(dataVal, createUserValue);
//           }
//         }}
//       />
//     </>
//   );
// };

// export default PopupLoginFromInvitation;
