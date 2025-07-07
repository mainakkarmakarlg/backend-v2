import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token to reset Password', required: true })
  @IsString({ message: 'Token is required' })
  token: string;

  @ApiProperty({
    description: 'New Password must be at least 6 characters long',
    required: true,
  })
  @IsString({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    description: 'DeviceId Must Be Provided for platforms that require it',
    required: true,
  })
  @IsOptional()
  @IsString({ message: 'DeviceId is required' })
  deviceId: string;
}
