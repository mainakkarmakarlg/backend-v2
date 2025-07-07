import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class BillingShippingPostDto {
  @ApiProperty({ description: 'Billing ID', required: false })
  @IsOptional()
  @IsNumber()
  billingId: number;
  @ApiProperty({ description: 'Shipping ID', required: false })
  @IsOptional()
  @IsNumber()
  shippingId: number;
  @ApiProperty({ description: 'Billing first name', required: false })
  @IsOptional()
  @IsString()
  billingFname: string;
  @ApiProperty({ description: 'Billing last name', required: false })
  @IsOptional()
  @IsString()
  billingLname: string;
  @ApiProperty({ description: 'Billing email', required: false })
  @IsOptional()
  @IsString()
  billingEmail: string;
  @ApiProperty({ description: 'Billing country phone', required: false })
  @IsOptional()
  @IsString()
  billingCountryCode: string;
  @ApiProperty({ description: 'Billing phone', required: false })
  @IsOptional()
  @IsString()
  billingPhone: string;
  @ApiProperty({ description: 'Billing address', required: false })
  @ValidateIf((o) => o.billingId === undefined)
  @IsString()
  billingAddress: string;
  @ApiProperty({ description: 'Billing city', required: false })
  @ValidateIf((o) => o.billingId === undefined)
  @IsString()
  billingCity: string;
  @ApiProperty({ description: 'Billing state', required: false })
  @ValidateIf((o) => o.billingId === undefined)
  @IsString()
  billingState: string;
  @ApiProperty({ description: 'Billing country', required: false })
  @ValidateIf((o) => o.billingId === undefined)
  @IsString()
  billingCountry: string;
  @ApiProperty({ description: 'Billing pincode', required: false })
  @ValidateIf((o) => o.billingId === undefined)
  @IsString()
  billingPincode: string;
  @ApiProperty({ description: 'Billing company name', required: false })
  @IsOptional()
  @IsString()
  billingCompanyName: string;
  @ApiProperty({ description: 'Billing company GST', required: false })
  @ValidateIf((o) => o.billingCompanyName !== undefined)
  @IsString()
  billingCompanyGst: string;
  @ApiProperty({ description: 'Billing company address', required: false })
  @IsOptional()
  @IsString()
  billingCompanyAddress: string;
  @ApiProperty({ description: 'Billing company city', required: false })
  @IsOptional()
  @IsString()
  shippingFname: string;
  @ApiProperty({ description: 'Shipping last name', required: false })
  @IsOptional()
  @IsString()
  shippingLname: string;
  @ApiProperty({ description: 'Shipping email', required: false })
  @IsOptional()
  @IsString()
  shippingEmail: string;
  @ApiProperty({ description: 'Shipping Phone', required: false })
  @IsOptional()
  @IsString()
  shippingPhone: string;
  @ApiProperty({ description: 'Shipping Country Code', required: false })
  @IsOptional()
  @IsString()
  shippingCountryCode: string;
  @ApiProperty({ description: 'Shipping Address', required: false })
  @IsOptional()
  @IsString()
  shippingAddress: string;
  @ApiProperty({ description: 'Shipping City', required: false })
  @ValidateIf((o) => o.shippingAddress !== undefined)
  @IsString()
  shippingCity: string;
  @ApiProperty({ description: 'Shipping State', required: false })
  @ValidateIf((o) => o.shippingAddress !== undefined)
  @IsString()
  shippingState: string;
  @ApiProperty({ description: 'Shipping Country', required: false })
  @ValidateIf((o) => o.shippingAddress !== undefined)
  @IsString()
  shippingCountry: string;
  @ApiProperty({ description: 'Shipping Pincode', required: false })
  @ValidateIf((o) => o.shippingAddress !== undefined)
  @IsString()
  shippingPincode: string;
  @ApiProperty({ description: 'Another User Email', required: false })
  @IsOptional()
  @IsString()
  userEmail: string;
  @ApiProperty({ description: 'Another User Country Code', required: false })
  @ValidateIf((o) => o.userEmail !== undefined)
  @IsString()
  userCountryCode: string;
  @ApiProperty({ description: 'Another User Phone', required: false })
  @ValidateIf((o) => o.userEmail !== undefined)
  @IsString()
  userPhone: string;
  @ApiProperty({ description: 'Another User First Name', required: false })
  @ValidateIf((o) => o.userEmail !== undefined)
  @IsString()
  userFname: string;
  @ApiProperty({ description: 'Another User Last Name', required: false })
  @ValidateIf((o) => o.userEmail !== undefined)
  @IsString()
  userLname: string;
  @ApiProperty({
    description: 'Payment Mode',
    required: true,
    enum: ['Online', 'Manual'],
  })
  @IsEnum(['Online', 'Manual'])
  @IsString()
  paymentMode: string;
}
