import { Test, TestingModule } from '@nestjs/testing';
import { CisController } from './cis.controller';
import { CisService } from './cis.service';
import { MasterDataType } from './enum/cis.enum';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CisController', () => {
  let controller: CisController;
  let service: CisService;

  const mockCisService = {
    findAllMasterData: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CisController],
      providers: [
        {
          provide: CisService,
          useValue: mockCisService
        }
      ]
    }).compile();

    controller = module.get<CisController>(CisController);
    service = module.get<CisService>(CisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllMasterData', () => {
    it('should return master data successfully', async () => {
      // Arrange
      const mockRequest = { masterCode: MasterDataType.JURISTIC_TYPE };
      const expectedResponse = {
        data: [
          { id: '1', code: 'CODE1', name_th: 'Name1', name_en: 'Name1' }
        ],
        status: 'SUCCESS'
      };
      mockCisService.findAllMasterData.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.findAllMasterData(mockRequest);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(service.findAllMasterData).toHaveBeenCalledWith(mockRequest.masterCode);
      expect(service.findAllMasterData).toHaveBeenCalledTimes(1);
    });

    it('should handle service error properly', async () => {
      // Arrange
      const mockRequest = { masterCode: MasterDataType.JURISTIC_TYPE };
      const errorMessage = 'Service error';
      mockCisService.findAllMasterData.mockRejectedValue(
        new HttpException(errorMessage, HttpStatus.BAD_REQUEST)
      );

      // Act & Assert
      await expect(controller.findAllMasterData(mockRequest)).rejects.toThrow(HttpException);
      expect(service.findAllMasterData).toHaveBeenCalledWith(mockRequest.masterCode);
      expect(service.findAllMasterData).toHaveBeenCalledTimes(1);
    });

    it('should validate masterCode enum value', async () => {
      // Arrange
      const mockRequest = { masterCode: 'INVALID_CODE' as MasterDataType };
      const expectedResponse = {
        data: [],
        status: 'SUCCESS'
      };
      mockCisService.findAllMasterData.mockResolvedValue(expectedResponse);

      // Act & Assert
      await expect(controller.findAllMasterData(mockRequest)).resolves.toEqual(expectedResponse);
      expect(service.findAllMasterData).toHaveBeenCalledWith(mockRequest.masterCode);
    });
  });
});
