// scripts/seed.ts
import { createConnection, ConnectionOptions } from 'typeorm';

import { configService } from '../config/config.service';

import { StaticService } from '../static/static.service';
import { Country } from '../model/country.entity';
import { Province } from '../model/province.entity';
import { District } from '../model/district.entity';
import { SubDistrict } from '../model/sub-district.entity';
import { Bank } from '../model/bank.entity';

import { CreateCountryDto } from '../static/dto/create-country.dto';
import { CreateProvinceDto } from '../static/dto/create-province.dto';
import { CreateDistrictDto } from '../static/dto/create-district.dto';
import { CreateSubDistrictDto } from '../static/dto/create-sub-district.dto';
import { CreateBankDto } from '../static/dto/create-bank.dto';

import merchantCategories from '../data/merchant-categories';
import merchants from '../data/merchants';
import banks from '../data/bank';
import usersData from '../data/user';
import provinces from '../data/thailand/provinces';
import districts from '../data/thailand/districts';
import subDistricts from '../data/thailand/sub-districts';
import shipmentCompanies from '../data/shipment-company';

const MERCHANT_CATEGORIES = merchantCategories;
const MERCHANTS = merchants;
const USERS = usersData;
const COUNTRY = ['Thailand'];
const PROVINCES = provinces;
const DISTRICTS = districts;
const SUB_DISTRICTS = subDistricts;
const BANK = banks;
const SHIPMENTCOMPANY = shipmentCompanies;

async function run() {
  const opt = {
    ...configService.getTypeOrmConfig(),
    debug: true,
  };

  const connection = await createConnection(opt as ConnectionOptions);

  // Seed Merchants
  // const merchantService = new MerchantService(
  //   connection.getRepository(Merchant),
  //   connection.getRepository(MerchantTranslation),
  //   connection.getRepository(MerchantCategory),
  //   connection.getRepository(ImageUploadFolder),
  //   connection.getRepository(MerchantLogo),
  //   connection.getRepository(MerchantIcon),
  //   connection.getRepository(ImageUpload),
  //   connection.getRepository(User),
  //   connection.getRepository(Admin),
  //   connection.getRepository(AdminPermission),
  //   new RequestContextService(
  //     new UserService(
  //       connection.getRepository(User),
  //       connection.getRepository(Admin),
  //       connection.getRepository(Merchant),
  //       connection.getRepository(Customer),
  //       connection.getRepository(ImageUpload),
  //     )
  //   ),
  //   new ActivityLogService(connection.getRepository(ActivityLog)),
  //   new MerchantNotificationConfigurationService(
  //     connection.getRepository(MerchantNotificationConfiguration),
  //     connection.getRepository(MerchantNotificationAdminConfiguration),
  //     connection.getRepository(MerchantNotificationCustomerConfiguration),
  //     new ActivityLogService(connection.getRepository(ActivityLog)),
  //     new RequestContextService(
  //       new UserService(
  //         connection.getRepository(User),
  //         connection.getRepository(Admin),
  //         connection.getRepository(Merchant),
  //         connection.getRepository(Customer),
  //         connection.getRepository(ImageUpload),
  //       )
  //     ),
  //   ),
  // );
  // const workMerchant = MERCHANTS.map(async (m) => {
  //   const merchantCategory: MerchantCategory = await merchantCategoryService.findById(m.merchantCategoryId);

  //   const dto: {
  //     dto: any;
  //     id: any;
  //   } = {
  //     dto: {
  //       slug: m.slug,
  //       name: m.name,
  //       description: m.description,
  //       tel: m.tel,
  //       email: m.email,
  //       contactAddress: m.contactAddress,
  //       postCodeContactAddress: m.postCodeContactAddress,
  //       provinceContactAddress: m.provinceContactAddress,
  //       districtContactAddress: m.districtContactAddress,
  //       subdistrictContactAddress: m.subdistrictContactAddress,
  //       lineSocialContact: m.lineSocialContact,
  //       facebookSocialContact: m.facebookSocialContact,
  //       youtubeSocialContact: m.youtubeSocialContact,
  //       instagramSocialContact: m.instagramSocialContact,
  //       companyName: m.companyName,
  //       companyId: m.companyId,
  //       companyBranch: m.companyBranch,
  //       companyAddress: m.companyAddress,
  //       postCodeCompanyAddress: m.postCodeCompanyAddress,
  //       provinceCompanyAddress: m.provinceCompanyAddress,
  //       districtCompanyAddress: m.districtCompanyAddress,
  //       subdistrictCompanyAddress: m.subdistrictCompanyAddress,
  //       merchantCategory: merchantCategory,
  //       locale: 'th',
  //       merchantCategoryId: m.merchantCategoryId,
  //       imageUploadFolders: null
  //     },
  //     id: 1
  //   };

  //   return await dto;
  // }).map(async (dto) => {
  //   const data = await dto;
  //   const merchant = await merchantService.showBySlug(data.dto.slug);

  //   if (merchant) {
  //     console.log('exist merchant ->', data.dto.name)
  //     return merchant;
  //   } else {
  //     return (
  //       merchantService.create(data.dto, data.id).then(r => (console.log('done ->', r.name), r))
  //     );
  //   }
  // })

  // const resultMerchants = await Promise.all(workMerchant)

  // // Seed User
  // const userService = new UserService(
  //   connection.getRepository(User),
  //   connection.getRepository(Admin),
  //   connection.getRepository(Merchant),
  //   connection.getRepository(Customer),
  //   connection.getRepository(ImageUpload),
  // );
  // const workUser = await USERS.map((m) => {
  //   const dto: CreateUserDto = {
  //     email: m.email,
  //     password: m.password,
  //     tel: null,
  //     countryCode: null,
  //     locale: m.locale,
  //     interfaceMode: m.interfaceMode,
  //     role: m.role,
  //     merchantIds: m.merchantIds,
  //     merchants: null,
  //     name: 'test'
  //   }

  //   return dto;
  // }).map(async dto => {
  //   const user = await userService.findByEmail(dto.email)

  //   if (user) {
  //     console.log('exist user ->', dto.email)
  //   } else {
  //     return await userService.create(dto).then(r => (console.log('done ->', r.email), r))
  //   }
  // })

  // const resultUsers = await Promise.all(workUser)

  const staticService = new StaticService(
    connection.getRepository(Bank),
    connection.getRepository(Country),
    connection.getRepository(Province),
    connection.getRepository(District),
    connection.getRepository(SubDistrict),
  );

  const allCountry = await staticService.showAllCountry();
  const allProvince = await staticService.showAllProvince();
  const allDistrict = await staticService.showAllDistrict();
  const allSubDistrict = await staticService.showAllSubDistricts();

  if (allSubDistrict.length > 0) {
    await Promise.all(
      allSubDistrict.map(
        async (sd) => await staticService.deleteSubDistrict(sd?.id),
      ),
    );
  }

  if (allDistrict.length > 0) {
    await Promise.all(
      allDistrict.map(async (d) => await staticService.deleteDistrict(d?.id)),
    );
  }

  if (allProvince.length > 0) {
    await Promise.all(
      allProvince.map(async (p) => await staticService.deleteProvince(p?.id)),
    );
  }

  if (allCountry.length > 0) {
    await Promise.all(
      allCountry.map(
        async (country) => await staticService.deleteCountry(country?.id),
      ),
    );
  }

  // Seed Banks
  const banks = await staticService.showAllBank();
  const banksSlug = banks.map((bank) => bank.slug);
  const workBank = await BANK.map((m) =>
    CreateBankDto.from({
      name: m.name,
      slug: m.slug,
    }),
  ).map((dto) => {
    if (banksSlug.includes(dto.slug)) {
      console.log('exist bank ->', dto.name);
    } else {
      return staticService
        .createBank(dto)
        .then((r) => (console.log('done ->', r.name), r));
    }
  });

  const resultBanks = await Promise.all(workBank);

  // Seed Shipment Companys

  // Seed Countries
  const countries = await staticService.showAllCountry();
  const countriesName = countries.map((country) => country.name);
  const workCountry = await COUNTRY.map((m) =>
    CreateCountryDto.from({
      name: m,
    }),
  ).map((dto) => {
    if (countriesName.includes(dto.name)) {
      console.log('exist country ->', dto.name);
    } else {
      return staticService
        .createCountry(dto)
        .then((r) => (console.log('done ->', r.name), r));
    }
  });

  const resultCountries = await Promise.all(workCountry);

  // Seed Province
  const provinces = await staticService.showAllProvince();
  const provincesCode = provinces.map((province) => province.code);
  const workProvince = await PROVINCES.map((m) => {
    const dto: CreateProvinceDto = {
      name_th: m[2],
      name_en: m[3],
      code: +m[1],
      countryId: 1,
      country: null,
    };

    return dto;
  }).map((dto) => {
    if (provincesCode.includes(dto.code)) {
      console.log('exist province ->', dto.name_th);
    } else {
      return staticService
        .createProvince(dto)
        .then((r) => (console.log('done ->', r.name_th), r));
    }
  });

  const resultProvinces = await Promise.all(workProvince);

  // Seed District
  const districts = await staticService.showAllDistrict();
  const districtsCode = districts.map((district) => district.code);
  const workDistrict = await DISTRICTS.map(async (m) => {
    const provinceCode = PROVINCES.find((p) => p[0] === +m[4])[1];
    const province = await staticService.findProvinceByCode(provinceCode);
    const dto: CreateDistrictDto = {
      name_th: m[2],
      name_en: m[3],
      code: +m[1],
      provinceId: province?.id,
      province: null,
    };

    return dto;
  }).map(async (dto) => {
    const data = await dto;
    if (districtsCode.includes(data.code)) {
      console.log('exist district ->', data.name_th);
    } else {
      return staticService
        .createDistrict(await dto)
        .then((r) => (console.log('done ->', r.name_th), r));
    }
  });

  const resultDistricts = await Promise.all(workDistrict);

  // Seed SubDistrict
  const subDistricts = await staticService.showAllSubDistricts();
  const subDistrictsZipCode = subDistricts.map(
    (subDistrict) => subDistrict.zip_code,
  );
  const workSubDistrict = await SUB_DISTRICTS.map(async (m) => {
    const districtCode = DISTRICTS.find((p) => p[0] === +m[4])[1];
    const district = await staticService.findDistrictByCode(districtCode);

    const dto: CreateSubDistrictDto = {
      name_th: m[2],
      name_en: m[3],
      zip_code: +m[1],
      districtId: district?.id,
      district: null,
    };

    return dto;
  }).map(async (dto) => {
    const data = await dto;

    if (subDistrictsZipCode.includes(data.zip_code)) {
      console.log('exist sub-district ->', data.name_th);
    } else {
      return staticService
        .createSubDistrict(await dto)
        .then((r) => (console.log('done ->', r.name_th), r));
    }
  });

  const resultSubDistricts = await Promise.all(workSubDistrict);

  return await [
    ...resultBanks,
    // ...resultMerchants,
    // ...resultUsers,
    ...resultCountries,
    ...resultProvinces,
    ...resultDistricts,
    ...resultSubDistricts,
  ];
}

run()
  .then((_) => console.log('...wait for script to exit'))
  .catch((error) => console.error('seed error', error));
