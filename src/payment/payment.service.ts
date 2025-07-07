import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { EmailsService } from 'src/email/email.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { InjectRazorpay } from 'nestjs-razorpay';
import Razorpay from 'razorpay';
import { CourierService } from 'src/courier/courier.service';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError } from 'rxjs';
import { ConfirmPaymentDto } from 'src/user/dto/confirm-payment.dto';
import { VultrService } from 'src/vultr/vultr.service';
import { LeadService } from 'src/lead/lead.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly databaseService: DatabaseService,
    @InjectRazorpay() private readonly razorPayClient: Razorpay,
    private readonly emailService: EmailsService,
    private readonly whatsappService: WhatsappService,
    private readonly courierService: CourierService,
    private readonly httpService: HttpService,
    private readonly vultrService: VultrService,
    private readonly leadService: LeadService,
  ) {}

  async enroll(
    enrollDto: { courseId: number },
    userId: number,
    platformId: number,
  ) {
    const course = await this.databaseService.course.findFirst({
      where: {
        id: enrollDto.courseId,
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
    });
    if (!course) {
      throw new NotFoundException('Course Not Found');
    }
    const purchasableCourse = await this.findClosestPurchasableCourse(
      enrollDto.courseId,
    );

    const enrollingCourse = await this.databaseService.course.findFirst({
      where: {
        id: purchasableCourse.id,
      },
      include: {
        Meta: true,
        Courses: {
          include: {
            Courses: {
              include: {
                Meta: true,
                Courses: {
                  include: {
                    Meta: true,
                    Courses: {
                      include: {
                        Meta: true,
                        Courses: {
                          include: {
                            Meta: true,
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
    });
    if (
      enrollingCourse.Meta[0].price === null &&
      enrollingCourse.Meta[0].purchasable
    ) {
      const userToCourse = await this.databaseService.userToCourse.findFirst({
        where: {
          userId: userId,
          courseId: enrollDto.courseId,
        },
      });
      if (!userToCourse) {
        const courseIds = this.collectChildCourseIds(enrollingCourse);

        let isSession = await this.databaseService.userToCourse.findFirst({
          where: {
            userId: userId,
            courseId: {
              in: courseIds,
            },
          },
        });
        if (isSession) {
          isSession = await this.databaseService.userToCourse.update({
            where: {
              userId_courseId: {
                userId: userId,
                courseId: isSession.courseId,
              },
            },
            data: {
              courseId: enrollDto.courseId,
            },
          });
        } else {
          isSession = await this.databaseService.userToCourse.create({
            data: {
              userId: userId,
              courseId: enrollDto.courseId,
            },
          });
        }
      }
      return { message: 'Enrolled Successfully' };
    } else {
      throw new BadRequestException(
        'Invalid Course Purchase Request. Please check the course details or contact support.',
      );
    }
  }

  collectChildCourseIds(courseNode): number[] {
    let ids: number[] = [];
    if (!courseNode) return ids;
    if (courseNode.id) {
      ids.push(courseNode.id);
    }
    if (courseNode.Courses && Array.isArray(courseNode.Courses)) {
      for (const c of courseNode.Courses) {
        if (c.Course) {
          ids = ids.concat(this.collectChildCourseIds(c.Course));
        }
      }
    }
    return ids;
  }

  async getCombinationId(courseId: number): Promise<any> {
    const course = await this.databaseService.course.findFirst({
      where: { id: courseId },
      include: {
        Course: true,
        SolutionCombination: true,
      },
    });
    if (course?.SolutionCombination?.length) {
      return course.SolutionCombination[0].combination;
    }
    if (course?.Course) {
      return this.getCombinationId(course.Course.id);
    }
    return null;
  }

  async sendToSolution(
    courseId: number,
    userId: number,
    softwareId: string,
    device: string,
    orderId: string,
  ) {
    const combination = await this.getCombinationId(courseId);
    if (combination) {
      const course = await this.databaseService.course.findFirst({
        where: { id: courseId },
      });
      const user = await this.databaseService.user.findFirst({
        where: { id: userId },
      });

      let courseExpiry: Date;

      if (course.expiry === null) {
        const expiryOption = await this.databaseService.courseOption.findFirst({
          where: {
            courseId: course.id,
            key: 'Expiry',
          },
        });

        // If expiryOption exists, add the specified days to today's date
        if (expiryOption) {
          const expiryDays = parseInt(expiryOption.valueText, 10); // Convert expiry value to an integer
          courseExpiry = new Date();
          courseExpiry.setDate(courseExpiry.getDate() + expiryDays); // Add expiryDays to today
        } else {
          courseExpiry = new Date(); // Default to today's date if expiry not found
        }
      } else {
        courseExpiry = course.expiry;
      }
      const deviceType = device === 'MacOs' ? 'osx' : device;
      const formattedDate = courseExpiry.toISOString().split('T')[0];

      const responseData = {
        UserName: 'AswiniBajaj',
        SecretKey:
          'iOeyH4Q29f01wjAHyRgzkwUn3b0YGyFxzpOGGTxV4wXUISAK89d4XHFoiDyu18V5FESQZnr+rU6L2urMY5RsUA==',
        Audience: 'https://growthcommand.aswinibajaj.com',
        ParamData: {
          StuName: user.fname + ' ' + user.lname,
          StuEmail: user.email,
          StuMobile: softwareId,
          RefNo: orderId,
          Combi: combination,
          Addr: '',
          City: '',
          State: '',
          Country: '',
          Pin: '',
          NoofViews: 7,
          Days: 0,
          ExDate: formattedDate,
          deviceType: deviceType,
          StudentPassword: user.password,
        },
      };
      this.httpService
        .post(process.env.webportal, responseData)
        .pipe(
          catchError((error: AxiosError) => {
            console.error('An Error Happened1112', error, responseData);
            return [];
          }),
        )
        .subscribe({
          next: (response) => console.log(response, responseData),
          error: (err) => console.error(err),
        });

      // this.httpService
      //   .get(
      //     process.env.webportalGet +
      //       `?StuName=${user.fname} ${user.lname}&StuEmail=${user.email}&StuMobile=${softwareId}&RefNo=${orderId}&Combi=${combination}&Addr=&City=&State=&Country=&Pin=&NoofViews=7&Days=0&ExDate=${formattedDate}&deviceType=${deviceType}&StudentPassword=${user.password}`,
      //   )
      //   .pipe(
      //     catchError((error: AxiosError) => {
      //       console.log('Error in Payment');
      //       console.error('An Error Happened1112', error, responseData);
      //       return [];
      //     }),
      //   )
      //   .subscribe({
      //     next: (response) => console.log(response, responseData),
      //     error: (err) => console.error(err),
      //   });
    }
  }

  async confirmRazorpayPayment(gatewayOrderId: string, userId?: number) {
    let payment = await this.databaseService.userPayments.findFirst({
      where: {
        gatewayOrderId: gatewayOrderId,
      },
      include: {
        Gatway: true,
      },
    });
    console.log(payment);
    const carts = await this.databaseService.userCart.findMany({
      where: {
        paymentId: payment.id,
        userId: payment.userId,
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
            Product: {
              include: {
                Product: {
                  include: {
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

    let subtotal = 0;
    let tablerow;
    let coursenames: string;
    let isMoreThanOneCourse = false;
    const user = await this.databaseService.user.findFirst({
      where: {
        id: payment.userId,
      },
      include: {
        Meta: true,
        Billing: {
          include: {
            Company: true,
          },
        },
        Shipping: true,
      },
    });
    const sheetProducts = [];
    const sheetObjects = [];
    for (const cart in carts) {
      if (carts[cart].courseId !== null) {
        const sheetobject = {
          cartid: carts[cart].id,
          course: '',
          session: '',
          device: '',
          pendrive: 0,
          subtotal: 0,
          courseid: carts[cart].courseId,
        };
        const course = await this.findClosestPurchasableCourse(
          carts[cart].courseId,
        );
        let thisCartPrice = Number(course.Meta[0].price);
        const coursename = this.getCourseName(carts[cart].Course);
        sheetobject.course = coursename;
        sheetobject.subtotal = thisCartPrice;
        subtotal = subtotal + thisCartPrice;
        tablerow =
          tablerow +
          `<tr>
          <td><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;"><img src="${course?.Meta[0]?.courseLogo}" alt="CFA" style="width: 70px;"></span></td>
          <td><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
                      <strong>${coursename}</strong><br>`;

        const sessionandpathway = this.getSessionName(carts[cart].Course);
        sheetobject.session = sessionandpathway;
        if (sessionandpathway !== '') {
          tablerow = tablerow + `Session : ${sessionandpathway}<br>`;
        }
        for (const extraoption of carts[cart].ExtraOptions) {
          if (extraoption.ExtraOption.price !== null) {
            thisCartPrice =
              thisCartPrice + Number(extraoption.ExtraOption.price);
          }
          if (
            extraoption.ExtraOption.name === 'Windows' ||
            extraoption.ExtraOption.name === 'Android' ||
            extraoption.ExtraOption.name === 'iOS' ||
            extraoption.ExtraOption.name === 'MacOs'
          ) {
            sheetobject.device = extraoption.ExtraOption.name;
            tablerow =
              tablerow +
              `</span><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">Device : ${extraoption.ExtraOption.name}<br>`;
          }
          if (extraoption.ExtraOption.name === 'Include Pendrive') {
            sheetobject.pendrive = Number(extraoption.ExtraOption.price);
            tablerow = tablerow + `<br> Pendrive : Included`;
          }
          tablerow =
            tablerow +
            `</span><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
                    </span>`;
        }
        tablerow = tablerow + `</td>`;
        tablerow =
          tablerow +
          `<td class="price"><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;"> ₹ ${thisCartPrice}</span></td></tr>`;
        if (!isMoreThanOneCourse) {
          coursenames = coursename;
          isMoreThanOneCourse = true;
        } else {
          coursenames = coursenames + ' , ' + coursename;
        }
        sheetObjects.push(sheetobject);
      }
      if (carts[cart].productId !== null) {
        const sheetProduct = {
          cartid: carts[cart].id,
          product: '',
          quantity: 0,
          price: 0,
          productId: carts[cart].productId,
        };

        const product = await this.databaseService.product.findFirst({
          where: {
            id: carts[cart].productId,
            Meta: {
              some: {
                purchasable: true,
              },
            },
          },
          include: {
            Meta: true,
            Product: {
              include: {
                Product: {
                  include: {
                    Product: {
                      include: {
                        Product: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
        sheetProduct.product = this.getProductName(product);
        sheetProduct.quantity = carts[cart].quantity;
        sheetProduct.price = Number(product.Meta[0].price);
        sheetProducts.push(sheetProduct);
        tablerow =
          tablerow +
          `<tr>
					<td><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;"><img
								src="${product.Meta[0].productLogo}" alt="${product.name}"></span></td>
					<td><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
							<strong>${product.name}</strong><br>
						</span><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">Quantity:
							${carts[cart].quantity}</span><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
						</span></td>
					<td class="price"><span
							style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">${Number(product.Meta[0].price) * carts[cart].quantity}</span></td>
				</tr>`;
      }
    }
    let paymentForSheet = '';
    if (payment.Gatway.name.toLowerCase() === 'razorpay') {
      let paymentId: string;
      const orderData = await this.razorPayClient.orders.fetch(
        payment.gatewayOrderId,
      );
      if (orderData.amount_due === 0) {
        const payments = await this.razorPayClient.orders.fetchPayments(
          payment.gatewayOrderId,
        );
        for (const pay in payments.items) {
          paymentId = payments.items[pay].id;
          if (payments.items[pay].status === 'captured') {
            if (payments.items[pay].method === 'card') {
              paymentForSheet = payments.items[pay].card.type + ' Card';
            }
            if (payments.items[pay].method === 'upi') {
              paymentForSheet = 'UPI';
            }
            if (payments.items[pay].method === 'netbanking') {
              paymentForSheet = 'NetBanking';
            }
          }
        }
        payment = await this.databaseService.userPayments.update({
          where: {
            id: payment.id,
          },
          data: {
            status: 'success',
          },
          include: {
            Gatway: true,
          },
        });
        await this.databaseService.userCart.updateMany({
          where: {
            paymentId: payment.id,
          },
          data: {
            status: 'paid',
          },
        });
        const whatsappNumber = user?.Meta?.whatsappNumber
          ? (user.Meta.whatsappCountryCode ?? user.countryCode) +
            user.Meta.whatsappNumber
          : user.countryCode + user.phone;
        // const invoice = await this.databaseService.userInvoice.create({
        //   data: {
        //     gatewayId: payment.gatewayId,
        //     userId: userId,
        //     paymentId: payment.id,
        //     transactionId: paymentId,
        //     orderId: payment.orderId,
        //     paymentMode: payment.Gatway.mode,
        //   },
        // });
        for (const productObject of sheetProducts) {
          if (process.env.NODE_ENV !== 'development') {
            if (user.Billing[0]?.country === 'India') {
              this.courierService.pushOrderToShipway(
                payment.orderId, // orderId
                '',
                productObject.price.toString(),
                productObject.product,
                {
                  fname: user.Billing[0]?.fname || user.fname,
                  lname: user.Billing[0]?.lname || user.lname,
                  email: user.Billing[0]?.email || user.email,
                  phone: user.Billing[0]?.phone || user.phone,
                  address: user.Billing[0]?.address || 'Address not provided',
                  city: user.Billing[0]?.city || 'City not provided',
                  state: user.Billing[0]?.state || 'State not provided',
                  country: user.Billing[0]?.country || 'Country not provided',
                  pincode: user.Billing[0]?.pincode || '000000',
                },
                {
                  cartId: productObject.cartid,
                },
              );
            }
            const formattedDate = new Intl.DateTimeFormat('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(new Date());
            const usercreatedAt = new Intl.DateTimeFormat('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(new Date(user.createdAt));
            this.httpService
              .post(process.env.sheetLink, {
                section: 'product',
                date: formattedDate,
                accountCreateDate: usercreatedAt,
                enrollmentId: payment.orderId,
                phone: user.phone,
                countryCode: user.countryCode,
                fname: user.fname,
                email: user.email,
                lname: user.lname,
                whatsappCountryCode: user.Meta?.whatsappCountryCode,
                whatsappNumber: user.Meta?.whatsappNumber,
                product: productObject.product,
                quantity: productObject.quantity,
                shippingFirstName: user.Billing[0]?.fname,
                shippingLastName: user.Billing[0]?.lname,
                shippingEmail: user.Billing[0]?.email,
                shippingCountryCode: user.Billing[0]?.countryCode,
                shippingPhone: user.Billing[0]?.phone,
                shippingAddress: user.Billing[0]?.address,
                shippingCity: user.Billing[0]?.city,
                shippingState: user.Billing[0]?.state,
                shippingCountry: user.Billing[0]?.country,
                shippingPincode: user.Billing[0]?.pincode,
                billingFirstName: user.Shipping[0]?.fname,
                billingLastName: user.Shipping[0]?.lname,
                billingEmail: user.Shipping[0]?.email,
                billingCountryCode: user.Shipping[0]?.countryCode,
                billingPhone: user.Shipping[0]?.phone,
                billingStreetAddress: user.Shipping[0]?.address,
                billingCity: user.Shipping[0]?.city,
                billingState: user.Shipping[0]?.state,
                billingCountry: user.Shipping[0]?.country,
                billingPincode: user.Shipping[0]?.pincode,
                unitcharge: productObject.price,
                totalAmount: productObject.price * productObject.quantity,
                shippingCharges: 0,
                paymentType: payment.Gatway.mode,
                paymentMode: paymentForSheet,
                paymentStatus: payment.status,
                gatewayType: payment.Gatway.name,
                businessName: user.Billing[0]?.Company[0]?.name,
                gstNumber: user.Billing[0]?.Company[0]?.gstNo,
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
        for (const sheetObject of sheetObjects) {
          let sheetDeliveryCharge = 0;
          let sheetReductionCharge = 0;
          const cartJson: any = payment.cartId;
          for (const cart in cartJson) {
            if (cartJson[cart].cartId === sheetObject.cartid) {
              if (cartJson[cart].deliveryCharge) {
                sheetDeliveryCharge = cartJson[cart].deliveryCharge;
              }
              if (cartJson[cart].reductionCharge) {
                sheetReductionCharge = cartJson[cart].reductionCharge;
              }
            }
          }
          if (process.env.NODE_ENV !== 'development') {
            if (user.Billing[0]?.country === 'India') {
              this.courierService.pushOrderToShipway(
                payment.orderId, // orderId
                sheetObject.pendrive !== 0 ? 'Pendrive' : '',
                (sheetObject.subtotal + sheetObject.pendrive).toString(),
                sheetObject.course,
                {
                  fname: user.Billing[0]?.fname || user.fname,
                  lname: user.Billing[0]?.lname || user.lname,
                  email: user.Billing[0]?.email || user.email,
                  phone: user.Billing[0]?.phone || user.phone,
                  address: user.Billing[0]?.address || 'Address not provided',
                  city: user.Billing[0]?.city || 'City not provided',
                  state: user.Billing[0]?.state || 'State not provided',
                  country: user.Billing[0]?.country || 'Country not provided',
                  pincode: user.Billing[0]?.pincode || '000000',
                },
                {
                  cartId: sheetObject.cartid,
                },
              );
            }
            const formattedDate = new Intl.DateTimeFormat('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(new Date());
            const usercreatedAt = new Intl.DateTimeFormat('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(new Date(user.createdAt));

            this.httpService
              .post(process.env.sheetLink, {
                section: 'enrollment',
                date: formattedDate,
                accountCreateDate: usercreatedAt,
                enrollmentId: payment.orderId,
                phone: user.phone,
                countryCode: user.countryCode,
                fname: user.fname,
                email: user.email,
                lname: user.lname,
                whatsappCountryCode: user.Meta.whatsappCountryCode,
                whatsappNumber: user.Meta.whatsappNumber,
                course: sheetObject.course,
                session: sheetObject.session,
                device: sheetObject.device,
                pendrive: sheetObject.pendrive !== 0,
                pendrivePrice: sheetObject.pendrive,
                shippingFirstName: user.Billing[0]?.fname,
                shippingLastName: user.Billing[0]?.lname,
                shippingEmail: user.Billing[0]?.email,
                shippingCountryCode: user.Billing[0]?.countryCode,
                shippingPhone: user.Billing[0]?.phone,
                shippingAddress: user.Billing[0]?.address,
                shippingCity: user.Billing[0]?.city,
                shippingState: user.Billing[0]?.state,
                shippingCountry: user.Billing[0]?.country,
                shippingPincode: user.Billing[0]?.pincode,
                billingFirstName: user.Shipping[0]?.fname,
                billingLastName: user.Shipping[0]?.lname,
                billingEmail: user.Shipping[0]?.email,
                billingCountryCode: user.Shipping[0]?.countryCode,
                billingPhone: user.Shipping[0]?.phone,
                billingStreetAddress: user.Shipping[0]?.address,
                billingCity: user.Shipping[0]?.city,
                billingState: user.Shipping[0]?.state,
                billingCountry: user.Shipping[0]?.country,
                billingPincode: user.Shipping[0]?.pincode,
                subtotalAmount: sheetObject.subtotal,
                shippingCharges: sheetDeliveryCharge,
                materialCharges: sheetReductionCharge,
                totalAmount:
                  sheetObject.subtotal +
                  sheetObject.pendrive +
                  sheetDeliveryCharge -
                  sheetReductionCharge,
                paymentType: payment.Gatway.mode,
                paymentMode: paymentForSheet,
                paymentStatus: payment.status,
                gatewayType: payment.Gatway.name,
                gstNumber: user.Billing[0]?.Company[0]?.gstNo,
              })
              .pipe(
                catchError((error: AxiosError) => {
                  console.error('An Error Happened3', error.message);
                  return []; // Handle error, optionally return an empty observable
                }),
              )
              .subscribe({
                next: (response) => response,
                error: (err) => console.error('HTTP request failed:', err),
              });
            const combined = user.countryCode + user.phone;
            const softwareId = combined.slice(-10);
            this.httpService
              .post(process.env.sheetLink, {
                section: 'software',
                date: formattedDate,
                fullName: user.fname + ' ' + user.lname,
                email: user.email,
                phone: user.phone,
                countryCode: user.countryCode,
                course: sheetObject.course,
                session: sheetObject.session,
                device: sheetObject.device,
                softwareId: softwareId.padStart(10, '0'),
              })
              .pipe(
                catchError((error: AxiosError) => {
                  console.error('An Error Happened4', error.message);
                  return []; // Handle error, optionally return an empty observable
                }),
              )
              .subscribe({
                next: (response) => response,
                error: (err) => console.error('HTTP request failed:', err),
              });
            await this.sendToSolution(
              sheetObject.courseid,
              user.id,
              softwareId.padStart(10, '0'),
              sheetObject.device,
              payment.orderId,
            );
            const usertocourse =
              await this.databaseService.userToCourse.findFirst({
                where: {
                  userId: user.id,
                  courseId: sheetObject.courseid,
                },
              });
            if (!usertocourse) {
              await this.databaseService.userToCourse.create({
                data: {
                  userId: user.id,
                  courseId: sheetObject.courseid,
                },
              });
            }
            let shippingCharge: number = 0;
            let reductionCharge: number = 0;
            let reductionChargeHTML = '';
            const cartJson: any = payment.cartId;
            for (const cart in cartJson) {
              if (cartJson[cart].deliveryCharge) {
                shippingCharge = cartJson[cart].deliveryCharge + shippingCharge;
              }
              if (cartJson[cart].reductionCharge) {
                reductionCharge =
                  cartJson[cart].reductionCharge + reductionCharge;
              }
            }
            const emailCampaign =
              await this.databaseService.platformTemplate.findFirst({
                where: {
                  name: 'Email Payment Confirm',
                  platformId: payment.platformId,
                },
              });
            if (reductionCharge !== 0) {
              reductionChargeHTML = `<tr>
              <td class="label"><span
                  style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">Material Charges : </span></td>
              <td class="amount"><span
                  style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;"> - ₹ ${reductionCharge}</span></td>
            </tr>`;
            }
            if (emailCampaign) {
              const formattedDate = new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }).format(new Date(payment.updatedAt));
              const mailData = {
                orderId: payment.orderId,
                userFirstName: user.fname,
                orderDate: formattedDate,
                productTable: tablerow,
                shippingCharges: shippingCharge,
                totalAmount: payment.amount,
                subtotal: subtotal,
                studentFullName: user.fname + ' ' + user.lname,
                studentEmail: user.email,
                studentPhone: user.phone,
                shippingName:
                  user?.Billing[0]?.fname + ' ' + user.Billing[0]?.lname,
                shippingEmail: user?.Billing[0]?.email,
                shippingPhone:
                  user?.Billing[0]?.countryCode + ' ' + user?.Billing[0]?.phone,
                shippingAddress: user?.Billing[0]?.address,
                shippingCity: user?.Billing[0]?.city,
                shippingState: user?.Billing[0]?.state,
                shippingCountry: user?.Billing[0]?.country,
                shippingPincode: user?.Billing[0]?.pincode,
                reductionCharge: reductionChargeHTML,
              };
              this.emailService.sendEnrollmentConfirmationEmail(
                user.fname,
                user.email,
                emailCampaign.senderEmail,
                emailCampaign.senderName,
                mailData,
                emailCampaign.templateId,
              );
            }
            const whatsappCampaign =
              await this.databaseService.platformTemplate.findFirst({
                where: {
                  platformId: payment.platformId,
                  name: 'Whatsapp Payment Done',
                },
              });
            if (whatsappCampaign) {
              this.whatsappService.sendWhatsappMessage(
                whatsappNumber,
                user.fname,
                whatsappCampaign.templateId,
                [user.fname, coursenames, payment.orderId],
              );
            }
          }
        }
      }
    }
    if (userId) {
      return { message: 'Payment Success', cart: carts, payment };
    }
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

  async orderCancel(userid: number, id: string) {
    const payment = await this.databaseService.userPayments.findFirst({
      where: {
        orderId: id,
        userId: userid,
        status: 'pending',
      },
    });
    if (!payment) {
      throw new NotFoundException('No Pending Payment Found');
    }
    await this.databaseService.userPayments.update({
      where: {
        id: payment.id,
      },
      data: {
        status: 'cancelled',
      },
    });
    return { message: 'Payment Cancelled Successfully' };
  }

  async confirmPayment(
    userId: number,
    platformId: number,
    confirmPaymentDto: ConfirmPaymentDto,
    uploadedreceipt?: Express.Multer.File[],
  ) {
    let payment = await this.databaseService.userPayments.findFirst({
      where: {
        orderId: confirmPaymentDto.orderId,
        OR: [
          {
            userId: userId,
          },
          {
            userFor: userId,
          },
        ],
      },
      include: {
        Gatway: true,
      },
    });
    if (!payment) {
      return { message: 'Payment not found' };
    }
    if (payment.status === 'success') {
      const carts = await this.databaseService.userCart.findMany({
        where: {
          paymentId: payment.id,
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
      this.leadService.donePayment(platformId, payment.id);
      return { message: 'Payment Success', cart: carts, payment };
    }
    if (payment.Gatway.name.toLowerCase() === 'razorpay') {
      return this.confirmRazorpayPayment(payment.gatewayOrderId, userId);
    }
    if (payment.Gatway.name.toLowerCase() === 'manual') {
      const carts = await this.databaseService.userCart.findMany({
        where: {
          paymentId: payment.id,
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
      if (payment.status === 'awaited') {
        return { message: 'Payment Awaiting Review', payment, cart: carts };
      }
      const sheetProducts = [];
      const sheetObjects = [];
      for (const cart of carts) {
        if (cart.courseId) {
          const sheetobject = {
            cartid: cart.id,
            course: '',
            session: '',
            device: '',
            pendrive: 0,
            subtotal: 0,
            courseid: cart.courseId,
            productId: null,
          };
          const course = await this.findClosestPurchasableCourse(cart.courseId);
          let thisCartPrice = Number(course.Meta[0].price);
          const coursename = this.getCourseName(cart.Course);
          sheetobject.course = coursename;
          sheetobject.subtotal = thisCartPrice;
          const sessionandpathway = this.getSessionName(cart.Course);
          sheetobject.session = sessionandpathway;
          for (const extraoption of cart.ExtraOptions) {
            if (extraoption.ExtraOption.price !== null) {
              thisCartPrice =
                thisCartPrice + Number(extraoption.ExtraOption.price);
            }
            if (
              extraoption.ExtraOption.name === 'Windows' ||
              extraoption.ExtraOption.name === 'Android' ||
              extraoption.ExtraOption.name === 'iOS' ||
              extraoption.ExtraOption.name === 'MacOs'
            ) {
              sheetobject.device = extraoption.ExtraOption.name;
            }
            if (extraoption.ExtraOption.name === 'Include Pendrive') {
              sheetobject.pendrive = Number(extraoption.ExtraOption.price);
            }
          }
          sheetObjects.push(sheetobject);
        }
        if (cart.productId) {
          const sheetProduct = {
            cartid: cart.id,
            product: '',
            quantity: 0,
            price: 0,
            productId: cart.productId,
          };
          const product = await this.databaseService.product.findFirst({
            where: {
              id: cart.productId,
              Meta: {
                some: {
                  purchasable: true,
                },
              },
            },
            include: {
              Meta: true,
              Product: {
                include: {
                  Product: {
                    include: {
                      Product: {
                        include: {
                          Product: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
          sheetProduct.product = this.getProductName(product);
          sheetProduct.quantity = cart.quantity;
          sheetProduct.price = Number(product.Meta[0].price);
          sheetProducts.push(sheetProduct);
        }
      }
      if (payment.status === 'pending') {
        if (!uploadedreceipt || uploadedreceipt.length === 0) {
          throw new BadRequestException({
            message: 'Receipt not found!',
            cart: carts,
            payment,
          });
        }
        if (!confirmPaymentDto.method) {
          throw new BadRequestException({
            message: 'Method Not Defined!',
            cart: carts,
            payment,
          });
        }
        const gatwayOrderId =
          confirmPaymentDto.method + ': ' + confirmPaymentDto.transactionId;
        const receipts = [];
        const allowedMimeType = ['image/png', 'image/jpeg', 'application/pdf'];
        for (const uploadedFile of uploadedreceipt) {
          const isFileAllowed = allowedMimeType.includes(uploadedFile.mimetype);
          if (!isFileAllowed) {
            throw new BadRequestException({
              message: 'Invalid File Type Provided!',
              cart: carts,
              payment,
            });
          }
        }
        await this.databaseService.userPayments.update({
          where: {
            id: payment.id,
          },
          data: {
            gatewayOrderId: gatwayOrderId,
          },
        });
        for (const uploadFile in uploadedreceipt) {
          const fileExtension = uploadedreceipt[
            uploadFile
          ].originalname.includes('.')
            ? uploadedreceipt[uploadFile].originalname.split('.').pop()
            : '';
          if (!fileExtension) {
            throw new BadRequestException(
              'Invalid file name or missing extension',
            );
          }
          const filename =
            'CRM/uploadedreceipt/' +
            payment.orderId +
            '_' +
            uploadFile +
            '.' +
            fileExtension;
          const uploadedFileVultr = await this.vultrService.uploadToVultr(
            filename,
            uploadedreceipt[uploadFile],
          );
          const uploadedReceiptObject = {
            link: uploadedFileVultr.Location,
            type: fileExtension,
          };
          receipts.push(uploadedReceiptObject);
        }
        payment = await this.databaseService.userPayments.update({
          where: {
            id: payment.id,
          },
          data: {
            status: 'awaited',
            reciept: receipts,
            gatewayOrderId:
              confirmPaymentDto.method + ': ' + confirmPaymentDto.transactionId,
          },
          include: {
            Gatway: true,
          },
        });
        const user = await this.databaseService.user.findFirst({
          where: {
            id: userId,
          },
          include: {
            Meta: true,
            Billing: {
              include: {
                Company: true,
              },
            },
            Shipping: true,
          },
        });
        for (const productObject of sheetProducts) {
          if (process.env.NODE_ENV !== 'development') {
            const formattedDate = new Intl.DateTimeFormat('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(new Date());
            const usercreatedAt = new Intl.DateTimeFormat('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(new Date(user.createdAt));
            this.httpService
              .post(process.env.sheetLink, {
                section: 'manual',
                date: formattedDate,
                orderId: payment.orderId,
                fname: user.fname,
                lname: user.lname,
                student_transaction: payment.gatewayOrderId,
                course: productObject.product,
                quantity: productObject.quantity,
                state: user.Shipping[0]?.state
                  ? user.Shipping[0]?.state
                  : user.Billing[0]?.state,
                amount: productObject.price * productObject.quantity,
                attachmentLink: receipts
                  .map((receipt) => receipt.link)
                  .join(', '),
                status: 'awaited',
                remarks: 'Payment Awaited',
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
        for (const sheetObject of sheetObjects) {
          let sheetDeliveryCharge = 0;
          let sheetReductionCharge = 0;
          const cartJson: any = payment.cartId;
          for (const cart in cartJson) {
            if (cartJson[cart].cartId === sheetObject.cartid) {
              if (cartJson[cart].deliveryCharge) {
                sheetDeliveryCharge = cartJson[cart].deliveryCharge;
              }
              if (cartJson[cart].reductionCharge) {
                sheetReductionCharge = cartJson[cart].reductionCharge;
              }
            }
          }
          if (process.env.NODE_ENV !== 'development') {
            const formattedDate = new Intl.DateTimeFormat('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(new Date());
            const usercreatedAt = new Intl.DateTimeFormat('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(new Date(user.createdAt));
            this.httpService
              .post(process.env.sheetLink, {
                section: 'manual',
                date: formattedDate,
                orderId: payment.orderId,
                fname: user.fname,
                lname: user.lname,
                student_transaction: payment.gatewayOrderId,
                course: sheetObject.course,
                pendrive: sheetObject.pendrive !== 0,
                state: user.Shipping[0]?.state
                  ? user.Shipping[0]?.state
                  : user.Billing[0]?.state,
                amount:
                  sheetObject.subtotal +
                  sheetObject.pendrive +
                  sheetDeliveryCharge -
                  sheetReductionCharge,
                attachmentLink: receipts
                  .map((receipt) => receipt.link)
                  .join(', '),
                status: 'awaited',
                remarks: 'Payment Awaited',
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
        await this.databaseService.userCart.updateMany({
          where: {
            paymentId: payment.id,
          },
          data: {
            status: 'awaited',
          },
        });
        return { message: 'Payment Awaiting Review', payment, cart: carts };
      }
    }
  }

  async receiveRazorpayPayment(body: any) {
    const { payload } = body;
    const { order } = payload;
    const { entity } = order;
    const gatewayOrderId = entity.id;
    const payment = await this.databaseService.userPayments.findFirst({
      where: {
        gatewayOrderId: gatewayOrderId,
      },
    });
    if (payment.status !== 'success') {
      return this.confirmRazorpayPayment(gatewayOrderId);
    }
    return;
  }

  async fixPayment(orderId: string) {
    const payment = await this.databaseService.userPayments.findFirst({
      where: {
        orderId: orderId,
      },
    });
    return this.makeManualPaymentSuccess(payment.orderId, '');
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

  getProductName(product: any): string {
    if (product.Product) {
      return product.abbr !== null
        ? product.abbr
        : product.name + ' ' + this.getProductName(product.Product);
    } else {
      return product.abbr !== null ? product.abbr : product.name;
    }
  }

  async makeManualPaymentSuccess(
    orderId: string,
    sendtoshipway: string,
    discountedRate?: number,
  ) {
    let subtotal = 0;
    let tablerow;
    let coursenames: string;
    let isMoreThanOneCourse = false;
    let payment = await this.databaseService.userPayments.findFirst({
      where: {
        orderId: orderId,
      },
      include: {
        Gatway: true,
      },
    });
    console.log(payment);
    if (!payment) {
      throw new NotFoundException('Payment Not Found');
    }
    if (payment.status === 'success') {
      return { message: 'Payment Success' };
    }
    payment = await this.databaseService.userPayments.update({
      where: {
        id: payment.id,
      },
      data: {
        status: 'success',
      },
      include: {
        Gatway: true,
      },
    });
    const carts = await this.databaseService.userCart.findMany({
      where: {
        paymentId: payment.id,
        userId: payment.userId,
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
            Product: {
              include: {
                Product: {
                  include: {
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
    const user = await this.databaseService.user.findFirst({
      where: {
        id: payment.userId,
      },
      include: {
        Meta: true,
        Billing: {
          include: {
            Company: true,
          },
        },
        Shipping: true,
      },
    });
    const sheetProducts = [];
    const sheetObjects = [];
    for (const cart in carts) {
      if (carts[cart].courseId !== null) {
        const sheetobject = {
          cartid: carts[cart].id,
          course: '',
          session: '',
          device: '',
          pendrive: 0,
          subtotal: 0,
          courseid: carts[cart].courseId,
        };
        const course = await this.findClosestPurchasableCourse(
          carts[cart].courseId,
        );
        let thisCartPrice = Number(course.Meta[0].price);
        const coursename = this.getCourseName(carts[cart].Course);
        sheetobject.course = coursename;
        sheetobject.subtotal = thisCartPrice;
        subtotal = subtotal + thisCartPrice;
        tablerow = `<tr>
						<td><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;"><img src="${course?.Meta[0]?.courseLogo}" alt="CFA" style="width: 70px;"></span></td>
						<td><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
                        <strong>${coursename}</strong><br>`;

        const sessionandpathway = this.getSessionName(carts[cart].Course);
        sheetobject.session = sessionandpathway;
        if (sessionandpathway !== '') {
          tablerow = tablerow + `Session : ${sessionandpathway}<br>`;
        }
        for (const extraoption of carts[cart].ExtraOptions) {
          if (extraoption.ExtraOption.price !== null) {
            thisCartPrice =
              thisCartPrice + Number(extraoption.ExtraOption.price);
          }
          if (
            extraoption.ExtraOption.name === 'Windows' ||
            extraoption.ExtraOption.name === 'Android' ||
            extraoption.ExtraOption.name === 'iOS' ||
            extraoption.ExtraOption.name === 'MacOs'
          ) {
            sheetobject.device = extraoption.ExtraOption.name;
            tablerow =
              tablerow +
              `</span><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">Device : ${extraoption.ExtraOption.name}<br>`;
          }
          if (extraoption.ExtraOption.name === 'Include Pendrive') {
            sheetobject.pendrive = Number(extraoption.ExtraOption.price);
            tablerow = tablerow + `<br> Pendrive : Included`;
          }
          tablerow =
            tablerow +
            `</span><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
                    </span>`;
        }
        tablerow = tablerow + `</td>`;
        tablerow =
          tablerow +
          `<td class="price"><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;"> ₹ ${thisCartPrice}</span></td></tr>`;
        if (!isMoreThanOneCourse) {
          coursenames = coursename;
          isMoreThanOneCourse = true;
        } else {
          coursenames = coursenames + ' , ' + coursename;
        }
        sheetObjects.push(sheetobject);
      }
      if (carts[cart].productId !== null) {
        const sheetProduct = {
          cartid: carts[cart].id,
          product: '',
          quantity: 0,
          price: 0,
          productId: carts[cart].productId,
        };
        const product = await this.databaseService.product.findFirst({
          where: {
            id: carts[cart].productId,
            Meta: {
              some: {
                purchasable: true,
              },
            },
          },
          include: {
            Meta: true,
            Product: {
              include: {
                Product: {
                  include: {
                    Product: {
                      include: {
                        Product: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
        sheetProduct.product = this.getProductName(product);
        sheetProduct.quantity = carts[cart].quantity;
        sheetProduct.price = Number(product.Meta[0].price);
        sheetProducts.push(sheetProduct);
        tablerow =
          tablerow +
          `<tr>
					<td><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;"><img
								src="${product.Meta[0].productLogo}" alt="${product.name}"></span></td>
					<td><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
							<strong>${product.name}</strong><br>
						</span><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">Quantity:
							${carts[cart].quantity}</span><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
						</span></td>
					<td class="price"><span
							style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">${Number(product.Meta[0].price) * carts[cart].quantity}</span></td>
				</tr>`;
      }
    }
    const paymentForSheet = 'Manual';
    const whatsappNumber = user?.Meta?.whatsappNumber
      ? (user.Meta.whatsappCountryCode ?? user.countryCode) +
        user.Meta.whatsappNumber
      : user.countryCode + user.phone;
    for (const productObject of sheetProducts) {
      if (process.env.NODE_ENV !== 'development') {
        const formattedDate = new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(new Date());
        const usercreatedAt = new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(new Date(user.createdAt));
        this.httpService
          .post(process.env.sheetLink, {
            section: 'product',
            date: formattedDate,
            accountCreateDate: usercreatedAt,
            enrollmentId: payment.orderId,
            phone: user.phone,
            countryCode: user.countryCode,
            fname: user.fname,
            email: user.email,
            lname: user.lname,
            whatsappCountryCode: user.Meta?.whatsappCountryCode,
            whatsappNumber: user.Meta?.whatsappNumber,
            product: productObject.product,
            quantity: productObject.quantity,
            shippingFirstName: user.Billing[0]?.fname,
            shippingLastName: user.Billing[0]?.lname,
            shippingEmail: user.Billing[0]?.email,
            shippingCountryCode: user.Billing[0]?.countryCode,
            shippingPhone: user.Billing[0]?.phone,
            shippingAddress: user.Billing[0]?.address,
            shippingCity: user.Billing[0]?.city,
            shippingState: user.Billing[0]?.state,
            shippingCountry: user.Billing[0]?.country,
            shippingPincode: user.Billing[0]?.pincode,
            billingFirstName: user.Shipping[0]?.fname,
            billingLastName: user.Shipping[0]?.lname,
            billingEmail: user.Shipping[0]?.email,
            billingCountryCode: user.Shipping[0]?.countryCode,
            billingPhone: user.Shipping[0]?.phone,
            billingStreetAddress: user.Shipping[0]?.address,
            billingCity: user.Shipping[0]?.city,
            billingState: user.Shipping[0]?.state,
            billingCountry: user.Shipping[0]?.country,
            billingPincode: user.Shipping[0]?.pincode,
            unitcharge: productObject.price,
            totalAmount: productObject.price * productObject.quantity,
            shippingCharges: 0,
            paymentType: payment.Gatway.mode,
            paymentMode: paymentForSheet,
            paymentStatus: payment.status,
            gatewayType: payment.Gatway.name,
            businessName: user.Billing[0]?.Company[0]?.name,
            gstNumber: user.Billing[0]?.Company[0]?.gstNo,
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
    for (const sheetObject of sheetObjects) {
      let sheetDeliveryCharge = 0;
      let sheetReductionCharge = 0;
      const cartJson: any = payment.cartId;
      for (const cart in cartJson) {
        if (cartJson[cart].cartId === sheetObject.cartid) {
          if (cartJson[cart].deliveryCharge) {
            sheetDeliveryCharge = cartJson[cart].deliveryCharge;
          }
          if (cartJson[cart].reductionCharge) {
            sheetReductionCharge = cartJson[cart].reductionCharge;
          }
        }
      }
      if (process.env.NODE_ENV !== 'development') {
        if (user.Billing[0]?.country === 'India' && sendtoshipway !== 'no') {
          this.courierService.pushOrderToShipway(
            payment.orderId,
            sheetObject.pendrive !== 0 ? 'Pendrive' : '',
            (sheetObject.subtotal + sheetObject.pendrive).toString(),
            sheetObject.course,
            {
              fname: user.Billing[0]?.fname || user.fname,
              lname: user.Billing[0]?.lname || user.lname,
              email: user.Billing[0]?.email || user.email,
              phone: user.Billing[0]?.phone || user.phone,
              address: user.Billing[0]?.address || 'Address not provided',
              city: user.Billing[0]?.city || 'City not provided',
              state: user.Billing[0]?.state || 'State not provided',
              country: user.Billing[0]?.country || 'Country not provided',
              pincode: user.Billing[0]?.pincode || '000000',
            },
            {
              cartId: sheetObject.cartid || undefined,
            },
          );
        }

        const reciepts: any = payment.reciept;
        const formattedDate = new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(new Date());
        const usercreatedAt = new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(new Date(user.createdAt));
        this.httpService
          .post(process.env.sheetLink, {
            section: 'enrollment',
            date: formattedDate,
            accountCreateDate: usercreatedAt,
            enrollmentId: payment.orderId,
            phone: user.phone,
            countryCode: user.countryCode,
            fname: user.fname,
            email: user.email,
            lname: user.lname,
            whatsappCountryCode: user.Meta.whatsappCountryCode,
            whatsappNumber: user.Meta.whatsappNumber,
            course: sheetObject.course,
            session: sheetObject.session,
            device: sheetObject.device,
            pendrive: sheetObject.pendrive !== 0,
            pendrivePrice: sheetObject.pendrive,
            shippingFirstName: user.Billing[0]?.fname,
            shippingLastName: user.Billing[0]?.lname,
            shippingEmail: user.Billing[0]?.email,
            shippingCountryCode: user.Billing[0]?.countryCode,
            shippingPhone: user.Billing[0]?.phone,
            shippingAddress: user.Billing[0]?.address,
            shippingCity: user.Billing[0]?.city,
            shippingState: user.Billing[0]?.state,
            shippingCountry: user.Billing[0]?.country,
            shippingPincode: user.Billing[0]?.pincode,
            billingFirstName: user.Shipping[0]?.fname,
            billingLastName: user.Shipping[0]?.lname,
            billingEmail: user.Shipping[0]?.email,
            billingCountryCode: user.Shipping[0]?.countryCode,
            billingPhone: user.Shipping[0]?.phone,
            billingStreetAddress: user.Shipping[0]?.address,
            billingCity: user.Shipping[0]?.city,
            billingState: user.Shipping[0]?.state,
            billingCountry: user.Shipping[0]?.country,
            billingPincode: user.Shipping[0]?.pincode,
            subtotalAmount: sheetObject.subtotal,
            shippingCharges: sheetDeliveryCharge,
            materialCharges: sheetReductionCharge,
            totalAmount:
              sheetObject.subtotal +
              sheetObject.pendrive +
              sheetDeliveryCharge -
              sheetReductionCharge,
            paymentType: payment.Gatway.mode,
            paymentMode: paymentForSheet,
            paymentStatus: payment.status,
            gatewayType: payment.Gatway.name,
            businessName: user.Billing[0]?.Company[0]?.name,
            gstNumber: user.Billing[0]?.Company[0]?.gstNo,
            attachmentLink: reciepts?.map((receipt) => receipt.link).join(', '),
          })
          .pipe(
            catchError((error: AxiosError) => {
              console.error('An Error Happened14', error.message);
              return []; // Handle error, optionally return an empty observable
            }),
          )
          .subscribe({
            next: (response) => response,
            error: (err) => console.error('HTTP request failed:', err),
          });
        const combined = user.countryCode + user.phone;
        const softwareId = combined.slice(-10);
        this.httpService
          .post(process.env.sheetLink, {
            section: 'software',
            date: formattedDate,
            fullName: user.fname + ' ' + user.lname,
            email: user.email,
            phone: user.phone,
            countryCode: user.countryCode,
            course: sheetObject.course,
            session: sheetObject.session,
            device: sheetObject.device,
            softwareId: softwareId.padStart(10, '0'),
          })
          .pipe(
            catchError((error: AxiosError) => {
              console.error('An Error Happened15', error.message);
              return []; // Handle error, optionally return an empty observable
            }),
          )
          .subscribe({
            next: (response) => response,
            error: (err) => console.error('HTTP request failed:', err),
          });
        await this.sendToSolution(
          sheetObject.courseid,
          user.id,
          softwareId.padStart(10, '0'),
          sheetObject.device,
          payment.orderId,
        );
        const usertocourse = await this.databaseService.userToCourse.findFirst({
          where: {
            userId: user.id,
            courseId: sheetObject.courseid,
          },
        });
        if (!usertocourse) {
          await this.databaseService.userToCourse.create({
            data: {
              userId: user.id,
              courseId: sheetObject.courseid,
            },
          });
        }
        let shippingCharge: number = 0;
        let reductionCharge: number = 0;
        let scholarShipCharge: number = 0;
        let reductionChargeHTML = '';
        const cartJson: any = payment.cartId;
        for (const cart in cartJson) {
          if (cartJson[cart].deliveryCharge) {
            shippingCharge = cartJson[cart].deliveryCharge + shippingCharge;
          }
          if (cartJson[cart].reductionCharge) {
            reductionCharge = cartJson[cart].reductionCharge + reductionCharge;
          }
          if (cartJson[cart].scholarShip) {
            scholarShipCharge = cartJson[cart].scholarShip + scholarShipCharge;
          }
        }
        const emailCampaign =
          await this.databaseService.platformTemplate.findFirst({
            where: {
              name: 'Email Payment Confirm',
              platformId: payment.platformId,
            },
          });
        if (reductionCharge !== 0) {
          reductionChargeHTML = `<tr>
        <td class="label"><span
            style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">Material Charges : </span></td>
        <td class="amount"><span
            style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;"> - ₹ ${reductionCharge}</span></td>
      </tr>`;
        }
        if (emailCampaign) {
          const formattedDate = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }).format(new Date(payment.updatedAt));
          const mailData = {
            orderId: payment.orderId,
            userFirstName: user.fname,
            orderDate: formattedDate,
            productTable: tablerow,
            shippingCharges: shippingCharge,
            totalAmount: payment.amount,
            subtotal: subtotal,
            studentFullName: user.fname + ' ' + user.lname,
            studentEmail: user.email,
            studentPhone: user.phone,
            shippingName:
              user?.Billing[0]?.fname + ' ' + user.Billing[0]?.lname,
            shippingEmail: user?.Billing[0]?.email,
            shippingPhone:
              user?.Billing[0]?.countryCode + ' ' + user?.Billing[0]?.phone,
            shippingAddress: user?.Billing[0]?.address,
            shippingCity: user?.Billing[0]?.city,
            shippingState: user?.Billing[0]?.state,
            shippingCountry: user?.Billing[0]?.country,
            shippingPincode: user?.Billing[0]?.pincode,
            reductionCharge: reductionChargeHTML,
          };
          this.emailService.sendEnrollmentConfirmationEmail(
            user.fname,
            user.email,
            emailCampaign.senderEmail,
            emailCampaign.senderName,
            mailData,
            emailCampaign.templateId,
          );
        }
        const whatsappCampaign =
          await this.databaseService.platformTemplate.findFirst({
            where: {
              platformId: payment.platformId,
              name: 'Whatsapp Payment Done',
            },
          });
        if (whatsappCampaign) {
          this.whatsappService.sendWhatsappMessage(
            whatsappNumber,
            user.fname,
            whatsappCampaign.templateId,
            [user.fname, coursenames, payment.orderId],
          );
        }
      }
    }
    await this.databaseService.userCart.updateMany({
      where: {
        paymentId: payment.id,
      },
      data: {
        status: 'success',
      },
    });
    this.leadService.donePayment(payment.platformId, payment.id);
    return { message: 'Payment Success', cart: carts, payment };
  }

  async addmissingUser(paymentId: string) {
    let payment = await this.databaseService.userPayments.findFirst({
      where: {
        orderId: paymentId,
      },
      include: {
        Gatway: true,
      },
    });
    const carts = await this.databaseService.userCart.findMany({
      where: {
        paymentId: payment.id,
        userId: payment.userId,
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
            Product: {
              include: {
                Product: {
                  include: {
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

    let subtotal = 0;
    let tablerow;
    let coursenames: string;
    let isMoreThanOneCourse = false;
    const user = await this.databaseService.user.findFirst({
      where: {
        id: payment.userId,
      },
      include: {
        Meta: true,
        Billing: {
          include: {
            Company: true,
          },
        },
        Shipping: true,
      },
    });
    const sheetProducts = [];
    const sheetObjects = [];
    for (const cart in carts) {
      if (carts[cart].courseId !== null) {
        const sheetobject = {
          cartid: carts[cart].id,
          course: '',
          session: '',
          device: '',
          pendrive: 0,
          subtotal: 0,
          courseid: carts[cart].courseId,
        };
        const course = await this.findClosestPurchasableCourse(
          carts[cart].courseId,
        );
        let thisCartPrice = Number(course.Meta[0].price);
        const coursename = this.getCourseName(carts[cart].Course);
        sheetobject.course = coursename;
        sheetobject.subtotal = thisCartPrice;
        subtotal = subtotal + thisCartPrice;
        tablerow =
          tablerow +
          `<tr>
          <td><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;"><img src="${course?.Meta[0]?.courseLogo}" alt="CFA" style="width: 70px;"></span></td>
          <td><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
                      <strong>${coursename}</strong><br>`;

        const sessionandpathway = this.getSessionName(carts[cart].Course);
        sheetobject.session = sessionandpathway;
        if (sessionandpathway !== '') {
          tablerow = tablerow + `Session : ${sessionandpathway}<br>`;
        }
        for (const extraoption of carts[cart].ExtraOptions) {
          if (extraoption.ExtraOption.price !== null) {
            thisCartPrice =
              thisCartPrice + Number(extraoption.ExtraOption.price);
          }
          if (
            extraoption.ExtraOption.name === 'Windows' ||
            extraoption.ExtraOption.name === 'Android' ||
            extraoption.ExtraOption.name === 'iOS' ||
            extraoption.ExtraOption.name === 'MacOs'
          ) {
            sheetobject.device = extraoption.ExtraOption.name;
            tablerow =
              tablerow +
              `</span><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">Device : ${extraoption.ExtraOption.name}<br>`;
          }
          if (extraoption.ExtraOption.name === 'Include Pendrive') {
            sheetobject.pendrive = Number(extraoption.ExtraOption.price);
            tablerow = tablerow + `<br> Pendrive : Included`;
          }
          tablerow =
            tablerow +
            `</span><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
                    </span>`;
        }
        tablerow = tablerow + `</td>`;
        tablerow =
          tablerow +
          `<td class="price"><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;"> ₹ ${thisCartPrice}</span></td></tr>`;
        if (!isMoreThanOneCourse) {
          coursenames = coursename;
          isMoreThanOneCourse = true;
        } else {
          coursenames = coursenames + ' , ' + coursename;
        }
        sheetObjects.push(sheetobject);
      }
      if (carts[cart].productId !== null) {
        const sheetProduct = {
          cartid: carts[cart].id,
          product: '',
          quantity: 0,
          price: 0,
          productId: carts[cart].productId,
        };

        const product = await this.databaseService.product.findFirst({
          where: {
            id: carts[cart].productId,
            Meta: {
              some: {
                purchasable: true,
              },
            },
          },
          include: {
            Meta: true,
            Product: {
              include: {
                Product: {
                  include: {
                    Product: {
                      include: {
                        Product: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
        sheetProduct.product = this.getProductName(product);
        sheetProduct.quantity = carts[cart].quantity;
        sheetProduct.price = Number(product.Meta[0].price);
        sheetProducts.push(sheetProduct);
        tablerow =
          tablerow +
          `<tr>
					<td><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;"><img
								src="${product.Meta[0].productLogo}" alt="${product.name}"></span></td>
					<td><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
							<strong>${product.name}</strong><br>
						</span><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">Quantity:
							${carts[cart].quantity}</span><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
						</span></td>
					<td class="price"><span
							style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">${Number(product.Meta[0].price) * carts[cart].quantity}</span></td>
				</tr>`;
      }
    }
    for (const sheetObject of sheetObjects) {
      let sheetDeliveryCharge = 0;
      let sheetReductionCharge = 0;
      const cartJson: any = payment.cartId;
      for (const cart in cartJson) {
        if (cartJson[cart].cartId === sheetObject.cartid) {
          if (cartJson[cart].deliveryCharge) {
            sheetDeliveryCharge = cartJson[cart].deliveryCharge;
          }
          if (cartJson[cart].reductionCharge) {
            sheetReductionCharge = cartJson[cart].reductionCharge;
          }
        }
      }
      const combined = user.countryCode + user.phone;
      const softwareId = combined.slice(-10);
      await this.sendToSolution(
        sheetObject.courseid,
        user.id,
        softwareId.padStart(10, '0'),
        sheetObject.device,
        payment.orderId,
      );
      await this.sendDataToCRM(user.id);
    }
  }

  async sendDataToCRM(userId: number) {
    const user = await this.databaseService.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        Meta: true,
      },
    });

    const whatsappNumber = user?.Meta?.whatsappNumber
      ? user.Meta.whatsappNumber
      : user.phone;
    const whatsappCountryCode = user?.Meta?.whatsappNumber
      ? (user.Meta.whatsappCountryCode ?? user.countryCode)
      : user.countryCode;
    const sendingData = {
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      phone: user.countryCode + '-' + user.phone,
      password: user.password,
      wphone: whatsappCountryCode + '-' + whatsappNumber,
    };
    this.httpService
      .post('https://crm.aswinibajaj.com/api/external/adduser', sendingData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .pipe(
        catchError((error: AxiosError) => {
          console.error('An Error Happened2223', error.message);
          return [];
        }),
      )
      .subscribe({
        next: (response) => response,
        error: (err) => console.error(err),
      });
  }
}
