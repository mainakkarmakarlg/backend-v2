import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class PostTestimonialDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  profession: string;

  @IsString()
  @IsOptional()
  role: string;

  @IsString()
  @IsOptional()
  linkedin: string;

  @IsString()
  @IsOptional()
  image: string;

  @IsBoolean()
  @Transform(({ value }) => {
    return value.toLowerCase() === 'true';
  })
  @IsNotEmpty()
  isFeatured: boolean;
}
