import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { GetDoubtForumQuestionsDto } from './dto/get-questions.dto';
import { DatabaseService } from 'src/database/database.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PostQuestionDto } from './dto/post-question.dto';
import { VultrService } from 'src/vultr/vultr.service';
import { v4 as uuidv4 } from 'uuid';
import { PostAnswerDto } from './dto/post-answer.dto';
import { PatchQuestionDto } from './dto/patch-question.dto';
import { PatchAnswerDto } from './dto/patch-answer.dto';

@Injectable()
export class DoubtforumService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly vultrService: VultrService,
  ) {}

  async deleteAnswer(userId: number, answerId: number, platformId: number) {
    const answer = await this.databaseService.doubtAnswer.findFirst({
      where: {
        isActive: null,
        id: answerId,
        userId: userId,
      },
      include: {
        Question: {
          select: {
            id: true,
            FallNumber: {
              select: {
                Course: {
                  select: {
                    courseId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!answer) {
      throw new ForbiddenException('Answer not found');
    }
    const courseIds: number[] = answer.Question.FallNumber.Course.map(
      (course) => course.courseId,
    );
    const watching_courseId: number = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    if (!courseIds.includes(watching_courseId)) {
      throw new ForbiddenException(
        'This Answer does not belong to the course you are watching',
      );
    }
    const deletedAnswer = await this.databaseService.doubtAnswer.update({
      where: {
        id: answerId,
      },
      data: {
        isActive: false,
      },
    });
    return {
      message: 'Answer deleted successfully',
      deletedAnswer,
    };
  }

  async count(
    userId: number,
    platformId: number,
    getDoubtForumQuestionsDto: GetDoubtForumQuestionsDto,
  ) {
    const watching_courseId = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    const number = await this.databaseService.doubtQuestion.count({
      where: {
        isActive: null,
        PracticeQuestion: {
          practiceId: getDoubtForumQuestionsDto.practiceId,
        },
        FallNumber: {
          Course: {
            some: {
              courseId: watching_courseId,
            },
          },
          ...(getDoubtForumQuestionsDto.subjectIds?.length > 0 && {
            Subject: {
              some: {
                Subject: {
                  OR: [
                    {
                      id: {
                        in: getDoubtForumQuestionsDto.subjectIds,
                      },
                    },
                    {
                      Subject: {
                        OR: [
                          {
                            id: {
                              in: getDoubtForumQuestionsDto.subjectIds,
                            },
                          },
                          {
                            Subject: {
                              OR: [
                                {
                                  id: {
                                    in: getDoubtForumQuestionsDto.subjectIds,
                                  },
                                },
                                {
                                  Subject: {
                                    id: {
                                      in: getDoubtForumQuestionsDto.subjectIds,
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
          }),
        },
        ...(getDoubtForumQuestionsDto.type === 'unanswered' && {
          Answers: {
            none: {},
          },
        }),
        ...(getDoubtForumQuestionsDto.type === 'own' && {
          userId: userId,
        }),
        ...(getDoubtForumQuestionsDto.type === 'pinned' && {
          Pinned: {
            some: {
              userId: userId,
            },
          },
        }),
        OR: [
          {
            PracticeQuestion: null,
          },
          {
            PracticeQuestion: {
              PracticeQuestion: {
                Attempt: {
                  some: {
                    optionId: {
                      not: null,
                    },
                    Attempt: {
                      userId: userId,
                    },
                  },
                },
              },
            },
          },
        ],
      },
    });
    return { count: number };
  }

  async deleteQuestion(userId: number, questionId: number, platformId: number) {
    const question = await this.databaseService.doubtQuestion.findFirst({
      where: {
        isActive: null,
        id: questionId,
        userId: userId,
      },
      include: {
        FallNumber: {
          select: {
            Course: {
              select: {
                courseId: true,
              },
            },
          },
        },
      },
    });
    if (!question) {
      throw new ForbiddenException('Question not found');
    }
    const courseIds: number[] = question.FallNumber.Course.map(
      (course) => course.courseId,
    );
    const watching_courseId: number = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    if (!courseIds.includes(watching_courseId)) {
      throw new ForbiddenException(
        'This Question does not belong to the course you are watching',
      );
    }
    const deletedQuestion = await this.databaseService.doubtQuestion.update({
      where: {
        id: questionId,
      },
      data: {
        isActive: false,
      },
    });
    return {
      message: 'Question deleted successfully',
      deletedQuestion,
    };
  }

  async getSources(userId: number, platformId: number) {
    const watching_courseId = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    return this.databaseService.doubtForumSource.findMany({
      where: {
        courseId: watching_courseId,
      },
    });
  }

  async isInCourses(
    courseIds: number | number[],
    userId: number,
    platformId: number,
  ) {
    const cachedCourseIds: number[] = await this.cacheManager.get(
      `courses_${userId}_${platformId}`,
    );

    if (!cachedCourseIds) {
      return false;
    }
    const courseIdsArray = Array.isArray(courseIds) ? courseIds : [courseIds];
    const isInAnyCourse = courseIdsArray.some((courseId) =>
      cachedCourseIds.includes(courseId),
    );
    return isInAnyCourse;
  }

  async findAllSubject(userId: number, platformId: number, subjectId: number) {
    const watching_courseId = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    return this.databaseService.courseSubject.findMany({
      where: {
        id: subjectId ? subjectId : undefined,
        Course: {
          some: {
            courseId: watching_courseId,
          },
        },
        subjectId: subjectId ? undefined : null,
        Excluded: {
          none: {
            excludedFrom: 'doubtforum',
          },
        },
      },
      include: {
        FallNumber: {
          select: {
            fallId: true,
          },
        },
        Subjects: {
          where: {
            Excluded: {
              none: {
                excludedFrom: 'doubtforum',
              },
            },
          },
          include: {
            Subjects: {
              where: {
                Excluded: {
                  none: {
                    excludedFrom: 'doubtforum',
                  },
                },
              },
              include: {
                FallNumber: {
                  select: {
                    fallId: true,
                  },
                },
                Subjects: {
                  where: {
                    Excluded: {
                      none: {
                        excludedFrom: 'doubtforum',
                      },
                    },
                  },
                  include: {
                    FallNumber: {
                      select: {
                        fallId: true,
                      },
                    },
                    Subjects: {
                      where: {
                        Excluded: {
                          none: {
                            excludedFrom: 'doubtforum',
                          },
                        },
                      },
                      include: {
                        FallNumber: {
                          select: {
                            fallId: true,
                          },
                        },
                        Subjects: {
                          where: {
                            Excluded: {
                              none: {
                                excludedFrom: 'doubtforum',
                              },
                            },
                          },
                          include: {
                            FallNumber: {
                              select: {
                                fallId: true,
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

  async findAll(
    userId: number,
    platformId: number,
    getDoubtForumQuestionsDto: GetDoubtForumQuestionsDto,
  ) {
    const watching_courseId = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    return this.databaseService.doubtQuestion.findMany({
      where: {
        isActive: null,
        questionText: {
          contains: getDoubtForumQuestionsDto.search,
          mode: 'insensitive',
        },
        PracticeQuestion: {
          practiceId: getDoubtForumQuestionsDto.practiceId,
        },
        FallNumber: {
          Course: {
            some: {
              courseId: watching_courseId,
            },
          },
          ...(getDoubtForumQuestionsDto.subjectIds?.length > 0 && {
            Subject: {
              some: {
                Subject: {
                  OR: [
                    {
                      id: {
                        in: getDoubtForumQuestionsDto.subjectIds,
                      },
                    },
                    {
                      Subject: {
                        OR: [
                          {
                            id: {
                              in: getDoubtForumQuestionsDto.subjectIds,
                            },
                          },
                          {
                            Subject: {
                              OR: [
                                {
                                  id: {
                                    in: getDoubtForumQuestionsDto.subjectIds,
                                  },
                                },
                                {
                                  Subject: {
                                    id: {
                                      in: getDoubtForumQuestionsDto.subjectIds,
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
          }),
        },
        ...(getDoubtForumQuestionsDto.type === 'unanswered' && {
          Answers: {
            none: {},
          },
        }),
        ...(getDoubtForumQuestionsDto.type === 'own' && {
          userId: userId,
        }),
        ...(getDoubtForumQuestionsDto.type === 'pinned' && {
          Pinned: {
            some: {
              userId: userId,
            },
          },
        }),
        OR: [
          {
            PracticeQuestion: null,
          },
          {
            PracticeQuestion: {
              PracticeQuestion: {
                Attempt: {
                  some: {
                    Attempt: {
                      userId: userId,
                    },
                  },
                },
              },
            },
          },
        ],
      },
      take: 10,
      skip: getDoubtForumQuestionsDto.page
        ? getDoubtForumQuestionsDto.page * 10
        : 0,
      include: {
        PracticeQuestion: {
          select: {
            practiceId: true,
          },
        },
        Answers: {
          where: {
            userId: userId,
          },
          select: {
            id: true,
          },
          take: 1,
        },
        User: {
          select: {
            id: true,
            fname: true,
            lname: true,
            profile: true,
            RefreshTokens: {
              where: {
                platformId: platformId,
              },
              select: {
                isOnline: true,
                updatedAt: true,
              },
              take: 1,
            },
          },
        },
        _count: {
          select: {
            Answers: {
              where: {
                isActive: null,
              },
            },
            Views: true,
          },
        },
        Likes: {
          where: {
            userId: userId,
          },
          select: {
            questionId: true,
            liked: true,
          },
        },
        Pinned: {
          where: {
            userId: userId,
          },
          select: {
            questionId: true,
          },
        },
        Views: {
          where: {
            userId: userId,
          },
          select: {
            questionId: true,
          },
        },
        FallNumber: {
          select: {
            id: true,
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
                  ],
                },
              },
              select: {
                Subject: {
                  select: {
                    id: true,
                    name: true,
                    order: true,
                    type: true,
                    Subject: {
                      select: {
                        id: true,
                        name: true,
                        order: true,
                        type: true,
                        Subject: {
                          select: {
                            id: true,
                            name: true,
                            order: true,
                            type: true,
                            Subject: {
                              select: {
                                id: true,
                                name: true,
                                order: true,
                                type: true,
                                Subject: {
                                  select: {
                                    id: true,
                                    name: true,
                                    order: true,
                                    type: true,
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
      ...(getDoubtForumQuestionsDto.sort === undefined && {
        orderBy: {
          createdAt: 'desc',
        },
      }),
      ...(getDoubtForumQuestionsDto.sort === 'views' && {
        orderBy: {
          Views: {
            _count: 'desc',
          },
        },
      }),
      ...(getDoubtForumQuestionsDto.sort === 'oldest' && {
        orderBy: {
          createdAt: 'asc',
        },
      }),
      ...(getDoubtForumQuestionsDto.sort === 'like' && {
        orderBy: {
          likeCount: 'desc',
        },
      }),
    });
  }

  async findOne(userId: number, questionId: number, platformId: number) {
    if (!questionId) {
      throw new BadRequestException('Question ID is required');
    }
    const checkQuestion = await this.databaseService.doubtQuestion.findFirst({
      where: {
        id: questionId,
        isActive: null,
      },
      select: {
        FallNumber: {
          select: {
            Course: {
              select: {
                courseId: true,
              },
            },
          },
        },
      },
    });
    if (!checkQuestion) {
      throw new ForbiddenException('Question not found');
    }
    const courseIds: number[] = checkQuestion.FallNumber.Course.map(
      (course) => course.courseId,
    );
    const watching_courseId: number = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    if (!courseIds.includes(watching_courseId)) {
      throw new ForbiddenException(
        'This Question does not belong to the course you are watching',
      );
    }
    return this.databaseService.doubtQuestion.findFirst({
      where: {
        id: questionId,
      },
      include: {
        FallNumber: {
          select: {
            id: true,
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
                  ],
                },
              },
              select: {
                Subject: {
                  select: {
                    id: true,
                    name: true,
                    order: true,
                    type: true,
                    Subject: {
                      select: {
                        id: true,
                        name: true,
                        order: true,
                        type: true,
                        Subject: {
                          select: {
                            id: true,
                            name: true,
                            order: true,
                            type: true,
                            Subject: {
                              select: {
                                id: true,
                                name: true,
                                order: true,
                                type: true,
                                Subject: {
                                  select: {
                                    id: true,
                                    name: true,
                                    order: true,
                                    type: true,
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
        Source: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            Answers: true,
            Views: true,
          },
        },
        Likes: {
          where: {
            userId: userId,
          },
          select: {
            questionId: true,
            liked: true,
          },
        },
        Views: {
          where: {
            userId: userId,
          },
          select: {
            questionId: true,
          },
        },
        Pinned: {
          where: {
            userId: userId,
          },
          select: {
            questionId: true,
          },
        },
        User: {
          select: {
            id: true,
            fname: true,
            lname: true,
            profile: true,
            RefreshTokens: {
              where: {
                platformId: platformId,
              },
              select: {
                isOnline: true,
                updatedAt: true,
              },
              take: 1,
            },
          },
        },
        Answers: {
          where: {
            isActive: null,
          },
          include: {
            User: {
              select: {
                id: true,
                fname: true,
                lname: true,
                profile: true,
                RefreshTokens: {
                  where: {
                    platformId: platformId,
                  },
                  select: {
                    isOnline: true,
                    updatedAt: true,
                  },
                  take: 1,
                },
              },
            },
            Likes: {
              where: {
                userId: userId,
              },
              select: {
                answerId: true,
                liked: true,
              },
            },
          },
        },
        PracticeQuestion: {
          select: {
            PracticeQuestion: {
              select: {
                question: true,
                Question: true,
                Explaination: true,
                Attempt: {
                  where: {
                    Attempt: {
                      userId: userId,
                    },
                  },
                  select: {
                    optionId: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
                Option: {
                  select: {
                    Explaination: true,
                    id: true,
                    RightOption: true,
                    answer: true,
                    attachment: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async patchQuestion(
    userId: number,
    questionId: number,
    platformId: number,
    patchQuestionDto: PatchQuestionDto,
    uploadedFiles: Express.Multer.File[],
  ) {
    const question = await this.databaseService.doubtQuestion.findFirst({
      where: {
        isActive: null,
        id: questionId,
        userId: userId,
      },
      include: {
        FallNumber: {
          select: {
            Course: {
              select: {
                courseId: true,
              },
            },
          },
        },
      },
    });
    if (!question) {
      throw new ForbiddenException('Question not found');
    }
    const courseIds: number[] = question.FallNumber.Course.map(
      (course) => course.courseId,
    );
    const watching_courseId: number = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    if (!courseIds.includes(watching_courseId)) {
      throw new ForbiddenException(
        'This Question does not belong to the course you are watching',
      );
    }
    let uploadedAttachmentCount = 0;
    const uploadedFilesOfQuestion: any = question.attachments || []; // Ensure it's never null
    for (const file of uploadedFilesOfQuestion) {
      if (file.type === 'image') {
        uploadedAttachmentCount++;
      }
    }
    const removedAttachmentIds = patchQuestionDto.removedAttachments || [];
    let remainingAttachments = uploadedFilesOfQuestion.filter(
      (attachment: any) => !removedAttachmentIds.includes(attachment.link),
    );
    const existingImagesCount = remainingAttachments?.filter(
      (attachment: any) => attachment.type === 'image',
    ).length;
    const existingPdfCount = remainingAttachments?.filter(
      (attachment: any) => attachment.type === 'pdf',
    ).length;
    const newImagesCount = uploadedFiles?.filter((file: Express.Multer.File) =>
      file.mimetype.startsWith('image/'),
    ).length;
    const newPdfCount = uploadedFiles?.filter(
      (file: Express.Multer.File) => file.mimetype === 'application/pdf',
    ).length;
    const totalImages = existingImagesCount + newImagesCount;
    const totalPdf = existingPdfCount + newPdfCount;
    if (totalPdf > 0 && totalImages > 0) {
      throw new BadRequestException(
        'You cannot mix images and pdf attachments in one question.',
      );
    }
    if (totalPdf > 1) {
      throw new BadRequestException(
        'Only one pdf file is allowed per question.',
      );
    }
    if (totalImages > 5) {
      throw new BadRequestException(
        'A maximum of 5 images are allowed per question.',
      );
    }
    if (removedAttachmentIds.length > 0) {
      for (const removedAttachmentId of removedAttachmentIds) {
        await this.vultrService.deleteFromVultr(removedAttachmentId);
      }
    }
    if (uploadedFiles) {
      for (const file of uploadedFiles) {
        const randomString = uuidv4();
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `CRMTest/doubtforum/Question_${randomString}_${question.id}.${fileExtension}`;
        const uploadedFileVultr = await this.vultrService.uploadToVultr(
          fileName,
          file,
        );
        let fileType = 'image';
        if (file.mimetype === 'application/pdf') {
          fileType = 'pdf';
        }
        const uploadedFile = {
          link: uploadedFileVultr.Location,
          type: fileType,
        };
        remainingAttachments.push(uploadedFile);
      }
    }
    let source;
    if (patchQuestionDto.sourceId) {
      source = await this.databaseService.doubtForumSource.findFirst({
        where: {
          id: patchQuestionDto.sourceId,
          courseId: {
            in: courseIds,
          },
        },
      });
    }
    if (patchQuestionDto.fallNumber) {
      const fallnum = await this.databaseService.fallNumber.findFirst({
        where: {
          id: patchQuestionDto.fallNumber,
        },
        select: {
          Course: {
            select: {
              courseId: true,
            },
          },
        },
      });
      const fallnumCourseIds: number[] = fallnum.Course.map(
        (course) => course.courseId,
      );
      if (!fallnumCourseIds.includes(watching_courseId)) {
        throw new ForbiddenException(
          'This Question does not belong to the course you are watching',
        );
      }
    }
    let updatedQuestion = await this.databaseService.doubtQuestion.update({
      where: {
        id: questionId,
      },
      data: {
        questionText: patchQuestionDto.text ? patchQuestionDto.text : undefined,
        sourceId: source ? source.id : undefined,
        attachments: remainingAttachments,
        fallNumber: patchQuestionDto.fallNumber
          ? patchQuestionDto.fallNumber
          : undefined,
      },
      include: {
        FallNumber: {
          select: {
            id: true,
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
                  ],
                },
              },
              select: {
                Subject: {
                  select: {
                    id: true,
                    name: true,
                    order: true,
                    type: true,
                    Subject: {
                      select: {
                        id: true,
                        name: true,
                        order: true,
                        type: true,
                        Subject: {
                          select: {
                            id: true,
                            name: true,
                            order: true,
                            type: true,
                            Subject: {
                              select: {
                                id: true,
                                name: true,
                                order: true,
                                type: true,
                                Subject: {
                                  select: {
                                    id: true,
                                    name: true,
                                    order: true,
                                    type: true,
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
        PracticeQuestion: {
          select: {
            PracticeQuestion: {
              select: {
                question: true,
                Question: true,
                Explaination: true,
                Attempt: {
                  where: {
                    Attempt: {
                      userId: userId,
                    },
                  },
                  select: {
                    optionId: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
                Option: {
                  select: {
                    Explaination: true,
                    id: true,
                    RightOption: true,
                    answer: true,
                    attachment: true,
                  },
                },
              },
            },
          },
        },
        Source: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            Answers: true,
            Views: true,
          },
        },
        Likes: {
          where: {
            userId: userId,
          },
          select: {
            questionId: true,
            liked: true,
          },
        },
        Views: {
          where: {
            userId: userId,
          },
          select: {
            questionId: true,
          },
        },
        Pinned: {
          where: {
            userId: userId,
          },
          select: {
            questionId: true,
          },
        },
        User: {
          select: {
            id: true,
            fname: true,
            lname: true,
            profile: true,
          },
        },
        Answers: {
          include: {
            User: {
              select: {
                id: true,
                fname: true,
                lname: true,
                profile: true,
              },
            },
            Likes: {
              where: {
                userId: userId,
              },
              select: {
                answerId: true,
                liked: true,
              },
            },
          },
        },
      },
    });
    return { message: 'Question updated successfully', updatedQuestion };
  }

  async patchAnswer(
    userId: number,
    answerId: number,
    platformId: number,
    patchAnswerDto: PatchAnswerDto,
    uploadedFiles: Express.Multer.File[],
  ) {
    const answer = await this.databaseService.doubtAnswer.findFirst({
      where: {
        isActive: null,
        id: answerId,
        userId: userId,
      },
      include: {
        Question: {
          select: {
            id: true,
            FallNumber: {
              select: {
                Course: {
                  select: {
                    courseId: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!answer) {
      throw new ForbiddenException('Answer not found');
    }
    const courseIds: number[] = answer.Question.FallNumber.Course.map(
      (course) => course.courseId,
    );
    const watching_courseId: number = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    if (!courseIds.includes(watching_courseId)) {
      throw new ForbiddenException(
        'This Answer does not belong to the course you are watching',
      );
    }
    let uploadedAttachmentCount = 0;
    const uploadedFilesOfAnswer: any = answer.attachments || []; // Ensure it's never null
    for (const file of uploadedFilesOfAnswer) {
      if (file.type === 'image') {
        uploadedAttachmentCount++;
      }
    }
    const removedAttachmentIds = patchAnswerDto.removedAttachments || [];
    let remainingAttachments = uploadedFilesOfAnswer?.filter(
      (attachment: any) => !removedAttachmentIds.includes(attachment.link),
    );

    const existingImagesCount = remainingAttachments?.filter(
      (attachment: any) => attachment.type === 'image',
    ).length;
    const existingPdfCount = remainingAttachments?.filter(
      (attachment: any) => attachment.type === 'pdf',
    ).length;
    const newImagesCount = uploadedFiles?.filter((file: Express.Multer.File) =>
      file.mimetype.startsWith('image/'),
    ).length;
    const newPdfCount = uploadedFiles?.filter(
      (file: Express.Multer.File) => file.mimetype === 'application/pdf',
    ).length;
    const totalImages = existingImagesCount + newImagesCount;
    const totalPdf = existingPdfCount + newPdfCount;
    if (totalPdf > 0 && totalImages > 0) {
      throw new BadRequestException(
        'You cannot mix images and pdf attachments in one answer.',
      );
    }
    if (totalPdf > 1) {
      throw new BadRequestException('Only one pdf file is allowed per answer.');
    }
    if (totalImages > 5) {
      throw new BadRequestException(
        'A maximum of 5 images are allowed per answer.',
      );
    }
    if (removedAttachmentIds.length > 0) {
      for (const removedAttachmentId of removedAttachmentIds) {
        await this.vultrService.deleteFromVultr(removedAttachmentId);
      }
    }
    if (uploadedFiles) {
      for (const file of uploadedFiles) {
        const randomString = uuidv4();
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `CRMTest/doubtforum/Answer_${randomString}_${answer.id}.${fileExtension}`;
        const uploadedFileVultr = await this.vultrService.uploadToVultr(
          fileName,
          file,
        );
        let fileType = 'image';
        if (file.mimetype === 'application/pdf') {
          fileType = 'pdf';
        }
        const uploadedFile = {
          link: uploadedFileVultr.Location,
          type: fileType,
        };
        remainingAttachments.push(uploadedFile);
      }
    }
    let updatedAnswer = await this.databaseService.doubtAnswer.update({
      where: {
        id: answerId,
      },
      data: {
        answerText: patchAnswerDto.text,
        attachments: remainingAttachments,
      },
    });
    return { message: 'Answer updated successfully', updatedAnswer };
  }

  async postQuestion(
    userId: number,
    platformId: number,
    postQuestionDto: PostQuestionDto,
    uplodedFiles: Express.Multer.File[],
  ) {
    const fallnum = await this.databaseService.fallNumber.findFirst({
      where: {
        id: postQuestionDto.fallNumId,
      },
      select: {
        Course: {
          select: {
            courseId: true,
          },
        },
      },
    });
    const courseIds: number[] = fallnum.Course.map((course) => course.courseId);
    const watching_courseId: number = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    if (!courseIds.includes(watching_courseId)) {
      throw new ForbiddenException(
        'This Question does not belong to the course you are watching',
      );
    }
    if (postQuestionDto.practiceId) {
      const practice = await this.databaseService.practiceQuestion.findFirst({
        where: {
          id: postQuestionDto.practiceId,
        },
        include: {
          FallNumber: true,
        },
      });
      if (!practice) {
        throw new ForbiddenException('This practice question does not exist');
      }
      if (practice.FallNumber[0].fallNumberId !== postQuestionDto.fallNumId) {
        throw new ForbiddenException(
          'This practice question Fall number does not match',
        );
      }
    }
    let source;
    if (postQuestionDto.sourceId) {
      source = await this.databaseService.doubtForumSource.findFirst({
        where: {
          id: postQuestionDto.sourceId,
          courseId: {
            in: courseIds,
          },
        },
      });
    }
    let question = await this.databaseService.doubtQuestion.create({
      data: {
        questionText: postQuestionDto.question,
        fallNumber: postQuestionDto.fallNumId,
        userId: userId,
        sourceId: source?.id || null,
        likeCount: 0,
        dislikeCount: 0,
        Views: {
          create: {
            userId: userId,
          },
        },
        ...(postQuestionDto.practiceId && {
          PracticeQuestion: {
            create: {
              practiceId: postQuestionDto.practiceId,
            },
          },
        }),
      },
    });
    const uploadingfiles = [];
    if (uplodedFiles) {
      for (const file of uplodedFiles) {
        const randomString = uuidv4();
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `CRMTest/doubtforum/Question_${randomString}_${question.id}.${fileExtension}`;
        const uploadedFileVultr = await this.vultrService.uploadToVultr(
          fileName,
          file,
        );
        let fileType = 'image'; // Default to 'image'
        if (file.mimetype === 'application/pdf') {
          fileType = 'pdf'; // Change to 'pdf' if the file is a PDF
        }
        const uploadedFile = {
          link: uploadedFileVultr.Location,
          type: fileType,
        };
        uploadingfiles.push(uploadedFile);
      }
    }
    const givingQuestion = await this.databaseService.doubtQuestion.update({
      where: {
        id: question.id,
      },
      data: {
        attachments: uploadingfiles,
      },
      include: {
        FallNumber: {
          select: {
            id: true,
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
                  ],
                },
              },
              select: {
                Subject: {
                  select: {
                    id: true,
                    name: true,
                    order: true,
                    type: true,
                    Subject: {
                      select: {
                        id: true,
                        name: true,
                        order: true,
                        type: true,
                        Subject: {
                          select: {
                            id: true,
                            name: true,
                            order: true,
                            type: true,
                            Subject: {
                              select: {
                                id: true,
                                name: true,
                                order: true,
                                type: true,
                                Subject: {
                                  select: {
                                    id: true,
                                    name: true,
                                    order: true,
                                    type: true,
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
        Source: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            Answers: true,
            Views: true,
          },
        },
        Likes: {
          where: {
            userId: userId,
          },
          select: {
            questionId: true,
            liked: true,
          },
        },
        Views: {
          where: {
            userId: userId,
          },
          select: {
            questionId: true,
          },
        },
        Pinned: {
          where: {
            userId: userId,
          },
          select: {
            questionId: true,
          },
        },
        User: {
          select: {
            id: true,
            fname: true,
            lname: true,
            profile: true,
          },
        },
        Answers: {
          include: {
            User: {
              select: {
                id: true,
                fname: true,
                lname: true,
                profile: true,
              },
            },
            Likes: {
              where: {
                userId: userId,
              },
              select: {
                answerId: true,
                liked: true,
              },
            },
          },
        },
      },
    });

    return givingQuestion;
  }

  async likeQuestion(
    userId: number,
    questionId: number,
    platformId: number,
    type: string,
  ) {
    let like = await this.databaseService.doubtQuestionLike.findFirst({
      where: {
        userId: userId,
        questionId: questionId,
      },
    });
    if (like && type === 'like') {
      if (like.liked !== true) {
        await this.databaseService.doubtQuestionLike.update({
          where: {
            userId_questionId: {
              userId: userId,
              questionId: questionId,
            },
          },
          data: {
            liked: true,
          },
        });
        const showques = await this.databaseService.doubtQuestion.update({
          where: {
            id: questionId,
          },
          data: {
            likeCount: {
              increment: 1,
            },
            dislikeCount: {
              decrement: 1,
            },
          },
        });
        return {
          message: 'liked',
          like: showques.likeCount,
          dislike: showques.dislikeCount,
        };
      }
      return { message: 'already liked' };
    }
    if (like && type === 'dislike') {
      if (like.liked !== false) {
        await this.databaseService.doubtQuestionLike.update({
          where: {
            userId_questionId: {
              userId: userId,
              questionId: questionId,
            },
          },
          data: {
            liked: false,
          },
        });
        const showques = await this.databaseService.doubtQuestion.update({
          where: {
            id: questionId,
          },
          data: {
            likeCount: {
              decrement: 1,
            },
            dislikeCount: {
              increment: 1,
            },
          },
        });
        return {
          message: 'disliked',
          like: showques.likeCount,
          dislike: showques.dislikeCount,
        };
      }
      return { message: 'already disliked' };
    }
    if (like && type === undefined) {
      await this.databaseService.doubtQuestionLike.delete({
        where: {
          userId_questionId: {
            userId: userId,
            questionId: questionId,
          },
        },
      });
      if (like.liked === true) {
        await this.databaseService.doubtQuestion.update({
          where: {
            id: questionId,
          },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        });
      } else {
        await this.databaseService.doubtQuestion.update({
          where: {
            id: questionId,
          },
          data: {
            dislikeCount: {
              decrement: 1,
            },
          },
        });
      }
      return { message: 'unliked' };
    }
    const question = await this.databaseService.doubtQuestion.findFirst({
      where: {
        isActive: null,
        id: questionId,
      },
      select: {
        FallNumber: {
          select: {
            Course: {
              select: {
                courseId: true,
              },
            },
          },
        },
      },
    });
    if (!question) {
      throw new ForbiddenException('Question not found');
    }
    const courseIds: number[] = question.FallNumber.Course.map(
      (course) => course.courseId,
    );
    const watching_courseId: number = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    if (!courseIds.includes(watching_courseId)) {
      throw new ForbiddenException(
        'This Question does not belong to the course you are watching',
      );
    }
    like = await this.databaseService.doubtQuestionLike.create({
      data: {
        userId: userId,
        questionId: questionId,
        liked: type === 'like',
      },
    });
    let likeCount = 0;
    let dislikeCount = 0;
    if (type === 'like') {
      const showans = await this.databaseService.doubtQuestion.update({
        where: {
          id: questionId,
        },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });
      likeCount = showans.likeCount;
      dislikeCount = showans.dislikeCount;
    } else {
      const showans = await this.databaseService.doubtQuestion.update({
        where: {
          id: questionId,
        },
        data: {
          dislikeCount: {
            increment: 1,
          },
        },
      });
      likeCount = showans.likeCount;
      dislikeCount = showans.dislikeCount;
    }
    const message = type === 'like' ? 'liked' : 'disliked';
    return { message: message, like: likeCount, dislike: dislikeCount };
  }

  async viewQuestion(userId: number, questionId: number, platformId: number) {
    const hasViewed = await this.databaseService.doubtQuestionView.findFirst({
      where: {
        userId: userId,
        questionId: questionId,
      },
    });
    if (hasViewed) {
      return { message: 'Already viewed' };
    } else {
      const question = await this.databaseService.doubtQuestion.findFirst({
        where: {
          id: questionId,
        },
        select: {
          FallNumber: {
            select: {
              Course: {
                select: {
                  courseId: true,
                },
              },
            },
          },
        },
      });
      const courseIds: number[] = question.FallNumber.Course.map(
        (course) => course.courseId,
      );
      const watching_courseId: number = await this.cacheManager.get(
        `watching_course_${userId}_${platformId}`,
      );
      if (!watching_courseId) {
        throw new ForbiddenException('You are not watching any course');
      }
      if (!courseIds.includes(watching_courseId)) {
        throw new ForbiddenException(
          'This Question does not belong to the course you are watching',
        );
      }
      await this.databaseService.doubtQuestionView.create({
        data: {
          userId: userId,
          questionId: questionId,
        },
      });
      return { message: 'Viewed' };
    }
  }

  async pinQuestion(userId: number, questionId: number, platformId: number) {
    const pinned = await this.databaseService.doubtForumPin.findFirst({
      where: {
        userId: userId,
        questionId: questionId,
      },
    });
    if (pinned) {
      await this.databaseService.doubtForumPin.delete({
        where: {
          questionId_userId: {
            userId: userId,
            questionId: questionId,
          },
        },
      });
      return { message: 'Unpinned' };
    } else {
      const question = await this.databaseService.doubtQuestion.findFirst({
        where: {
          isActive: null,
          id: questionId,
        },
        select: {
          FallNumber: {
            select: {
              Course: {
                select: {
                  courseId: true,
                },
              },
            },
          },
        },
      });
      const courseIds: number[] = question.FallNumber.Course.map(
        (course) => course.courseId,
      );
      const watching_courseId: number = await this.cacheManager.get(
        `watching_course_${userId}_${platformId}`,
      );
      if (!watching_courseId) {
        throw new ForbiddenException('You are not watching any course');
      }
      if (!courseIds.includes(watching_courseId)) {
        throw new ForbiddenException(
          'This Question does not belong to the course you are watching',
        );
      }
      await this.databaseService.doubtForumPin.create({
        data: {
          userId: userId,
          questionId: questionId,
        },
      });
      return { message: 'Pinned' };
    }
  }

  async postAnswer(
    userId: number,
    questionId: number,
    platformId: number,
    postAnswerDto: PostAnswerDto,
    uploadedFiles: Express.Multer.File[],
  ) {
    const question = await this.databaseService.doubtQuestion.findFirst({
      where: {
        id: questionId,
        isActive: null,
      },
      select: {
        id: true,
        FallNumber: {
          select: {
            Course: {
              select: {
                courseId: true,
              },
            },
          },
        },
      },
    });
    const courseIds: number[] = question.FallNumber.Course.map(
      (course) => course.courseId,
    );
    const watching_courseId: number = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    if (!courseIds.includes(watching_courseId)) {
      throw new ForbiddenException(
        'This Question does not belong to the course you are watching',
      );
    }
    let answer = await this.databaseService.doubtAnswer.create({
      data: {
        answerText: postAnswerDto.answer,
        questionId: questionId,
        userId: userId,
        likeCount: 0,
        dislikeCount: 0,
      },
    });
    const uploadingfiles = [];
    if (uploadedFiles) {
      for (const file of uploadedFiles) {
        const randomString = uuidv4();
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `CRMTest/doubtforum/answer_${randomString}_${question.id}.${fileExtension}`;
        const uploadedFileVultr = await this.vultrService.uploadToVultr(
          fileName,
          file,
        );
        let fileType = 'image';
        if (file.mimetype === 'application/pdf') {
          fileType = 'pdf';
        }
        const uploadedFile = {
          link: uploadedFileVultr.Location,
          type: fileType,
        };
        uploadingfiles.push(uploadedFile);
      }
    }
    answer = await this.databaseService.doubtAnswer.update({
      where: {
        id: answer.id,
      },
      data: {
        attachments: uploadingfiles,
      },
    });
    return answer;
  }

  async likeAnswer(
    userid: number,
    answerId: number,
    platformid: number,
    type: string,
  ) {
    const like = await this.databaseService.doubtAnswerLike.findFirst({
      where: {
        userId: userid,
        answerId: answerId,
      },
    });
    if (like && type === 'like') {
      if (!like.liked) {
        await this.databaseService.doubtAnswerLike.update({
          where: {
            answerId_userId: {
              userId: userid,
              answerId: answerId,
            },
          },
          data: {
            liked: true,
          },
        });
        const shownans = await this.databaseService.doubtAnswer.update({
          where: {
            id: like.answerId,
          },
          data: {
            likeCount: {
              increment: 1,
            },
            dislikeCount: {
              decrement: 1,
            },
          },
        });
        return {
          message: 'liked',
          like: shownans.likeCount,
          dislike: shownans.dislikeCount,
        };
      }
      return { message: 'already liked' };
    }
    if (like && type === 'dislike') {
      if (like.liked) {
        await this.databaseService.doubtAnswerLike.update({
          where: {
            answerId_userId: {
              userId: userid,
              answerId: answerId,
            },
          },
          data: {
            liked: false,
          },
        });
        const shownans = await this.databaseService.doubtAnswer.update({
          where: {
            id: like.answerId,
          },
          data: {
            likeCount: {
              decrement: 1,
            },
            dislikeCount: {
              increment: 1,
            },
          },
        });
        return {
          message: 'disliked',
          like: shownans.likeCount,
          dislike: shownans.dislikeCount,
        };
      }
      return { message: 'already disliked' };
    }
    if (like && type === undefined) {
      await this.databaseService.doubtAnswerLike.delete({
        where: {
          answerId_userId: {
            userId: userid,
            answerId: answerId,
          },
        },
      });
      if (like.liked === true) {
        await this.databaseService.doubtAnswer.update({
          where: {
            id: answerId,
          },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        });
      } else {
        await this.databaseService.doubtAnswer.update({
          where: {
            id: answerId,
          },
          data: {
            dislikeCount: {
              decrement: 1,
            },
          },
        });
      }
      return { message: 'unliked' };
    }
    const answer = await this.databaseService.doubtAnswer.findFirst({
      where: {
        id: answerId,
        isActive: null,
      },
      select: {
        Question: {
          select: {
            FallNumber: {
              select: {
                Course: {
                  select: {
                    courseId: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!answer) {
      throw new ForbiddenException('Answer not found');
    }
    const courseIds: number[] = answer.Question.FallNumber.Course.map(
      (course) => course.courseId,
    );
    const watching_courseId: number = await this.cacheManager.get(
      `watching_course_${userid}_${platformid}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    if (!courseIds.includes(watching_courseId)) {
      throw new ForbiddenException(
        'This Question does not belong to the course you are watching',
      );
    }
    await this.databaseService.doubtAnswerLike.create({
      data: {
        userId: userid,
        answerId: answerId,
        liked: type === 'like',
      },
    });
    let likeCount = 0;
    let dislikeCount = 0;
    if (type === 'like') {
      const showans = await this.databaseService.doubtAnswer.update({
        where: {
          id: answerId,
        },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });
      likeCount = showans.likeCount;
      dislikeCount = showans.dislikeCount;
    } else {
      const showans = await this.databaseService.doubtAnswer.update({
        where: {
          id: answerId,
        },
        data: {
          dislikeCount: {
            increment: 1,
          },
        },
      });
      likeCount = showans.likeCount;
      dislikeCount = showans.dislikeCount;
    }
    const message = type === 'like' ? 'liked' : 'disliked';
    return { message: message, like: likeCount, dislike: dislikeCount };
  }

  async reportQuestion(
    userId: number,
    questionId: number,
    platformId: number,
    reason: string,
  ) {
    const alreadyReported =
      await this.databaseService.doubtQuestionReport.findFirst({
        where: {
          userId: userId,
          questionId: questionId,
        },
      });
    if (alreadyReported) {
      return { message: 'Already reported' };
    }
    const question = await this.databaseService.doubtQuestion.findFirst({
      where: {
        id: questionId,
        isActive: null,
      },
      select: {
        FallNumber: {
          select: {
            Course: {
              select: {
                courseId: true,
              },
            },
          },
        },
      },
    });
    if (!question) {
      throw new ForbiddenException('Question not found');
    }
    const courseIds: number[] = question.FallNumber.Course.map(
      (course) => course.courseId,
    );
    const watching_courseId: number = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    if (!courseIds.includes(watching_courseId)) {
      throw new ForbiddenException(
        'This Question does not belong to the course you are watching',
      );
    }
    await this.databaseService.doubtQuestionReport.create({
      data: {
        userId: userId,
        questionId: questionId,
        reason: reason,
      },
    });
    return { message: 'Reported' };
  }

  async reportAnswer(
    userId: number,
    answerId: number,
    platformId: number,
    reason: string,
  ) {
    const alreadyReportedAnswer =
      await this.databaseService.doubtAnswerReport.findFirst({
        where: {
          userId: userId,
          answerId: answerId,
        },
      });
    if (alreadyReportedAnswer) {
      return { message: 'Already reported' };
    }
    const answer = await this.databaseService.doubtAnswer.findFirst({
      where: {
        id: answerId,
        isActive: null,
      },
      select: {
        Question: {
          select: {
            FallNumber: {
              select: {
                Course: {
                  select: {
                    courseId: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!answer) {
      throw new ForbiddenException('Answer not found');
    }
    const courseIds: number[] = answer.Question.FallNumber.Course.map(
      (course) => course.courseId,
    );
    const watching_courseId: number = await this.cacheManager.get(
      `watching_course_${userId}_${platformId}`,
    );
    if (!watching_courseId) {
      throw new ForbiddenException('You are not watching any course');
    }
    if (!courseIds.includes(watching_courseId)) {
      throw new ForbiddenException(
        'This Answer does not belong to the course you are watching',
      );
    }
    await this.databaseService.doubtAnswerReport.create({
      data: {
        userId: userId,
        answerId: answerId,
        reason: reason,
      },
    });
    return { message: 'Reported' };
  }
}
