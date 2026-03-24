import { UserOrganization } from '@/model/user-organization.entity';
import { Type } from '@/model/organization.entity';
import { JuristicTypeCIS } from '@/modules/cis/enum/cis.enum';
import { UserOrganizationPermissionsResponseDto } from '@/modules/organization/dto/user-permissions.dto';

export class UserOrganizationResponseDto {
  id: number;
  userId: number;
  organizeId: number;
  roleId?: number;
  createdAt: Date;
  updatedAt: Date;
  userInfo: UserDto;
  organization?: OrganizationInfoDto;
  role?: RoleInfoDto;
}

export class OrganizationInfoDto {
  id: number;
  taxId: string;
  organizeType: string;
  organizeName: string;
  cisNumber?: string;
  type?: Type;
  businessType?: string[];
  remarkTypeOther?: string;
  branchNumber?: string;
  mainPhoneNumber?: string;
  otherPhoneNumber?: string;
  mainEmail?: string;
  highestAuthorityName?: string;
  highestAuthorityPosition?: string;
  highestAuthorityPhoneNumber?: string;
  highestAuthorityEmail?: string;
  contactName?: string;
  contactPhoneNumber?: string;
  contactEmail?: string;
  kycStatus?: string;
  contactShownHighestAuthority?: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  organizeBranchType: string;
  idCard: string;
  registrationNumber: string;
  organizationType: string;
  customerStatus: string;
  isDopa: boolean;
  isDbd: boolean;
  juristicInfo: JuristicInfo;
  totalUsers?: number;
}

export class RoleInfoDto {
  id: number;
  name: string;
  displayName: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserDto {
  id: number;
  uuid: string;
  countryCode: string;
  phoneNumber: string;
  email: string;
  name: string;
  firstNameTh: string;
  lastNameTh: string;
  middleNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  middleNameEn: string;
  kycStatus: string;
  createdInAuth: Date;
  registerStatus: string;
  registerStep: string;
  createdAt: Date;
  updatedAt: Date;
  username: string;
  cisNumber: string;
}

class JuristicInfo {
  prefix: string;
  subfix: string;
  juristicName: string;
}

export class GetUserOrganizationsResponseDto {
  success: boolean;
  message: string;
  data: {
    user: UserDto;
    organizations: OrganizationWithRoleDto[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      totalOrganizations: number;
      hasPrev: boolean;
      hasNext: boolean;
    };
  };

  public static fromUserOrganizations(
    userOrganizations,
  ): GetUserOrganizationsResponseDto {
    const response = new GetUserOrganizationsResponseDto();
    response.success = true;
    response.message = 'Success';

    if (!userOrganizations) {
      response.data = null;
      return response;
    }

    response.data = {
      user: {
        id: userOrganizations.id,
        uuid: userOrganizations.uuid,
        countryCode: userOrganizations.countryCode,
        phoneNumber: userOrganizations.tel,
        email: userOrganizations.email,
        name: userOrganizations.name,
        firstNameTh: userOrganizations.firstNameTh,
        lastNameTh: userOrganizations.lastNameTh,
        middleNameTh: userOrganizations.middleNameTh,
        firstNameEn: userOrganizations.firstNameEn,
        lastNameEn: userOrganizations.lastNameEn,
        middleNameEn: userOrganizations.middleNameEn,
        kycStatus: userOrganizations.kycStatus,
        createdInAuth: userOrganizations.createdInAuth,
        registerStatus: userOrganizations.registerStatus,
        registerStep: userOrganizations.registerStep,
        createdAt: userOrganizations.createdAt,
        updatedAt: userOrganizations.updatedAt,
        username: userOrganizations.username,
        cisNumber: userOrganizations.cisNumber,
      },
      organizations: userOrganizations.userOrganizations.map((userOrg) => ({
        isOwner: userOrg.isOwner,
        createdAt: userOrg.createdAt,
        updatedAt: userOrg.updatedAt,
        organization: {
          id: userOrg.organization.id,
          uuid: userOrg.organization.uuid,
          taxId: userOrg.organization.taxId,
          organizeType: JuristicTypeCIS[userOrg.organization.organizeType],
          organizeName: userOrg.organization.organizeName,
          cisNumber: userOrg.organization.cisNumber,
          type: userOrg.organization.type,
          businessType: userOrg.organization.businessType,
          remarkTypeOther: userOrg.organization.remarkTypeOther,
          branchNumber: userOrg.organization.branchNumber,
          mainPhoneNumber: userOrg.organization.mainPhoneNumber,
          otherPhoneNumber: userOrg.organization.otherPhoneNumber,
          mainEmail: userOrg.organization.mainEmail,
          highestAuthorityName: userOrg.organization.highestAuthorityName,
          highestAuthorityPosition:
            userOrg.organization.highestAuthorityPosition,
          highestAuthorityPhoneNumber:
            userOrg.organization.highestAuthorityPhoneNumber,
          highestAuthorityEmail: userOrg.organization.highestAuthorityEmail,
          contactName: userOrg.organization.contactName,
          contactPhoneNumber: userOrg.organization.contactPhoneNumber,
          contactEmail: userOrg.organization.contactEmail,
          kycStatus: userOrg.organization.kycStatus,
          contactShownHighestAuthority:
            userOrg.organization.contactShownHighestAuthority,
          organizeBranchType: userOrg.organization.type,
          idCard: userOrg.organization.idCard,
          registrationNumber: userOrg.organization.registrationNumber,
          organizationType: userOrg.organization.organizationType,
          customerStatus: userOrg.organization.customerStatus,
          isDopa: userOrg.organization.isDopa,
          isDbd: userOrg.organization.isDbd,
          juristicInfo: {
            prefix: userOrg.organization.juristic?.prefix || '',
            subfix: userOrg.organization.juristic?.subfix || '',
            juristicName: userOrg.organization.juristic?.label || '',
          },
          createdAt: userOrg.organization.createdAt,
          updatedAt: userOrg.organization.updatedAt,
          deletedAt: userOrg.organization.deletedAt || null, // Handle optional deletedAt
          totalUsers: userOrg.organization.totalUsers || 0, // เพิ่มจำนวน user ทั้งหมดในองค์กร
        },
        role: userOrg.role
          ? {
              id: userOrg.role.id,
              name: userOrg.role.name,
              displayName: userOrg.role.displayName,
              description: userOrg.role.description,
              createdAt: userOrg.role.createdAt,
              updatedAt: userOrg.role.updatedAt,
            }
          : null,
        userPermission: userOrg?.userPermission,
      })),
    };

    if (userOrganizations?.pagination) {
      response.data.pagination = {
        total: userOrganizations.pagination.total,
        page: userOrganizations.pagination.page,
        limit: userOrganizations.pagination.limit,
        totalPages: userOrganizations.pagination.totalPages,
        totalOrganizations: userOrganizations.pagination.totalOrganizations,
        hasNext: userOrganizations.pagination.hasNext,
        hasPrev: userOrganizations.pagination.hasPrev,
      };
    }

    return response;
  }
}

export class OrganizationWithRoleDto {
  userOrganizationId: number;
  organizeId: number;
  roleId?: number;
  createdAt: Date;
  updatedAt: Date;
  organization: OrganizationInfoDto;
  role?: RoleInfoDto;
  userPermission?: UserOrganizationPermissionsResponseDto;
}

export class UserWithOrganizationsResponseDto {
  success: boolean;
  message: string;
  data: {
    user: UserDto;
    organizations: OrganizationWithRoleDto[];
  };

  public static fromUserOrganizations(
    userOrganizations: UserOrganization[],
  ): UserWithOrganizationsResponseDto {
    const response = new UserWithOrganizationsResponseDto();
    response.success = true;
    response.message = 'Success';

    if (userOrganizations.length === 0) {
      response.data = null;
      return response;
    }

    const firstUserOrg = userOrganizations[0];

    // Map user info
    response.data = {
      user: {
        id: firstUserOrg.user.id,
        uuid: firstUserOrg.user.uuid,
        countryCode: firstUserOrg.user.countryCode,
        phoneNumber: firstUserOrg.user.tel,
        email: firstUserOrg.user.email,
        name: firstUserOrg.user.name,
        firstNameTh: firstUserOrg.user.firstNameTh,
        lastNameTh: firstUserOrg.user.lastNameTh,
        middleNameTh: firstUserOrg.user.middleNameTh,
        firstNameEn: firstUserOrg.user.firstNameEn,
        lastNameEn: firstUserOrg.user.lastNameEn,
        middleNameEn: firstUserOrg.user.middleNameEn,
        kycStatus: firstUserOrg.user.kycStatus,
        createdInAuth: firstUserOrg.user.createdInAuth,
        registerStatus: firstUserOrg.user.registerStatus,
        registerStep: firstUserOrg.user.registerStep,
        createdAt: firstUserOrg.user.createdAt,
        updatedAt: firstUserOrg.user.updatedAt,
        username: firstUserOrg.user.username,
        cisNumber: firstUserOrg.user.cisNumber,
      },
      organizations: userOrganizations.map((userOrg) => ({
        userOrganizationId: userOrg.id,
        organizeId: userOrg.organizeId,
        roleId: userOrg.roleId,
        createdAt: userOrg.createdAt,
        updatedAt: userOrg.updatedAt,
        organization: {
          id: userOrg.organization.id,
          taxId: userOrg.organization.taxId,
          organizeType: JuristicTypeCIS[userOrg.organization.organizeType],
          organizeName: userOrg.organization.organizeName,
          cisNumber: userOrg.organization.cisNumber,
          type: userOrg.organization.type,
          businessType: userOrg.organization.businessType,
          remarkTypeOther: userOrg.organization.remarkTypeOther,
          branchNumber: userOrg.organization.branchNumber,
          mainPhoneNumber: userOrg.organization.mainPhoneNumber,
          otherPhoneNumber: userOrg.organization.otherPhoneNumber,
          mainEmail: userOrg.organization.mainEmail,
          highestAuthorityName: userOrg.organization.highestAuthorityName,
          highestAuthorityPosition:
            userOrg.organization.highestAuthorityPosition,
          highestAuthorityPhoneNumber:
            userOrg.organization.highestAuthorityPhoneNumber,
          highestAuthorityEmail: userOrg.organization.highestAuthorityEmail,
          contactName: userOrg.organization.contactName,
          contactPhoneNumber: userOrg.organization.contactPhoneNumber,
          contactEmail: userOrg.organization.contactEmail,
          kycStatus: userOrg.organization.kycStatus,
          contactShownHighestAuthority:
            userOrg.organization.contactShownHighestAuthority,
          organizeBranchType: userOrg.organization.type,
          idCard: userOrg.organization.idCard,
          registrationNumber: userOrg.organization.registrationNumber,
          organizationType: userOrg.organization.organizationType,
          organizeBranchName: userOrg.organization.branchName,
          customerStatus: userOrg.organization.customerStatus,
          isDopa: userOrg.organization.isDopa,
          isDbd: userOrg.organization.isDbd,
          juristicInfo: {
            prefix: userOrg.organization.juristic?.prefix,
            subfix: userOrg.organization.juristic?.subfix,
            juristicName: userOrg.organization.juristic?.label,
          },
          createdAt: userOrg.organization.createdAt,
          updatedAt: userOrg.organization.updatedAt,
          deletedAt: userOrg.organization.deletedAt,
        },
        role: userOrg.role
          ? {
              id: userOrg.role.id,
              name: userOrg.role.name,
              displayName: userOrg.role.displayName,
              description: userOrg.role.description,
              createdAt: userOrg.role.createdAt,
              updatedAt: userOrg.role.updatedAt,
            }
          : null,
      })),
    };

    return response;
  }
}
