import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, ValidationArguments } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Token to refresh', required: true })
  @IsString({
    message: ({ value }: ValidationArguments) =>
      value === undefined ? 'Token is required!' : 'Token must be a string!',
  })
  token: string;

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
