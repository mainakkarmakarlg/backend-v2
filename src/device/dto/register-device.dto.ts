import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterDeviceDto {
  @ApiProperty()
  @IsString()
  deviceId: string;

  @ApiProperty()
  @IsString()
  deviceModel: string;

  @ApiProperty()
  @IsString()
  deviceOS: string;
}
