import { ApiProperty } from '@nestjs/swagger';

export class GetCourierTrackingInfoDto {
  @ApiProperty()
  orderId: string;
}
