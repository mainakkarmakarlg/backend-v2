import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetDoubtForumQuestionsDto {
  @ApiProperty({ required: false, enum: ['unanswered', 'own', 'pinned'] })
  @IsOptional()
  @IsEnum(['unanswered', 'own', 'pinned'])
  type: string;

  @ApiProperty({ required: false, enum: ['like', 'oldest', 'views'] })
  @IsOptional()
  @IsEnum(['like', 'oldest', 'views'])
  sort: string;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  search: string;

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
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  subjectIds: number[];

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  practiceId: number;
}
