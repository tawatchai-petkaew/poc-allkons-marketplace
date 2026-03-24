import { Test, TestingModule } from '@nestjs/testing';
import { DbdService } from './dbd.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DbdApiResponse } from './interfaces/dbd-api.interface';

describe('DbdService', () => {
  let service: DbdService;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DbdService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<DbdService>(DbdService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getJuristicPersonById', () => {
    const juristicId = '0105553018266';
    const mockApiResponse: DbdApiResponse = {
      status: {
        code: '200',
        description: 'Success',
      },
      data: [
        {
          'cd:OrganizationJuristicPerson': {
            'cd:OrganizationJuristicID': '0105553018266',
            'cd:OrganizationJuristicNameTH': 'บริษัท ทดสอบ จำกัด',
            'cd:OrganizationJuristicNameEN': 'TEST COMPANY LIMITED',
            'cd:OrganizationJuristicType': 'Company Limited',
            'cd:OrganizationJuristicRegisterDate': '2553-01-28',
            'cd:OrganizationJuristicStatus': 'Active',
            'cd:OrganizationJuristicRegisterCapital': '1000000.00',
            'cd:OrganizationJuristicBranchName': 'Head Office',
            'cd:OrganizationJuristicObjective': {
              'td:JuristicObjective': {
                'td:JuristicObjectiveCode': '12345',
                'td:JuristicObjectiveTextTH': 'วัตถุประสงค์',
                'td:JuristicObjectiveTextEN': 'Objective',
              },
            },
            'cd:OrganizationJuristicAddress': {
              'cr:AddressType': {
                'cd:Address': '123/45',
                'cd:Building': 'Tower',
                'cd:RoomNo': '101',
                'cd:Floor': '1',
                'cd:AddressNo': '123/45',
                'cd:Moo': '1',
                'cd:Yaek': 'Yaek 1',
                'cd:Soi': 'Soi 2',
                'cd:Trok': 'Trok 3',
                'cd:Village': 'Village',
                'cd:Road': 'Road',
                'cd:CitySubDivision': {
                  'cr:CitySubDivisionCode': '100101',
                  'cr:CitySubDivisionTextTH': 'Subdistrict',
                },
                'cd:City': {
                  'cr:CityCode': '1001',
                  'cr:CityTextTH': 'District',
                },
                'cd:CountrySubDivision': {
                  'cr:CountrySubDivisionCode': '10',
                  'cr:CountrySubDivisionTextTH': 'Province',
                },
              },
            },
          },
        },
      ],
    };

    it('should return transformed data on success', async () => {
      mockHttpService.get.mockReturnValue(of({ data: mockApiResponse }));

      const result = await service.getJuristicPersonById(juristicId);

      expect(result.status.code).toEqual('200');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toEqual('0105553018266');
      expect(result.data[0].nameTH).toEqual('บริษัท ทดสอบ จำกัด');
      expect(result.data[0].address.cityTextTH).toEqual('District');
    });

    it('should throw BadRequestException on API error response (4xx-5xx with message)', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { message: 'Not Found' },
        },
      };
      mockHttpService.get.mockReturnValue(throwError(() => errorResponse));

      await expect(service.getJuristicPersonById(juristicId)).rejects.toThrow(
        new HttpException('DBD API Error: Not Found', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw InternalServerErrorException on Network Error', async () => {
      const errorResponse = { message: 'Network Error' };
      mockHttpService.get.mockReturnValue(throwError(() => errorResponse));

      await expect(service.getJuristicPersonById(juristicId)).rejects.toThrow(
        new HttpException(
          'Failed to connect to DBD API',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
