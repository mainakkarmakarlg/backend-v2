import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber } from 'class-validator';

export class EmployeeToDeviceAllowDto {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  deviceId: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  employeeId: number;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  allow: boolean;
}
