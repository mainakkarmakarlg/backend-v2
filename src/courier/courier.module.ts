import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CourierService } from './courier.service';
import { DatabaseModule } from 'src/database/database.module';
import { HttpModule } from '@nestjs/axios';
import { CourierController } from './courier.controller';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { NotificationModule } from 'src/notification/notification.module';
import { PlatformCheckMiddleware } from 'src/common/middleware/platformcheck.middleware';
import { UserController } from 'src/user/user.controller';

@Module({
  imports: [DatabaseModule, HttpModule, WhatsappModule, NotificationModule],
  providers: [CourierService],
  exports: [CourierService],
  controllers: [CourierController],
})
export class CourierModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PlatformCheckMiddleware).forRoutes(UserController);
  }
}
