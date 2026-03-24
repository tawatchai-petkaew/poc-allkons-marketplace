import { Test, TestingModule } from '@nestjs/testing';
import { UserConsentService } from './user-consent.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@/model/user.entity';
import { UserConsent } from '@/model/user-consent.entity';
import { ConsentMessage } from '@/model/consent-message.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');

describe('UserConsentService', () => {
  let service: UserConsentService;
  let userRepo: any;
  let userConsentRepo: any;
  let consentMessageRepo: any;

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
    };
    userConsentRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };
    consentMessageRepo = {
      findByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserConsentService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(UserConsent), useValue: userConsentRepo },
        {
          provide: getRepositoryToken(ConsentMessage),
          useValue: consentMessageRepo,
        },
      ],
    }).compile();

    service = module.get<UserConsentService>(UserConsentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveUserConsent', () => {
    it('should throw BadRequestException if phoneNumber is missing', async () => {
      await expect(
        service.saveUserConsent({ phoneNumber: '', consentIds: [1] } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if consentIds is empty', async () => {
      await expect(
        service.saveUserConsent({ phoneNumber: '123', consentIds: [] } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        service.saveUserConsent({ phoneNumber: '123', consentIds: [1] } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if consent messages missing', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1 });
      consentMessageRepo.findByIds.mockResolvedValue([]);
      await expect(
        service.saveUserConsent({ phoneNumber: '123', consentIds: [1] } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should save new consent', async () => {
      const user = { id: 1 };
      const consentMessage = { id: 10, consentType: 'type', version: 'v1' };
      const savedRelation = { id: 100, consentMessage, acceptedAt: new Date() };

      userRepo.findOne.mockResolvedValue(user);
      consentMessageRepo.findByIds.mockResolvedValue([consentMessage]);
      userConsentRepo.findOne
        .mockResolvedValueOnce(null) // Check existing
        .mockResolvedValueOnce(savedRelation); // Load relation

      userConsentRepo.create.mockReturnValue({
        userId: 1,
        consentMessageId: 10,
      });
      userConsentRepo.save.mockResolvedValue({ id: 100 });

      const result = await service.saveUserConsent({
        phoneNumber: '123',
        consentIds: [10],
      } as any);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('saved');
      expect(userConsentRepo.save).toHaveBeenCalled();
    });

    it('should skip existing consent', async () => {
      const user = { id: 1 };
      const consentMessage = { id: 10, consentType: 'type', version: 'v1' };

      userRepo.findOne.mockResolvedValue(user);
      consentMessageRepo.findByIds.mockResolvedValue([consentMessage]);
      userConsentRepo.findOne.mockResolvedValue({ id: 100 }); // Existing

      await service.saveUserConsent({
        phoneNumber: '123',
        consentIds: [10],
      } as any);
      expect(userConsentRepo.save).not.toHaveBeenCalled();
    });

    it('should call allkons id api', async () => {
      const user = { id: 1 };
      const consentMessage = { id: 10, consentType: 'type', version: 'v1' };
      const savedRelation = { id: 100, consentMessage, acceptedAt: new Date() };

      userRepo.findOne.mockResolvedValue(user);
      consentMessageRepo.findByIds.mockResolvedValue([consentMessage]);
      userConsentRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(savedRelation);
      userConsentRepo.create.mockReturnValue({});
      userConsentRepo.save.mockResolvedValue({ id: 100 });

      (axios.post as jest.Mock).mockResolvedValue({ data: {} });

      await service.saveUserConsent({
        phoneNumber: '123',
        consentIds: [10],
        tokenAllkonsId: 'tok',
        akIdConsentIds: ['ak1'],
      } as any);

      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('findUserConsentByUserId', () => {
    it('should find consents', async () => {
      userConsentRepo.find.mockResolvedValue([]);
      expect(await service.findUserConsentByUserId(1)).toEqual([]);
    });
  });

  describe('deleteUserConsentByIds', () => {
    it('should delete consents', async () => {
      await service.deleteUserConsentByIds([1, 2]);
      expect(userConsentRepo.delete).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('deleteUserConsentById', () => {
    it('should delete consent', async () => {
      await service.deleteUserConsentById(1);
      expect(userConsentRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('createUserConsentAllkonsId', () => {
    it('should throw on error', async () => {
      (axios.post as jest.Mock).mockRejectedValue(new Error('fail'));
      await expect(
        service.createUserConsentAllkonsId(['1'], 'tok'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
