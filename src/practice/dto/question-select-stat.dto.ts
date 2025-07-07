import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum } from 'class-validator';

export class QuestionSelectStatDto {
  @ApiProperty()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: string;

  @ApiProperty()
  @IsBoolean()
  flagged: boolean;

  @ApiProperty()
  @IsBoolean()
  incorrect: boolean;

  @ApiProperty()
  @IsBoolean()
  unattempted: boolean;

  @ApiProperty()
  @IsBoolean()
  otherSubject: boolean;
}
