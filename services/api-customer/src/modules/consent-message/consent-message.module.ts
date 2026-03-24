import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsentMessage } from '../../model/consent-message.entity';
import { ConsentMessageService } from './consent-message.service';
import { ConsentMessageController } from './consent-message.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConsentMessage]),
  ],
  controllers: [ConsentMessageController],
  providers: [ConsentMessageService],
  exports: [ConsentMessageService],
})
export class ConsentMessageModule {}
