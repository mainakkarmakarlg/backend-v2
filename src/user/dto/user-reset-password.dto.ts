import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UserResetPasswordDto {
  @ApiProperty({ description: 'Old password of the user', required: true })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    description: 'New password must be at least 6 characters long',
    required: true,
  })
  @IsString()
  @MinLength(6, { message: 'password must be more than 6 characters' })
  newPassword: string;
}
