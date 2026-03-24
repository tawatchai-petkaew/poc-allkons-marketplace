import { IDefaultQueryPagination } from '@/common/interfaces/common.interface';
import Cookies from 'js-cookie';
import { customerAPI } from '../../../utils/axios';

const prefix = '/v2/buyer-address';

export interface IAddressRequest {
  id?: number;
  userId: number;
  organizeId: number;
  addressType: string;
  contactName: string;
  contactPhoneNumber: string;
  countryId: number;
  provinceId: number;
  districtId: number;
  subDistrictId: number;
  zipcodeId: number;
  countryName: string;
  provinceName: string;
  districtName: string;
  subDistrictName: string;
  zipcodeName: string;
  projectId: number;
  addressName: string;
  addressInfo: string;
  remark: string;
  latitude: string;
  longitude: string;
  isDefault: boolean;
  status: string;
  cisNumber: string;
}

const auth = Cookies.get('auth');
const authData = auth ? JSON.parse(auth) : null;

export const getAdresses = async (params: IDefaultQueryPagination) => {
  const { data } = await customerAPI.get(
    `${prefix}?page=${params.page}&pageLimit=${params.pageLimit}`,
    {
      headers: {
        Authorization: `Bearer ${authData?.accessToken}`,
      },
    }
  );
  return data;
};

export const getAddressById = async (id: number) => {
  const { data } = await customerAPI.get(`${prefix}/${id}`, {
    headers: {
      Authorization: `Bearer ${authData?.accessToken}`,
    },
  });
  return data;
};

export const createAddress = async (data: IAddressRequest) => {
  const { data: responseData } = await customerAPI.post(`${prefix}`, data, {
    headers: {
      Authorization: `Bearer ${authData?.accessToken}`,
    },
  });
  return responseData;
};

export const updateAddress = async (id: number, data: IAddressRequest) => {
  const { data: responseData } = await customerAPI.patch(
    `${prefix}/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${authData?.accessToken}`,
      },
    }
  );
  return responseData;
};

export const deleteAddressById = async (id: number) => {
  const { data } = await customerAPI.delete(`${prefix}/${id}`, {
    headers: {
      Authorization: `Bearer ${authData?.accessToken}`,
    },
  });
  return data;
};
