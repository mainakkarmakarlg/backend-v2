import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { VultrService } from './vultr.service';
import { VultrController } from './vultr.controller';
import { PlatformCheckMiddleware } from 'src/common/middleware/platformcheck.middleware';
import { PracticeController } from 'src/practice/practice.controller';
import { PracticePermissionCheckMiddleware } from 'src/common/middleware/practicepermissioncheck.middleware';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [VultrService],
  exports: [VultrService],
  controllers: [VultrController],
})
export class VultrModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PlatformCheckMiddleware, PracticePermissionCheckMiddleware)
      .forRoutes(PracticeController);
  }
}
