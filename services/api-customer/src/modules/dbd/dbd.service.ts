import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DbdApiResponse } from './interfaces/dbd-api.interface';
import { DbdApiResponseDto, DbdJuristicPersonDto, JuristicObjectiveDto, JuristicAddressDto } from './dto/dbd-response.dto';

@Injectable()
export class DbdService {
  private readonly baseUrl = 'https://openapi.dbd.go.th/api/v1';

  constructor(private readonly httpService: HttpService) {}

  async getJuristicPersonById(juristicId: string): Promise<DbdApiResponseDto> {
    try {
      const url = `${this.baseUrl}/juristic_person/${juristicId}`;

      const response = await firstValueFrom(
        this.httpService.get<DbdApiResponse>(url)
      );

      const apiResponse = response.data;

      // Transform API response to DTO
      const transformedData: DbdJuristicPersonDto[] = apiResponse.data.map((item) => {
        const juristicPerson = item['cd:OrganizationJuristicPerson'];
        
        // Transform objective
        const objective: JuristicObjectiveDto = {
          code: juristicPerson['cd:OrganizationJuristicObjective']['td:JuristicObjective']['td:JuristicObjectiveCode'],
          textTH: juristicPerson['cd:OrganizationJuristicObjective']['td:JuristicObjective']['td:JuristicObjectiveTextTH'],
          textEN: juristicPerson['cd:OrganizationJuristicObjective']['td:JuristicObjective']['td:JuristicObjectiveTextEN'],
        };

        // Transform address
        const addressData = juristicPerson['cd:OrganizationJuristicAddress']['cr:AddressType'];
        const address: JuristicAddressDto = {
          address: addressData['cd:Address'],
          building: addressData['cd:Building'],
          roomNo: addressData['cd:RoomNo'],
          floor: addressData['cd:Floor'],
          addressNo: addressData['cd:AddressNo'],
          moo: addressData['cd:Moo'],
          yaek: addressData['cd:Yaek'],
          soi: addressData['cd:Soi'],
          trok: addressData['cd:Trok'],
          village: addressData['cd:Village'],
          road: addressData['cd:Road'],
          citySubDivisionCode: addressData['cd:CitySubDivision']['cr:CitySubDivisionCode'],
          citySubDivisionTextTH: addressData['cd:CitySubDivision']['cr:CitySubDivisionTextTH'],
          cityCode: addressData['cd:City']['cr:CityCode'],
          cityTextTH: addressData['cd:City']['cr:CityTextTH'],
          countrySubDivisionCode: addressData['cd:CountrySubDivision']['cr:CountrySubDivisionCode'],
          countrySubDivisionTextTH: addressData['cd:CountrySubDivision']['cr:CountrySubDivisionTextTH'],
        };

        return {
          id: juristicPerson['cd:OrganizationJuristicID'],
          nameTH: juristicPerson['cd:OrganizationJuristicNameTH'],
          nameEN: juristicPerson['cd:OrganizationJuristicNameEN'],
          type: juristicPerson['cd:OrganizationJuristicType'],
          registerDate: juristicPerson['cd:OrganizationJuristicRegisterDate'],
          status: juristicPerson['cd:OrganizationJuristicStatus'],
          objective,
          registerCapital: juristicPerson['cd:OrganizationJuristicRegisterCapital'],
          branchName: juristicPerson['cd:OrganizationJuristicBranchName'],
          address,
        };
      });

      return {
        status: {
          code: apiResponse.status.code,
          description: apiResponse.status.description,
        },
        data: transformedData,
      };

    } catch (error) {      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'External API error';
        throw new HttpException(
          `DBD API Error: ${message}`,
          status >= 400 && status < 500 ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      throw new HttpException(
        'Failed to connect to DBD API',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
