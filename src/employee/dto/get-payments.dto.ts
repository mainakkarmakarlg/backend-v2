import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetPaymentsDto {
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  startDate: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsString()
  transactionId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(['pending', 'awaited', 'success', 'failed'], { each: true })
  type: string[];

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  courseId: number;
}
