import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'Order ID', required: true })
  @IsString()
  orderId: string;
  @ApiProperty({ description: 'Transaction ID', required: true })
  @ValidateIf((o) => o.method !== undefined)
  @IsString()
  transactionId: string;
  @ApiProperty({
    description: 'Payment method',
    required: true,
    enum: ['UPI', 'NTFS'],
  })
  @IsOptional()
  @IsEnum(['UPI', 'NTFS'])
  method: string;
}
