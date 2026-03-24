import { Test, TestingModule } from '@nestjs/testing';
import { TemplateService } from './template.service';
import * as fs from 'fs';
import { NotFoundException, StreamableFile } from '@nestjs/common';

jest.mock('fs');

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateService],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getImportProductTemplateStream', () => {
    it('should return a StreamableFile when file exists', async () => {
      // Mock fs
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.createReadStream as jest.Mock).mockReturnValue('mock-stream');

      const result = await service.getImportProductTemplateStream();

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.createReadStream).toHaveBeenCalled();
      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should throw NotFoundException when file does not exist', async () => {
      // Mock fs
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(service.getImportProductTemplateStream()).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
