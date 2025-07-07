import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber } from 'class-validator';

export class EmployeeDeviceAllowChangeDto {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  deviceId: number;

  @Transform(
    ({ value }) => value === 'true' || value === 'True' || value === 'TRUE',
  )
  @IsBoolean()
  allowChange: boolean;
}
