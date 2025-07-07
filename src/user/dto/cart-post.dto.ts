import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CartPostDto {
  @ApiProperty({ description: 'Cart ID', required: true })
  @IsNumber()
  cartId: number;

  @ApiProperty({ description: 'Course ID', required: false })
  @ValidateIf((value) => value.productId === undefined)
  @IsNumber()
  courseId: number;

  @ApiProperty({ description: 'Product ID', required: false })
  @ValidateIf((value) => value.courseId === undefined)
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'Extra Option ID', required: false })
  @IsOptional()
  @IsNumber()
  extraOptionId: number;

  @ApiProperty({ description: 'Quantity', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Is Cart', required: false })
  @IsOptional()
  @IsBoolean()
  isCart: boolean;

  @ValidateIf(
    (value) => value.productId !== undefined && value.courseId !== undefined,
  )
  @IsString({
    message: 'Cart cannot be created for both product and course',
  })
  validatorMessage: string;
}
