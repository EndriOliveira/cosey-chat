import { Module } from '@nestjs/common';
import { SendGridService } from './sendGrid.service';

@Module({
  providers: [SendGridService],
})
export class SendGridModule {}
