import { Store } from '@/model/store.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
  ) {}

  async findAllStoreMemberCountPage(
    organizeId: number,
    page: number,
    limit: number,
  ) {
    const store = await this.storeRepo.manager.query(
      `select m."id" as "merchantId", m."uuid" as "merchantUuid",s."storeBranchName", m."merchantName", m."merchantBranchType", m."status", count(u."id") as "userCount" from store s inner join merchant m on s.id = m."storeId" left join user_merchants_merchant umm on m."id" = umm."merchantId" left join "user" u on umm."userId" = u."id" where s."organizeId" = ${organizeId} group by s."id", m."id" order by s."createdAt" desc, m."createdAt" desc offset ${
        (page - 1) * limit
      } limit ${limit}`,
    );
    const total = await this.storeRepo.manager.query(
      `select count(m."id") as total from store s inner join merchant m on s.id = m."storeId" where s."organizeId" = ${organizeId}`,
    );
    return { store, total };
  }
}
