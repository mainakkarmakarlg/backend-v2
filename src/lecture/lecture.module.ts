import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LectureService } from './lecture.service';
import { LectureController } from './lecture.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PlatformCheckMiddleware } from 'src/common/middleware/platformcheck.middleware';

@Module({
  imports: [DatabaseModule],
  controllers: [LectureController],
  providers: [LectureService],
})
export class LectureModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PlatformCheckMiddleware).forRoutes(LectureController);
  }
}
