import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PostAnswerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  answer: string;
}
