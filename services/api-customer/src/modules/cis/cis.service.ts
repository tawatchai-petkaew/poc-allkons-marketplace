import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';

import axios, { AxiosError } from 'axios';
import {
  CheckExistEmailCis,
  CreateContactProfileCis,
  CreateCustomerPlatform,
  CreateOraganiztionProfileCis,
  CreateProfileCis,
  CreateRelationshipCis,
  DocumentAttachItem,
  FindAllMasterDataRequest,
  GetAttachDocumentsRequest,
  GetDocumentRequest,
  GetFileDocumentsRequest,
  UpdateStatusVerifyRequest,
  UpdateUserValueCis,
  CreateCustomerAddressCis,
  AddVerifyUserInfoCis,
  GetVerifyUserInfoCis,
  GetCustomerAddressDetailCis,
  UpdateCustomerAddressCis,
  UpdatePersonalProfileCis,
  UpdateJuristicProfileCis,
  CustomerCheckExistRequest,
  GetCustomerRelationShip,
  UpdateContactProfileCis,
  DeleteContactProfileCis,
} from './interfaces/api-request.interface';
import {
  CustomerProfileType,
  KycStatusCIS,
  PlatformCIS,
  RelationTypeCIS,
  UsagePurposeTypeCIS,
  DocumentAttachType,
  CustomerStatusCIS,
  ContactTypeCIS,
} from './enum/cis.enum';
import { CallApiErrorHandler } from '../../utils/helpers';
import {
  AddressFindOneResponse,
  CisResponse,
} from './interfaces/api-response.interface';
import { UserInfo } from '../register/interface/register.interface';
import { Platform } from '@/model/organization-contact.entity';
import { CommonService } from '../common/common.service';
import { AutoTrace } from 'allkons-api-helper';

@Injectable()
@AutoTrace(process.env.OTEL_SERVICE_NAME)
export class CisService {
  constructor(
    @Inject('CIS_API_KEY') private readonly cisApiKey: string,
    @Inject('CIS_PLATFORM_SELLER_KEY') private readonly cisPlatformKey: string,
    @Inject('CIS_PLATFORM_BUYER_KEY')
    private readonly cisPlatformBuyerKey: string,
    @Inject('CIS_URL') private readonly cisUrl: string,
    @Inject('APP_ID_SELLER') private readonly appIdSeller: string,
    @Inject('APP_ID_BUYER') private readonly appIdBuyer: string,
    private readonly commonService: CommonService,
  ) {}

  private async getHeaders(
    platform: Platform = Platform.SELLER,
  ): Promise<Record<string, string>> {
    return {
      'cis360-api-key': this.cisApiKey,
      'platform-key':
        platform === Platform.SELLER
          ? this.cisPlatformKey
          : this.cisPlatformBuyerKey, //false for buyer platform
      'Accept-Encoding': 'identity',
    };
  }

  /**
   * Create a personal profile in CIS
   * @param userInfo - User information to create profile
   * @param acceptTerms - Whether the user accepts terms and conditions
   * @param customerStatus - Customer status for the profile
   * @returns Promise with CIS number and status
   */
  async createPersonalProfile(
    userInfo: UserInfo,
    acceptTerms: boolean = false,
    customerStatus: CustomerStatusCIS = CustomerStatusCIS.VISITOR,
  ): Promise<{ cis_number: string; status: string }> {
    const url = `${this.cisUrl}/personal/create-personal`;
    const headers = await this.getHeaders();

    const body: CreateProfileCis = {
      app_id: this.appIdSeller,
      allkons_id: null,
      first_name: userInfo.firstName,
      middle_name: userInfo.midName,
      last_name: userInfo.lastName,
      is_allow_concern: acceptTerms,
      customer_status: customerStatus,
      active_status: true,
    };
    try {
      const response = await axios.post(url, body, {
        headers,
        // decompress: false,
      });
      return {
        cis_number: response.data.data.cis_number,
        status: 'SUCCESS',
      };
    } catch (error) {
      CallApiErrorHandler.handleApiError(
        error as AxiosError,
        'Failed to create personal profile',
      );
    }
  }

  async createContactProfile(
    body: CreateContactProfileCis,
    organizeId?: number,
  ): Promise<CisResponse> {
    const url = `${this.cisUrl}/customer-contact/create-customer-contact`;
    const headers = await this.getHeaders();
    try {
      const response = await axios.post(url, body, {
        headers,
        decompress: false,
      });
      if (!response?.data?.data) {
        throw new HttpException(
          {
            message: 'Create contact profile failed: No data returned',
            data: { code: 'CREATE_CONTACT_PROFILE_FAILED' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return response.data;
    } catch (error) {
      await this.commonService.writeLog(
        `${this.cisUrl}/customer-contact/create-customer-contact`,
        'createContactProfile',
        JSON.stringify(body),
        JSON.stringify(error.response),
        organizeId,
        null,
      );
      console.error('Error creating contact profile:', error);
      if (error instanceof HttpException) {
        throw error; // Re-throw custom HTTP exceptions
      }
      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        {
          message: 'Failed to create contact profile in CIS',
          code: 'CIS_CONTACT_PROFILE_CREATE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createPlatformAssociation(
    cisNumber: string,
    platform: PlatformCIS = PlatformCIS.ALLKONS_M_SELLER,
  ) {
    const url = `${this.cisUrl}/customer-to-platform/create-customer-to-platform`;
    const headers = await this.getHeaders();

    const body: CreateCustomerPlatform = {
      app_id:
        platform === PlatformCIS.ALLKONS_M_SELLER
          ? this.appIdSeller
          : this.appIdBuyer,
      cis_number: cisNumber,
      platform: platform,
      create_relationship_date: new Date().toISOString(),
      active_status: true,
    };
    try {
      const response = await axios.post(url, body, {
        headers,
        decompress: false,
      });
      return {
        data: response.data.data,
        status: 'SUCCESS',
      };
    } catch (error) {
      CallApiErrorHandler.handleApiError(
        error as AxiosError,
        'Failed to link platform',
      );
    }
  }

  async createJuristicProfile(
    organizeInfo,
    platform: Platform = Platform.SELLER,
  ): Promise<{ cis_number: string; status: string }> {
    const url = `${this.cisUrl}/juristic/create-juristic`;
    const headers = await this.getHeaders(platform);

    const body: CreateOraganiztionProfileCis = {
      app_id: platform === Platform.SELLER ? this.appIdSeller : this.appIdBuyer,
      customer_profile_type: organizeInfo.customer_profile_type,
      customer_status: organizeInfo.customer_status,
      juristic_name: organizeInfo.juristic_name,
      juristic_type: organizeInfo.juristic_type,
      juristic_type_remark: organizeInfo.juristic_type_remark || null,
      branch_number: organizeInfo.branch_number || null,
      organize_type: organizeInfo.organize_type,
      tax_id: organizeInfo.tax_id || null,
      contact_shown_highest_authority: false,
      is_dopa: true,
      is_dbd: true,
      kyc_status: organizeInfo.kyc_status || KycStatusCIS.NONE,
      active_status: true,
    };

    if (organizeInfo?.businessRegistration) {
      body.business_registration = {
        business_name: organizeInfo.businessRegistration.business_name,
        registration_number:
          organizeInfo.businessRegistration.registration_number,
      };
    }

    try {
      const response = await axios.post(url, body, {
        headers,
        decompress: false,
      });
      return {
        cis_number: response.data.data.cis_number,
        status: 'SUCCESS',
      };
    } catch (error) {
      CallApiErrorHandler.handleApiError(
        error as AxiosError,
        'Failed to create juristic profile',
      );
    }
  }

  async createRelationship(
    cisNumber: string,
    relateCisNumber: string,
    relationshipType: string,
    role: string,
    isOwner: boolean,
    platform: Platform = Platform.SELLER,
  ): Promise<{ cis_number: string; status: string }> {
    const url = `${this.cisUrl}/customer-to-customer/create-customer-to-customer`;
    const headers = await this.getHeaders(platform);

    const body: CreateRelationshipCis = {
      app_id: platform === Platform.SELLER ? this.appIdSeller : this.appIdBuyer,
      cis_number: cisNumber,
      related_cis_number: relateCisNumber,
      relationship_type:
        RelationTypeCIS[relationshipType as keyof typeof RelationTypeCIS],
      create_relationship_date: new Date().toISOString(),
      role: role,
      is_owner: isOwner,
    };
    try {
      const response = await axios.post(url, body, {
        headers,
        decompress: false,
      });
      return {
        cis_number: response.data.data.id,
        status: 'SUCCESS',
      };
    } catch (error) {
      CallApiErrorHandler.handleApiError(
        error as AxiosError,
        'Failed to create relation',
      );
    }
  }

  async checkExistEmail(email: string) {
    const url = `${this.cisUrl}/customer/customer-check`;
    const headers = await this.getHeaders();

    const body: CheckExistEmailCis = {
      app_id: this.appIdSeller,
      customer_profile_type: CustomerProfileType.PERSONAL,
      email_platform: PlatformCIS.ALLKONS_M_SELLER,
      email: email,
      email_usage_purpose: UsagePurposeTypeCIS.NONE_SPECIFIED,
    };
    try {
      const response = await axios.post(url, body, {
        headers,
        decompress: false,
      });
      return {
        data: response.data.data,
        status: 'SUCCESS',
      };
    } catch (error) {
      CallApiErrorHandler.handleApiError(
        error as AxiosError,
        'Failed to check email existence',
      );
    }
  }

  async updateUserValue(
    cisNumber: string,
    type: string,
    values: number[],
    businessTypeDescription?: string,
  ) {
    const url = `${this.cisUrl}/customer/update-values-user`;
    const headers = await this.getHeaders();

    const body: UpdateUserValueCis = {
      app_id: this.appIdSeller,
      cis_number: cisNumber,
      type: type,
      values: values,
    };

    if (businessTypeDescription) {
      body.other_description = businessTypeDescription;
    }

    try {
      const response = await axios.post(url, body, {
        headers,
        decompress: false,
      });
      return {
        data: response.data.data,
        status: 'SUCCESS',
      };
    } catch (error) {
      CallApiErrorHandler.handleApiError(
        error as AxiosError,
        'Failed to update value user',
      );
    }
  }

  async addVerifyUserInfo(
    userVerifyInfo: AddVerifyUserInfoCis,
    userId: number,
  ): Promise<CisResponse> {
    const url = `${this.cisUrl}/personal/add-verify-personal-info`;
    const headers = await this.getHeaders();

    try {
      const response = await axios.post(url, userVerifyInfo, {
        headers,
        decompress: false,
      });
      if (!response?.data?.data) {
        throw new HttpException(
          {
            message: 'Add verify user info failed',
            data: {
              code: 'ADD_VERIFY_USER_INFO_FAILED',
              cisMessage: response.data.message || 'Unknown error',
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return response.data;
    } catch (error) {
      await this.commonService.writeLog(
        `${this.cisUrl}/personal/add-verify-personal-info`,
        'approveCis',
        JSON.stringify(userVerifyInfo),
        JSON.stringify(error.response),
        null,
        userId,
      );
      if (error instanceof HttpException) {
        throw {
          ...error,
          url: `${this.cisUrl}/personal/add-verify-personal-info`,
        }; // Re-throw custom HTTP exceptions
      }

      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          message: 'Failed to add verify user info in CIS',
          code: 'CIS_VERIFY_USER_INFO_ADD_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllMasterData(masterCode: string) {
    const url = `${this.cisUrl}/master-data/find-all`;
    const headers = await this.getHeaders();

    const body: FindAllMasterDataRequest = {
      app_id: this.appIdSeller,
      is_delete: false,
      master_code: masterCode,
      active_status: true,
    };

    try {
      const response = await axios.post<{
        data: [];
        code?: string;
        message?: string;
      }>(url, body, { headers, decompress: false });

      // Check if response contains error code
      if (
        response.data.code === '4001' ||
        response.data.message === 'bad request'
      ) {
        throw new HttpException(
          {
            code: response.data.code,
            message: response.data.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      let data = response.data.data;

      if (masterCode === 'ROLE_BUSINESS') {
        data = await this.mapRoleBusinessType(data);
      }
      return {
        data: data,
        status: 'SUCCESS',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw custom HTTP exceptions
      }
      CallApiErrorHandler.handleApiError(
        error as AxiosError,
        'Failed to fetch master data',
      );
    }
  }

  mapRoleBusinessType(data: any) {
    // Deep copy to avoid mutating original data
    const businessType = data.map((item) => ({ ...item }));
    const ungroupData = businessType?.filter((item) => !item?.parent_ref);
    const groupData = businessType?.filter((item) => item?.parent_ref);
    // Deep copy ungroupData to avoid mutating original objects
    const ungroupWithChildren = ungroupData.map((item) => ({
      ...item,
      children: [],
    }));
    groupData.forEach((el) => {
      const parent = ungroupWithChildren.find(
        (item) => el.parent_ref === item.code,
      );
      if (parent) {
        parent.children.push({ ...el });
      }
    });
    return ungroupWithChildren;
  }

  /**
   * Upload a document to the API
   * @param appId - Application ID
   * @param file - File to upload
   * @returns Promise with upload response
   */
  async uploadDocument(
    appId: string,
    file: Express.Multer.File,
    platform: Platform = Platform.SELLER,
  ): Promise<CisResponse> {
    try {
      const formData = new FormData();
      formData.append('app_id', appId);
      formData.append(
        'file',
        new Blob([file.buffer as any]),
        file.originalname,
      );
      //formData.append('file', new Blob([file.buffer]), file.originalname);
      const url = `${this.cisUrl}/document/upload-document`;
      const headers = {
        ...(await this.getHeaders(platform)),
      };

      const fetchResponse = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json().catch(() => ({}));
        throw new HttpException(
          errorData.message ||
            `Error: ${fetchResponse.status} ${fetchResponse.statusText}`,
          fetchResponse.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const responseData = await fetchResponse.json();
      if (!responseData?.data?.id) {
        throw new HttpException(
          'Document upload failed: No document ID returned',
          HttpStatus.BAD_REQUEST,
        );
      }

      return responseData;
    } catch (error) {
      console.error('Error uploading document:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: 'Failed to upload document to CIS',
          code: 'CIS_DOCUMENT_UPLOAD_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Attach documents to a customer/application
   * @param appId - Application ID
   * @param cisNumber - Customer Information System number
   * @param documents - Array of documents to attach
   * @returns Promise with attachment response
   */
  async attachDocument(
    appId: string,
    cisNumber: string,
    documents: DocumentAttachItem[],
    platform: Platform = Platform.SELLER,
  ): Promise<CisResponse> {
    const url = `${this.cisUrl}/document/attach-document`;
    const headers = await this.getHeaders(platform);
    try {
      const body = {
        app_id: appId,
        cis_number: cisNumber,
        documents,
      };

      const response = await axios.post(url, body, {
        headers,
        decompress: false,
      });
      if (!response?.data?.data) {
        throw new HttpException(
          'Document attachment failed: No data returned',
          HttpStatus.BAD_REQUEST,
        );
      }
      return response.data;
    } catch (error) {
      console.error('Error attaching documents:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Error attaching documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update verification status for a customer
   * @param appId - Application ID
   * @param cisNumber - Customer Information System number
   * @param status - Verification status (APPROVE or REJECT)
   * @returns Promise with response
   */
  async updateStatusVerify(
    appId: string,
    cisNumber: string,
    status: KycStatusCIS,
  ): Promise<CisResponse> {
    try {
      const requestBody: UpdateStatusVerifyRequest = {
        app_id: appId,
        cis_number: cisNumber,
        status,
      };

      const response = await axios.post(
        `${this.cisUrl}/data-verify/update-status-verify`,
        requestBody,
        {
          headers: await this.getHeaders(),
        },
      );
      if (!response?.data?.data) {
        throw new HttpException(
          'Update verification status failed: No data returned',
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error updating verification status:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Error updating verification status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get attached documents from CIS system
   * @param appId - Application ID
   * @param cisNumber - Customer Information System number
   * @param documentAttachType - Type of document to retrieve
   * @param isExpire - Filter by expiry status (optional)
   * @param isDelete - Filter by delete status (optional)
   * @returns Promise with attached documents response
   */
  async getAttachDocuments(
    appId: string,
    cisNumber: string,
    documentAttachType: DocumentAttachType,
    isExpire?: boolean | null,
    isDelete?: boolean | null,
  ): Promise<CisResponse> {
    try {
      const requestBody: GetAttachDocumentsRequest = {
        app_id: appId,
        cis_number: cisNumber,
        document_attach_type: documentAttachType,
        is_expire: isExpire,
        is_delete: isDelete,
      };

      const url = `${this.cisUrl}/document/get-attach-documents`;
      const response = await axios.post(url, requestBody, {
        headers: await this.getHeaders(),
      });

      if (!response?.data?.data) {
        throw new HttpException(
          {
            message: 'No attached documents found',
            data: { code: 'NO_ATTACHED_DOCUMENTS' },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error getting attached documents:', error);
      if (error instanceof HttpException) {
        throw error;
      }

      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        'Failed to get attached documents from CIS',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get document by ID from CIS system
   * @param appId - Application ID
   * @param documentId - Document ID to retrieve
   * @returns Promise with document response
   */
  async getDocumentById(
    appId: string,
    documentId: string,
  ): Promise<CisResponse> {
    try {
      const requestBody: GetDocumentRequest = {
        app_id: appId,
        id: documentId,
      };

      const url = `${this.cisUrl}/document/get-document`;
      const response = await axios.post(url, requestBody, {
        headers: await this.getHeaders(),
      });

      if (!response?.data?.data) {
        throw new HttpException(
          {
            message: 'Document not found',
            data: { code: 'DOCUMENT_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error getting document:', error);
      if (error instanceof HttpException) {
        throw error;
      }

      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          message: 'Failed to get document from CIS',
          code: 'CIS_DOCUMENT_FETCH_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get file documents by file path from CIS system
   * @param appId - Application ID
   * @param filePath - File path to retrieve documents
   * @returns Promise with file as Buffer (byte array)
   */
  async getFileDocuments(appId: string, filePath: string): Promise<Buffer> {
    try {
      const requestBody: GetFileDocumentsRequest = {
        app_id: appId,
        file_path: filePath,
      };

      const url = `${this.cisUrl}/document/get-file-documents`;
      const response = await axios.post(url, requestBody, {
        headers: await this.getHeaders(),
        responseType: 'arraybuffer',
      });

      if (!response?.data) {
        throw new HttpException(
          {
            message: 'File documents not found',
            data: { code: 'FILE_DOCUMENTS_NOT_FOUND' },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error getting file documents:', error);
      if (error instanceof HttpException) {
        throw error;
      }

      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          message: 'Failed to get file documents from CIS',
          code: 'CIS_FILE_DOCUMENTS_FETCH_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Unattach documents from a customer/application
   * @param appId - Application ID
   * @param cisNumber - Customer Information System number
   * @param documents - Array of documents to unattach
   * @returns Promise with unattach response
   */
  async unattachDocument(
    appId: string,
    cisNumber: string,
    documents: Array<{
      document_attach_type: DocumentAttachType;
      document_id: string;
    }>,
  ): Promise<CisResponse> {
    try {
      const requestBody = {
        app_id: appId,
        cis_number: cisNumber,
        documents,
      };

      const url = `${this.cisUrl}/document/unattach-document`;
      const response = await axios.post(url, requestBody, {
        headers: await this.getHeaders(),
      });

      if (!response?.data?.data) {
        throw new HttpException(
          {
            message: 'Unattach documents failed: No data returned',
            data: { code: 'UNATTACH_DOCUMENTS_FAILED' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error unattaching documents:', error);
      if (error instanceof HttpException) {
        throw error;
      }

      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          message: 'Failed to unattach documents from CIS',
          code: 'CIS_DOCUMENT_UNATTACH_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete documents from CIS system
   * @param appId - Application ID
   * @param ids - Array of document IDs to delete
   * @returns Promise with delete response
   */
  async deleteDocument(
    appId: string,
    ids: string[],
    platform: Platform = Platform.SELLER,
  ): Promise<CisResponse> {
    try {
      const requestBody = {
        app_id: appId,
        ids,
      };

      const url = `${this.cisUrl}/document/delete-document`;
      const response = await axios.post(url, requestBody, {
        headers: await this.getHeaders(platform),
      });

      if (!response?.data?.data) {
        throw new HttpException(
          {
            message: 'Delete documents failed: No data returned',
            data: { code: 'DELETE_DOCUMENTS_FAILED' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error deleting documents:', error);
      if (error instanceof HttpException) {
        throw error;
      }

      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          message: 'Failed to delete documents from CIS',
          code: 'CIS_DOCUMENT_DELETE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create customer address in CIS system
   * @body userAddressInfo - User address information
   * @returns Promise with customer address creation response
   */
  async createCustomerAddress(
    userAddressInfo: CreateCustomerAddressCis,
    platform: Platform = Platform.SELLER,
  ): Promise<CisResponse> {
    const url = `${this.cisUrl}/customer-address/create-customer-address`;
    const headers = await this.getHeaders(platform);
    try {
      const response = await axios.post(url, userAddressInfo, {
        headers,
        decompress: false,
      });
      if (!response?.data?.data) {
        throw new HttpException(
          {
            message: 'Create customer address failed',
            data: {
              code: 'CREATE_CUSTOMER_ADDRESS_FAILED',
              cisMessage: response.data?.message || 'No message',
              cisError: response.data?.error || null,
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error creating customer address:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          message: 'Failed to create customer address in CIS',
          code: 'CIS_CUSTOMER_ADDRESS_CREATE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get verify personal info from CIS system
   * @param cisNumber - Customer Information System number
   * @returns Promise with verify personal info response
   */
  async getVerifyUserInfo(
    appId: string,
    cisNumber: string,
  ): Promise<CisResponse> {
    const url = `${this.cisUrl}/personal/get-verify-personal-info`;
    const headers = await this.getHeaders();

    const body: GetVerifyUserInfoCis = {
      app_id: appId,
      cis_number: cisNumber,
    };

    try {
      const response = await axios.post(url, body, {
        headers,
        decompress: false,
      });

      if (!response?.data) {
        throw new HttpException(
          {
            message: 'Get verify user info failed: No data returned',
            data: { code: 'GET_VERIFY_USER_INFO_FAILED' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error getting verify user info:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          message: 'Failed to get verify user info from CIS',
          code: 'CIS_GET_VERIFY_USER_INFO_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateVerifyUserInfo(
    userVerifyInfo: AddVerifyUserInfoCis,
  ): Promise<CisResponse> {
    const url = `${this.cisUrl}/personal/update-verify-personal-info`;
    const headers = await this.getHeaders();

    try {
      const response = await axios.post(url, userVerifyInfo, {
        headers,
        decompress: false,
      });
      if (!response?.data?.data) {
        throw new HttpException(
          {
            message: 'Update verify user info failed to cis',
            data: {
              code: 'UPDATE_VERIFY_USER_INFO_FAILED',
              cisMessage: response.data?.message
                ? response.data.message
                : 'Unknown error',
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return response.data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw custom HTTP exceptions
      }

      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        {
          message: 'Failed to update verify user info in CIS',
          code: 'CIS_VERIFY_USER_INFO_UPDATE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get customer address detail from CIS system
   * @param addressDetailInfo - Customer address detail information
   * @returns Promise with customer address detail response
   */
  async getCustomerAddressDetail(
    addressDetailInfo: GetCustomerAddressDetailCis,
  ): Promise<CisResponse> {
    const url = `${this.cisUrl}/customer-address/customer-address-search`;
    const headers = await this.getHeaders();

    try {
      const response = await axios.post(url, addressDetailInfo, {
        headers,
        decompress: false,
      });

      if (!response?.data) {
        throw new HttpException(
          {
            message: 'Get customer address detail failed: No data returned',
            data: { code: 'GET_CUSTOMER_ADDRESS_DETAIL_FAILED' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error getting customer address detail:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          message: 'Failed to get customer address detail from CIS',
          code: 'CIS_GET_CUSTOMER_ADDRESS_DETAIL_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create customer address in CIS system
   * @body userAddressInfo - User address information
   * @returns Promise with customer address creation response
   */
  async updateCustomerAddress(
    userAddressInfo: UpdateCustomerAddressCis,
    platform: Platform = Platform.SELLER,
  ): Promise<CisResponse> {
    const url = `${this.cisUrl}/customer-address/update-customer-address`;
    const headers = await this.getHeaders(platform);
    try {
      const response = await axios.post(url, userAddressInfo, {
        headers,
        decompress: false,
      });
      if (!response?.data) {
        throw new HttpException(
          {
            message: 'Update customer address failed: No data returned',
            data: { code: 'UPDATE_CUSTOMER_ADDRESS_FAILED' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error update customer address:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        {
          message: 'Failed to update customer address in CIS',
          code: 'CIS_CUSTOMER_ADDRESS_UPDATE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete customer address in CIS system
   * @param id - ID of the address to delete
   * @returns Promise with customer address deletion response
   */
  async deleteCustomerAddress(
    id: string,
    platform: Platform = Platform.SELLER,
  ): Promise<CisResponse> {
    const url = `${this.cisUrl}/customer-address/delete-customer-address`;
    const headers = await this.getHeaders(platform);

    const body = {
      app_id: platform === Platform.SELLER ? this.appIdSeller : this.appIdBuyer,
      id: id,
    };

    try {
      const response = await axios.post(url, body, {
        headers,
        decompress: false,
      });
      if (!response?.data) {
        throw new HttpException(
          {
            message: 'Delete customer address failed: No data returned',
            data: { code: 'DELETE_CUSTOMER_ADDRESS_FAILED' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error deleting customer address:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        {
          message: 'Failed to delete customer address in CIS',
          code: 'CIS_CUSTOMER_ADDRESS_DELETE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update personal profile in CIS system
   * @param personalProfileInfo - Personal profile information to update
   * @returns Promise with personal profile update response
   */
  async updatePersonalProfile(
    personalProfileInfo: UpdatePersonalProfileCis,
  ): Promise<CisResponse> {
    const url = `${this.cisUrl}/personal/update-personal`;
    const headers = await this.getHeaders();

    try {
      const response = await axios.post(url, personalProfileInfo, {
        headers,
        decompress: false,
      });
      if (!response?.data?.data) {
        throw new HttpException(
          {
            message: 'Update personal profile failed: No data returned',
            data: { code: 'UPDATE_PERSONAL_PROFILE_FAILED' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error updating personal profile:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          message: 'Failed to update personal profile in CIS',
          code: 'CIS_UPDATE_PERSONAL_PROFILE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateJuristicProfile(
    body: UpdateJuristicProfileCis,
    platform: Platform = Platform.SELLER,
  ): Promise<CisResponse> {
    const url = `${this.cisUrl}/juristic/update-juristic`;
    const headers = await this.getHeaders(platform);

    try {
      const response = await axios.post(url, body, {
        headers,
        decompress: false,
      });

      // Check if response contains error code
      if (
        response.data.code === '4001' ||
        response.data.error === 'Bad Request'
      ) {
        throw new HttpException(
          {
            message:
              response.data.error + ' from cis api update juristic' ||
              response.data.message ||
              'Bad Request',
            code: response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!response?.data?.data) {
        throw new HttpException(
          {
            message: 'Update juristic profile failed: No data returned',
            data: {
              code: 'UPDATE_JURISTIC_PROFILE_FAILED',
              cisResponse: response?.data,
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error updating juristic profile:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          message: 'Failed to update juristic profile in CIS',
          code: 'CIS_UPDATE_JURISTIC_PROFILE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateCustomerContactDetail(
    cisNumber: string,
    contact: { contactType: ContactTypeCIS; contactDetail: string },
  ) {
    const appId = process.env.APP_ID_SELLER;
    const url = `${this.cisUrl}/customer-contact/customer-contact-detail`;
    const headers = {
      ...(await this.getHeaders()),
      'Content-Type': 'application/json',
    };

    const body = {
      app_id: appId,
      cis_number: cisNumber,
      platform: 2,
      usage_purpose_type: 1,
      contact_type: contact?.contactType,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const result = await response.json();

    if (result?.code === 4002 || result?.message === 'data not found') {
      const a = await this.createContactProfile({
        ...body,
        ...{ contact: contact?.contactDetail },
        active_status: false,
        is_verify: false,
        is_default: false,
        is_kyc_document: false,
      });
    }

    if (result?.message === 'success') {
      await this.updateCustomerContact(result?.data?.id, contact);
    }
  }

  async updateCustomerContact(
    id: string,
    contact: { contactType: ContactTypeCIS; contactDetail: string },
  ) {
    const appId = process.env.APP_ID_SELLER;
    const url = `${this.cisUrl}/customer-contact/update-customer-contact`;
    const headers = {
      ...(await this.getHeaders()),
      'Content-Type': 'application/json',
    };

    const body = {
      app_id: appId,
      id,
      platform: 2,
      usage_purpose_type: 1,
      contact_type: contact?.contactType,
      contact: contact?.contactDetail,
      is_verify: false,
      is_default: true,
      is_kyc_document: false,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const result = await response.json();

    if (result?.message !== 'success') {
      throw new HttpException(
        {
          message: 'Failed to update customer contact',
          code: 'FAILED_TO_UPDATE_CUSTOMER_CONTACT',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async customerCheckExist(
    payload: CustomerCheckExistRequest,
  ): Promise<{ data: { found: boolean; kycStatus: boolean } }> {
    const url = `${this.cisUrl}/customer/customer-check-exist`;
    const headers = await this.getHeaders();

    try {
      // const response = await axios.post(url, payload, { headers, decompress: false });
      return {
        data: {
          found: false,
          kycStatus: true,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        {
          message: 'Failed to check customer existence in CIS',
          code: 'CIS_CUSTOMER_CHECK_EXIST_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get customer address detail from CIS system
   * @param addressDetailInfo - Customer address detail information
   * @returns Promise with customer address detail response
   */
  async getCustomerAddressDetailById(
    platform: Platform = Platform.SELLER,
    addressDetailInfo: GetCustomerAddressDetailCis,
  ): Promise<AddressFindOneResponse> {
    const url = `${this.cisUrl}/customer-address/customer-address-detail`;
    const headers = await this.getHeaders(platform);

    try {
      const response = await axios.post(url, addressDetailInfo, {
        headers,
        decompress: false,
      });

      if (!response?.data) {
        throw new HttpException(
          {
            message: 'Get customer address detail failed: No data returned',
            data: { code: 'GET_CUSTOMER_ADDRESS_DETAIL_FAILED' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error getting customer address detail:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          message: 'Failed to get customer address detail from CIS',
          code: 'CIS_GET_CUSTOMER_ADDRESS_DETAIL_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findMasterDataById(platform: Platform = Platform.SELLER, payload) {
    const url = `${this.cisUrl}/master-data/find-by-id`;
    const headers = await this.getHeaders(platform);

    try {
      const response = await axios.post(url, payload, {
        headers,
        decompress: false,
      });

      if (!response?.data) {
        throw new HttpException(
          {
            message: 'Get master data by ID failed: No data returned',
            data: { code: 'CIS_GET_MASTER_DATA_ERROR' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error getting master data detail:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          message: 'Failed to get master data from CIS',
          code: 'CIS_GET_MASTER_DATA_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCustomerRelationShip(
    cisNumber: string,
    relateCisNumber: string,
    relationshipType: string,
    platform: Platform = Platform.SELLER,
  ) {
    const url = `${this.cisUrl}/customer-to-customer/customer-to-customer-detail`;
    const headers = await this.getHeaders(platform);
    const body: GetCustomerRelationShip = {
      app_id: platform === Platform.SELLER ? this.appIdSeller : this.appIdBuyer,
      cis_number: cisNumber,
      related_cis_number: relateCisNumber,
      relationship_type:
        RelationTypeCIS[relationshipType as keyof typeof RelationTypeCIS],
    };

    try {
      const response = await axios.post(url, body, {
        headers,
        decompress: false,
      });
      return {
        cis_number: response.data.data,
        status: 'SUCCESS',
      };
    } catch (error) {
      CallApiErrorHandler.handleApiError(
        error as AxiosError,
        'Failed to create relation',
      );
    }
  }

  async deleteCustomerRelationShip(
    cisNumber: string,
    platform: Platform = Platform.SELLER,
  ) {
    const url = `${this.cisUrl}/customer-to-customer/delete-customer-to-customer`;
    const headers = await this.getHeaders(platform);
    const body: any = {
      app_id: platform === Platform.SELLER ? this.appIdSeller : this.appIdBuyer,
      id: cisNumber,
    };

    try {
      const response = await axios.post(url, body, {
        headers,
        decompress: false,
      });
      return {
        cis_number: response.data.data,
        status: 'SUCCESS',
      };
    } catch (error) {
      CallApiErrorHandler.handleApiError(
        error as AxiosError,
        'Failed to create relation',
      );
    }
  }

  async customerContactSearch(
    cisNumber: string,
    platform: Platform = Platform.SELLER,
  ) {
    const url = `${this.cisUrl}/customer-contact/customer-contact-search`;
    const headers = await this.getHeaders(platform);
    const body: any = {
      app_id: platform === Platform.SELLER ? this.appIdSeller : this.appIdBuyer,
      cis_number: cisNumber,
      active_status: true,
      is_delete: false,
    };

    try {
      const response = await axios.post(url, body, {
        headers,
        decompress: false,
      });
      return response.data.data;
    } catch (error) {
      CallApiErrorHandler.handleApiError(
        error as AxiosError,
        'Failed to customer contact search',
      );
    }
  }

  async newUpdateContactProfile(
    body: UpdateContactProfileCis,
    organizeId?: number,
  ): Promise<CisResponse> {
    const url = `${this.cisUrl}/customer-contact/update-customer-contact`;
    const headers = await this.getHeaders();
    try {
      const response = await axios.post(url, body, {
        headers,
        decompress: false,
      });
      if (!response?.data?.data) {
        throw new HttpException(
          {
            message: 'Update contact profile failed: No data returned',
            data: { code: 'UPDATE_CONTACT_PROFILE_FAILED' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return response.data;
    } catch (error) {
      await this.commonService.writeLog(
        `${this.cisUrl}/customer-contact/update-customer-contact`,
        'updateContactProfile',
        JSON.stringify(body),
        JSON.stringify(error.response),
        organizeId,
        null,
      );
      console.error('Error update contact profile:', error);
      if (error instanceof HttpException) {
        throw error; // Re-throw custom HTTP exceptions
      }
      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        {
          message: 'Failed to update contact profile in CIS',
          code: 'CIS_CONTACT_PROFILE_UPDATE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteContactProfile(
    body: DeleteContactProfileCis,
    organizeId?: number,
  ): Promise<CisResponse> {
    const url = `${this.cisUrl}/customer-contact/delete-customer-contact`;
    const headers = await this.getHeaders();
    try {
      const response = await axios.post(url, body, {
        headers,
        decompress: false,
      });
      if (!response?.data?.data) {
        throw new HttpException(
          {
            message: 'Delete contact profile failed: No data returned',
            data: { code: 'DELETE_CONTACT_PROFILE_FAILED' },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return response.data;
    } catch (error) {
      await this.commonService.writeLog(
        `${this.cisUrl}/customer-contact/delete-customer-contact`,
        'deleteContactProfile',
        JSON.stringify(body),
        JSON.stringify(error.response),
        organizeId,
        null,
      );
      console.error('Error delete contact profile:', error);
      if (error instanceof HttpException) {
        throw error; // Re-throw custom HTTP exceptions
      }
      if (error.response?.data) {
        throw new HttpException(
          {
            message: `CIS API Error: ${
              error.response.data.message || 'Unknown error'
            }`,
            code: error.response.data.code || 'CIS_API_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        {
          message: 'Failed to delete contact profile in CIS',
          code: 'CIS_CONTACT_PROFILE_DELETE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
