import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArticlePublicService } from './article-public.service';
import { ArticlePublicController } from './article-public.controller';

import { Article } from '../../model/article.entity';

import { RequestContextModule } from '../request-context/request-context.module';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), RequestContextModule],
  providers: [ArticlePublicService],
  controllers: [ArticlePublicController]
})
export class ArticlePublicModule {}
