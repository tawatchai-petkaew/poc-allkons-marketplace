export class JuristicObjectiveDto {
  code: string;
  textTH: string;
  textEN: string;
}

export class JuristicAddressDto {
  address: string;
  building?: string;
  roomNo?: string;
  floor?: string;
  addressNo: string;
  moo?: string;
  yaek?: string;
  soi?: string;
  trok?: string;
  village?: string;
  road: string;
  citySubDivisionCode: string;
  citySubDivisionTextTH: string;
  cityCode: string;
  cityTextTH: string;
  countrySubDivisionCode: string;
  countrySubDivisionTextTH: string;
}

export class DbdJuristicPersonDto {
  id: string;
  nameTH: string;
  nameEN: string;
  type: string;
  registerDate: string;
  status: string;
  objective: JuristicObjectiveDto;
  registerCapital: string;
  branchName: string;
  address: JuristicAddressDto;
}

export class DbdApiStatusDto {
  code: string;
  description: string;
}

export class DbdApiResponseDto {
  status: DbdApiStatusDto;
  data: DbdJuristicPersonDto[];
}
