import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationConsentService } from './organization-consent.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Organization } from '@/model/organization.entity';
import { OrganizationConsent } from '@/model/organization-consent.entity';
import { ConsentMessage } from '@/model/consent-message.entity';
import { UserConsentService } from '../user-consent/user-consent.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SaveOrganizationConsentDto } from './dto/save-organization-consent.dto';

describe('OrganizationConsentService', () => {
  let service: OrganizationConsentService;
  let organizationRepo: any;
  let organizationConsentRepo: any;
  let consentMessageRepo: any;
  let userConsentService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationConsentService,
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrganizationConsent),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ConsentMessage),
          useValue: {
            findByIds: jest.fn(),
          },
        },
        {
          provide: UserConsentService,
          useValue: {
            createUserConsentAllkonsId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationConsentService>(
      OrganizationConsentService,
    );
    organizationRepo = module.get(getRepositoryToken(Organization));
    organizationConsentRepo = module.get(
      getRepositoryToken(OrganizationConsent),
    );
    consentMessageRepo = module.get(getRepositoryToken(ConsentMessage));
    userConsentService = module.get(UserConsentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveOrganizationConsent', () => {
    const dto: SaveOrganizationConsentDto = {
      organizationId: 1,
      consentIds: [10, 11],
    };

    it('should throw BadRequestException if consentIds is empty', async () => {
      await expect(
        service.saveOrganizationConsent({ ...dto, consentIds: [] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if organization not found', async () => {
      organizationRepo.findOne.mockResolvedValue(null);
      await expect(service.saveOrganizationConsent(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if consent messages not found', async () => {
      organizationRepo.findOne.mockResolvedValue({ id: 1 });
      consentMessageRepo.findByIds.mockResolvedValue([]); // No messages found
      await expect(service.saveOrganizationConsent(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should save new consents', async () => {
      organizationRepo.findOne.mockResolvedValue({ id: 1 });
      const messages = [{ id: 10 }, { id: 11 }];
      consentMessageRepo.findByIds.mockResolvedValue(messages);

      // We expect findOne to be called 4 times total:
      // 1. Check existing for msg 1 -> null
      // 2. Load relation for msg 1 -> object
      // 3. Check existing for msg 2 -> null
      // 4. Load relation for msg 2 -> object
      organizationConsentRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 99, consentMessage: { id: 10 } })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 100, consentMessage: { id: 11 } });

      organizationConsentRepo.create.mockImplementation((val) => val);
      organizationConsentRepo.save.mockResolvedValue({ id: 99 });

      const result = await service.saveOrganizationConsent(dto);

      expect(result).toBeDefined();
      expect(organizationConsentRepo.save).toHaveBeenCalledTimes(2);
    });

    it('should skip existing consents', async () => {
      organizationRepo.findOne.mockResolvedValue({ id: 1 });
      const messages = [{ id: 10 }];
      consentMessageRepo.findByIds.mockResolvedValue(messages);
      organizationConsentRepo.findOne.mockResolvedValue({ id: 88 }); // Existing consent

      await service.saveOrganizationConsent({ ...dto, consentIds: [10] });

      expect(organizationConsentRepo.save).not.toHaveBeenCalled();
    });

    it('should call userConsentService if tokenAllkonsId and akIdConsentIds provided', async () => {
      organizationRepo.findOne.mockResolvedValue({ id: 1 });
      const messages = [{ id: 10 }];
      consentMessageRepo.findByIds.mockResolvedValue(messages);
      organizationConsentRepo.findOne.mockResolvedValue(null);
      organizationConsentRepo.create.mockReturnValue({});
      organizationConsentRepo.save.mockResolvedValue({ id: 99 });
      organizationConsentRepo.findOne.mockResolvedValue({}); // Mock return with relations

      const advancedDto = {
        ...dto,
        consentIds: [10],
        tokenAllkonsId: 'token',
        akIdConsentIds: ['10'],
      };

      await service.saveOrganizationConsent(advancedDto);

      expect(
        userConsentService.createUserConsentAllkonsId,
      ).toHaveBeenCalledWith(['10'], 'token');
    });
  });

  describe('findOrganizationConsentByUserId', () => {
    it('should return consents', async () => {
      const expected = [{ id: 1 }];
      organizationConsentRepo.find.mockResolvedValue(expected);
      const result = await service.findOrganizationConsentByUserId(1);
      expect(result).toEqual(expected);
      expect(organizationConsentRepo.find).toHaveBeenCalledWith({
        where: { organizeId: 1 },
      });
    });
  });

  describe('findOrganizationConsentByOrgId', () => {
    it('should return consents', async () => {
      const expected = [{ id: 1 }];
      organizationConsentRepo.find.mockResolvedValue(expected);
      const result = await service.findOrganizationConsentByOrgId(1);
      expect(result).toEqual(expected);
      expect(organizationConsentRepo.find).toHaveBeenCalledWith({
        where: { organizeId: 1 },
      });
    });
  });

  describe('deleteOrganizationConsentById', () => {
    it('should delete consents', async () => {
      const ids = [1, 2];
      await service.deleteOrganizationConsentById(ids);
      expect(organizationConsentRepo.delete).toHaveBeenCalledWith(ids);
    });
  });
});
