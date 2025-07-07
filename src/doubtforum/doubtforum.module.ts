import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DoubtforumController } from './doubtforum.controller';
import { DoubtforumService } from './doubtforum.service';
import { DatabaseModule } from 'src/database/database.module';
import { PlatformCheckMiddleware } from 'src/common/middleware/platformcheck.middleware';
import { DoubtForumPermissionCheckMiddleware } from 'src/common/middleware/doubtforumpermissioncheck.middleware';
import { VultrModule } from 'src/vultr/vultr.module';

@Module({
  imports: [DatabaseModule, VultrModule],
  controllers: [DoubtforumController],
  providers: [DoubtforumService],
})
export class DoubtforumModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PlatformCheckMiddleware, DoubtForumPermissionCheckMiddleware)
      .forRoutes(DoubtforumController);
  }
}
