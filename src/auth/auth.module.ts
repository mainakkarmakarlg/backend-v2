import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PlatformCheckMiddleware } from 'src/common/middleware/platformcheck.middleware';
import { JwtModule } from '@nestjs/jwt';
import { EmailsModule } from 'src/email/email.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { HttpModule } from '@nestjs/axios';
import { LeadModule } from 'src/lead/lead.module';
import { VultrController } from 'src/vultr/vultr.controller';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: process.env.jwtSecret,
      signOptions: { expiresIn: '3d' },
    }),
    EmailsModule,
    WhatsappModule,
    HttpModule,
    LeadModule,
  ],
  exports: [AuthService],
  controllers: [AuthController],
  providers: [AuthService, PlatformCheckMiddleware],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PlatformCheckMiddleware)
      .forRoutes(AuthController, VultrController);
  }
}
