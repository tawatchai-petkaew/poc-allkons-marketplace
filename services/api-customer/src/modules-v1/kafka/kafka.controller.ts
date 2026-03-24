import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
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

  @MessagePattern('cis360.address.creation')
  async handleAddressCreate(@Payload() message: KafkaMessage) {
    console.log('Received address creation message:', message);
    try {
      await this.addressKafkaService.processAddressCreation(message);
    } catch (error) {
      console.error('Error processing address creation:', error);
    }
  }

  @MessagePattern('cis360.address.update')
  async handleAddressUpdate(@Payload() message: KafkaMessage) {
    console.log('Received address update message:', message);
    try {
      await this.addressKafkaService.processAddressUpdate(message);
    } catch (error) {
      console.error('Error processing address update:', error);
    }
  }

  @MessagePattern('cis360.address.deletion')
  async handleAddressDelete(@Payload() message: KafkaMessage) {
    console.log('Received address deletion message:', message);
    try {
      await this.addressKafkaService.processAddressDelete(message);
    } catch (error) {
      console.error('Error processing address update:', error);
    }
  }

  @MessagePattern('cis360.kyc.status.change')
  async handleKycStatusChange(@Payload() message: KafkaMessage) {
    console.log('Received KYC status change message:', message);
    try {
      await this.addressKafkaService.processKycStatus(message);
    } catch (error) {
      console.error('Error processing address update:', error);
    }
  }

}
