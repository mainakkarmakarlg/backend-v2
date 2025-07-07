import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class ChangeEmployeeDeviceNameDTO {
  @IsString()
  @ApiProperty()
  deviceName: string;

  @Transform(({ value }) => parseInt(value))
  @ApiProperty()
  @IsNumber()
  deviceId: number;
}
