import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { GetCourierTrackingInfoDto } from './dto/get-courier-tracking-info.dto';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class CourierService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly httpService: HttpService,
    private readonly whatsappService: WhatsappService,
    private readonly notificationService: NotificationService,
  ) {}

  async checkSocket() {
    const device = {
      employeeId: 1,
      deviceId: 124,
      createdAt: '2025-03-21T10:10:20.626Z',
      updatedAt: '2025-03-24T10:45:56.985Z',
      isAllowed: true,
      Employee: {
        id: 1,
        fname: 'Durgesh',
        lname: 'Tiwari',
        email: 'dugesh.lg@gmail.com',
        profile:
          'https://del1.vultrobjects.com/crmaswinibajaj/CRM/profile/profileuser_88XQqoS.JPG',
      },
      isOnline: true,
    };
    this.notificationService.sendNotification(
      '/employee',
      'canViewDevice',
      'employeeToDeviceAllowedChanged',
      device,
    );
    const expirynnew = new Date();
    const platformId = 1;
    const isPurchasable = true;
    const courseQueryDto = {
      key: 'options',
    };
    return this.databaseService.course.findMany({
      where: {
        id: undefined,
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
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getTrackingUrl(paymentId: string, userId: number) {
    const courier = await this.databaseService.userCourier.findFirst({
      where: {
        Payment: {
          orderId: paymentId,
          userId: userId,
        },
      },
    });
    if (!courier) {
      throw new NotFoundException('Order Not Found!');
    }
    if (courier.shippingId) {
      return `https://track.shipway.com/t/${courier.shippingId}`;
    }
    return null;
  }

  getCourseName(course: any): string {
    if (course.Course) {
      return (
        this.getCourseName(course.Course) +
        (course.abbr !== null ? ' ' + course.abbr : '')
      );
    } else {
      return course.abbr !== null ? course.abbr : '';
    }
  }

  async pushOrderToShipway(
    orderId: string,
    extraOption: string,
    orderPrice: string,
    courseName: string,
    address: {
      fname: string;
      lname: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
    },
    product: {
      cartId: number;
    },
  ) {
    const cart = await this.databaseService.userCart.findFirst({
      where: {
        id: product.cartId,
      },
      include: {
        Course: {
          include: {
            PackageInfo: true,
            Meta: true,
            Course: {
              include: {
                PackageInfo: true,
                Meta: true,
                Course: {
                  include: {
                    PackageInfo: true,
                    Meta: true,
                    Course: {
                      include: {
                        PackageInfo: true,
                        Meta: true,
                        Course: {
                          include: {
                            PackageInfo: true,
                            Meta: true,
                            Course: {
                              include: {
                                PackageInfo: true,
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
        Product: {
          include: {
            PackageInfo: true,
            Product: {
              include: {
                PackageInfo: true,
                Product: {
                  include: {
                    PackageInfo: true,
                    Product: {
                      include: {
                        PackageInfo: true,
                        Product: true,
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
    if (cart.courseId) {
      const packageInfo = await this.getLastPackage(cart.Course);
      const packageDimension = packageInfo?.packageInfo
        ? packageInfo.packageInfo
        : undefined;
      if (packageDimension) {
        const shipway = await this.databaseService.shippingCompany.findFirst({
          where: {
            name: 'Shipway',
          },
        });
        if (shipway) {
          const payment = await this.databaseService.userPayments.findFirst({
            where: {
              orderId: orderId,
            },
          });
          await this.databaseService.userCourier.create({
            data: {
              userId: cart.userId,
              shippingCompanyId: shipway.id,
              trackingId:
                packageInfo.courseName.replace(' ', '') +
                orderId +
                (extraOption ? extraOption.charAt(0) : ''),
              paymentId: payment.id,
            },
          });
        }
        this.httpService
          .post(
            process.env.shipwayLink,
            {
              order_id:
                packageInfo.courseName.split(' ').join('') +
                orderId +
                (extraOption ? extraOption.charAt(0) : ''),
              payment_type: 'P',
              products: [
                {
                  product: `${courseName} ${extraOption}`,
                  product_code: `${courseName} ${extraOption}`,
                  price: orderPrice,
                },
              ],
              email: address.email,
              order_total: 0,
              shipping_firstname: address.fname,
              shipping_lastname: address.lname,
              shipping_address: address.address,
              shipping_city: address.city,
              shipping_phone: address.phone,
              shipping_state: address.state,
              shipping_country: address.country,
              shipping_zipcode: address.pincode,
              order_weight: packageDimension.weight,
              box_length: packageDimension.length,
              box_breadth: packageDimension.width,
              box_height: packageDimension.height,
              order_date: new Date().toISOString(),
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${process.env.shipwayKey}`,
              },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              console.error('An Error Happened2', error.message);
              return [];
            }),
          )
          .subscribe({
            next: (response) => response,
            error: (err) => console.error(err),
          });
      }
    }
    if (cart.productId) {
      const packageInfo = await this.getLastProductPackage(cart.Product);
      const packageDimension = packageInfo?.packageInfo
        ? packageInfo.packageInfo
        : undefined;
      if (packageDimension) {
        const shipway = await this.databaseService.shippingCompany.findFirst({
          where: {
            name: 'Shipway',
          },
        });
        if (shipway) {
          const payment = await this.databaseService.userPayments.findFirst({
            where: {
              orderId: orderId,
            },
          });
          await this.databaseService.userCourier.create({
            data: {
              userId: cart.userId,
              shippingCompanyId: shipway.id,
              trackingId:
                packageInfo.productName.replace(' ', '') +
                orderId +
                (extraOption ? extraOption.charAt(0) : ''),
              paymentId: payment.id,
            },
          });
        }
        this.httpService
          .post(
            process.env.shipwayLink,
            {
              order_id:
                packageInfo.productName.split(' ').join('') +
                orderId +
                (extraOption ? extraOption.charAt(0) : ''),
              payment_type: 'P',
              products: [
                {
                  product: `${courseName} ${extraOption}`,
                  product_code: `${courseName} ${extraOption}`,
                  price: orderPrice,
                },
              ],
              email: address.email,
              order_total: 0,
              shipping_firstname: address.fname,
              shipping_lastname: address.lname,
              shipping_address: address.address,
              shipping_city: address.city,
              shipping_phone: address.phone,
              shipping_state: address.state,
              shipping_country: address.country,
              shipping_zipcode: address.pincode,
              order_weight: packageDimension.weight,
              box_length: packageDimension.length,
              box_breadth: packageDimension.width,
              box_height: packageDimension.height,
              order_date: new Date().toISOString(),
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${process.env.shipwayKey}`,
              },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              console.error('An Error Happened2', error.message);
              return [];
            }),
          )
          .subscribe({
            next: (response) => response,
            error: (err) => console.error(err),
          });
      }
    }
  }

  async getTrackingInfo(
    getCourierTrackingInfo: GetCourierTrackingInfoDto,
    userId: number,
  ) {
    const couriers = await this.databaseService.userCourier.findMany({
      where: {
        Payment: {
          orderId: getCourierTrackingInfo.orderId,
          userId: userId,
        },
      },
      include: {
        Company: true,
      },
    });
    if (couriers.length === 0) {
      throw new NotFoundException('Order Not Found!');
    }
    const courierPackages = [];
    for (const courier of couriers) {
      if (courier.Company.name === 'Shipway') {
        // const trackinInfo = await lastValueFrom(this.httpService.post(''));
      }
    }
  }

  async getLastProductPackage(product: any) {
    if (product.PackageInfo?.length > 0) {
      const productName = this.getProductName(product);
      const returnObj = {
        productName: productName,
        packageInfo: product.PackageInfo[0],
      };
      return returnObj;
    } else {
      if (product.Product) {
        return this.getLastProductPackage(product.Product);
      } else {
        return null;
      }
    }
  }

  getProductName(product: any) {
    if (product.Product) {
      return (
        this.getProductName(product.Product) +
        (product.abbr !== null ? ' ' + product.abbr : '')
      );
    } else {
      return product.abbr !== null ? product.abbr : '';
    }
  }

  async getLastPackage(
    course: any,
  ): Promise<{ courseName: string; packageInfo: any }> {
    const doesCourseNotHavePackage =
      await this.databaseService.courseOption.findFirst({
        where: {
          courseId: course.id,
          key: 'noPackage',
        },
      });
    if (doesCourseNotHavePackage) {
      return null;
    }
    if (course.PackageInfo?.length > 0) {
      const courseName = this.getCourseName(course);
      const returnObj = {
        courseName: courseName,
        packageInfo: course.PackageInfo[0],
      };
      return returnObj;
    } else {
      if (course.Course) {
        return this.getLastPackage(course.Course);
      } else {
        return null;
      }
    }
  }

  async checkManifest() {
    const dateIST = new Date('2025-03-13T00:00:00+05:30');
    const couriers = await this.databaseService.userCourier.findMany({
      where: {
        shippingId: null,
        createdAt: {
          gte: dateIST,
        },
      },
      include: {
        User: {
          include: {
            Meta: true,
            Billing: true,
          },
        },
      },
    });
    for (const courier of couriers) {
      const check = await lastValueFrom(
        this.httpService
          .get(`${process.env.shipwayGetLink}?orderid=${courier.trackingId}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${process.env.shipwayKey}`,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              throw 'An Error Happened5' + error.message;
            }),
          ),
      );
      if (
        check.data?.message[0]?.shipment_status !== 'DEL' &&
        check.data?.message[0]?.tracking_number
      ) {
        const shippingTemplate =
          await this.databaseService.platformTemplate.findFirst({
            where: {
              platformId: 1,
              name: 'ShipwayTrackingDetails',
            },
          });
        if (shippingTemplate) {
          const whatsappNumber = courier.User?.Meta?.whatsappNumber
            ? (courier.User?.Meta.whatsappCountryCode ??
                courier.User?.countryCode) + courier.User?.Meta.whatsappNumber
            : courier.User?.countryCode + courier.User?.phone;
          await this.whatsappService.sendWhatsappMessage(
            whatsappNumber,
            courier.User.fname + ' ' + courier.User.lname,
            shippingTemplate.templateId,
            [courier.User.fname, check.data?.message[0]?.tracking_number],
            null,
            'https://del1.vultrobjects.com/crmaswinibajaj/CRM/Platform/Poster%20Shipping.png',
            'sample_media',
          );
          const formattedDate = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).format(new Date());
          this.httpService
            .post(process.env.sheetLink, {
              section: 'shipping',
              date: formattedDate,
              fname: courier.User.fname,
              lname: courier.User.lname,
              email: courier.User.email,
              shippingOrderId: courier.trackingId,
              phone: courier.User.phone,
              countryCode: courier.User.countryCode,
              address: courier.User.Billing[0].address,
              city: courier.User.Billing[0].city,
              state: courier.User.Billing[0].state,
              country: courier.User.Billing[0].country,
              pincode: courier.User.Billing[0].pincode,
              tracking:
                'https://track.shipway.com/t/' +
                check.data?.message[0]?.tracking_number,
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
        }
      }
      await this.databaseService.userCourier.update({
        where: {
          id: courier.id,
        },
        data: {
          shippingId: check.data?.message[0]?.tracking_number,
        },
      });
    }
  }
}
