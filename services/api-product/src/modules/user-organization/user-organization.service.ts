import { UserOrganization } from '@/model/user-organization.entity';
import {
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class UserOrganizationService {
  constructor(
    @InjectRepository(UserOrganization)
    private readonly userOrganizationRepo: Repository<UserOrganization>,
  ) {}

  public async requestCurrentUserOrganization(
    dto: any,
    organizeId: number,
  ): Promise<UserOrganization> {
    const userOrg = await this.userOrganizationRepo.findOne({
      where: { userId: dto.userId, organizeId },
      relations: ['role'],
    });

    if (!userOrg) {
      throw new Error("Can't find user organization");
    }

    return userOrg;
  }
}
