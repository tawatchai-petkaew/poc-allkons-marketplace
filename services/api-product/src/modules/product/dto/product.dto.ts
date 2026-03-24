import { IsNotEmpty, IsOptional } from 'class-validator';

import { Product } from '../../../model/product.entity';
import { ProductTranslation } from '../../../model/product-translation.entity';
import { ProductImage } from '../../../model/product-image.entity';
import { Merchant } from '../../../model/merchant.entity';
import { ProductItem } from '../../../model/product-item.entity';

import { ProductCategoryDto } from '../../product-category/dto/product-category.dto';
import { ProductBrandDto } from '../../product-brand/dto/product-brand.dto';

export enum ProductStatus {
  AVAILABLE = 'available',
  DRAFT = 'draft',
  SOON = 'soon',
  DISCONTINUED = 'discontinued',
}

export enum ProductRelationStatus {
  ON_CATEGORY = 'onCategory',
  ALL_CATEGORY = 'allCategory',
  CUSTOM = 'custom',
}

export enum ProductKind {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
  SET = 'set',
  SERVICE = 'service',
}

export class ProductDto implements Readonly<ProductDto> {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  minFinalProductPrice: number;

  @IsNotEmpty()
  maxFinalProductPrice: number;

  @IsOptional()
  highlight: string;

  @IsOptional()
  description: string;

  @IsOptional()
  bigUnit: string;

  @IsOptional()
  unit: string;

  @IsOptional()
  locale: string;

  @IsNotEmpty()
  slug: string;

  @IsOptional()
  barCode: string;

  @IsOptional()
  videoUrl: string;

  @IsOptional()
  model: string;

  @IsOptional()
  isContainVAT: boolean;

  @IsOptional()
  piecePerBigUnit: number;

  @IsOptional()
  weightSize: number;

  @IsOptional()
  widthSize: number;

  @IsOptional()
  lengthSize: number;

  @IsOptional()
  heightSize: number;

  @IsOptional()
  soldQuantity: number;

  @IsOptional()
  type: ProductStatus;

  @IsNotEmpty()
  kind: ProductKind;

  @IsOptional()
  isPackage: boolean;

  @IsOptional()
  isRecommend: boolean;

  @IsOptional()
  isPopular: boolean;

  @IsOptional()
  isNew: boolean;

  @IsOptional()
  relationStatus: ProductRelationStatus;

  @IsOptional()
  valueCustomRelationStatus: string[];

  @IsOptional()
  isContactOnly?: boolean;

  @IsOptional()
  isHideProductPrice?: boolean;

  @IsOptional()
  telContact?: string;

  @IsOptional()
  emailContact?: string;

  @IsOptional()
  lineContact?: string;

  @IsOptional()
  facebookContact?: string;

  @IsOptional()
  instagramContact?: string;

  @IsOptional()
  urlGoogleMap?: string;

  @IsOptional()
  createdAt: Date;

  @IsOptional()
  updatedAt: Date;

  @IsOptional()
  productCategory: any;

  @IsOptional()
  countProductFavorites: number;

  @IsOptional()
  productBrand: any;

  @IsOptional()
  merchant: Merchant;

  @IsOptional()
  productItems: ProductItem[];

  @IsOptional()
  productImages: ProductImage[];

  public static from(dto: Partial<ProductDto>) {
    const it = new ProductDto();
    it.id = dto.id;
    it.name = dto.name;
    it.productItems = dto.productItems;
    it.highlight = dto.highlight;
    it.description = dto.description;
    it.unit = dto.unit;
    it.bigUnit = dto.bigUnit;
    it.slug = dto.slug;
    it.minFinalProductPrice = dto.minFinalProductPrice;
    it.maxFinalProductPrice = dto.maxFinalProductPrice;
    it.barCode = dto.barCode;
    it.videoUrl = dto.videoUrl;
    it.model = dto.model;
    it.soldQuantity = dto.soldQuantity;
    it.isContainVAT = dto.isContainVAT;
    it.piecePerBigUnit = dto.piecePerBigUnit;
    it.weightSize = dto.weightSize;
    it.widthSize = dto.widthSize;
    it.lengthSize = dto.lengthSize;
    it.heightSize = dto.heightSize;
    it.type = dto.type;
    it.kind = dto.kind;
    it.isRecommend = dto.isRecommend;
    it.isPopular = dto.isPopular;
    it.isNew = dto.isNew;
    it.relationStatus = dto.relationStatus;
    it.valueCustomRelationStatus = dto.valueCustomRelationStatus;
    it.createdAt = dto.createdAt;
    it.updatedAt = dto.updatedAt;
    it.productCategory = dto.productCategory;
    it.productBrand = dto.productBrand;
    it.merchant = dto.merchant;
    it.productImages = dto.productImages;
    it.isPackage = dto.isPackage;
    it.isContactOnly = dto.isContactOnly;
    it.telContact = dto.telContact;
    it.emailContact = dto.emailContact;
    it.lineContact = dto.lineContact;
    it.facebookContact = dto.facebookContact;
    it.instagramContact = dto.instagramContact;
    it.urlGoogleMap = dto.urlGoogleMap;
    it.isHideProductPrice = dto.isHideProductPrice;

    return {
      ...it,
      countProductFavorites: dto?.countProductFavorites,
    };
  }

  public static fromEntity(
    entity: Product,
    translation: ProductTranslation,
    nestedResponse: any[] = [],
  ): ProductDto {
    return this.from({
      id: entity.id,
      name: translation && translation.name ? translation.name : '',
      productItems: entity.productItems,
      highlight:
        translation && translation.highlight ? translation.highlight : '',
      description:
        translation && translation.description ? translation.description : '',
      unit: translation && translation.unit ? translation.unit : '',
      bigUnit: translation && translation.bigUnit ? translation.bigUnit : '',
      slug: entity.slug,
      minFinalProductPrice: entity.minFinalProductPrice,
      maxFinalProductPrice: entity.maxFinalProductPrice,
      soldQuantity: entity.soldQuantity,
      barCode: entity.barCode,
      videoUrl: entity.videoUrl,
      model: entity.model,
      piecePerBigUnit: entity.piecePerBigUnit,
      weightSize: entity.weightSize,
      widthSize: entity.widthSize,
      lengthSize: entity.lengthSize,
      heightSize: entity.heightSize,
      type: entity.type,
      kind: entity.kind,
      isPackage: entity.isPackage,
      isRecommend: entity.isRecommend,
      isPopular: entity.isPopular,
      isNew: entity.isNew,
      relationStatus: entity.relationStatus,
      valueCustomRelationStatus: entity.valueCustomRelationStatus,
      productCategory: entity.productCategory
        ? ProductCategoryDto.fromEntity(
            entity.productCategory,
            nestedResponse[0],
          )
        : entity.productCategory,
      productBrand: entity.productBrand
        ? ProductBrandDto.fromEntity(entity.productBrand, nestedResponse[1])
        : entity.productBrand,
      merchant: entity.merchant,
      productImages: entity.productImages,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      isContactOnly: entity.isContactOnly,
      telContact: entity.telContact,
      emailContact: entity.emailContact,
      lineContact: entity.lineContact,
      facebookContact: entity.facebookContact,
      instagramContact: entity.instagramContact,
      urlGoogleMap: entity.urlGoogleMap,
      isHideProductPrice: entity.isHideProductPrice,
    });
  }

  public static toEntity(dto: Partial<ProductDto>) {
    const it = new Product();
    it.slug = dto.slug;
    it.minFinalProductPrice = dto.minFinalProductPrice;
    it.maxFinalProductPrice = dto.maxFinalProductPrice;
    it.productItems = dto.productItems;
    it.barCode = dto.barCode;
    it.videoUrl = dto.videoUrl;
    it.model = dto.model;
    it.soldQuantity = dto.soldQuantity;
    it.piecePerBigUnit = dto.piecePerBigUnit;
    it.weightSize = dto.weightSize;
    it.widthSize = dto.widthSize;
    it.lengthSize = dto.lengthSize;
    it.heightSize = dto.heightSize;
    it.type = dto.type;
    it.kind = dto.kind;
    it.isRecommend = dto.isRecommend;
    it.isPopular = dto.isPopular;
    it.isNew = dto.isNew;
    it.relationStatus = dto.relationStatus;
    it.valueCustomRelationStatus = dto.valueCustomRelationStatus;
    it.productCategory = dto.productCategory;
    it.productBrand = dto.productBrand;
    it.merchant = dto.merchant;
    it.productImages = dto.productImages;
    it.isPackage = dto.isPackage;
    it.isContactOnly = dto.isContactOnly;
    it.telContact = dto.telContact;
    it.emailContact = dto.emailContact;
    it.lineContact = dto.lineContact;
    it.facebookContact = dto.facebookContact;
    it.instagramContact = dto.instagramContact;
    it.urlGoogleMap = dto.urlGoogleMap;
    it.isHideProductPrice = dto.isHideProductPrice;

    return it;
  }
}
