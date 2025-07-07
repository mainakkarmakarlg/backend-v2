import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class GetQuizOptionDto {
  @ApiProperty({
    description: 'Quiz ID',
    required: true,
    type: Number,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  quizId: number;

  @ApiProperty({
    description: 'Key Name',
    required: true,
    type: Number,
  })
  @IsString()
  keyName: string;
}
