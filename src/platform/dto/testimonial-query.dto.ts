import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class TestimonialQueryDto {
  @ApiProperty({
    description: 'Testimonial course search string',
    required: false,
  })
  @IsOptional()
  @IsString()
  courseSearchString: string;

  @ApiProperty({
    description: 'Testimonial platform search string',
    required: false,
  })
  @IsOptional()
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'Testimonial platform featured',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  platformFeatured: boolean;
  @ApiProperty({ description: 'Testimonial course featured', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  courseFeatured: boolean;
}
