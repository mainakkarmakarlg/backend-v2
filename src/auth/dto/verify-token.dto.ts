import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidationArguments,
} from 'class-validator';

export class VerifyTokenDto {
  @ApiProperty({ description: 'Token to verify', required: true })
  @IsString({
    message: ({ value }: ValidationArguments) =>
      value === undefined ? 'Token is required!' : 'Token must be a string!',
  })
  token: string;

  @ApiProperty({ description: 'OTP to verify', required: true })
  @IsNumber({}, { message: 'OTP must be number' })
  @IsOptional()
  otp: number;

  @ApiProperty({ description: 'DeviceId For Login', required: true })
  @IsOptional()
  @IsString({
    message: ({ value }: ValidationArguments) =>
      value === undefined
        ? 'DeviceId is required!'
        : 'DeviceId must be a string!',
  })
  deviceId: string;
}
