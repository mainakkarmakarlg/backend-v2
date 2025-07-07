import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class UserContactPostDto {
  @ApiProperty({ description: 'First Name', required: true })
  @IsString()
  fname: string;

  @ApiProperty({ description: 'Last Name', required: true })
  @IsString()
  lname: string;

  @ApiProperty({ description: 'Appointment Date', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    return new Date(value);
  })
  @IsDate()
  appointmentDate: Date;

  @ApiProperty({ description: 'Appointment Time', required: false })
  @ValidateIf((o) => o.appointmentDate !== undefined)
  @IsNumber()
  appointmentTime: number;

  @ApiProperty({ description: 'Message', required: false })
  @IsOptional()
  @IsString()
  message: string;

  @ApiProperty({ description: 'Selected Text', required: false })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  selectedText: string[];

  @ApiProperty({ description: 'Email', required: false })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Phone', required: true })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty({ description: 'Country Code', required: true })
  @IsString()
  countryCode: string;

  @ApiProperty({ description: 'UTMs', required: false })
  @IsOptional()
  @IsArray()
  utms: object[];

  @ApiProperty({ description: 'Slug', required: false })
  @IsOptional()
  @IsString()
  slug: string;
}
