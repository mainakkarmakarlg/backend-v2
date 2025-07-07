import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}
  getHello(): string {
    return 'Hello World!';
  }

  // async getAttempt() {
  //   const questions = await this.databaseService.practiceQuestion.findMany({
  //     where: {
  //       id: {
  //         gte: 1371,
  //       },
  //     },
  //     include: {
  //       Option: {
  //         include: {
  //           RightOption: true,
  //           Explaination: true,
  //         },
  //       },
  //       Explaination: true,
  //       Report: true,
  //       UserFlag: true,
  //     },
  //   });
  //   for (const question of questions) {
  //     for (const option of question.Option) {
  //       if (option.RightOption) {
  //         await this.databaseService.practiceRightOption.delete({
  //           where: {
  //             optionId: option.id,
  //           },
  //         });
  //       }
  //       if (option.Explaination.length > 0) {
  //         await this.databaseService.practiceOptionExplaination.delete({
  //           where: {
  //             optionId: option.id,
  //           },
  //         });
  //       }
  //       await this.databaseService.practiceOption.delete({
  //         where: {
  //           id: option.id,
  //         },
  //       });
  //     }
  //     if (question.Explaination) {
  //       await this.databaseService.practiceQuestionExplaination.delete({
  //         where: {
  //           questionId: question.id,
  //         },
  //       });
  //     }
  //     if (question.Report.length > 0) {
  //       await this.databaseService.practiceQuestionReport.deleteMany({
  //         where: {
  //           questionId: question.id,
  //         },
  //       });
  //     }
  //     if (question.UserFlag.length > 0) {
  //       await this.databaseService.userPracticeQuestionFlag.deleteMany({
  //         where: {
  //           questionId: question.id,
  //         },
  //       });
  //     }
  //     await this.databaseService.practiceQuestiontoFallNumber.deleteMany({
  //       where: {
  //         questionId: question.id,
  //       },
  //     });
  //     await this.databaseService.practiceQuestion.delete({
  //       where: {
  //         id: question.id,
  //       },
  //     });
  //   }
  // }
}
