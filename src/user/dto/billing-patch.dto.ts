import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class BillingPatchDto {
  @ApiProperty()
  @IsNumber()
  billingId: number;
  @ApiProperty({ description: 'First name of the user', required: false })
  @IsOptional()
  @IsString()
  fname: string;
  @ApiProperty({ description: 'Last name of the user', required: false })
  @IsOptional()
  @IsString()
  lname: string;
  @ApiProperty({ description: 'Email of the user', required: false })
  @IsOptional()
  @IsEmail()
  email: string;
  @ApiProperty({ description: 'Country code of the user', required: false })
  @IsOptional()
  @IsString()
  countryCode: string;
  @ApiProperty({ description: 'Phone number of the user', required: false })
  @IsOptional()
  @IsString()
  phone: string;
  @ApiProperty({ description: 'Address of the user', required: false })
  @IsOptional()
  @IsString()
  address: string;
  @ApiProperty({ description: 'City of the user', required: false })
  @IsOptional()
  @IsString()
  city: string;
  @ApiProperty({ description: 'State of the user', required: false })
  @IsOptional()
  @IsString()
  state: string;
  @ApiProperty({ description: 'Country of the user', required: false })
  @IsOptional()
  @IsString()
  country: string;
  @ApiProperty({ description: 'Pincode of the user', required: false })
  @IsOptional()
  @IsString()
  pincode: string;
}
