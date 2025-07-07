import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { PlatformController } from './platform.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PlatformCheckMiddleware } from '../common/middleware/platformcheck.middleware';
import { HttpModule } from '@nestjs/axios';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { NotificationModule } from 'src/notification/notification.module';
import { LeadModule } from 'src/lead/lead.module';
import { EmailsModule } from 'src/email/email.module';

@Module({
  exports: [PlatformService],
  imports: [
    DatabaseModule,
    HttpModule,
    WhatsappModule,
    NotificationModule,
    LeadModule,
    EmailsModule,
  ],
  controllers: [PlatformController],
  providers: [PlatformService, PlatformCheckMiddleware],
})
export class PlatformModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PlatformCheckMiddleware).forRoutes(PlatformController);
  }
}
