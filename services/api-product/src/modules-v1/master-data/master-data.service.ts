import { MasterData, MasterDataStatus, MasterDataType } from '@/model/master-data.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MasterDataService {
  constructor(
    @InjectRepository(MasterData)
    private readonly masterDataRepo: Repository<MasterData>,
  ) {}

  async getMasterData(type: MasterDataType): Promise<MasterData[]> {
    return await this.masterDataRepo.find({
      where: {
        type,
        status: MasterDataStatus.ACTIVE,
      },
      order: {
        displayOrder: 'ASC',
      },
      select: [
        'id',
        'type',
        'code',
        'name',
        'name_th',
        'displayOrder',
      ],
      cache: {
        id: `master_data_${type}`,
        milliseconds: 300000, // 5 minutes
      },
    });
  }
}
