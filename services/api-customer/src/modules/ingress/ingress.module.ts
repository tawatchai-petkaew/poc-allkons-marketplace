import { Module } from '@nestjs/common';
import { IngressService } from './ingress.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [IngressService],
  exports: [IngressService],
})
export class IngressModule {}
