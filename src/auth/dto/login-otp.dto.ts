import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  ValidateIf,
  ValidationArguments,
} from 'class-validator';

export class LoginOtpDto {
  @ApiProperty({ description: 'Email of the user', required: true })
  @ValidateIf((o) => !o.phone)
  @IsEmail(
    {},
    {
      message: ({ value }: ValidationArguments) =>
        value === undefined
          ? 'Email is required!'
          : 'Email is must be a Valid!',
    },
  )
  email: string;

  @ApiProperty({ description: 'Phone number of the user', required: true })
  @ValidateIf((o) => !o.email, {
    message: 'Email or phone is required',
  })
  @IsString({
    message: ({ value }: ValidationArguments) =>
      value === undefined
        ? 'Phone number is required!'
        : 'Phone number is required must be a string!',
  })
  phone: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  deviceId: string;
}
