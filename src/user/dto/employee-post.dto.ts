import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class EmployeePostDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  profile: string;

  @IsString()
  isActive: string;
}
