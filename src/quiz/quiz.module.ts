import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { DatabaseModule } from 'src/database/database.module';
import { VultrModule } from 'src/vultr/vultr.module';
import { PlatformCheckMiddleware } from 'src/common/middleware/platformcheck.middleware';
import { QuizPermissionCheckMiddleware } from 'src/common/middleware/quizpermissioncheck.middleware';
import { NotificationModule } from 'src/notification/notification.module';
import { EmailsModule } from 'src/email/email.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  exports: [QuizService],
  imports: [
    DatabaseModule,
    VultrModule,
    NotificationModule,
    EmailsModule,
    WhatsappModule,
    HttpModule,
  ],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PlatformCheckMiddleware, QuizPermissionCheckMiddleware)
      .forRoutes(QuizController);
  }
}
