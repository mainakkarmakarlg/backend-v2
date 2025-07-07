import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeGateway } from './employee.gateway';
import { DatabaseModule } from 'src/database/database.module';
import { NotificationModule } from 'src/notification/notification.module';
import { DeviceModule } from '../device/device.module';
import { PaymentModule } from 'src/payment/payment.module';
import { PlatformModule } from 'src/platform/platform.module';
import { LeadModule } from 'src/lead/lead.module';

@Module({
  imports: [
    DatabaseModule,
    NotificationModule,
    DeviceModule,
    PaymentModule,
    PlatformModule,
    LeadModule,
  ],
  providers: [EmployeeGateway, EmployeeService],
})
export class EmployeeModule {}
