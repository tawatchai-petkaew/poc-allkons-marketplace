import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryType, DeliveryReceiveType } from '@/model/order.entity';
import { DeliveryTime, DeliveryBy } from '@/model/sub-order.entity';

class ProductDto {
  @ApiProperty({ description: 'Product Item ID', example: 1256870 })
  @IsInt()
  @IsNotEmpty()
  productItemId: number;

  @ApiProperty({
    description: 'Price of the product',
    example: 320.5,
    type: 'number',
    format: 'decimal',
  })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'Quantity of the product', example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit of the product', example: 'EA' })
  @IsString()
  unit: string;

  @ApiProperty({ description: 'Name of the product', example: 'product a' })
  @IsString()
  productItemName: string;

  @ApiProperty({
    description: 'URL of the product',
    example: 'https://s3.....com',
  })
  @IsString()
  productItemImageUrl: string;
}

class DocumentDetailDto {
  @ApiProperty({
    description: 'PO document file ID',
    example: 2566,
  })
  @IsInt()
  fileId: number;
}

class DocumentDto {
  @ApiProperty({
    description: 'List of PO document file IDs',
    type: [DocumentDetailDto],
    example: [{ fileId: 2566 }, { fileId: 2567 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDetailDto)
  po: DocumentDetailDto[];
}

class AddressDetailDto {
  @ApiProperty({ description: 'Receiver name', example: 'ประทัด' })
  @IsString()
  @IsNotEmpty()
  receiverName: string;

  @ApiProperty({ description: 'Receiver phone number', example: '0999999999' })
  @IsString()
  @IsNotEmpty()
  receiverPhone: string;

  @ApiProperty({ description: 'Address Name', example: 'John Home' })
  @IsString()
  @IsOptional()
  addressName?: string;

  @ApiProperty({ description: 'Address line', example: '33/23' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'Country ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  countryId: number;

  @ApiProperty({ description: 'Province ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  provinceId: number;

  @ApiProperty({ description: 'District ID', example: 50 })
  @IsInt()
  @IsNotEmpty()
  districtId: number;

  @ApiProperty({ description: 'Sub-district ID', example: 194 })
  @IsInt()
  @IsNotEmpty()
  subDistrictId: number;

  @ApiProperty({ description: 'Zip Code ID', example: 197 })
  @IsInt()
  @IsNotEmpty()
  zipCodeId: number;

  @ApiProperty({ description: 'Project ID', example: 197 })
  @IsString()
  @IsOptional()
  projectName?: string;

  @ApiProperty({ description: 'Receiver name', example: 'ประทัด' })
  @IsString()
  @IsOptional()
  remark?: string;
}
export class AddressDto {
  @ApiProperty({
    description: 'Shipping Address',
    type: AddressDetailDto,
  })
  @ValidateNested()
  @Type(() => AddressDetailDto)
  shipping: AddressDetailDto;
}

class DeliveryDto {
  @ApiProperty({ description: 'Reference PO Number', example: '' })
  @IsString()
  @IsOptional()
  refPONumber?: string;

  @ApiProperty({ description: 'Delivery Date', example: '2024-03-02' })
  @IsString()
  @IsNotEmpty()
  deliveryDate: string;

  @ApiProperty({ description: 'Delivery Note', example: 'note something' })
  @IsString()
  @IsOptional()
  deliveryNote?: string;

  @ApiProperty({
    description: 'Delivery Time',
    example: DeliveryTime.ANYTIME,
    enum: DeliveryTime,
  })
  @IsNotEmpty()
  @IsEnum(DeliveryTime)
  deliveryTime: DeliveryTime;

  @ApiProperty({
    description: 'Delivery By',
    example: DeliveryBy.AGENT,
    enum: DeliveryBy,
  })
  @IsNotEmpty()
  @IsEnum(DeliveryBy)
  deliveryBy: DeliveryBy;

  @ApiProperty({ description: 'Remark', example: '' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiProperty({ description: 'List of products', type: [ProductDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[];

  @ApiProperty({ description: 'Documents', type: DocumentDto })
  @ValidateNested()
  @IsOptional()
  @Type(() => DocumentDto)
  documents: DocumentDto;

  @ApiProperty({
    description: 'Shipping Address',
    type: AddressDto,
    example: {
      shipping: {
        receiverName: 'ประทัด',
        receiverPhone: '0999999999',
        projectName: 'project a',
        addressName: 'John Home',
        address: '33/23 Sukhumvit Road',
        countryId: 1,
        provinceId: 1,
        districtId: 50,
        subDistrictId: 194,
        zipCodeId: 197,
        remark: 'test',
      },
    },
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'User ID', example: 11 })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'Organization ID', example: 11 })
  @IsInt()
  @IsNotEmpty()
  organizeId: number;

  @ApiProperty({ description: 'Cart ID', example: 14676 })
  @IsInt()
  @IsNotEmpty()
  cartId: number;

  @ApiProperty({ description: 'Total Price', example: 320 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsNotEmpty()
  totalPrice: number;

  @ApiProperty({ description: 'Total Delivery Price', example: 0 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsNotEmpty()
  totalDeliveryPrice: number;

  @ApiProperty({ description: 'Grand Total', example: 320 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsNotEmpty()
  grandTotal: number;

  @ApiProperty({
    description: 'Delivery Type',
    example: DeliveryType.PICKUP,
    enum: DeliveryType,
  })
  @IsNotEmpty()
  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  @ApiProperty({
    description: 'Delivery Receive Type',
    example: DeliveryReceiveType.SENDONCE,
    enum: DeliveryReceiveType,
  })
  @IsNotEmpty()
  @IsEnum(DeliveryReceiveType)
  deliveryReceiveType: DeliveryReceiveType;

  @ApiProperty({ description: 'List of deliveries', type: [DeliveryDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DeliveryDto)
  deliveries: DeliveryDto[];
}
