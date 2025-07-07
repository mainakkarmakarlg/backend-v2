import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { PracticeController } from './practice.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PlatformCheckMiddleware } from 'src/common/middleware/platformcheck.middleware';
import { PracticePermissionCheckMiddleware } from 'src/common/middleware/practicepermissioncheck.middleware';

@Module({
  imports: [DatabaseModule],
  controllers: [PracticeController],
  providers: [PracticeService],
  exports: [PracticeService],
})
export class PracticeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PlatformCheckMiddleware, PracticePermissionCheckMiddleware)
      .forRoutes(PracticeController);
  }
}
