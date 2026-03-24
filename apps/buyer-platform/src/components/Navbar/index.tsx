'use client';

import { getMyUser } from '@/common/api/customer-service/auth.api';
import { logout } from '@/utils/axios';
import {
  default as Button,
  default as CustomButton,
} from '@/components/Button';
import { useGlobalStore } from '@/store/global.store';
import { MenuOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, Badge, Drawer, Popover } from 'antd';
import { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import MockupSearchList from '@/__mocks__/MockupSearchList.json';
import TextField from '../DataEntry/TextField';
import SearchItem from '../SearchItem';
import UserOrganizationMenu from '../Sections/UserOrganizationMenu';
import UserProfile from '../Sections/UserProfile';
import Typography from '../Typography';
import CategoryDropdown from './CategoryDropdown';
import { MobileCategoryMenu } from './MobileCategoryMenu';
import MobileUserAuthMenu from './MobileUserAuthMenu';
import usePopup from '@/hooks/usePopup';
import { getCount } from '@/common/api/order-service/cart.api';
import LocationPopup from '../Popup/Location';
import PopupNewLogin from '../Popup/NewLogin';
import { OrganizationType } from '@/common/interfaces/organization/user-with-org.response.interface';
import { getUserWithOrganizations } from '@/common/api/customer-service/organization.api';
import { Label } from '../Label';
import { getFirstChar, resolvedRoleDisplayName } from '@/utils/format';
import { useScreenWidth } from '@/hooks/useScreenWidth';
import { KycOrganizationStatus } from '@/common/enum/organization.enum';
import {
  getHistorySearchProduct,
  addHistorySearchProduct,
  deleteHistorySearchProduct,
  deleteHistorySearchProductAll,
} from '@/common/api/product-service/history.api';
import { deleteHistorySearchProductInterface } from '@/common/interfaces/HistorySearchProduct.interface';
import { useNotification } from '@/hooks/notification.hook';

export const EmptyIllustration = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={160}
    height={160}
    fill="none"
    {...props}
  >
    <path
      fill="#CED2DA"
      d="M148 107c0 7.548-30.594 13.667-68.333 13.667-37.74 0-68.334-6.119-68.334-13.667s30.594-13.667 68.334-13.667C117.406 93.333 148 99.453 148 107Z"
    />
    <path
      fill="#EFF0F3"
      d="M50.872 40.993a6.322 6.322 0 0 1 4.898-2.326h48.038a6.32 6.32 0 0 1 4.917 2.35l23.942 29.63v12.686h-106V70.647l24.205-29.654Z"
    />
    <path
      fill="#DEE1E6"
      fillRule="evenodd"
      d="M103.808 39.195H55.77c-1.74 0-3.388.783-4.49 2.133L27.194 70.836v11.969h104.945v-11.97L108.315 41.35a5.793 5.793 0 0 0-4.507-2.155Zm28.859 31.452-23.942-29.63a6.32 6.32 0 0 0-4.917-2.35H55.77a6.322 6.322 0 0 0-4.898 2.326L26.666 70.647v12.686h106.001V70.647Z"
      clipRule="evenodd"
    />
    <path
      fill="#DEE1E6"
      d="M26.666 70h26.369c2.33 0 4.219 1.929 4.219 4.308v1.884c0 2.38 1.888 4.308 4.218 4.308h35.861c2.33 0 4.219-1.929 4.219-4.308v-1.884c0-2.38 1.889-4.308 4.219-4.308h26.896v33.385c0 4.758-3.778 8.615-8.438 8.615H35.104c-4.66 0-8.438-3.857-8.438-8.615V70Z"
    />
    <path
      fill="#CED2DA"
      fillRule="evenodd"
      d="M132.139 103.385V70.538h-26.368c-2.039 0-3.692 1.688-3.692 3.77v1.884c0 2.677-2.124 4.847-4.746 4.847h-35.86c-2.622 0-4.747-2.17-4.747-4.847v-1.884c0-2.082-1.653-3.77-3.691-3.77H27.194v32.847c0 4.46 3.541 8.077 7.91 8.077h89.125c4.369 0 7.91-3.617 7.91-8.077ZM26.666 70v33.385c0 4.758 3.778 8.615 8.438 8.615h89.125c4.66 0 8.438-3.857 8.438-8.615V70h-26.896c-2.33 0-4.219 1.929-4.219 4.308v1.884c0 2.38-1.889 4.308-4.219 4.308h-35.86c-2.33 0-4.22-1.929-4.22-4.308v-1.884c0-2.38-1.888-4.308-4.218-4.308H26.667Z"
      clipRule="evenodd"
    />
  </svg>
);

const Navbar = () => {
  const queryClient = useQueryClient();
  const screenWidth = useScreenWidth();
  const isMobile = screenWidth < 641;
  const isTablet = screenWidth > 641 && screenWidth < 1024;
  const { notification } = useNotification();

  const [isLoginVisible, setIsLoginVisible] = useState<boolean>(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false);
  const [isLocationPopupVisible, setIsLocationPopupVisible] =
    useState<boolean>(false);
  const [isOpenPopoverUserMode, setIsOpenPopoverUserMode] =
    useState<boolean>(false);
  const [isOpenPopoverAccount, setIsOpenPopoverAccount] =
    useState<boolean>(false);
  const [isOpenPopOverMenu, setIsOpenPopoverMenu] = useState<boolean>(false);
  const [auth, setAuth] = useState<string | undefined>(undefined);
  const [authData, setAuthData] = useState<any>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [showSearchList, setShowSearchList] = useState<boolean>(false);
  const [isOpenCategoryDropdown, setIsOpenCategoryDropdown] =
    useState<boolean>(false);
  const [currentView, setCurrentView] = useState<
    'main' | 'account' | 'organization' | 'category'
  >('main');
  const [cartCount, setCartCount] = useState<number>(0);
  const router = useRouter();
  const {
    setProfile,
    profile,
    organizations,
    setOrganizations,
    currentOrganization,
    setCurrentOrganization,
  } = useGlobalStore();
  const { showPopup, PopupComponent } = usePopup();

  const searchElementRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (!searchElementRef.current) return;
    const searchElement = searchElementRef.current;
    if (!searchElement.contains(event.target as Node)) {
      setShowSearchList(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchList = useMemo(() => {
    return searchKeyword.trim() !== ''
      ? MockupSearchList.filter((item) => {
          return item.name
            .toLowerCase()
            .includes(searchKeyword.toLowerCase().trim());
        }).slice(0, 5)
      : [];
  }, [searchKeyword]);

  useEffect(() => {
    const checkAuthCookie = () => {
      const currentAuth = Cookies.get('auth');
      if (currentAuth !== auth) {
        setAuth(currentAuth);
        setAuthData(currentAuth ? JSON.parse(currentAuth) : null);
      }
    };
    checkAuthCookie();
    const interval = setInterval(checkAuthCookie, 1000);
    return () => clearInterval(interval);
  }, [auth]);

  const getKycBadgeConfig = (status?: string | KycOrganizationStatus) => {
    switch (status) {
      case KycOrganizationStatus.APPROVE:
      case 'APPROVED': // Handle both enum and API string
        return {
          text: 'ยืนยันตัวตนแล้ว',
          color: 'success' as const,
          prefix: (
            <i className="ri-verified-badge-fill text-[10px] text-success" />
          ),
        };
      case KycOrganizationStatus.WAIT_FOR_APPROVE:
      case 'WAIT_FOR_APPROVE':
      case 'PENDING':
        return {
          text: 'รอการอนุมัติ',
          color: 'warning' as const,
          prefix: (
            <i className="ri-information-line text-[10px] text-warning" />
          ),
        };
      case KycOrganizationStatus.REJECT:
      case 'REJECTED':
        return {
          text: 'ถูกปฎิเสธ',
          color: 'error' as const,
          prefix: <i className="ri-close-line text-[10px] text-error" />,
        };
      case KycOrganizationStatus.REQUEST_MORE:
      case 'REQUEST_MORE':
        return {
          text: 'ขอข้อมูลเพิ่มเติม',
          color: 'info' as const,
          prefix: <i className="ri-draft-line text-[10px] text-info" />,
        };
      default:
        return {
          text: 'ยังไม่ยืนยันตัวตน',
          color: 'error' as const,
          prefix: <i className="ri-information-line text-[10px] text-error" />,
        };
    }
  };

  const handleOpenChangeUserMode = (newOpen: boolean) => {
    setIsOpenPopoverUserMode(newOpen);
  };

  const handleOpenChangeAccount = (newOpen: boolean) => {
    setIsOpenPopoverAccount(newOpen);
  };

  const handleOpenChangeMenu = (newOpen: boolean) => {
    setIsOpenPopoverMenu(newOpen);
  };

  const { data: userData } = useQuery({
    queryKey: ['getMyUser'],
    queryFn: async () => {
      if (authData?.accessToken) {
        const response = await getMyUser(authData?.accessToken || '');
        setProfile(response);
        return response;
      }
    },
    enabled: !!authData,
  });

  const { data: cartCountQuery } = useQuery({
    queryKey: ['cart-count'],
    queryFn: () => getCount(authData.accessToken),
    enabled: !!authData,
  });

  const { data: userWithOrganizationsData } = useQuery({
    queryKey: ['organization', profile?.uuid, 1, 999],
    queryFn: () => getUserWithOrganizations(profile?.uuid || '', 1, 999),
    enabled: !!authData && !!profile?.uuid,
    staleTime: 0,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (userWithOrganizationsData?.data?.organizations) {
      setOrganizations(userWithOrganizationsData?.data?.organizations);
      if (
        !currentOrganization &&
        userWithOrganizationsData?.data?.organizations.length > 0
      ) {
        setCurrentOrganization(
          userWithOrganizationsData?.data?.organizations[0]
        );
      }
    }
  }, [userWithOrganizationsData]);

  console.log('userWithOrganizationsData', userWithOrganizationsData);

  useEffect(() => {
    if (authData) {
      setCartCount(cartCountQuery?.data || 0);
    } else {
      setCartCount(0);
    }
  }, [cartCountQuery, authData]);

  const currentOrg = useMemo(() => {
    return currentOrganization;
  }, [currentOrganization]);

  // prettier-ignore
  useEffect(() => {
    if (
      (isMobile &&
      showSearchList &&
      (searchList.length === 0 &&
      searchKeyword.trim() !== "") ||
      searchList.length > 0) ||
      isOpenCategoryDropdown
    ) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isMobile, showSearchList, searchKeyword, searchList, isOpenCategoryDropdown]);

  const onLogout = async () => {
    try {
      // Call logout API to clear httpOnly cookies
      // Pass false to prevent automatic redirect (we handle it below)
      await logout(false);

      // Clear React Query cache
      queryClient.clear();

      // Clear client-side state
      setAuth(undefined);
      setAuthData(null);
      setProfile(undefined);
      setIsOpenPopoverAccount(false);
      setIsOpenPopoverUserMode(false);
      setIsDrawerVisible(false);
      setOrganizations([]);
      setCurrentOrganization(undefined);

      // Trigger localStorage event for cross-tab logout synchronization
      localStorage.setItem('logout', Date.now().toString());
      localStorage.removeItem('logout');

      router.push('/');
    } catch (error) {
      const errorStatusCode = (error as AxiosError).response?.status || 500;
      showPopup('error', {
        statusCode: errorStatusCode,
      });
    }
  };

  const ButtonSelectLocation = () => {
    return (
      <div
        className="p-1 flex gap-2 items-center justify-between min-w-[190px] cursor-pointer"
        onClick={() => setIsLocationPopupVisible(true)}
      >
        <div className="rounded-full flex justify-center items-center bg-primary-hover w-10 h-10 text-text-breadcrumb-active text-2xl">
          <i className="ri-map-pin-fill" />
        </div>
        <div className="">
          <Typography
            variant="paragraph-medium"
            className="!text-icon-brand-dark"
          >
            เลือกที่อยู่จัดส่ง
          </Typography>
        </div>
        <i className="ri-arrow-down-s-line text-icon-brand-dark text-2xl" />
      </div>
    );
  };

  //! history srearch
  const [isShowSearchHistory, setIsShowSearchHistory] =
    useState<boolean>(false);
  const [showAllHistory, setShowAllHistory] = useState<boolean>(false);
  const [listHistorySearch, setListHistorySearch] = useState<Array<any>>([]);

  const { data: historySearchData } = useQuery({
    queryKey: ['historySearchProduct', profile],
    queryFn: async () => {
      if (profile) {
        const response = await getHistorySearchProduct();
        return response;
      }
      return null;
    },
    enabled: !!profile,
  });
  useEffect(() => {
    if (
      profile &&
      historySearchData?.message === 'Success' &&
      historySearchData?.data?.length > 0
    ) {
      setListHistorySearch(historySearchData.data);
    } else if (!profile) {
      const historySearch = localStorage.getItem('historySearch');
      setListHistorySearch(historySearch ? JSON.parse(historySearch) : []);
    }
  }, [profile, historySearchData]);
  const { mutate: addMyHistorySearchProduct } = useMutation({
    mutationFn: async (keyword: string) => {
      const payload = {
        keyword: keyword,
        type: 'SEARCH',
      };
      const response = await addHistorySearchProduct(payload);
      return response;
    },
    onSuccess: (data) => {
      if (data?.message === 'Success' && data?.data) {
        // ตรวจสอบว่ามี keyword ซ้ำหรือไม่
        const existingIndex = listHistorySearch.findIndex(
          (item) => item.keyword === data.data.keyword
        );

        let updatedList;
        if (existingIndex !== -1) {
          // ถ้ามีอยู่แล้ว ให้ย้ายไปตำแหน่งที่ 0
          const filteredList = listHistorySearch.filter(
            (_, index) => index !== existingIndex
          );
          updatedList = [data.data, ...filteredList];
        } else {
          // ถ้าไม่มี ให้เพิ่มเป็นตำแหน่งที่ 0
          updatedList = [data.data, ...listHistorySearch];
        }

        // จำกัดจำนวนไม่เกิน 10 รายการ
        if (updatedList.length > 10) {
          updatedList = updatedList.slice(0, 10);
        }

        setListHistorySearch(updatedList);
      }
    },
    onError: () => {
      notification.error({
        message: 'ระบบขัดข้อง',
        description: 'กรุณาลองใหม่ภายหลัง',
      });
    },
  });
  const { mutate: deleteMyHistorySearchProduct } = useMutation({
    mutationFn: async (id: number) => {
      const payload = {
        id: id,
      };
      const response = await deleteHistorySearchProduct(payload);
      return { response, id };
    },
    onSuccess: (data) => {
      if (data?.response?.message === 'Success') {
        // ลบรายการออกจาก state
        const updatedHistory = listHistorySearch.filter(
          (item) => item.id !== data.id
        );
        setListHistorySearch(updatedHistory);
      }
    },
    onError: () => {
      notification.error({
        message: 'ระบบขัดข้อง',
        description: 'กรุณาลองใหม่ภายหลัง',
      });
    },
  });
  const { mutate: deleteMyHistorySearchProductAll } = useMutation({
    mutationFn: async () => {
      const response = await deleteHistorySearchProductAll();
      return response;
    },
    onSuccess: (data) => {
      if (data?.message === 'Success') {
        setListHistorySearch([]);
      }
    },
    onError: () => {
      notification.error({
        message: 'ระบบขัดข้อง',
        description: 'กรุณาลองใหม่ภายหลัง',
      });
    },
  });

  const handleDeleteHistoryItem = (
    item: deleteHistorySearchProductInterface,
    index: number
  ) => {
    if (profile) {
      // call api to delete search history item
      deleteMyHistorySearchProduct(item.id);
    } else {
      const updatedHistory = listHistorySearch.filter((_, i) => i !== index);
      setListHistorySearch(updatedHistory);
      localStorage.setItem('historySearch', JSON.stringify(updatedHistory));
    }
  };
  const handleDeleteHistoryAll = () => {
    if (profile) {
      // call api to delete item
      deleteMyHistorySearchProductAll();
    } else {
      setListHistorySearch([]);
      localStorage.removeItem('historySearch');
    }
  };
  const handleSearchHistory = (keyword: string) => {
    if (profile) {
      // call api to save search history
      addMyHistorySearchProduct(keyword);
    } else {
      // ตรวจสอบว่ามี keyword ซ้ำหรือไม่
      const existingIndex = listHistorySearch.findIndex(
        (item) => item.keyword === keyword
      );
      let updatedList;
      if (existingIndex !== -1) {
        // ถ้ามีอยู่แล้ว ให้ย้ายไปตำแหน่งที่ 0
        const filteredList = listHistorySearch.filter(
          (_, index) => index !== existingIndex
        );
        updatedList = [
          { keyword, type: 'SEARCH', createdAt: new Date().toISOString() },
          ...filteredList,
        ];
      } else {
        // ถ้าไม่มี ให้เพิ่มเป็นตำแหน่งที่ 0
        updatedList = [
          { keyword, type: 'SEARCH', createdAt: new Date().toISOString() },
          ...listHistorySearch,
        ];
      }

      // จำกัดจำนวนไม่เกิน 10 รายการ
      if (updatedList.length > 10) {
        updatedList = updatedList.slice(0, 10);
      }

      setListHistorySearch(updatedList);
      localStorage.setItem('historySearch', JSON.stringify(updatedList));
    }
  };

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const el = searchElementRef.current;
      if (!el) return;

      if (!el.contains(e.target as Node)) {
        setIsShowSearchHistory(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown, true);
    document.addEventListener('touchstart', handlePointerDown, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown, true);
      document.removeEventListener('touchstart', handlePointerDown, true);
    };
  }, [isShowSearchHistory]);

  // scrolling lock mobile when search history or search list is open
  useEffect(() => {
    if (
      (isMobile &&
        isShowSearchHistory &&
        listHistorySearch.length === 0 &&
        searchKeyword.trim() !== '') ||
      listHistorySearch.length > 0 ||
      isOpenCategoryDropdown
    ) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [
    isMobile,
    isShowSearchHistory,
    searchKeyword,
    listHistorySearch,
    isOpenCategoryDropdown,
  ]);

  const RenderSearch = () => {
    return (
      <div
        className={
          isMobile ? 'relative ' : 'relative max-w-[480px] flex shrink-1 w-full'
        }
        ref={searchElementRef}
      >
        <div className={isMobile ? 'container mx-auto  px-4 ' : 'w-full'}>
          <TextField
            size="large"
            placeholder="ค้นหาสินค้า ชื่อร้านค้า หมวดหมู่ หรือแบรนด์"
            focusRing={true}
            prefix={
              <i
                className="ri-search-line cursor-pointer"
                onClick={() => {
                  if (searchKeyword.trim().length >= 3) {
                    router.push(`/search/${searchKeyword}`);
                    setShowSearchList(false);
                    setSearchKeyword('');
                  }
                }}
              ></i>
            }
            value={searchKeyword}
            onFocus={() => {
              setShowSearchList(true);
              setIsOpenCategoryDropdown(false);
            }}
            allowClear
            //onChange={(e) => setSearchKeyword(e.target.value)}
            onChange={(e) => {
              const rawValue = e.target.value;
              //console.log('Raw input value:', rawValue);
              const normalizedValue = rawValue.replace(/^\s+/, '');
              setSearchKeyword(normalizedValue);
              if (
                normalizedValue.trim() === '' &&
                listHistorySearch.length > 0
              ) {
                setIsShowSearchHistory(true);
              } else {
                setIsShowSearchHistory(false);
                setShowSearchList(true);
              }
            }}
            onPressEnter={() => {
              if (searchKeyword.trim().length >= 1) {
                setShowSearchList(false);
                setSearchKeyword('');
                router.push(`/search/${searchKeyword}`);
                handleSearchHistory(searchKeyword);
              }
            }}
            onClick={() => {
              if (listHistorySearch.length > 0) {
                if (!isShowSearchHistory && searchKeyword.trim() === '') {
                  setIsShowSearchHistory(true);
                } else {
                  setIsShowSearchHistory(false);
                }
              }
            }}
          />
        </div>

        {/* Search History */}
        {isShowSearchHistory && listHistorySearch.length > 0 ? (
          <div
            className={
              isMobile
                ? 'container mx-auto flex flex-col gap-4 w-full h-[100vh]  bg-background-primary border-t border-border-neutral-60 mt-[10px] pt-5 z-20 px-4'
                : 'absolute flex flex-col gap-4 top-[6.5rem] sm:top-[3rem] left-0 w-full h-[110vh] sm:w-full sm:h-auto bg-background-primary sm:rounded-md sm:border sm:border-border-primary p-5 z-20 mt-3'
            }
          >
            <div className="flex justify-between items-center">
              <Typography
                variant="paragraph-small-regular"
                className={'!text-text-secondary'}
              >
                ประวัติค้นหา
              </Typography>
              <Button
                variant="link"
                color="neutral"
                icon={<i className="ri-delete-bin-6-line text-base"></i>}
                onClick={() => {
                  handleDeleteHistoryAll();
                }}
              >
                ลบทั้งหมด
              </Button>
            </div>
            <div className="flex flex-col gap-1">
              {(showAllHistory
                ? listHistorySearch
                : listHistorySearch.slice(0, 5)
              ).map((item, index) => {
                return (
                  <div
                    key={index}
                    className={'flex justify-between items-center '}
                  >
                    <Button
                      className="flex items-center justify-start w-full text-left !gap-2 !pl-0"
                      variant="ghost"
                      color="neutral"
                      icon={<i className="ri-history-line text-base"></i>}
                      onClick={() => {
                        setIsShowSearchHistory(false);
                        router.push(
                          `/search/${encodeURIComponent(item.keyword)}`
                        );
                      }}
                    >
                      <span className="block min-w-0 w-full text-left truncate">
                        {item.keyword}
                        {item.type === 'CATEGORY' ? (
                          <span className="!text-text-tertiary">
                            {' '}
                            ในหมวดหมู่
                          </span>
                        ) : null}
                      </span>
                    </Button>
                    <Button
                      variant="link"
                      color="neutral"
                      icon={<i className="ri-close-circle-fill text-base"></i>}
                      onClick={() => {
                        handleDeleteHistoryItem(item, index);
                      }}
                    />
                  </div>
                );
              })}
              {listHistorySearch.length > 5 && (
                <Button
                  variant="link"
                  color="neutral"
                  onClick={() => setShowAllHistory(!showAllHistory)}
                  className="!justify-center"
                  icon={
                    showAllHistory ? (
                      <i className="ri-arrow-up-s-line text-base"></i>
                    ) : (
                      <i className="ri-arrow-down-s-line text-base"></i>
                    )
                  }
                  iconPosition="end"
                >
                  {showAllHistory ? 'ซ่อน' : `แสดงเพิ่ม`}
                </Button>
              )}
            </div>
          </div>
        ) : null}

        {/* Search List */}
        {showSearchList && searchList.length > 0 && (
          <div
            className={
              isMobile
                ? 'container mx-auto flex flex-col gap-4 w-full h-[100vh]  bg-background-primary border-t border-border-neutral-60 mt-[10px] pt-5 z-20 px-4'
                : 'absolute flex flex-col gap-4 top-[6.5rem] sm:top-[3rem] left-0 w-full h-[110vh] sm:w-full sm:h-auto bg-background-primary sm:rounded-md sm:border sm:border-border-primary p-5 z-20 mt-3'
            }
          >
            <div className="flex justify-between items-center">
              <Typography
                variant="paragraph-medium"
                className="!text-text-secondary"
              >
                สินค้า
              </Typography>
              <Link
                href={`/search/${searchKeyword}`}
                className="flex gap-1"
                onClick={() => {
                  handleSearchHistory(searchKeyword); // save search history
                  setShowSearchList(false);
                  setSearchKeyword('');
                  router.push(`/search/${searchKeyword}`);
                }}
              >
                <Typography variant="button-small">ดูสินค้าทั้งหมด</Typography>
                <i className="ri-arrow-right-line !text-neutral-60"></i>
              </Link>
            </div>
            <div className="flex flex-col gap-1">
              {searchList.map((item) => (
                <SearchItem
                  key={item.id}
                  searchKeyword={searchKeyword}
                  productName={item.name}
                  imagePath={item.image}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty List */}
        {showSearchList &&
          searchList.length === 0 &&
          searchKeyword.trim() !== '' && (
            <div
              className={
                isMobile
                  ? 'container mx-auto flex flex-col gap-4 w-full h-[100vh]  bg-background-primary border-t border-border-neutral-60 mt-[10px] pt-5 z-20 px-4'
                  : 'absolute flex flex-col gap-4 top-[6.5rem] sm:top-[3rem] left-0 w-full h-[110vh] sm:w-full sm:h-auto bg-background-primary sm:rounded-md sm:border sm:border-border-primary p-5 z-20 mt-3'
              }
            >
              <div className="flex flex-col items-center justify-center ">
                <EmptyIllustration />
                <Typography
                  variant="paragraph-big"
                  className="!text-text-secondary !font-medium !line-clamp-1"
                >
                  ไม่พบผลลัพธ์ “{searchKeyword}”
                </Typography>
                <Typography
                  variant="paragraph-medium"
                  className="!text-text-quarternary"
                >
                  ลองค้นหาด้วยคำอื่น
                </Typography>
              </div>
            </div>
          )}
      </div>
    );
  };

  return (
    <div
      className={
        isMobile
          ? 'relative bg-white w-full '
          : 'relative bg-white w-full shadow-2xl'
      }
    >
      {isOpenCategoryDropdown && (
        <CategoryDropdown onClose={() => setIsOpenCategoryDropdown(false)} />
      )}
      <PopupComponent />
      {/* <PopupLogin
        visible={isLoginVisible}
        onClose={() => setIsLoginVisible(false)}
      /> */}
      <PopupNewLogin
        visible={isLoginVisible}
        onClose={() => setIsLoginVisible(false)}
      />
      <LocationPopup
        visible={isLocationPopupVisible}
        onClose={() => setIsLocationPopupVisible(false)}
      />
      <Drawer
        placement="left"
        closable={false}
        onClose={() => {
          setIsDrawerVisible(false);
          setCurrentView('main');
        }}
        open={isDrawerVisible}
        className="[&__.ant-drawer-body]:!p-0"
        width="80%"
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center w-full py-4 px-4 border-b border-border-primary">
            <Link href="/" onClick={() => setIsDrawerVisible(false)}>
              <Image src="/logo.svg" alt="allkons" width={192} height={56} />
            </Link>
            <button
              onClick={() => setIsDrawerVisible(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-border-primary text-text-secondary hover:bg-background-secondary transition-colors"
              aria-label="Close menu"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
          {/* No Auth Menu List */}
          {currentView === 'category' ? (
            <MobileCategoryMenu
              onClose={() => setIsDrawerVisible(false)}
              setCurrentView={setCurrentView}
            />
          ) : (
            <MobileUserAuthMenu
              user={userData}
              onLogout={onLogout}
              onLogin={() => {
                setIsLoginVisible(true);
                setIsDrawerVisible(false);
              }}
              onClose={() => setIsDrawerVisible(false)}
            />
          )}
        </div>
      </Drawer>
      {!isMobile && !isTablet ? (
        <div className="container mx-auto flex flex-col gap-5 w-full py-2 sm:py-4 items-center">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6 justify-between items-center w-full relative px-4 xl:px-[48px]">
            <div className="flex items-center flex-shrink-0">
              <Link
                href="/"
                className="flex items-center justify-center flex-shrink-0"
              >
                {screenWidth >= 1024 ? (
                  <Image
                    src="/logo.svg"
                    alt="thammasorn"
                    width={190}
                    height={48}
                    className="object-contain"
                  />
                ) : (
                  <Image
                    src="/logo-mobile.svg"
                    alt="thammasorn"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                )}
              </Link>
            </div>
            <div className="flex gap-4 w-full justify-center">
              <ButtonSelectLocation />
              {RenderSearch()}
            </div>

            {authData ? (
              <div className="flex items-center gap-6">
                <Badge
                  color="#00af43"
                  count={cartCount}
                  showZero
                  offset={[-4, 4]}
                >
                  <Link href="/cart">
                    <Button size="large" variant="ghost" color="neutral">
                      <i className="ri-shopping-cart-2-line"></i>
                    </Button>
                  </Link>
                </Badge>
                {currentOrg && (
                  <Popover
                    styles={{
                      body: { padding: 0 },
                    }}
                    content={
                      <div className="w-[256px]">
                        <UserOrganizationMenu
                          setIsOpenPopoverUserMode={(e: boolean) =>
                            setIsOpenPopoverUserMode(e)
                          }
                        />
                      </div>
                    }
                    trigger="click"
                    open={isOpenPopoverUserMode}
                    onOpenChange={handleOpenChangeUserMode}
                  >
                    <div className="p-1 pr-4 flex items-center bg-background-secondary rounded-full gap-3 cursor-pointer hover:bg-neutral-bg transition-colors min-w-[240px]">
                      <div className="relative">
                        <Avatar
                          size={32}
                          className="!bg-primary-subtle !rounded-full !aspect-square !w-auto"
                          src={currentOrg?.organization.imageUpload}
                        >
                          {!currentOrg?.organization.imageUpload && (
                            <Typography
                              variant="paragraph-middle-medium"
                              className="!text-primary-dark"
                            >
                              {getFirstChar(
                                currentOrg?.organization.organizeName || ''
                              )}
                            </Typography>
                          )}
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 rounded-full w-4 h-4 flex items-center justify-center shadow-sm border border-white ${
                            currentOrg?.organization.organizationType ===
                            OrganizationType.JURISTIC
                              ? 'bg-info'
                              : currentOrg?.organization.organizationType ===
                                  OrganizationType.REGISTERED_INDIVIDUAL
                                ? 'bg-warning'
                                : 'bg-primary'
                          }`}
                        >
                          {currentOrg?.organization.organizationType ===
                          OrganizationType.JURISTIC ? (
                            <i className="ri-briefcase-line text-[8px] text-white"></i>
                          ) : currentOrg?.organization.organizationType ===
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
                          {currentOrg?.organization.organizeName || ''}
                        </Typography>
                        <div className="flex items-center gap-2">
                          <Typography
                            variant="paragraph-extra-small"
                            className="!text-text-quarternary !font-normal !truncate"
                          >
                            {resolvedRoleDisplayName(
                              currentOrg?.role?.displayName || 'สมาชิก'
                            )}
                          </Typography>
                          <Label
                            variant="ghost"
                            rounding="pill"
                            size="small"
                            {...getKycBadgeConfig(
                              currentOrg?.organization.kycStatus
                            )}
                          />
                        </div>
                      </div>
                      <div className="ml-auto">
                        <i
                          className={
                            !isOpenPopoverUserMode
                              ? 'ri-arrow-down-s-line text-xl text-text-secondary'
                              : 'ri-arrow-up-s-line text-xl text-text-secondary'
                          }
                        ></i>
                      </div>
                    </div>
                  </Popover>
                )}
                <Popover
                  placement="bottomLeft"
                  styles={{
                    body: { padding: 8 },
                  }}
                  content={
                    <div className="w-[260px] flex flex-col gap-1 p-1">
                      <UserProfile user={userData} />
                      <div className="mx-2 mb-2 h-px bg-border-primary" />
                      <div
                        className="flex items-center justify-between p-2 rounded-md hover:bg-background-secondary cursor-pointer"
                        onClick={() => {
                          router.push('/user');
                          setIsOpenPopoverAccount(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <i className="ri-user-line text-xl text-text-secondary"></i>
                          <Typography
                            variant="paragraph-small"
                            className="!text-text-secondary"
                          >
                            ข้อมูลโปรไฟล์
                          </Typography>
                        </div>
                        <Label
                          variant="ghost"
                          rounding="pill"
                          size="small"
                          {...getKycBadgeConfig(userData?.kycStatus)}
                        />
                      </div>
                      <div
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-background-secondary cursor-pointer"
                        onClick={() => {
                          router.push('/settings');
                          setIsOpenPopoverAccount(false);
                        }}
                      >
                        <i className="ri-user-settings-line text-xl text-text-secondary"></i>
                        <Typography
                          variant="paragraph-small"
                          className="!text-text-secondary"
                        >
                          ตั้งค่า
                        </Typography>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-md hover:bg-background-secondary cursor-pointer">
                        <div className="flex items-center gap-3">
                          <i className="ri-global-line text-xl text-text-secondary"></i>
                          <Typography
                            variant="paragraph-small"
                            className="!text-text-secondary"
                          >
                            ภาษาไทย (Thai)
                          </Typography>
                        </div>
                        <i className="ri-arrow-right-s-line text-text-quarternary text-xl"></i>
                      </div>
                      <div
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-background-secondary cursor-pointer mt-1"
                        onClick={onLogout}
                      >
                        <i className="ri-logout-box-line text-xl text-text-secondary"></i>
                        <Typography
                          variant="paragraph-small"
                          className="!text-text-secondary"
                        >
                          ออกจากระบบ
                        </Typography>
                      </div>
                    </div>
                  }
                  trigger="click"
                  open={isOpenPopoverAccount}
                  onOpenChange={handleOpenChangeAccount}
                >
                  <Avatar
                    size={48}
                    className="!bg-primary-subtle cursor-pointer !aspect-square !w-12 !h-auto"
                    icon={<i className="ri-user-line text-primary-dark"></i>}
                  />
                </Popover>
                {/* Extra menu */}
                {/* <Popover
                  styles={{
                    body: { padding: '32px 24px' },
                  }}
                  content={
                    <div className="w-[438px]">
                      <MenuList />
                    </div>
                  }
                  trigger="click"
                  open={isOpenPopOverMenu}
                  onOpenChange={handleOpenChangeMenu}
                  placement="bottomLeft"
                >
                  <div className="flex justify-center w-12 rounded-xl h-12 items-center cursor-pointer hover:bg-neutral-bg">
                    <Image
                      src="/assets/icons/menu.svg"
                      alt="menu-icon"
                      className="mx-auto"
                      width={32}
                      height={32}
                      priority={true}
                      quality={100}
                    />
                  </div>
                </Popover> */}
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Badge
                  color="#00af43"
                  count={cartCount}
                  showZero
                  offset={[-4, 4]}
                >
                  {/* <Link href="/cart"> */}
                  <Button
                    size="large"
                    variant="ghost"
                    color="neutral"
                    onClick={() => {
                      setIsLoginVisible(true);
                    }}
                  >
                    <i className="ri-shopping-cart-2-line"></i>
                  </Button>
                  {/* </Link> */}
                </Badge>
                <div className="flex items-center gap-3">
                  <Button
                    variant="solid"
                    onClick={() => setIsLoginVisible(true)}
                  >
                    เข้าสู่ระบบ
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-[64px] overflow-x-auto no-scrollbar w-full px-4 xl:px-[48px]">
            <CustomButton
              icon={<i className="ri-list-check-2"></i>}
              iconPosition="start"
              onClick={() => setIsOpenCategoryDropdown(!isOpenCategoryDropdown)}
              className="flex-shrink-0"
              variant={isOpenCategoryDropdown ? 'solid' : 'outlined'}
              color={isOpenCategoryDropdown ? 'primary' : 'neutral'}
            >
              หมวดหมู่ทั้งหมด
            </CustomButton>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              {['สินค้าตามแบรนด์', 'โปรโมชัน', 'บทความ', 'ร้านค้าประจำ'].map(
                (item) => (
                  <div
                    key={item}
                    className="px-4 py-2 rounded-full bg-background-secondary border border-border-primary whitespace-nowrap cursor-pointer hover:bg-background-tertiary transition-colors flex items-center gap-2"
                  >
                    {item === 'สินค้าตามแบรนด์' && (
                      <i className="ri-list-check-2 text-text-secondary"></i>
                    )}
                    {item === 'โปรโมชัน' && (
                      <i className="ri-price-tag-3-line text-text-secondary"></i>
                    )}
                    {item === 'บทความ' && (
                      <i className="ri-newspaper-line text-text-secondary"></i>
                    )}
                    {item === 'ร้านค้าประจำ' && (
                      <i className="ri-store-2-line text-text-secondary"></i>
                    )}
                    <Typography
                      variant="paragraph-small-medium"
                      className="!text-text-secondary"
                    >
                      {item}
                    </Typography>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      ) : isTablet ? (
        <div>
          <div className="container mx-auto flex flex-col gap-4 w-full py-4 px-4">
            {/* Row 1: Hamburg, Logo, Location, Search, Actions */}
            <div className="flex items-center justify-between gap-4 w-full shrink-1">
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsDrawerVisible(true)}
                  className="text-2xl p-1"
                  aria-label="Open navigation menu"
                >
                  <MenuOutlined style={{ color: '#495569' }} />
                </button>
                <Link href="/" className="flex items-center justify-center">
                  <Image
                    src="/logo-mobile.svg"
                    alt="allkons"
                    width={32}
                    height={32}
                  />
                </Link>
                <ButtonSelectLocation />
              </div>

              {RenderSearch()}

              <div className="flex items-center gap-3">
                <Badge
                  color="#00af43"
                  count={cartCount}
                  showZero
                  offset={[-2, 2]}
                >
                  <Link href="/cart">
                    <i className="ri-shopping-cart-2-line text-2xl text-text-secondary"></i>
                  </Link>
                </Badge>

                {authData ? (
                  <>
                    <Popover
                      content={
                        <div className="w-[380px]">
                          <UserOrganizationMenu
                            setIsOpenPopoverUserMode={(e: boolean) =>
                              setIsOpenPopoverUserMode(e)
                            }
                          />
                        </div>
                      }
                      trigger="click"
                      open={isOpenPopoverUserMode}
                      onOpenChange={handleOpenChangeUserMode}
                    >
                      <div className="relative cursor-pointer">
                        <Avatar
                          size={32}
                          className="!bg-primary-dark"
                          src={currentOrg?.organization.imageUpload}
                        >
                          {!currentOrg?.organization.imageUpload && (
                            <Typography
                              variant="paragraph-small-medium"
                              className="!text-white"
                            >
                              {getFirstChar(
                                currentOrg?.organization.organizeName ||
                                  userData?.name ||
                                  ''
                              )}
                            </Typography>
                          )}
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-info rounded-full border border-white flex items-center justify-center">
                          <i className="ri-building-line text-[8px] text-white"></i>
                        </div>
                      </div>
                    </Popover>

                    <Popover
                      placement="bottomLeft"
                      styles={{
                        body: { padding: 8 },
                      }}
                      content={
                        <div className="w-[260px] flex flex-col gap-1 p-1">
                          <UserProfile user={userData} />
                          <div className="mx-2 mb-2 h-px bg-border-primary" />
                          <div
                            className="flex items-center justify-between p-2 rounded-md hover:bg-background-secondary cursor-pointer"
                            onClick={() => {
                              router.push('/user');
                              setIsOpenPopoverAccount(false);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <i className="ri-user-line text-xl text-text-secondary"></i>
                              <Typography
                                variant="paragraph-small"
                                className="!text-text-secondary"
                              >
                                ข้อมูลโปรไฟล์
                              </Typography>
                            </div>
                            <Label
                              variant="ghost"
                              rounding="pill"
                              size="small"
                              {...getKycBadgeConfig(userData?.kycStatus)}
                            />
                          </div>
                          <div
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-background-secondary cursor-pointer"
                            onClick={() => {
                              router.push('/settings');
                              setIsOpenPopoverAccount(false);
                            }}
                          >
                            <i className="ri-user-settings-line text-xl text-text-secondary"></i>
                            <Typography
                              variant="paragraph-small"
                              className="!text-text-secondary"
                            >
                              ตั้งค่า
                            </Typography>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-md hover:bg-background-secondary cursor-pointer">
                            <div className="flex items-center gap-3">
                              <i className="ri-global-line text-xl text-text-secondary"></i>
                              <Typography
                                variant="paragraph-small"
                                className="!text-text-secondary"
                              >
                                ภาษาไทย (Thai)
                              </Typography>
                            </div>
                            <i className="ri-arrow-right-s-line text-text-quarternary text-xl"></i>
                          </div>
                          <div
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-background-secondary cursor-pointer mt-1"
                            onClick={onLogout}
                          >
                            <i className="ri-logout-box-line text-xl text-text-secondary"></i>
                            <Typography
                              variant="paragraph-small"
                              className="!text-text-secondary"
                            >
                              ออกจากระบบ
                            </Typography>
                          </div>
                        </div>
                      }
                      trigger="click"
                      open={isOpenPopoverAccount}
                      onOpenChange={handleOpenChangeAccount}
                    >
                      <Avatar
                        size={32}
                        className="!bg-primary-subtle cursor-pointer"
                        icon={
                          <i className="ri-user-line text-primary-dark"></i>
                        }
                      />
                    </Popover>
                  </>
                ) : (
                  <Button
                    variant="solid"
                    onClick={() => setIsLoginVisible(true)}
                  >
                    เข้าสู่ระบบ
                  </Button>
                )}
              </div>
            </div>

            {/* Row 2: Categories + Horizontal Menu */}
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1 w-full">
              <CustomButton
                size="small"
                icon={<i className="ri-list-check-2"></i>}
                onClick={() =>
                  setIsOpenCategoryDropdown(!isOpenCategoryDropdown)
                }
                className="flex-shrink-0"
                variant={isOpenCategoryDropdown ? 'solid' : 'outlined'}
                color={isOpenCategoryDropdown ? 'primary' : 'neutral'}
              >
                หมวดหมู่ทั้งหมด
              </CustomButton>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                {['สินค้าตามแบรนด์', 'โปรโมชัน', 'บทความ', 'ร้านค้าประจำ'].map(
                  (item) => (
                    <div
                      key={item}
                      className="px-4 py-1.5 rounded-full bg-background-secondary border border-border-primary whitespace-nowrap cursor-pointer hover:bg-background-tertiary transition-colors flex items-center gap-2"
                    >
                      {item === 'สินค้าตามแบรนด์' && (
                        <i className="ri-list-check-2 text-text-secondary"></i>
                      )}
                      {item === 'โปรโมชัน' && (
                        <i className="ri-price-tag-3-line text-text-secondary"></i>
                      )}
                      {item === 'บทความ' && (
                        <i className="ri-newspaper-line text-text-secondary"></i>
                      )}
                      {item === 'ร้านค้าประจำ' && (
                        <i className="ri-store-2-line text-text-secondary"></i>
                      )}
                      <Typography
                        variant="paragraph-extra-small-medium"
                        className="!text-text-secondary"
                      >
                        {item}
                      </Typography>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="container mx-auto flex flex-col gap-5 w-full py-2 sm:py-4 px-4 justify-center ">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDrawerVisible(true)}
                  className="text-2xl p-2"
                  aria-label="Open navigation menu"
                >
                  <MenuOutlined style={{ color: '#495569' }} />
                </button>
                <Link href="/" className="flex items-center justify-center">
                  <Image
                    src="/logo-mobile.svg"
                    alt="thammasorn"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </Link>
                <ButtonSelectLocation />
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  color="#00af43"
                  count={cartCount}
                  showZero
                  offset={[-4, 4]}
                >
                  <Link href="/cart">
                    <Button variant="ghost" color="neutral">
                      <i className="ri-shopping-cart-2-line text-xl"></i>
                    </Button>
                  </Link>
                </Badge>
              </div>
            </div>
          </div>
          {RenderSearch()}
        </div>
      )}
    </div>
  );
};

export default Navbar;
