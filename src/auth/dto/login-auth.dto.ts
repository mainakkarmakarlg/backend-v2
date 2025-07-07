import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  ValidationArguments,
} from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ description: 'Email of the user', required: true })
  @ValidateIf((o) => !o.phone)
  @IsEmail(
    {},
    {
      message: ({ value }: ValidationArguments) =>
        value === undefined ? 'Email is required!' : 'Email must be Valid!',
    },
  )
  email: string;

  @ApiProperty({ description: 'Password of the user', required: true })
  @ValidateIf((o) => !o.otp, {
    message: 'Password or otp is required!',
  })
  @IsString({
    message: ({ value }: ValidationArguments) =>
      value === undefined
        ? 'Password must not be empty!'
        : 'Password must be string!',
  })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ description: 'Phone number of the user', required: true })
  @ValidateIf((o) => !o.email, {
    message: 'Email or phone is required',
  })
  @IsString({
    message: ({ value }: ValidationArguments) =>
      value === undefined
        ? 'Phone must not be empty!'
        : 'phone must be string!',
  })
  phone: string;

  @ApiProperty({ description: 'Otp of the user', required: true })
  @ValidateIf((o) => !o.password)
  @IsNumber(
    {},
    {
      message: ({ value }: ValidationArguments) =>
        value === undefined
          ? 'Otp must not be empty!'
          : 'Otp must be a numeric value!',
    },
  )
  otp: number;

  @ApiProperty({ description: 'Device id of the user', required: true })
  @IsOptional()
  @IsString()
  deviceId: string;
}
