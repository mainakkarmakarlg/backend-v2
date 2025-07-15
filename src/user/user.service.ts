import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CustomRequest } from 'src/common/interface/custom-request.interface';
import { CartQueryDto } from './dto/cart-query.dto';
import { CartPostDto } from './dto/cart-post.dto';
import { BillingPatchDto } from './dto/billing-patch.dto';
import { catchError, lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { BillingShippingPostDto } from './dto/billing-shipping-post.dto';
import { ShippingPatchDto } from './dto/shipping-patch.dto';
import { InjectRazorpay } from 'nestjs-razorpay';
import Razorpay from 'razorpay';
import { EmailsService } from 'src/email/email.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { VultrService } from 'src/vultr/vultr.service';
import { UserResetPasswordDto } from './dto/user-reset-password.dto';
import { v4 as uuidv4 } from 'uuid';
import { CourierService } from 'src/courier/courier.service';
import { GetUserOrdersDto } from './dto/get-user-orders.dto';
import { EmployeePostDto } from './dto/employee-post.dto';
import { CustomUserSocketClient } from 'src/common/interface/custom-socket-user-client.interface';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { PracticeService } from 'src/practice/practice.service';
import { AddUserDto } from './dto/add-user.dto';
import { LeadService } from 'src/lead/lead.service';
import { QuizService } from 'src/quiz/quiz.service';
import {
  ResultAnalysisDto,
  ResultAnalysisSeedDto,
} from './dto/result-analysis.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthService } from 'src/auth/auth.service';
import { FormNameDto } from './dto/form-name.dto';
import { generteIntrospectHTML } from 'src/email/templates/createMail';
import resultReportTemplate, {
  scoreTemplate,
} from './htmlTemplates/result-report-template';
import puppeteer from 'puppeteer';
import { link } from 'fs';

@Injectable()
export class UserService {
  async deleteProfile(userid: number) {
    const user = await this.databaseService.user.findFirst({
      where: {
        id: userid,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.profile) {
      const profile = user.profile;
      await this.databaseService.user.update({
        where: {
          id: userid,
        },
        data: {
          profile: null,
        },
      });
      await this.vultrService.deleteFromVultr(user.profile);
      return { message: 'Profile deleted successfully', profile };
    } else {
      throw new NotFoundException('No profile found to delete');
    }
  }
  findForms(formNameDto: FormNameDto, platformid: number) {
    return this.databaseService.userForm.findFirst({
      where: {
        name: formNameDto.name,
      },
      include: {
        Course: {
          include: {
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
  }
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly httpService: HttpService,
    @InjectRazorpay() private readonly razorPayClient: Razorpay,
    private readonly leadService: LeadService,
    private readonly emailService: EmailsService,
    private readonly whatsappService: WhatsappService,
    private readonly vultrService: VultrService,
    private readonly courierService: CourierService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly practiceService: PracticeService,
    private readonly quizService: QuizService,
    private readonly authService: AuthService,
  ) {}

  async addUser(addUserDto: AddUserDto) {
    let user = await this.databaseService.user.findFirst({
      where: {
        OR: [{ email: addUserDto.email }, { phone: addUserDto.phone }],
      },
    });
    if (user) {
      await this.databaseService.solutionNumber.create({
        data: {
          number: addUserDto.softwareId,
          userId: user.id,
        },
      });
    }
    return user;
  }

  async addSolutionNumber(email: string, softwareId: string) {
    const user = await this.databaseService.user.findFirst({
      where: {
        email: email,
      },
    });
    if (user) {
      await this.databaseService.solutionNumber.create({
        data: {
          number: softwareId,
          userId: user.id,
        },
      });
    }
    return user;
  }

  async addSubject() {
    const response = await lastValueFrom(
      this.httpService
        .get(
          'https://script.googleusercontent.com/macros/echo?user_content_key=a3FQMl4uJk1VRYdWiXnsZDf9MYA-dHFhGh1bon2c3vRvA2f4IhFUXtIb71I5AQQhRaAssFQKUJCB5_QlfTm1vHhD6UG5LgPdm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnM80m19HzA5h76Y_sd9UBpWmOCMSv3I_f6s5C6SQaSJ-ayrx3OA6y4W_95_DABRcxVdX8np9n7qagUfWCEffB6ueLifGdfPMXdz9Jw9Md8uu&lib=MoP65QgPBJCEtyB9n7HZEFMwk6ajv-14o',
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw 'An Error Happened10' + error;
          }),
        ),
    );
    for (const [courseName, courseDetails] of Object.entries(response.data)) {
      const coursearray = courseName.split(' ');
      let courseid;
      let incourse;
      for (const coursename of coursearray) {
        const chapterorder = 0;

        const course = await this.databaseService.course.findFirst({
          where: {
            abbr: coursename,
            courseId: courseid,
          },
        });
        if (course) {
          courseid = course.id;
          incourse = course;
        } else {
          incourse = undefined;
        }
        if (!courseid) {
          courseid = 0;
        }
      }
      if (incourse) {
        let isheader = true;
        for (const coursedata of courseDetails as any[]) {
          if (isheader) {
            isheader = false;
            continue;
          }
          const order = coursedata[0];
          const subjectname = coursedata[1];
          console.log(subjectname);
          let subject = await this.databaseService.courseSubject.findFirst({
            where: {
              name: subjectname,
              type: 'subject',
              Course: {
                some: {
                  courseId: incourse.id,
                },
              },
            },
          });
          if (!subject) {
            subject = await this.databaseService.courseSubject.create({
              data: {
                name: subjectname,
                order: order,
                type: 'subject',
              },
            });
            const subjecttocourse =
              await this.databaseService.courseSubjectToCourse.create({
                data: {
                  courseId: incourse.id,
                  subjectId: subject.id,
                },
              });
          }
          const chaptername = coursedata[2] + '. ' + coursedata[3];
          let chapter = await this.databaseService.courseSubject.findFirst({
            where: {
              name: chaptername,
              subjectId: subject.id,
            },
          });
          if (!chapter) {
            chapter = await this.databaseService.courseSubject.create({
              data: {
                name: chaptername,
                type: 'chapter',
                subjectId: subject.id,
              },
            });
          }
          const losname = coursedata[4] + '. ' + coursedata[5];
          let los = await this.databaseService.courseSubject.findFirst({
            where: {
              name: losname,
              subjectId: chapter.id,
              type: 'los',
            },
          });
          if (!los) {
            los = await this.databaseService.courseSubject.create({
              data: {
                name: losname,
                type: 'los',
                subjectId: chapter.id,
              },
            });
          }
          console.log(los);
          let fallnumber = await this.databaseService.fallNumber.findFirst({
            where: {
              number: coursedata[6],
            },
          });
          if (!fallnumber) {
            fallnumber = await this.databaseService.fallNumber.create({
              data: {
                number: coursedata[6],
              },
            });
          }
          let courseToFallNumber =
            await this.databaseService.fallNumberToCourse.findFirst({
              where: {
                courseId: incourse.id,
                fallId: fallnumber.id,
              },
            });
          if (!courseToFallNumber) {
            courseToFallNumber =
              await this.databaseService.fallNumberToCourse.create({
                data: {
                  courseId: incourse.id,
                  fallId: fallnumber.id,
                },
              });
          }
          let losfallnumber =
            await this.databaseService.fallNumberToSubject.findFirst({
              where: {
                subjectId: los.id,
                fallId: fallnumber.id,
              },
            });
          if (!losfallnumber) {
            await this.databaseService.fallNumberToSubject.create({
              data: {
                subjectId: los.id,
                fallId: fallnumber.id,
              },
            });
          }
        }
      }
    }
    return response.data;
  }

  async getCourse(userid: number, platformid: number) {
    return await this.databaseService.userToCourse.findFirst({
      where: {
        userId: userid,
        Course: {
          OR: [
            {
              Platform: {
                some: {
                  platformId: platformid,
                },
              },
            },
            {
              Course: {
                OR: [
                  {
                    Platform: {
                      some: {
                        platformId: platformid,
                      },
                    },
                  },
                  {
                    Course: {
                      OR: [
                        {
                          Platform: {
                            some: {
                              platformId: platformid,
                            },
                          },
                        },
                        {
                          Course: {
                            Platform: {
                              some: {
                                platformId: platformid,
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
    });
  }

  async createEmployee(employeePostDto: EmployeePostDto) {
    let employee = await this.databaseService.employee.findFirst({
      where: {
        email: employeePostDto.email,
      },
    });
    if (!employee) {
      employee = await this.databaseService.employee.create({
        data: {
          fname: employeePostDto.firstName,
          lname: employeePostDto.lastName,
          email: employeePostDto.email,
          password: employeePostDto.password,
          isActive: employeePostDto.isActive !== '1' ? false : true,
          profile:
            employeePostDto.profile !== 'NULL' ? employeePostDto.profile : null,
        },
      });
      const permission =
        await this.databaseService.employeePermission.findFirst({
          where: {
            name: 'canViewProfile',
          },
        });
      if (permission) {
        await this.databaseService.employeeToEmployeePermission.create({
          data: {
            employeeId: employee.id,
            permissionId: permission.id,
          },
        });
      }
    }
    return employee;
  }

  async getUser(req: CustomRequest) {
    const user = await this.databaseService.user.findFirst({
      where: {
        id: req.userid,
      },
      select: {
        fname: true,
        lname: true,
        email: true,
        phone: true,
        countryCode: true,
        profile: true,
        Meta: true,
        id: true,
      },
    });
    return user;
  }

  async findCart(
    cartQueryDto: CartQueryDto,
    userid: number,
    platformId: number,
  ) {
    let course;
    const user = await this.databaseService.user.findFirst({
      where: {
        id: userid,
      },
      include: {
        Meta: true,
      },
    });
    if (cartQueryDto.courseId != undefined) {
      course = await this.databaseService.course.findFirst({
        where: {
          id: cartQueryDto.courseId,
          Meta: {
            some: {
              purchasable: true,
            },
          },
        },
      });
    }
    if (!course && cartQueryDto.courseId != undefined) {
      throw new BadRequestException('Invalid course for getting cart');
    }
    let cart: any = await this.databaseService.userCart.findMany({
      where: {
        ...(cartQueryDto.courseId === undefined &&
          cartQueryDto.productId === undefined && {
            status: {
              in: ['cart'],
              notIn: ['paid', 'removed', 'awaited'],
            },
          }),
        ...((cartQueryDto.courseId !== undefined ||
          cartQueryDto.productId !== undefined) && {
          OR: [
            {
              ...(cartQueryDto.courseId !== undefined && {
                status: {
                  notIn: ['paid', 'removed', 'awaited'],
                },
                Course: {
                  OR: [
                    {
                      id: cartQueryDto.courseId,
                      Meta: {
                        some: {
                          purchasable: true,
                        },
                      },
                    },
                    {
                      Course: {
                        OR: [
                          {
                            id: cartQueryDto.courseId,
                            Courses: {
                              some: {
                                NOT: {
                                  Meta: {
                                    some: {
                                      purchasable: true,
                                    },
                                  },
                                },
                              },
                            },
                          },
                          {
                            Course: {
                              OR: [
                                {
                                  id: cartQueryDto.courseId,
                                },
                                {
                                  Course: {
                                    OR: [
                                      {
                                        id: cartQueryDto.courseId,
                                      },
                                      {
                                        Course: {
                                          id: cartQueryDto.courseId,
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
              }),
            },
            {
              ...(cartQueryDto.productId !== undefined && {
                status: {
                  notIn: ['paid', 'removed', 'awaited'],
                },
                Product: {
                  OR: [
                    { id: cartQueryDto.productId },
                    {
                      OR: [
                        { id: cartQueryDto.productId },
                        {
                          Product: {
                            OR: [
                              { id: cartQueryDto.productId },
                              {
                                Product: {
                                  OR: [
                                    { id: cartQueryDto.productId },
                                    {
                                      Product: {
                                        OR: [
                                          { id: cartQueryDto.productId },
                                          {
                                            Product: {
                                              id: cartQueryDto.productId,
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
                  ],
                },
              }),
            },
          ],
        }),
        userId: userid,
      },
      include: {
        ExtraOptions: {
          include: {
            ExtraOption: {
              include: {
                Option: {
                  include: {
                    Option: true,
                  },
                },
              },
            },
          },
        },
        Product: {
          include: {
            Meta: true,
            Product: {
              include: {
                Meta: true,
                Product: {
                  include: {
                    Meta: true,
                    Product: true,
                  },
                },
              },
            },
          },
        },
        Course: {
          include: {
            Course: {
              include: {
                Meta: true,
                Course: {
                  include: {
                    Meta: true,
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
                  },
                },
              },
            },
            Meta: true,
          },
        },
      },
    });
    if (cart.length === 0) {
      if (cartQueryDto.courseId !== undefined) {
        cart = await this.databaseService.userCart.create({
          data: {
            courseId: cartQueryDto.courseId,
            userId: userid,
            isComplete: false,
            status: 'browsing',
          },
        });
        this.leadService.checkNewCart(platformId, cart.id);
        cart = [cart];
        if (process.env.NODE_ENV !== 'development') {
          const formattedDate = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).format(new Date());
          this.httpService
            .post(process.env.sheetLink, {
              section: 'browsing',
              date: formattedDate,
              email: user.email,
              phone: user.phone,
              countryCode: user.countryCode,
              fname: user.fname,
              lname: user.lname,
              course: course.name,
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
      }
      if (cartQueryDto.productId) {
        cart = await this.databaseService.userCart.create({
          data: {
            productId: cartQueryDto.productId,
            userId: userid,
            isComplete: false,
            status: 'browsing',
          },
        });
        cart = [cart];
      }
    }
    return { cart };
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

  async findClosestPurchasableProduct(productId: number) {
    const product = await this.databaseService.product.findFirst({
      where: {
        id: productId,
      },
      include: {
        Meta: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Product Not Found');
    }
    if (product.Meta.some((meta) => meta.purchasable === true)) {
      return product;
    } else {
      return this.findClosestPurchasableProduct(product.productId);
    }
  }

  async getOrders(userId: number, getOrdersDto: GetUserOrdersDto) {
    const payment = await this.databaseService.userPayments.findMany({
      where: {
        orderId: getOrdersDto.orderId ? getOrdersDto.orderId : undefined,
        userId: userId,
        status: 'success',
        createdAt: {
          gte: getOrdersDto.startDate ? getOrdersDto.startDate : undefined,
          lte: getOrdersDto.endDate ? getOrdersDto.endDate : undefined,
        },
      },
      include: {
        Cart: {
          include: {
            ExtraOptions: {
              include: {
                ExtraOption: {
                  include: {
                    Option: {
                      include: {
                        Option: true,
                      },
                    },
                  },
                },
              },
            },
            Product: {
              include: {
                Meta: true,
                Product: {
                  include: {
                    Meta: true,
                    Product: {
                      include: {
                        Meta: true,
                        Product: true,
                      },
                    },
                  },
                },
              },
            },
            Course: {
              include: {
                Course: {
                  include: {
                    Meta: true,
                    Course: {
                      include: {
                        Meta: true,
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
                      },
                    },
                  },
                },
                Meta: true,
              },
            },
          },
        },
      },
    });
    if (!payment) {
      throw new NotFoundException('No Previous Payment Found');
    }
    return { payment };
  }

  async patchCart(cartPostDto: CartPostDto, userId: number, plaformId: number) {
    let course;
    let cart = await this.databaseService.userCart.findFirst({
      where: {
        id: cartPostDto.cartId,
        status: {
          in: ['browsing', 'cart'],
        },
        userId: userId,
      },
      include: {
        ExtraOptions: {
          include: {
            ExtraOption: {
              include: {
                Option: {
                  include: {
                    Option: true,
                  },
                },
              },
            },
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
              },
            },
          },
        },
        Product: {
          include: {
            Meta: true,
            Product: {
              include: {
                Meta: true,
                Product: {
                  include: {
                    Meta: true,
                    Product: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!cart) {
      throw new NotFoundException('Cart Not Found');
    }
    if (cartPostDto.courseId !== undefined) {
      const closest_course = await this.findClosestPurchasableCourse(
        cartPostDto.courseId,
      );
      course = await this.databaseService.course.findFirst({
        where: {
          id: closest_course.id,
        },
        include: {
          Course: {
            include: {
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
      if (cartPostDto.cartId !== cart.courseId) {
        const requestedCourse = await this.databaseService.course.findFirst({
          where: {
            id: cartPostDto.courseId,
            OR: [
              {
                id: course.id,
              },
              {
                Course: {
                  OR: [
                    {
                      id: course.id,
                    },
                    {
                      Course: {
                        OR: [
                          {
                            id: course.id,
                          },
                          {
                            Course: {
                              OR: [
                                {
                                  id: course.id,
                                },
                                {
                                  Course: {
                                    OR: [
                                      {
                                        id: course.id,
                                      },
                                      {
                                        Course: {
                                          OR: [
                                            {
                                              id: course.id,
                                            },
                                            {
                                              Course: {
                                                id: course.id,
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
        });
        if (!requestedCourse) {
          throw new ConflictException(
            'This course cannot be added to this cart',
          );
        }
        cart = await this.databaseService.userCart.update({
          where: {
            id: cart.id,
          },
          data: {
            courseId: requestedCourse.id,
          },
          include: {
            ExtraOptions: {
              include: {
                ExtraOption: {
                  include: {
                    Option: {
                      include: {
                        Option: true,
                      },
                    },
                  },
                },
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
                  },
                },
              },
            },
            Product: {
              include: {
                Meta: true,
                Product: {
                  include: {
                    Meta: true,
                    Product: {
                      include: {
                        Meta: true,
                        Product: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      }

      if (cartPostDto.extraOptionId) {
        const extraoption = await this.databaseService.extraOption.findFirst({
          where: {
            courseId: course.id,
            OR: [
              {
                id: cartPostDto.extraOptionId,
              },
              {
                Options: {
                  some: {
                    id: cartPostDto.extraOptionId,
                  },
                },
              },
            ],
          },
        });
        if (!extraoption) {
          throw new ConflictException('Invalid Extra Options Provided');
        }
        const isInCart =
          await this.databaseService.extraOptionsToCart.findFirst({
            where: {
              cartId: cart.id,
              OR: [
                {
                  ExtraOption: {
                    id: extraoption.id,
                  },
                },
                {
                  ExtraOption: {
                    Option: {
                      OR: [
                        {
                          id: extraoption.id,
                        },
                        {
                          Option: {
                            id: extraoption.id,
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          });
        if (isInCart) {
          await this.databaseService.extraOptionsToCart.delete({
            where: {
              id: isInCart.id,
            },
          });
          if (cartPostDto.extraOptionId != isInCart.extraOptionId) {
            await this.databaseService.extraOptionsToCart.create({
              data: {
                cartId: cart.id,
                extraOptionId: cartPostDto.extraOptionId,
              },
            });
          }
        } else {
          await this.databaseService.extraOptionsToCart.create({
            data: {
              cartId: cart.id,
              extraOptionId: cartPostDto.extraOptionId,
            },
          });
        }
      }
      if (cartPostDto.isCart) {
        const isAcceptableCourse = await this.databaseService.course.findFirst({
          where: {
            id: cart.courseId,
          },
          include: {
            Courses: {
              where: {
                Meta: {
                  some: {
                    purchasable: {
                      not: true,
                    },
                  },
                },
              },
            },
          },
        });
        if (isAcceptableCourse.Courses.length > 0) {
          throw new ConflictException(
            'Cannot Accept course with child element on it.',
          );
        }
        const requiredExtraOptions =
          await this.databaseService.extraOption.count({
            where: {
              courseId: course.id,
              required: true,
            },
          });
        const allRequiredExtraOptions =
          await this.databaseService.extraOptionsToCart.count({
            where: {
              cartId: cart.id,
              OR: [
                {
                  ExtraOption: {
                    required: true,
                    courseId: course.id,
                  },
                },
                {
                  ExtraOption: {
                    Option: {
                      OR: [
                        {
                          required: true,
                          courseId: course.id,
                        },
                        {
                          Option: {
                            OR: [
                              {
                                required: true,
                                courseId: course.id,
                              },
                              {
                                Option: {
                                  OR: [
                                    {
                                      required: true,
                                      courseId: course.id,
                                    },
                                    {
                                      Option: {
                                        OR: [
                                          {
                                            required: true,
                                            courseId: course.id,
                                          },
                                          {
                                            Option: {
                                              OR: [
                                                {
                                                  required: true,
                                                  courseId: course.id,
                                                },
                                                {
                                                  Option: {
                                                    required: true,
                                                    courseId: course.id,
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
              ],
            },
          });

        if (requiredExtraOptions !== allRequiredExtraOptions) {
          throw new ConflictException(
            'All required extra options are not filled',
          );
        }
        await this.databaseService.userCart.update({
          where: {
            id: cart.id,
          },
          data: {
            status: 'cart',
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
        const whatsappTemplate =
          await this.databaseService.platformTemplate.findFirst({
            where: {
              platformId: plaformId,
              name: 'Add Cart',
            },
          });
        const whatsappNumber = user?.Meta?.whatsappNumber
          ? (user.Meta.whatsappCountryCode ?? user.countryCode) +
            user.Meta.whatsappNumber
          : user.countryCode + user.phone;
        const getCourseName = this.getCourseName(course);
        if (whatsappTemplate) {
          await this.whatsappService.sendWhatsappMessage(
            whatsappNumber,
            user.fname + ' ' + user.lname,
            whatsappTemplate.templateId,
            [user.fname, getCourseName],
          );
        }
        let isPendrive = false;
        let device = '';
        for (const extraoption of cart.ExtraOptions) {
          if (
            extraoption.ExtraOption.name === 'Windows' ||
            extraoption.ExtraOption.name === 'Android' ||
            extraoption.ExtraOption.name === 'iOS' ||
            extraoption.ExtraOption.name === 'MacOs'
          ) {
            device = extraoption.ExtraOption.name;
          }
          if (extraoption.ExtraOption.name === 'Include Pendrive') {
            isPendrive = true;
          }
        }
        if (process.env.NODE_ENV !== 'development') {
          const formattedDate = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).format(new Date());
          const formatAccountCreateDate = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).format(user.createdAt);
          this.httpService
            .post(process.env.sheetLink, {
              section: 'cart',
              date: formattedDate,
              accountCreateDate: formatAccountCreateDate,
              email: user.email,
              phone: user.phone,
              countryCode: user.countryCode,
              fname: user.fname,
              lname: user.lname,
              whatsappCountryCode:
                user.Meta?.whatsappCountryCode !== null
                  ? user.Meta?.whatsappCountryCode
                  : null,
              whatsappNumber:
                user.Meta?.whatsappNumber !== null
                  ? user.Meta?.whatsappNumber
                  : null,
              course: this.getCourseName(course),
              session: this.getSessionName(cart.Course),
              device: device,
              pendrive: isPendrive,
            })
            .pipe(
              catchError((error: AxiosError) => {
                console.error('An Error Happened9', error.message);
                return []; // Handle error, optionally return an empty observable
              }),
            )
            .subscribe({
              next: (response) => response,
              error: (err) => console.error('HTTP request failed:', err),
            });
        }
      }
    }
    if (cartPostDto.productId !== undefined) {
      const purchasableProduct = await this.findClosestPurchasableProduct(
        cart.productId,
      );
      if (!purchasableProduct) {
        throw new NotFoundException('Product Not Found');
      }
      if (cartPostDto.productId !== cart.productId) {
        const requestedProduct = await this.databaseService.product.findFirst({
          where: {
            OR: [
              {
                id: purchasableProduct.id,
              },
              {
                Product: {
                  OR: [
                    {
                      id: purchasableProduct.id,
                    },
                    {
                      Product: {
                        OR: [
                          {
                            id: purchasableProduct.id,
                          },
                          {
                            OR: [
                              {
                                Product: {
                                  id: purchasableProduct.id,
                                },
                              },
                            ],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        });
        if (!requestedProduct) {
          throw new ConflictException(
            'This product cannot be added to this cart',
          );
        }
        cart = await this.databaseService.userCart.update({
          where: {
            id: cart.id,
          },
          data: {
            productId: purchasableProduct.id,
          },
          include: {
            ExtraOptions: {
              include: {
                ExtraOption: {
                  include: {
                    Option: {
                      include: {
                        Option: true,
                      },
                    },
                  },
                },
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
                  },
                },
              },
            },
            Product: {
              include: {
                Meta: true,
                Product: {
                  include: {
                    Meta: true,
                    Product: {
                      include: {
                        Meta: true,
                        Product: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      }
      if (cartPostDto.quantity > 0) {
        await this.databaseService.userCart.update({
          where: {
            id: cart.id,
          },
          data: {
            quantity: cartPostDto.quantity,
          },
        });
      }
      if (cartPostDto.isCart) {
        const isAcceptableProduct =
          await this.databaseService.product.findFirst({
            where: {
              id: cart.productId,
              Meta: {
                some: {
                  purchasable: true,
                },
              },
            },
          });
        await this.databaseService.userCart.update({
          where: {
            id: cart.id,
          },
          data: {
            status: 'cart',
          },
        });
      }
    }
    this.leadService.checkNewCart(plaformId, cart.id);
    cart = await this.databaseService.userCart.findFirst({
      where: {
        id: cart.id,
      },
      include: {
        ExtraOptions: {
          include: {
            ExtraOption: {
              include: {
                Option: {
                  include: {
                    Option: true,
                  },
                },
              },
            },
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
              },
            },
          },
        },
        Product: {
          include: {
            Meta: true,
            Product: {
              include: {
                Meta: true,
                Product: {
                  include: {
                    Meta: true,
                    Product: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return cart;
  }

  getCourseName(course: any): string {
    if (course.Course) {
      const parentName = this.getCourseName(course.Course);
      const currentName =
        course.expiry === null
          ? course.abbr !== null
            ? ' ' + course.abbr
            : ''
          : '';
      return parentName + currentName;
    } else {
      return course.expiry === null
        ? course.abbr !== null
          ? course.abbr
          : ''
        : '';
    }
  }

  async deleteCart(userid: number, cartid: number) {
    let cart = await this.databaseService.userCart.findFirst({
      where: {
        id: cartid,
        userId: userid,
      },
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    cart = await this.databaseService.userCart.update({
      where: {
        id: cart.id,
      },
      data: {
        status: 'removed',
      },
    });
    return { cartId: cart.id };
  }

  async getBilling(userid: number) {
    const billing = await this.databaseService.userBilling.findFirst({
      where: {
        userId: userid,
      },
    });
    if (!billing) {
      throw new NotFoundException('Billing Data Not Found');
    }
    return billing;
  }

  async getShipping(userid: number) {
    const shipping = await this.databaseService.userShipping.findFirst({
      where: {
        userId: userid,
      },
    });
    if (!shipping) {
      throw new NotFoundException('Shipping Details Not Found');
    }
    return shipping;
  }

  async patchBilling(userId: number, billingPatchDto: BillingPatchDto) {
    let billing = await this.databaseService.userBilling.findFirst({
      where: {
        userId: userId,
        id: billingPatchDto.billingId,
      },
    });
    if (!billing) {
      throw new NotFoundException('Billing Data not found');
    }
    if (
      billingPatchDto.fname !== undefined &&
      billingPatchDto.fname !== billing.fname
    ) {
      await this.databaseService.userBilling.update({
        where: {
          id: billing.id,
        },
        data: {
          fname: billingPatchDto.fname,
        },
      });
      if (billing.fname !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Billing Fname',
            valueText: billing.fname,
          },
        });
      }
    }
    if (
      billingPatchDto.lname !== undefined &&
      billingPatchDto.lname !== billing.lname
    ) {
      await this.databaseService.userBilling.update({
        where: {
          id: billing.id,
        },
        data: {
          lname: billingPatchDto.lname,
        },
      });
      if (billing.lname !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Billing Lname',
            valueText: billing.lname,
          },
        });
      }
    }
    if (
      billingPatchDto.email !== undefined &&
      billingPatchDto.email !== billing.email
    ) {
      await this.databaseService.userBilling.update({
        where: {
          id: billing.id,
        },
        data: {
          email: billingPatchDto.email,
        },
      });
      if (billing.email !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Billing Email',
            valueText: billing.email,
          },
        });
      }
    }

    if (
      billingPatchDto.countryCode !== undefined &&
      billingPatchDto.countryCode !== billing.countryCode
    ) {
      await this.databaseService.userBilling.update({
        where: {
          id: billing.id,
        },
        data: {
          countryCode: billingPatchDto.countryCode,
        },
      });
      if (billing.countryCode !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Billing CountryCode',
            valueText: billing.countryCode,
          },
        });
      }
    }
    if (
      billingPatchDto.phone !== undefined &&
      billingPatchDto.phone !== billing.phone
    ) {
      await this.databaseService.userBilling.update({
        where: {
          id: billing.id,
        },
        data: {
          phone: billingPatchDto.phone,
        },
      });
      if (billing.phone !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Billing Phone',
            valueText: billing.phone,
          },
        });
      }
    }

    if (
      billingPatchDto.address !== undefined &&
      billingPatchDto.address !== billing.address
    ) {
      await this.databaseService.userBilling.update({
        where: {
          id: billing.id,
        },
        data: {
          address: billingPatchDto.address,
        },
      });
      if (billing.address !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Billing Address',
            valueText: billing.address,
          },
        });
      }
    }

    if (
      billingPatchDto.city !== undefined &&
      billingPatchDto.city !== billing.city
    ) {
      await this.databaseService.userBilling.update({
        where: {
          id: billing.id,
        },
        data: {
          city: billingPatchDto.city,
        },
      });
      if (billing.city !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Billing City',
            valueText: billing.city,
          },
        });
      }
    }

    if (
      billingPatchDto.state !== undefined &&
      billingPatchDto.state !== billing.state
    ) {
      await this.databaseService.userBilling.update({
        where: {
          id: billing.id,
        },
        data: {
          state: billingPatchDto.state,
        },
      });
      if (billing.state !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Billing State',
            valueText: billing.state,
          },
        });
      }
    }

    if (
      billingPatchDto.country !== undefined &&
      billingPatchDto.country !== billing.country
    ) {
      await this.databaseService.userBilling.update({
        where: {
          id: billing.id,
        },
        data: {
          country: billingPatchDto.country,
        },
      });
      if (billing.country !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Billing Country',
            valueText: billing.country,
          },
        });
      }
    }

    if (
      billingPatchDto.pincode !== undefined &&
      billingPatchDto.pincode !== billing.pincode
    ) {
      await this.databaseService.userBilling.update({
        where: {
          id: billing.id,
        },
        data: {
          pincode: billingPatchDto.pincode,
        },
      });
      if (billing.pincode !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Billing Pincode',
            valueText: billing.pincode,
          },
        });
      }
    }

    if (
      billingPatchDto.pincode !== undefined &&
      billingPatchDto.pincode !== billing.pincode
    ) {
      await this.databaseService.userBilling.update({
        where: {
          id: billing.id,
        },
        data: {
          pincode: billingPatchDto.pincode,
        },
      });
      if (billing.pincode !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Billing Pincode',
            valueText: billing.pincode,
          },
        });
      }
    }
    billing = await this.databaseService.userBilling.findFirst({
      where: {
        id: billing.id,
      },
    });
    return billing;
  }

  async deleteShipping(userId: number, shippingId: number) {
    const shipping = await this.databaseService.userShipping.findFirst({
      where: {
        id: shippingId,
        userId: userId,
      },
    });
    if (!shipping) {
      throw new NotFoundException('No Shipping data found to delete!');
    }
    await this.databaseService.userMetaHistory.create({
      data: {
        userId: userId,
        field: 'Shippping Deleted',
        valueJson: shipping,
      },
    });
    await this.databaseService.userShipping.delete({
      where: {
        id: shipping.id,
      },
    });
    return shipping;
  }

  async patchShipping(userId: number, shippingPatchDto: ShippingPatchDto) {
    let shipping = await this.databaseService.userShipping.findFirst({
      where: {
        userId: userId,
        id: shippingPatchDto.shippingId,
      },
    });
    if (!shipping) {
      throw new NotFoundException('Shipping Details Not Found');
    }
    if (
      shippingPatchDto.fname !== undefined &&
      shippingPatchDto.fname !== shipping.fname
    ) {
      await this.databaseService.userShipping.update({
        where: {
          id: shipping.id,
        },
        data: {
          fname: shippingPatchDto.fname,
        },
      });
      if (shipping.fname !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Shipping Fname',
            valueText: shipping.fname,
          },
        });
      }
    }
    if (
      shippingPatchDto.lname !== undefined &&
      shippingPatchDto.lname !== shipping.lname
    ) {
      await this.databaseService.userShipping.update({
        where: {
          id: shipping.id,
        },
        data: {
          lname: shippingPatchDto.lname,
        },
      });
      if (shipping.lname !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Shipping Lname',
            valueText: shipping.lname,
          },
        });
      }
    }
    if (
      shippingPatchDto.email !== undefined &&
      shippingPatchDto.email !== shipping.email
    ) {
      await this.databaseService.userShipping.update({
        where: {
          id: shipping.id,
        },
        data: {
          email: shippingPatchDto.email,
        },
      });
      if (shipping.email !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Shipping Email',
            valueText: shipping.email,
          },
        });
      }
    }
    if (
      shippingPatchDto.countryCode !== undefined &&
      shippingPatchDto.countryCode !== shipping.countryCode
    ) {
      await this.databaseService.userShipping.update({
        where: {
          id: shipping.id,
        },
        data: {
          countryCode: shippingPatchDto.countryCode,
        },
      });
      if (shipping.countryCode !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Shipping CountryCode',
            valueText: shipping.countryCode,
          },
        });
      }
    }
    if (
      shippingPatchDto.countryCode !== undefined &&
      shippingPatchDto.countryCode !== shipping.countryCode
    ) {
      await this.databaseService.userShipping.update({
        where: {
          id: shipping.id,
        },
        data: {
          countryCode: shippingPatchDto.countryCode,
        },
      });
      if (shipping.countryCode !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Shipping CountryCode',
            valueText: shipping.countryCode,
          },
        });
      }
    }
    if (
      shippingPatchDto.phone !== undefined &&
      shippingPatchDto.phone !== shipping.phone
    ) {
      await this.databaseService.userShipping.update({
        where: {
          id: shipping.id,
        },
        data: {
          phone: shippingPatchDto.phone,
        },
      });
      if (shipping.phone !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Shipping Phone',
            valueText: shipping.phone,
          },
        });
      }
    }
    if (
      shippingPatchDto.address !== undefined &&
      shippingPatchDto.address !== shipping.address
    ) {
      await this.databaseService.userShipping.update({
        where: {
          id: shipping.id,
        },
        data: {
          address: shippingPatchDto.address,
        },
      });
      if (shipping.address !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Shipping Address',
            valueText: shipping.address,
          },
        });
      }
    }
    if (
      shippingPatchDto.city !== undefined &&
      shippingPatchDto.city !== shipping.city
    ) {
      await this.databaseService.userShipping.update({
        where: {
          id: shipping.id,
        },
        data: {
          city: shippingPatchDto.city,
        },
      });
      if (shipping.city !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Shipping City',
            valueText: shipping.city,
          },
        });
      }
    }
    if (
      shippingPatchDto.state !== undefined &&
      shippingPatchDto.state !== shipping.state
    ) {
      await this.databaseService.userShipping.update({
        where: {
          id: shipping.id,
        },
        data: {
          state: shippingPatchDto.state,
        },
      });
      if (shipping.state !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Shipping State',
            valueText: shipping.state,
          },
        });
      }
    }
    if (
      shippingPatchDto.state !== undefined &&
      shippingPatchDto.state !== shipping.state
    ) {
      await this.databaseService.userShipping.update({
        where: {
          id: shipping.id,
        },
        data: {
          state: shippingPatchDto.state,
        },
      });
      if (shipping.state !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Shipping State',
            valueText: shipping.state,
          },
        });
      }
    }
    if (
      shippingPatchDto.country !== undefined &&
      shippingPatchDto.country !== shipping.country
    ) {
      await this.databaseService.userShipping.update({
        where: {
          id: shipping.id,
        },
        data: {
          country: shippingPatchDto.country,
        },
      });
      if (shipping.country !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Shipping Country',
            valueText: shipping.country,
          },
        });
      }
    }
    if (
      shippingPatchDto.pincode !== undefined &&
      shippingPatchDto.pincode !== shipping.pincode
    ) {
      await this.databaseService.userShipping.update({
        where: {
          id: shipping.id,
        },
        data: {
          pincode: shippingPatchDto.pincode,
        },
      });
      if (shipping.pincode !== null) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'Shipping Pincode',
            valueText: shipping.pincode,
          },
        });
      }
    }
    shipping = await this.databaseService.userShipping.findFirst({
      where: {
        id: shipping.id,
      },
    });
    return shipping;
  }

  async generateOrderNumber(prefix: string): Promise<string> {
    const orderDate = new Date();
    orderDate.setMinutes(orderDate.getMinutes() + 330);
    const redisClient = (this.cacheManager as any).stores[0].opts.store._client;
    if (!redisClient || !redisClient.isOpen) {
      console.error('Redis client is closed! Trying to reconnect...');
      await redisClient.connect();
    }
    const orderCountToday = await redisClient.incr('daily_order_counter');
    const orderNumberSuffix = String(orderCountToday).padStart(3, '0');
    const ordernumber =
      prefix +
      '-51' +
      orderDate.toISOString().slice(5, 7) +
      orderDate.toISOString().slice(2, 4) +
      orderDate.toISOString().slice(8, 10) +
      orderNumberSuffix;
    return ordernumber;
  }

  async generatePayment(
    platformId: number,
    userId: number,
    billingShippingCreateDto: BillingShippingPostDto,
  ) {
    let anotherUserId: number;
    let user;
    let isBanned = false;
    let anotherUser = false;
    if (billingShippingCreateDto.userEmail) {
      user = await this.databaseService.user.findFirst({
        where: {
          OR: [
            { email: billingShippingCreateDto.userEmail },
            { phone: billingShippingCreateDto.userPhone },
          ],
        },
      });
      if (user) {
        anotherUserId = user.id;
      } else {
        const anotheruser = await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            field: 'anotherUser',
            valueJson: {
              email: billingShippingCreateDto.userEmail,
              phone: billingShippingCreateDto.userPhone,
              fname: billingShippingCreateDto.userFname,
              lname: billingShippingCreateDto.userLname,
              countryCode: billingShippingCreateDto.userCountryCode,
            },
          },
        });
        anotherUser = true;
      }
    }
    if (
      anotherUserId !== undefined &&
      billingShippingCreateDto.billingId !== undefined
    ) {
      throw new BadRequestException('billing  id cannot be for another user!!');
    }
    let billingInfo;
    if (billingShippingCreateDto.billingId !== undefined) {
      billingInfo = await this.databaseService.userBilling.findFirst({
        where: {
          id: billingShippingCreateDto.billingId,
          userId: userId,
        },
        include: {
          Company: true,
        },
      });
    } else {
      billingInfo = await this.databaseService.userBilling.findFirst({
        where: {
          userId: userId,
        },
      });

      if (billingInfo && anotherUserId === undefined) {
        throw new ConflictException('Another billing information exists');
      }
      if (anotherUserId !== undefined && billingInfo) {
        if (billingInfo.Company && billingInfo.Company.length > 0) {
          await this.databaseService.userMetaHistory.create({
            data: {
              userId: userId,
              valueJson: billingInfo.Company[0],
              field: 'Billing Company Json',
            },
          });
        }
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: userId,
            valueJson: billingInfo,
            field: 'Billing Json',
          },
        });
        await this.databaseService.userBilling.delete({
          where: {
            id: billingInfo.id,
          },
        });
      }
      billingInfo = await this.databaseService.userBilling.create({
        data: {
          fname: billingShippingCreateDto.billingFname,
          lname: billingShippingCreateDto.billingLname,
          email: billingShippingCreateDto.billingEmail,
          countryCode: billingShippingCreateDto.billingCountryCode,
          phone: billingShippingCreateDto.billingPhone,
          address: billingShippingCreateDto.billingAddress,
          city: billingShippingCreateDto.billingCity,
          state: billingShippingCreateDto.billingState,
          country: billingShippingCreateDto.billingCountry,
          pincode: billingShippingCreateDto.billingPincode,
          userId: userId,
        },
      });
    }
    if (billingShippingCreateDto.billingCompanyGst !== undefined) {
      const billingCompany =
        await this.databaseService.billingCompany.findFirst({
          where: {
            billId: billingInfo.id,
          },
        });
      if (billingCompany) {
        if (
          billingCompany.gstNo.toLowerCase() !==
          billingShippingCreateDto.billingCompanyGst.toLowerCase()
        ) {
          await this.databaseService.userMetaHistory.create({
            data: {
              userId: userId,
              field: 'Billing Company Json',
              valueJson: billingCompany,
            },
          });
          await this.databaseService.billingCompany.create({
            data: {
              billId: billingInfo.id,
              name: billingShippingCreateDto.billingCompanyName,
              address: billingShippingCreateDto.billingCompanyAddress,
              gstNo: billingShippingCreateDto.billingCompanyGst,
            },
          });
        }
      } else {
        const billingCompany = await this.databaseService.billingCompany.create(
          {
            data: {
              billId: billingInfo.id,
              name: billingShippingCreateDto.billingCompanyName,
              address: billingShippingCreateDto.billingCompanyAddress,
              gstNo: billingShippingCreateDto.billingCompanyGst,
            },
          },
        );
      }
    }
    let shippingInfo;
    if (billingShippingCreateDto.shippingId !== undefined) {
      shippingInfo = await this.databaseService.userShipping.findFirst({
        where: {
          id: billingShippingCreateDto.shippingId,
          userId: userId,
        },
      });
    } else {
      shippingInfo = await this.databaseService.userShipping.findFirst({
        where: {
          userId: userId,
        },
      });
      if (shippingInfo) {
        throw new ConflictException('Another shipping information exists');
      }
      if (billingShippingCreateDto.shippingAddress !== undefined) {
        shippingInfo = await this.databaseService.userShipping.create({
          data: {
            fname: billingShippingCreateDto.shippingFname,
            lname: billingShippingCreateDto.shippingFname,
            email: billingShippingCreateDto.shippingEmail,
            countryCode: billingShippingCreateDto.shippingCountryCode,
            phone: billingShippingCreateDto.shippingPhone,
            address: billingShippingCreateDto.shippingAddress,
            city: billingShippingCreateDto.shippingCity,
            state: billingShippingCreateDto.shippingState,
            country: billingShippingCreateDto.shippingCountry,
            pincode: billingShippingCreateDto.shippingPincode,
            userId: userId,
          },
        });
      }
    }
    const shippingCountry = billingInfo.country;
    const countryIdData = await lastValueFrom(
      this.httpService
        .post('https://geocode.aswinibajaj.com/api/get-country-id-by-name', {
          name: shippingCountry,
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw 'An Error Happened10' + error;
          }),
        ),
    );
    const { country_id } = countryIdData.data;
    let orderAmount: number = 0;
    const carts = await this.databaseService.userCart.findMany({
      where: {
        userId: userId,
        status: 'cart',
      },
      include: {
        ExtraOptions: {
          include: {
            ExtraOption: true,
          },
        },
      },
    });
    const cartIds: object[] = [];
    for (const cart in carts) {
      if (carts[cart].courseId !== null) {
        let deliveryCharge = 0;
        let bannedcharge = 0;

        const course = await this.findClosestPurchasableCourse(
          carts[cart].courseId,
        );
        orderAmount = orderAmount + Number(course.Meta[0].price);
        const bannedCountry =
          await this.databaseService.bannedLocation.findFirst({
            where: {
              countryId: country_id,
              courseId: course.id,
            },
          });
        if (bannedCountry) {
          orderAmount = orderAmount - Number(bannedCountry.reductionCharge);
          bannedcharge = bannedCountry.reductionCharge;
          for (let i = carts[cart].ExtraOptions.length - 1; i >= 0; i--) {
            const extraOption = carts[cart].ExtraOptions[i];
            if (extraOption.ExtraOption.isDeliverable === true) {
              await this.databaseService.extraOptionsToCart.delete({
                where: {
                  id: extraOption.id,
                },
              });
              carts[cart].ExtraOptions.splice(i, 1);
            }
          }
        } else {
          let deliverycharges =
            await this.databaseService.packageDeliveryCharge.findFirst({
              where: {
                countryId: country_id,
                courseId: course.id,
              },
            });
          if (!deliverycharges) {
            const data = await lastValueFrom(
              this.httpService
                .post(
                  'https://geocode.aswinibajaj.com/api/get-continent-by-country',
                  {
                    country_id: country_id,
                  },
                )
                .pipe(
                  catchError((error: AxiosError) => {
                    throw 'An Error Happened11' + error.message;
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
          if (deliverycharges) {
            deliveryCharge = deliverycharges.charge;
            orderAmount = orderAmount + Number(deliverycharges.charge);
          }
        }
        for (const extraoption in carts[cart].ExtraOptions) {
          if (
            carts[cart].ExtraOptions[extraoption].ExtraOption.price !== null
          ) {
            orderAmount =
              orderAmount +
              Number(carts[cart].ExtraOptions[extraoption].ExtraOption.price);
          }
        }
        let cartObject;
        if (bannedcharge !== 0) {
          cartObject = {
            cartId: carts[cart].id,
            reductionCharge: bannedcharge,
          };
        } else if (deliveryCharge !== 0) {
          cartObject = {
            cartId: carts[cart].id,
            deliveryCharge: deliveryCharge,
          };
        } else {
          cartObject = {
            cartId: carts[cart].id,
          };
        }
        cartIds.push(cartObject);
      }
      if (carts[cart].productId !== null) {
        let deliveryCharge = 0;
        let bannedcharge = 0;
        const product = await this.findClosestPurchasableProduct(
          carts[cart].productId,
        );
        const bannedCountry =
          await this.databaseService.bannedLocation.findFirst({
            where: {
              countryId: country_id,
            },
          });
        if (!bannedCountry) {
          let deliverycharges =
            await this.databaseService.packageDeliveryCharge.findFirst({
              where: {
                countryId: country_id,
              },
            });
          if (deliveryCharge) {
            orderAmount = orderAmount + Number(deliverycharges.charge);
          }
          orderAmount =
            orderAmount + Number(product.Meta[0].price * carts[cart].quantity);
        } else {
          isBanned = true;
        }
      }
    }
    const cartobject = cartIds;
    if (billingShippingCreateDto.paymentMode === 'Online') {
      const activePaymentMode =
        await this.databaseService.paymentGatways.findFirst({
          where: {
            mode: 'online',
            Platform: {
              some: {
                platformId: platformId,
                isActive: true,
              },
            },
          },
        });

      if (!activePaymentMode) {
        throw new BadRequestException('Payment Mode not active');
      }
      if (activePaymentMode.name.toLowerCase() === 'razorpay') {
        const ordernumber = await this.generateOrderNumber(
          activePaymentMode.prefix,
        );
        const orders = await this.razorPayClient.orders.create({
          amount: orderAmount * 100,
          currency: 'INR',
          receipt: ordernumber,
        });
        const payment = await this.databaseService.userPayments.create({
          data: {
            orderId: ordernumber,
            gatewayId: activePaymentMode.id,
            gatewayOrderId: orders.id,
            status: 'pending',
            userId: userId,
            amount: orderAmount,
            someElse: anotherUser,
            cartId: cartobject,
            platformId: platformId,
          },
        });
        if (isBanned) {
          await this.databaseService.userCart.updateMany({
            where: {
              userId: userId,
              status: 'cart',
              productId: null,
            },
            data: {
              paymentId: payment.id,
            },
          });
        } else {
          await this.databaseService.userCart.updateMany({
            where: {
              userId: userId,
              status: 'cart',
            },
            data: {
              paymentId: payment.id,
            },
          });
        }
        this.leadService.createdPayment(platformId, payment.id);
        return { orders, payment };
      }
    }
    if (billingShippingCreateDto.paymentMode === 'Manual') {
      const activePaymentMode =
        await this.databaseService.paymentGatways.findFirst({
          where: {
            mode: 'manual',
            Platform: {
              some: {
                platformId: platformId,
                isActive: true,
              },
            },
          },
        });
      if (!activePaymentMode) {
        throw new NotAcceptableException('This payment method is not allowed');
      }
      const ordernumber = await this.generateOrderNumber(
        activePaymentMode.prefix,
      );
      const payment = await this.databaseService.userPayments.create({
        data: {
          userId: userId,
          orderId: ordernumber,
          status: 'pending',
          amount: orderAmount,
          gatewayId: activePaymentMode.id,
          platformId: platformId,
          cartId: cartobject,
        },
      });
      await this.databaseService.userCart.updateMany({
        where: {
          userId: userId,
          status: 'cart',
        },
        data: {
          paymentId: payment.id,
        },
      });

      return { payment };
    }
  }

  getProductName(product: any): string {
    if (product.Product) {
      return product.abbr !== null
        ? product.abbr
        : product.name + ' ' + this.getProductName(product.Product);
    } else {
      return product.abbr !== null ? product.abbr : product.name;
    }
  }

  getSessionName(course: any): string {
    if (course.Course) {
      const parentName = this.getSessionName(course.Course);
      const currentName =
        course.expiry !== null
          ? course.abbr !== null
            ? ' ' + course.abbr
            : ''
          : '';
      return parentName + currentName;
    } else {
      return course.expiry !== null
        ? course.abbr !== null
          ? course.abbr
          : ''
        : '';
    }
  }

  async resetPassword(userId: number, resetPasswordDto: UserResetPasswordDto) {
    let user = await this.databaseService.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (user.password !== resetPasswordDto.oldPassword) {
      throw new NotAcceptableException('Old Password is incorrect');
    }
    user = await this.databaseService.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: resetPasswordDto.newPassword,
      },
    });
    return { message: 'Password reset succesfully' };
  }

  async getCombination(userId: number, combinationId: string) {
    const combination =
      await this.databaseService.solutionCombination.findFirst({
        where: {
          combination: combinationId,
        },
      });
    if (!combination) {
      throw new NotFoundException('Combination Not Found');
    }
    const course = await this.databaseService.course.findFirst({
      where: {
        id: combination.courseId,
        // OR: [
        //   {
        //     User: {
        //       some: {
        //         userId: userId,
        //       },
        //     },
        //   },
        //   {
        //     Courses: {
        //       some: {
        //         OR: [
        //           {
        //             User: {
        //               some: {
        //                 userId: userId,
        //               },
        //             },
        //           },
        //           {
        //             Courses: {
        //               some: {
        //                 OR: [
        //                   {
        //                     User: {
        //                       some: {
        //                         userId: userId,
        //                       },
        //                     },
        //                   },
        //                   {
        //                     Courses: {
        //                       some: {
        //                         OR: [
        //                           {
        //                             User: {
        //                               some: {
        //                                 userId: userId,
        //                               },
        //                             },
        //                           },
        //                           {
        //                             Courses: {
        //                               some: {
        //                                 OR: [
        //                                   {
        //                                     User: {
        //                                       some: {
        //                                         userId: userId,
        //                                       },
        //                                     },
        //                                   },
        //                                   {
        //                                     Courses: {
        //                                       some: {
        //                                         User: {
        //                                           some: {
        //                                             userId: userId,
        //                                           },
        //                                         },
        //                                       },
        //                                     },
        //                                   },
        //                                 ],
        //                               },
        //                             },
        //                           },
        //                         ],
        //                       },
        //                     },
        //                   },
        //                 ],
        //               },
        //             },
        //           },
        //         ],
        //       },
        //     },
        //   },
        // ],
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
    });
    return { course };
  }

  async updateProfile(userId: number, profile?: Express.Multer.File) {
    let user = await this.databaseService.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        fname: true,
        lname: true,
        profile: true,
        email: true,
      },
    });

    if (profile) {
      if (
        profile.mimetype !== 'image/png' &&
        profile.mimetype !== 'image/jpeg'
      ) {
        throw new BadRequestException('Invalid Profile Type Provided');
      }
      if (user.profile !== null) {
        this.vultrService.deleteFromVultr(user.profile);
      }
      const fileExtension = profile.originalname.includes('.')
        ? profile.originalname.split('.').pop()
        : '';
      const fileName =
        'CRM/userProfile/' + uuidv4() + user.fname + '.' + fileExtension;
      const uploadedFileVultr = await this.vultrService.uploadToVultr(
        fileName,
        profile,
      );
      user = await this.databaseService.user.update({
        where: {
          id: user.id,
        },
        data: {
          profile: uploadedFileVultr.Location,
        },
        select: {
          id: true,
          fname: true,
          lname: true,
          profile: true,
          email: true,
        },
      });
      return user;
    }
  }

  async updateProfileDetails(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ) {
    let user = await this.databaseService.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        fname: true,
        lname: true,
        profile: true,
        email: true,
        Meta: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingGender = user.Meta?.gender;

    const cleanedData = Object.fromEntries(
      Object.entries(updateProfileDto).filter(([key, value]) => {
        // Skip if value is null, undefined, or empty string
        if (
          value === null ||
          value === undefined ||
          (typeof value === 'string' && value.trim() === '') ||
          (Array.isArray(value) && value.length === 0)
        ) {
          return false;
        }

        // If gender already exists in DB, prevent update
        if (key === 'gender' && existingGender) {
          return false;
        }

        return true;
      }),
    );

    if (Object.keys(cleanedData).length === 0) {
      return user;
    }

    const updated = await this.databaseService.userMeta.update({
      where: {
        id: user.Meta.id,
      },
      data: {
        ...cleanedData,
      },
    });

    return updated;
  }

  async deleteLeads(email: string) {
    const june1stIst = new Date('2025-06-01T00:00:00+05:30');
    const june1stUtc = new Date(june1stIst).toISOString();
    const leads = await this.databaseService.userLead.findMany({
      where: {
        email: email,
      },
    });
    if (leads.length === 0) {
      return { message: 'No leads to delete' };
    }
    await this.databaseService.userLeadActivity.deleteMany({
      where: {
        leadId: {
          in: leads.map((lead) => lead.id),
        },
      },
    });
    await this.databaseService.userLeadHistory.deleteMany({
      where: {
        leadId: {
          in: leads.map((lead) => lead.id),
        },
      },
    });
    await this.databaseService.userLeadToCourseNdProduct.deleteMany({
      where: {
        leadId: {
          in: leads.map((lead) => lead.id),
        },
      },
    });
    await this.databaseService.userLead.deleteMany({
      where: {
        id: {
          in: leads.map((lead) => lead.id),
        },
      },
    });
    return { message: `${leads.length} leads deleted successfully` };
  }

  //#region Utils
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
  //#endregion

  //#region Websocket
  async initSocket(client: CustomUserSocketClient) {

    const platform = await this.databaseService.platform.findFirst({
      where: {
        OR: [
          {
            origin: client.handshake.headers.origin,
          },
          {
            auth: client.handshake.auth.dauth,
          },
          {
            auth: client.handshake.headers.dauth,
          },
        ],
      },
    });
    if (!platform) {
      client.emit('connectionError', 'Platform Not Found');
      return client.disconnect();
    }
    const isDeviceRequired =
      await this.databaseService.platformOptions.findFirst({
        where: {
          platformId: platform.id,
          key: 'isDevice',
        },
      });
    if (isDeviceRequired) {
      if (!client.handshake.query.deviceId) {
        client.emit('connectionError', 'Device Id Required');
        return client.disconnect();
      }
      if (!client.handshake.query.version) {
        client.emit('connectionError', 'Version Required');
        return client.disconnect();
      }
      if (client.handshake.query.version < platform.version) {
        client.emit('connectionError', 'Version Not Supported');
        return client.disconnect();
      }
      const device = await this.databaseService.userDevice.findFirst({
        where: {
          deviceId: client.handshake.query.deviceId.toString(),
          platformId: platform.id,
        },
      });
      if (!device) {
        client.emit('connectionError', 'Device Not Registered');
        return client.disconnect();
      }
      client.join(
        'user_device_' + `_platform_${platform.id}_` + device.deviceId,
      );
    }
    client.platformId = platform.id;
    client.emit('connectionSuccess', 'Connected');
  }

  disconnectSocket(client: CustomUserSocketClient) {
    if (client.practiceAttempt) {
      this.practiceService.handlePracticeAttemptDisconnect(client);
    }

    if (client.quizAttempt) {
      this.quizService.handleQuizAttemptDisconnect(client);
    }
    if (client.userId) {
      this.authService.wsLogout(client);
    }
  }

  async setCourse(userId: number, platfromId: number, courseId: number) {
    const platformHasCourse =
      await this.databaseService.platformOptions.findFirst({
        where: {
          platformId: platfromId,
          key: 'hasCourse',
        },
      });
    if (platformHasCourse) {
      const isInCourse = await this.isInCourses(courseId, userId, platfromId);
      if (!isInCourse) {
        throw new ForbiddenException('User Not Enrolled in Course');
      }
      await this.cacheManager.set(
        `watching_course_${userId}_${platfromId}`,
        courseId,
        259200000,
      );
    } else {
      throw new ForbiddenException('Platform does not have courses');
    }
    return { message: 'Course Set Successfully' };
  }

  async getEnrolledCourses(userId: number, platformId: number) {
    const platformHasCourse =
      await this.databaseService.platformOptions.findFirst({
        where: {
          platformId: platformId,
          key: 'hasCourse',
        },
      });
    if (platformHasCourse) {
      const coursesIds: number[] = await this.cacheManager.get(
        `courses_${userId}_${platformId}`,
      );
      const activeCourse = await this.cacheManager.get(
        `watching_course_${userId}_${platformId}`,
      );
      const userToCourse = await this.databaseService.userToCourse.findMany({
        where: {
          userId: userId,
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
        },
        select: {
          Course: {
            select: {
              id: true,
              name: true,
              abbr: true,
              expiry: true,
              Meta: true,
              Course: {
                select: {
                  id: true,
                  name: true,
                  abbr: true,
                  expiry: true,
                  Meta: true,
                  Course: {
                    select: {
                      id: true,
                      name: true,
                      abbr: true,
                      expiry: true,
                      Meta: true,
                      Course: {
                        select: {
                          id: true,
                          name: true,
                          abbr: true,
                          expiry: true,
                          Meta: true,
                          Course: {
                            select: {
                              id: true,
                              name: true,
                              abbr: true,
                              expiry: true,
                              Meta: true,
                              Course: {
                                select: {
                                  id: true,
                                  name: true,
                                  abbr: true,
                                  expiry: true,
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
      });
      if (!coursesIds) {
        throw new ForbiddenException('User Not Enrolled in Course');
      }
      return {
        userToCourse,
        coursesIds,
        activeCourse: activeCourse ? activeCourse : null,
      };
    } else {
      throw new ForbiddenException('Platform does not have courses');
    }
  }

  async watchCourse(client: CustomUserSocketClient, courseId: number) {
    const course = await this.databaseService.course.findFirst({
      where: {
        id: courseId,
      },
    });
    if (!course) {
      client.emit('watch-course-error', { message: 'Course Not Found' });
    }
    const canLoginByNumber =
      await this.databaseService.platformOptions.findFirst({
        where: {
          platformId: client.platformId,
          key: 'canLoginByNumber',
        },
      });
    if (!canLoginByNumber) {
      const isInCourse = this.isInCourses(
        courseId,
        client.userId,
        client.platformId,
      );
      if (!isInCourse) {
        client.emit('watch-course-error', {
          message: 'User Not Enrolled in Course',
        });
      }
    }
    await this.cacheManager.set(
      `watching_course_${client.userId}_${client.platformId}`,
      courseId,
      259200000,
    );
    client.emit('watch-course-success', { message: 'Watching Course' });
  }

  async getCourseForEnrollment(courseId: number) {
    const course = await this.databaseService.course.findFirst({
      where: {
        id: courseId,
      },
      include: {
        Options: {
          where: {
            key: 'isCourse',
          },
        },
        Course: true,
      },
    });
    if (!course) {
      return null;
    }
    if (course.Options.length > 0) {
      return course.id;
    }
    if (course.Course) {
      return await this.getCourseForEnrollment(course.Course.id);
    }
  }

  async resultAnalysis(
    userId: number,
    platformId: number,
    resultAnalysisDto: ResultAnalysisDto,
    files: Express.Multer.File[],
  ) {
    const { courseId, marks } = resultAnalysisDto;
    const user = await this.databaseService.user.findFirst({
      where: {
        id: userId,
      },
    });
    const resultForm = await this.databaseService.userForm.findFirst({
      where: {
        name: 'result-analysis',
      },
    });
    if (!resultForm) {
      throw new NotFoundException('Result Analysis Form Not Found');
    }
    if (resultAnalysisDto.enrollmentId) {
      const enrollment = await this.databaseService.courseUserMeta.findFirst({
        where: {
          userId: userId,
          courseId: courseId,
        },
      });
      if (
        enrollment &&
        enrollment.enrollmentId !== resultAnalysisDto.enrollmentId
      ) {
        throw new NotAcceptableException(
          'Enrollment ID does not match with the user',
        );
      }
      if (!enrollment) {
        const newEnrollment = await this.databaseService.courseUserMeta.create({
          data: {
            userId: userId,
            enrollmentId: resultAnalysisDto.enrollmentId,
            courseId: courseId,
            isCompleted: resultAnalysisDto.isPass,
          },
        });
      }
    }
    let subjectIds = [];
    const course = await this.databaseService.course.findFirst({
      where: {
        id: courseId,
      },
      include: {
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
    });
    if (!course) {
      throw new NotFoundException('Course Not Found');
    }
    const courseName = this.getCourseName(course);
    const courseEnrollment = await this.getCourseForEnrollment(courseId);
    if (!courseEnrollment) {
      throw new NotFoundException('Course Not Found');
    }
    const resultExists =
      await this.databaseService.courseSubjectResultToUser.findFirst({
        where: {
          userId: userId,
          courseId: courseId,
        },
      });

    if (resultExists) {
      for (let i = 0; i < marks.length; i++) {
        const prevResult =
          await this.databaseService.courseSubjectResultToUser.findFirst({
            where: {
              courseId: courseEnrollment,
              Subject: {
                name: marks[i].subject,
              },
            },
            include: {
              Subject: true,
            },
          });
        if (prevResult) {
          await this.databaseService.courseSubjectResultToUser.update({
            where: {
              id: prevResult.id,
            },
            data: {
              result: marks[i].marks,
            },
          });
        }
        // else {
        //   await this.databaseService.courseSubjectResultToUser.create({
        //     data: {
        //       userId: userId,
        //       courseId: courseEnrollment,
        //       subjectId: 4, // subjectId will be set later
        //       result: marks[i].marks,
        //     },
        //   });
        // }
      }
    } else {
      for (let i = 0; i < marks?.length; i++) {
        const subject = await this.databaseService.courseSubject.findFirst({
          where: {
            name: marks[i].subject,
            Course: {
              some: {
                courseId: course?.courseId,
              },
            },
          },
        });

        if (!subject) {
          console.log('subject not found for', marks[i].subject);
        } else {
          subjectIds.push({ subjectId: subject?.id, marks: marks[i].marks });
        }
      }

      for (let i = 0; i < subjectIds?.length; i++) {
        await this.databaseService.courseSubjectResultToUser.create({
          data: {
            userId: userId,
            courseId: course?.id,
            subjectId: subjectIds[i].subjectId,
            result: subjectIds[i].marks,
          },
        });
      }
    }
    const attachments = [];
    if (files && files.length > 0 && files[0]) {
      const resultPdf = files[0];
      const uploadedFileVultr = await this.vultrService.uploadToVultr(
        `CRM/resultAnalysis/${uuidv4()}_${course.id}.pdf`,
        resultPdf,
      );
      attachments.push({
        link: uploadedFileVultr.Location,
        type: resultPdf.mimetype,
      });
    }
    const formdata = {
      courseId: course.id,
      marks: marks,
    };
    await this.databaseService.userFormToUser.create({
      data: {
        formId: resultForm.id,
        userId: userId,
        formData: JSON.parse(JSON.stringify(formdata)),
        attachment: attachments,
      },
    });
    if (resultAnalysisDto.isPass) {
      const courseTemplate =
        await this.databaseService.courseTemplate.findFirst({
          where: {
            courseId: courseEnrollment,
            platformId: platformId,
            name: 'course-pass-mail',
          },
        });
      if (courseTemplate) {
        console.log('Sending Course Pass Mail to', user.email);
        await this.emailService.sendBrevoMail(
          user.fname + ' ' + user.lname,
          user.email,
          courseTemplate.senderEmail,
          courseTemplate.senderName,
          Number(courseTemplate.templateId),
          {
            fname: user.fname,
            course: courseName,
          },
        );
      }
    }

    this.httpService
      .post(process.env.sheetLink, {
        section: 'product',
      })
      .pipe(
        catchError((error: AxiosError) => {
          console.error('An Error Happened12', error.message);
          return []; // Handle error, optionally return an empty observable
        }),
      )
      .subscribe({
        next: (response) => response,
        error: (err) => console.error('HTTP request failed:', err),
      });

    return {
      message: 'Result Analysis Submitted Successfully',
      courseId: course,
      marks,
    };
  }
  async resultAnalysisSeed(
    platformId: number,
    resultAnalysisDto: ResultAnalysisSeedDto,
    files: Express.Multer.File[],
  ) {
    
    const { courseId, marks } = resultAnalysisDto;
    const attacmentObject = [];
    const attachment = {
      link: resultAnalysisDto.attachment,
      type: 'application/pdf',
    }
    attacmentObject.push(attachment);
    const formdata = await this.databaseService.userFormToUser.findFirst({
      where: {
        attachment: JSON.parse(JSON.stringify(attacmentObject)),
      }
    })
    const formdataToGive = {
      courseId: courseId,
      marks: marks,
    };
    if (formdata) {
      console.log('Form Data Already Exists');
      await this.databaseService.userFormToUser.update({
        where: {
          id: formdata.id,
        },
        data: {
          formData: JSON.parse(JSON.stringify(formdataToGive)),
        },
      });
    }
    return {
      message: 'Result Analysis Submitted Successfully',
      // courseId: course,
      marks,
    };
  }

  async downloadResultPdf(data: JSON) {
    const htmlTemplate = resultReportTemplate;
    const html = await this.fillResultTemplate(data, htmlTemplate);
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        left: '0px',
        top: '0px',
        right: '0px',
        bottom: '0px',
      },
    });

    const buffer: Buffer = Buffer.from(pdfUint8Array);

    await browser.close();

    return buffer;
  }

  async introspectResult(data, req) {
    const user = await this.getUser(req);
    const { questions, feedbacks } = this.getAnalysisFeedBack();
    const answers = Object.entries(data.questions);
    let feedbackContent = '';
    // for (let i = 0; i < answers.length; i++) {
    //   const ans = Number(answers[i][1]) || 20;
    //   feedbackContent += questions[i] + feedbacks[i][ans / 20 - 1] + '\n';
    // }
    let cards = [];
    for (let i = 0; i < answers.length; i++) {
      const ans = Number(answers[i][1]) || 20;
      const card = {
        card_question: questions[i],
        card_answer: `${feedbacks[i][ans / 20 - 1]?.split('\n')[0] || ''}`,
        card_feedback: feedbacks[i][ans / 20 - 1]?.split('\n')[1] + '\n',
        bg_color: i % 2 === 0 ? '#F4F4F4' : '#F9F9F9', // alternate colors for cards
      };
      cards.push(card);
    }

    const introspectHTML = await generteIntrospectHTML(user.fname, cards);

    await this.emailService.sendIntrospectAnalysisMail(
      user.fname,
      user.email,
      'noreply@aswinibajajclasses.com',
      'Team Aswini Bajaj',
      introspectHTML,
    );

    await this.databaseService.userFormToUser.create({
      data: {
        formId: data.formId,
        userId: user.id,
        formData: data.questions,
      },
    });
    this.httpService
      .post(process.env.sheetLink, {
        section: 'introspect',
        date: new Date().toISOString(),
        name: user.fname + ' ' + user.lname,
        email: user.email,
        countryCode: user.countryCode,
        mobile: user.phone,
        course: data.course,
        instituteId: '',
        syllabus_completed: data.questions.completeSyllabus,
        syllabus_practice: data.questions.practiceEnough,
        revision_timing: data.questions.adequateRevision,
        recall: data.questions.retentionProblem,
        struggle: data.questions.hjh,
      })
      .pipe(
        catchError((error: AxiosError) => {
          console.error('An Error Happened12', error.message);
          return []; // Handle error, optionally return an empty observable
        }),
      )
      .subscribe({
        next: (response) => response,
        error: (err) => console.error('HTTP request failed:', err),
      });
    return feedbackContent;
  }

  private getAnalysisFeedBack() {
    const feedbacks = [
      // 1. completeSyllabus
      [
        'A. You have completed 20% of your syllabus.\nMake sure you complete the entire syllabus. There is no choice around it.',
        'A. You have completed 40% of your syllabus.\nMake sure you complete the entire syllabus. There is no choice around it.',
        'A. You have completed 60% of your syllabus.\nMake sure you complete the entire syllabus. There is no choice around it.',
        'A. You have completed 80% of your syllabus.\nMake sure you complete the entire syllabus. There is no choice around it.',
        'A. You have completed 100% of your syllabus.\nThis is not an issue for you.',
      ],
      // 2. practiceEnough
      [
        'A. You have practiced 20% of your syllabus.\nYou may struggle to grasp the approach to the questions without adequate practice. To be in the 40% of students passing, your effort must also be in the top 40% of students.',
        'A. You have practiced 40% of your syllabus.\nYou may struggle to grasp the approach to the questions without adequate practice. To be in the 40% of students passing, your effort must also be in the top 40% of students.',
        'A. You have practiced 60% of your syllabus.\nYou may struggle to grasp the approach to the questions without adequate practice. To be in the 40% of students passing, your effort must also be in the top 40% of students.',
        'A. You have practiced 80% of your syllabus.\nThis is not an issue for you.',
        'A. You have practiced 100% of your syllabus.\nThis is not an issue for you.',
      ],
      // 3. adequateRevision
      [
        "A. You have revised 20% of your syllabus.\nYou must revise thoroughly to recall the same on exam day. Please make sure you go through the 'How to Revise' Lecture in the 'Exam Mentoring' section, which explains the process. Attend this after completing the syllabus on time and keeping 25-30 days for revision before the Exam.",
        "A. You have revised 40% of your syllabus.\nYou must revise thoroughly to recall the same on exam day. Please make sure you go through the 'How to Revise' Lecture in the 'Exam Mentoring' section, which explains the process. Attend this after completing the syllabus on time and keeping 25-30 days for revision before the Exam.",
        "A. You have revised 60% of your syllabus.\nYou must revise thoroughly to recall the same on exam day. Please make sure you go through the 'How to Revise' Lecture in the 'Exam Mentoring' section, which explains the process. Attend this after completing the syllabus on time and keeping 25-30 days for revision before the Exam.",
        'A. You have revised 80% of your syllabus.\nThis is not an issue for you.',
        'A. You have revised 100% of your syllabus.\nThis is not an issue for you.',
      ],
      // 4. retentionProblem
      [
        'A. You were able to recall 20% of what you studied during the exam.\nCheck the ‘How to Retain What You Have Studied’ Mentor note in the ‘Exam Mentoring’ section in your App.',
        'A. You were able to recall 40% of what you studied during the exam.\nCheck the ‘How to Retain What You Have Studied’ Mentor note in the ‘Exam Mentoring’ section in your App.',
        'A. You were able to recall 60% of what you studied during the exam.\nCheck the ‘How to Retain What You Have Studied’ Mentor note in the ‘Exam Mentoring’ section in your App.',
        'A. You were able to recall 80% of what you studied during the exam.\nThis is not an issue for you.',
        'A. You were able to recall 100% of what you studied during the exam.\nThis is not an issue for you.',
      ],
      // 5. timeManagementProblem
      [
        'A. You struggled to finish 20% of the exam on time.\nThis is not an issue for you.',
        'A. You struggled to finish 40% of the exam on time.\nThis is not an issue for you.',
        'A. You struggled to finish 60% of the exam on time.\nTo improve, make sure to follow the guidance provided in the ‘How to Attempt’ and ‘How to Use Exam Software’ lectures in the ‘Exam Mentoring’ section to complete the exam on time.',
        'A. You struggled to finish 80% of the exam on time.\nTo improve, make sure to follow the guidance provided in the ‘How to Attempt’ and ‘How to Use Exam Software’ lectures in the ‘Exam Mentoring’ section to complete the exam on time.',
        'A. You struggled to finish 100% of the exam on time.\nTo improve, make sure to follow the guidance provided in the ‘How to Attempt’ and ‘How to Use Exam Software’ lectures in the ‘Exam Mentoring’ section to complete the exam on time.',
      ],
      // 6. panicDuringExam
      [
        'A. You felt panicked during 20% of the exam.\nThis is not an issue for you.',
        'A. You felt panicked during 40% of the exam.\nThis is not an issue for you.',
        'A. You felt panicked during 60% of the exam.\nYou need to be comfortable and work on your emotional intelligence (EQ) while taking the exam. If your syllabus is complete, practice is done, and you have revised thoroughly, you are less likely to panic. Check the lectures added on ‘How to Manage Stress’ in the ‘Exam Mentoring’ section in your App.',
        'A. You felt panicked during 80% of the exam.\nYou need to be comfortable and work on your emotional intelligence (EQ) while taking the exam. If your syllabus is complete, practice is done, and you have revised thoroughly, you are less likely to panic. Check the lectures added on ‘How to Manage Stress’ in the ‘Exam Mentoring’ section in your App.',
        'A. You felt panicked during 100% of the exam.\nYou need to be comfortable and work on your emotional intelligence (EQ) while taking the exam. If your syllabus is complete, practice is done, and you have revised thoroughly, you are less likely to panic. Check the lectures added on ‘How to Manage Stress’ in the ‘Exam Mentoring’ section in your App.',
      ],
      // 7. sillyMistakes
      [
        'A. You made silly mistakes in 20% of the exam.\nThis is not an issue for you.',
        'A. You made silly mistakes in 40% of the exam.\nThis is not an issue for you.',
        "A. You made silly mistakes in 60% of the exam.\nThis often results from a lack of focus and concentration. Please check the note on 'Focus' in the ‘Exam Mentoring’ section in your App. Follow the methods in the 'How to Study' and 'How to Practice' lectures on making a 'Mistakes' sheet. Also, please check the 'How to improve Accuracy' Lecture.",
        "A. You made silly mistakes in 80% of the exam.\nThis often results from a lack of focus and concentration. Please check the note on 'Focus' in the ‘Exam Mentoring’ section in your App. Follow the methods in the 'How to Study' and 'How to Practice' lectures on making a 'Mistakes' sheet. Also, please check the 'How to improve Accuracy' Lecture.",
        "A. You made silly mistakes in 100% of the exam.\nThis often results from a lack of focus and concentration. Please check the note on 'Focus' in the ‘Exam Mentoring’ section in your App. Follow the methods in the 'How to Study' and 'How to Practice' lectures on making a 'Mistakes' sheet. Also, please check the 'How to improve Accuracy' Lecture.",
      ],
      // 8. trickyQuestions
      [
        'A. You found 20% of the questions challenging.\nThis is not an issue for you.',
        'A. You found 40% of the questions challenging.\nThis is not an issue for you.',
        "A. You found 60% of the questions challenging.\n If you're finding questions challenging, it's important to read more to gain comfort with financial data and concepts. Regularly read the Leveraged Growth Monthly and explore other recommended books and resources from class.",
        "A. You found 80% of the questions challenging.\n If you're finding questions challenging, it's important to read more to gain comfort with financial data and concepts. Regularly read the Leveraged Growth Monthly and explore other recommended books and resources from class.",
        "A. You found 100% of the questions challenging.\n If you're finding questions challenging, it's important to read more to gain comfort with financial data and concepts. Regularly read the Leveraged Growth Monthly and explore other recommended books and resources from class.",
      ],
      // 9. difficultyInUnderstanding
      [
        'A. You found 20% of the questions difficult to understand.\nThis is not an issue for you.',
        'A. You found 40% of the questions difficult to understand.\nThis is not an issue for you.',
        "A. You found 60% of the questions difficult to understand.\n If you're struggling to understand the questions, more reading will help you become more comfortable with financial data and concepts. Read the Leveraged Growth Monthly regularly and refer to other recommended materials provided in class.",
        "A. You found 80% of the questions difficult to understand.\n If you're struggling to understand the questions, more reading will help you become more comfortable with financial data and concepts. Read the Leveraged Growth Monthly regularly and refer to other recommended materials provided in class.",
        "A. You found 100% of the questions difficult to understand.\n If you're struggling to understand the questions, more reading will help you become more comfortable with financial data and concepts. Read the Leveraged Growth Monthly regularly and refer to other recommended materials provided in class.",
      ],
      // 10. unableToAnswer
      [
        'A. You struggled to answer 20% of the questions due to unclear understanding of the concepts.\nThis is not an issue for you.',
        'A. You struggled to answer 40% of the questions due to unclear understanding of the concepts.\nThis is not an issue for you.',
        "A. You struggled to answer 60% of the questions due to unclear understanding of the concepts.\nRevisit the lectures on the areas where you're struggling. Focus specifically on the topics where your understanding is unclear. The LOS-wise breakdown in the Lecture Guide will help you identify which areas to focus on. You don’t need to attend all lectures, just the ones that address your weak spots.",
        "A. You struggled to answer 80% of the questions due to unclear understanding of the concepts.\nRevisit the lectures on the areas where you're struggling. Focus specifically on the topics where your understanding is unclear. The LOS-wise breakdown in the Lecture Guide will help you identify which areas to focus on. You don’t need to attend all lectures, just the ones that address your weak spots.",
        "A. You struggled to answer 100% of the questions due to unclear understanding of the concepts.\nRevisit the lectures on the areas where you're struggling. Focus specifically on the topics where your understanding is unclear. The LOS-wise breakdown in the Lecture Guide will help you identify which areas to focus on. You don’t need to attend all lectures, just the ones that address your weak spots.",
      ],
      // 11. tiredDuringExam
      [
        'A. You struggled to maintain focus during 20% of the exam.\nThis is not an issue for you.',
        'A. You struggled to maintain focus during 40% of the exam.\nThis is not an issue for you.',
        'A. You struggled to maintain focus during 60% of the exam.\nTo improve, work on gradually increasing your study hours to build stamina for deep work. Try reading the book Deep Work and follow the productivity-related tips provided to you.',
        'A. You struggled to maintain focus during 80% of the exam.\nTo improve, work on gradually increasing your study hours to build stamina for deep work. Try reading the book Deep Work and follow the productivity-related tips provided to you.',
        'A. You struggled to maintain focus during 100% of the exam.\nTo improve, work on gradually increasing your study hours to build stamina for deep work. Try reading the book Deep Work and follow the productivity-related tips provided to you.',
      ],
      // 12. unableToConcentrate
      [
        'A. You struggled to concentrate during 20% of the exam due to distractions.\nThis is not an issue for you.',
        'A. You struggled to concentrate during 40% of the exam due to distractions.\nThis is not an issue for you.',
        'A. You struggled to concentrate during 60% of the exam due to distractions.\nIt’s recommended to email the institute about the challenges you faced at the exam center. However, remember that there will always be external distractions in a shared space, like typing or clicking noises. It’s essential to adapt to this environment and maintain focus despite the background noise. It’s a shared space for all students, and the level of concentration you can achieve depends on how effectively you block out these distractions.',
        'A. You struggled to concentrate during 80% of the exam due to distractions.\nIt’s recommended to email the institute about the challenges you faced at the exam center. However, remember that there will always be external distractions in a shared space, like typing or clicking noises. It’s essential to adapt to this environment and maintain focus despite the background noise. It’s a shared space for all students, and the level of concentration you can achieve depends on how effectively you block out these distractions.',
        'A. You struggled to concentrate during 100% of the exam due to distractions.\nIt’s recommended to email the institute about the challenges you faced at the exam center. However, remember that there will always be external distractions in a shared space, like typing or clicking noises. It’s essential to adapt to this environment and maintain focus despite the background noise. It’s a shared space for all students, and the level of concentration you can achieve depends on how effectively you block out these distractions.',
      ],
    ];

    const questions = [
      'Q1. How much of your syllabus did you manage to complete before the exam?\n',
      'Q2. What percentage of the syllabus did you practice thoroughly?\n',
      'Q3. How much time did you dedicate to revising the syllabus?\n',
      'Q4. How effectively were you able to recall what you studied during the exam?\n',
      'Q5. What percentage of the exam did you struggle to finish on time?\n',
      'Q6. How often did you feel panicked during the exam?\n',
      'Q7. How many silly mistakes did you make during the exam?\n',
      'Q8. What percentage of the questions did you find challenging or confusing?\n',
      'Q9. What percentage of the questions were difficult to understand?\n',
      'Q10. What percentage of the questions did you struggle to answer due to unclear concepts?\n',
      'Q11. What percentage of the exam did you struggle to focus due to low study stamina?\n',
      'Q12. What percentage of the exam did you struggle to concentrate because of distractions?\n',
    ];

    return { questions, feedbacks };
  }

  private getCfaSubjectComments() {
    const comments = {
      'Ethical and Professional Standards': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Continue maintaining your strong ethical understanding.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Strong grasp. Reinforce understanding by reviewing complex ethical scenarios.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Moderate understanding. Continue practicing ethical decision-making through case studies.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Partial understanding. Further study of ethical frameworks and application is recommended.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Needs significant improvement. Focus on revisiting core ethical principles and standards.',
        },
      ],
      'Quantitative Methods': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Keep practicing to maintain your high level of proficiency.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Strong understanding. Focus on accelerating problem-solving and applying advanced concepts.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Good understanding but needs further practice on complex models.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Needs improvement in more advanced techniques. Practice problem-solving and statistical methods.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Struggles with basic concepts. Focus on foundational topics such as probability and time value of money.',
        },
      ],
      Economics: [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Keep applying your knowledge to real-world scenarios.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Strong performance. Continue studying global economic trends and their financial implications.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Moderate understanding. Refine your knowledge of macroeconomic and microeconomic concepts.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Partial understanding. Focus on understanding key economic indicators and policies.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Major gaps in understanding core concepts. Review basic economic principles.',
        },
      ],
      'Financial Statement Analysis': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Maintain proficiency by tackling real-world financial reports.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Solid understanding. Keep refining skills in advanced financial analysis.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Moderate understanding. Continue practicing with more complex financial statements and analysis.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Partial understanding. Focus on learning and calculating key financial ratios.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Struggles with basic financial reports. Review income statements and balance sheets.',
        },
      ],
      'Corporate Issuers': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Stay updated on complex corporate strategies.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Strong grasp. Focus on advanced topics like mergers, acquisitions, and corporate governance.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Moderate understanding. Deepen your knowledge of capital structure and corporate finance.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Partial understanding. Practice evaluating corporate financial strategies.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Struggling with corporate finance basics. Focus on understanding debt-equity ratios and financing methods.',
        },
      ],
      'Equity Investments': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Keep reinforcing your knowledge with complex real-world equity cases.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Strong grasp. Continue improving your analysis with advanced valuation techniques.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Good understanding. Refine your ability to evaluate stocks and their market behavior.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Partial understanding. Practice analyzing and valuing stocks using different models.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Needs improvement in equity market fundamentals. Review basic valuation methods.',
        },
      ],
      'Fixed Income': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Continue applying your knowledge to sophisticated fixed income scenarios.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Strong grasp. Focus on advanced fixed income strategies and risk management.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Moderate understanding. Practice more complex bond strategies and portfolio management.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Partial understanding. Focus on bond yield calculations and risk factors.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Needs significant improvement in bond pricing and basic fixed income concepts.',
        },
      ],
      Derivatives: [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Stay ahead by exploring advanced derivative instruments and their applications.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Solid understanding. Continue refining knowledge of option Greeks, hedging strategies, and pricing models.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Moderate understanding. Focus on practicing more complex derivative strategies.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Needs improvement in applying derivative pricing and risk management techniques.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Struggling with basic derivative concepts. Review option, futures, and swap basics.',
        },
      ],
      'Alternative Investments': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Stay updated on emerging trends and strategies in alternative investments.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Solid performance. Focus on integrating alternative investments into diversified portfolios.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Moderate understanding. Deepen your knowledge of real estate, private equity, and commodities.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Partial understanding. Focus on evaluating the risk-return profiles of alternative investments.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Needs significant improvement in understanding alternative assets. Start with basic concepts like REITs and hedge funds.',
        },
      ],
      'Portfolio Management': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Stay updated on cutting-edge portfolio strategies and wealth management trends.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Strong grasp. Continue improving your ability to manage portfolios in complex market environments.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Good understanding. Focus on optimizing portfolios and understanding risk management techniques.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Needs improvement in applying portfolio management theories. Practice with real-world portfolio management scenarios.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Struggling with portfolio construction and asset allocation. Review risk-return concepts and diversification.',
        },
      ],
    };
    return comments;
  }

  private getFrmSubjectComments() {
    const comments = {
      'Foundations of Risk Management': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Stay updated with the latest risk management tools and techniques used in various industries.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Strong grasp. Work on applying risk management frameworks to real-world case studies and practical scenarios.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Moderate understanding. Focus on refining knowledge of risk management processes and various risk types.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Partial understanding. Strengthen your knowledge of basic risk management frameworks and principles.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Needs significant improvement. Focus on understanding core risk management concepts such as risk identification, measurement, and mitigation.',
        },
      ],
      'Quantitative Analysis': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Continue refining your skills in advanced quantitative risk management techniques.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Strong understanding. Focus on using quantitative techniques to model and manage financial risk.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Good understanding. Continue practicing and refining skills in advanced statistical methods, like Monte Carlo simulations, and their application in risk models.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Needs improvement. Focus on mastering key concepts such as regression analysis, hypothesis testing, and basic financial mathematics.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Struggles with basic concepts. Review statistical methods, probability, distributions, and time series analysis.',
        },
      ],
      'Financial Markets and Products': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Keep up-to-date with financial markets and products, especially emerging instruments and strategies.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Strong grasp. Refine your ability to evaluate complex financial products, including derivatives and structured products, and their risk implications.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Moderate understanding. Practice pricing financial products and applying them in risk management strategies.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Partial understanding. Focus on understanding the features, functions, and risks of various financial instruments.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Needs significant improvement in understanding market instruments. Review key financial products such as equity, bonds, options, and futures.',
        },
      ],
      'Valuation and Risk Models': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Stay ahead by exploring cutting-edge risk and valuation models used in the financial industry.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Strong grasp. Work on applying advanced models to assess and manage financial risk, including stress testing and scenario analysis.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Moderate understanding. Continue practicing the construction and application of risk models, including Value-at-Risk (VaR) and other risk metrics.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Needs improvement. Focus on understanding the application of valuation models to different asset classes and risk factors.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Needs significant improvement in financial modeling and valuation. Review basic asset pricing models such as CAPM, DCF, and bond pricing.',
        },
      ],
      'Market Risk Measurement and Management': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Stay updated on the latest tools and techniques for measuring and managing market risk, including non-linear models and alternative risk measures.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Strong grasp. Focus on advanced risk measurement techniques like backtesting and risk aggregation.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Moderate understanding. Continue practicing risk assessment tools for different financial products and portfolios.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Partial understanding. Focus on learning how to calculate and interpret market risk measures such as VaR, stress testing, and scenario analysis.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Needs significant improvement. Review basic concepts like market risk types, Value-at-Risk (VaR), and risk metrics.',
        },
      ],
      'Credit Risk Measurement and Management': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Stay ahead by exploring advanced credit risk techniques and methodologies used in real-world markets.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Strong grasp. Refine your ability to apply credit risk management strategies in various financial contexts, including assessing portfolio risk and counterparty risk.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Moderate understanding. Continue practicing credit risk models and how they are used in managing exposure.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Partial understanding. Focus on calculating credit risk metrics such as credit VaR and learning the implications of credit exposure.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Struggling with basic credit risk concepts. Review bond ratings, credit spreads, default risk, and credit derivatives like CDS.',
        },
      ],
      'Operational Risk and Resiliency': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Stay updated on the latest industry practices for managing operational risks and building operational resiliency in financial institutions.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Strong grasp. Focus on advanced topics like operational risk modeling, risk-based capital requirements, and resiliency strategies.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Moderate understanding. Continue practicing operational risk assessments and strategies for risk mitigation and business continuity planning.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Partial understanding. Focus on key operational risk measurement techniques, such as loss distribution models and stress testing.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Needs significant improvement in understanding operational risk. Review operational risk frameworks and common causes of operational failures.',
        },
      ],
      'Liquidity and Treasury Risk Measurement and Management': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Stay ahead with advanced liquidity management strategies and best practices in treasury risk management.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Strong grasp. Work on integrating liquidity management with overall risk management frameworks and focusing on liquidity stress testing.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Moderate understanding. Continue refining skills in assessing liquidity risk and treasury management in different market conditions.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Needs improvement. Focus on understanding liquidity measurement tools such as liquidity coverage ratios and net stable funding ratios.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Struggling with basic liquidity concepts. Review liquidity risk types, funding sources, and regulatory liquidity requirements.',
        },
      ],
      'Risk Management and Investment Management': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Stay updated on advanced strategies in portfolio management and risk-adjusted performance evaluation.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Strong grasp. Focus on refining your skills in managing investment portfolios and applying risk management techniques to achieve desired risk-return outcomes.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Moderate understanding. Continue practicing portfolio construction using quantitative methods, such as risk budgeting and optimization.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Partial understanding. Focus on portfolio management theories, asset allocation, risk-return trade-offs, and diversification strategies.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Needs significant improvement in understanding portfolio construction and asset allocation. Review core investment management concepts.',
        },
      ],
      'Current Issues in Financial Markets': [
        {
          min: 90,
          max: 100,
          comment:
            'Excellent performance. Stay at the forefront by continuously monitoring global financial developments and understanding their implications for financial markets and risk management.',
        },
        {
          min: 70,
          max: 90,
          comment:
            'Strong grasp. Focus on understanding how contemporary financial events shape risk management strategies in financial institutions.',
        },
        {
          min: 50,
          max: 70,
          comment:
            'Moderate understanding. Continue staying informed about global economic conditions, geopolitical risks, and their effect on financial markets.',
        },
        {
          min: 30,
          max: 50,
          comment:
            'Needs improvement. Focus on understanding the most recent trends and emerging issues in global financial markets, including the impact of new technologies and regulations.',
        },
        {
          min: 10,
          max: 30,
          comment:
            'Struggling to stay updated with current trends. Review major issues affecting financial markets such as regulatory changes, market dynamics, and financial crises.',
        },
      ],
    };

    return comments;
  }

  async fillResultTemplate(data, template) {
    const isFRM = data.examType && data.examType.toLowerCase() === 'frm';
    function getInitials(name) {
      return name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0].toUpperCase())
        .join('');
    }

    function getResult(score, min) {
      return score >= min ? 'Pass' : 'Did Not Pass';
    }

    const comments = isFRM
      ? this.getFrmSubjectComments()
      : this.getCfaSubjectComments();

    function getSubjectComment(subject, percentage) {
      const subjectComments = comments[subject];
      console.log(subject);

      if (!subjectComments) return 'Subject not found.';

      for (let i = 0; i < subjectComments.length; i++) {
        const { min, max, comment } = subjectComments[i];
        if (percentage >= min && percentage < max) {
          return comment;
        }
      }
      // If percentage is below 10% or above 100%
      if (percentage < 10) {
        return subjectComments[subjectComments.length - 1].comment;
      }
      if (percentage >= 100) {
        return subjectComments[0].comment;
      }
      return 'No comment available for this score.';
    }

    function percentageToDegree(percentage) {
      return percentage * 3.6 + 'deg';
    }

    const name = data.summary.name
      ? data.summary?.name?.split(' ').splice(0, 2).join(' ')
      : '';

    // Calculate average score for FRM
    let avgScore = null;
    if (isFRM && data.scores && Object.values(data.scores).length > 0) {
      const scores = Object.values(data.scores);

      // Convert strings to numbers and filter out invalid values
      const numericScores = scores
        .map((score) => Number(score)) // Convert to number
        .filter((score) => !isNaN(score)); // Remove NaN values

      if (numericScores.length > 0) {
        avgScore = (
          numericScores.reduce((a, b) => a + b, 0) / numericScores.length
        ).toFixed(2);
      }
    }
    // Build the description
    let description;
    if (isFRM) {
      if (data?.summary?.result == 'pass') {
        description = `
           Here’s a personalised, in-depth analysis of your subject-wise breakdown for ${data.summary.examDetails}, highlighting your marks on passing and key areas for success. Now, let’s continue your journey toward achieving even greater milestones!`;
      } else {
        description = `
          Here’s a personalised, in-depth analysis of your subject-wise breakdown for ${data.summary.examDetails}, highlighting areas where improvement is needed. Don’t be discouraged—use this insight to focus on your path to success and continue your journey with renewed determination!
        `;
      }
    } else {
      if (
        getResult(data.summary.score, data.summary.minimumPassingScore) ===
        'Pass'
      ) {
        description = `
          Here’s a personalised, in-depth analysis of your subject-wise breakdown for ${data.summary.examDetails}, highlighting your marks on passing and key areas for success. Now, let’s continue your journey toward achieving even greater milestones!`;
      } else {
        description = `
          Here’s a personalised, in-depth analysis of your subject-wise breakdown for ${data.summary.examDetails}, highlighting areas where improvement is needed. Don’t be discouraged—use this insight to focus on your path to success and continue your journey with renewed determination!
        `;
      }
    }

    // Build the footer and icon
    const footerText = `©2025 All rights reserved @Aswini Bajaj`;
    const icon = `<span class="detail-icon"></span>`;
    const term = data.summary.examDetails.split(' ').slice(0, 2).join(' ');

    // Handle the subjects block
    const subjectsBlockRegex = /{{#each subjects}}([\s\S]*?){{\/each}}/g;
    template = template.replace(subjectsBlockRegex, function (match, block) {
      const scoresArray = Object.entries(data.scores || {}).map(
        ([subject_name, percentage]) => ({
          subject_name,
          percentage,
        }),
      );

      return scoresArray
        .map((subject) => {
          return block
            .replace(
              /{{percentage_deg}}/g,
              percentageToDegree(subject.percentage),
            )
            .replace(/{{percentage}}/g, subject.percentage)
            .replace(/{{subject_name}}/g, subject.subject_name)
            .replace(
              /{{subject_comment}}/g,
              getSubjectComment(subject.subject_name, subject.percentage),
            );
        })
        .join('');
    });

    // Replace all other placeholders
    function formatCFAString(input) {
      const parts = input.split(' ');

      const year = parts[0];
      const month = parts[1];
      const level = parts[3];
      const examType = parts[2]; // 'Level' keyword
      const exam = parts[4]; // 'CFA'
      const examText = parts[5]; // 'Exam'

      return `${exam} ${examType} ${level} ${examText} ${month} ${year}`;
    }
    template = template
      .replace(
        /{{exam_title}}/g,
        isFRM
          ? data.summary.examDetails
          : formatCFAString(data.summary.examDetails),
      )
      .replace(/{{avatar_initial}}/g, getInitials(name))
      .replace(/{{candidate_name}}/g, name)
      .replace(/{{exam_term}}/g, term)
      .replace(/{{description}}/g, description)
      .replace(/{{footer_text}}/g, footerText)
      .replace(/{{icon}}/g, icon);

    // ID replacement: CFA or GARP
    if (isFRM) {
      template = template.replace(
        /{{cfa_institute_id}}/g,
        data.summary.garpId || 'N/A',
      );
    } else {
      template = template.replace(
        /{{cfa_institute_id}}/g,
        data.summary.cfaId || 'N/A',
      );
    }

    // Score and result replacement
    if (isFRM) {
      template = template
        .replace(/{{scoreTemplate}}/g, '')
        .replace(/{{result}}/g, data?.summary?.result || 'N/A')
        .replace(/{{studentId}}/g, 'GARP ID');
    } else {
      template = template
        .replace(/{{scoreTemplate}}/g, scoreTemplate)
        .replace(/{{score}}/g, data.summary.score)
        .replace(
          /{{result}}/g,
          getResult(data.summary.score, data.summary.minimumPassingScore),
        )
        .replace(/{{studentId}}/g, 'CFA ID');
    }

    return template;
  }
  //#endregion
}
