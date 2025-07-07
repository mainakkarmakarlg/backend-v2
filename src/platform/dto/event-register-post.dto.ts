import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class EventRegisterPostDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  fname: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lname: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  countryCode: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(['100%', 'most probably', 'not sure'])
  attending: string;

  @ApiProperty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  eventId: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  discussionPoint: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  importantQuestion: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  locationId: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  occupation: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  company: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  designation: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  college: string;
}
