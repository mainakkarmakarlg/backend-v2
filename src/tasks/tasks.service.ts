import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from 'src/database/database.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { catchError, lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';
import { QuizService } from 'src/quiz/quiz.service';
import { EmailsService } from 'src/email/email.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly whatsappService: WhatsappService,
    private readonly httpService: HttpService,
    private readonly quizService: QuizService,
    private readonly emailsService: EmailsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Cron('0 0 * * *')
  async handleRefreshToken() {
    const redisClient = (this.cacheManager as any).stores[0].opts.store._client;
    await redisClient.set('daily_order_counter', 0);
    await this.databaseService.userRefreshToken.deleteMany({
      where: {
        createdAt: {
          lte: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30),
        },
      },
    });
    const data = await lastValueFrom(
      this.httpService
        .post(
          'https://v6.exchangerate-api.com/v6/e0c40d6b5ca88e568f19f53e/latest/USD',
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw 'An Error Happened5' + error.message;
          }),
        ),
    );
    const exchangeRate = data.data.conversion_rates;
    await this.cacheManager.set('exchangeRate', exchangeRate, 86400000);
  }

  // @Cron('* * * * * *')
  // async checkOrders() {
  //   const check = await lastValueFrom(
  //     this.httpService
  //       .get(`${process.env.shipwayGetLink}?orderid=CFAL-2RZ-51032511050P`, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Basic ${process.env.shipwayKey}`,
  //         },
  //       })
  //       .pipe(
  //         catchError((error: AxiosError) => {
  //           throw 'An Error Happened5' + error.message;
  //         }),
  //       ),
  //   );
  //   console.log(check.data?.message[0]?.shipment_status);
  //   console.log(check.data?.message[0]?.tracking_number);
  // }

  formatAppointmentDate(appointmentDate: Date): string {
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    const day = appointmentDate.getDate();
    const daySuffix =
      day % 10 === 1 && day !== 11
        ? 'st'
        : day % 10 === 2 && day !== 12
          ? 'nd'
          : day % 10 === 3 && day !== 13
            ? 'rd'
            : 'th';
    const formattedDate = new Intl.DateTimeFormat('en-GB', dateOptions).format(
      appointmentDate,
    );
    const fixingit = formattedDate.split(' ');
    fixingit.shift();
    const result = fixingit.join(' ');
    return `${day}${daySuffix} ${result}`;
  }

  @Cron('0 */30 * * * *')
  async handleScheduleCallNotification() {
    const now = new Date();
    const minTime = new Date(now.getTime() + 30 * 60 * 1000);
    const platforms = await this.databaseService.platform.findMany({
      where: {
        UserContactForm: {
          some: {
            appointmentTime: {
              not: null,
              equals: minTime,
            },
          },
        },
      },
      include: {
        UserContactForm: {
          where: {
            appointmentTime: {
              not: null,
              equals: minTime,
            },
          },
        },
      },
    });
    for (const platform of platforms) {
      const whatsappTemplate =
        await this.databaseService.platformTemplate.findFirst({
          where: {
            name: 'reminderScheduleCall',
            platformId: platform.id,
          },
        });
      if (whatsappTemplate) {
        for (const userContactForm of platform.UserContactForm) {
          await this.whatsappService.sendWhatsappMessage(
            userContactForm.counrtyCode + userContactForm.phone,
            userContactForm.fname + ' ' + userContactForm.lname,
            whatsappTemplate.templateId,
            [
              userContactForm.fname + ' ' + userContactForm.lname,
              this.formatAppointmentDate(userContactForm.appointmentTime),
              '30 minutes',
            ],
          );
        }
      }
    }
  }

  @Cron('*/5 * * * * *')
  async handleQuizes() {
    // console.log(new Date().toISOString(), 'Running Quiz Cron');
    this.quizService.handleStartingQuizes();
    this.quizService.handleEndingQuizes();
    this.quizService.handleWhatsappReminders();
    // handle
  }

  @Cron('15 23  * * *')
  async sendQuizUpdates() {
    console.log(new Date().toISOString(), 'Running Quiz Update Cron');
    const today = new Date();
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);
    sevenDaysLater.setHours(0, 0, 0, 0);
    const quiz = await this.databaseService.quiz.findMany({
      where: {
        isActive: true,
        startTime: {
          gte: sevenDaysLater,
          lt: new Date(sevenDaysLater.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        User: {
          select: {
            User: {
              select: {
                email: true,
                fname: true,
                lname: true,
              },
            },
          },
        },
      },
    });
    for (const q of quiz) {
      const quizTemplate = await this.databaseService.quizTemplate.findMany({
        where: {
          name: 'oneWeekQuizUpdate',
          quizId: q.id,
        },
      });
      for (const template of quizTemplate) {
        for (const user of q.User) {
          const email = user.User.email;
          const name = user.User.fname + ' ' + user.User.lname;
          await this.emailsService.sendBrevoMail(
            name,
            email,
            template.senderEmail,
            template.senderEmail,
            Number(template.templateId),
            {
              fname: user.User.fname,
            },
          );
        }
      }
    }

    const oneDayLater = new Date(today);
    oneDayLater.setDate(today.getDate() + 1);
    oneDayLater.setHours(0, 0, 0, 0);
    console.log(oneDayLater, 'One Day Later');
    console.log(
      'onedaymore',
      new Date(oneDayLater.getTime() + 24 * 60 * 60 * 1000),
    );
    const chanakya = await this.databaseService.quiz.findMany({
      where: {
        id: 17,
      },
    });
    console.log(chanakya, 'Chanakya Quiz');
    const quizOneDay = await this.databaseService.quiz.findMany({
      where: {
        startTime: {
          gte: oneDayLater,
          lt: new Date(oneDayLater.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        User: {
          select: {
            User: {
              select: {
                email: true,
                fname: true,
                lname: true,
              },
            },
          },
        },
      },
    });
    console.log(quizOneDay, 'Quiz One Day');
    let emailCount = 0;
    for (const q of quizOneDay) {
      const quizTemplate = await this.databaseService.quizTemplate.findMany({
        where: {
          name: 'oneDayQuizUpdate',
          quizId: q.id,
        },
      });

      for (const template of quizTemplate) {
        for (const user of q.User) {
          const email = user.User.email;
          const name = user.User.fname + ' ' + user.User.lname;

          // Send email
          await this.emailsService.sendBrevoMail(
            name,
            email,
            template.senderEmail,
            template.senderEmail,
            Number(template.templateId),
            {
              fname: user.User.fname,
            },
          );

          emailCount++;

          // After 800 emails, wait for 2 seconds
          if (emailCount >= 800) {
            console.log('Sent 800 emails, waiting for 2 seconds...');
            await this.sleep(2000); // 2000 milliseconds = 2 seconds
            emailCount = 0; // Reset counter after the delay
          }
        }
      }
    }
  }
  async sleep(ms: number) {
    (resolve) => setTimeout(resolve, ms);
  }
}
