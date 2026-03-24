import { Country } from '@/model/country.entity';
import { District } from '@/model/district.entity';
import { LocationEntity } from '@/model/location.entity';
import { Province } from '@/model/province.entity';
import { SubDistrict } from '@/model/sub-district.entity';
import {
  nonPrefixCountryName,
  nonPrefixDistrictName,
  nonPrefixProvinceName,
  nonPrefixSubDistrictName,
  prefixCountryName,
  prefixDistrictName,
  prefixProvinceName,
  prefixSubDistrictName,
} from '@/utils/location.utils';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { getManager, Repository } from 'typeorm';
import { CreateLocationDto, LocationResponseDto } from './dto/location.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationRepo: Repository<LocationEntity>,
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(Province)
    private readonly provinceRepo: Repository<Province>,
    @InjectRepository(District)
    private readonly districtRepo: Repository<District>,
    @InjectRepository(SubDistrict)
    private readonly subDistrictRepo: Repository<SubDistrict>,
  ) {}

  /**
   * ค้นหาตำบล อำเภอ จังหวัด รหัสไปรษณีย์ จาก view location_view
   * เรียงผลลัพธ์ตามลำดับ ตำบล > อำเภอ > จังหวัด > zip
   * จำกัด 10 รายการ
   */
  async search(keyword: string): Promise<any[]> {
    if (!keyword || !keyword.trim()) {
      return [];
    }

    const query = `
      SELECT *
      FROM location_view
      WHERE (
        to_tsvector('simple', subdistrict || ' ' || district || ' ' || province || ' ' || zip_code)
        @@ plainto_tsquery('simple', $1)
        OR subdistrict ILIKE $2
        OR district ILIKE $2
        OR province ILIKE $2
        OR zip_code ILIKE $2
      )
      ORDER BY
        CASE 
          WHEN subdistrict ILIKE $2 THEN 0
          WHEN district ILIKE $2 THEN 1
          WHEN province ILIKE $2 THEN 2
          WHEN zip_code ILIKE $2 THEN 3
          ELSE 4
        END,
        zip_code ASC
      LIMIT 10
    `;

    const param = `%${keyword}%`;
    return await getManager().query(query, [keyword, param]);
  }

  async createUserLocation(userId: number, dto: CreateLocationDto) {
    const [country, province, district, subDistrict] = await Promise.all([
      this.countryRepo.findOne({
        where: [
          { name: dto.countryName },
          { name: nonPrefixCountryName(dto.countryName) },
          { name: prefixCountryName(dto.countryName) },
        ],
        select: ['id', 'name'],
      }),
      this.provinceRepo.findOne({
        where: [
          { name_th: dto.provinceName },
          { name_th: nonPrefixProvinceName(dto.provinceName) },
          { name_th: prefixProvinceName(dto.provinceName) },
        ],
        select: ['id', 'name_th'],
      }),
      this.districtRepo.findOne({
        where: [
          { name_th: dto.districtName },
          { name_th: nonPrefixDistrictName(dto.districtName) },
          { name_th: prefixDistrictName(dto.districtName) },
        ],
        select: ['id', 'name_th'],
      }),
      this.subDistrictRepo.findOne({
        where: [
          { name_th: dto.subDistrictName },
          { name_th: nonPrefixSubDistrictName(dto.subDistrictName) },
          { name_th: prefixSubDistrictName(dto.subDistrictName) },
        ],
        select: ['id', 'name_th'],
      }),
    ]);

    if (!country || !province || !district || !subDistrict) {
      throw new NotFoundException('One or more location not found');
    }

    const createLocationDto = {
      ...dto,
      userId,
      countryId: country.id,
      provinceId: province.id,
      districtId: district.id,
      subDistrictId: subDistrict.id,
      countryName: country.name,
      provinceName: province.name_th,
      districtName: district.name_th,
      subDistrictName: subDistrict.name_th,
    };

    const location = await this.locationRepo.save(createLocationDto);

    return plainToInstance(LocationResponseDto, location);
  }

  async getUserLocations(
    userId: number,
    page: number,
    limit: number,
  ): Promise<any[]> {
    const locations = await this.locationRepo.find({
      where: {
        userId,
      },
      order: {
        isDefault: 'DESC',
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (!locations) {
      return [];
    }

    return locations.map((location) =>
      plainToInstance(LocationResponseDto, location),
    );
  }

  async getUserDefaultLocation(userId: number): Promise<any> {
    const locations = await this.locationRepo.findOne({
      where: {
        userId,
        isDefault: true,
      },
    });

    if (!locations) {
      return null;
    }
    return plainToInstance(LocationResponseDto, locations);
  }

  async setDefaultLocation(userId: number, locationId: number) {
    const defaultLocation = await this.locationRepo.findOne({
      where: {
        userId,
        isDefault: true,
      },
    });

    if (defaultLocation) {
      await this.locationRepo.update(defaultLocation.id, { isDefault: false });
    }

    return await this.locationRepo.update(locationId, { isDefault: true });
  }

  async deleteLocation(locationId: number) {
    const result = await this.locationRepo.delete(locationId);
    if (result.affected === 0) {
      throw new NotFoundException(`Location with ID ${locationId} not found`);
    }
    return result;
  }
}
