import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { QuizGetDto } from './dto/quiz-get.dto';
import { DatabaseService } from 'src/database/database.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { VultrService } from 'src/vultr/vultr.service';
import { CustomUserSocketClient } from 'src/common/interface/custom-socket-user-client.interface';
import { NotificationService } from 'src/notification/notification.service';
import { QuizAttemptStartDto } from './dto/quiz-attempt.dto';
import { AddQuizFlagDto } from './dto/add-quiz-flag.dto';
import { AddQuizQuestionDto } from './dto/add-quiz-question.dto';
import { AddQuizReportDto } from './dto/add-quiz-report.dto';
import { AddQuizQuestionDifficultyDto } from './dto/add-quiz-question-difficulty.dto';
import { GetQuizAnswersDto } from './dto/get-quiz-answers.dto';
import { ResultAnalysisDto } from 'src/user/dto/result-analysis.dto';
import { QuizUserRegisterDto } from './dto/quiz-user-register.dto';
import { GetQuizOptionDto } from './dto/get-quiz-option.dto';
import { EmailsService } from 'src/email/email.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { HttpService } from '@nestjs/axios';
import { catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { CreateQuizDto } from './dto/add-quiz-dto';
import { QuizLinkCourseDto } from './dto/quiz-link-course.dto';

@Injectable()
export class QuizService {
  async addQuizFeedback(userid: number, quizId: number, feedback: JSON) {
    let feedBackData = await this.databaseService.quizFeedback.findFirst({
      where: {
        userId: userid,
        quizId: quizId,
      },
    });
    if (feedBackData) {
      throw new BadRequestException(
        'You have already given feedback for this quiz',
      );
    }
    const attempt = await this.databaseService.userQuizAttempt.findFirst({
      where: {
        userId: userid,
        quizId: quizId,
      },
    });
    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }
    feedBackData = await this.databaseService.quizFeedback.create({
      data: {
        userId: userid,
        quizId: quizId,
        feedback: JSON.parse(JSON.stringify(feedback)),
      },
    });
    return {
      message: 'Feedback added successfully',
      feedback: feedBackData,
    };
  }

  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly vultrService: VultrService,
    private readonly notificationService: NotificationService,
    private readonly emailService: EmailsService,
    private readonly whatsappService: WhatsappService,
    private readonly httpService: HttpService,
  ) {}

  async getAllAnswer() {
    const quiz = await this.databaseService.quiz.findMany({
      where: {
        id: 17,
      },
      include: {
        Questions: {
          select: {
            id: true,
          },
        },
      },
    });
    const attempts = await this.databaseService.userQuizAttempt.findMany({
      where: {
        quizId: 17,
      },
      include: {
        User: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
            countryCode: true,
            phone: true,
            Meta: {
              select: {
                whatsappCountryCode: true,
                whatsappNumber: true,
              },
            },
          },
        },
        Answers: {
          include: {
            Option: {
              select: {
                id: true,
                RightOption: true,
              },
            },
          },
        },
        UserCheating: true,
      },
    });
    return { quiz, attempts };
  }

  async handleWhatsappReminders() {
    const now = new Date();
    now.setMilliseconds(0);
    const twoHoursLater = new Date(now.getTime() + 102 * 60 * 1000);
    const twoHoursLaterPlusFiveSeconds = new Date(
      twoHoursLater.getTime() + 5 * 1000,
    );

    const quiz = await this.databaseService.quiz.findMany({
      where: {
        startTime: {
          gte: twoHoursLater,
          lt: twoHoursLaterPlusFiveSeconds,
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
                phone: true,
                countryCode: true,
                Meta: {
                  select: {
                    whatsappCountryCode: true,
                    whatsappNumber: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    for (const q of quiz) {
      const quizTemplate = await this.databaseService.quizTemplate.findMany({
        where: {
          name: 'twoHourReminder',
          quizId: q.id,
        },
      });
      for (const template of quizTemplate) {
        for (const user of q.User) {
          const email = user.User.email;
          const name = user.User.fname + ' ' + user.User.lname;
          const whatsappNumber = user.User?.Meta?.whatsappNumber
            ? (user.User.Meta.whatsappCountryCode ?? user.User.countryCode) +
              user.User.Meta.whatsappNumber
            : user.User.countryCode + user.User.phone;
          await this.whatsappService.sendWhatsappMessage(
            whatsappNumber,
            user.User.fname + ' ' + user.User.lname,
            template.templateId,
            [],
            null,
            null,
            null,
            null,
          );
        }
      }
    }
  }

  async getQuizOption(platformId: number, quizOption: GetQuizOptionDto) {
    return this.databaseService.quizMetaOption.findFirst({
      where: {
        quizId: quizOption.quizId,
        key: quizOption.keyName,
      },
      include: {},
    });
  }

  async quizStudentRegister(
    userId: number,
    quizUserRegisterDto: QuizUserRegisterDto,
  ) {
    const quiz = await this.databaseService.quiz.findFirst({
      where: {
        id: quizUserRegisterDto.quizId,
        accessType: 'registered',
      },
      include: {
        Meta: true,
      },
    });
    const user = await this.databaseService.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        Meta: true,
      },
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found or not registered');
    }
    const isRegistered = await this.databaseService.quizToUser.findFirst({
      where: {
        userId: userId,
        quizId: quizUserRegisterDto.quizId,
      },
    });
    if (isRegistered) {
      throw new BadRequestException('You are already registered for this quiz');
    }
    if (
      quiz.Meta &&
      quiz.Meta.regStartTime &&
      new Date(quiz.Meta.regStartTime) > new Date()
    ) {
      throw new BadRequestException('Quiz registration has not started yet');
    }
    if (
      quiz.Meta &&
      quiz.Meta.regEndTime &&
      new Date(quiz.Meta.regEndTime) < new Date()
    ) {
      throw new BadRequestException('Quiz registration has ended');
    }
    await this.databaseService.quizToUser.create({
      data: {
        userId: userId,
        quizId: quizUserRegisterDto.quizId,
        fieldJson: JSON.parse(quizUserRegisterDto.fields.toString()),
      },
    });

    const fields: any = JSON.parse(quizUserRegisterDto.fields);

    if (process.env.NODE_ENV !== 'development') {
      const quizTemplate = await this.databaseService.quizTemplate.findFirst({
        where: {
          quizId: quizUserRegisterDto.quizId,
          name: 'Quiz Registration',
        },
      });
      if (quizTemplate) {
        quiz.startTime;
        const istTime = new Date(quiz.startTime);
        const formattedDate = istTime.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
        const endistTime = new Date(quiz.endTime);
        const formattedEndDate = endistTime.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
        const formattedTime = istTime.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        this.emailService.sendBrevoMail(
          user.fname,
          user.email,
          quizTemplate.senderEmail,
          quizTemplate.senderName,
          Number(quizTemplate.templateId),
          {
            fname: user.fname,
            quizname: quiz.name,
            startdate: formattedDate,
            starttime: formattedTime,
          },
        );
      }
      const quizWhatsappSend =
        await this.databaseService.quizTemplate.findFirst({
          where: {
            quizId: quizUserRegisterDto.quizId,
            name: 'Competition Registration',
          },
        });
      if (quizWhatsappSend) {
        const istTime = new Date(quiz.startTime);
        const formattedDate = istTime.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
        const formattedTime = istTime.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        const whatsappNumber = user?.Meta?.whatsappNumber
          ? (user.Meta.whatsappCountryCode ?? user.countryCode) +
            user.Meta.whatsappNumber
          : user.countryCode + user.phone;
        this.whatsappService.sendWhatsappMessage(
          whatsappNumber,
          user.fname + ' ' + user.lname,
          quizWhatsappSend.templateId,
          [user.fname, quiz.name, formattedDate, formattedTime],
          null,
          null,
          null,
          null,
        );
      }
      const formattedDate = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date());
      this.httpService
        .post(process.env.sheetLink, {
          section: 'competition_registration',
          date: formattedDate,
          competition_name: quiz.name,
          email: user.email,
          phone: user.phone,
          countryCode: user.countryCode,
          fname: user.fname,
          lname: user.lname,
          whatsappCountryCode: user.Meta[0]?.whatsappCountryCode,
          whatsappNumber: user.Meta[0]?.whatsappNumber,
          country: fields?.location?.country,
          state: fields?.location?.state,
          city: fields?.location?.city,
          institute: fields?.institute,
          course: fields?.course,
          year: fields?.year,
          register: fields?.cfaRegistration,
        })
        .pipe(
          catchError((error: AxiosError) => {
            console.error('An Error Happened1', error.message);
            return [];
          }),
        )
        .subscribe({
          next: (response) => response,
          error: (err) => console.error('HTTP request failed:', err),
        });
    }
    return {
      message: 'You have successfully registered for the quiz',
      quiz: quiz,
    };
  }

  async getCourseIdArray(courseId: number, userId: number) {
    const course = await this.databaseService.course.findFirst({
      where: {
        User: {
          some: {
            userId: userId,
          },
        },
        OR: [
          {
            courseId: courseId,
          },
          {
            Course: {
              OR: [
                {
                  courseId: courseId,
                },
                {
                  Course: {
                    OR: [
                      {
                        courseId: courseId,
                      },
                      {
                        Course: {
                          OR: [
                            {
                              courseId: courseId,
                            },
                            {
                              Course: {
                                OR: [
                                  {
                                    courseId: courseId,
                                  },
                                  {
                                    Course: {
                                      OR: [
                                        {
                                          courseId: courseId,
                                        },
                                        {
                                          Course: {
                                            OR: [
                                              {
                                                courseId: courseId,
                                              },
                                              {
                                                Course: {
                                                  courseId: courseId,
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
      include: {
        Course: {
          select: {
            id: true,
            Course: {
              select: {
                id: true,
                Course: {
                  select: {
                    id: true,
                    Course: {
                      select: {
                        id: true,
                        Course: {
                          select: {
                            id: true,
                            Course: {
                              select: {
                                id: true,
                                Course: {
                                  select: {
                                    id: true,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    return this.extractCourseIds(course);
  }

  async canUseQuiz(platformId: number) {
    const canUseQuiz = await this.databaseService.platformOptions.findFirst({
      where: {
        platformId: platformId,
        key: 'canUseQuiz',
      },
    });
    if (!canUseQuiz) {
      return false;
    }
    return true;
  }

  extractCourseIds(courseData) {
    let courseIds: number[] = [];

    if (courseData) {
      if (courseData.id) {
        courseIds.push(courseData.id);
      }

      if (courseData.Course) {
        courseIds = courseIds.concat(this.extractCourseIds(courseData.Course));
      }
    }

    return courseIds;
  }

  async findAll(userId: number, platformId: number, getQuizDto: QuizGetDto) {
    let courseId: number | null = null;
    if (userId) {
      const watching_courseId = await this.cacheManager.get(
        `watching_course_${userId}_${platformId}`,
      );
      if (watching_courseId) {
        courseId = Number(watching_courseId);
      }
    }
    let courseIds: number[] = [];
    if (courseId) {
      courseIds = await this.getCourseIdArray(courseId, userId);
    }
    const canSeeAll = await this.databaseService.platformOptions.findFirst({
      where: {
        platformId: platformId,
        key: 'AllowLoginByNumber',
      },
    });

    if (canSeeAll) {
      courseIds.push(courseId);
    }
    const quizes = await this.databaseService.quiz.findMany({
      where: {
        isActive: null,
        id: getQuizDto.quizId ? getQuizDto.quizId : undefined,
        OR: [
          {
            CourseNdPlatform: {
              some: {
                courseId: {
                  in: courseIds,
                },
              },
            },
          },
          {
            CourseNdPlatform: {
              some: {
                courseId: null,
              },
            },
          },
        ],
        CourseNdPlatform: {
          some: {
            platformId: platformId,
            slug: getQuizDto.slug ? getQuizDto.slug : undefined,
          },
        },
      },
      include: {
        User: {
          where: {
            userId: userId,
          },
        },
        Quizzes: {
          include: {
            CourseNdPlatform: {
              where: {
                platformId: platformId,
              },
              select: {
                slug: true,
                platformId: true,
              },
            },
            Questions: {
              select: {
                _count: {
                  select: {
                    Answers: {
                      where: {
                        Attempt: {
                          userId: userId,
                        },
                        optionId: {
                          not: null,
                        },
                      },
                    },
                  },
                },
                Questions: {
                  select: {
                    _count: {
                      select: {
                        Answers: {
                          where: {
                            Attempt: {
                              userId: userId,
                            },
                            optionId: {
                              not: null,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            Attempts: {
              where: {
                userId: userId,
              },
            },
            Meta: true,
          },
        },
        CourseNdPlatform: {
          where: {
            platformId: platformId,
          },
          select: {
            slug: true,
            platformId: true,
          },
        },
        Questions: {
          select: {
            _count: {
              select: {
                Answers: {
                  where: {
                    Attempt: {
                      userId: userId,
                    },
                    optionId: {
                      not: null,
                    },
                  },
                },
              },
            },
            Questions: {
              select: {
                _count: {
                  select: {
                    Answers: {
                      where: {
                        Attempt: {
                          userId: userId,
                        },
                        optionId: {
                          not: null,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        Attempts: {
          where: {
            userId: userId,
          },
        },
        Meta: true,
      },
    });
    let givingquizes: any[] = [];
    for (const quiz of quizes) {
      let questionCount = 0;
      let attemptCount = 0;
      for (const question of quiz.Questions) {
        const hasChildren = question.Questions && question.Questions.length > 0;
        if (hasChildren) {
          for (const childQuestion of question.Questions) {
            questionCount += 1;
            if (childQuestion._count.Answers > 0) {
              attemptCount += 1;
            }
          }
        } else {
          questionCount += 1;
          if (question._count.Answers > 0) {
            attemptCount += 1;
          }
        }
      }
      let givingChildQuizes: any[] = [];
      for (const childQuiz of quiz.Quizzes) {
        let childQuestionCount = 0;
        let childAttemptCount = 0;
        for (const question of childQuiz.Questions) {
          const hasChildren =
            question.Questions && question.Questions.length > 0;
          if (hasChildren) {
            for (const childQuestion of question.Questions) {
              childQuestionCount += 1;
              if (childQuestion._count.Answers > 0) {
                childAttemptCount += 1;
              }
            }
          } else {
            childQuestionCount += 1;
            if (question._count.Answers > 0) {
              childAttemptCount += 1;
            }
          }
        }
        const giveChildQuiz = {
          ...childQuiz,
          questionCount: childQuestionCount,
          attemptCount: childAttemptCount,
        };
        delete giveChildQuiz.Questions;
        givingChildQuizes.push(giveChildQuiz);
      }
      quiz.Quizzes = givingChildQuizes;
      const givingQuiz = {
        ...quiz,
        Quizzes: givingChildQuizes,
        questionCount,
        attemptCount,
      };
      delete givingQuiz.Questions;
      givingquizes.push(givingQuiz);
    }
    return givingquizes;
  }

  async startQuiz(
    client: CustomUserSocketClient,
    quizAttemptStartDto: QuizAttemptStartDto,
  ) {
    const canUseQuiz = await this.canUseQuiz(client.platformId);
    if (!canUseQuiz) {
      return client.emit('make-quiz-attempt-error', {
        message: 'Quiz is not allowed on this platform',
      });
    }
    let courseId: number | null = null;
    const watching_courseId = await this.cacheManager.get(
      `watching_course_${client.userId}_${client.platformId}`,
    );
    if (watching_courseId) {
      courseId = Number(watching_courseId);
    }

    let quizAttempt: any;
    let quiz: any;
    let isEnrolled: any;

    let timeTaken = 0;
    let time = new Date();

    if (quizAttemptStartDto.attemptId) {
      quizAttempt = await this.databaseService.userQuizAttempt.findFirst({
        where: {
          id: quizAttemptStartDto.attemptId,
        },
        include: {
          Quiz: {
            include: {
              Questions: true,
              _count: {
                select: {
                  Attempts: {
                    where: {
                      userId: client.userId,
                    },
                  },
                },
              },
              CourseNdPlatform: {
                where: {
                  platformId: client.platformId,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
      if (quizAttempt) {
        quiz = quizAttempt.Quiz;
      } else {
        return client.emit('make-quiz-attempt-error', {
          message: 'Quiz attempt not found',
        });
      }
    } else if (quizAttemptStartDto.quizId) {
      quiz = await this.databaseService.quiz.findFirst({
        where: {
          id: quizAttemptStartDto.quizId,
          OR: [
            {
              CourseNdPlatform: {
                some: {
                  platformId: client.platformId,
                },
              },
              OR: [
                {
                  CourseNdPlatform: {
                    some: {
                      courseId: courseId,
                    },
                  },
                },
                {
                  CourseNdPlatform: {
                    some: {
                      courseId: null,
                    },
                  },
                },
                {},
              ],
            },
            {
              Quiz: {
                CourseNdPlatform: {
                  some: {
                    platformId: client.platformId,
                  },
                },
                OR: [
                  {
                    CourseNdPlatform: {
                      some: {
                        courseId: courseId,
                      },
                    },
                  },
                  {
                    CourseNdPlatform: {
                      some: {
                        courseId: null,
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
        include: {
          Questions: true,
          _count: {
            select: {
              Attempts: {
                where: {
                  userId: client.userId,
                },
              },
            },
          },
          CourseNdPlatform: {
            where: {
              platformId: client.platformId,
            },
          },
        },
      });
    } else if (quizAttemptStartDto.slug) {
      quiz = await this.databaseService.quiz.findFirst({
        where: {
          OR: [
            {
              CourseNdPlatform: {
                some: {
                  platformId: client.platformId,
                  slug: quizAttemptStartDto.slug,
                },
              },
              OR: [
                {
                  CourseNdPlatform: {
                    some: {
                      courseId: courseId,
                    },
                  },
                },
                {
                  CourseNdPlatform: {
                    some: {
                      courseId: null,
                    },
                  },
                },
                {},
              ],
            },
            {
              Quiz: {
                CourseNdPlatform: {
                  some: {
                    platformId: client.platformId,
                  },
                },
                OR: [
                  {
                    CourseNdPlatform: {
                      some: {
                        courseId: courseId,
                      },
                    },
                  },
                  {
                    CourseNdPlatform: {
                      some: {
                        courseId: null,
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
        include: {
          Questions: true,
          _count: {
            select: {
              Attempts: {
                where: {
                  userId: client.userId,
                },
              },
            },
          },
          CourseNdPlatform: {
            where: {
              platformId: client.platformId,
              slug: quizAttemptStartDto.slug,
            },
          },
        },
      });
    } else {
      return client.emit('make-quiz-attempt-error', {
        message: 'Quiz or attempt not found',
      });
    }

    if (!quiz) {
      return client.emit('make-quiz-attempt-error', {
        message: 'Quiz not found',
      });
    }

    if (quiz.isActive === false) {
      return client.emit('make-quiz-attempt-error', {
        message: 'Quiz is not active',
      });
    }

    if (quiz.accessType === 'paid') {
      isEnrolled = await this.databaseService.quizToUser.findFirst({
        where: {
          userId: client.userId,
          quizId: Number(quiz.id),
        },
      });

      if (!isEnrolled) {
        return client.emit('make-quiz-attempt-error', {
          message: 'This quiz is only for enrolled students',
        });
      }
    }
    if (quizAttempt) {
      if (quizAttempt.hasSubmitted) {
        if (quiz.resultType === 'aftersubmit') {
          client.quizAttempt = {
            attemptId: 0,
            quizId: 0,
            attemptStartTime: new Date(),
            questionId: 0,
            questionStartTime: new Date(),
            hasSubmited: true,
          };

          client.quizAttempt.attemptId = quizAttempt.id ? quizAttempt.id : null;
          client.quizAttempt.quizId = quiz.id ? quiz.id : null;
          client.quizAttempt.attemptStartTime = quizAttempt.id
            ? new Date()
            : null;

          const quizRoom = `quizroom_quiz_${quiz.id}`;
          client.join(quizRoom);
          return client.emit('make-quiz-attempt-success', {
            message: 'Attempted successfully',
            attempt: quizAttempt,
          });
        }
      }
    }

    // check for isEnrolled
    if (quiz.accessType === 'registered') {
      isEnrolled = await this.databaseService.quizToUser.findFirst({
        where: {
          userId: client.userId,
          quizId: quiz.id,
        },
      });
      if (!isEnrolled) {
        return client.emit('make-quiz-attempt-error', {
          message: 'You are not enrolled in this quiz',
        });
      }
    }

    if (quiz.timeType === 'fixed' || quiz.timeType === 'duration') {
      if (quiz.startTime && new Date(quiz.startTime) > new Date()) {
        // add in test room
        const waitingRoom = `waitingroom_quiz_${quiz.id}`;
        client.join(waitingRoom);
        return client.emit('make-quiz-attempt-error', {
          message: 'Quiz not started yet',
        });
      } else if (quiz.endTime && new Date(quiz.endTime) < new Date()) {
        return client.emit('make-quiz-attempt-error', {
          message: 'Quiz ended',
        });
      } else {
        // quiz running
        const questionsCanBeShuffled = quiz.Questions?.filter(
          (question: any) => {
            return (
              question?.canShuffle === null && question?.questionId === null
            );
          },
        );

        const questionsCannotBeShuffled = quiz.Questions?.filter(
          (question: any) => {
            return question?.canShuffle === false && question?.quizId === null;
          },
        );

        const shuffledQuestions = await this.shuffleArray(
          questionsCanBeShuffled,
        );

        // find a random index between 0 and the length of the array and insert all cannotBeShuffled questions at that index
        const index = Math.floor(
          Math.random() * (shuffledQuestions.length + 1),
        );

        shuffledQuestions.splice(index, 0, ...questionsCannotBeShuffled);

        // Attempt Type
        if (quiz.attemptType === 'single') {
          const attempts = await this.databaseService.userQuizAttempt.findFirst(
            {
              where: {
                userId: client.userId,
                quizId: quiz.id,
                platFormId: client.platformId ? client.platformId : null,
              },
            },
          );

          if (attempts && !quizAttemptStartDto.attemptId) {
            return client.emit('make-quiz-attempt-error', {
              message: 'You have already attempted this quiz',
            });
          } else if (attempts && quizAttemptStartDto.attemptId) {
            if (attempts.hasSubmitted) {
              return client.emit('make-quiz-attempt-error', {
                message: 'You have already submitted this quiz',
              });
            }
          }
          if (!quizAttempt) {
            quizAttempt = await this.databaseService.userQuizAttempt.create({
              data: {
                userId: client.userId,
                quizId: quizAttemptStartDto.quizId
                  ? quizAttemptStartDto.quizId
                  : quiz.id,
                platFormId: client.platformId ? client.platformId : null,
                timeTaken: 0,
                Answers: {
                  create: shuffledQuestions.map((question, idx) => ({
                    questionId: question.id,
                    order: idx + 1,
                    timeTaken: 0,
                  })),
                },
              },
              include: {
                Quiz: {
                  include: {
                    CourseNdPlatform: {
                      where: {
                        platformId: client.platformId,
                      },
                    },
                  },
                },
              },
            });
          }
        } else if (quiz.attemptType === 'multiple') {
          if (quizAttempt) {
            if (!quizAttemptStartDto.attemptId) {
              quizAttempt = await this.databaseService.userQuizAttempt.create({
                data: {
                  userId: client.userId,
                  quizId: quizAttemptStartDto.quizId
                    ? quizAttemptStartDto.quizId
                    : quiz.id,
                  platFormId: client.platformId ? client.platformId : null,
                  timeTaken: 0,
                  Answers: {
                    create: shuffledQuestions.map((question, idx) => ({
                      questionId: question.id,
                      order: idx + 1,
                      timeTaken: 0,
                    })),
                  },
                },
                include: {
                  Quiz: {
                    include: {
                      CourseNdPlatform: {
                        where: {
                          platformId: client.platformId,
                        },
                      },
                    },
                  },
                },
              });
            }
          } else {
            quizAttempt = await this.databaseService.userQuizAttempt.create({
              data: {
                userId: client.userId,
                quizId: quizAttemptStartDto.quizId
                  ? quizAttemptStartDto.quizId
                  : quiz.id,
                platFormId: client.platformId ? client.platformId : null,
                timeTaken: 0,
                Answers: {
                  create: shuffledQuestions.map((question, idx) => ({
                    questionId: question.id,
                    order: idx + 1,
                    timeTaken: 0,
                  })),
                },
              },
              include: {
                Quiz: {
                  include: {
                    CourseNdPlatform: {
                      where: {
                        platformId: client.platformId,
                      },
                    },
                  },
                },
              },
            });
          }
        } else if (quiz.attemptType === 'repeat') {
          if (quizAttempt) {
            const deletedAttempt =
              await this.databaseService.userQuizAttempt.delete({
                where: {
                  id: quizAttempt.id,
                },
              });

            quizAttempt = await this.databaseService.userQuizAttempt.create({
              data: {
                userId: client.userId,
                quizId: quizAttemptStartDto.quizId
                  ? quizAttemptStartDto.quizId
                  : quiz.id,
                platFormId: client.platformId ? client.platformId : null,
                timeTaken: 0,
                Answers: {
                  create: shuffledQuestions.map((question, idx) => ({
                    questionId: question.id,
                    order: idx + 1,
                    timeTaken: 0,
                  })),
                },
              },
              include: {
                Quiz: {
                  include: {
                    CourseNdPlatform: {
                      where: {
                        platformId: client.platformId,
                      },
                    },
                  },
                },
              },
            });
          } else {
            quizAttempt = await this.databaseService.userQuizAttempt.create({
              data: {
                userId: client.userId,
                quizId: quizAttemptStartDto.quizId
                  ? quizAttemptStartDto.quizId
                  : quiz.id,
                platFormId: client.platformId ? client.platformId : null,
                timeTaken: 0,
                Answers: {
                  create: shuffledQuestions.map((question, idx) => ({
                    questionId: question.id,
                    order: idx + 1,
                    timeTaken: 0,
                  })),
                },
              },
              include: {
                Quiz: {
                  include: {
                    CourseNdPlatform: {
                      where: {
                        platformId: client.platformId,
                      },
                    },
                  },
                },
              },
            });
          }
        } else if (!isNaN(Number(quiz?.attemptType))) {
          if (!quizAttemptStartDto.attemptId) {
            if (quiz?._count?.Attempts === Number(quiz?.attemptType)) {
              return client.emit('make-quiz-attempt-error', {
                message: 'Quiz attempt limit reached',
              });
            } else {
              quizAttempt = await this.databaseService.userQuizAttempt.create({
                data: {
                  userId: client.userId,
                  quizId: quizAttemptStartDto.quizId
                    ? quizAttemptStartDto.quizId
                    : quiz.id,
                  platFormId: client.platformId ? client.platformId : null,
                  timeTaken: 0,
                  Answers: {
                    create: shuffledQuestions.map((question, idx) => ({
                      questionId: question.id,
                      order: idx + 1,
                      timeTaken: 0,
                    })),
                  },
                },
                include: {
                  Quiz: {
                    include: {
                      CourseNdPlatform: {
                        where: {
                          platformId: client.platformId,
                        },
                      },
                    },
                  },
                },
              });
            }
          }
        }
      }
    }

    client.quizAttempt = {
      attemptId: 0,
      quizId: 0,
      attemptStartTime: new Date(),
      questionId: 0,
      questionStartTime: new Date(),
      hasSubmited: quizAttempt.hasSubmitted,
    };

    client.quizAttempt.attemptId = quizAttempt.id ? quizAttempt.id : null;
    client.quizAttempt.quizId = quiz.id ? quiz.id : null;
    client.quizAttempt.attemptStartTime = quizAttempt.id ? new Date() : null;

    const quizRoom = `quizroom_quiz_${quiz.id}`;
    client.join(quizRoom);

    if (quiz.timeType === 'duration' && !quizAttempt.hasSubmitted) {
      // if (quizAttempt && quizAttemptStartDto.attemptId) {
      //   timeTaken =
      //     new Date().getSeconds() - time.getSeconds() + quizAttempt.timeTaken;

      //   if (timeTaken <= quiz.duration) {
      this.handleDurationQuizes(client);
      //   }
      // }
    }

    return client.emit('make-quiz-attempt-success', {
      message: 'Attempted successfully',
      attempt: quizAttempt,
    });
  }

  async shuffleArray(array: any) {
    const shuffled = [...array]; // Clone the original array to avoid mutation
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Pick a random index
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
    return shuffled;
  }

  async handleQuizAttemptDisconnect(client: CustomUserSocketClient) {
    if (!client.quizAttempt.attemptId) return;

    const now = new Date();
    const timeDiff = Math.floor(
      (now.getTime() - client.quizAttempt.attemptStartTime.getTime()) / 1000,
    ); // Convert ms to seconds

    let attempt = await this.databaseService.userQuizAttempt.findFirst({
      where: {
        id: client.quizAttempt.attemptId,
      },
    });

    if (!attempt) return;

    if (!attempt.hasSubmitted) {
      attempt = await this.databaseService.userQuizAttempt.update({
        where: {
          id: client.quizAttempt.attemptId,
        },
        data: {
          timeTaken: attempt.timeTaken + timeDiff,
        },
      });
    }

    if (client.quizAttempt.questionId) {
      const attemptanswer = await this.databaseService.userQuizAnswer.findFirst(
        {
          where: {
            attemptId: client.quizAttempt.attemptId,
            questionId: client.quizAttempt.questionId,
          },
        },
      );

      if (
        !attemptanswer.optionId &&
        !attempt.hasSubmitted &&
        !attemptanswer.hasSubmitted
      ) {
        const questionTimeDiff = Math.floor(
          (now.getTime() - client.quizAttempt.questionStartTime.getTime()) /
            1000,
        );

        await this.databaseService.userQuizAnswer.update({
          where: {
            id: attemptanswer.id,
          },
          data: {
            timeTaken: attemptanswer.timeTaken + questionTimeDiff,
          },
        });
      }
    }

    client.quizAttempt.attemptId = null;
    client.quizAttempt.attemptStartTime = new Date(0);
    client.quizAttempt.questionId = null;
    client.quizAttempt.questionStartTime = new Date(0);
    client.quizAttempt.quizId = null;
    client.quizAttempt.hasSubmited = attempt.hasSubmitted;

    return client.emit('pause-quiz-attempt-success');
  }

  async getQuizQuestions(client: CustomUserSocketClient) {
    const canUseQuiz = await this.canUseQuiz(client.platformId);
    if (!canUseQuiz) {
      return client.emit('give-quiz-questions-error', {
        message: 'Quiz is not allowed on this platform',
      });
    }

    let watching_courseId = await this.cacheManager.get(
      `watching_course_${client.userId}_${client.platformId}`,
    );

    // if (!watching_courseId) {
    //   return client.emit('give-quiz-questions-error', {
    //     message: 'You are not watching any course',
    //   });
    // }

    let attempt;
    if (client.quizAttempt.hasSubmited) {
      attempt = await this.databaseService.userQuizAttempt.findFirst({
        where: {
          id: client.quizAttempt.attemptId,
        },
        include: {
          Quiz: {
            select: {
              Questions: {
                where: {
                  questionId: null,
                },
                include: {
                  Option: {
                    include: {
                      RightOption: true,
                      Explaination: true,
                    },
                  },
                  Answers: {
                    where: {
                      attemptId: client.quizAttempt.attemptId,
                    },
                    orderBy: {
                      order: 'asc',
                    },
                  },
                  FallNumber: {
                    include: {
                      FallNumber: {
                        select: {
                          Subject: {
                            where: {
                              Subject: {
                                OR: [
                                  {
                                    Course: {
                                      some: {
                                        courseId: watching_courseId
                                          ? watching_courseId
                                          : undefined,
                                      },
                                    },
                                  },
                                  {
                                    Subject: {
                                      OR: [
                                        {
                                          Course: {
                                            some: {
                                              courseId: watching_courseId
                                                ? watching_courseId
                                                : undefined,
                                            },
                                          },
                                        },
                                        {
                                          Subject: {
                                            OR: [
                                              {
                                                Course: {
                                                  some: {
                                                    courseId: watching_courseId
                                                      ? watching_courseId
                                                      : undefined,
                                                  },
                                                },
                                              },
                                              {
                                                Subject: {
                                                  OR: [
                                                    {
                                                      Course: {
                                                        some: {
                                                          courseId:
                                                            watching_courseId
                                                              ? watching_courseId
                                                              : undefined,
                                                        },
                                                      },
                                                    },
                                                    {
                                                      Subject: {
                                                        Course: {
                                                          some: {
                                                            courseId:
                                                              watching_courseId
                                                                ? watching_courseId
                                                                : undefined,
                                                          },
                                                        },
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            include: {
                              Subject: {
                                include: {
                                  Subject: {
                                    include: {
                                      Subject: {
                                        include: {
                                          Subject: true,
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  Questions: {
                    include: {
                      Option: {
                        include: {
                          RightOption: true,
                          Explaination: true,
                        },
                      },
                      Answers: {
                        where: {
                          attemptId: client.quizAttempt.attemptId,
                        },
                      },
                      UserReports: true,
                      UserFlags: {
                        where: {
                          removed: {
                            equals: null,
                          },
                        },
                      },
                      FallNumber: {
                        include: {
                          FallNumber: {
                            select: {
                              Subject: {
                                where: {
                                  Subject: {
                                    OR: [
                                      {
                                        Course: {
                                          some: {
                                            courseId: watching_courseId
                                              ? watching_courseId
                                              : undefined,
                                          },
                                        },
                                      },
                                      {
                                        Subject: {
                                          OR: [
                                            {
                                              Course: {
                                                some: {
                                                  courseId: watching_courseId
                                                    ? watching_courseId
                                                    : undefined,
                                                },
                                              },
                                            },
                                            {
                                              Subject: {
                                                OR: [
                                                  {
                                                    Course: {
                                                      some: {
                                                        courseId:
                                                          watching_courseId
                                                            ? watching_courseId
                                                            : undefined,
                                                      },
                                                    },
                                                  },
                                                  {
                                                    Subject: {
                                                      OR: [
                                                        {
                                                          Course: {
                                                            some: {
                                                              courseId:
                                                                watching_courseId
                                                                  ? watching_courseId
                                                                  : undefined,
                                                            },
                                                          },
                                                        },
                                                        {
                                                          Subject: {
                                                            Course: {
                                                              some: {
                                                                courseId:
                                                                  watching_courseId
                                                                    ? watching_courseId
                                                                    : undefined,
                                                              },
                                                            },
                                                          },
                                                        },
                                                      ],
                                                    },
                                                  },
                                                ],
                                              },
                                            },
                                          ],
                                        },
                                      },
                                    ],
                                  },
                                },
                                include: {
                                  Subject: {
                                    include: {
                                      Subject: {
                                        include: {
                                          Subject: {
                                            include: {
                                              Subject: true,
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      Explaination: true,
                    },
                  },
                  UserFlags: {
                    where: {
                      removed: {
                        equals: null,
                      },
                    },
                  },
                  UserReports: true,
                  Explaination: true,
                },
              },
            },
          },
        },
      });
    } else {
      attempt = await this.databaseService.userQuizAttempt.findFirst({
        where: {
          id: client.quizAttempt.attemptId,
        },
        include: {
          Quiz: {
            select: {
              Questions: {
                where: {
                  questionId: null,
                },
                include: {
                  Option: true,
                  Answers: {
                    where: {
                      attemptId: client.quizAttempt.attemptId,
                    },
                    orderBy: {
                      order: 'asc',
                    },
                  },
                  FallNumber: {
                    include: {
                      FallNumber: {
                        select: {
                          Subject: {
                            where: {
                              Subject: {
                                OR: [
                                  {
                                    Course: {
                                      some: {
                                        courseId: watching_courseId
                                          ? watching_courseId
                                          : undefined,
                                      },
                                    },
                                  },
                                  {
                                    Subject: {
                                      OR: [
                                        {
                                          Course: {
                                            some: {
                                              courseId: watching_courseId
                                                ? watching_courseId
                                                : undefined,
                                            },
                                          },
                                        },
                                        {
                                          Subject: {
                                            OR: [
                                              {
                                                Course: {
                                                  some: {
                                                    courseId: watching_courseId
                                                      ? watching_courseId
                                                      : undefined,
                                                  },
                                                },
                                              },
                                              {
                                                Subject: {
                                                  OR: [
                                                    {
                                                      Course: {
                                                        some: {
                                                          courseId:
                                                            watching_courseId
                                                              ? watching_courseId
                                                              : undefined,
                                                        },
                                                      },
                                                    },
                                                    {
                                                      Subject: {
                                                        Course: {
                                                          some: {
                                                            courseId:
                                                              watching_courseId
                                                                ? watching_courseId
                                                                : undefined,
                                                          },
                                                        },
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            include: {
                              Subject: {
                                include: {
                                  Subject: {
                                    include: {
                                      Subject: {
                                        include: {
                                          Subject: true,
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  Questions: {
                    include: {
                      Option: true,
                      Answers: {
                        where: {
                          attemptId: client.quizAttempt.attemptId,
                        },
                      },
                      UserReports: true,
                      UserFlags: {
                        where: {
                          removed: {
                            equals: null,
                          },
                        },
                      },
                      FallNumber: {
                        include: {
                          FallNumber: {
                            select: {
                              Subject: {
                                where: {
                                  Subject: {
                                    OR: [
                                      {
                                        Course: {
                                          some: {
                                            courseId: watching_courseId
                                              ? watching_courseId
                                              : undefined,
                                          },
                                        },
                                      },
                                      {
                                        Subject: {
                                          OR: [
                                            {
                                              Course: {
                                                some: {
                                                  courseId: watching_courseId
                                                    ? watching_courseId
                                                    : undefined,
                                                },
                                              },
                                            },
                                            {
                                              Subject: {
                                                OR: [
                                                  {
                                                    Course: {
                                                      some: {
                                                        courseId:
                                                          watching_courseId
                                                            ? watching_courseId
                                                            : undefined,
                                                      },
                                                    },
                                                  },
                                                  {
                                                    Subject: {
                                                      OR: [
                                                        {
                                                          Course: {
                                                            some: {
                                                              courseId:
                                                                watching_courseId
                                                                  ? watching_courseId
                                                                  : undefined,
                                                            },
                                                          },
                                                        },
                                                        {
                                                          Subject: {
                                                            Course: {
                                                              some: {
                                                                courseId:
                                                                  watching_courseId
                                                                    ? watching_courseId
                                                                    : undefined,
                                                              },
                                                            },
                                                          },
                                                        },
                                                      ],
                                                    },
                                                  },
                                                ],
                                              },
                                            },
                                          ],
                                        },
                                      },
                                    ],
                                  },
                                },
                                include: {
                                  Subject: {
                                    include: {
                                      Subject: {
                                        include: {
                                          Subject: {
                                            include: {
                                              Subject: true,
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  UserFlags: {
                    where: {
                      removed: {
                        equals: null,
                      },
                    },
                  },
                  UserReports: true,
                },
              },
            },
          },
        },
      });
    }

    if (!attempt) {
      return client.emit('give-quiz-questions-error', {
        message: 'Attempt not found',
      });
    }

    attempt.Quiz.Questions.sort((a, b) => {
      const orderA = a.Answers?.[0]?.order ?? Infinity;
      const orderB = b.Answers?.[0]?.order ?? Infinity;
      return orderA - orderB;
    });

    client.quizAttempt = {
      attemptId: 0,
      quizId: 0,
      questionStartTime: new Date(),
      questionId: 0,
      attemptStartTime: new Date(),
      hasSubmited: attempt.hasSubmitted,
    };

    client.quizAttempt.attemptId = attempt.id;
    client.quizAttempt.questionStartTime = new Date();
    client.quizAttempt.quizId = attempt.quizId;

    return client.emit('give-quiz-questions-success', attempt);
  }

  async watchQuizQuestion(client: CustomUserSocketClient, questionId: number) {
    const question = await this.databaseService.quizQuestion.findFirst({
      where: {
        id: questionId,
        OR: [
          {
            quizId: client.quizAttempt.quizId,
          },
          {
            Question: {
              quizId: client.quizAttempt.quizId,
            },
          },
        ],
      },
    });

    if (!question) {
      client.emit('watch-quiz-question-error', {
        message: 'Question does not belongs to this quiz',
      });
    }

    let answer = await this.databaseService.userQuizAnswer.findFirst({
      where: {
        attemptId: client.quizAttempt.attemptId,
        questionId: questionId,
      },
    });

    if (!answer) {
      answer = await this.databaseService.userQuizAnswer.create({
        data: {
          attemptId: client.quizAttempt.attemptId,
          questionId: questionId,
          timeTaken: 0,
        },
      });
    }
    if (
      client.quizAttempt.questionId &&
      !client.quizAttempt.hasSubmited &&
      !answer.hasSubmitted
    ) {
      const now = new Date();
      const attemptanswer = await this.databaseService.userQuizAnswer.findFirst(
        {
          where: {
            attemptId: client.quizAttempt.attemptId,
            questionId: client.quizAttempt.questionId,
          },
        },
      );
      if (!attemptanswer.optionId) {
        const questionTimeDiff = Math.floor(
          (now.getTime() - client.quizAttempt.questionStartTime.getTime()) /
            1000,
        );
        const attemptAnswer =
          await this.databaseService.userQuizAnswer.findFirst({
            where: {
              attemptId: client.quizAttempt.attemptId,
              questionId: client.quizAttempt.questionId,
            },
          });

        await this.databaseService.userQuizAnswer.update({
          where: {
            id: attemptAnswer.id,
          },
          data: {
            timeTaken: attemptAnswer.timeTaken + questionTimeDiff,
          },
        });
      }
    }

    client.quizAttempt.questionId = questionId;

    if (
      client.quizAttempt.questionId &&
      !client.quizAttempt.hasSubmited &&
      !answer.hasSubmitted
    ) {
      client.quizAttempt.questionStartTime = new Date();
    }

    return client.emit('watch-quiz-question-success', answer);
  }

  async addOptionQuizQuestion(
    client: CustomUserSocketClient,
    optionId: number,
  ) {
    const option = await this.databaseService.quizQuestionOption.findFirst({
      where: {
        id: optionId,
        questionId: client.quizAttempt.questionId,
      },
    });

    if (!option) {
      return client.emit('add-option-quiz-question-error', {
        message: 'Option does not belong to this question',
      });
    }

    let questionAttempt = await this.databaseService.userQuizAnswer.findFirst({
      where: {
        attemptId: client.quizAttempt.attemptId,
        questionId: client.quizAttempt.questionId,
      },
      include: {
        Attempt: true,
      },
    });

    if (!questionAttempt) {
      return client.emit('add-option-quiz-question-error', {
        message: 'Invalid request',
      });
    }

    if (questionAttempt.Attempt.hasSubmitted) {
      return client.emit('add-option-quiz-question-error', {
        message: 'Attempt already submitted',
      });
    }

    if (questionAttempt.hasSubmitted) {
      return client.emit('add-option-quiz-question-error', {
        message: 'Question already submitted',
      });
    }

    const now = new Date();
    const questionTimeDiff = Math.floor(
      (now.getTime() - client.quizAttempt.questionStartTime.getTime()) / 1000,
    );

    if (questionAttempt.optionId === optionId) {
      const updatedAnswer = await this.databaseService.userQuizAnswer.update({
        where: {
          id: questionAttempt.id,
        },
        data: {
          optionId: null,
          timeTaken: questionAttempt.timeTaken + questionTimeDiff,
        },
      });
      return client.emit('add-option-quiz-question-success', updatedAnswer);
    }

    const updatedAnswer = await this.databaseService.userQuizAnswer.update({
      where: {
        id: questionAttempt.id,
      },
      data: {
        optionId: optionId,
        timeTaken: questionAttempt.timeTaken + questionTimeDiff,
      },
    });
    return client.emit('add-option-quiz-question-success', updatedAnswer);
  }

  async getQuizQuestionExplaination(client: CustomUserSocketClient) {
    const questionId = client.quizAttempt.questionId;
    const userAnswer = await this.databaseService.userQuizAnswer.findFirst({
      where: {
        attemptId: client.quizAttempt.attemptId,
        questionId: questionId,
      },
      include: {
        Attempt: true,
      },
    });

    let question: any;
    let attempt = userAnswer.Attempt;

    if (attempt.hasSubmitted) {
      question = await this.databaseService.quizQuestion.findFirst({
        where: {
          id: questionId,
        },
        include: {
          Option: {
            include: {
              RightOption: true,
              Explaination: true,
            },
          },
          Explaination: true,
          Answers: {
            where: {
              attemptId: client.quizAttempt.attemptId,
            },
            select: {
              optionId: true,
              hasSubmitted: true,
            },
          },
        },
      });

      return client.emit('get-quiz-question-explaination-success', question);
    }

    question = await this.databaseService.quizQuestion.findFirst({
      where: {
        id: questionId,
      },
      include: {
        Question: true,
        Option: {
          include: {
            RightOption: true,
            Explaination: true,
          },
        },
        Explaination: true,
        Answers: {
          where: {
            attemptId: client.quizAttempt.attemptId,
          },
          select: {
            optionId: true,
            hasSubmitted: true,
          },
        },
      },
    });

    if (userAnswer.hasSubmitted) {
      return client.emit('get-quiz-question-explaination-success', question);
    }

    const now = new Date();
    const questionTimeDiff = Math.floor(
      (now.getTime() - client.quizAttempt.questionStartTime.getTime()) / 1000,
    );
    const watching_courseId: number = await this.cacheManager.get(
      `watching_course_${client.userId}_${client.platformId}`,
    );

    const needToUpadteTime =
      !userAnswer.hasSubmitted &&
      !userAnswer.Attempt.hasSubmitted &&
      client.quizAttempt.questionId;

    const updatedData = await this.databaseService.userQuizAnswer.update({
      where: {
        id: userAnswer.id,
      },

      include: {
        Question: {
          include: {
            Option: {
              include: {
                RightOption: true,
                Explaination: true,
              },
            },
            Answers: {
              where: {
                attemptId: client.quizAttempt.attemptId,
              },
            },
            FallNumber: {
              include: {
                FallNumber: {
                  select: {
                    Subject: {
                      where: {
                        Subject: {
                          OR: [
                            {
                              Course: {
                                some: {
                                  courseId: watching_courseId,
                                },
                              },
                            },
                            {
                              Subject: {
                                OR: [
                                  {
                                    Course: {
                                      some: {
                                        courseId: watching_courseId,
                                      },
                                    },
                                  },
                                  {
                                    Subject: {
                                      OR: [
                                        {
                                          Course: {
                                            some: {
                                              courseId: watching_courseId,
                                            },
                                          },
                                        },
                                        {
                                          Subject: {
                                            OR: [
                                              {
                                                Course: {
                                                  some: {
                                                    courseId: watching_courseId,
                                                  },
                                                },
                                              },
                                              {
                                                Subject: {
                                                  Course: {
                                                    some: {
                                                      courseId:
                                                        watching_courseId,
                                                    },
                                                  },
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      include: {
                        Subject: {
                          include: {
                            Subject: {
                              include: {
                                Subject: {
                                  include: {
                                    Subject: true,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            Questions: {
              include: {
                Option: true,
                Answers: {
                  where: {
                    attemptId: client.quizAttempt.attemptId,
                  },
                },
                UserReports: true,
                UserFlags: {
                  where: {
                    removed: {
                      equals: null,
                    },
                  },
                },
              },
            },
            UserFlags: {
              where: {
                removed: {
                  equals: null,
                },
              },
            },
            UserReports: true,
          },
        },
      },
      data: {
        // hasSubmitted: true,
        timeTaken: needToUpadteTime
          ? userAnswer.timeTaken + questionTimeDiff
          : userAnswer.timeTaken,
      },
    });
    return client.emit(
      'get-quiz-question-explaination-success',
      updatedData.Question,
    );
  }

  async submitQuizAttempt(client: CustomUserSocketClient) {
    const attempt = await this.databaseService.userQuizAttempt.findFirst({
      where: {
        id: client.quizAttempt.attemptId,
      },
    });
    if (!attempt) {
      return client.emit('submit-quiz-attempt-error', {
        message: 'Attempt not found',
      });
    }
    if (attempt.hasSubmitted) {
      return client.emit('submit-quiz-attempt-error', {
        message: 'Attempt already submitted',
      });
    }
    const now = new Date();
    const timeDiff = Math.floor(
      (now.getTime() - client.quizAttempt.attemptStartTime.getTime()) / 1000,
    );
    await this.databaseService.userQuizAttempt.update({
      where: {
        id: client.quizAttempt.attemptId,
      },
      data: {
        timeTaken: attempt.timeTaken + timeDiff,
        hasSubmitted: true,
      },
    });
    client.quizAttempt = null;
    return client.emit('submit-quiz-attempt-success', {
      message: 'Attempt submitted',
    });
  }

  async reportUserCheating(client: CustomUserSocketClient, offense: string) {
    if (!client.quizAttempt || !client.quizAttempt.attemptId) {
      return client.emit('quiz-user-cheating-error', {
        message: 'No quiz attempt found',
      });
    }
    if (!client.quizAttempt.questionId) {
      return client.emit('quiz-user-cheating-error', {
        message: 'You are not watching any question',
      });
    }
    const report = await this.databaseService.quizUserCheating.create({
      data: {
        userId: client.userId,
        attemptId: client.quizAttempt.attemptId,
        questionId: client.quizAttempt.questionId,
        offense: offense,
      },
    });

    client.emit('quiz-user-cheating-success', {
      message: 'Cheating reported successfully',
      report: report,
    });
  }

  async flagQuestion(userid: number, addQuizFlagDto: AddQuizFlagDto) {
    const exists = await this.databaseService.userQuizQuestionFlag.findFirst({
      where: {
        userId: userid,
        questionId: addQuizFlagDto.questionId,
        removed: null,
      },
    });

    if (!exists) {
      const flag = await this.databaseService.userQuizQuestionFlag.create({
        data: {
          userId: userid,
          questionId: addQuizFlagDto.questionId,
        },
      });

      return flag;
    }

    const updatedFlag = await this.databaseService.userQuizQuestionFlag.update({
      where: {
        id: exists.id,
      },
      data: {
        flagText: addQuizFlagDto.flagText,
      },
    });

    if (addQuizFlagDto.remove) {
      await this.databaseService.userQuizQuestionFlag.update({
        where: {
          id: exists.id,
        },
        data: {
          removed: true,
        },
      });
    }
    return updatedFlag;
  }

  async reportQuestion(userid: number, addQuizReportDto: AddQuizReportDto) {
    const exists = await this.databaseService.quizQuestionReport.findFirst({
      where: {
        userId: userid,
        questionId: addQuizReportDto.questionId,
      },
    });
    if (exists) {
      throw new BadRequestException('Question Already reported');
    }

    const tags = JSON.stringify(addQuizReportDto.reportTag);
    const report = await this.databaseService.quizQuestionReport.create({
      data: {
        userId: userid,
        questionId: addQuizReportDto.questionId,
        reason: addQuizReportDto.report,
        tag: tags,
      },
    });
    return report;
  }

  async addQuizQuestionDifficulty(
    client: CustomUserSocketClient,
    addQuizQuestionDifficultyDto: AddQuizQuestionDifficultyDto,
  ) {
    const canUseQuiz = await this.canUseQuiz(client.platformId);
    if (!canUseQuiz) {
      return client.emit('add-quiz-question-difficulty-error', {
        message: 'Quiz is not allowed on this platform',
      });
    }
    let difficulty = 0;
    if (addQuizQuestionDifficultyDto.difficulty === 'easy') {
      difficulty = 1;
    }
    if (addQuizQuestionDifficultyDto.difficulty === 'medium') {
      difficulty = 5;
    }
    if (addQuizQuestionDifficultyDto.difficulty === 'hard') {
      difficulty = 10;
    }

    const userAnswer = await this.databaseService.userQuizAnswer.findFirst({
      where: {
        questionId: client.quizAttempt.questionId,
        attemptId: client.quizAttempt.attemptId,
      },
    });

    if (client.quizAttempt?.questionId) {
      const attempt = await this.databaseService.userQuizAnswer.update({
        where: {
          id: userAnswer.id,
        },
        data: {
          difficulty: difficulty,
        },
      });
      return client.emit('add-quiz-question-difficulty-success', attempt);
    } else {
      return client.emit('add-quiz-question-difficulty-error', {
        message: 'Question not found in attempt',
      });
    }
  }

  async getAttemptWithAnswers(
    userId: number,
    getQuizAnswersDto: GetQuizAnswersDto,
    platformId: number,
  ) {
    const watching_courseId: number = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    const attempt = await this.databaseService.userQuizAttempt.findFirst({
      where: {
        id: getQuizAnswersDto.attemptId,
        userId: userId,
        hasSubmitted: true,
      },
      include: {
        Quiz: {
          include: {
            Questions: {
              where: {
                questionId: null,
              },
              include: {
                FallNumber: {
                  select: {
                    FallNumber: {
                      select: {
                        Subject: {
                          where: {
                            Subject: {
                              OR: [
                                {
                                  Course: {
                                    some: {
                                      courseId: watching_courseId,
                                    },
                                  },
                                },
                                {
                                  Subject: {
                                    OR: [
                                      {
                                        Course: {
                                          some: {
                                            courseId: watching_courseId,
                                          },
                                        },
                                      },
                                      {
                                        Subject: {
                                          OR: [
                                            {
                                              Course: {
                                                some: {
                                                  courseId: watching_courseId,
                                                },
                                              },
                                            },
                                            {
                                              Subject: {
                                                OR: [
                                                  {
                                                    Course: {
                                                      some: {
                                                        courseId:
                                                          watching_courseId,
                                                      },
                                                    },
                                                  },
                                                  {
                                                    Subject: {
                                                      Course: {
                                                        some: {
                                                          courseId:
                                                            watching_courseId,
                                                        },
                                                      },
                                                    },
                                                  },
                                                ],
                                              },
                                            },
                                          ],
                                        },
                                      },
                                    ],
                                  },
                                },
                              ],
                            },
                          },
                          include: {
                            Subject: {
                              include: {
                                Subject: {
                                  include: {
                                    Subject: {
                                      include: {
                                        Subject: true,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                Option: {
                  include: {
                    RightOption: true,
                    Explaination: true,
                  },
                },
                UserFlags: true,
                UserReports: true,
                Answers: {
                  where: {
                    attemptId: getQuizAnswersDto.attemptId,
                  },
                },
                Questions: {
                  include: {
                    FallNumber: {
                      select: {
                        FallNumber: {
                          select: {
                            Subject: {
                              where: {
                                Subject: {
                                  OR: [
                                    {
                                      Course: {
                                        some: {
                                          courseId: watching_courseId,
                                        },
                                      },
                                    },
                                    {
                                      Subject: {
                                        OR: [
                                          {
                                            Course: {
                                              some: {
                                                courseId: watching_courseId,
                                              },
                                            },
                                          },
                                          {
                                            Subject: {
                                              OR: [
                                                {
                                                  Course: {
                                                    some: {
                                                      courseId:
                                                        watching_courseId,
                                                    },
                                                  },
                                                },
                                                {
                                                  Subject: {
                                                    OR: [
                                                      {
                                                        Course: {
                                                          some: {
                                                            courseId:
                                                              watching_courseId,
                                                          },
                                                        },
                                                      },
                                                      {
                                                        Subject: {
                                                          Course: {
                                                            some: {
                                                              courseId:
                                                                watching_courseId,
                                                            },
                                                          },
                                                        },
                                                      },
                                                    ],
                                                  },
                                                },
                                              ],
                                            },
                                          },
                                        ],
                                      },
                                    },
                                  ],
                                },
                              },
                              include: {
                                Subject: {
                                  include: {
                                    Subject: {
                                      include: {
                                        Subject: {
                                          include: {
                                            Subject: true,
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    UserFlags: true,
                    UserReports: true,
                    Option: {
                      include: {
                        RightOption: true,
                        Explaination: true,
                      },
                    },
                    Answers: {
                      where: {
                        attemptId: getQuizAnswersDto.attemptId,
                      },
                    },
                    Explaination: true,
                  },
                },
                Explaination: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) return null;

    attempt.Quiz.Questions.sort((a, b) => {
      const orderA = a.Answers?.[0]?.order ?? Infinity;
      const orderB = b.Answers?.[0]?.order ?? Infinity;
      return orderA - orderB;
    });

    return attempt;
  }

  async getUserQuizStats(userId: number) {
    // let courseId: number | null = null;
    // let courseIds: number[] = [];
    // if (userId) {
    //   const watching_courseId = await this.cacheManager.get(
    //     `watching_course_${userId}_${platformId}`,
    //   );
    //   if (watching_courseId) {
    //     courseId = Number(watching_courseId);
    //   }
    // }
    // if (courseId) {
    //   courseIds = await this.getCourseIdArray(courseId, userId);
    // }
    // let allQuizes = 0;
    // let completedQuizes = 0;
    // let inProgressQuizes = 0;
    // let averageScore = 0;
    // const quizes = await this.databaseService.quiz.findMany({
    //   where: {
    //     isActive: null,
    //     OR: [
    //       {
    //         CourseNdPlatform: {
    //           some: {
    //             courseId: {
    //               in: courseIds,
    //             },
    //           },
    //         },
    //       },
    //       {
    //         CourseNdPlatform: {
    //           some: {
    //             courseId: null,
    //           },
    //         },
    //       },
    //     ],
    //     CourseNdPlatform: {
    //       some: {
    //         platformId: platformId,
    //       },
    //     },
    //   },
    //   include: {
    //     Questions: {
    //       include: {
    //         Option: {
    //           include: {
    //             RightOption: true,
    //           },
    //         },
    //       },
    //     },
    //     Attempts: {
    //       where: {
    //         userId: userId,
    //       },
    //     },
    //   },
    // });
    // for (let i = 0; i < quizes.length; i++) {
    //   for (let j = 0; j < quizes[i].Attempts.length; j++) {
    //     const currentAttempt = quizes[i].Attempts[j];
    //     if (currentAttempt) {
    //       const attempt = await this.databaseService.userQuizAttempt.findFirst({
    //         where: {
    //           id: currentAttempt.id,
    //         },
    //         include: {
    //           Quiz: {
    //             include: {
    //               Questions: {
    //                 include: {
    //                   Option: {
    //                     include: {
    //                       RightOption: true,
    //                     },
    //                   },
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       });
    //       if (attempt.hasSubmitted) {
    //         completedQuizes++;
    //         for (let k = 0; k < attempt.Quiz.Questions.length; k++) {
    //           for (
    //             let l = 0;
    //             l < attempt.Quiz.Questions[k].Option.length;
    //             l++
    //           ) {
    //             if (attempt.Quiz.Questions[k].Option[l].RightOption) {
    //               allQuizes++;
    //               averageScore += attempt.Quiz.Questions[k].Option[l].score;
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    // }
  }

  async handleStartingQuizes() {
    const now = new Date();
    now.setMilliseconds(0); // Set milliseconds to 0 for consistency
    // console.log('Handling starting quizes... ', now);
    const fiveSecondsAgo = new Date(now.getTime() - 5000);
    const startingQuizes = await this.databaseService.quiz.findMany({
      where: {
        startTime: {
          gte: fiveSecondsAgo,
          lte: now,
        },
      },
    });

    // console.log('Starting quizes:', startingQuizes);

    for (const quiz of startingQuizes) {
      // console.log('Starting quiz:', quiz.id, 'at', now.toISOString());

      const waitingRoom = `waitingroom_quiz_${quiz.id}`;
      const quizRoom = `quizroom_quiz_${quiz.id}`;

      const waitingRoomSockets = await this.findSockets(waitingRoom);
      // console.log(
      //   waitingRoomSockets?.map((socket: any) => ({
      //     data: socket.data,
      //   })),
      // );

      // console.log('sent notification to waiting room', waitingRoom);

      this.notificationService.sendNotification(
        '/user',
        waitingRoom,
        'quiz-start',
        { quizId: quiz.id },
      );

      this.notificationService.server
        .of('/user')
        .in(waitingRoom)
        .socketsJoin(quizRoom);
      this.notificationService.server.of('/user').socketsLeave(waitingRoom);

      // console.log('sent notification to waiting room', waitingRoom);
    }
  }

  async handleEndingQuizes() {
    const now = new Date(); // Set milliseconds to 0 for consistency
    now.setMilliseconds(0);
    // console.log('Handling ending quizes... : ', now);
    const fiveSecondsAfter = new Date(now.getTime() + 5000); // 5 seconds before now

    // find quiz which has ended
    const endingQuizes = await this.databaseService.quiz.findMany({
      where: {
        endTime: {
          lte: fiveSecondsAfter,
          gte: now,
        },
      },
    });

    // console.log('Starting quizes:', endingQuizes);

    for (const quiz of endingQuizes) {
      // console.log('Ending quiz:', quiz.id, 'at', now.toISOString());
      const quizRoom = `quizroom_quiz_${quiz.id}`;

      const waitingRoomSockets = await this.findSockets(
        `waitingroom_quiz_${quiz.id}`,
      );
      const quizRoomSockets = await this.findSockets(quizRoom);
      // console.log(
      //   quizRoomSockets?.map((socket: any) => ({
      //     data: socket.data,
      //   })),
      // );

      this.notificationService.sendNotification('/user', quizRoom, 'quiz-end', {
        quizId: quiz.id,
      });
      // console.log('Quiz ended:', quiz.id);

      await this.databaseService.userQuizAttempt.updateMany({
        where: {
          quizId: quiz.id,
        },
        data: {
          hasSubmitted: true,
        },
      });
    }
  }

  async handleDurationQuizes(client: CustomUserSocketClient) {
    const userAttempt = await this.databaseService.userQuizAttempt.findFirst({
      where: {
        id: client.quizAttempt.attemptId,
      },
      include: {
        Quiz: true,
      },
    });

    if (!userAttempt) {
      return;
    }

    const timeTaken = userAttempt.timeTaken;
    const quizDuration = userAttempt.Quiz.duration;

    const timeLeft = quizDuration - timeTaken;

    this.submitAfterDelay(client, timeTaken, timeLeft);
  }

  async submitAfterDelay(
    client: CustomUserSocketClient,
    timeTaken: number,
    time: number,
  ) {
    await this.delay(time * 1000);
    if (client?.quizAttempt) {
      if (client?.quizAttempt?.attemptId) {
        const attempt = await this.databaseService.userQuizAttempt.update({
          where: {
            id: client.quizAttempt.attemptId,
          },
          include: {
            Quiz: true,
          },
          data: {
            hasSubmitted: true,
            timeTaken: timeTaken + time,
          },
        });
        client.emit('quiz-end', { quiz: attempt.Quiz });
      }
    }
    return;
  }

  async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // for adding questions
  async addQuiz(addQuizQuestionDto: AddQuizQuestionDto) {
    let itemsetQuizId: number = 0;

    let difficultynumber = 0;
    if (addQuizQuestionDto.difficulty === 'Easy') {
      difficultynumber = 1;
    }
    if (addQuizQuestionDto.difficulty === 'Standard') {
      difficultynumber = 5;
    }
    if (addQuizQuestionDto.difficulty === 'Challenging') {
      difficultynumber = 10;
    }
    const quiz = await this.databaseService.quiz.findFirst({
      where: {
        name: addQuizQuestionDto.name,
      },
    });
    if (!quiz) {
      throw new BadRequestException('Quiz not found');
    }
    const fallnum = await this.databaseService.fallNumber.findFirst({
      where: {
        number: addQuizQuestionDto.fallnum,
      },
    });
    if (
      addQuizQuestionDto.itemsetCode &&
      addQuizQuestionDto.itemsetQuestion !== '-'
    ) {
      let itemset = await this.databaseService.quizQuestion.findFirst({
        where: {
          questionCode: addQuizQuestionDto.itemsetCode,
        },
      });
      if (!itemset) {
        itemset = await this.databaseService.quizQuestion.create({
          data: {
            question: addQuizQuestionDto.itemsetQuestion,
            questionCode: addQuizQuestionDto.itemsetCode,
            quizId: quiz.id,
          },
        });
      }
      itemsetQuizId = itemset.id;
    }
    const question = await this.databaseService.quizQuestion.create({
      data: {
        question: addQuizQuestionDto.question,
        difficulty: difficultynumber,
        attribute: addQuizQuestionDto.attribute,
        quizId: itemsetQuizId ? undefined : quiz.id,
        questionId: itemsetQuizId ? itemsetQuizId : undefined,
        questionCode: addQuizQuestionDto.questionCode,
        FallNumber: {
          create: {
            fallNumberId: fallnum.id,
          },
        },
      },
    });
    if (addQuizQuestionDto.explanation) {
      const explaination =
        await this.databaseService.quizQuestionExplaination.create({
          data: {
            questionId: question.id,
            text: addQuizQuestionDto.explanation,
          },
        });
    }

    if (addQuizQuestionDto.optiona) {
      const optiona = await this.databaseService.quizQuestionOption.create({
        data: {
          answer: addQuizQuestionDto.optiona,
          questionId: question.id,
        },
      });
      if (addQuizQuestionDto.correctoption === 'A') {
        await this.databaseService.quizRightOption.create({
          data: {
            optionId: optiona.id,
          },
        });
      }
      if (addQuizQuestionDto.optionareason) {
        await this.databaseService.quizOptionExplaination.create({
          data: {
            text: addQuizQuestionDto.optionareason,
            optionId: optiona.id,
          },
        });
      }
    }
    if (addQuizQuestionDto.optionb) {
      const optionb = await this.databaseService.quizQuestionOption.create({
        data: {
          answer: addQuizQuestionDto.optionb,
          questionId: question.id,
        },
      });
      if (addQuizQuestionDto.correctoption === 'B') {
        await this.databaseService.quizRightOption.create({
          data: {
            optionId: optionb.id,
          },
        });
      }
      if (addQuizQuestionDto.optionbreason) {
        await this.databaseService.quizOptionExplaination.create({
          data: {
            text: addQuizQuestionDto.optionbreason,
            optionId: optionb.id,
          },
        });
      }
    }
    if (addQuizQuestionDto.optionc) {
      const optionc = await this.databaseService.quizQuestionOption.create({
        data: {
          answer: addQuizQuestionDto.optionc,
          questionId: question.id,
        },
      });
      if (addQuizQuestionDto.correctoption === 'C') {
        await this.databaseService.quizRightOption.create({
          data: {
            optionId: optionc.id,
          },
        });
      }
      if (addQuizQuestionDto.optioncreason) {
        await this.databaseService.quizOptionExplaination.create({
          data: {
            text: addQuizQuestionDto.optioncreason,
            optionId: optionc.id,
          },
        });
      }
    }
    if (addQuizQuestionDto.optiond) {
      const optiond = await this.databaseService.quizQuestionOption.create({
        data: {
          answer: addQuizQuestionDto.optiond,
          questionId: question.id,
        },
      });
      if (addQuizQuestionDto.correctoption === 'D') {
        await this.databaseService.quizRightOption.create({
          data: {
            optionId: optiond.id,
          },
        });
      }
      if (addQuizQuestionDto.optiondreason) {
        await this.databaseService.quizOptionExplaination.create({
          data: {
            text: addQuizQuestionDto.optiondreason,
            optionId: optiond.id,
          },
        });
      }
    }
    if (addQuizQuestionDto.optione) {
      const optione = await this.databaseService.quizQuestionOption.create({
        data: {
          answer: addQuizQuestionDto.optione,
          questionId: question.id,
        },
      });
      if (addQuizQuestionDto.correctoption === 'E') {
        await this.databaseService.quizRightOption.create({
          data: {
            optionId: optione.id,
          },
        });
      }
      if (addQuizQuestionDto.optionereason) {
        await this.databaseService.quizOptionExplaination.create({
          data: {
            text: addQuizQuestionDto.optionereason,
            optionId: optione.id,
          },
        });
      }
    }
    return question;
  }

  async resultAnalysis(resultAnalysisDto: ResultAnalysisDto) {}

  // for testing only
  async findSockets(room: string) {
    const sockets = await this.notificationService.server
      .of('/user')
      .in(room)
      .fetchSockets();

    console.log(
      sockets?.map((socket: any) => ({
        data: socket.client.sockets,
      })),
    );

    return sockets?.map((socket: any) => ({
      data: socket.client.sockets,
    }));
  }

  // new for create quiz
  async createQuiz(createQuizDto: CreateQuizDto) {
    return await this.databaseService.quiz.create({
      data: createQuizDto,
    });
  }

  // new for QuizToPlatformNdCourse

  // async quizToPlatForm(platFormId, quizLinkCourseDto: QuizLinkCourseDto){
  //   return await this.databaseService.quizToPlatformNdCourse.findFirst({
  //     const platformId = await this.databaseService.quizLinkCourseDto.findFirst({
  //     where: {
  //       platformId: platformId
  //     },
  //   })
  //   })
  // }
}

// if (quizAttemptStartDto.quizId && !quizAttemptStartDto.attemptId) {
//   quiz = await this.databaseService.quiz.findFirst({
//     where: {
//       id: quizAttemptStartDto.quizId,
//       OR: [
//         {
//           CourseNdPlatform: {
//             some: {
//               platformId: client.platformId,
//             },
//           },
//           OR: [
//             {
//               CourseNdPlatform: {
//                 some: {
//                   courseId: courseId,
//                 },
//               },
//             },
//             {
//               CourseNdPlatform: {
//                 some: {
//                   courseId: null,
//                 },
//               },
//             },
//             {},
//           ],
//         },
//         {
//           Quiz: {
//             CourseNdPlatform: {
//               some: {
//                 platformId: client.platformId,
//               },
//             },
//             OR: [
//               {
//                 CourseNdPlatform: {
//                   some: {
//                     courseId: courseId,
//                   },
//                 },
//               },
//               {
//                 CourseNdPlatform: {
//                   some: {
//                     courseId: null,
//                   },
//                 },
//               },
//             ],
//           },
//         },
//       ],
//     },
//     include: {
//       Questions: true,
//       _count: {
//         select: {
//           Attempts: {
//             where: {
//               userId: client.userId,
//             },
//           },
//         },
//       },
//     },
//   });
// } else if (quizAttemptStartDto.slug) {
//   quiz = await this.databaseService.quiz.findFirst({
//     where: {
//       OR: [
//         {
//           CourseNdPlatform: {
//             some: {
//               slug: quizAttemptStartDto.slug,
//             },
//           },
//           OR: [
//             {
//               CourseNdPlatform: {
//                 some: {
//                   courseId: courseId,
//                 },
//               },
//             },
//             {
//               CourseNdPlatform: {
//                 some: {
//                   courseId: null,
//                 },
//               },
//             },
//             {},
//           ],
//         },
//         {
//           Quiz: {
//             CourseNdPlatform: {
//               some: {
//                 platformId: client.platformId,
//               },
//             },
//             OR: [
//               {
//                 CourseNdPlatform: {
//                   some: {
//                     courseId: courseId,
//                   },
//                 },
//               },
//               {
//                 CourseNdPlatform: {
//                   some: {
//                     courseId: null,
//                   },
//                 },
//               },
//             ],
//           },
//         },
//       ],
//     },
//     include: {
//       Questions: true,
//       _count: {
//         select: {
//           Attempts: {
//             where: {
//               userId: client.userId,
//             },
//           },
//         },
//       },
//     },
//   });
// } else if (quizAttemptStartDto.attemptId) {
//   quizAttempt = await this.databaseService.userQuizAttempt.findFirst({
//     where: {
//       id: quizAttemptStartDto.attemptId,
//     },
//     include: {
//       Quiz: {
//         include: {
//           Questions: true,
//           _count: {
//             select: {
//               Attempts: {
//                 where: {
//                   userId: client.userId,
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//     orderBy: {
//       updatedAt: 'desc',
//     },
//   });
//   quiz = quizAttempt.Quiz;
// } else {
//   return client.emit('make-quiz-attempt-error', {
//     message: 'Quiz or attempt not found',
//   });
// }
