import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class ChangeDeviceTypeDto {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  deviceId: number;

  @IsEnum(['Office', 'Home'])
  type: string;
}
