import { Module } from '@nestjs/common';
import { JwtStrategy } from '@/auth/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '@/model/user.entity';
import { Merchant } from '@/model/merchant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '@/model/organization.entity';
import { AuthController } from './auth.controller';
import { AuthCenterService } from './auth-center.service';
import { AuthService } from './auth.service';
import { UserModule as UserModuleV0 } from '@/modules/user/user.module';
import { UserOrganizationModule as UserOrganizationModuleV0 } from '@/modules/user-organization/user-organization.module';
import { UserMerchantModule as UserMerchantModuleV0 } from '@/modules/user-merchant/user-merchant.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Merchant, Organization]),
    UserModuleV0, // TODO: Remove later (Import to use UserService from v0)
    UserOrganizationModuleV0, // TODO: Remove later (Import to use UserOrganizationService from v0)
    UserMerchantModuleV0,
    // TODO: Remove later (Import to use JwtService for deprecate token)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AuthCenterService, AuthService],
})
export class AuthModule {}
