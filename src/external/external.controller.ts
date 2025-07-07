import { Body, Controller, Post } from '@nestjs/common';
import { ExternalService } from './external.service';

@Controller('external')
export class ExternalController {
  constructor(private readonly externalService: ExternalService) {}
  @Post('adduser')
  async addUser(@Body() responseBody: any) {
    return this.externalService.addUser(responseBody);
  }
}
