import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class PatchAnswerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text: string;

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
}
