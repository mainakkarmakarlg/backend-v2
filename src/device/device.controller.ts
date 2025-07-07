import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { DeviceService } from './device.service';
import { CustomRequest } from 'src/common/interface/custom-request.interface';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @HttpCode(HttpStatus.OK)
  @Post()
  async registerDevice(
    @Request() req: CustomRequest,
    @Body() registerDeviceDto: RegisterDeviceDto,
  ) {
    return this.deviceService.registerUserDevice(
      req.platformid,
      registerDeviceDto,
    );
  }
}
