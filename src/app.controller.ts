import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('time')
  getTime() {
    const now = new Date();
    const offsetMs = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istTime = new Date(now.getTime() + offsetMs);
    return istTime;
  }
  @Get('iso-time')
  getIsoTime() {
    const now = new Date();
    // const offsetMs = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    // const istTime = new Date(now.getTime() + offsetMs);
    // return istTime;
    return now.toISOString(); // Return the current time in ISO format
  }
}
