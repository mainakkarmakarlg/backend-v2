import { Module } from '@nestjs/common';
import { VultrService } from './vultr.service';
import { VultrController } from './vultr.controller';

@Module({
  providers: [VultrService],
  exports: [VultrService],
  controllers: [VultrController],
})
export class VultrModule {}
