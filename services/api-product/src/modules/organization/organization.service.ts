import {
  Organization,
} from '@/model/organization.entity';
import {
  Injectable,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';


@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}


  async findOrgById(id: number): Promise<Organization> {
    // Check cache first
    const cacheKey = `organization:${id}`;
    const cachedOrganization = await this.cacheManager.get<Organization>(
      cacheKey,
    );

    if (cachedOrganization) {
      return cachedOrganization;
    }

    // Cache miss - query database
    const organization = await this.organizationRepo.findOne({
      where: {
        id,
      },
    });
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Cache for 5 minutes (300 seconds)
    await this.cacheManager.set(cacheKey, organization, 300);

    return organization;
  }

  
}
