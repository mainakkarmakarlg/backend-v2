import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PlatformModule } from './platform/platform.module';
import { CacheModule } from '@nestjs/cache-manager';
import { EmployeeModule } from './employee/employee.module';
import { VultrModule } from './vultr/vultr.module';
import { RazorpayModule } from 'nestjs-razorpay';
import { EmailsModule } from './email/email.module';
import { NotificationModule } from './notification/notification.module';
import { MainGatewayModule } from './main-gateway/main-gateway.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { LectureModule } from './lecture/lecture.module';
import { PaymentModule } from './payment/payment.module';
import { CourierModule } from './courier/courier.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import KeyvRedis from '@keyv/redis';
import { FormulaModule } from './formula/formula.module';
import { PracticeModule } from './practice/practice.module';
import { ExternalModule } from './external/external.module';
import { DoubtforumModule } from './doubtforum/doubtforum.module';
import { DeviceModule } from './device/device.module';
import { LeadModule } from './lead/lead.module';
import { QuizModule } from './quiz/quiz.module';

@Module({
  imports: [
    DatabaseModule,
    ScheduleModule.forRoot(),
    EmployeeModule,
    UserModule,
    AuthModule,
    PlatformModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          stores: [new KeyvRedis(process.env.redis)],
        };
      },
    }),
    VultrModule,
    RazorpayModule.forRoot({
      key_id: process.env.razorpay_id,
      key_secret: process.env.razorpay_secret,
    }) as DynamicModule,
    EmailsModule,
    NotificationModule,
    MainGatewayModule,
    WhatsappModule,
    LectureModule,
    PaymentModule,
    CourierModule,
    TasksModule,
    FormulaModule,
    PracticeModule,
    ExternalModule,
    DoubtforumModule,
    DeviceModule,
    LeadModule,
    QuizModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
