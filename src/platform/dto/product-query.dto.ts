import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  productId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productSearchString: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  key: string;
}
