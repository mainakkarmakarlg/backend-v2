import { Module } from '@nestjs/common';
import { MainGatewayGateway } from './main-gateway.gateway';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [MainGatewayGateway],
})
export class MainGatewayModule {}
