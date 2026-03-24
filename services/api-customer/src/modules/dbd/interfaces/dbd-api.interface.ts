export interface DbdApiResponse {
  status: {
    code: string;
    description: string;
  };
  data: DbdJuristicPersonData[];
}

export interface DbdJuristicPersonData {
  'cd:OrganizationJuristicPerson': DbdJuristicPerson;
}

export interface DbdJuristicPerson {
  'cd:OrganizationJuristicID': string;
  'cd:OrganizationJuristicNameTH': string;
  'cd:OrganizationJuristicNameEN': string;
  'cd:OrganizationJuristicType': string;
  'cd:OrganizationJuristicRegisterDate': string;
  'cd:OrganizationJuristicStatus': string;
  'cd:OrganizationJuristicObjective': DbdJuristicObjective;
  'cd:OrganizationJuristicRegisterCapital': string;
  'cd:OrganizationJuristicBranchName': string;
  'cd:OrganizationJuristicAddress': DbdJuristicAddress;
}

export interface DbdJuristicObjective {
  'td:JuristicObjective': {
    'td:JuristicObjectiveCode': string;
    'td:JuristicObjectiveTextTH': string;
    'td:JuristicObjectiveTextEN': string;
  };
}

export interface DbdJuristicAddress {
  'cr:AddressType': {
    'cd:Address': string;
    'cd:Building': string | null;
    'cd:RoomNo': string | null;
    'cd:Floor': string | null;
    'cd:AddressNo': string;
    'cd:Moo': string | null;
    'cd:Yaek': string | null;
    'cd:Soi': string | null;
    'cd:Trok': string | null;
    'cd:Village': string | null;
    'cd:Road': string;
    'cd:CitySubDivision': {
      'cr:CitySubDivisionCode': string;
      'cr:CitySubDivisionTextTH': string;
    };
    'cd:City': {
      'cr:CityCode': string;
      'cr:CityTextTH': string;
    };
    'cd:CountrySubDivision': {
      'cr:CountrySubDivisionCode': string;
      'cr:CountrySubDivisionTextTH': string;
    };
  };
}
