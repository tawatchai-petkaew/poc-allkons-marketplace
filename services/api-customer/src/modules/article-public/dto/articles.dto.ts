import { IsNotEmpty, IsOptional } from 'class-validator';

import { Merchant } from '../../../model/merchant.entity';
import { ImageUpload } from '../../../model/image-upload.entity';
import { Article } from '../../../model/article.entity';

export class ArticlesDto implements Readonly<ArticlesDto> {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  tag: string[];

  @IsOptional()
  releasedAt: Date;

  @IsOptional()
  isPublished: boolean;

  @IsOptional()
  titleSeo: string;

  @IsOptional()
  descriptionSeo: string;

  @IsOptional()
  urlSlug: string;

  @IsOptional()
  keywordSeo: string[];

  @IsOptional()
  merchant: Merchant;

  @IsOptional()
  imageUpload: ImageUpload;

  public static from(dto: Partial<ArticlesDto>) {
    const it = new Article();
    it.id = dto.id;
    it.name = dto.name;
    it.tag = dto.tag;
    it.releasedAt = dto.releasedAt;
    it.isPublished = dto.isPublished;
    it.titleSeo = dto.titleSeo;
    it.descriptionSeo = dto.descriptionSeo;
    it.urlSlug = dto.urlSlug;
    it.keywordSeo = dto.keywordSeo;
    it.imageUpload = dto.imageUpload;

    return {
      ...it,
    };
  }

  public static fromEntity(entity: Article) {
    return this.from({
      id: entity.id,
      name: entity.name,
      tag: entity.tag,
      releasedAt: entity.releasedAt,
      isPublished: entity.isPublished,
      titleSeo: entity.titleSeo,
      descriptionSeo: entity.descriptionSeo,
      urlSlug: entity.urlSlug,
      keywordSeo: entity.keywordSeo,
      imageUpload: entity.imageUpload,
      merchant: null,
    });
  }
}
