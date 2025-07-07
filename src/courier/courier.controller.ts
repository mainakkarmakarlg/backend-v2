import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GetCourierTrackingInfoDto } from './dto/get-courier-tracking-info.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CustomRequest } from 'src/common/interface/custom-request.interface';
import { CourierService } from './courier.service';

@Controller('courier')
export class CourierController {
  constructor(private readonly courierService: CourierService) {}
  @UseGuards(AuthGuard)
  @Get()
  getHello(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    getCourierTrackingInfo: GetCourierTrackingInfoDto,
  ): string {
    return 'Hello from Courier';
  }

  @UseGuards(AuthGuard)
  @Get('tracking')
  getCourierTrackingInfo(
    @Request() req: CustomRequest,
    @Query('paymentId') paymentId: string,
  ) {
    return this.courierService.getTrackingUrl(paymentId, req.userid);
  }

  @Get('checkmanifest')
  checkManifest() {
    return this.courierService.checkManifest();
  }

  @Get('checksocket')
  checsocket() {
    return this.courierService.checkSocket();
  }
}
