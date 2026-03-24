import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductMatchingService } from './product-matching.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 120000, // 2 minute timeout
      maxRedirects: 5,
    }),
  ],
  providers: [ProductMatchingService],
  exports: [ProductMatchingService],
})
export class ProductMatchingModule {}
