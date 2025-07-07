import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  ValidationArguments,
} from 'class-validator';

export class RegisterAuthDto {
  @ApiProperty({ description: 'First name of the user', required: true })
  @IsNotEmpty()
  @IsString({
    message: ({ value }: ValidationArguments) =>
      value === undefined
        ? 'First name is required!'
        : 'First name must be of type string',
  })
  fname: string;

  @ApiProperty({ description: 'Last name of the user', required: true })
  @IsNotEmpty()
  @IsString({
    message: ({ value }: ValidationArguments) =>
      value === undefined
        ? 'Last name is required!'
        : 'Last name must be a string!',
  })
  lname: string;

  @ApiProperty({ description: 'Password of the user', required: true })
  @IsOptional()
  @IsString({
    message: ({ value }: ValidationArguments) =>
      value === undefined
        ? 'Password is required!'
        : 'Password is required must be a string!',
  })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ description: 'Email of the user', required: true })
  @IsNotEmpty()
  @IsEmail(
    {},
    {
      message: ({ value }: ValidationArguments) =>
        value === undefined ? 'Email is required!' : 'Email is must be Valid!',
    },
  )
  email: string;

  @ApiProperty({ description: 'Country code of the user', required: true })
  @IsNotEmpty()
  @IsString({
    message: ({ value }: ValidationArguments) =>
      value === undefined
        ? 'Country Code is required!'
        : 'Country Code is required must be a string!',
  })
  countryCode: string;

  @ApiProperty({ description: 'Phone number of the user', required: true })
  @IsNotEmpty()
  @IsString({
    message: ({ value }: ValidationArguments) =>
      value === undefined
        ? 'Phone number is required!'
        : 'Phone number is required must be a string!',
  })
  phone: string;

  @ApiProperty({
    description: 'WhatsApp country code of the user',
    required: false,
  })
  @ValidateIf((o) => o.whatsappnumber != undefined)
  @IsString({ message: 'Valid WhatsApp country code is required' })
  whatsappCountryCode?: string;

  @ApiProperty({ description: 'WhatsApp', required: false })
  @ValidateIf((o) => o.whatsappcountrycode != undefined)
  @IsString({ message: 'Valid WhatsApp number is required' })
  whatsappNumber?: string;

  @ApiProperty({
    description: 'Verification mode',
    required: true,
    enum: ['phone', 'email', 'whatsapp'],
  })
  @IsEnum(['phone', 'email', 'whatsapp'], {
    message: 'Please Enter a valid verification mode',
  })
  verificationMode: string;
}
