import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Query,
  UseGuards,
  BadRequestException,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { PlatformService } from './platform.service';
import { CustomRequest } from 'src/common/interface/custom-request.interface';
import { CreateFaqDto } from './dto/create-faq.dto';
import { NoticeBoardQueryDto } from './dto/noticeboard-query.dto';
import { CourseQueryDto } from './dto/course-query.dto';
import { CheckAuthGuard } from 'src/auth/guards/checkauth.guard';
import { DeliveryChargesDto } from './dto/delivery-charges.dto';
import { NoticeBoardPostDto } from './dto/notice-board-post.dto';
import { TestimonialQueryDto } from './dto/testimonial-query.dto';
import { PlatformFaqPostDto } from './dto/platform-faq-post.dto';
import { UserContactPostDto } from './dto/user-contact-post.dto';
import { PostTestimonialDto } from './dto/post-testimonial.dto';
import { ApiBody } from '@nestjs/swagger';
import { ProductQueryDto } from './dto/product-query.dto';
import { EventRegisterPostDto } from './dto/event-register-post.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { FaqQueryDto } from './dto/faq-query.dto';
import { GetPlatformSupportDto } from './dto/get-platform-support.dto';

@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Get()
  getPlatform(@Request() req: CustomRequest) {
    return this.platformService.getPlatform(req.platformid);
  }

  @Get('sendtestmail')
  sendTestMail() {
    return this.platformService.sendTestMail();
  }

  @Get('course')
  getallCourses(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    courseQueryDto: CourseQueryDto,
  ) {
    return this.platformService.findCourses(req.platformid, courseQueryDto);
  }

  @Get('device')
  getDevice() {
    // const password = [
    //   {
    //     id: 1,
    //     name: null,
    //     deviceId:
    //       '08FDCB54DD2A6D3B9186A836A92A4DDBEBF5A36A403EAE26CF2CB1B5A430503F',
    //     type: 'Home',
    //     isAllowed: true,
    //     Employee: [
    //       {
    //         employeeId: 1,
    //         deviceId: 1,
    //         createdAt: '2025-03-01T18:08:57.175Z',
    //         updatedAt: '2025-03-15T14:29:30.63Z',
    //         isAllowed: true,
    //         Employee: {
    //           fname: 'Durgesh',
    //           lname: 'Tiwari',
    //           email: 'dugesh.lg@gmail.com',
    //           profile:
    //             'https://del1.vultrobjects.com/crmaswinibajaj/CRM/profile/profileuser_88XQqoS.JPG',
    //         },
    //         isOnline: false,
    //       },
    //     ],
    //     isUSBOpen: false,
    //     isOnline: false,
    //   },
    //   {
    //     id: 2,
    //     name: null,
    //     deviceId: '123456789',
    //     type: 'Office',
    //     isAllowed: false,
    //     Employee: [],
    //     isUSBOpen: false,
    //     isOnline: false,
    //   },
    //   {
    //     id: 3,
    //     name: null,
    //     deviceId:
    //       '3032C30167F346598CA2805B00E4CE11674C5228109699FD9FF11EE95A4D2234',
    //     type: 'Office',
    //     isAllowed: true,
    //     Employee: [
    //       {
    //         employeeId: 1,
    //         deviceId: 3,
    //         createdAt: '2025-03-21T10:10:20.626Z',
    //         updatedAt: '2025-03-21T10:10:20.626Z',
    //         isAllowed: true,
    //         Employee: {
    //           fname: 'Durgesh',
    //           lname: 'Tiwari',
    //           email: 'dugesh.lg@gmail.com',
    //           profile:
    //             'https://del1.vultrobjects.com/crmaswinibajaj/CRM/profile/profileuser_88XQqoS.JPG',
    //         },
    //         isOnline: true,
    //       },
    //     ],
    //     isUSBOpen: false,
    //     isOnline: true,
    //   },
    // ];
  }

  @Get('currency')
  getDollars() {
    return this.platformService.getDollars();
  }

  @UseGuards(CheckAuthGuard)
  @Get('faq')
  getFaq(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true })) faqQueryDto: FaqQueryDto,
  ) {
    return this.platformService.getNewFaq(
      req.platformid,
      req.userid,
      faqQueryDto,
    );
  }

  @Post('anotherfaq')
  postAnotherFaq(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) createFaqDto: CreateFaqDto,
  ) {
    return this.platformService.getFaqOptional(createFaqDto, req.platformid);
  }

  // @Get('platformpayment')
  // getPlatformPayment(@Request() req: CustomRequest) {
  //   return this.platformService.getPlatformPayment();
  // }

  @Get('product')
  getallProducts(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    productQueryDto: ProductQueryDto,
  ) {
    return this.platformService.findProducts(req.platformid, productQueryDto);
  }

  @UseGuards(CheckAuthGuard)
  @Get('noticeboard')
  getNotficeboard(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    noticeboardQueryDto: NoticeBoardQueryDto,
  ) {
    const StartDate =
      noticeboardQueryDto.startDate !== undefined
        ? new Date(noticeboardQueryDto.startDate)
        : undefined;
    const EndDate =
      noticeboardQueryDto.endDate !== undefined
        ? new Date(noticeboardQueryDto.endDate)
        : undefined;
    return this.platformService.getNoticeBoard(
      req.platformid,
      StartDate,
      EndDate,
      noticeboardQueryDto.courseId,
      req.userid,
      noticeboardQueryDto.key,
      noticeboardQueryDto.type,
      noticeboardQueryDto.galleryKey,
      noticeboardQueryDto.eventId,
      noticeboardQueryDto.eventName,
    );
  }

  @UseGuards(CheckAuthGuard)
  @Post('event-register')
  async postMeetupRegister(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) eventRegisterPostDto: EventRegisterPostDto,
  ) {
    return this.platformService.registerEvent(
      req.userid,
      req.platformid,
      eventRegisterPostDto,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('event-register')
  async patchMeetupRegister(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) eventRegisterPostDto: EventRegisterPostDto,
  ) {
    return this.platformService.updateEventRegistration(
      req.userid,
      req.platformid,
      eventRegisterPostDto,
    );
  }

  @Post('register-email')
  async postRegisterEmail(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) user: { email: string },
  ) {
    return this.platformService.sentRegisterEvent(user.email, req.platformid);
  }

  // @UseGuards(AuthGuard)
  // @Patch('event-register')
  // async patchMeetupRegister(
  //   @Request() req: CustomRequest,
  //   @Body(new ValidationPipe()) eventRegisterPostDto: EventRegisterPostDto,
  // ) {
  //   return this.platformService.updateEventRegistration(
  //     req.userid,
  //     eventRegisterPostDto,
  //   );
  // }

  @Get('meta')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'Key for the platform Meta',
          example: '12345abcde',
        },
      },
      required: ['token'],
    },
  })
  getPlatformMeta(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe()) key: any,
  ) {
    if (!key.key) {
      throw new BadRequestException('Key is required');
    }
    return this.platformService.getPlatformMeta(key.key, req.platformid);
  }

  @Get('deliveryCharges')
  getDeliveryCharges(
    @Query(new ValidationPipe({ transform: true }))
    getDeliveryChargesDto: DeliveryChargesDto,
  ) {
    return this.platformService.getDeliveryCharges(getDeliveryChargesDto);
  }

  @Post('postevents')
  postEvents(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) noticeBoardPostDto: NoticeBoardPostDto,
  ) {
    return this.platformService.uploadNoticeBoard(
      noticeBoardPostDto,
      req.platformid,
    );
  }

  @Get('paymentoptions')
  getPaymentOptions(@Request() req: CustomRequest) {
    return this.platformService.getPaymentOptions(req.platformid);
  }

  @Get('testimonials')
  getTestimonials(
    @Request() req: CustomRequest,
    @Query(
      new ValidationPipe({
        transform: true,
        forbidNonWhitelisted: true,
        whitelist: true,
      }),
    )
    testimonialQueryDto: TestimonialQueryDto,
  ) {
    return this.platformService.getTestimonials(
      req.platformid,
      testimonialQueryDto,
    );
  }

  @Post('testimonials')
  postTestimonials(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) postTestimonialDTO: PostTestimonialDto,
  ) {
    return this.platformService.setTestimonials(
      req.platformid,
      postTestimonialDTO,
    );
  }

  @Post('deleteplatformfaq')
  deletePlatformFaq() {
    return this.platformService.deletePlatform();
  }

  @Post('platformFaq')
  postPlatformFaq(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) platformFaqPostDTO: PlatformFaqPostDto,
  ) {
    return this.platformService.setPlatformFaq(
      platformFaqPostDTO,
      req.platformid,
    );
  }

  @Get('platform-support')
  getPlatformSupport(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    getPlatformSupportDto: GetPlatformSupportDto,
  ) {
    return this.platformService.getPlatformSupport(getPlatformSupportDto);
  }

  @Post('platform-support')
  postPlatformSupport(@Request() req: CustomRequest) {}

  // @Post('email-introspect')
  // getEmailIntrospect(
  //   @Request() req: CustomRequest,
  //   @Body() Body: { email: string },
  // ) {
  //   return this.platformService.getEmailIntrospect(Body.email);
  // }

  @Get('platformcourse')
  getPlatformCourse(@Request() req: CustomRequest) {
    return this.platformService.getAllCourses(req.platformid);
  }

  @Get('deviceId')
  getDeviceId(
    @Request() req: CustomRequest,
    @Query('deviceId') deviceId: string,
  ) {
    return this.platformService.getDeviceId(deviceId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('contact')
  postContact(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe({ transform: true }))
    userContactPostDto: UserContactPostDto,
  ) {
    return this.platformService.postContactForm(
      req.platformid,
      userContactPostDto,
    );
  }
}
