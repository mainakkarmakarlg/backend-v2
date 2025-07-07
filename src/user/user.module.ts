import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PlatformCheckMiddleware } from 'src/common/middleware/platformcheck.middleware';
import { HttpModule } from '@nestjs/axios';
import { EmailsModule } from 'src/email/email.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { VultrModule } from 'src/vultr/vultr.module';
import { CourierModule } from 'src/courier/courier.module';
import { UserGateway } from './user.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { PracticeModule } from 'src/practice/practice.module';
import { PaymentModule } from 'src/payment/payment.module';
import { LeadModule } from 'src/lead/lead.module';
import { QuizModule } from 'src/quiz/quiz.module';

@Module({
  imports: [
    DatabaseModule,
    HttpModule,
    EmailsModule,
    WhatsappModule,
    VultrModule,
    CourierModule,
    AuthModule,
    PracticeModule,
    PaymentModule,
    LeadModule,
    QuizModule,
  ],
  controllers: [UserController],
  providers: [UserService, PlatformCheckMiddleware, UserGateway],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PlatformCheckMiddleware).forRoutes(UserController);
  }
}
