import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ImageUploadFolder } from '../../model/image-upload-folder.entity';
import { Merchant } from '../../model/merchant.entity';
import { ImageUpload } from '../../model/image-upload.entity';

import { CreateImageUploadFolderDto } from './dto/create-image-upload-folder.dto';
import { ImageUploadFolderDto } from './dto/image-upload-folder.dto';
import { UpdateImageUploadFolderDto } from './dto/update-image-upload-folder.dto';
import { RequestContextService } from '../request-context/request-context.service';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class ImageUploadFolderService {
  constructor(
    @InjectRepository(ImageUploadFolder)
    private readonly imageUploadFolderRepo: Repository<ImageUploadFolder>,
    @InjectRepository(ImageUpload)
    private readonly imageUploadRepo: Repository<ImageUpload>,
    @InjectRepository(Merchant)
    private readonly merchantRepo: Repository<Merchant>,
    private readonly contextService: RequestContextService
  ) {}

  public async create(dto: CreateImageUploadFolderDto) {
    const merchant = await this.merchantRepo.findOne({ where: { id: dto.merchantId } });

    const parentDto = { 
      ...dto,
      merchant: merchant
    };

    return this.imageUploadFolderRepo
      .save(CreateImageUploadFolderDto.toEntity(parentDto))
      .then(async (e) => {
        return ImageUploadFolderDto.fromEntity(e);
      });
  }

  public async showAll(params): Promise<ImageUploadFolderDto[]> {
    const merchant = await this.merchantRepo.findOne({ where: { id: params.merchantId } });

    const imageUploadFolders = await this.imageUploadFolderRepo
      .createQueryBuilder('imageUploadFolder')
      .leftJoinAndSelect('imageUploadFolder.merchant', 'merchant')
      .leftJoinAndSelect('imageUploadFolder.imageUploads', 'imageUpload')
      .where('merchant.id = :id', { id: merchant.id })
      // .andWhere("imageUpload.onDeletePermanent = :onDeletePermanent", { onDeletePermanent: false })
      .orderBy('imageUploadFolder.id', 'ASC')
      .addOrderBy('imageUpload.id', 'DESC')
      .getMany();

    return imageUploadFolders.map((e) => ImageUploadFolderDto.fromEntity(e));
  }

  public async showAllWithDeleted(params): Promise<ImageUploadFolderDto[]> {
    const merchant = await this.merchantRepo.findOne({ where: { id: params.merchantId } });

    const imageUploadFolders = await this.imageUploadFolderRepo.find({
      relations: ['imageUploads'],
      where: {
        merchant: merchant
      },
      withDeleted: true
    });

    const result = await imageUploadFolders.map(async (folder) => {
      const images = await this.imageUploadRepo.find({
        withDeleted: true,
        where: {
          imageUploadFolder: folder,
          onDeletePermanent: false
        }
      });

      const result: ImageUploadFolderDto = {
        ...folder,
        imageUploads: images
      };

      return await result;
    });

    const response: ImageUploadFolderDto[] = await Promise.all(result).then(
      (values) => {
        return values;
      }
    );

    return await response.map((e) =>
      ImageUploadFolderDto.fromEntity(ImageUploadFolderDto.toEntity(e))
    );
  }

  public async update(
    id: number,
    dto: UpdateImageUploadFolderDto
  ): Promise<ImageUploadFolderDto> {
    const imageUploadFolder = await this.imageUploadFolderRepo.findOne({ where: { id } });
    const imageUploadFolderEntity = ImageUploadFolderDto.toEntity(dto);

    return this.imageUploadFolderRepo.save(
      Object.assign(imageUploadFolder, imageUploadFolderEntity)
    );
  }

  public async delete(id: number) {
    const imageUploadFolder = await this.imageUploadFolderRepo.findOne({
      where: { id },
      relations: ['imageUploads']
    });
    await imageUploadFolder.imageUploads.forEach(async (image) => {
      await this.imageUploadRepo.softDelete(image.id);
    });

    return await this.imageUploadFolderRepo.softDelete(id);
  }

  public async showAllFolder(): Promise<any[]> {
    const merchant: Merchant = await this.contextService.currentMerchant();
    const imageUploadFolders = await this.imageUploadFolderRepo
      .createQueryBuilder('imageUploadFolder')
      .leftJoin('imageUploadFolder.merchant', 'merchant')
      .leftJoin('imageUploadFolder.imageUploads', 'imageUploads')
      .loadRelationCountAndMap(
        'imageUploadFolder.imageUploadCount',
        'imageUploadFolder.imageUploads'
      )
      .where('merchant.id = :id', { id: merchant.id })
      .orderBy('imageUploadFolder.id', 'ASC')
      .getMany();

    return imageUploadFolders.map((e) => {
      return {
        ...ImageUploadFolderDto.fromEntity(e),
        // @ts-expect-error - imageUploadCount is added by loadRelationCountAndMap
        imageUploadCount: e?.imageUploadCount
      };
    });
  }

  public async showAllWithFolder(
    merchantId: number,
    options: IPaginationOptions,
    withPagination: string = 'true',
    folderIds?: Array<number>
  ): Promise<any> {
    const merchant: Merchant = await this.contextService.currentMerchant();

    let imageUploads = await this.imageUploadRepo
      .createQueryBuilder('imageUpload')
      .leftJoin('imageUpload.imageUploadFolder', 'imageUploadFolder')
      .leftJoin('imageUploadFolder.merchant', 'merchant')
      .where('merchant.id = :id', { id: merchant.id });

    if (folderIds?.length > 0) {
      imageUploads = await imageUploads.andWhere(
        'imageUploadFolder.id IN(:...folderIds)',
        { folderIds: folderIds }
      );
    }

    imageUploads = await imageUploads.orderBy('imageUpload.id', 'DESC');

    const imageUploadsResult: any =
      withPagination === 'true'
        ? await paginate<ImageUpload>(imageUploads, options)
        : await imageUploads.getMany();
    const data = imageUploadsResult.items || imageUploadsResult;
    const result = {
      data: data,
      meta: imageUploadsResult?.meta
    };

    return result;
  }
}
