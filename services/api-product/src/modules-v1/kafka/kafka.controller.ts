import { Controller } from '@nestjs/common';
import { KafkaService } from './kafka.service';

export interface KafkaMessage {
  address_id: string;
  cis_number: string;
  create_at: string;
  create_by: string;
  create_by_platform: string;
  kyc_status?: string;
}
@Controller()
export class KafkaController {
  constructor(private readonly addressKafkaService: KafkaService) {}

}
