import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { GetSubjectDto } from './dto/get-subject.dto';
import { PracticeAttemptCreateDto } from './dto/practice-attempt-create.dto';
import { CustomUserSocketClient } from 'src/common/interface/custom-socket-user-client.interface';
import { GetPracticeStatDto } from './dto/get-practice-stat.dto';
import { AddPracticeQuestionDto } from './dto/add-practice-questions.dto';
import { Prisma } from '@prisma/client';
import { GetPracticeAttemptDto } from './dto/get-practice-attempt.dto';
import { GetPracticeDto } from './dto/get-practice.dto';
import { AddPracticeFlagDto } from './dto/add-practice-flag.dto';
import { AddPracticeReportDto } from './dto/add-practice-report.dto';
import { AddQuestionDifficultyDto } from './dto/add-question-difficulty.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GetSubjectResultDto } from './dto/get-subject-result.dto';

@Injectable()
export class PracticeService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async subjectResult(
    userId: number,
    getSubjectResultDto: GetSubjectResultDto,
    platformId: number,
  ) {
    const watching_courseId = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    return this.databaseService.practiceQuestion.findMany({
      where: {
        AND: [
          {
            ...((getSubjectResultDto.isFlagged ||
              getSubjectResultDto.isIncorrect ||
              getSubjectResultDto.isUnattempted) && {
              OR: [
                {
                  ...(getSubjectResultDto.isFlagged && {
                    UserFlag: {
                      some: {
                        userId: userId,
                        removed: null,
                      },
                    },
                  }),
                },
                {
                  ...(getSubjectResultDto.isUnattempted && {
                    Attempt: {
                      none: {
                        optionId: {
                          not: null,
                        },
                        Attempt: {
                          userId: userId,
                        },
                      },
                    },
                  }),
                },
                {
                  ...(getSubjectResultDto.isIncorrect && {
                    Attempt: {
                      some: {
                        Attempt: {
                          userId: userId,
                        },
                        Option: {
                          RightOption: {
                            is: null,
                          },
                        },
                      },
                    },
                  }),
                },
              ],
            }),
          },
          {
            ...((getSubjectResultDto.includeEasy ||
              getSubjectResultDto.includeMedium ||
              getSubjectResultDto.includeHard) && {
              OR: [
                {
                  ...(getSubjectResultDto.includeEasy && {
                    difficulty: {
                      lte: 3,
                    },
                  }),
                },
                {
                  ...(getSubjectResultDto.includeMedium && {
                    difficulty: {
                      gte: 4,
                      lte: 7,
                    },
                  }),
                },
                {
                  ...(getSubjectResultDto.includeHard && {
                    difficulty: {
                      gte: 8,
                    },
                  }),
                },
              ],
            }),
          },
        ],
        FallNumber: {
          some: {
            FallNumber: {
              Course: {
                some: {
                  courseId: watching_courseId,
                },
              },
              Subject: {
                some: {
                  Subject: {
                    OR: [
                      {
                        id: {
                          in: getSubjectResultDto.subjectIds,
                        },
                      },
                      {
                        Subject: {
                          OR: [
                            {
                              id: {
                                in: getSubjectResultDto.subjectIds,
                              },
                            },
                            {
                              Subject: {
                                OR: [
                                  {
                                    id: {
                                      in: getSubjectResultDto.subjectIds,
                                    },
                                  },
                                  {
                                    Subject: {
                                      id: {
                                        in: getSubjectResultDto.subjectIds,
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
              },
            },
          },
        },
      },
      include: {
        Option: {
          include: {
            RightOption: true,
            UserAnswer: {
              where: {
                Attempt: {
                  userId: userId,
                },
              },
              take: 1,
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    });
  }

  async canUsePractice(platformId: number) {
    const canUsePractice = await this.databaseService.platformOptions.findFirst(
      {
        where: {
          platformId: platformId,
          key: 'canUsePractice',
        },
      },
    );
    if (canUsePractice) {
      return true;
    }
    return false;
  }

  async viewAnswers(
    practiceAttemptCreateDto: PracticeAttemptCreateDto,
    userId: number,
    platformId: number,
  ) {
    const watching_courseId = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );

    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    return this.databaseService.practiceQuestion.findMany({
      where: {
        FallNumber: {
          some: {
            FallNumber: {
              Course: {
                some: {
                  courseId: watching_courseId,
                },
              },
              Subject: {
                some: {
                  Subject: {
                    OR: [
                      {
                        id: {
                          in: practiceAttemptCreateDto.subjectIds,
                        },
                      },
                      {
                        Subject: {
                          OR: [
                            {
                              id: {
                                in: practiceAttemptCreateDto.subjectIds,
                              },
                            },
                            {
                              Subject: {
                                OR: [
                                  {
                                    id: {
                                      in: practiceAttemptCreateDto.subjectIds,
                                    },
                                  },
                                  {
                                    Subject: {
                                      id: {
                                        in: practiceAttemptCreateDto.subjectIds,
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
              },
            },
          },
        },
        AND: [
          {
            ...((practiceAttemptCreateDto.isFlagged ||
              practiceAttemptCreateDto.isIncorrect ||
              practiceAttemptCreateDto.isUnattempted) && {
              OR: [
                {
                  ...(practiceAttemptCreateDto.isFlagged && {
                    UserFlag: {
                      some: {
                        userId: userId,
                        removed: null,
                      },
                    },
                  }),
                },
                {
                  ...(practiceAttemptCreateDto.isUnattempted && {
                    Attempt: {
                      none: {
                        optionId: {
                          not: null,
                        },
                        Attempt: {
                          userId: userId,
                        },
                      },
                    },
                  }),
                },
                {
                  ...(practiceAttemptCreateDto.isIncorrect && {
                    Attempt: {
                      some: {
                        Attempt: {
                          userId: userId,
                        },
                        Option: {
                          RightOption: {
                            is: null,
                          },
                        },
                      },
                    },
                  }),
                },
              ],
            }),
          },
          {
            ...((practiceAttemptCreateDto.includeEasy ||
              practiceAttemptCreateDto.includeMedium ||
              practiceAttemptCreateDto.includeHard) && {
              OR: [
                {
                  ...(practiceAttemptCreateDto.includeEasy && {
                    difficulty: {
                      lte: 3,
                    },
                  }),
                },
                {
                  ...(practiceAttemptCreateDto.includeMedium && {
                    difficulty: {
                      gte: 4,
                      lte: 7,
                    },
                  }),
                },
                {
                  ...(practiceAttemptCreateDto.includeHard && {
                    difficulty: {
                      gte: 8,
                    },
                  }),
                },
              ],
            }),
          },
        ],
      },
      include: {
        Explaination: true,
        Attempt: {
          where: {
            Attempt: {
              userId: userId,
            },
          },
        },
        UserFlag: {
          where: {
            userId: userId,
            removed: {
              not: true,
            },
          },
        },
        Report: {
          where: {
            userId: userId,
          },
          select: {
            questionId: true,
          },
        },
        Question: {
          include: {
            Report: {
              where: {
                userId: userId,
              },
              select: {
                questionId: true,
              },
            },
            UserFlag: {
              where: {
                userId: userId,
                removed: {
                  not: true,
                },
              },
            },
            Option: true,
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
          },
        },
        Option: {
          include: {
            RightOption: true,
            Explaination: true,
          },
        },
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
                                                courseId: watching_courseId,
                                              },
                                            },
                                          },
                                          {
                                            Subject: {
                                              Course: {
                                                some: {
                                                  courseId: watching_courseId,
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
    });
  }

  async reportQuestion(
    userid: number,
    addPracticeReportDto: AddPracticeReportDto,
  ) {
    const tags = JSON.stringify(addPracticeReportDto.reportTag);
    const report = await this.databaseService.practiceQuestionReport.create({
      data: {
        userId: userid,
        questionId: addPracticeReportDto.questionId,
        reason: addPracticeReportDto.report,
        tag: tags,
      },
    });
    return report;
  }

  async updateQuestion(addPracticeQuestionDto: AddPracticeQuestionDto) {
    const question = await this.databaseService.practiceQuestion.findFirst({
      where: {
        question: addPracticeQuestionDto.question,
      },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    if (addPracticeQuestionDto.optiona) {
      const optiona = await this.databaseService.practiceOption.create({
        data: {
          answer: addPracticeQuestionDto.optiona,
          questionId: question.id,
        },
      });
      if (addPracticeQuestionDto.correctoption === 'A') {
        await this.databaseService.practiceRightOption.create({
          data: {
            optionId: optiona.id,
          },
        });
      }
      if (addPracticeQuestionDto.optionareason) {
        await this.databaseService.practiceOptionExplaination.create({
          data: {
            text: addPracticeQuestionDto.optionareason,
            optionId: optiona.id,
          },
        });
      }
    }
    if (addPracticeQuestionDto.optionb) {
      const optionb = await this.databaseService.practiceOption.create({
        data: {
          answer: addPracticeQuestionDto.optionb,
          questionId: question.id,
        },
      });
      if (addPracticeQuestionDto.correctoption === 'B') {
        await this.databaseService.practiceRightOption.create({
          data: {
            optionId: optionb.id,
          },
        });
      }
      if (addPracticeQuestionDto.optionbreason) {
        await this.databaseService.practiceOptionExplaination.create({
          data: {
            text: addPracticeQuestionDto.optionbreason,
            optionId: optionb.id,
          },
        });
      }
    }
    if (addPracticeQuestionDto.optionc) {
      const optionc = await this.databaseService.practiceOption.create({
        data: {
          answer: addPracticeQuestionDto.optionc,
          questionId: question.id,
        },
      });
      if (addPracticeQuestionDto.correctoption === 'C') {
        await this.databaseService.practiceRightOption.create({
          data: {
            optionId: optionc.id,
          },
        });
      }
      if (addPracticeQuestionDto.optioncreason) {
        await this.databaseService.practiceOptionExplaination.create({
          data: {
            text: addPracticeQuestionDto.optioncreason,
            optionId: optionc.id,
          },
        });
      }
    }
    if (addPracticeQuestionDto.optiond) {
      const optiond = await this.databaseService.practiceOption.create({
        data: {
          answer: addPracticeQuestionDto.optiond,
          questionId: question.id,
        },
      });
      if (addPracticeQuestionDto.correctoption === 'D') {
        await this.databaseService.practiceRightOption.create({
          data: {
            optionId: optiond.id,
          },
        });
      }
      if (addPracticeQuestionDto.optiondreason) {
        await this.databaseService.practiceOptionExplaination.create({
          data: {
            text: addPracticeQuestionDto.optiondreason,
            optionId: optiond.id,
          },
        });
      }
    }
    if (addPracticeQuestionDto.optione) {
      const optione = await this.databaseService.practiceOption.create({
        data: {
          answer: addPracticeQuestionDto.optione,
          questionId: question.id,
        },
      });
      if (addPracticeQuestionDto.correctoption === 'E') {
        await this.databaseService.practiceRightOption.create({
          data: {
            optionId: optione.id,
          },
        });
      }
      if (addPracticeQuestionDto.optionereason) {
        await this.databaseService.practiceOptionExplaination.create({
          data: {
            text: addPracticeQuestionDto.optionereason,
            optionId: optione.id,
          },
        });
      }
    }
    return question;
  }

  async flagQuestion(userid: number, addPracticeFlagDto: AddPracticeFlagDto) {
    let flag = await this.databaseService.userPracticeQuestionFlag.findFirst({
      where: {
        userId: userid,
        questionId: addPracticeFlagDto.questionId,
        removed: null,
      },
    });
    if (!flag) {
      flag = await this.databaseService.userPracticeQuestionFlag.create({
        data: {
          userId: userid,
          questionId: addPracticeFlagDto.questionId,
        },
      });
    }

    flag = await this.databaseService.userPracticeQuestionFlag.update({
      where: {
        id: flag.id,
      },
      data: {
        flagText: addPracticeFlagDto.flagText,
      },
    });

    if (addPracticeFlagDto.remove) {
      await this.databaseService.userPracticeQuestionFlag.update({
        where: {
          id: flag.id,
        },
        data: {
          removed: true,
        },
      });
    }
    return flag;
  }

  async getTotalTime(userId: number, platformId: number) {
    const watching_courseId = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );

    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }

    const totalTime = await this.databaseService.userPracticeAttempt.aggregate({
      _sum: {
        timeTaken: true,
      },
      where: {
        userId: userId,
        courseId: watching_courseId,
        hasSubmitted: true,
      },
    });
    return { totalTime };
  }

  async getPracticeQuestionDifficulty(
    userId: number,
    practiceAttemptCreateDto: PracticeAttemptCreateDto,
    platformId: number,
  ) {
    const watching_courseId = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );

    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    const practiceQuestionCount =
      await this.databaseService.practiceQuestion.count({
        where: {
          questionId: null,
          FallNumber: {
            some: {
              FallNumber: {
                Course: {
                  some: {
                    courseId: watching_courseId,
                  },
                },
                Subject: {
                  some: {
                    Subject: {
                      OR: [
                        {
                          id: {
                            in: practiceAttemptCreateDto.subjectIds,
                          },
                        },
                        {
                          Subject: {
                            OR: [
                              {
                                id: {
                                  in: practiceAttemptCreateDto.subjectIds,
                                },
                              },
                              {
                                Subject: {
                                  OR: [
                                    {
                                      id: {
                                        in: practiceAttemptCreateDto.subjectIds,
                                      },
                                    },
                                    {
                                      Subject: {
                                        id: {
                                          in: practiceAttemptCreateDto.subjectIds,
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
                },
              },
            },
          },
          AND: [
            {
              ...((practiceAttemptCreateDto.isFlagged ||
                practiceAttemptCreateDto.isIncorrect ||
                practiceAttemptCreateDto.isUnattempted) && {
                OR: [
                  {
                    ...(practiceAttemptCreateDto.isFlagged && {
                      UserFlag: {
                        some: {
                          userId: userId,
                          removed: null,
                        },
                      },
                    }),
                  },
                  {
                    ...(practiceAttemptCreateDto.isUnattempted && {
                      Attempt: {
                        none: {
                          optionId: {
                            not: null,
                          },
                          Attempt: {
                            userId: userId,
                          },
                        },
                      },
                    }),
                  },
                  {
                    ...(practiceAttemptCreateDto.isIncorrect && {
                      Attempt: {
                        some: {
                          Attempt: {
                            userId: userId,
                          },
                          Option: {
                            RightOption: {
                              is: null,
                            },
                          },
                        },
                      },
                    }),
                  },
                ],
              }),
            },
            {
              ...((practiceAttemptCreateDto.includeEasy ||
                practiceAttemptCreateDto.includeMedium ||
                practiceAttemptCreateDto.includeHard) && {
                OR: [
                  {
                    ...(practiceAttemptCreateDto.includeEasy && {
                      difficulty: {
                        lte: 3,
                      },
                    }),
                  },
                  {
                    ...(practiceAttemptCreateDto.includeMedium && {
                      difficulty: {
                        gte: 4,
                        lte: 7,
                      },
                    }),
                  },
                  {
                    ...(practiceAttemptCreateDto.includeHard && {
                      difficulty: {
                        gte: 8,
                      },
                    }),
                  },
                ],
              }),
            },
          ],
        },
      });
    const itemSetCount = await this.databaseService.practiceQuestion.findMany({
      where: {
        ...((practiceAttemptCreateDto.includeEasy ||
          practiceAttemptCreateDto.includeMedium ||
          practiceAttemptCreateDto.includeHard) && {
          OR: [
            {
              ...(practiceAttemptCreateDto.includeEasy && {
                difficulty: {
                  lte: 3,
                },
              }),
            },
            {
              ...(practiceAttemptCreateDto.includeMedium && {
                difficulty: {
                  gte: 4,
                  lte: 7,
                },
              }),
            },
            {
              ...(practiceAttemptCreateDto.includeHard && {
                difficulty: {
                  gte: 8,
                },
              }),
            },
          ],
        }),
        Questions: {
          some: {
            FallNumber: {
              some: {
                FallNumber: {
                  Course: {
                    some: {
                      courseId: watching_courseId,
                    },
                  },
                  Subject: {
                    some: {
                      Subject: {
                        OR: [
                          {
                            id: {
                              in: practiceAttemptCreateDto.subjectIds,
                            },
                          },
                          {
                            Subject: {
                              OR: [
                                {
                                  id: {
                                    in: practiceAttemptCreateDto.subjectIds,
                                  },
                                },
                                {
                                  Subject: {
                                    OR: [
                                      {
                                        id: {
                                          in: practiceAttemptCreateDto.subjectIds,
                                        },
                                      },
                                      {
                                        Subject: {
                                          id: {
                                            in: practiceAttemptCreateDto.subjectIds,
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
                  },
                },
              },
            },
            AND: [
              {
                ...((practiceAttemptCreateDto.isFlagged ||
                  practiceAttemptCreateDto.isIncorrect ||
                  practiceAttemptCreateDto.isUnattempted) && {
                  OR: [
                    {
                      ...(practiceAttemptCreateDto.isFlagged && {
                        UserFlag: {
                          some: {
                            userId: userId,
                            removed: null,
                          },
                        },
                      }),
                    },
                    {
                      ...(practiceAttemptCreateDto.isUnattempted && {
                        Attempt: {
                          none: {
                            optionId: {
                              not: null,
                            },
                            Attempt: {
                              userId: userId,
                            },
                          },
                        },
                      }),
                    },
                    {
                      ...(practiceAttemptCreateDto.isIncorrect && {
                        Attempt: {
                          some: {
                            Attempt: {
                              userId: userId,
                            },
                            Option: {
                              RightOption: {
                                is: null,
                              },
                            },
                          },
                        },
                      }),
                    },
                  ],
                }),
              },
            ],
          },
        },
      },
      include: {
        Questions: true,
      },
    });
    let itemSetArray = [];
    for (const itemSet of itemSetCount) {
      if (itemSet.Questions.length > 0) {
        itemSetArray.push(itemSet.Questions.length);
      }
    }
    return { questionCount: practiceQuestionCount, itemset: itemSetArray };
  }

  async submitPracticeAttempt(client: CustomUserSocketClient) {
    const canUsePractice = await this.canUsePractice(client.platformId);
    if (!canUsePractice) {
      return client.emit('submit-attempt-error', {
        message: 'Practice is not allowed on this platform',
      });
    }
    if (!client.practiceAttempt?.attemptId) {
      return client.emit('submit-attempt-error', {
        message: 'Attempt not found',
      });
    }
    const attempt = await this.databaseService.userPracticeAttempt.findFirst({
      where: {
        id: client.practiceAttempt.attemptId,
      },
    });
    if (!attempt) {
      return client.emit('submit-attempt-error', {
        message: 'Attempt not found',
      });
    }
    if (attempt.hasSubmitted) {
      return client.emit('submit-attempt-error', {
        message: 'Attempt already submitted',
      });
    }
    const now = new Date();
    const timeDiff = Math.floor(
      (now.getTime() - client.practiceAttempt.attemptStartTime.getTime()) /
        1000,
    );
    await this.databaseService.userPracticeAttempt.update({
      where: {
        id: client.practiceAttempt.attemptId,
      },
      data: {
        timeTaken: attempt.timeTaken + timeDiff,
        hasSubmitted: true,
      },
    });
    client.practiceAttempt = null;
    return client.emit('submit-attempt-success', {
      message: 'Attempt submitted',
    });
  }

  async checkUserinCourse(userId: number, courseId) {
    return true;
  }

  async getPracticeQuestionExplaination(
    client: CustomUserSocketClient,
    questionId: number,
  ) {
    const canUsePractice = await this.canUsePractice(client.platformId);
    if (!canUsePractice) {
      return client.emit('get-question-explaination-error', {
        message: 'Practice is not allowed on this platform',
      });
    }
    if (!client.practiceAttempt?.attemptId) {
      return client.emit('get-question-explaination-error', {
        message: 'Attempt not found',
      });
    }
    if (client.practiceAttempt?.questionId !== questionId) {
      return client.emit('get-question-explaination-error', {
        message: 'Question not found in attempt',
      });
    }

    const attempt = await this.databaseService.userPracticeAttempt.findFirst({
      where: {
        id: client.practiceAttempt.attemptId,
      },
    });

    let question: any;

    if (attempt.hasSubmitted) {
      question = await this.databaseService.practiceQuestion.findFirst({
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
        },
      });
    } else {
      question = await this.databaseService.practiceQuestion.findFirst({
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
        },
      });

      await this.databaseService.userPracticeAnswer.update({
        where: {
          attemptId_questionId: {
            attemptId: client.practiceAttempt.attemptId,
            questionId: questionId,
          },
        },
        data: {
          hasSubmitted: true,
        },
      });
    }

    return client.emit('get-practice-question-explaination-success', question);
  }

  async getPracticeQuestions(
    client: CustomUserSocketClient,
    practiceAttemptDto: PracticeAttemptCreateDto,
  ) {
    const canUsePractice = await this.canUsePractice(client.platformId);
    if (!canUsePractice) {
      return client.emit('make-practice-attempt-error', {
        message: 'Practice is not allowed on this platform',
      });
    }

    const watching_courseId: number = await this.cacheManager.get(
      `watching_course_${client.userId}_${client.platformId}`,
    );

    if (!watching_courseId) {
      return client.emit('make-practice-attempt-error', {
        message: 'You are not watching any course',
      });
    }

    if (practiceAttemptDto.attemptId) {
      const attempt = await this.databaseService.userPracticeAttempt.findFirst({
        where: {
          id: practiceAttemptDto.attemptId,
        },
        include: {
          Answer: {
            orderBy: {
              order: 'asc',
            },
            include: {
              Question: {
                include: {
                  UserFlag: {
                    where: {
                      userId: client.userId,
                      removed: null,
                    },
                  },
                  Report: {
                    where: {
                      userId: client.userId,
                    },
                    select: {
                      questionId: true,
                    },
                  },
                  // Question: {
                  //   include: {
                  //     Report: {
                  //       where: {
                  //         userId: client.userId,
                  //       },
                  //       select: {
                  //         questionId: true,
                  //       },
                  //     },
                  //     UserFlag: {
                  //       where: {
                  //         userId: client.userId,
                  //         removed: {
                  //           not: true,
                  //         },
                  //       },
                  //     },
                  //     Option: true,
                  //     FallNumber: {
                  //       select: {
                  //         FallNumber: {
                  //           select: {
                  //             Subject: {
                  //               where: {
                  //                 Subject: {
                  //                   OR: [
                  //                     {
                  //                       Course: {
                  //                         some: {
                  //                           courseId: watching_courseId,
                  //                         },
                  //                       },
                  //                     },
                  //                     {
                  //                       Subject: {
                  //                         OR: [
                  //                           {
                  //                             Course: {
                  //                               some: {
                  //                                 courseId: watching_courseId,
                  //                               },
                  //                             },
                  //                           },
                  //                           {
                  //                             Subject: {
                  //                               OR: [
                  //                                 {
                  //                                   Course: {
                  //                                     some: {
                  //                                       courseId:
                  //                                         watching_courseId,
                  //                                     },
                  //                                   },
                  //                                 },
                  //                                 {
                  //                                   Subject: {
                  //                                     OR: [
                  //                                       {
                  //                                         Course: {
                  //                                           some: {
                  //                                             courseId:
                  //                                               watching_courseId,
                  //                                           },
                  //                                         },
                  //                                       },
                  //                                       {
                  //                                         Subject: {
                  //                                           Course: {
                  //                                             some: {
                  //                                               courseId:
                  //                                                 watching_courseId,
                  //                                             },
                  //                                           },
                  //                                         },
                  //                                       },
                  //                                     ],
                  //                                   },
                  //                                 },
                  //                               ],
                  //                             },
                  //                           },
                  //                         ],
                  //                       },
                  //                     },
                  //                   ],
                  //                 },
                  //               },
                  //               include: {
                  //                 Subject: {
                  //                   include: {
                  //                     Subject: {
                  //                       include: {
                  //                         Subject: {
                  //                           include: {
                  //                             Subject: true,
                  //                           },
                  //                         },
                  //                       },
                  //                     },
                  //                   },
                  //                 },
                  //               },
                  //             },
                  //           },
                  //         },
                  //       },
                  //     },
                  //   },
                  // },
                  Option: true,
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
                },
              },
            },
          },
        },
      });
      if (!attempt) {
        return client.emit('make--practice-attempt-error', {
          message: 'Attempt not found',
        });
      }
      client.practiceAttempt = {
        courseId: 0,
        attemptId: 0,
        attemptStartTime: new Date(),
        questionId: 0,
        questionStartTime: new Date(),
        hasSubmited: attempt.hasSubmitted,
      };
      client.practiceAttempt.attemptId = attempt.id;
      client.practiceAttempt.attemptStartTime = new Date();
      client.practiceAttempt.hasSubmited = attempt.hasSubmitted;
      return client.emit('make-practice-attempt-success', attempt);
    }

    const practicequestion =
      await this.databaseService.practiceQuestion.findMany({
        where: {
          AND: [
            {
              ...((practiceAttemptDto.isFlagged ||
                practiceAttemptDto.isIncorrect ||
                practiceAttemptDto.isUnattempted) && {
                OR: [
                  {
                    ...(practiceAttemptDto.isFlagged && {
                      UserFlag: {
                        some: {
                          userId: client.userId,
                          removed: null,
                        },
                      },
                    }),
                  },
                  {
                    ...(practiceAttemptDto.isUnattempted && {
                      Attempt: {
                        none: {
                          optionId: {
                            not: null,
                          },
                          Attempt: {
                            userId: client.userId,
                          },
                        },
                      },
                    }),
                  },
                  {
                    ...(practiceAttemptDto.isIncorrect && {
                      Attempt: {
                        some: {
                          Attempt: {
                            userId: client.userId,
                          },
                          Option: {
                            RightOption: {
                              is: null,
                            },
                          },
                        },
                      },
                    }),
                  },
                ],
              }),
            },
            {
              ...((practiceAttemptDto.includeEasy ||
                practiceAttemptDto.includeMedium ||
                practiceAttemptDto.includeHard) && {
                OR: [
                  {
                    ...(practiceAttemptDto.includeEasy && {
                      difficulty: {
                        lte: 3,
                      },
                    }),
                  },
                  {
                    ...(practiceAttemptDto.includeMedium && {
                      difficulty: {
                        gte: 4,
                        lte: 7,
                      },
                    }),
                  },
                  {
                    ...(practiceAttemptDto.includeHard && {
                      difficulty: {
                        gte: 8,
                      },
                    }),
                  },
                ],
              }),
            },
          ],
          FallNumber: {
            some: {
              FallNumber: {
                Course: {
                  some: {
                    courseId: watching_courseId,
                  },
                },
                Subject: {
                  some: {
                    Subject: {
                      OR: [
                        {
                          id: {
                            in: practiceAttemptDto.subjectIds,
                          },
                        },
                        {
                          Subject: {
                            OR: [
                              {
                                id: {
                                  in: practiceAttemptDto.subjectIds,
                                },
                              },
                              {
                                Subject: {
                                  OR: [
                                    {
                                      id: {
                                        in: practiceAttemptDto.subjectIds,
                                      },
                                    },
                                    {
                                      Subject: {
                                        id: {
                                          in: practiceAttemptDto.subjectIds,
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
                },
              },
            },
          },
        },
      });

    const shuffledQuestions = practicequestion.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffledQuestions.slice(
      0,
      practiceAttemptDto.questionCount,
    );

    const attempt = await this.databaseService.userPracticeAttempt.create({
      data: {
        userId: client.userId,
        courseId: watching_courseId,
        subject: practiceAttemptDto.subjectIds,
        Answer: {
          create: selectedQuestions.map((question) => ({
            questionId: question.id,
            order: selectedQuestions.indexOf(question) + 1,
          })),
        },
      },
      include: {
        Answer: {
          orderBy: {
            order: 'asc',
          },
          include: {
            Question: {
              include: {
                UserFlag: {
                  where: {
                    userId: client.userId,
                    removed: {
                      not: true,
                    },
                  },
                },
                Report: {
                  where: {
                    userId: client.userId,
                  },
                  select: {
                    questionId: true,
                  },
                },
                // Question: {
                //   include: {
                //     Report: {
                //       where: {
                //         userId: client.userId,
                //       },
                //       select: {
                //         questionId: true,
                //       },
                //     },
                //     UserFlag: {
                //       where: {
                //         userId: client.userId,
                //         removed: {
                //           not: true,
                //         },
                //       },
                //     },
                //     Option: true,
                //     FallNumber: {
                //       select: {
                //         FallNumber: {
                //           select: {
                //             Subject: {
                //               where: {
                //                 Subject: {
                //                   OR: [
                //                     {
                //                       Course: {
                //                         some: {
                //                           courseId: watching_courseId,
                //                         },
                //                       },
                //                     },
                //                     {
                //                       Subject: {
                //                         OR: [
                //                           {
                //                             Course: {
                //                               some: {
                //                                 courseId: watching_courseId,
                //                               },
                //                             },
                //                           },
                //                           {
                //                             Subject: {
                //                               OR: [
                //                                 {
                //                                   Course: {
                //                                     some: {
                //                                       courseId:
                //                                         watching_courseId,
                //                                     },
                //                                   },
                //                                 },
                //                                 {
                //                                   Subject: {
                //                                     OR: [
                //                                       {
                //                                         Course: {
                //                                           some: {
                //                                             courseId:
                //                                               watching_courseId,
                //                                           },
                //                                         },
                //                                       },
                //                                       {
                //                                         Subject: {
                //                                           Course: {
                //                                             some: {
                //                                               courseId:
                //                                                 watching_courseId,
                //                                             },
                //                                           },
                //                                         },
                //                                       },
                //                                     ],
                //                                   },
                //                                 },
                //                               ],
                //                             },
                //                           },
                //                         ],
                //                       },
                //                     },
                //                   ],
                //                 },
                //               },
                //               include: {
                //                 Subject: {
                //                   include: {
                //                     Subject: {
                //                       include: {
                //                         Subject: {
                //                           include: {
                //                             Subject: true,
                //                           },
                //                         },
                //                       },
                //                     },
                //                   },
                //                 },
                //               },
                //             },
                //           },
                //         },
                //       },
                //     },
                //   },
                // },
                Option: true,
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
              },
            },
          },
        },
      },
    });

    client.practiceAttempt = {
      courseId: 0,
      attemptId: 0,
      attemptStartTime: new Date(),
      questionId: 0,
      questionStartTime: new Date(),
      hasSubmited: attempt.hasSubmitted,
    };
    client.practiceAttempt.attemptId = attempt.id;
    client.practiceAttempt.attemptStartTime = new Date();
    client.practiceAttempt.hasSubmited = attempt.hasSubmitted;
    return client.emit('make-practice-attempt-success', attempt);
  }

  async getPracticeParentQuestions(userId: number, questionId: string) {
    if (!questionId) {
      throw new BadRequestException('Question id is required');
    }

    const question = await this.databaseService.practiceQuestion.findFirst({
      where: {
        id: Number(questionId),
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const parentQuestion =
      await this.databaseService.practiceQuestion.findFirst({
        where: {
          id: question.questionId ? Number(question.questionId) : null,
        },
        include: {
          Questions: {
            include: {
              Attempt: {
                where: {
                  Attempt: {
                    userId: userId,
                  },
                },
                take: 1,
                orderBy: {
                  createdAt: 'desc',
                },
              },
              Option: {
                include: {
                  RightOption: true,
                },
              },
            },
          },
        },
      });

    if (!parentQuestion) {
      throw new NotFoundException('Question not found');
    }

    return { Question: parentQuestion };
  }

  async watchPracticeQuestion(
    client: CustomUserSocketClient,
    questionId: number,
  ) {
    const canUsePractice = await this.canUsePractice(client.platformId);
    if (!canUsePractice) {
      return client.emit('watch-practice-question-error', {
        message: 'Practice is not allowed on this platform',
      });
    }
    if (!client.practiceAttempt?.attemptId) {
      return client.emit('watch-practice-question-error', {
        message: 'Attempt not found',
      });
    }
    if (!questionId) {
      return client.emit('watch-practice-question-error', {
        message: 'Question id is required to watch!',
      });
    }
    const question = await this.databaseService.userPracticeAnswer.findFirst({
      where: {
        attemptId: client.practiceAttempt.attemptId,
        questionId: questionId,
      },
    });

    if (!question) {
      return client.emit('watch-question-error', {
        message: 'Question not found in attempt',
      });
    }

    if (
      client.practiceAttempt.questionId &&
      !question?.hasSubmitted &&
      !client.practiceAttempt.hasSubmited
    ) {
      const now = new Date();
      const attemptanswer =
        await this.databaseService.userPracticeAnswer.findFirst({
          where: {
            attemptId: client.practiceAttempt.attemptId,
            questionId: client.practiceAttempt.questionId,
          },
        });
      if (!attemptanswer.optionId) {
        const questionTimeDiff = Math.floor(
          (now.getTime() - client.practiceAttempt.questionStartTime.getTime()) /
            1000,
        );
        const question = await this.databaseService.userPracticeAnswer.update({
          where: {
            attemptId_questionId: {
              attemptId: client.practiceAttempt.attemptId,
              questionId: client.practiceAttempt.questionId,
            },
          },
          data: {
            timeTaken: attemptanswer.timeTaken + questionTimeDiff,
          },
        });
      }
    }

    client.practiceAttempt.questionId = questionId;
    client.practiceAttempt.questionStartTime = new Date();
    return client.emit('watch-practice-question-success', question);
  }

  async getPracticeAttempt(
    userId: number,
    getPracticeAttemptDto: GetPracticeAttemptDto,
    platformId: number,
  ) {
    const watching_courseId = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    return await this.databaseService.userPracticeAttempt.findMany({
      where: {
        userId: userId,
        hasSubmitted: getPracticeAttemptDto.hasSubmitted,
        courseId: watching_courseId,
        createdAt: {
          gte: getPracticeAttemptDto.startDate,
          lte: getPracticeAttemptDto.endDate,
        },
      },
      take: 10,
      skip: getPracticeAttemptDto.page ? getPracticeAttemptDto.page * 10 : 0,
      orderBy: {
        createdAt: getPracticeAttemptDto.isOldFirst ? 'asc' : 'desc',
      },
    });
  }

  async addOptionPracticeQuestion(
    client: CustomUserSocketClient,
    answer: { questionId: number; optionId: number },
  ) {
    const canUsePractice = await this.canUsePractice(client.platformId);
    if (!canUsePractice) {
      return client.emit('add-option-practice-question-error', {
        message: 'Practice is not allowed on this platform',
      });
    }
    if (!client.practiceAttempt.attemptId) {
      return client.emit('add-option-practice-question-error', {
        message: 'Attempt not found',
      });
    }
    if (!client.practiceAttempt.questionId) {
      return client.emit('add-option-practice-question-error', {
        message: 'Question is not being watched',
      });
    }
    let question = await this.databaseService.userPracticeAnswer.findFirst({
      where: {
        attemptId: client.practiceAttempt.attemptId,
        questionId: answer.questionId,
      },
    });
    const attempt = await this.databaseService.userPracticeAttempt.findFirst({
      where: {
        userId: client.userId,
        id: client.practiceAttempt.attemptId,
      },
    });
    if (attempt.hasSubmitted) {
      return client.emit('add-option-practice-question-error', {
        message: 'Attempt already submitted',
      });
    }
    if (!question) {
      return client.emit('add-option-practice-question-error', {
        message: 'Question not found in attempt',
      });
    }
    if (question.hasSubmitted) {
      return client.emit('add-option-practice-question-error', {
        message: 'Question already submitted',
      });
    }
    const now = new Date();
    const questionTimeDiff = Math.floor(
      (now.getTime() - client.practiceAttempt.questionStartTime.getTime()) /
        1000,
    );
    if (question.optionId === answer.optionId) {
      question = await this.databaseService.userPracticeAnswer.update({
        where: {
          attemptId_questionId: {
            attemptId: client.practiceAttempt.attemptId,
            questionId: answer.questionId,
          },
        },
        data: {
          optionId: null,
          timeTaken: question.timeTaken + questionTimeDiff,
        },
      });
      return client.emit('add-option-practice-question-success', question);
    }
    question = await this.databaseService.userPracticeAnswer.update({
      where: {
        attemptId_questionId: {
          attemptId: client.practiceAttempt.attemptId,
          questionId: answer.questionId,
        },
      },
      data: {
        optionId: answer.optionId,
        timeTaken: question.timeTaken + questionTimeDiff,
      },
    });
    return client.emit('add-option-practice-question-success', question);
  }

  async getOptionExplaination(
    client: CustomUserSocketClient,
    questionId: number,
  ) {
    const canUsePractice = await this.canUsePractice(client.platformId);
    if (!canUsePractice) {
      return client.emit('get-question-explaination-error', {
        message: 'Practice is not allowed on this platform',
      });
    }
    if (!client.practiceAttempt?.attemptId) {
      return client.emit('get-question-explaination-error', {
        message: 'Attempt not found',
      });
    }
    if (client.practiceAttempt?.questionId !== questionId) {
      return client.emit('get-question-explaination-error', {
        message: 'Question not found in attempt',
      });
    }
    const attempt = await this.databaseService.userPracticeAttempt.findFirst({
      where: {
        id: client.practiceAttempt.attemptId,
      },
    });
    let isSubmitted = false;
    if (attempt.hasSubmitted) {
      isSubmitted = true;
    }

    if (isSubmitted) {
      const attemptExplaination =
        await this.databaseService.userPracticeAnswer.findFirst({
          where: {
            attemptId: client.practiceAttempt.attemptId,
            questionId: questionId,
          },
          include: {
            Option: {
              include: {
                RightOption: true,
                Explaination: true,
              },
            },
            Question: {
              include: {
                Explaination: true,
              },
            },
          },
        });
      return client.emit(
        'get-question-explaination-success',
        attemptExplaination,
      );
    } else {
      const attemptExplaination =
        await this.databaseService.userPracticeAnswer.findFirst({
          where: {
            attemptId: client.practiceAttempt.attemptId,
            questionId: questionId,
          },
          include: {
            Option: {
              include: {
                RightOption: true,
                Explaination: true,
              },
            },
          },
        });
      const test = await this.databaseService.userPracticeAnswer.update({
        where: {
          attemptId_questionId: {
            attemptId: client.practiceAttempt.attemptId,
            questionId: questionId,
          },
        },
        data: {
          hasSubmitted: true,
        },
      });

      return client.emit(
        'get-question-explaination-success',
        attemptExplaination,
      );
    }
  }

  async getAttemptWithAnswers(
    userId: number,
    getPracticeDto: GetPracticeDto,
    platformId: number,
  ) {
    const watching_courseId = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new NotFoundException('Watching course not found');
    }
    const attempt = await this.databaseService.userPracticeAttempt.findFirst({
      where: {
        id: getPracticeDto.attemptId,
        userId: userId,
        courseId: watching_courseId,
      },
      include: {
        Answer: {
          orderBy: {
            order: 'asc',
          },
          include: {
            Option: {
              select: {
                RightOption: true,
              },
            },
            Question: {
              select: {
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
                questionId: true,
              },
            },
          },
        },
      },
    });
    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }
    return attempt;
  }

  async addPractice(addPracticeQuestionDto: AddPracticeQuestionDto) {
    let itemsetId: number;
    if (
      addPracticeQuestionDto.itemsetCode &&
      addPracticeQuestionDto.itemsetQuestion !== 'NA'
    ) {
      let itemsetQuestion =
        await this.databaseService.practiceQuestion.findFirst({
          where: {
            questionCode: addPracticeQuestionDto.itemsetCode,
          },
        });
      if (!itemsetQuestion) {
        let itemSetdifficultynumber = 0;
        if (addPracticeQuestionDto.itemsetDifficulty === 'Easy') {
          itemSetdifficultynumber = 1;
        }
        if (addPracticeQuestionDto.itemsetDifficulty === 'Standard') {
          itemSetdifficultynumber = 5;
        }
        if (addPracticeQuestionDto.itemsetDifficulty === 'Challenging') {
          itemSetdifficultynumber = 10;
        }
        itemsetQuestion = await this.databaseService.practiceQuestion.create({
          data: {
            question: addPracticeQuestionDto.itemsetQuestion,
            questionCode: addPracticeQuestionDto.itemsetCode,
            difficulty: itemSetdifficultynumber,
            attribute: addPracticeQuestionDto.itemsetAttribute,
          },
        });
      }
      itemsetId = itemsetQuestion.id;
    }
    let difficultynumber = 0;
    if (addPracticeQuestionDto.difficulty === 'Easy') {
      difficultynumber = 1;
    }
    if (addPracticeQuestionDto.difficulty === 'Standard') {
      difficultynumber = 5;
    }
    if (addPracticeQuestionDto.difficulty === 'Challenging') {
      difficultynumber = 10;
    }
    const question = await this.databaseService.practiceQuestion.create({
      data: {
        question: addPracticeQuestionDto.question,
        difficulty: difficultynumber,
        attribute: addPracticeQuestionDto.attribute,
        questionId: itemsetId,
        questionCode: addPracticeQuestionDto.questionCode,
      },
    });
    const fallnum = await this.databaseService.fallNumber.findFirst({
      where: {
        number: addPracticeQuestionDto.fallnum,
      },
    });
    const explaination =
      await this.databaseService.practiceQuestionExplaination.create({
        data: {
          questionId: question.id,
          text: addPracticeQuestionDto.explanation,
        },
      });
    if (fallnum) {
      await this.databaseService.practiceQuestiontoFallNumber.create({
        data: {
          questionId: question.id,
          fallNumberId: fallnum.id,
        },
      });
    }
    if (addPracticeQuestionDto.optiona) {
      const optiona = await this.databaseService.practiceOption.create({
        data: {
          answer: addPracticeQuestionDto.optiona,
          questionId: question.id,
        },
      });
      if (addPracticeQuestionDto.correctoption === 'A') {
        await this.databaseService.practiceRightOption.create({
          data: {
            optionId: optiona.id,
          },
        });
      }
      if (addPracticeQuestionDto.optionareason) {
        await this.databaseService.practiceOptionExplaination.create({
          data: {
            text: addPracticeQuestionDto.optionareason,
            optionId: optiona.id,
          },
        });
      }
    }
    if (addPracticeQuestionDto.optionb) {
      const optionb = await this.databaseService.practiceOption.create({
        data: {
          answer: addPracticeQuestionDto.optionb,
          questionId: question.id,
        },
      });
      if (addPracticeQuestionDto.correctoption === 'B') {
        await this.databaseService.practiceRightOption.create({
          data: {
            optionId: optionb.id,
          },
        });
      }
      if (addPracticeQuestionDto.optionbreason) {
        await this.databaseService.practiceOptionExplaination.create({
          data: {
            text: addPracticeQuestionDto.optionbreason,
            optionId: optionb.id,
          },
        });
      }
    }
    if (addPracticeQuestionDto.optionc) {
      const optionc = await this.databaseService.practiceOption.create({
        data: {
          answer: addPracticeQuestionDto.optionc,
          questionId: question.id,
        },
      });
      if (addPracticeQuestionDto.correctoption === 'C') {
        await this.databaseService.practiceRightOption.create({
          data: {
            optionId: optionc.id,
          },
        });
      }
      if (addPracticeQuestionDto.optioncreason) {
        await this.databaseService.practiceOptionExplaination.create({
          data: {
            text: addPracticeQuestionDto.optioncreason,
            optionId: optionc.id,
          },
        });
      }
    }
    if (addPracticeQuestionDto.optiond) {
      const optiond = await this.databaseService.practiceOption.create({
        data: {
          answer: addPracticeQuestionDto.optiond,
          questionId: question.id,
        },
      });
      if (addPracticeQuestionDto.correctoption === 'D') {
        await this.databaseService.practiceRightOption.create({
          data: {
            optionId: optiond.id,
          },
        });
      }
      if (addPracticeQuestionDto.optiondreason) {
        await this.databaseService.practiceOptionExplaination.create({
          data: {
            text: addPracticeQuestionDto.optiondreason,
            optionId: optiond.id,
          },
        });
      }
    }
    if (addPracticeQuestionDto.optione) {
      const optione = await this.databaseService.practiceOption.create({
        data: {
          answer: addPracticeQuestionDto.optione,
          questionId: question.id,
        },
      });
      if (addPracticeQuestionDto.correctoption === 'E') {
        await this.databaseService.practiceRightOption.create({
          data: {
            optionId: optione.id,
          },
        });
      }
      if (addPracticeQuestionDto.optionereason) {
        await this.databaseService.practiceOptionExplaination.create({
          data: {
            text: addPracticeQuestionDto.optionereason,
            optionId: optione.id,
          },
        });
      }
    }
    return question;
  }

  async findPracticeQuestionCourse(courseid: number) {
    const course = await this.databaseService.course.findFirst({
      where: {
        id: courseid,
      },
      include: {
        Course: true,
      },
    });
    if (!course) {
      return null;
    }
    const coursehasSubject = await this.databaseService.courseSubject.findFirst(
      {
        where: {
          Course: {
            some: {
              courseId: course.id,
            },
          },
        },
      },
    );
    if (coursehasSubject) {
      return course.id;
    }
    if (course.Course) {
      return this.findPracticeQuestionCourse(course.Course.courseId);
    }
    return null;
  }

  async getPracticeStat(
    userId: number,
    getPracticeStatDto: GetPracticeStatDto,
    platformId: number,
  ) {
    const watching_courseId = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );

    if (!watching_courseId) {
      throw new NotFoundException('Watching course not found');
    }

    const result = await this.databaseService.$queryRaw`
  SELECT 
    DATE(updatedAt) as attemptDate, 
    COUNT(DISTINCT upa.questionId) as totalQuestions, 
    COUNT(DISTINCT CASE WHEN po."RightOption" IS NOT NULL THEN upa.questionId END) as correctAnswers
  FROM "UserPracticeAttempt" upa
  JOIN "UserPracticeAnswer" upan ON upa.id = upan."attemptId"
  LEFT JOIN "PracticeOption" po ON upan."optionId" = po.id
  WHERE upa."userId" = ${userId}
    AND upa."updatedAt" >= ${getPracticeStatDto.startDate} 
    AND upa."updatedAt" <= ${getPracticeStatDto.endDate}
    AND upa."hasSubmitted" = true
  GROUP BY attemptDate
  ORDER BY attemptDate;
`;
    return result;
  }

  async findSubject(
    userId: number,
    getSubjectDto: GetSubjectDto,
    platformId: number,
  ) {
    const watching_courseId = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    let subjects;
    if (getSubjectDto.subjectId) {
      subjects = await this.databaseService.courseSubject.findMany({
        where: {
          subjectId: getSubjectDto.subjectId,
        },
        include: {
          FallNumber: {
            include: {
              Fall: {
                include: {
                  PracticeQuestion: {
                    include: {
                      Question: {
                        include: {
                          Attempt: {
                            where: {
                              Attempt: {
                                userId: userId,
                              },
                            },
                            select: {
                              Option: {
                                select: {
                                  RightOption: true,
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
          Subjects: {
            include: {
              FallNumber: {
                include: {
                  Fall: {
                    include: {
                      PracticeQuestion: {
                        include: {
                          Question: {
                            include: {
                              Attempt: {
                                where: {
                                  Attempt: {
                                    userId: userId,
                                  },
                                },
                                select: {
                                  Option: {
                                    select: {
                                      RightOption: true,
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
              Subjects: {
                include: {
                  FallNumber: {
                    include: {
                      Fall: {
                        include: {
                          PracticeQuestion: {
                            include: {
                              Question: {
                                include: {
                                  Attempt: {
                                    where: {
                                      Attempt: {
                                        userId: userId,
                                      },
                                    },
                                    select: {
                                      Option: {
                                        select: {
                                          RightOption: true,
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
                  Subjects: {
                    include: {
                      FallNumber: {
                        include: {
                          Fall: {
                            include: {
                              PracticeQuestion: {
                                include: {
                                  Question: {
                                    include: {
                                      Attempt: {
                                        where: {
                                          Attempt: {
                                            userId: userId,
                                          },
                                        },
                                        select: {
                                          Option: {
                                            select: {
                                              RightOption: true,
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
                      Subjects: {
                        include: {
                          FallNumber: {
                            include: {
                              Fall: {
                                include: {
                                  PracticeQuestion: {
                                    include: {
                                      Question: {
                                        include: {
                                          Attempt: {
                                            where: {
                                              Attempt: {
                                                userId: userId,
                                              },
                                            },
                                            select: {
                                              Option: {
                                                select: {
                                                  RightOption: true,
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
                  },
                },
              },
            },
          },
        },
      });
    } else {
      subjects = await this.databaseService.courseSubject.findMany({
        where: {
          Course: {
            some: {
              courseId: watching_courseId,
            },
          },
        },
        include: {
          FallNumber: {
            include: {
              Fall: {
                include: {
                  PracticeQuestion: {
                    include: {
                      Question: {
                        include: {
                          Attempt: {
                            where: {
                              Attempt: {
                                userId: userId,
                              },
                            },
                            select: {
                              Option: {
                                select: {
                                  RightOption: true,
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
          Subjects: {
            include: {
              FallNumber: {
                include: {
                  Fall: {
                    include: {
                      PracticeQuestion: {
                        include: {
                          Question: {
                            include: {
                              Attempt: {
                                where: {
                                  Attempt: {
                                    userId: userId,
                                  },
                                },
                                select: {
                                  Option: {
                                    select: {
                                      RightOption: true,
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
              Subjects: {
                include: {
                  FallNumber: {
                    include: {
                      Fall: {
                        include: {
                          PracticeQuestion: {
                            include: {
                              Question: {
                                include: {
                                  Attempt: {
                                    where: {
                                      Attempt: {
                                        userId: userId,
                                      },
                                    },
                                    select: {
                                      Option: {
                                        select: {
                                          RightOption: true,
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
                  Subjects: {
                    include: {
                      FallNumber: {
                        include: {
                          Fall: {
                            include: {
                              PracticeQuestion: {
                                include: {
                                  Question: {
                                    include: {
                                      Attempt: {
                                        where: {
                                          Attempt: {
                                            userId: userId,
                                          },
                                        },
                                        select: {
                                          Option: {
                                            select: {
                                              RightOption: true,
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
                      Subjects: {
                        include: {
                          FallNumber: {
                            include: {
                              Fall: {
                                include: {
                                  PracticeQuestion: {
                                    include: {
                                      Question: {
                                        include: {
                                          Attempt: {
                                            where: {
                                              Attempt: {
                                                userId: userId,
                                              },
                                            },
                                            select: {
                                              Option: {
                                                select: {
                                                  RightOption: true,
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
                  },
                },
              },
            },
          },
        },
      });
    }
    if (!subjects.length) {
      throw new NotFoundException('Subject not found');
    }
    for (const subject of subjects) {
      const stats = this.newFindQuestionStats(subject, []);
      subject.questionCount = stats.totalQuestionCount;
      subject.attemptedQuestionCount = stats.attemptedQuestionCount;
      subject.correctQuestionCount = stats.correctQuestionCount;
      subject.itemset = Object.values(stats.parentQuestionMap || {});
      delete subject.FallNumber;
      delete subject.Subjects;
    }
    return subjects;
  }

  newFindQuestionStats(
    subject: any,
    parentQuestionMap: Record<number, number>,
  ): {
    totalQuestionCount: number;
    attemptedQuestionCount: number;
    correctQuestionCount: number;
    parentQuestionMap?: Record<number, number>;
  } {
    if (!subject) {
      return {
        totalQuestionCount: 0,
        attemptedQuestionCount: 0,
        correctQuestionCount: 0,
        parentQuestionMap,
      };
    }
    let totalQuestionCount = 0;
    let attemptedQuestionCount = 0;
    let correctQuestionCount = 0;
    for (const fallNumber of subject.FallNumber) {
      for (const practiceQuestion of fallNumber.Fall.PracticeQuestion) {
        totalQuestionCount++;
        if (
          practiceQuestion.Question.Attempt.some((attempt) =>
            attempt.Option?.RightOption ? true : false,
          )
        ) {
          correctQuestionCount++;
        }
        const parentId = practiceQuestion.Question.questionId;
        if (parentId !== null && parentId !== undefined) {
          parentQuestionMap[parentId] = (parentQuestionMap[parentId] || 0) + 1;
        }
        if (
          practiceQuestion.Question.Attempt.some((attempt) =>
            attempt.Option ? true : false,
          )
        ) {
          attemptedQuestionCount++;
        }
      }
    }
    if (subject.Subjects && subject.Subjects.length > 0) {
      for (const childSubject of subject.Subjects) {
        const childStats = this.newFindQuestionStats(
          childSubject,
          parentQuestionMap,
        );
        totalQuestionCount += childStats.totalQuestionCount;
        attemptedQuestionCount += childStats.attemptedQuestionCount;
        correctQuestionCount += childStats.correctQuestionCount;
      }
    }
    return {
      totalQuestionCount,
      attemptedQuestionCount,
      correctQuestionCount,
      parentQuestionMap,
    };
  }

  // async findQuestionStats(
  //   subjectId: number,
  //   userId: number,
  // ): Promise<{
  //   totalQuestionCount: number;
  //   attemptedQuestionCount: number;
  //   correctQuestionCount: number;
  //   parentQuestionMap?: Record<number, number>;
  // }> {
  //   const subject = await this.databaseService.courseSubject.findFirst({
  //     where: { id: subjectId },
  //     include: {
  //       Subjects: true,
  //       FallNumber: {
  //         include: {
  //           Fall: {
  //             include: {
  //               PracticeQuestion: {
  //                 include: {
  //                   Question: {
  //                     include: {
  //                       Attempt: {
  //                         where: {
  //                           Attempt: {
  //                             userId: userId,
  //                           },
  //                         },
  //                         select: {
  //                           Option: {
  //                             select: {
  //                               RightOption: true,
  //                             },
  //                           },
  //                         },
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  //   if (!subject)
  //     return {
  //       totalQuestionCount: 0,
  //       attemptedQuestionCount: 0,
  //       correctQuestionCount: 0,
  //       parentQuestionMap,
  //     };
  //   }
  //   let totalQuestionCount = 0;
  //   let attemptedQuestionCount = 0;
  //   let correctQuestionCount = 0;
  //   for (const fallNumber of subject.FallNumber) {
  //     for (const practiceQuestion of fallNumber.Fall.PracticeQuestion) {
  //       totalQuestionCount++;
  //       if (
  //         practiceQuestion.Question.Attempt.some((attempt) =>
  //           attempt.Option?.RightOption ? true : false,
  //         )
  //       ) {
  //         correctQuestionCount++;
  //       }
  //       const parentId = practiceQuestion.Question.questionId;
  //       if (parentId !== null && parentId !== undefined) {
  //         parentQuestionMap[parentId] = (parentQuestionMap[parentId] || 0) + 1;
  //       }
  //       if (
  //         practiceQuestion.Question.Attempt.some((attempt) =>
  //           attempt.Option ? true : false,
  //         )
  //       ) {
  //         attemptedQuestionCount++;
  //       }
  //     }
  //   }
  //   if (subject.Subjects && subject.Subjects.length > 0) {
  //     for (const childSubject of subject.Subjects) {
  //       const childStats = this.newFindQuestionStats(
  //         childSubject,
  //         parentQuestionMap,
  //       );
  //       totalQuestionCount += childStats.totalQuestionCount;
  //       attemptedQuestionCount += childStats.attemptedQuestionCount;
  //       correctQuestionCount += childStats.correctQuestionCount;
  //     }
  //   }
  //   return {
  //     totalQuestionCount,
  //     attemptedQuestionCount,
  //     correctQuestionCount,
  //     parentQuestionMap,
  //   };
  // }

  // async findQuestionStats(
  //   subjectId: number,
  //   userId: number,
  // ): Promise<{
  //   totalQuestionCount: number;
  //   attemptedQuestionCount: number;
  //   correctQuestionCount: number;
  // }> {
  //   const subject = await this.databaseService.courseSubject.findFirst({
  //     where: { id: subjectId },
  //     include: {
  //       Subjects: true,
  //       FallNumber: {
  //         include: {
  //           Fall: {
  //             include: {
  //               PracticeQuestion: {
  //                 include: {
  //                   Question: {
  //                     include: {
  //                       Attempt: {
  //                         where: {
  //                           Attempt: {
  //                             userId: userId,
  //                           },
  //                         },
  //                         select: {
  //                           Option: {
  //                             select: {
  //                               RightOption: true,
  //                             },
  //                           },
  //                         },
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  //   if (!subject)
  //     return {
  //       totalQuestionCount: 0,
  //       attemptedQuestionCount: 0,
  //       correctQuestionCount: 0,
  //     };
  //   let totalQuestionCount = 0;
  //   let attemptedQuestionCount = 0;
  //   let correctQuestionCount = 0;
  //   for (const fallNumber of subject.FallNumber) {
  //     for (const practiceQuestion of fallNumber.Fall.PracticeQuestion) {
  //       totalQuestionCount++;
  //       if (
  //         practiceQuestion.Question.Attempt.some((attempt) =>
  //           attempt.Option?.RightOption ? true : false,
  //         )
  //       ) {
  //         correctQuestionCount++;
  //       }
  //       if (
  //         practiceQuestion.Question.Attempt.some((attempt) =>
  //           attempt.Option ? true : false,
  //         )
  //       ) {
  //         attemptedQuestionCount++;
  //       }
  //     }
  //   }
  //   for (const childSubject of subject.Subjects) {
  //     const childStats = await this.findQuestionStats(childSubject.id, userId);
  //     totalQuestionCount += childStats.totalQuestionCount;
  //     attemptedQuestionCount += childStats.attemptedQuestionCount;
  //     correctQuestionCount += childStats.correctQuestionCount;
  //   }
  //   return { totalQuestionCount, attemptedQuestionCount, correctQuestionCount };
  // }

  async findAllFlagged(userId: number, platformId: number) {
    const watching_courseId = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );

    if (!watching_courseId) {
      throw new NotAcceptableException('User not in course');
    }

    const flagcount = await this.databaseService.userPracticeQuestionFlag.count(
      {
        where: {
          userId: userId,
          Question: {
            FallNumber: {
              some: {
                FallNumber: {
                  Course: {
                    some: {
                      courseId: watching_courseId,
                    },
                  },
                },
              },
            },
          },
        },
      },
    );
    return flagcount;
  }

  async searchSubject(
    userId: number,
    getSubjectDto: GetSubjectDto,
    platformId: number,
  ) {
    const watching_courseId = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );

    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }

    return await this.databaseService.courseSubject.findMany({
      where: {
        id: getSubjectDto.subjectId,
        AND: {
          OR: [
            {
              type: 'subject',
            },
            {
              type: 'chapter',
            },
          ],
        },
        name: {
          contains: getSubjectDto.searchString,
          mode: 'insensitive',
        },
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
                  courseId: watching_courseId,
                },
              },
            },
          },
        ],
      },
    });
  }

  async pausePracticeAttempt(client: CustomUserSocketClient) {
    const canUsePractice = await this.canUsePractice(client.platformId);
    if (!canUsePractice) {
      return client.emit('pause-attempt-error', {
        message: 'Practice is not allowed on this platform',
      });
    }
    if (!client.practiceAttempt?.attemptId) {
      return client.emit('pause-attempt-error', {
        message: 'Attempt not found',
      });
    }
    if (client.practiceAttempt.attemptId) {
      const now = new Date();
      const timeDiff = Math.floor(
        (now.getTime() - client.practiceAttempt.attemptStartTime.getTime()) /
          1000,
      );
      const attempt = await this.databaseService.userPracticeAttempt.findFirst({
        where: {
          id: client.practiceAttempt.attemptId,
        },
      });
      if (!attempt.hasSubmitted) {
        await this.databaseService.userPracticeAttempt.update({
          where: {
            id: client.practiceAttempt.attemptId,
          },
          data: {
            timeTaken: attempt.timeTaken + timeDiff,
          },
        });
      }
      if (client?.practiceAttempt?.questionId) {
        const attemptanswer =
          await this.databaseService.userPracticeAnswer.findFirst({
            where: {
              attemptId: client.practiceAttempt.attemptId,
              questionId: client.practiceAttempt.questionId,
            },
          });

        if (
          !attemptanswer.optionId &&
          !attempt.hasSubmitted &&
          !attemptanswer.hasSubmitted
        ) {
          const questionTimeDiff = Math.floor(
            (now.getTime() -
              client.practiceAttempt.questionStartTime.getTime()) /
              1000,
          );
          await this.databaseService.userPracticeAnswer.update({
            where: {
              attemptId_questionId: {
                attemptId: client.practiceAttempt.attemptId,
                questionId: client.practiceAttempt.questionId,
              },
            },
            data: {
              timeTaken: attemptanswer.timeTaken + questionTimeDiff,
            },
          });
        }
      }
      client.practiceAttempt = null;
      return client.emit('pause-attempt-success', {
        message: 'Attempt paused',
      });
    }
  }

  async findAll(userid: number, subjectId: number, platformId: number) {
    const watching_courseId: number = await this.cacheManager.get(
      `watching_course_${userid}_${platformId}`,
    );

    if (!watching_courseId) {
      throw new NotAcceptableException('User not in course');
    }

    const practicequestioncourseid =
      await this.findPracticeQuestionCourse(watching_courseId);
    if (!practicequestioncourseid) {
      throw new NotAcceptableException('No practice question found');
    }
    const subjects = await this.databaseService.courseSubject.findMany({
      where: {
        subjectId: subjectId,
        Course: {
          some: {
            courseId: practicequestioncourseid,
          },
        },
      },
    });
    return subjects;
  }

  async addPracticeQuestionDifficulty(
    client: CustomUserSocketClient,
    addQuestionDifficultyDto: AddQuestionDifficultyDto,
  ) {
    const canUsePractice = await this.canUsePractice(client.platformId);
    if (!canUsePractice) {
      return client.emit('add-practice-question-difficulty-error', {
        message: 'Practice is not allowed on this platform',
      });
    }
    let difficulty = 0;
    if (addQuestionDifficultyDto.difficulty === 'easy') {
      difficulty = 1;
    }
    if (addQuestionDifficultyDto.difficulty === 'medium') {
      difficulty = 5;
    }
    if (addQuestionDifficultyDto.difficulty === 'hard') {
      difficulty = 10;
    }
    if (client.practiceAttempt?.questionId) {
      const attempt = await this.databaseService.userPracticeAnswer.update({
        where: {
          attemptId_questionId: {
            attemptId: client.practiceAttempt.attemptId,
            questionId: client.practiceAttempt.questionId,
          },
        },
        data: {
          difficulty: difficulty,
        },
      });
      return client.emit('add-practice-question-difficulty-success', attempt);
    } else {
      return client.emit('add-practice-question-difficulty-error', {
        message: 'Question not found in attempt',
      });
    }
  }

  async handlePracticeAttemptDisconnect(client: CustomUserSocketClient) {
    if (client.practiceAttempt.attemptId) {
      const now = new Date();
      const timeDiff = Math.floor(
        (now.getTime() - client.practiceAttempt.attemptStartTime.getTime()) /
          1000,
      );
      const attempt = await this.databaseService.userPracticeAttempt.findFirst({
        where: {
          id: client.practiceAttempt.attemptId,
        },
      });
      if (!attempt.hasSubmitted) {
        await this.databaseService.userPracticeAttempt.update({
          where: {
            id: client.practiceAttempt.attemptId,
          },
          data: {
            timeTaken: attempt.timeTaken + timeDiff,
          },
        });
      }
      if (client.practiceAttempt.questionId) {
        const attemptanswer =
          await this.databaseService.userPracticeAnswer.findFirst({
            where: {
              attemptId: client.practiceAttempt.attemptId,
              questionId: client.practiceAttempt.questionId,
            },
          });

        if (
          !attemptanswer.optionId &&
          !attempt.hasSubmitted &&
          !attemptanswer.hasSubmitted
        ) {
          const questionTimeDiff = Math.floor(
            (now.getTime() -
              client.practiceAttempt.questionStartTime.getTime()) /
              1000,
          );
          await this.databaseService.userPracticeAnswer.update({
            where: {
              attemptId_questionId: {
                attemptId: client.practiceAttempt.attemptId,
                questionId: client.practiceAttempt.questionId,
              },
            },
            data: {
              timeTaken: attemptanswer.timeTaken + questionTimeDiff,
            },
          });
        }
      }
    }
  }
}
