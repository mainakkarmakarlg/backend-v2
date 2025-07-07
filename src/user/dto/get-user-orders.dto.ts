import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class GetUserOrdersDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  orderId: string;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => {
    return new Date(value);
  })
  @IsDate()
  startDate: Date;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  endDate: Date;
}
