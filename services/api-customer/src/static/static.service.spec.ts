import { Test, TestingModule } from '@nestjs/testing';
import { StaticService } from './static.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Bank } from '../model/bank.entity';
import { Country } from '../model/country.entity';
import { Province } from '../model/province.entity';
import { District } from '../model/district.entity';
import { SubDistrict } from '../model/sub-district.entity';
import { ShipmentCompany } from '../model/shipment-company.entity';
import { CreateBankDto } from './dto/create-bank.dto';
import { BankDto } from './dto/bank.dto';

const createMockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('StaticService', () => {
  let service: StaticService;
  let bankRepo: any;
  let countryRepo: any;
  let provinceRepo: any;
  let districtRepo: any;
  let subDistrictRepo: any;
  let shipmentCompanyRepo: any;

  beforeEach(async () => {
    bankRepo = createMockRepo();
    countryRepo = createMockRepo();
    provinceRepo = createMockRepo();
    districtRepo = createMockRepo();
    subDistrictRepo = createMockRepo();
    shipmentCompanyRepo = createMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaticService,
        { provide: getRepositoryToken(Bank), useValue: bankRepo },
        { provide: getRepositoryToken(Country), useValue: countryRepo },
        { provide: getRepositoryToken(Province), useValue: provinceRepo },
        { provide: getRepositoryToken(District), useValue: districtRepo },
        { provide: getRepositoryToken(SubDistrict), useValue: subDistrictRepo },
        {
          provide: getRepositoryToken(ShipmentCompany),
          useValue: shipmentCompanyRepo,
        },
      ],
    }).compile();

    service = module.get<StaticService>(StaticService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Bank Operations', () => {
    it('should show all banks', async () => {
      const bank = new Bank();
      bank.id = 1;
      bank.name = 'Test Bank';
      bankRepo.find.mockResolvedValue([bank]);
      jest.spyOn(BankDto, 'fromEntity').mockReturnValue({ id: 1 } as any);

      const result = await service.showAllBank();
      expect(result.length).toBe(1);
      expect(bankRepo.find).toHaveBeenCalled();
    });

    it('should create bank', async () => {
      const dto = new CreateBankDto();
      const savedBank = new Bank();

      jest.spyOn(CreateBankDto, 'toEntity').mockReturnValue(new Bank());
      bankRepo.save.mockResolvedValue(savedBank);
      jest.spyOn(BankDto, 'fromEntity').mockReturnValue({} as any);

      await service.createBank(dto);
      expect(bankRepo.save).toHaveBeenCalled();
    });
  });

  describe('Country Operations', () => {
    it('should show all countries', async () => {
      countryRepo.find.mockResolvedValue([new Country()]);
      await service.showAllCountry();
      expect(countryRepo.find).toHaveBeenCalled();
    });

    it('should create country', async () => {
      countryRepo.save.mockResolvedValue(new Country());
      await service.createCountry({} as any);
      expect(countryRepo.save).toHaveBeenCalled();
    });

    it('should find country by id', async () => {
      countryRepo.findOne.mockResolvedValue(new Country());
      await service.findCountryById(1);
      expect(countryRepo.findOne).toHaveBeenCalledWith(1);
    });

    it('should delete country', async () => {
      countryRepo.delete.mockResolvedValue({});
      await service.deleteCountry(1);
      expect(countryRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('Province Operations', () => {
    it('should show all provinces', async () => {
      provinceRepo.find.mockResolvedValue([new Province()]);
      await service.showAllProvince();
      expect(provinceRepo.find).toHaveBeenCalled();
    });

    it('should create province', async () => {
      countryRepo.findOne.mockResolvedValue(new Country());
      provinceRepo.save.mockResolvedValue(new Province());
      await service.createProvince({ countryId: 1 } as any);
      expect(countryRepo.findOne).toHaveBeenCalled();
      expect(provinceRepo.save).toHaveBeenCalled();
    });

    it('should find province by id', async () => {
      provinceRepo.findOne.mockResolvedValue(new Province());
      await service.findProvinceById(1);
      expect(provinceRepo.findOne).toHaveBeenCalled();
    });

    it('should find province by code', async () => {
      provinceRepo.findOne.mockResolvedValue(new Province());
      await service.findProvinceByCode('CODE');
      expect(provinceRepo.findOne).toHaveBeenCalledWith({
        where: { code: 'CODE' },
      });
    });

    it('should delete province', async () => {
      provinceRepo.delete.mockResolvedValue({});
      await service.deleteProvince(1);
      expect(provinceRepo.delete).toHaveBeenCalled();
    });
  });

  describe('District Operations', () => {
    it('should show all districts', async () => {
      districtRepo.find.mockResolvedValue([new District()]);
      await service.showAllDistrict();
      expect(districtRepo.find).toHaveBeenCalled();
    });

    it('should create district', async () => {
      provinceRepo.findOne.mockResolvedValue(new Province());
      districtRepo.save.mockResolvedValue(new District());
      await service.createDistrict({ provinceId: 1 } as any);
      expect(provinceRepo.findOne).toHaveBeenCalled();
      expect(districtRepo.save).toHaveBeenCalled();
    });

    it('should find district by id', async () => {
      districtRepo.findOne.mockResolvedValue(new District());
      await service.findDistrictById(1);
      expect(districtRepo.findOne).toHaveBeenCalled();
    });

    it('should find district by code', async () => {
      districtRepo.findOne.mockResolvedValue(new District());
      await service.findDistrictByCode('CODE');
      expect(districtRepo.findOne).toHaveBeenCalled();
    });

    it('should delete district', async () => {
      districtRepo.delete.mockResolvedValue({});
      await service.deleteDistrict(1);
      expect(districtRepo.delete).toHaveBeenCalled();
    });
  });

  describe('SubDistrict Operations', () => {
    it('should show all subdistricts', async () => {
      subDistrictRepo.find.mockResolvedValue([new SubDistrict()]);
      await service.showAllSubDistricts();
      expect(subDistrictRepo.find).toHaveBeenCalled();
    });

    it('should create subdistrict', async () => {
      districtRepo.findOne.mockResolvedValue(new District());
      subDistrictRepo.save.mockResolvedValue(new SubDistrict());
      await service.createSubDistrict({ districtId: 1 } as any);
      expect(districtRepo.findOne).toHaveBeenCalled();
      expect(subDistrictRepo.save).toHaveBeenCalled();
    });

    it('should show all subdistricts with query', async () => {
      subDistrictRepo.find.mockResolvedValue([new SubDistrict()]);
      await service.showAllSubDistrict({ zip_code: '1000' });
      expect(subDistrictRepo.find).toHaveBeenCalled();
    });

    it('should show all subdistricts without query', async () => {
      subDistrictRepo.find.mockResolvedValue([new SubDistrict()]);
      await service.showAllSubDistrict(null);
      expect(subDistrictRepo.find).toHaveBeenCalled();
    });

    it('should find subdistrict by id', async () => {
      subDistrictRepo.findOne.mockResolvedValue(new SubDistrict());
      await service.findSubDistrictById(1);
      expect(subDistrictRepo.findOne).toHaveBeenCalled();
    });

    it('should delete subdistrict', async () => {
      subDistrictRepo.delete.mockResolvedValue({});
      await service.deleteSubDistrict(1);
      expect(subDistrictRepo.delete).toHaveBeenCalled();
    });
  });

  describe('ShipmentCompany Operations', () => {
    it('should show all', async () => {
      shipmentCompanyRepo.find.mockResolvedValue([new ShipmentCompany()]);
      await service.showAllShipmentCompany();
      expect(shipmentCompanyRepo.find).toHaveBeenCalled();
    });
    it('should create', async () => {
      shipmentCompanyRepo.save.mockResolvedValue(new ShipmentCompany());
      await service.createShipmentCompany({} as any);
      expect(shipmentCompanyRepo.save).toHaveBeenCalled();
    });
  });

  describe('Location Operations', () => {
    it('should show all locations', async () => {
      const res = await service.showAllLocation();
      expect(Array.isArray(res)).toBe(true);
    });
  });
});
