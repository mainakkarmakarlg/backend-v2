import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class LeadStatusDto {
  @IsOptional()
  @ApiProperty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  interactionId: number;

  @IsOptional()
  @ApiProperty()
  @IsString()
  leadStatus: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  leadRemarks: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  lname: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  email: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  phone: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  countryCode: string;
}
