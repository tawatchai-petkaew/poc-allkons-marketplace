import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DbdService } from './dbd.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 60000, // 1 minute timeout
      maxRedirects: 5,
    }),
  ],
  providers: [DbdService],
  exports: [DbdService],
})
export class DbdModule {}
