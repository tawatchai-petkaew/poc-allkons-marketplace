import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { ActJwtGuard } from '@/guard/act-jwt.guard';

describe('FileUploadController', () => {
  let controller: FileUploadController;
  let service: any;

  beforeEach(async () => {
    const mockService = {
      upload: jest.fn(),
      delete: jest.fn(),
      destroy: jest.fn(),
      setTypeToPermanent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileUploadController],
      providers: [
        {
          provide: FileUploadService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(ActJwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FileUploadController>(FileUploadController);
    service = module.get<FileUploadService>(FileUploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload', () => {
    it('should upload file', async () => {
      service.upload.mockResolvedValue({});
      const file = {};
      const dto: any = {
        folderName: 'test',
        type: 'PERMANENT',
        isPublic: false,
      };

      await controller.upload(file, dto);
      expect(service.upload).toHaveBeenCalledWith(
        file,
        'test',
        'PERMANENT',
        false,
      );
    });
  });

  describe('delete', () => {
    it('should delete file', async () => {
      await controller.delete('1');
      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('destroy', () => {
    it('should destroy file', async () => {
      await controller.destroy('1');
      expect(service.destroy).toHaveBeenCalledWith(1);
    });
  });

  describe('setTypeToPermanent', () => {
    it('should set type to permanent', async () => {
      await controller.setTypeToPermanent({ fileIds: [1, 2] });
      expect(service.setTypeToPermanent).toHaveBeenCalledWith([1, 2]);
    });
  });
});
