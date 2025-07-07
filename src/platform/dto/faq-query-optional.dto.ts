import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class FaqQueryOptionalDto {
  @IsOptional()
  @IsString()
  typeSearchString: string;

  @IsOptional()
  @IsString()
  questionSearchString: string;
}
