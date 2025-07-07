import { Module } from '@nestjs/common';
import { LeadService } from './lead.service';
import { DatabaseModule } from 'src/database/database.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  exports: [LeadService],
  imports: [DatabaseModule, NotificationModule],
  providers: [LeadService],
})
export class LeadModule {}
