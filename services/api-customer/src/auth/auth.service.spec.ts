import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../model/user.entity';
import { Cart } from '../model/cart.entity';
import { CustomerWallet } from '../model/customer-wallet.entity';
import { Merchant } from '../model/merchant.entity';
import { Customer } from '../model/customer.entity';
import { Organization } from '@/model/organization.entity';
import { UserService } from '../modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CustomerPublicService } from '../modules/customer-public/customer-public.service';
import { HttpService } from '@nestjs/axios';
import { MailService } from '../mail/mail.service';
import { AuthCenterService } from '../modules/auth-center/auth-center.service';
import { UserMerchantService } from '../modules/user-merchant/user-merchant.service';
import { UserOrganizationService } from '@/modules/user-organization/user-organization.service';

const createMockRepo = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
});

const mockService = {
  get: jest.fn(),
  post: jest.fn(),
  sign: jest.fn(),
  verify: jest.fn(),
  sendMail: jest.fn(),
  generateAuthToken: jest.fn(),
  registerWithPhoneNumber: jest.fn(),
  loginPhoneOrEmail: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: createMockRepo() },
        { provide: getRepositoryToken(Cart), useValue: createMockRepo() },
        { provide: getRepositoryToken(CustomerWallet), useValue: createMockRepo() },
        { provide: getRepositoryToken(Merchant), useValue: createMockRepo() },
        { provide: getRepositoryToken(Customer), useValue: createMockRepo() },
        { provide: getRepositoryToken(Organization), useValue: createMockRepo() },
        { provide: UserService, useValue: mockService },
        { provide: JwtService, useValue: mockService },
        { provide: CustomerPublicService, useValue: mockService },
        { provide: HttpService, useValue: mockService },
        { provide: MailService, useValue: mockService },
        { provide: AuthCenterService, useValue: mockService },
        { provide: UserMerchantService, useValue: mockService },
        { provide: UserOrganizationService, useValue: mockService },
        { provide: 'APP_ID_BUYER', useValue: 123 }, 
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
