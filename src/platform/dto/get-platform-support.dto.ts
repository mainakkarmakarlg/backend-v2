import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNumber, ValidateIf } from 'class-validator';

export class GetPlatformSupportDto {
  @ApiProperty()
  @ValidateIf((o) => !o.mobile, {
    message: 'Email is required',
  })
  @IsEmail()
  email: string;

  @ApiProperty()
  @ValidateIf((o) => !o.email, {
    message: ' mobile is required',
  })
  @Transform(({ value }) => {
    return parseInt(value, 10);
  })
  @IsNumber()
  mobile: number;
}
