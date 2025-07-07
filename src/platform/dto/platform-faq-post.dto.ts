import { IsString } from 'class-validator';

export class PlatformFaqPostDto {
  @IsString()
  type: string;
  @IsString()
  course: string;
  @IsString()
  category: string;
  @IsString()
  question: string;
  @IsString()
  answer: string;
}
