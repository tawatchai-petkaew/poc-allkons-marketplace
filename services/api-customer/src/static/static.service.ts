import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Country } from '../model/country.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import { CountryDto } from './dto/country.dto';

import { Province } from '../model/province.entity';
import { CreateProvinceDto } from './dto/create-province.dto';
import { ProvinceDto } from './dto/province.dto';

import { District } from '../model/district.entity';
import { CreateDistrictDto } from './dto/create-district.dto';
import { DistrictDto } from './dto/district.dto';

import { SubDistrict } from '../model/sub-district.entity';
import { CreateSubDistrictDto } from './dto/create-sub-district.dto';
import { SubDistrictDto } from './dto/sub-district.dto';

import { Bank } from '../model/bank.entity';
import { BankDto } from './dto/bank.dto';
import { CreateBankDto } from './dto/create-bank.dto';

import { locations } from '../data/location';
import { LocationDto } from './dto/location.dto';

@Injectable()
export class StaticService {
  constructor(
    @InjectRepository(Bank) private readonly bankRepo: Repository<Bank>,
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(Province)
    private readonly provinceRepo: Repository<Province>,
    @InjectRepository(District)
    private readonly districtRepo: Repository<District>,
    @InjectRepository(SubDistrict)
    private readonly subDistrictRepo: Repository<SubDistrict>,
  ) {}

  public async showAllBank(): Promise<BankDto[]> {
    const banks = await this.bankRepo.find();

    return banks.map((e) => BankDto.fromEntity(e));
  }

  public async createBank(dto: CreateBankDto) {
    return this.bankRepo.save(CreateBankDto.toEntity(dto)).then(async (e) => {
      return BankDto.fromEntity(e);
    });
  }

  public async showAllShipmentCompany() {
    return null;
  }

  public async createShipmentCompany() {
    return null;
  }

  public async createCountry(dto: CreateCountryDto) {
    return this.countryRepo
      .save(CreateCountryDto.toEntity(dto))
      .then(async (e) => {
        return CountryDto.fromEntity(e);
      });
  }

  public async showAllCountry(): Promise<CountryDto[]> {
    const countries = await this.countryRepo.find();

    return countries.map((e) => CountryDto.fromEntity(e));
  }

  public async findCountryById(id: number) {
    return await this.countryRepo.findOne(id);
  }

  public async deleteCountry(id: number) {
    return await this.countryRepo.delete(id);
  }

  public async createProvince(dto: CreateProvinceDto) {
    const country = await this.countryRepo.findOne(dto.countryId);

    const parentDto = {
      ...dto,
      country: country,
    };

    return this.provinceRepo
      .save(CreateProvinceDto.toEntity(parentDto))
      .then(async (e) => {
        return ProvinceDto.fromEntity(e);
      });
  }

  public async showAllProvince(): Promise<ProvinceDto[]> {
    const provinces = await this.provinceRepo.find({
      relations: ['country'],
    });

    return provinces.map((e) => ProvinceDto.fromEntity(e));
  }

  public async findProvinceById(id: number) {
    return await this.provinceRepo.findOne(id);
  }

  public async findProvinceByCode(code: any) {
    return await this.provinceRepo.findOne({
      where: {
        code: code,
      },
    });
  }

  public async deleteProvince(id: number) {
    return await this.provinceRepo.delete(id);
  }

  public async createDistrict(dto: CreateDistrictDto) {
    const province = await this.provinceRepo.findOne(dto.provinceId);

    const parentDto = {
      ...dto,
      province: province,
    };

    return this.districtRepo
      .save(CreateDistrictDto.toEntity(parentDto))
      .then(async (e) => {
        return DistrictDto.fromEntity(e);
      });
  }

  public async showAllDistrict(): Promise<DistrictDto[]> {
    const districts = await this.districtRepo.find({
      relations: ['province'],
    });

    return districts.map((e) => DistrictDto.fromEntity(e));
  }

  public async deleteDistrict(id: number) {
    return await this.districtRepo.delete(id);
  }

  public async showAllSubDistricts(): Promise<SubDistrictDto[]> {
    const subDistricts = await this.subDistrictRepo.find({
      relations: ['district'],
    });

    return subDistricts.map((e) => SubDistrictDto.fromEntity(e));
  }

  public async findDistrictById(id: number) {
    return await this.districtRepo.findOne(id);
  }

  public async findDistrictByCode(code: any) {
    return await this.districtRepo.findOne({
      where: {
        code: code,
      },
    });
  }

  public async createSubDistrict(dto: CreateSubDistrictDto) {
    const district = await this.districtRepo.findOne(dto.districtId);

    const parentDto = {
      ...dto,
      district: district,
    };

    return this.subDistrictRepo
      .save(CreateSubDistrictDto.toEntity(parentDto))
      .then(async (e) => {
        return SubDistrictDto.fromEntity(e);
      });
  }

  public async showAllSubDistrict(query: any): Promise<SubDistrictDto[]> {
    if (query && query.zip_code) {
      const subDistricts = await this.subDistrictRepo.find({
        relations: ['district', 'district.province'],
        where: {
          zip_code: query.zip_code,
        },
      });

      return subDistricts.map((e) => SubDistrictDto.fromEntity(e));
    } else {
      const subDistricts = await this.subDistrictRepo.find({
        relations: ['district', 'district.province'],
      });

      return subDistricts.map((e) => SubDistrictDto.fromEntity(e));
    }
  }

  public async findSubDistrictById(id: number) {
    return await this.subDistrictRepo.findOne(id);
  }

  public async deleteSubDistrict(id: number) {
    return await this.subDistrictRepo.delete(id);
  }

  public async showAllLocation(): Promise<LocationDto[]> {
    return locations.map((location) => LocationDto.from(location));
  }
}
