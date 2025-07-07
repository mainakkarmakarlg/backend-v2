import { Module } from '@nestjs/common';
import { ExternalService } from './external.service';
import { ExternalController } from './external.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ExternalController],
  providers: [ExternalService],
})
export class ExternalModule {}
