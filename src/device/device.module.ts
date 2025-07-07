import { MiddlewareConsumer, Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { DatabaseModule } from 'src/database/database.module';
import { PlatformCheckMiddleware } from 'src/common/middleware/platformcheck.middleware';
import { NotificationModule } from '../notification/notification.module';

@Module({
  exports: [DeviceService],
  imports: [DatabaseModule, NotificationModule],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PlatformCheckMiddleware).forRoutes(DeviceController);
  }
}
