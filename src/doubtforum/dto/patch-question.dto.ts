import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class PatchQuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => {
    return parseInt(value);
  })
  @IsNumber()
  fallNumber: number;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  })
  @IsArray()
  @IsString({ each: true })
  removedAttachments: string[];

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => {
    return parseInt(value);
  })
  @IsNumber()
  sourceId: number;
}
