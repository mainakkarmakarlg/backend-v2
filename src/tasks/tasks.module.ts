import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { DatabaseModule } from 'src/database/database.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { HttpModule } from '@nestjs/axios';
import { QuizModule } from 'src/quiz/quiz.module';
import { EmailsModule } from 'src/email/email.module';

@Module({
  imports: [
    DatabaseModule,
    WhatsappModule,
    HttpModule,
    QuizModule,
    EmailsModule,
  ],
  providers: [TasksService],
})
export class TasksModule {}
