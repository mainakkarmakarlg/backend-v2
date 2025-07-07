import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';

export class CartQueryDto {
  @ApiProperty({ description: 'Course ID', required: false })
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional({})
  @IsNumber()
  courseId: number;

  @ApiProperty({ description: 'Product ID', required: false })
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  @IsNumber()
  productId: number;

  @ValidateIf((o) => o.courseId != undefined && o.productId != undefined)
  @IsString({
    message:
      'Cart cannot be created for both Course and Product at the same time.',
  })
  invalidOption: number;
}
