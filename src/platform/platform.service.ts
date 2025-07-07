import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { FaqQueryDto } from './dto/faq-query.dto';
import { CourseQueryDto } from './dto/course-query.dto';
import { DeliveryChargesDto } from './dto/delivery-charges.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { NoticeBoardPostDto } from './dto/notice-board-post.dto';
import { TestimonialQueryDto } from './dto/testimonial-query.dto';
import { PlatformFaqPostDto } from './dto/platform-faq-post.dto';
import { UserContactPostDto } from './dto/user-contact-post.dto';
import { PostTestimonialDto } from './dto/post-testimonial.dto';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { NotificationService } from 'src/notification/notification.service';
import { LeadService } from 'src/lead/lead.service';
import { CustomEmployeeSocketClient } from 'src/common/interface/custom-socket-employee-client.interface';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { EventRegisterPostDto } from './dto/event-register-post.dto';
import { EmailsService } from 'src/email/email.service';
import { GetPlatformSupportDto } from './dto/get-platform-support.dto';

@Injectable()
export class PlatformService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly httpService: HttpService,
    private readonly whatsappService: WhatsappService,
    private readonly notificationService: NotificationService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly leadService: LeadService,
    private readonly emailService: EmailsService,
  ) {}

  async getEmailIntrospect(email: string) {
    const user = await this.databaseService.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found with the given email');
    }
    const userMeta = await this.databaseService.courseUserMeta.findMany({
      where: {
        userId: user?.id,
      },
    });
    if (userMeta.length > 1) {
      await this.databaseService.courseUserMeta.updateMany({
        where: {
          userId: user.id,
        },
        data: {
          isCompleted: false,
        },
      });
      return;
    }
    if (userMeta.length === 0) {
      throw new NotFoundException('User meta not found with the given email');
    }
    await this.databaseService.courseUserMeta.update({
      where: {
        id: userMeta[0].id,
      },
      data: {
        isCompleted: true,
      },
    });
    return;
  }

  async getPlatformSupport(getPlatformSupportDto: GetPlatformSupportDto) {
    if (getPlatformSupportDto.email) {
      const email = await this.databaseService.employeeEmail.findFirst({
        where: {
          email: getPlatformSupportDto.email,
        },
      });
      if (!email) {
        throw new NotFoundException('This Email Does Not Belong To Us');
      }
      return { message: 'Email Exists' };
    }
    if (getPlatformSupportDto.mobile) {
      const mobile = await this.databaseService.employeeNumber.findFirst({
        where: {
          number: getPlatformSupportDto.mobile.toString(),
        },
      });
      if (!mobile) {
        throw new NotFoundException('This Mobile Does Not Belong To Us');
      }
      return { message: 'Mobile Exists' };
    }
  }

  getPlatform(platformid: number) {
    return this.databaseService.platform.findFirst({
      where: {
        id: platformid,
      },
      select: {
        name: true,
        origin: true,
        description: true,
        logo: true,
      },
    });
  }

  async sendTestMail() {
    const quizTemplate = await this.databaseService.quizTemplate.findMany({
      where: {
        name: 'oneDayQuizUpdate',
      },
    });
    for (const template of quizTemplate) {
      console.log('template', template);
      const email = 'amansonii.lg@gmail.com';
      const name = 'Durgesh Tiwari';
      await this.emailService.sendBrevoMail(
        name,
        email,
        template.senderEmail,
        template.senderEmail,
        Number(template.templateId),
        {
          fname: name,
        },
      );
    }
  }

  async updateEventRegistration(
    userid: number,
    platformId: number,
    eventRegisterPostDto: EventRegisterPostDto,
  ) {
    const event = await this.databaseService.events.findFirst({
      where: {
        id: eventRegisterPostDto.eventId,
        CourseNdPlatform: {
          some: {
            platformId: platformId,
          },
        },
        User: {
          some: {
            userId: userid,
          },
        },
      },
    });
    if (!event) {
      throw new NotFoundException('Event not found with the given search');
    }
    let eventRegistration = await this.databaseService.eventToUser.findFirst({
      where: {
        eventId: eventRegisterPostDto.eventId,
        userId: userid,
      },
    });
    let registerJson: any = eventRegistration.responseJson;
    if (eventRegisterPostDto.attending !== undefined) {
      registerJson.attending = eventRegisterPostDto.attending;
    }
    if (eventRegisterPostDto.discussionPoint !== undefined) {
      registerJson.discussionPoint = eventRegisterPostDto.discussionPoint;
    }
    if (eventRegisterPostDto.importantQuestion !== undefined) {
      registerJson.importantQuestion = eventRegisterPostDto.importantQuestion;
    }
    if (eventRegisterPostDto.locationId !== undefined) {
      const location = await this.databaseService.eventLocation.findFirst({
        where: {
          id: eventRegisterPostDto.locationId,
          eventId: eventRegisterPostDto.eventId,
        },
      });
      if (!location) {
        throw new NotFoundException('Location not found with the given search');
      }
    }
    eventRegistration = await this.databaseService.eventToUser.update({
      where: {
        id: eventRegistration.id,
      },
      data: {
        responseJson: registerJson,
        locationId: eventRegisterPostDto.locationId,
      },
    });
    // const registerJson = {
    //   attending: eventRegisterPostDto.attending,
    //   discussionPoint: eventRegisterPostDto.discussionPoint,
    //   importantQuestion: eventRegisterPostDto.importantQuestion,
    // };
    return {
      message: 'Event registration updated successfully',
      eventRegistration,
    };
  }

  // getPlatformPayment() {
  //   return this.databaseService.userPayments.findMany({
  //     where: {
  //       status: 'success',
  //     },
  //   });
  // }

  async getAllCourses(platformId: number) {
    return this.databaseService.course.findMany({
      where: {
        courseId: null,
        AND: [
          {
            OR: [
              {
                Platform: {
                  some: {
                    platformId: platformId,
                  },
                },
              },
              {
                Courses: {
                  some: {
                    OR: [
                      {
                        Platform: {
                          some: {
                            platformId: platformId,
                          },
                        },
                      },
                      {
                        Courses: {
                          some: {
                            OR: [
                              {
                                Platform: {
                                  some: {
                                    platformId: platformId,
                                  },
                                },
                              },
                              {
                                Courses: {
                                  some: {
                                    OR: [
                                      {
                                        Platform: {
                                          some: {
                                            platformId: platformId,
                                          },
                                        },
                                      },
                                      {
                                        Courses: {
                                          some: {
                                            Platform: {
                                              some: {
                                                platformId: platformId,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    ],
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        Courses: {
          include: {
            Courses: {
              include: {
                Courses: {
                  include: {
                    Courses: {
                      include: {
                        Courses: true,
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

  async getDeviceId(deviceId: string) {
    return this.notificationService.sendNotification(
      '/user',
      'user_device_' + `_platform_8_` + deviceId,
      'device-unregistered',
      { removed: true },
    );
  }

  async findCourses(platformId: number, courseQueryDto: CourseQueryDto) {
    let searchString: string[] = [];
    let isPurchasable: boolean;
    let course: any;

    if (courseQueryDto.courseSearchString !== undefined) {
      courseQueryDto.courseSearchString =
        courseQueryDto.courseSearchString.toUpperCase();
      searchString = courseQueryDto.courseSearchString.split('/');
      course = await this.databaseService.course.findFirst({
        where: {
          isActive: null,
          AND: [
            {
              OR: [
                {
                  abbr: {
                    equals:
                      courseQueryDto.courseSearchString !== undefined &&
                      searchString.length > 0
                        ? searchString[searchString.length - 1]
                        : undefined,
                    mode: 'insensitive',
                  },
                },
                {
                  name: {
                    equals:
                      courseQueryDto.courseSearchString !== undefined &&
                      searchString.length > 0
                        ? searchString[searchString.length - 1]
                        : undefined,
                    mode: 'insensitive',
                  },
                },
              ],
              ...(searchString.length > 1 && {
                Course: {
                  OR: [
                    {
                      abbr: {
                        equals:
                          courseQueryDto.courseSearchString !== undefined &&
                          searchString.length > 1
                            ? searchString[searchString.length - 2]
                            : undefined,
                        mode: 'insensitive',
                      },
                    },
                    {
                      name: {
                        equals:
                          courseQueryDto.courseSearchString !== undefined &&
                          searchString.length > 1
                            ? searchString[searchString.length - 2]
                            : undefined,
                        mode: 'insensitive',
                      },
                    },
                  ],
                  ...(searchString.length > 2 && {
                    Course: {
                      OR: [
                        {
                          abbr: {
                            equals:
                              courseQueryDto.courseSearchString !== undefined &&
                              searchString.length > 2
                                ? searchString[searchString.length - 3]
                                : undefined,
                            mode: 'insensitive',
                          },
                        },
                        {
                          name: {
                            equals:
                              courseQueryDto.courseSearchString !== undefined &&
                              searchString.length > 2
                                ? searchString[searchString.length - 3]
                                : undefined,
                            mode: 'insensitive',
                          },
                        },
                      ],

                      ...(searchString.length > 3 && {
                        Course: {
                          OR: [
                            {
                              abbr: {
                                equals:
                                  courseQueryDto.courseSearchString !==
                                    undefined && searchString.length > 3
                                    ? searchString[searchString.length - 4]
                                    : undefined,
                                mode: 'insensitive',
                              },
                            },
                            {
                              name: {
                                equals:
                                  courseQueryDto.courseSearchString !==
                                    undefined && searchString.length > 3
                                    ? searchString[searchString.length - 4]
                                    : undefined,
                                mode: 'insensitive',
                              },
                            },
                          ],
                          ...(searchString.length > 4 && {
                            Course: {
                              OR: [
                                {
                                  abbr: {
                                    equals:
                                      courseQueryDto.courseSearchString !==
                                        undefined && searchString.length > 4
                                        ? searchString[searchString.length - 5]
                                        : undefined,
                                    mode: 'insensitive',
                                  },
                                },
                                {
                                  name: {
                                    equals:
                                      courseQueryDto.courseSearchString !==
                                        undefined && searchString.length > 4
                                        ? searchString[searchString.length - 5]
                                        : undefined,
                                    mode: 'insensitive',
                                  },
                                },
                              ],
                            },
                          }),
                        },
                      }),
                    },
                  }),
                },
              }),
            },
            {
              OR: [
                {
                  Platform: {
                    some: {
                      platformId: platformId,
                    },
                  },
                },
                {
                  Courses: {
                    some: {
                      OR: [
                        {
                          Platform: {
                            some: {
                              platformId: platformId,
                            },
                          },
                        },
                        {
                          Courses: {
                            some: {
                              OR: [
                                {
                                  Platform: {
                                    some: {
                                      platformId: platformId,
                                    },
                                  },
                                },
                                {
                                  Courses: {
                                    some: {
                                      OR: [
                                        {
                                          Platform: {
                                            some: {
                                              platformId: platformId,
                                            },
                                          },
                                        },
                                        {
                                          Courses: {
                                            some: {
                                              Platform: {
                                                some: {
                                                  platformId: platformId,
                                                },
                                              },
                                            },
                                          },
                                        },
                                      ],
                                    },
                                  },
                                },
                              ],
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          ],
        },
        include: {
          Meta: true,
        },
      });
    }

    if (!course && courseQueryDto.courseSearchString !== undefined) {
      throw new NotFoundException('Course not found with the given search');
    }
    if (courseQueryDto.courseId !== undefined) {
      course = await this.databaseService.course.findFirst({
        where: {
          id: courseQueryDto.courseId,
          Platform: {
            some: {
              platformId: platformId,
            },
          },
        },
        include: {
          Meta: true,
        },
      });
      courseQueryDto.courseId = course.id;
      isPurchasable = course.Meta[0]?.purchasable;
    }
    const expirynnew = new Date(new Date().setDate(new Date().getDate() + 15));
    if (course && courseQueryDto.courseSearchString !== undefined) {
      courseQueryDto.courseId = course.id;
      isPurchasable = course.Meta[0]?.purchasable;
    }

    return this.databaseService.course.findMany({
      where: {
        id: courseQueryDto.courseId,
        isActive: null,
        courseId: courseQueryDto.courseId !== undefined ? undefined : null,
        AND: [
          {
            OR: [
              {
                Platform: {
                  some: {
                    platformId: platformId,
                  },
                },
              },
              {
                Courses: {
                  some: {
                    OR: [
                      {
                        Platform: {
                          some: {
                            platformId: platformId,
                          },
                        },
                      },
                      {
                        Courses: {
                          some: {
                            OR: [
                              {
                                Platform: {
                                  some: {
                                    platformId: platformId,
                                  },
                                },
                              },
                              {
                                Courses: {
                                  some: {
                                    OR: [
                                      {
                                        Platform: {
                                          some: {
                                            platformId: platformId,
                                          },
                                        },
                                      },
                                      {
                                        Courses: {
                                          some: {
                                            Platform: {
                                              some: {
                                                platformId: platformId,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    ],
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
          {
            OR: [
              { expiry: null },
              {
                expiry: {
                  gte: expirynnew,
                },
              },
            ],
          },
          {
            OR: [{ isActive: null }, { isActive: true }],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        abbr: true,
        courseId: true,
        type: true,
        Meta: true,
        includeParent: true,
        ...(!isPurchasable && {
          Course: {
            where: {
              Meta: {
                some: {
                  purchasable: true,
                },
              },
            },
            include: {
              Course: {
                include: {
                  Course: {
                    include: {
                      Course: true,
                    },
                  },
                },
              },
            },
          },
        }),
        Options: {
          where: {
            key: courseQueryDto.key !== undefined ? courseQueryDto.key : '',
          },
        },
        ...(isPurchasable && {
          ExtraOptions: {
            include: {
              Options: isPurchasable,
            },
          },
          Course: {
            include: {
              Meta: true,
              Course: {
                include: {
                  Meta: true,
                  Course: {
                    include: {
                      Meta: true,
                      Course: true,
                    },
                  },
                },
              },
            },
          },
        }),
        Courses: {
          where: {
            AND: [
              {
                OR: [
                  { expiry: null },
                  {
                    expiry: {
                      gte: expirynnew,
                    },
                  },
                ],
              },
              {
                OR: [{ isActive: null }, { isActive: true }],
              },
            ],
          },
          orderBy: {
            order: 'asc',
          },
          select: {
            id: true,
            name: true,
            abbr: true,
            courseId: true,
            type: true,
            Meta: true,
            includeParent: true,
            Options: {
              where: {
                key: courseQueryDto.key !== undefined ? courseQueryDto.key : '',
              },
            },
            ...(isPurchasable && {
              ExtraOptions: {
                include: {
                  Options: isPurchasable,
                },
              },
            }),
            Courses: {
              where: {
                AND: [
                  {
                    OR: [
                      { expiry: null },
                      {
                        expiry: {
                          gte: expirynnew,
                        },
                      },
                    ],
                  },
                  {
                    OR: [{ isActive: null }, { isActive: true }],
                  },
                ],
              },
              orderBy: {
                order: 'asc',
              },
              select: {
                id: true,
                name: true,
                abbr: true,
                courseId: true,
                type: true,
                Meta: true,
                includeParent: true,
                Options: {
                  where: {
                    key:
                      courseQueryDto.key !== undefined
                        ? courseQueryDto.key
                        : '',
                  },
                },
                ...(isPurchasable && {
                  ExtraOptions: {
                    include: {
                      Options: isPurchasable,
                    },
                  },
                }),
                Courses: {
                  where: {
                    AND: [
                      {
                        OR: [
                          { expiry: null },
                          {
                            expiry: {
                              gte: expirynnew,
                            },
                          },
                        ],
                      },
                      {
                        OR: [{ isActive: null }, { isActive: true }],
                      },
                    ],
                  },
                  orderBy: {
                    order: 'asc',
                  },
                  select: {
                    id: true,
                    name: true,
                    abbr: true,
                    courseId: true,
                    type: true,
                    includeParent: true,
                    Options: {
                      where: {
                        key:
                          courseQueryDto.key !== undefined
                            ? courseQueryDto.key
                            : '',
                      },
                    },
                    ...(isPurchasable && {
                      ExtraOptions: {
                        include: {
                          Options: isPurchasable,
                        },
                      },
                    }),
                    Meta: true,
                    Courses: {
                      where: {
                        AND: [
                          {
                            OR: [
                              { expiry: null },
                              {
                                expiry: {
                                  gte: expirynnew,
                                },
                              },
                            ],
                          },
                          {
                            OR: [{ isActive: null }, { isActive: true }],
                          },
                        ],
                      },
                      orderBy: {
                        order: 'asc',
                      },
                      select: {
                        id: true,
                        name: true,
                        abbr: true,
                        courseId: true,
                        includeParent: true,
                        type: true,
                        Meta: true,
                        Options: {
                          where: {
                            key:
                              courseQueryDto.key !== undefined
                                ? courseQueryDto.key
                                : '',
                          },
                        },
                        ...(isPurchasable && {
                          ExtraOptions: {
                            include: {
                              Options: isPurchasable,
                            },
                          },
                        }),
                        Courses: {
                          where: {
                            AND: [
                              {
                                OR: [
                                  { expiry: null },
                                  {
                                    expiry: {
                                      gte: expirynnew,
                                    },
                                  },
                                ],
                              },
                              {
                                OR: [{ isActive: null }, { isActive: true }],
                              },
                            ],
                          },
                          orderBy: {
                            order: 'asc',
                          },
                          select: {
                            id: true,
                            name: true,
                            abbr: true,
                            courseId: true,
                            type: true,
                            includeParent: true,
                            Options: {
                              where: {
                                key:
                                  courseQueryDto.key !== undefined
                                    ? courseQueryDto.key
                                    : '',
                              },
                            },
                            ...(isPurchasable && {
                              ExtraOptions: {
                                include: {
                                  Options: isPurchasable,
                                },
                              },
                            }),
                            Meta: true,
                            Courses: {
                              where: {
                                AND: [
                                  {
                                    OR: [
                                      { expiry: null },
                                      {
                                        expiry: {
                                          gte: expirynnew,
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    OR: [
                                      { isActive: null },
                                      { isActive: true },
                                    ],
                                  },
                                ],
                              },
                              orderBy: {
                                order: 'asc',
                              },
                              select: {
                                id: true,
                                name: true,
                                abbr: true,
                                courseId: true,
                                includeParent: true,
                                type: true,
                                Meta: true,
                                Options: {
                                  where: {
                                    key:
                                      courseQueryDto.key !== undefined
                                        ? courseQueryDto.key
                                        : '',
                                  },
                                },
                                ...(isPurchasable && {
                                  ExtraOptions: {
                                    include: {
                                      Options: isPurchasable,
                                    },
                                  },
                                }),
                                Courses: {
                                  where: {
                                    AND: [
                                      {
                                        OR: [
                                          { expiry: null },
                                          {
                                            expiry: {
                                              gte: expirynnew,
                                            },
                                          },
                                        ],
                                      },
                                      {
                                        OR: [
                                          { isActive: null },
                                          { isActive: true },
                                        ],
                                      },
                                    ],
                                  },
                                  orderBy: {
                                    order: 'asc',
                                  },
                                  select: {
                                    id: true,
                                    name: true,
                                    abbr: true,
                                    courseId: true,
                                    includeParent: true,
                                    type: true,
                                    Options: {
                                      where: {
                                        key:
                                          courseQueryDto.key !== undefined
                                            ? courseQueryDto.key
                                            : '',
                                      },
                                    },
                                    ...(isPurchasable && {
                                      ExtraOptions: {
                                        include: {
                                          Options: isPurchasable,
                                        },
                                      },
                                    }),
                                    Meta: true,
                                    Courses: {
                                      where: {
                                        AND: [
                                          {
                                            OR: [
                                              { expiry: null },
                                              {
                                                expiry: {
                                                  gte: expirynnew,
                                                },
                                              },
                                            ],
                                          },
                                          {
                                            OR: [
                                              { isActive: null },
                                              { isActive: true },
                                            ],
                                          },
                                        ],
                                      },
                                      orderBy: {
                                        order: 'asc',
                                      },
                                      select: {
                                        id: true,
                                        name: true,
                                        abbr: true,
                                        courseId: true,
                                        type: true,
                                        includeParent: true,
                                        Meta: true,
                                        Options: {
                                          where: {
                                            key:
                                              courseQueryDto.key !== undefined
                                                ? courseQueryDto.key
                                                : '',
                                          },
                                        },
                                        ...(isPurchasable && {
                                          ExtraOptions: {
                                            include: {
                                              Options: isPurchasable,
                                            },
                                          },
                                        }),
                                        Courses: {
                                          where: {
                                            AND: [
                                              {
                                                OR: [
                                                  { expiry: null },
                                                  {
                                                    expiry: {
                                                      gte: expirynnew,
                                                    },
                                                  },
                                                ],
                                              },
                                              {
                                                OR: [
                                                  { isActive: null },
                                                  { isActive: true },
                                                ],
                                              },
                                            ],
                                          },
                                          orderBy: {
                                            order: 'asc',
                                          },
                                          select: {
                                            id: true,
                                            name: true,
                                            abbr: true,
                                            courseId: true,
                                            includeParent: true,
                                            type: true,
                                            Options: {
                                              where: {
                                                key:
                                                  courseQueryDto.key !==
                                                  undefined
                                                    ? courseQueryDto.key
                                                    : '',
                                              },
                                            },
                                            ...(isPurchasable && {
                                              ExtraOptions: {
                                                include: {
                                                  Options: isPurchasable,
                                                },
                                              },
                                            }),
                                            Meta: true,
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

  async findProducts(platformid: number, productQueryDto: ProductQueryDto) {
    let searchString: string[] = [];
    let isPurchasable: boolean;
    let product: any;
    if (productQueryDto.productSearchString !== undefined) {
      searchString = productQueryDto.productSearchString.split('/');
      product = await this.databaseService.product.findFirst({
        where: {
          AND: [
            {
              OR: [
                {
                  abbr: {
                    equals:
                      productQueryDto.productSearchString !== undefined &&
                      searchString.length > 0
                        ? searchString[searchString.length - 1]
                        : undefined,
                    mode: 'insensitive',
                  },
                },
                {
                  name: {
                    equals:
                      productQueryDto.productSearchString !== undefined &&
                      searchString.length > 0
                        ? searchString[searchString.length - 1]
                        : undefined,
                    mode: 'insensitive',
                  },
                },
              ],
            },
            {
              OR: [
                {
                  Platform: {
                    some: {
                      platformId: platformid,
                    },
                  },
                },
                {
                  Products: {
                    some: {
                      OR: [
                        {
                          Platform: {
                            some: {
                              platformId: platformid,
                            },
                          },
                        },
                        {
                          Products: {
                            some: {
                              OR: [
                                {
                                  Platform: {
                                    some: {
                                      platformId: platformid,
                                    },
                                  },
                                },
                                {
                                  Products: {
                                    some: {
                                      Platform: {
                                        some: {
                                          platformId: platformid,
                                        },
                                      },
                                    },
                                  },
                                },
                              ],
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          ],
        },
        include: {
          Meta: true,
        },
      });
    }
    if (!product && productQueryDto.productSearchString !== undefined) {
      throw new NotFoundException('Product not found with the given search');
    }
    if (product && productQueryDto.productSearchString !== undefined) {
      productQueryDto.productId = product.id;
      isPurchasable = product.Meta[0]?.purchasable;
    }
    return this.databaseService.product.findMany({
      where: {
        id: productQueryDto.productId,
        productId: productQueryDto.productId !== undefined ? undefined : null,
        AND: [
          {
            OR: [
              {
                Platform: {
                  some: {
                    platformId: platformid,
                  },
                },
              },
              {
                Products: {
                  some: {
                    OR: [
                      {
                        Platform: {
                          some: {
                            platformId: platformid,
                          },
                        },
                      },
                      {
                        Products: {
                          some: {
                            OR: [
                              {
                                Platform: {
                                  some: {
                                    platformId: platformid,
                                  },
                                },
                              },
                              {
                                Products: {
                                  some: {
                                    Platform: {
                                      some: {
                                        platformId: platformid,
                                      },
                                    },
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        Meta: true,
        ...(productQueryDto.key !== undefined && {
          Options: {
            where: {
              key: productQueryDto.key !== undefined ? productQueryDto.key : '',
            },
          },
        }),
        ...(isPurchasable && {
          ExtraOption: {
            include: {
              Options: isPurchasable,
            },
          },
        }),
      },
    });
  }

  async getNoticeBoard(
    platformId: number,
    startDate: Date,
    endDate: Date,
    courseId: number,
    userId: number,
    key: string,
    type: string,
    galleryKey: string,
    eventId: number,
    eventName: string,
  ) {
    const notices = await this.databaseService.events.findMany({
      where: {
        type: type,
        id: eventId,
        title: eventName,
        AND: [
          {
            OR: [
              {
                startDate: {
                  gte: startDate,
                  lte: endDate,
                },
              },

              {
                endDate: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            ],
          },
          {
            OR: [
              {
                CourseNdPlatform: {
                  some: {
                    platformId: platformId,
                    courseId: null,
                  },
                },
              },
              {
                CourseNdPlatform: {
                  some: {
                    platformId: platformId,
                    Course: {
                      OR: [
                        {
                          id: courseId,
                          OR: [
                            {
                              Platform: {
                                some: {
                                  platformId: platformId,
                                },
                              },
                            },
                            {
                              Course: {
                                OR: [
                                  {
                                    Platform: {
                                      some: {
                                        platformId: platformId,
                                      },
                                    },
                                  },
                                  {
                                    Course: {
                                      OR: [
                                        {
                                          Platform: {
                                            some: {
                                              platformId: platformId,
                                            },
                                          },
                                        },
                                        {
                                          Course: {
                                            OR: [
                                              {
                                                Platform: {
                                                  some: {
                                                    platformId: platformId,
                                                  },
                                                },
                                              },
                                              {
                                                Course: {
                                                  Platform: {
                                                    some: {
                                                      platformId: platformId,
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
                        {
                          Course: {
                            OR: [
                              {
                                id: courseId,
                                OR: [
                                  {
                                    Platform: {
                                      some: {
                                        platformId: platformId,
                                      },
                                    },
                                  },
                                  {
                                    Course: {
                                      OR: [
                                        {
                                          Platform: {
                                            some: {
                                              platformId: platformId,
                                            },
                                          },
                                        },
                                        {
                                          Course: {
                                            OR: [
                                              {
                                                Platform: {
                                                  some: {
                                                    platformId: platformId,
                                                  },
                                                },
                                              },
                                              {
                                                Course: {
                                                  OR: [
                                                    {
                                                      Platform: {
                                                        some: {
                                                          platformId:
                                                            platformId,
                                                        },
                                                      },
                                                    },
                                                    {
                                                      Course: {
                                                        Platform: {
                                                          some: {
                                                            platformId:
                                                              platformId,
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
                              {
                                Course: {
                                  id: courseId,
                                  OR: [
                                    {
                                      Platform: {
                                        some: {
                                          platformId: platformId,
                                        },
                                      },
                                    },
                                    {
                                      Course: {
                                        OR: [
                                          {
                                            Platform: {
                                              some: {
                                                platformId: platformId,
                                              },
                                            },
                                          },
                                          {
                                            Course: {
                                              OR: [
                                                {
                                                  Platform: {
                                                    some: {
                                                      platformId: platformId,
                                                    },
                                                  },
                                                },
                                                {
                                                  Course: {
                                                    OR: [
                                                      {
                                                        Platform: {
                                                          some: {
                                                            platformId:
                                                              platformId,
                                                          },
                                                        },
                                                      },
                                                      {
                                                        Course: {
                                                          Platform: {
                                                            some: {
                                                              platformId:
                                                                platformId,
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
                      ],
                    },
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        Meta: true,
        Location: true,
        Options: {
          where: {
            key: key !== undefined ? key : '',
          },
        },
        ...(galleryKey === 'featured' && {
          Gallery: {
            where: {
              featured: true,
            },
            include: {
              Gallery: true,
            },
          },
        }),
        ...(galleryKey === 'all' && {
          Gallery: {
            include: {
              Gallery: true,
            },
          },
        }),
        ...(userId && {
          User: {
            where: {
              userId: userId,
            },
          },
        }),
        CourseNdPlatform: {
          select: {
            Course: {
              include: {
                Course: {
                  include: {
                    Course: {
                      include: {
                        Course: {
                          include: {
                            Course: true,
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
    return notices;
  }

  async getFaqOptional(createFaqDto: CreateFaqDto, platformId: number) {
    let Faq = await this.databaseService.faqSubject.findFirst({
      where: {
        heading: createFaqDto.type,
        PlatformNdCourse: {
          some: {
            platformId: platformId,
          },
        },
      },
    });
    if (!Faq) {
      Faq = await this.databaseService.faqSubject.create({
        data: {
          heading: createFaqDto.type,
          PlatformNdCourse: {
            create: {
              platformId: platformId,
            },
          },
        },
      });
    }
    let Course = await this.databaseService.faqSubject.findFirst({
      where: {
        heading: createFaqDto.courseAbbr,
        faqSubjectId: Faq.id,
      },
    });
    if (!Course) {
      Course = await this.databaseService.faqSubject.create({
        data: {
          heading: createFaqDto.courseAbbr,
          faqSubjectId: Faq.id,
        },
      });
    }
    let Session = await this.databaseService.faqSubject.findFirst({
      where: {
        heading: createFaqDto.session,
        faqSubjectId: Course.id,
      },
    });
    if (!Session) {
      Session = await this.databaseService.faqSubject.create({
        data: {
          heading: createFaqDto.session,
          faqSubjectId: Course.id,
        },
      });
    }
    let Subject = await this.databaseService.faqSubject.findFirst({
      where: {
        heading: createFaqDto.subject,
        faqSubjectId: Session.id,
      },
    });
    if (!Subject) {
      Subject = await this.databaseService.faqSubject.create({
        data: {
          heading: createFaqDto.subject,
          faqSubjectId: Session.id,
        },
      });
    }
    let topic = await this.databaseService.faqQuestion.create({
      data: {
        question: createFaqDto.topic,
        subjectId: Subject.id,
        answer: createFaqDto.los,
      },
    });
    return topic;
  }

  async getNewFaq(
    platformId: number,
    userid: number,
    faqQueryDto: FaqQueryDto,
  ) {
    let searchString: string[] = [];
    let faq;
    if (faqQueryDto.url !== undefined) {
      searchString = faqQueryDto.url.split('/');
      faq = await this.databaseService.faqSubject.findFirst({
        where: {
          heading: {
            equals: searchString[searchString.length - 1],
            mode: 'insensitive',
          },
        },
      });
      if (!faq) {
        throw new NotFoundException('FAQ not found with the given search');
      }
    }
    return this.databaseService.faqSubject.findFirst({
      where: {
        heading: searchString.length > 0 ? undefined : faqQueryDto.type,
        id: faqQueryDto.url !== undefined ? faq.id : undefined,
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        Subjects: {
          orderBy: {
            order: 'asc',
          },
          include: {
            Subjects: {
              orderBy: {
                order: 'asc',
              },
              include: {
                Subjects: {
                  orderBy: {
                    order: 'asc',
                  },
                  include: {
                    Subjects: {
                      orderBy: {
                        order: 'asc',
                      },
                      include: {
                        Content: {
                          select: {
                            id: true,
                            name: true,
                            description: true,
                            link: true,
                            videoLink: true,
                            type: true,
                            protectedVideoLink: userid !== 0 ? true : false,
                            protectedLink: userid !== 0 ? true : false,
                          },
                        },
                        Questions: {
                          orderBy: {
                            order: 'asc',
                          },
                        },
                      },
                    },
                    Content: {
                      select: {
                        id: true,
                        name: true,
                        description: true,
                        link: true,
                        videoLink: true,
                        type: true,
                        protectedVideoLink: userid !== 0 ? true : false,
                        protectedLink: userid !== 0 ? true : false,
                      },
                    },
                    Questions: {
                      orderBy: {
                        order: 'asc',
                      },
                    },
                  },
                },
                Content: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    link: true,
                    videoLink: true,
                    type: true,
                    protectedVideoLink: userid !== 0 ? true : false,
                    protectedLink: userid !== 0 ? true : false,
                  },
                },
                Questions: {
                  orderBy: {
                    order: 'asc',
                  },
                },
              },
            },
            Content: {
              select: {
                id: true,
                name: true,
                description: true,
                link: true,
                videoLink: true,
                type: true,
                protectedVideoLink: userid !== 0 ? true : false,
                protectedLink: userid !== 0 ? true : false,
              },
            },

            Questions: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },

        Content: {
          select: {
            id: true,
            name: true,
            description: true,
            link: true,
            videoLink: true,
            type: true,
            protectedVideoLink: userid !== 0 ? true : false,
            protectedLink: userid !== 0 ? true : false,
          },
        },
        Questions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async getFaq(platformId: number, userid: number, faqQueryDto: FaqQueryDto) {
    if (faqQueryDto.type === 'Platform') {
      let searchString: string[] = [];
      let faq;
      if (faqQueryDto.url !== undefined) {
        searchString = faqQueryDto.url.split('/');
        faq = await this.databaseService.faqSubject.findFirst({
          where: {
            heading: {
              equals: searchString[searchString.length - 1],
              mode: 'insensitive',
            },
          },
        });
        if (!faq) {
          throw new NotFoundException('FAQ not found with the given search');
        }
      }
      return this.databaseService.faqSubject.findFirst({
        where: {
          heading: searchString.length > 0 ? undefined : 'Platform',
          id: faqQueryDto.url !== undefined ? faq.id : undefined,
        },
        include: {
          Subjects: {
            include: {
              Subjects: {
                include: {
                  Subjects: {
                    include: {
                      Subjects: {
                        include: {
                          Questions: true,
                          Content: {
                            select: {
                              id: true,
                              name: true,
                              description: true,
                              link: true,
                              videoLink: true,
                              type: true,
                              protectedVideoLink: userid !== 0 ? true : false,
                              protectedLink: userid !== 0 ? true : false,
                            },
                          },
                        },
                      },
                      Content: {
                        select: {
                          id: true,
                          name: true,
                          description: true,
                          link: true,
                          videoLink: true,
                          type: true,
                          protectedVideoLink: userid !== 0 ? true : false,
                          protectedLink: userid !== 0 ? true : false,
                        },
                      },
                      Questions: true,
                    },
                  },
                  Content: {
                    select: {
                      id: true,
                      name: true,
                      description: true,
                      link: true,
                      videoLink: true,
                      type: true,
                      protectedVideoLink: userid !== 0 ? true : false,
                      protectedLink: userid !== 0 ? true : false,
                    },
                  },
                  Questions: true,
                },
              },
              Content: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  link: true,
                  videoLink: true,
                  type: true,
                  protectedVideoLink: userid !== 0 ? true : false,
                  protectedLink: userid !== 0 ? true : false,
                },
              },
              Questions: true,
            },
          },
          Content: {
            select: {
              id: true,
              name: true,
              description: true,
              link: true,
              videoLink: true,
              type: true,
              protectedVideoLink: userid !== 0 ? true : false,
              protectedLink: userid !== 0 ? true : false,
            },
          },
          Questions: true,
        },
      });
    }
    return this.databaseService.course.findMany({
      where: {
        courseId:
          faqQueryDto.courseId !== undefined ? faqQueryDto.courseId : null,
        OR: [
          {
            Faq: {
              some: {
                platformId: platformId,
              },
            },
          },
          {
            Courses: {
              some: {
                OR: [
                  {
                    Faq: {
                      some: {
                        platformId: platformId,
                      },
                    },
                  },
                  {
                    Courses: {
                      some: {
                        OR: [
                          {
                            Faq: {
                              some: {
                                platformId: platformId,
                              },
                            },
                          },
                          {
                            Courses: {
                              some: {
                                OR: [
                                  {
                                    Faq: {
                                      some: {
                                        platformId: platformId,
                                      },
                                    },
                                  },
                                  {
                                    Courses: {
                                      some: {
                                        Faq: {
                                          some: {
                                            platformId: platformId,
                                          },
                                        },
                                      },
                                    },
                                  },
                                ],
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        abbr: true,
        courseId: true,
        Faq: {
          where: {
            platformId: platformId,
            FaqSubject: {
              heading:
                faqQueryDto.type !== undefined ? faqQueryDto.type : undefined,
            },
          },
          select: {
            FaqSubject: {
              select: {
                id: true,
                heading: true,
                description: true,
                logo: true,
                Content: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    link: true,
                    videoLink: true,
                    type: true,
                    protectedVideoLink: userid !== 0 ? true : false,
                    protectedLink: userid !== 0 ? true : false,
                  },
                },
                Questions: {
                  orderBy: {
                    order: 'asc',
                  },
                },
                Subjects: {
                  orderBy: {
                    order: 'asc',
                  },
                  select: {
                    id: true,
                    heading: true,
                    description: true,
                    logo: true,
                    Content: {
                      select: {
                        id: true,
                        name: true,
                        description: true,
                        link: userid !== 0 ? true : false,
                        videoLink: true,
                        type: true,
                        protectedVideoLink: userid !== 0 ? true : false,
                        protectedLink: userid !== 0 ? true : false,
                      },
                    },
                    Questions: {
                      orderBy: {
                        order: 'asc',
                      },
                    },
                    Subjects: {
                      orderBy: {
                        order: 'asc',
                      },
                      select: {
                        id: true,
                        heading: true,
                        description: true,
                        logo: true,
                        Content: {
                          select: {
                            id: true,
                            name: true,
                            description: true,
                            link: userid !== 0 ? true : false,
                            videoLink: true,
                            type: true,
                            protectedVideoLink: userid !== 0 ? true : false,
                            protectedLink: userid !== 0 ? true : false,
                          },
                        },
                        Questions: {
                          orderBy: {
                            order: 'asc',
                          },
                        },
                        Subjects: {
                          orderBy: {
                            order: 'asc',
                          },
                          select: {
                            id: true,
                            heading: true,
                            description: true,
                            logo: true,
                            Content: {
                              select: {
                                id: true,
                                name: true,
                                description: true,
                                link: userid !== 0 ? true : false,
                                videoLink: true,
                                type: true,
                                protectedVideoLink: userid !== 0 ? true : false,
                                protectedLink: userid !== 0 ? true : false,
                              },
                            },
                            Questions: {
                              orderBy: {
                                order: 'asc',
                              },
                            },
                            Subjects: {
                              orderBy: {
                                order: 'asc',
                              },
                              select: {
                                id: true,
                                heading: true,
                                description: true,
                                logo: true,
                                Content: {
                                  select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    link: userid !== 0 ? true : false,
                                    videoLink: true,
                                    type: true,
                                    protectedVideoLink:
                                      userid !== 0 ? true : false,
                                    protectedLink: userid !== 0 ? true : false,
                                  },
                                },
                                Questions: {
                                  orderBy: {
                                    order: 'asc',
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
        Courses: {
          where: {
            OR: [
              {
                Faq: {
                  some: {
                    platformId: platformId,
                  },
                },
              },
              {
                Courses: {
                  some: {
                    OR: [
                      {
                        Faq: {
                          some: {
                            platformId: platformId,
                          },
                        },
                      },
                      {
                        Courses: {
                          some: {
                            OR: [
                              {
                                Faq: {
                                  some: {
                                    platformId: platformId,
                                  },
                                },
                              },
                              {
                                Courses: {
                                  some: {
                                    Faq: {
                                      some: {
                                        platformId: platformId,
                                      },
                                    },
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
          select: {
            id: true,
            name: true,
            abbr: true,
            courseId: true,
            Faq: {
              where: {
                platformId: platformId,
                FaqSubject: {
                  heading:
                    faqQueryDto.type !== undefined
                      ? faqQueryDto.type
                      : undefined,
                },
              },
              select: {
                FaqSubject: {
                  select: {
                    id: true,
                    heading: true,
                    description: true,
                    logo: true,
                    Content: {
                      select: {
                        id: true,
                        name: true,
                        description: true,
                        link: userid !== 0 ? true : false,
                        videoLink: true,
                        type: true,
                        protectedVideoLink: userid !== 0 ? true : false,
                        protectedLink: userid !== 0 ? true : false,
                      },
                    },
                    Questions: {
                      orderBy: {
                        order: 'asc',
                      },
                    },
                    Subjects: {
                      orderBy: {
                        order: 'asc',
                      },
                      select: {
                        id: true,
                        heading: true,
                        description: true,
                        logo: true,
                        Content: {
                          select: {
                            id: true,
                            name: true,
                            description: true,
                            link: userid !== 0 ? true : false,
                            videoLink: true,
                            type: true,
                            protectedVideoLink: userid !== 0 ? true : false,
                            protectedLink: userid !== 0 ? true : false,
                          },
                        },
                        Questions: {
                          orderBy: {
                            order: 'asc',
                          },
                        },
                        Subjects: {
                          orderBy: {
                            order: 'asc',
                          },
                          select: {
                            id: true,
                            heading: true,
                            description: true,
                            logo: true,
                            Content: {
                              select: {
                                id: true,
                                name: true,
                                description: true,
                                link: userid !== 0 ? true : false,
                                videoLink: true,
                                type: true,
                                protectedVideoLink: userid !== 0 ? true : false,
                                protectedLink: userid !== 0 ? true : false,
                              },
                            },
                            Questions: {
                              orderBy: {
                                order: 'asc',
                              },
                            },
                            Subjects: {
                              orderBy: {
                                order: 'asc',
                              },
                              select: {
                                id: true,
                                heading: true,
                                description: true,
                                logo: true,
                                Content: {
                                  select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    link: userid !== 0 ? true : false,
                                    videoLink: true,
                                    type: true,
                                    protectedVideoLink:
                                      userid !== 0 ? true : false,
                                    protectedLink: userid !== 0 ? true : false,
                                  },
                                },
                                Questions: {
                                  orderBy: {
                                    order: 'asc',
                                  },
                                },
                                Subjects: {
                                  orderBy: {
                                    order: 'asc',
                                  },
                                  select: {
                                    id: true,
                                    heading: true,
                                    description: true,
                                    logo: true,
                                    Content: {
                                      select: {
                                        id: true,
                                        name: true,
                                        description: true,
                                        link: true,
                                        videoLink: true,
                                        protectedLink:
                                          userid !== 0 ? true : false,
                                        protectedVideoLink:
                                          userid !== 0 ? true : false,
                                        type: true,
                                      },
                                    },
                                    Questions: {
                                      orderBy: {
                                        order: 'asc',
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
            Courses: {
              where: {
                OR: [
                  {
                    Faq: {
                      some: {
                        platformId: platformId,
                      },
                    },
                  },
                  {
                    Courses: {
                      some: {
                        OR: [
                          {
                            Faq: {
                              some: {
                                platformId: platformId,
                              },
                            },
                          },
                          {
                            Courses: {
                              some: {
                                Faq: {
                                  some: {
                                    platformId: platformId,
                                  },
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
              select: {
                id: true,
                name: true,
                abbr: true,
                courseId: true,
                Faq: {
                  where: {
                    platformId: platformId,
                    FaqSubject: {
                      heading:
                        faqQueryDto.type !== undefined
                          ? faqQueryDto.type
                          : undefined,
                    },
                  },
                  select: {
                    FaqSubject: {
                      select: {
                        id: true,
                        heading: true,
                        description: true,
                        logo: true,
                        Content: {
                          select: {
                            id: true,
                            name: true,
                            description: true,
                            link: userid !== 0 ? true : false,
                            videoLink: true,
                            type: true,
                            protectedVideoLink: userid !== 0 ? true : false,
                            protectedLink: userid !== 0 ? true : false,
                          },
                        },
                        Questions: {
                          orderBy: {
                            order: 'asc',
                          },
                        },
                        Subjects: {
                          orderBy: {
                            order: 'asc',
                          },
                          select: {
                            id: true,
                            heading: true,
                            description: true,
                            logo: true,
                            Content: {
                              select: {
                                id: true,
                                name: true,
                                description: true,
                                link: userid !== 0 ? true : false,
                                videoLink: true,
                                type: true,
                                protectedVideoLink: userid !== 0 ? true : false,
                                protectedLink: userid !== 0 ? true : false,
                              },
                            },
                            Questions: {
                              orderBy: {
                                order: 'asc',
                              },
                            },
                            Subjects: {
                              orderBy: {
                                order: 'asc',
                              },
                              select: {
                                id: true,
                                heading: true,
                                description: true,
                                logo: true,
                                Content: {
                                  select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    link: userid !== 0 ? true : false,
                                    videoLink: true,
                                    type: true,
                                    protectedVideoLink:
                                      userid !== 0 ? true : false,
                                    protectedLink: userid !== 0 ? true : false,
                                  },
                                },
                                Questions: {
                                  orderBy: {
                                    order: 'asc',
                                  },
                                },
                                Subjects: {
                                  orderBy: {
                                    order: 'asc',
                                  },
                                  select: {
                                    id: true,
                                    heading: true,
                                    description: true,
                                    logo: true,
                                    Content: {
                                      select: {
                                        id: true,
                                        name: true,
                                        description: true,
                                        link: true,
                                        videoLink: true,
                                        protectedLink:
                                          userid !== 0 ? true : false,
                                        protectedVideoLink:
                                          userid !== 0 ? true : false,
                                        type: true,
                                      },
                                    },
                                    Questions: {
                                      orderBy: {
                                        order: 'asc',
                                      },
                                    },
                                    Subjects: {
                                      orderBy: {
                                        order: 'asc',
                                      },
                                      select: {
                                        id: true,
                                        heading: true,
                                        description: true,
                                        logo: true,
                                        Content: {
                                          select: {
                                            id: true,
                                            name: true,
                                            description: true,
                                            link: true,
                                            videoLink: true,
                                            type: true,
                                            protectedVideoLink:
                                              userid !== 0 ? true : false,
                                            protectedLink:
                                              userid !== 0 ? true : false,
                                          },
                                        },
                                        Questions: {
                                          orderBy: {
                                            order: 'asc',
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
                Courses: {
                  where: {
                    OR: [
                      {
                        Faq: {
                          some: {
                            platformId: platformId,
                          },
                        },
                      },
                      {
                        Courses: {
                          some: {
                            Faq: {
                              some: {
                                platformId: platformId,
                              },
                            },
                          },
                        },
                      },
                    ],
                  },
                  select: {
                    id: true,
                    name: true,
                    abbr: true,
                    courseId: true,
                    Faq: {
                      where: {
                        platformId: platformId,
                        FaqSubject: {
                          heading:
                            faqQueryDto.type !== undefined
                              ? faqQueryDto.type
                              : undefined,
                        },
                      },
                      select: {
                        FaqSubject: {
                          select: {
                            id: true,
                            heading: true,
                            description: true,
                            logo: true,
                            Content: {
                              select: {
                                id: true,
                                name: true,
                                description: true,
                                link: true,
                                videoLink: true,
                                type: true,
                                protectedVideoLink: userid !== 0 ? true : false,
                                protectedLink: userid !== 0 ? true : false,
                              },
                            },
                            Questions: {
                              orderBy: {
                                order: 'asc',
                              },
                            },
                            Subjects: {
                              orderBy: {
                                order: 'asc',
                              },
                              select: {
                                id: true,
                                heading: true,
                                description: true,
                                logo: true,
                                Content: {
                                  select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    link: true,
                                    videoLink: true,
                                    type: true,
                                    protectedVideoLink:
                                      userid !== 0 ? true : false,
                                    protectedLink: userid !== 0 ? true : false,
                                  },
                                },
                                Questions: {
                                  orderBy: {
                                    order: 'asc',
                                  },
                                },
                                Subjects: {
                                  orderBy: {
                                    order: 'asc',
                                  },
                                  select: {
                                    id: true,
                                    heading: true,
                                    description: true,
                                    logo: true,
                                    Content: {
                                      select: {
                                        id: true,
                                        name: true,
                                        description: true,
                                        link: true,
                                        videoLink: true,
                                        protectedLink:
                                          userid !== 0 ? true : false,
                                        protectedVideoLink:
                                          userid !== 0 ? true : false,
                                        type: true,
                                      },
                                    },
                                    Questions: {
                                      orderBy: {
                                        order: 'asc',
                                      },
                                    },
                                    Subjects: {
                                      orderBy: {
                                        order: 'asc',
                                      },
                                      select: {
                                        id: true,
                                        heading: true,
                                        description: true,
                                        logo: true,
                                        Content: {
                                          select: {
                                            id: true,
                                            name: true,
                                            description: true,
                                            link: true,
                                            videoLink: true,
                                            protectedLink:
                                              userid !== 0 ? true : false,
                                            protectedVideoLink:
                                              userid !== 0 ? true : false,
                                            type: true,
                                          },
                                        },
                                        Questions: {
                                          orderBy: {
                                            order: 'asc',
                                          },
                                        },
                                        Subjects: {
                                          orderBy: {
                                            order: 'asc',
                                          },
                                          select: {
                                            id: true,
                                            heading: true,
                                            description: true,
                                            logo: true,
                                            Content: {
                                              select: {
                                                id: true,
                                                name: true,
                                                description: true,
                                                link: true,
                                                videoLink: true,
                                                protectedLink:
                                                  userid !== 0 ? true : false,
                                                protectedVideoLink:
                                                  userid !== 0 ? true : false,
                                                type: true,
                                              },
                                            },
                                            Questions: {
                                              orderBy: {
                                                order: 'asc',
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
                    Courses: {
                      where: {
                        Faq: {
                          some: {
                            platformId: platformId,
                          },
                        },
                      },
                      select: {
                        id: true,
                        name: true,
                        abbr: true,
                        courseId: true,
                        Faq: {
                          where: {
                            platformId: platformId,
                            FaqSubject: {
                              heading:
                                faqQueryDto.type !== undefined
                                  ? faqQueryDto.type
                                  : undefined,
                            },
                          },
                          select: {
                            FaqSubject: {
                              select: {
                                id: true,
                                heading: true,
                                description: true,
                                logo: true,
                                Content: {
                                  select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    link: true,
                                    videoLink: true,
                                    type: true,
                                    protectedVideoLink:
                                      userid !== 0 ? true : false,
                                    protectedLink: userid !== 0 ? true : false,
                                  },
                                },
                                Questions: {
                                  orderBy: {
                                    order: 'asc',
                                  },
                                },
                                Subjects: {
                                  select: {
                                    id: true,
                                    heading: true,
                                    description: true,
                                    logo: true,
                                    Content: {
                                      select: {
                                        id: true,
                                        name: true,
                                        description: true,
                                        link: true,
                                        videoLink: true,
                                        type: true,
                                        protectedVideoLink:
                                          userid !== 0 ? true : false,
                                        protectedLink:
                                          userid !== 0 ? true : false,
                                      },
                                    },
                                    Questions: {
                                      orderBy: {
                                        order: 'asc',
                                      },
                                    },
                                    Subjects: {
                                      select: {
                                        id: true,
                                        heading: true,
                                        description: true,
                                        logo: true,
                                        Content: {
                                          select: {
                                            id: true,
                                            name: true,
                                            description: true,
                                            link: true,
                                            videoLink: true,
                                            type: true,
                                            protectedVideoLink:
                                              userid !== 0 ? true : false,
                                            protectedLink:
                                              userid !== 0 ? true : false,
                                          },
                                        },
                                        Questions: {
                                          orderBy: {
                                            order: 'asc',
                                          },
                                        },
                                        Subjects: {
                                          select: {
                                            id: true,
                                            heading: true,
                                            description: true,
                                            logo: true,
                                            Content: {
                                              select: {
                                                id: true,
                                                name: true,
                                                description: true,
                                                link: true,
                                                videoLink: true,
                                                protectedLink:
                                                  userid !== 0 ? true : false,
                                                protectedVideoLink:
                                                  userid !== 0 ? true : false,
                                                type: true,
                                              },
                                            },
                                            Questions: {
                                              orderBy: {
                                                order: 'asc',
                                              },
                                            },
                                            Subjects: {
                                              select: {
                                                id: true,
                                                heading: true,
                                                description: true,
                                                logo: true,
                                                Content: {
                                                  select: {
                                                    id: true,
                                                    name: true,
                                                    description: true,
                                                    link: true,
                                                    videoLink: true,
                                                    type: true,
                                                    protectedVideoLink:
                                                      userid !== 0
                                                        ? true
                                                        : false,
                                                    protectedLink:
                                                      userid !== 0
                                                        ? true
                                                        : false,
                                                  },
                                                },
                                                Questions: {
                                                  orderBy: {
                                                    order: 'asc',
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
        },
      },
    });
  }

  async setFaq(createFaqDto: CreateFaqDto, platformId: number) {
    const session = createFaqDto.session;
    const subject = createFaqDto.subject;
    const topic = createFaqDto.topic;
    const los = createFaqDto.los;
    const Session = await this.databaseService.course.findFirst({
      where: {
        name: session,
        Course: {
          abbr: createFaqDto.courseAbbr,
        },
      },
    });
    let syllabus = await this.databaseService.faqSubject.findFirst({
      where: {
        heading: createFaqDto.type,
        PlatformNdCourse: {
          some: {
            courseId: Session.id,
            platformId: platformId,
          },
        },
      },
    });
    if (!syllabus) {
      syllabus = await this.databaseService.faqSubject.create({
        data: {
          heading: createFaqDto.type,
          PlatformNdCourse: {
            create: {
              courseId: Session.id,
              platformId: platformId,
            },
          },
        },
      });
    }
    let Subject = await this.databaseService.faqSubject.findFirst({
      where: {
        faqSubjectId: syllabus.id,
        heading: subject,
      },
    });
    if (!Subject) {
      Subject = await this.databaseService.faqSubject.create({
        data: {
          faqSubjectId: syllabus.id,
          heading: subject,
        },
      });
    }

    const faqquestion = await this.databaseService.faqQuestion.create({
      data: {
        question: topic,
        answer: los,
        subjectId: Subject.id,
      },
    });

    return faqquestion;
  }

  async getPlatformMeta(key: string, platformId: number) {
    return this.databaseService.platformOptions.findMany({
      where: {
        key: key !== undefined ? key : undefined,
        platformId: platformId,
      },
    });
  }

  async uploadNoticeBoard(
    noticeBoardPostDto: NoticeBoardPostDto,
    platformId: number,
  ) {
    const courselevel = noticeBoardPostDto.course.split(' ');
    const course = courselevel[0];
    const level = courselevel[1] + ' ' + courselevel[2];
    const sessions = noticeBoardPostDto.session.split('-');
    const year = sessions[1];
    const month = sessions[0].substring(0, 3);
    const eventname = noticeBoardPostDto.eventname;

    const description = noticeBoardPostDto.eventdescription;
    const startDate = noticeBoardPostDto.startDate;
    const endDate = noticeBoardPostDto.endDate;
    const url = noticeBoardPostDto.eventurl;
    const startdateobj = this.convertToDate(startDate);
    const enddateobj = this.convertToDate(endDate);
    const monthCourse = await this.databaseService.course.findFirst({
      where: {
        name: {
          contains: month.toLocaleLowerCase(),
          mode: 'insensitive',
        },
        Course: {
          name: year,
          Course: {
            name: level,
            Course: {
              abbr: course,
            },
          },
        },
      },
    });
    if (!monthCourse) {
      throw new NotFoundException('Course Not Found');
    }
    const events = await this.databaseService.events.create({
      data: {
        title: eventname,
        description: description,
        startDate: startdateobj,
        endDate: enddateobj,
        link: url,
        CourseNdPlatform: {
          create: {
            courseId: monthCourse.id,
            platformId: platformId,
          },
        },
      },
    });
    return events;
  }

  convertToDate(dateString: string) {
    // Parse the date string
    const [day, month, year] = dateString.split('-');

    // Create a map for month names to numbers
    const monthMap = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };

    // Convert to a full year
    const fullYear =
      parseInt(year, 10) < 50
        ? 2000 + parseInt(year, 10)
        : 1900 + parseInt(year, 10);

    // Create and return the JavaScript Date object
    return new Date(fullYear, monthMap[month], parseInt(day, 10));
  }

  async deletePlatform() {
    await this.databaseService.faqToCourseNdPlatform.deleteMany({
      where: {
        FaqSubject: {
          heading: 'Platform',
        },
      },
    });
    await this.databaseService.faqSubject.deleteMany({
      where: {
        heading: 'Platform',
        PlatformNdCourse: {
          some: {
            platformId: 1,
          },
        },
      },
    });
  }

  async setPlatformFaq(
    platformFaqPostDTO: PlatformFaqPostDto,
    plaformId: number,
  ) {
    let faqplatform = await this.databaseService.faqSubject.findFirst({
      where: {
        heading: 'Platform',
        PlatformNdCourse: {
          some: {
            platformId: plaformId,
          },
        },
      },
    });
    if (!faqplatform) {
      faqplatform = await this.databaseService.faqSubject.create({
        data: {
          heading: 'Platform',
        },
      });
      await this.databaseService.faqToCourseNdPlatform.create({
        data: {
          faqSubjectId: faqplatform.id,
          platformId: plaformId,
        },
      });
    }
    let faqtype = await this.databaseService.faqSubject.findFirst({
      where: {
        heading: platformFaqPostDTO.type,
        faqSubjectId: faqplatform.id,
      },
    });
    if (!faqtype) {
      faqtype = await this.databaseService.faqSubject.create({
        data: {
          heading: platformFaqPostDTO.type,
          faqSubjectId: faqplatform.id,
        },
      });
    }
    if (platformFaqPostDTO.course !== 'All') {
      const courses = platformFaqPostDTO.course.split(' ');
      for (const course in courses) {
        let faqCourse = await this.databaseService.faqSubject.findFirst({
          where: {
            heading: courses[course],
            faqSubjectId: faqtype.id,
          },
        });
        if (!faqCourse) {
          faqCourse = await this.databaseService.faqSubject.create({
            data: {
              heading: courses[course],
              faqSubjectId: faqtype.id,
            },
          });
        }
        faqtype = faqCourse;
      }
    }
    let faqCategory = await this.databaseService.faqSubject.findFirst({
      where: {
        heading: platformFaqPostDTO.category,
        faqSubjectId: faqtype.id,
      },
    });
    if (!faqCategory) {
      faqCategory = await this.databaseService.faqSubject.create({
        data: {
          heading: platformFaqPostDTO.category,
          faqSubjectId: faqtype.id,
        },
      });
    }
    const questions = await this.databaseService.faqQuestion.create({
      data: {
        question: platformFaqPostDTO.question,
        answer: platformFaqPostDTO.answer,
        subjectId: faqCategory.id,
      },
    });
    return questions;
  }

  async findClosestPurchasableCourse(courseId: number) {
    const course = await this.databaseService.course.findFirst({
      where: {
        id: courseId,
      },
      include: {
        Meta: true,
      },
    });
    if (!course) {
      throw new NotFoundException('Course Not Found');
    }
    if (course.Meta.some((meta) => meta.purchasable === true)) {
      return course;
    } else {
      return this.findClosestPurchasableCourse(course.courseId);
    }
  }

  async getDeliveryCharges(deliveryChargesDto: DeliveryChargesDto) {
    if (deliveryChargesDto.countryId === undefined) {
      throw new BadRequestException(
        'Country id is required for getting deliverycharges',
      );
    }
    if (deliveryChargesDto.courseId !== undefined) {
      const course = await this.findClosestPurchasableCourse(
        deliveryChargesDto.courseId,
      );
      if (!course) {
        throw new NotFoundException('Course Not Found');
      }
      let deliverycharges =
        await this.databaseService.packageDeliveryCharge.findFirst({
          where: {
            countryId: deliveryChargesDto.countryId,
            courseId: course.id,
          },
        });
      const bannedCountry = await this.databaseService.bannedLocation.findFirst(
        {
          where: {
            countryId: deliveryChargesDto.countryId,
            courseId: course.id,
          },
        },
      );
      if (bannedCountry) {
        throw new ForbiddenException(bannedCountry);
      }
      if (!deliverycharges) {
        const data = await lastValueFrom(
          this.httpService
            .post(
              'https://geocode.aswinibajaj.com/api/get-continent-by-country',
              {
                country_id: deliveryChargesDto.countryId,
              },
            )
            .pipe(
              catchError((error: AxiosError) => {
                throw 'An Error Happened5' + error.message;
              }),
            ),
        );
        const { continent } = data?.data;
        deliverycharges =
          await this.databaseService.packageDeliveryCharge.findFirst({
            where: {
              continentId: continent.id,
              courseId: course.id,
            },
          });
      }
      if (!deliverycharges) {
        throw new NotFoundException('Delivery Information Not found!');
      }
      return deliverycharges;
    }
    if (deliveryChargesDto.productId !== undefined) {
      const product = await this.databaseService.product.findFirst({
        where: {
          id: deliveryChargesDto.productId,
        },
      });
      if (!product) {
        throw new NotFoundException('Product Not Found');
      }
      let deliverycharges =
        await this.databaseService.packageDeliveryCharge.findFirst({
          where: {
            countryId: deliveryChargesDto.countryId,
            productId: product.id,
          },
        });
      const bannedCountry = await this.databaseService.bannedLocation.findFirst(
        {
          where: {
            countryId: deliveryChargesDto.countryId,
            productId: product.id,
          },
        },
      );
      if (bannedCountry) {
        throw new ForbiddenException(bannedCountry);
      }
      if (!deliverycharges) {
        const data = await lastValueFrom(
          this.httpService
            .post(
              'https://geocode.aswinibajaj.com/api/get-continent-by-country',
              {
                country_id: deliveryChargesDto.countryId,
              },
            )
            .pipe(
              catchError((error: AxiosError) => {
                throw 'An Error Happened5' + error.message;
              }),
            ),
        );
        const { continent } = data?.data;
        deliverycharges =
          await this.databaseService.packageDeliveryCharge.findFirst({
            where: {
              continentId: continent.id,
              productId: product.id,
            },
          });
      }
      if (!deliverycharges) {
        throw new NotFoundException('Delivery Information Not found!');
      }
      return deliverycharges;
    }
  }

  async getTestimonials(
    platformId: number,
    testimonialQueryDto: TestimonialQueryDto,
  ) {
    let course: any;
    let searchString: string[] = [];
    if (testimonialQueryDto.courseSearchString !== undefined) {
      searchString = testimonialQueryDto.courseSearchString
        .toLowerCase()
        .split('/');
      if (testimonialQueryDto.courseSearchString !== undefined) {
        testimonialQueryDto.courseSearchString =
          testimonialQueryDto.courseSearchString.toUpperCase();
        searchString = testimonialQueryDto.courseSearchString.split('/');
        course = await this.databaseService.course.findFirst({
          where: {
            AND: [
              {
                OR: [
                  {
                    abbr: {
                      equals:
                        testimonialQueryDto.courseSearchString !== undefined &&
                        searchString.length > 0
                          ? searchString[searchString.length - 1]
                          : undefined,
                      mode: 'insensitive',
                    },
                  },
                  {
                    name: {
                      equals:
                        testimonialQueryDto.courseSearchString !== undefined &&
                        searchString.length > 0
                          ? searchString[searchString.length - 1]
                          : undefined,
                      mode: 'insensitive',
                    },
                  },
                ],
                ...(searchString.length > 1 && {
                  Course: {
                    OR: [
                      {
                        abbr: {
                          equals:
                            testimonialQueryDto.courseSearchString !==
                              undefined && searchString.length > 1
                              ? searchString[searchString.length - 2]
                              : undefined,
                          mode: 'insensitive',
                        },
                      },
                      {
                        name: {
                          equals:
                            testimonialQueryDto.courseSearchString !==
                              undefined && searchString.length > 1
                              ? searchString[searchString.length - 2]
                              : undefined,
                          mode: 'insensitive',
                        },
                      },
                    ],
                    ...(searchString.length > 2 && {
                      Course: {
                        OR: [
                          {
                            abbr: {
                              equals:
                                testimonialQueryDto.courseSearchString !==
                                  undefined && searchString.length > 2
                                  ? searchString[searchString.length - 3]
                                  : undefined,
                              mode: 'insensitive',
                            },
                          },
                          {
                            name: {
                              equals:
                                testimonialQueryDto.courseSearchString !==
                                  undefined && searchString.length > 2
                                  ? searchString[searchString.length - 3]
                                  : undefined,
                              mode: 'insensitive',
                            },
                          },
                        ],

                        ...(searchString.length > 3 && {
                          Course: {
                            OR: [
                              {
                                abbr: {
                                  equals:
                                    testimonialQueryDto.courseSearchString !==
                                      undefined && searchString.length > 3
                                      ? searchString[searchString.length - 4]
                                      : undefined,
                                  mode: 'insensitive',
                                },
                              },
                              {
                                name: {
                                  equals:
                                    testimonialQueryDto.courseSearchString !==
                                      undefined && searchString.length > 3
                                      ? searchString[searchString.length - 4]
                                      : undefined,
                                  mode: 'insensitive',
                                },
                              },
                            ],
                            ...(searchString.length > 4 && {
                              Course: {
                                OR: [
                                  {
                                    abbr: {
                                      equals:
                                        testimonialQueryDto.courseSearchString !==
                                          undefined && searchString.length > 4
                                          ? searchString[
                                              searchString.length - 5
                                            ]
                                          : undefined,
                                      mode: 'insensitive',
                                    },
                                  },
                                  {
                                    name: {
                                      equals:
                                        testimonialQueryDto.courseSearchString !==
                                          undefined && searchString.length > 4
                                          ? searchString[
                                              searchString.length - 5
                                            ]
                                          : undefined,
                                      mode: 'insensitive',
                                    },
                                  },
                                ],
                              },
                            }),
                          },
                        }),
                      },
                    }),
                  },
                }),
              },
              {
                OR: [
                  {
                    Platform: {
                      some: {
                        platformId: platformId,
                      },
                    },
                  },
                  {
                    Courses: {
                      some: {
                        OR: [
                          {
                            Platform: {
                              some: {
                                platformId: platformId,
                              },
                            },
                          },
                          {
                            Courses: {
                              some: {
                                OR: [
                                  {
                                    Platform: {
                                      some: {
                                        platformId: platformId,
                                      },
                                    },
                                  },
                                  {
                                    Courses: {
                                      some: {
                                        OR: [
                                          {
                                            Platform: {
                                              some: {
                                                platformId: platformId,
                                              },
                                            },
                                          },
                                          {
                                            Courses: {
                                              some: {
                                                Platform: {
                                                  some: {
                                                    platformId: platformId,
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        ],
                                      },
                                    },
                                  },
                                ],
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            ],
          },
          include: {
            Meta: true,
          },
        });
      }
    }
    const testimonials =
      await this.databaseService.userTestimonialCategory.findMany({
        where: {
          Testimonials: {
            some: {
              Testimonial: {
                CourseNdPlatform: {
                  some: {
                    platformId: platformId,
                    courseId:
                      course !== undefined && course !== null
                        ? course.id
                        : undefined,
                    platformFeatured: testimonialQueryDto.platformFeatured,
                    courseFeatured: testimonialQueryDto.courseFeatured,
                    slug: testimonialQueryDto.slug,
                  },
                },
              },
            },
          },
        },
        include: {
          Testimonials: {
            where: {
              Testimonial: {
                CourseNdPlatform: {
                  some: {
                    platformId: platformId,
                    courseId:
                      course !== undefined && course !== null
                        ? course.id
                        : undefined,
                    platformFeatured: testimonialQueryDto.platformFeatured,
                    courseFeatured: testimonialQueryDto.courseFeatured,
                    slug: testimonialQueryDto.slug,
                  },
                },
              },
            },
            select: {
              Testimonial: {
                select: {
                  id: true,
                  fname: true,
                  lname: true,
                  profile: true,
                  designation: true,
                  review: true,
                  social: true,
                  User: {
                    select: {
                      fname: true,
                      lname: true,
                      profile: true,
                      Meta: {
                        select: {
                          social: true,
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
    return { testimonials };
  }

  async setTestimonials(
    plaformId: number,
    postTestimonialDto: PostTestimonialDto,
  ) {
    let testimonialTabs =
      await this.databaseService.userTestimonialCategory.findFirst({
        where: {
          name: postTestimonialDto.profession,
        },
      });
    if (!testimonialTabs) {
      testimonialTabs =
        await this.databaseService.userTestimonialCategory.create({
          data: {
            name: postTestimonialDto.profession,
          },
        });
    }
    const social = {
      twitter: '',
      facebook: '',
      linkedin: postTestimonialDto.linkedin,
      instagram: '',
    };
    const username = postTestimonialDto.name.split(' ');
    const fname = username[0]; // First name
    const lname = username.slice(1).join(' ');
    const testimonial = await this.databaseService.userTestimonials.create({
      data: {
        fname: fname,
        lname: lname || null,
        profile: postTestimonialDto.image,
        designation: postTestimonialDto.role,
        review: postTestimonialDto.message,
        social: social,
      },
    });
    await this.databaseService.userTestimonialCategoryToTestimonial.create({
      data: {
        categoryId: testimonialTabs.id,
        testimonialId: testimonial.id,
      },
    });
    await this.databaseService.userTestimonialToCoursendPlatform.create({
      data: {
        testimonialId: testimonial.id,
        platformId: plaformId,
        platformFeatured:
          postTestimonialDto.isFeatured !== undefined
            ? Boolean(postTestimonialDto.isFeatured)
            : false,
      },
    });
    return testimonial;
  }

  async getPaymentOptions(platformId: number) {
    const gateways = await this.databaseService.paymentGatways.findMany({
      where: {
        Platform: {
          some: {
            platformId: platformId,
            isActive: true,
          },
        },
      },
    });
    if (!gateways) {
      throw new NotFoundException('No Payment Gateways found for the platform');
    }
    return gateways;
  }

  // async getGstDetails(platformId: number) {

  // }

  async postContactForm(
    platformId: number,
    userContactPostDto: UserContactPostDto,
  ) {
    const user = await this.databaseService.user.findFirst({
      where: {
        OR: [
          { email: userContactPostDto.email },
          { phone: userContactPostDto.phone },
        ],
      },
    });
    if (userContactPostDto.appointmentDate) {
      userContactPostDto.appointmentDate.setHours(
        userContactPostDto.appointmentTime,
        0,
        0,
        0,
      );
    }
    const previousAppointment =
      await this.databaseService.userContactForm.findFirst({
        where: {
          OR: [
            {
              email: userContactPostDto.email,
            },
            {
              phone: userContactPostDto.phone,
            },
          ],
        },
      });

    const appointment = await this.databaseService.userContactForm.create({
      data: {
        fname: userContactPostDto.fname,
        lname: userContactPostDto.lname,
        email: userContactPostDto.email,
        appointmentTime:
          userContactPostDto.appointmentDate !== undefined
            ? new Date(userContactPostDto.appointmentDate)
            : undefined,
        counrtyCode: userContactPostDto.countryCode,
        phone: userContactPostDto.phone,
        message: userContactPostDto.message,
        eneteredText: userContactPostDto.selectedText,
        platformId: platformId,
        userId: user !== null ? user.id : undefined,
        utms: userContactPostDto.utms,
        slug: userContactPostDto.slug,

        previousForm:
          previousAppointment !== null ? previousAppointment.id : undefined,
      },
    });

    for (const text of userContactPostDto.selectedText) {
      const searchString = text.split(' ');
      const course = await this.databaseService.course.findFirst({
        where: {
          AND: [
            {
              OR: [
                {
                  abbr: {
                    equals:
                      searchString.length > 0
                        ? searchString[searchString.length - 1]
                        : undefined,
                    mode: 'insensitive',
                  },
                },
                {
                  name: {
                    equals:
                      searchString.length > 0
                        ? searchString[searchString.length - 1]
                        : undefined,
                    mode: 'insensitive',
                  },
                },
              ],
              ...(searchString.length > 1 && {
                Course: {
                  OR: [
                    {
                      abbr: {
                        equals:
                          searchString.length > 1
                            ? searchString[searchString.length - 2]
                            : undefined,
                        mode: 'insensitive',
                      },
                    },
                    {
                      name: {
                        equals:
                          searchString.length > 1
                            ? searchString[searchString.length - 2]
                            : undefined,
                        mode: 'insensitive',
                      },
                    },
                  ],
                  ...(searchString.length > 2 && {
                    Course: {
                      OR: [
                        {
                          abbr: {
                            equals:
                              searchString.length > 2
                                ? searchString[searchString.length - 3]
                                : undefined,
                            mode: 'insensitive',
                          },
                        },
                        {
                          name: {
                            equals:
                              searchString.length > 2
                                ? searchString[searchString.length - 3]
                                : undefined,
                            mode: 'insensitive',
                          },
                        },
                      ],

                      ...(searchString.length > 3 && {
                        Course: {
                          OR: [
                            {
                              abbr: {
                                equals:
                                  searchString.length > 3
                                    ? searchString[searchString.length - 4]
                                    : undefined,
                                mode: 'insensitive',
                              },
                            },
                            {
                              name: {
                                equals:
                                  searchString.length > 3
                                    ? searchString[searchString.length - 4]
                                    : undefined,
                                mode: 'insensitive',
                              },
                            },
                          ],
                          ...(searchString.length > 4 && {
                            Course: {
                              OR: [
                                {
                                  abbr: {
                                    equals:
                                      searchString.length > 4
                                        ? searchString[searchString.length - 5]
                                        : undefined,
                                    mode: 'insensitive',
                                  },
                                },
                                {
                                  name: {
                                    equals:
                                      searchString.length > 4
                                        ? searchString[searchString.length - 5]
                                        : undefined,
                                    mode: 'insensitive',
                                  },
                                },
                              ],
                            },
                          }),
                        },
                      }),
                    },
                  }),
                },
              }),
            },
          ],
        },
      });
      if (course) {
        await this.databaseService.userContactFormToProductNdCourse.create({
          data: {
            formId: appointment.id,
            courseId: course.id,
          },
        });
      }
    }

    if (userContactPostDto.appointmentDate !== undefined) {
      if (process.env.NODE_ENV !== 'development') {
        const whatsappScheduleCall =
          await this.databaseService.platformTemplate.findFirst({
            where: {
              name: 'whatsappScheduleCall',
              platformId: platformId,
            },
          });
        if (whatsappScheduleCall) {
          this.whatsappService.sendWhatsappMessage(
            userContactPostDto.countryCode + userContactPostDto.phone,
            userContactPostDto.fname + ' ' + userContactPostDto.lname,
            whatsappScheduleCall.templateId,
            [
              userContactPostDto.fname + ' ' + userContactPostDto.lname,
              this.formatAppointmentDate(userContactPostDto.appointmentDate),
            ],
          );
        }
        const formattedTime = new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }).format(userContactPostDto.appointmentDate);
        const formattedDate = new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(new Date());
        const appointmentDate = new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(userContactPostDto.appointmentDate);
        const utms: any = userContactPostDto.utms
          ? userContactPostDto.utms.reduce((acc, item) => {
              const key = Object.keys(item)[0];
              const value = item[key];
              acc[key] = value;
              return acc;
            }, {})
          : {};
        const utmSource = utms.utm_source || '';
        const utmMedium = utms.utm_medium || '';
        const utmCampaign = utms.utm_campaign || '';
        const utmTerm = utms.utm_term || '';
        const utmContent = utms.utm_content || '';
        const gclid = utms.gclid || '';
        this.httpService
          .post(process.env.sheetLink, {
            section: 'scheduleCall',
            date: formattedDate,
            scheduleDate: appointmentDate,
            scheduleTime: formattedTime,
            email: userContactPostDto.email,
            phone: userContactPostDto.phone,
            countryCode: userContactPostDto.countryCode,
            fname: userContactPostDto.fname,
            lname: userContactPostDto.lname,
            course:
              userContactPostDto.selectedText?.length > 0
                ? JSON.stringify(userContactPostDto.selectedText)
                : '',
            utmCampaign: utmCampaign,
            utmSource: utmSource,
            utmMedium: utmMedium,
            utmContent: utmContent,
            utmTerm: utmTerm,
            gclid: gclid,
          })
          .pipe(
            catchError((error: AxiosError) => {
              console.error('An Error Happened6', error.message);
              return []; // Handle error, optionally return an empty observable
            }),
          )
          .subscribe({
            next: (response) => response,
            error: (err) => console.error('HTTP request failed:', err),
          });
      }
    } else {
      if (process.env.NODE_ENV !== 'development') {
        this.leadService.checkNewContactForm(appointment.id, platformId);
        if (userContactPostDto.message !== 'Brochure') {
          const whatsappContactUs =
            await this.databaseService.platformTemplate.findFirst({
              where: {
                name: 'WhatsAppContactUs',
                platformId: platformId,
              },
            });
          if (whatsappContactUs) {
            this.whatsappService.sendWhatsappMessage(
              userContactPostDto.countryCode + userContactPostDto.phone,
              userContactPostDto.fname + ' ' + userContactPostDto.lname,
              whatsappContactUs.templateId,
              [
                userContactPostDto.fname + ' ' + userContactPostDto.lname,
                userContactPostDto.selectedText.join(', '),
              ],
            );
          }
        }
        const formattedDate = new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(new Date());
        const utms: any = userContactPostDto.utms
          ? userContactPostDto.utms.reduce((acc, item) => {
              const key = Object.keys(item)[0];
              const value = item[key];
              acc[key] = value;
              return acc;
            }, {})
          : {};
        const utmSource = utms.utm_source || '';
        const utmMedium = utms.utm_medium || '';
        const utmCampaign = utms.utm_campaign || '';
        const utmTerm = utms.utm_term || '';
        const utmContent = utms.utm_content || '';
        const gclid = utms.gclid || '';
        this.httpService
          .post(process.env.sheetLink, {
            section: 'Contact_Us',
            date: formattedDate,
            slug: userContactPostDto.slug,
            email: userContactPostDto.email,
            phone: userContactPostDto.phone,
            countryCode: userContactPostDto.countryCode,
            fname: userContactPostDto.fname,
            lname: userContactPostDto.lname,
            message: userContactPostDto.message,
            course:
              userContactPostDto.selectedText?.length > 0
                ? userContactPostDto.selectedText.toString()
                : '',
            utmCampaign: utmCampaign,
            utmSource: utmSource,
            utmMedium: utmMedium,
            utmContent: utmContent,
            utmTerm: utmTerm,
            gclid: gclid,
          })
          .pipe(
            catchError((error: AxiosError) => {
              console.error('An Error Happened7', error);
              return []; // Handle error, optionally return an empty observable
            }),
          )
          .subscribe({
            next: (response) => response,
            error: (err) => console.error('HTTP request failed:', err),
          });
      }
    }
    return { message: 'message recieved succesfully' };
  }

  async sentRegisterEvent(email: string, platformId: number) {
    const event = await this.databaseService.events.findFirst({
      where: {
        User: {
          some: {
            OR: [
              { email: email },
              {
                User: {
                  email: email,
                },
              },
            ],
          },
        },
      },
      include: {
        User: {
          where: {
            OR: [
              { email: email },
              {
                User: {
                  email: email,
                },
              },
            ],
          },
          include: {
            User: {
              where: {
                email: email,
              },
            },
          },
        },
      },
    });
    if (!event) {
      throw new NotFoundException('Event Not Found');
    }
    const EmailTemplate = await this.databaseService.platformTemplate.findFirst(
      {
        where: {
          name: 'SessionEventRegistration',
          platformId: platformId,
        },
      },
    );

    if (EmailTemplate) {
      await this.emailService.sendBrevoMail(
        event.User[0].User ? event.User[0].User.fname : event.User[0].fname,
        event.User[0].User ? event.User[0].User.email : event.User[0].email,
        'noreply@aswinibajajclasses.com',
        'Aswini Bajaj Classes',
        Number(EmailTemplate.templateId),
        {
          fname: event.User[0].User
            ? event.User[0].User.fname
            : event.User[0].fname,
        },
      );
    }
  }

  async registerEvent(
    userId: number,
    platformId: number,
    eventRegisterPostDto: EventRegisterPostDto,
  ) {
    const event = await this.databaseService.events.findFirst({
      where: {
        id: eventRegisterPostDto.eventId,
      },
      include: {
        Meta: true,
      },
    });
    if (!event) {
      throw new NotFoundException('Event Not Found');
    }
    if (!userId) {
      const user = await this.databaseService.user.findFirst({
        where: {
          OR: [
            { email: eventRegisterPostDto.email },
            { phone: eventRegisterPostDto.phone },
          ],
        },
      });
      if (user) {
        userId = user.id;
      }
    }

    let eventRegister = await this.databaseService.eventToUser.findFirst({
      where: {
        OR: [
          { email: eventRegisterPostDto.email },
          { phone: eventRegisterPostDto.phone },
          { userId: userId },
        ],
        eventId: eventRegisterPostDto.eventId,
      },
      include: {
        User: true,
      },
    });
    if (eventRegister) {
      throw new ConflictException('Event Already Registered');
    }

    const registerJson = {
      attending: eventRegisterPostDto.attending,
      discussionPoint: eventRegisterPostDto.discussionPoint,
      importantQuestion: eventRegisterPostDto.importantQuestion,
      occupation: eventRegisterPostDto.occupation,
      designation: eventRegisterPostDto.designation,
      company: eventRegisterPostDto.company,
      college: eventRegisterPostDto.college,
    };
    eventRegister = await this.databaseService.eventToUser.create({
      data: {
        fname: userId ? undefined : eventRegisterPostDto.fname,
        lname: userId ? undefined : eventRegisterPostDto.lname,
        email: userId ? undefined : eventRegisterPostDto.email,
        phone: userId ? undefined : eventRegisterPostDto.phone,
        countryCode: userId ? undefined : eventRegisterPostDto.countryCode,
        userId: userId ? userId : undefined,
        eventId: eventRegisterPostDto.eventId,
        responseJson: registerJson,
        locationId: eventRegisterPostDto.locationId,
      },
      include: {
        User: true,
      },
    });
    if (process.env.NODE_ENV !== 'development') {
      const EmailTemplate =
        await this.databaseService.platformTemplate.findFirst({
          where: {
            name: 'SessionEventRegistration',
            platformId: platformId,
          },
        });
      if (EmailTemplate) {
        await this.emailService.sendBrevoMail(
          eventRegister.User ? eventRegister.User.fname : eventRegister.fname,
          eventRegister.User ? eventRegister.User.email : eventRegister.email,
          'noreply@aswinibajajclasses.com',
          'Aswini Bajaj Classes',
          Number(EmailTemplate.templateId),
          {
            fname: eventRegister.User
              ? eventRegister.User.fname
              : eventRegister.fname,
          },
        );
      }
      const formattedDate = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date());
      this.httpService
        .post(process.env.sheetLink, {
          section: 'session',
          date: formattedDate,
          eventName: event.title,
          fname: eventRegister.User
            ? eventRegister.User.fname
            : eventRegister.fname,
          lname: eventRegister.User
            ? eventRegister.User.lname
            : eventRegister.lname,
          email: eventRegister.User
            ? eventRegister.User.email
            : eventRegister.email,
          countryCode: eventRegister.User
            ? eventRegister.User.countryCode
            : eventRegister.countryCode,
          phone: eventRegister.User
            ? eventRegister.User.phone
            : eventRegister.phone,
          occupation: eventRegisterPostDto.occupation,
          designation: eventRegisterPostDto.designation,
          company: eventRegisterPostDto.company,
          attending: eventRegisterPostDto.attending,
          school: eventRegisterPostDto.college,
          disscussion: eventRegisterPostDto.discussionPoint,
          oneQuestion: eventRegisterPostDto.importantQuestion,
        })
        .pipe(
          catchError((error: AxiosError) => {
            console.error('An Error Happened8', error.message);
            return []; // Handle error, optionally return an empty observable
          }),
        )
        .subscribe({
          next: (response) => response,
          error: (err) => console.error('HTTP request failed:', err),
        });
    }
    return { message: 'Event Registered Succesfully', eventRegister };
  }

  async getCourse(client: CustomEmployeeSocketClient) {
    const course = await this.databaseService.course.findMany({
      where: {
        courseId: null,
      },
      include: {
        Courses: {
          include: {
            Courses: {
              include: {
                Courses: {
                  include: {
                    Courses: {
                      include: {
                        Courses: {
                          include: {
                            Courses: {
                              include: {
                                Courses: {
                                  include: {
                                    Courses: {
                                      include: {
                                        Courses: true,
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
    return client.emit('course', course);
  }

  async getDollars() {
    let cachedExchangeRate = await this.cacheManager.get('exchangeRate');
    if (!cachedExchangeRate) {
      const data = await lastValueFrom(
        this.httpService
          .get(
            'https://v6.exchangerate-api.com/v6/e0c40d6b5ca88e568f19f53e/latest/USD',
          )
          .pipe(
            catchError((error: AxiosError) => {
              throw 'An Error Happened5' + error.message;
            }),
          ),
      );
      cachedExchangeRate = data.data.conversion_rates;
      await this.cacheManager.set('exchangeRate', cachedExchangeRate, 86400000);
    }
    return { cachedExchangeRate };
  }

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
}
