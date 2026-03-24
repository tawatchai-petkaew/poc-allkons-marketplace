import { EventLog } from '@/model/event-log.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(EventLog)
    private readonly eventLogRepo: Repository<EventLog>,
  ) {}

  async writeLog(
    url?: string | null,
    method?: string | null,
    data?: string | null,
    response?: string | null,
    organizeId?: number | null,
    userId?: number | null,
  ) {
    try {
      await this.eventLogRepo.save({
        url,
        function: method,
        data,
        response,
        organizeId,
        userId,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async readLog(
    url?: string | null,
    method?: string | null,
    organizeId?: number | null,
    userId?: number | null,
  ) {
    try {
      const where: any = { url, method };
      if (organizeId) {
        where.organizeId = organizeId;
      } else {
        where.userId = userId;
      }
      return await this.eventLogRepo.find({ where });
    } catch (error) {
      console.log(error);
    }
  }

  async readLogByOrganizeId(organizeId: number) {
    try {
      return await this.eventLogRepo.findOne({
        where: { organizeId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.log(error);
    }
  }
}
