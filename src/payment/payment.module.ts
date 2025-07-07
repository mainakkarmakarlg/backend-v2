import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { DatabaseModule } from 'src/database/database.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { EmailsModule } from 'src/email/email.module';
import { CourierModule } from 'src/courier/courier.module';
import { HttpModule } from '@nestjs/axios';
import { VultrModule } from 'src/vultr/vultr.module';
import { LeadModule } from 'src/lead/lead.module';

@Module({
  exports: [PaymentService],
  imports: [
    DatabaseModule,
    HttpModule,
    EmailsModule,
    WhatsappModule,
    CourierModule,
    VultrModule,
    LeadModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
