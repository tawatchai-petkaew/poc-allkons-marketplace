import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateBuyerProjectDto } from './dto/create-buyer-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '@/model/project.entity';
import { UserCustomerAddressEntity } from '@/model/user-customer-address.entity';

@Injectable()
export class BuyerProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async create(createBuyerProjectDto: CreateBuyerProjectDto) {
    try {
      const project = this.projectRepo.create(createBuyerProjectDto);
      return await this.projectRepo.save(project);
    } catch (error) {
      throw new InternalServerErrorException(
        `Unable to create project. ${error.message}`,
      );
    }
  }

  async findAll(userId: number, name?: string): Promise<Project[]> {
    try {
      const query = this.projectRepo
        .createQueryBuilder('project')
        .select(['project.id', 'project.name'])
        .where('project.userId = :userId', { userId })
        .andWhere('project.status = :status', {
          status: ProjectStatus.ACTIVE,
        })
        .limit(10)
        .orderBy('project.createdAt', 'DESC');

      if (name?.trim()) {
        query.andWhere('project.name LIKE :name', { name: `%${name.trim()}%` });
      }

      return await query.getMany();
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch projects: ${error.message}`,
      );
    }
  }

  async remove(userId: number, id: number): Promise<void> {
    const project = await this.projectRepo
      .createQueryBuilder('project')
      .where('project.id = :id', { id })
      .andWhere('project.status != :status', {
        status: ProjectStatus.DELETED,
      })
      .getOne();

    if (!project) {
      throw new HttpException('NOT_FOUND_PROJECT', HttpStatus.NOT_FOUND);
    }

    if (project.userId !== userId) {
      throw new HttpException(
        'UNAUTHORIZED_USER_NOT_ACCESS',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const queryRunner = this.projectRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Remove projectId from related user addresses
      await queryRunner.manager
        .createQueryBuilder()
        .update(UserCustomerAddressEntity)
        .set({ projectId: null })
        .where('projectId = :projectId', { projectId: id })
        .execute();

      // Hard delete the project
      await queryRunner.manager.delete(Project, { id });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Failed to delete project: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async existsByName(userId: number, name: string): Promise<boolean> {
    const project = await this.projectRepo.findOne({
      where: { name, userId, status: ProjectStatus.ACTIVE },
    });
    return !!project;
  }
}
