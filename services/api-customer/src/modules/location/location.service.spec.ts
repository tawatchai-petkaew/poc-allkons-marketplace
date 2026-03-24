import { Test, TestingModule } from '@nestjs/testing';
import { LocationService } from './location.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LocationEntity } from '../../model/location.entity';
import { Country } from '../../model/country.entity';
import { Province } from '../../model/province.entity';
import { District } from '../../model/district.entity';
import { SubDistrict } from '../../model/sub-district.entity';
import { NotFoundException } from '@nestjs/common';
import * as typeorm from 'typeorm';

jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    getManager: jest.fn(),
  };
});

describe('LocationService', () => {
  let service: LocationService;
  let locationRepo: any;
  let countryRepo: any;
  let provinceRepo: any;
  let districtRepo: any;
  let subDistrictRepo: any;
  let mockQuery: jest.Mock;

  beforeEach(async () => {
    mockQuery = jest.fn();
    (typeorm.getManager as jest.Mock).mockReturnValue({
      query: mockQuery,
    });

    locationRepo = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    countryRepo = { findOne: jest.fn() };
    provinceRepo = { findOne: jest.fn() };
    districtRepo = { findOne: jest.fn() };
    subDistrictRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        { provide: getRepositoryToken(LocationEntity), useValue: locationRepo },
        { provide: getRepositoryToken(Country), useValue: countryRepo },
        { provide: getRepositoryToken(Province), useValue: provinceRepo },
        { provide: getRepositoryToken(District), useValue: districtRepo },
        { provide: getRepositoryToken(SubDistrict), useValue: subDistrictRepo },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should return empty array if keyword mock empty', async () => {
      const result = await service.search('');
      expect(result).toEqual([]);
    });

    it('should execute raw query', async () => {
      mockQuery.mockResolvedValue([{ id: 1 }]);
      const result = await service.search('bangkok');
      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('createUserLocation', () => {
    const dto: any = {
      countryName: 'Thailand',
      provinceName: 'Bangkok',
      districtName: 'Wattana',
      subDistrictName: 'Klongton Nua',
    };

    it('should create location successfully', async () => {
      countryRepo.findOne.mockResolvedValue({ id: 1, name: 'Thailand' });
      provinceRepo.findOne.mockResolvedValue({ id: 1, name_th: 'Bangkok' });
      districtRepo.findOne.mockResolvedValue({ id: 1, name_th: 'Wattana' });
      subDistrictRepo.findOne.mockResolvedValue({
        id: 1,
        name_th: 'Klongton Nua',
      });
      locationRepo.save.mockResolvedValue({ id: 1 });

      const result = await service.createUserLocation(1, dto);
      expect(locationRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if location data missing', async () => {
      countryRepo.findOne.mockResolvedValue(null);
      await expect(service.createUserLocation(1, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserLocations', () => {
    it('should return locations', async () => {
      locationRepo.find.mockResolvedValue([{ id: 1 }]);
      const result = await service.getUserLocations(1, 1, 10);
      expect(result).toHaveLength(1);
    });

    it('should return empty array if null', async () => {
      locationRepo.find.mockResolvedValue(null);
      const result = await service.getUserLocations(1, 1, 10);
      expect(result).toEqual([]);
    });
  });

  describe('getUserDefaultLocation', () => {
    it('should return default location', async () => {
      locationRepo.findOne.mockResolvedValue({ id: 1 });
      const result = await service.getUserDefaultLocation(1);
      expect(result).toBeDefined();
    });

    it('should return null if not found', async () => {
      locationRepo.findOne.mockResolvedValue(null);
      const result = await service.getUserDefaultLocation(1);
      expect(result).toBeNull();
    });
  });

  describe('setDefaultLocation', () => {
    it('should set new default and unset old', async () => {
      locationRepo.findOne.mockResolvedValue({ id: 2 });
      await service.setDefaultLocation(1, 1);
      expect(locationRepo.update).toHaveBeenCalledTimes(2); // One expected to unset old, one to set new
    });
  });

  describe('deleteLocation', () => {
    it('should delete location', async () => {
      locationRepo.delete.mockResolvedValue({ affected: 1 });
      const result = await service.deleteLocation(1);
      expect(result.affected).toBe(1);
    });

    it('should throw NotFoundException', async () => {
      locationRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.deleteLocation(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
