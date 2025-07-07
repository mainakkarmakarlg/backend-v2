import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class validityExtensionDto {
  @ApiProperty({ description: 'Course ID of the user' })
  @IsOptional()
  @IsNumber()
  courseId: number;

  @ApiProperty({ description: 'First name of the user', required: false })
  @IsOptional()
  @IsString()
  appearingCourseId: string;

  @ApiProperty({ description: 'Last name of the user', required: false })
  @IsOptional()
  @IsString()
  issue: string;

  @ApiProperty({ description: 'Last name of the user', required: false })
  @IsOptional()
  @IsString()
  examRegistration: boolean;

  @ApiProperty({ description: 'Last name of the user', required: false })
  @IsOptional()
  @IsString()
  instituteId: boolean;
}
