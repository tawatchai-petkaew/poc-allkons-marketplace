import { Test, TestingModule } from '@nestjs/testing';
import { UserAddressService } from './user-address.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserAddress, AddressTypeEnum } from '../../model/user-address.entity';
import { Country } from '@/model/country.entity';
import { Province } from '@/model/province.entity';
import { District } from '@/model/district.entity';
import { SubDistrict } from '@/model/sub-district.entity';
import { UserAddressDto } from './dto/user-address.dto';

describe('UserAddressService', () => {
  let service: UserAddressService;
  let userAddressRepo: any;
  let countryRepo: any;
  let provinceRepo: any;
  let districtRepo: any;
  let subDistrictRepo: any;

  beforeEach(async () => {
    userAddressRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    countryRepo = { findOne: jest.fn() };
    provinceRepo = { findOne: jest.fn() };
    districtRepo = { findOne: jest.fn() };
    subDistrictRepo = { findOne: jest.fn(), find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAddressService,
        { provide: getRepositoryToken(UserAddress), useValue: userAddressRepo },
        { provide: getRepositoryToken(Country), useValue: countryRepo },
        { provide: getRepositoryToken(Province), useValue: provinceRepo },
        { provide: getRepositoryToken(District), useValue: districtRepo },
        { provide: getRepositoryToken(SubDistrict), useValue: subDistrictRepo },
      ],
    }).compile();

    service = module.get<UserAddressService>(UserAddressService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrUpdate', () => {
    it('should create new address if not exists', async () => {
      const addressData = {
        address: 'addr',
        countryId: 1,
        usedAddress: AddressTypeEnum.CURRENT,
      };
      countryRepo.findOne.mockResolvedValue({ id: 1 });
      userAddressRepo.findOne.mockResolvedValue(null);
      userAddressRepo.create.mockReturnValue(addressData);
      userAddressRepo.save.mockResolvedValue(addressData);
      jest
        .spyOn(UserAddressDto, 'fromEntity')
        .mockReturnValue(addressData as any);

      const res = await service.createOrUpdate(
        1,
        AddressTypeEnum.CURRENT,
        addressData,
      );
      expect(res).toBeDefined();
      expect(userAddressRepo.create).toHaveBeenCalled();
      expect(userAddressRepo.save).toHaveBeenCalled();
    });

    it('should update existing address', async () => {
      const addressData = {
        address: 'addr',
        countryId: 1,
      };
      countryRepo.findOne.mockResolvedValue({ id: 1 });
      userAddressRepo.findOne.mockResolvedValue({ id: 10 });
      userAddressRepo.save.mockResolvedValue({ id: 10, ...addressData });
      jest
        .spyOn(UserAddressDto, 'fromEntity')
        .mockReturnValue({ id: 10, ...addressData } as any);

      const res = await service.createOrUpdate(
        1,
        AddressTypeEnum.CURRENT,
        addressData,
      );
      expect(res).toBeDefined();
      expect(userAddressRepo.findOne).toHaveBeenCalledWith({
        where: { id: 10 },
      }); // update uses id
    });

    it('should throw if country not found', async () => {
      countryRepo.findOne.mockResolvedValue(null);
      await expect(
        service.createOrUpdate(1, AddressTypeEnum.CURRENT, {
          countryId: 99,
        } as any),
      ).rejects.toThrow('Country not found');
    });
  });

  describe('validateAddressRelationships', () => {
    it('should throw if province not found', async () => {
      provinceRepo.findOne.mockResolvedValue(null);
      await expect(
        service.createOrUpdate(1, AddressTypeEnum.CURRENT, {
          provinceId: 99,
        } as any),
      ).rejects.toThrow('Province not found');
    });

    it('should throw if province country mismatch', async () => {
      countryRepo.findOne.mockResolvedValue({ id: 1 });
      provinceRepo.findOne.mockResolvedValue({ id: 2, country: { id: 2 } });
      await expect(
        service.createOrUpdate(1, AddressTypeEnum.CURRENT, {
          countryId: 1,
          provinceId: 2,
        } as any),
      ).rejects.toThrow('Province does not belong to the specified country');
    });

    it('should throw if district not found', async () => {
      districtRepo.findOne.mockResolvedValue(null);
      await expect(
        service.createOrUpdate(1, AddressTypeEnum.CURRENT, {
          districtId: 99,
        } as any),
      ).rejects.toThrow('District not found');
    });

    it('should throw if district province mismatch', async () => {
      provinceRepo.findOne.mockResolvedValue({ id: 1 });
      districtRepo.findOne.mockResolvedValue({ id: 3, province: { id: 2 } });
      await expect(
        service.createOrUpdate(1, AddressTypeEnum.CURRENT, {
          provinceId: 1,
          districtId: 3,
        } as any),
      ).rejects.toThrow('District does not belong to the specified province');
    });

    it('should throw if sub district not found', async () => {
      subDistrictRepo.findOne.mockResolvedValue(null);
      await expect(
        service.createOrUpdate(1, AddressTypeEnum.CURRENT, {
          subDistrictId: 99,
        } as any),
      ).rejects.toThrow('Sub-district not found');
    });

    it('should throw if sub district district mismatch', async () => {
      districtRepo.findOne.mockResolvedValue({ id: 1 });
      subDistrictRepo.findOne.mockResolvedValue({ id: 4, district: { id: 2 } });
      await expect(
        service.createOrUpdate(1, AddressTypeEnum.CURRENT, {
          districtId: 1,
          subDistrictId: 4,
        } as any),
      ).rejects.toThrow(
        'Sub-district does not belong to the specified district',
      );
    });

    it('should check zipcode format', async () => {
      await expect(
        service.createOrUpdate(1, AddressTypeEnum.CURRENT, {
          zipCode: 123,
        } as any),
      ) // 3 digits
        .rejects.toThrow('Invalid zip code format');
    });

    it('should check if zipcode exists', async () => {
      subDistrictRepo.find.mockResolvedValue([]);
      await expect(
        service.createOrUpdate(1, AddressTypeEnum.CURRENT, {
          zipCode: 12345,
        } as any),
      ).rejects.toThrow('Invalid zip code. No sub-district found');
    });
  });

  describe('findByUserId', () => {
    it('should return addresses', async () => {
      userAddressRepo.find.mockResolvedValue([]);
      expect(await service.findByUserId(1)).toEqual([]);
    });
  });

  describe('createOrUpdateOrganizationAddresses', () => {
    it('should call createOrganizationAddress if not exists', async () => {
      const addressData = { address: 'addr' };
      userAddressRepo.findOne.mockResolvedValue(null);
      userAddressRepo.create.mockReturnValue(addressData);
      userAddressRepo.save.mockResolvedValue(addressData);
      jest
        .spyOn(UserAddressDto, 'fromEntity')
        .mockReturnValue(addressData as any);

      await service.createOrUpdateOrganizationAddresses(
        1,
        AddressTypeEnum.CURRENT,
        addressData as any,
      );
      expect(userAddressRepo.save).toHaveBeenCalled();
    });
  });

  describe('deleteUserAddressByIds', () => {
    it('should delete', async () => {
      await service.deleteUserAddressByIds([1, 2]);
      expect(userAddressRepo.delete).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('Location lookup helpers', () => {
    it('should find province by code', async () => {
      provinceRepo.findOne.mockResolvedValue({ code: 'P' });
      expect(await service.findProvinceByCode('P')).toEqual({ code: 'P' });
    });
    it('should find district by code', async () => {
      districtRepo.findOne.mockResolvedValue({ code: 'D' });
      expect(await service.findDistrictByCode('D')).toEqual({ code: 'D' });
    });
    it('should find sub district by code', async () => {
      subDistrictRepo.findOne.mockResolvedValue({ code: 'S' });
      expect(await service.findSubDistrictByCode('S')).toEqual({ code: 'S' });
    });
  });

  describe('Address finders by IDs', () => {
    it('should find by merchant id', async () => {
      await service.findUserAddressByMerchantId(1);
      expect(userAddressRepo.find).toHaveBeenCalledWith({
        where: { merchantId: 1 },
      });
    });
    it('should find by store id', async () => {
      await service.findUserAddressByStoreId(1);
      expect(userAddressRepo.find).toHaveBeenCalledWith({
        where: { storeId: 1 },
      });
    });
    it('should find by org branch id', async () => {
      await service.findUserAddressByOrgBranchId(1);
      expect(userAddressRepo.find).toHaveBeenCalledWith({
        where: { organizeBranchId: 1 },
      });
    });
    it('should find by org id', async () => {
      await service.findUserAddressByOrgId(1);
      expect(userAddressRepo.find).toHaveBeenCalledWith({
        where: { organizationId: 1 },
      });
    });
  });
});
