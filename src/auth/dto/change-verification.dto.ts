import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class ChangeVerficationDTO {
  @ApiProperty({ description: 'Token to change verification', required: true })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Verification mode to change',
    required: true,
    enum: ['phone', 'email', 'whatsapp'],
  })
  @IsEnum(['phone', 'email', 'whatsapp'], {
    message: 'Please Enter a valid verification mode',
  })
  verificationmode: string;
}
