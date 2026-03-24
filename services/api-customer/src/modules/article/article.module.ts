import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

import { Article } from '../../model/article.entity';
import { ImageUpload } from '../../model/image-upload.entity';

import { MerchantModule } from '../merchant/merchant.module';
import { RequestContextModule } from '../request-context/request-context.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, ImageUpload]),
    RequestContextModule,
    MerchantModule,
  ],
  providers: [ArticleService],
  controllers: [ArticleController],
})
export class ArticleModule {}
