import { DBDStatus } from '../enum/organization.enum';

export class AddressInfoResponseDto {
  address: string;
  countryId: number;
  countryNameTh: string;
  provinceId: number;
  provinceNameTh: string;
  districtId: number;
  districtNameTh: string;
  subDistrictId: number;
  subDistrictNameTh: string;
  zipCode: string;
}

export class CheckTaxIdAddressDto {
  address: string;
  provinceId: number;
  province: string;
  districtId: number;
  district: string;
  subdistrictId: number;
  subdistrict: string;
  zipCode: string;
  zipCodeId: number;
}

export class CheckTaxIdObjectiveDto {
  code: string;
  textTH: string;
  textEN: string;
}

export class JuristicTypeInfoDto {
  id: number;
  label: string;
  value: string;
  prefix: string;
  subfix: string;
  language: string;
  otherValue: string;
}

export class CheckTaxIdResponseDto {
  taxId: string;
  organizeName: string;
  organizeNameEN: string;
  type: string;
  registerDate: string;
  status: string;
  objective: CheckTaxIdObjectiveDto;
  registerCapital: string;
  branchName: string;
  address: CheckTaxIdAddressDto;
  juristicType: JuristicTypeInfoDto;

  public static fromDbdData(
    dbdData: any,
    province: any,
    district: any,
    subDistrict: any,
    juristicType: any,
  ): CheckTaxIdResponseDto {
    const dto = new CheckTaxIdResponseDto();

    dto.taxId = dbdData.id;
    dto.organizeName = dbdData.nameTH;
    dto.organizeNameEN = dbdData.nameEN;
    dto.juristicType = dbdData.type;
    dto.registerDate = dbdData.registerDate;

    // Mapping status
    dto.status = this.getDBDStatusKey(dbdData.status);

    dto.registerCapital = dbdData.registerCapital;
    dto.branchName = dbdData.branchName;

    // Map objective
    dto.objective = {
      code: dbdData.objective?.code || '',
      textTH: dbdData.objective?.textTH || '',
      textEN: dbdData.objective?.textEN || '',
    };

    // Map address
    dto.address = {
      address: dbdData.address?.address || '',
      provinceId: province?.id || null,
      province: province?.name_th || '',
      districtId: district?.id || null,
      district: district?.name_th || '',
      subdistrictId: subDistrict?.id || null,
      subdistrict: subDistrict?.name_th || '',
      zipCode: subDistrict?.zip_code || '',
      zipCodeId: subDistrict?.zipCodeId || null,
    };

    dto.juristicType = {
      id: juristicType?.id || 0,
      label: juristicType?.label || '',
      value: juristicType?.value || '',
      prefix: juristicType?.prefix || '',
      subfix: juristicType?.subfix || '',
      language: juristicType?.language || '',
      otherValue: juristicType?.otherValue || '',
    };

    return dto;
  }

  static getDBDStatusKey(value: string): string {
    const entry = Object.entries(DBDStatus).find(
      ([_, v]) => v === value.trim(),
    );
    return entry ? entry[0] : value;
  }
}
