import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, ValidateIf } from 'class-validator';

export class DeliveryChargesDto {
  @ApiProperty({ description: 'Continent ID', required: false })
  @ValidateIf(
    (o) =>
      o.countryId === undefined &&
      o.stateId === undefined &&
      o.cityId === undefined,
  )
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  continentId: number;

  @ApiProperty({ description: 'Country ID', required: false })
  @ValidateIf(
    (o) =>
      o.continentId === undefined &&
      o.stateId === undefined &&
      o.cityId === undefined,
  )
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  countryId: number;

  @ApiProperty({ description: 'State ID', required: false })
  @ValidateIf(
    (o) =>
      o.continentId === undefined &&
      o.countryId === undefined &&
      o.cityId === undefined,
  )
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  stateId: number;

  @ApiProperty({ description: 'City ID', required: false })
  @ValidateIf(
    (o) =>
      o.continentId === undefined &&
      o.countryId === undefined &&
      o.stateId === undefined,
  )
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  cityId: number;

  @ApiProperty({ description: 'Product ID', required: true })
  @ValidateIf((o) => o.courseId === undefined)
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'Course ID', required: true })
  @ValidateIf((o) => o.productId === undefined)
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  courseId: number;
}
