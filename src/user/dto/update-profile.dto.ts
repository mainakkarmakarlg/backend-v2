import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: 'DOB in DD/MM/YYYY format', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dob: Date;

  @ApiProperty({ description: 'Whatsapp number', required: false })
  @IsOptional()
  @IsString()
  whatsappNumber: string;

  @ApiProperty({ description: 'Whatsapp country code', required: false })
  @IsOptional()
  @IsString()
  whatsappCountryCode: string;

  @ApiProperty({ description: 'Student occupation', required: false })
  @IsOptional()
  @IsString()
  occupation: string;

  @ApiProperty({ description: 'Gender', required: false })
  @IsOptional()
  @IsString()
  gender: string;

  @ApiProperty({ description: 'Bio', required: false })
  @IsOptional()
  @IsString()
  bio: string;

  @ApiProperty({
    description: 'JSON where each object has two key platform and link',
    required: false,
  })
  @IsOptional()
  socialLinks: Object;
}
