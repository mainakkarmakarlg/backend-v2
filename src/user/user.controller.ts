import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  Request,
  Query,
  BadRequestException,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CustomRequest } from 'src/common/interface/custom-request.interface';
import { CartQueryDto } from './dto/cart-query.dto';
import { CartPostDto } from './dto/cart-post.dto';
import { BillingShippingPostDto } from './dto/billing-shipping-post.dto';
import { BillingPatchDto } from './dto/billing-patch.dto';
import { ShippingPatchDto } from './dto/shipping-patch.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { UserResetPasswordDto } from './dto/user-reset-password.dto';
import { ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { GetUserOrdersDto } from './dto/get-user-orders.dto';
import { EmployeePostDto } from './dto/employee-post.dto';
import { AddUserDto } from './dto/add-user.dto';
import { PaymentService } from 'src/payment/payment.service';
import {
  ResultAnalysisDto,
  ResultAnalysisSeedDto,
} from './dto/result-analysis.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FormNameDto } from './dto/form-name.dto';

@Controller('user')
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly paymentService: PaymentService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  finduser(@Request() req: CustomRequest) {
    return this.userService.getUser(req);
  }

  @UseGuards(AuthGuard)
  @Get('cart')
  findCart(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true })) cartQueryDto: CartQueryDto,
  ) {
    if (
      cartQueryDto.courseId !== undefined &&
      cartQueryDto.productId !== undefined
    ) {
      throw new BadRequestException(
        'Either Productid or Course id can be present',
      );
    }
    return this.userService.findCart(cartQueryDto, req.userid, req.platformid);
  }

  @ApiExcludeEndpoint()
  @Post('solution-number')
  solutionNumber(
    @Body(new ValidationPipe())
    solutionNumberDto: {
      email: string;
      number: string;
    },
  ) {
    return this.userService.addSolutionNumber(
      solutionNumberDto.email,
      solutionNumberDto.number,
    );
  }

  @UseGuards(AuthGuard)
  @Get('billing')
  getBilling(@Request() req: CustomRequest) {
    return this.userService.getBilling(req.userid);
  }

  @UseGuards(AuthGuard)
  @Patch('billing')
  patchBilling(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) billingPatchDto: BillingPatchDto,
  ) {
    return this.userService.patchBilling(req.userid, billingPatchDto);
  }

  @UseGuards(AuthGuard)
  @Get('shipping')
  getShipping(@Request() req: CustomRequest) {
    return this.userService.getShipping(req.userid);
  }

  @UseGuards(AuthGuard)
  @Patch('shipping')
  patchShipping(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) shippingPatchDto: ShippingPatchDto,
  ) {
    return this.userService.patchShipping(req.userid, shippingPatchDto);
  }

  @UseGuards(AuthGuard)
  @Delete('shipping/:id')
  deleteShipping(@Param('id') id: string, @Request() req: CustomRequest) {
    return this.userService.deleteShipping(req.userid, +id);
  }

  @UseGuards(AuthGuard)
  @Patch('cart')
  patchCart(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe({ transform: true })) cartPostDto: CartPostDto,
  ) {
    return this.userService.patchCart(cartPostDto, req.userid, req.platformid);
  }

  @UseGuards(AuthGuard)
  @Delete('cart/:id')
  deleteCart(@Param('id') id: string, @Request() req: CustomRequest) {
    return this.userService.deleteCart(req.userid, +id);
  }

  @UseGuards(AuthGuard)
  @Post('generate-payment')
  generatePayment(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) billingShippingPostDto: BillingShippingPostDto,
  ) {
    return this.userService.generatePayment(
      req.platformid,
      req.userid,
      billingShippingPostDto,
    );
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Post('confirm-payment')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'uploadedreceipt', maxCount: 2 }], {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  confirmPayment(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) confirmPaymentDto: ConfirmPaymentDto,
    @UploadedFiles() files: { uploadedreceipt?: Express.Multer.File[] },
  ) {
    return this.paymentService.confirmPayment(
      req.userid,
      req.platformid,
      confirmPaymentDto,
      files?.uploadedreceipt,
    );
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get('orders')
  getOrders(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true }))
    getOrdersDto: GetUserOrdersDto,
  ) {
    return this.userService.getOrders(req.userid, getOrdersDto);
  }

  @UseGuards(AuthGuard)
  @Get('order-cancel')
  orderCancel(@Request() req: CustomRequest, @Query('orderId') id: string) {
    if (!id) {
      throw new BadRequestException('Order id is required');
    }
    return this.paymentService.orderCancel(req.userid, id);
  }

  @UseGuards(AuthGuard)
  @Patch('profile')
  @UseInterceptors(
    FileInterceptor('profile', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  updateProfile(
    @Request() req: CustomRequest,
    @UploadedFile() profile?: Express.Multer.File,
  ) {
    return this.userService.updateProfile(req.userid, profile);
  }

  @UseGuards(AuthGuard)
  @Delete('profile')
  deleteProfile(@Request() req: CustomRequest) {
    return this.userService.deleteProfile(req.userid);
  }

  @Get('leaddelete')
  leadDelete(@Query() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }
    return this.userService.deleteLeads(body.email);
  }

  @UseGuards(AuthGuard)
  @Patch('profile-details')
  updateProfileDetails(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe({ transform: true }))
    updateProfileDto: UpdateProfileDto,
  ) {
    return this.userService.updateProfileDetails(req.userid, updateProfileDto);
  }

  @Get('payment-confirm')
  paymentConfirm(
    @Query('id') id: string,
    @Query('sendtoshipway') sendtoshipway: string,
    @Query('discountedAmount') discountedAmount: string,
  ) {
    return this.paymentService.makeManualPaymentSuccess(
      id,
      sendtoshipway,
      +discountedAmount,
    );
  }

  @UseGuards(AuthGuard)
  @Get('enrolled')
  getEnrolledCourses(@Request() req: CustomRequest) {
    return this.userService.getEnrolledCourses(req.userid, req.platformid);
  }

  @UseGuards(AuthGuard)
  @Get('enrolled/:courseId')
  setEnrolledCourse(
    @Request() req: CustomRequest,
    @Param('courseId') courseId: string,
  ) {
    if (!courseId) {
      throw new BadRequestException('Course id is required');
    }
    return this.userService.setCourse(req.userid, req.platformid, +courseId);
  }

  @UseGuards(AuthGuard)
  @Post('enroll')
  enrollCourse(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe({ transform: true }))
    enrollDto: { courseId: number },
  ) {
    return this.paymentService.enroll(enrollDto, req.userid, req.platformid);
  }

  @UseGuards(AuthGuard)
  @Post('resetpassword')
  resetPassword(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) resetPasswordDto: UserResetPasswordDto,
  ) {
    return this.userService.resetPassword(req.userid, resetPasswordDto);
  }

  @UseGuards(AuthGuard)
  @Get('combination')
  getCombination(
    @Request() req: CustomRequest,
    @Query('combinationId') combinationId: string,
  ) {
    if (!combinationId) {
      throw new BadRequestException('Combination id is required');
    }
    return this.userService.getCombination(req.userid, combinationId);
  }

  @Post('add-user')
  addUser(@Body(new ValidationPipe()) addUserDto: AddUserDto) {
    return this.userService.addUser(addUserDto);
  }

  @Get('addsubject')
  addSubject() {
    return this.userService.addSubject();
  }

  @UseGuards(AuthGuard)
  @Get('course')
  getCourse(@Request() req: CustomRequest) {
    return this.userService.getCourse(req.userid, req.platformid);
  }

  @Post('employee')
  createEmployee(@Body(new ValidationPipe()) employeePostDto: EmployeePostDto) {
    return this.userService.createEmployee(employeePostDto);
  }

  @Post('validity-extension')
  validityExtension(
    @Body(new ValidationPipe())
    validityExtensionDto: {
      courseId: number;
      days: number;
    },
  ) {}

  // result analysis
  @UseGuards(AuthGuard)
  @Post('result-analysis')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'resultPdf', maxCount: 5 }], {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  resultAnalysis(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe({ transform: true }))
    resultAnalysisDto: ResultAnalysisDto,
    @UploadedFiles() files: { resultPdf?: Express.Multer.File[] } = {},
  ) {
    // console.log('Result Analysis DTO:', resultAnalysisDto);

    return this.userService.resultAnalysis(
      req.userid,
      req.platformid,
      resultAnalysisDto,
      files.resultPdf,
    );
  }

  @Post('result-analysis-seed')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'resultPdf', maxCount: 5 }], {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  resultAnalysisSeed(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe({ transform: true }))
    resultAnalysisSeedDto: ResultAnalysisSeedDto,
    @UploadedFiles() files: { resultPdf?: Express.Multer.File[] } = {},
  ) {
    return this.userService.resultAnalysisSeed(
      req.platformid,
      resultAnalysisSeedDto,
      files.resultPdf,
    );
  }

  @UseGuards(AuthGuard)
  @Post('forms/introspect-result')
  async introspectResult(
    @Body('data') data: any,
    @Request() req: CustomRequest,
    @UploadedFiles() files: { file?: Express.Multer.File[] } = {},
  ) {
    return this.userService.introspectResult(data, req);
  }

  @Post('result-analysis-pdf')
  async createAnalysisPdf(
    @Request() req: CustomRequest,
    @Res() res: Response,
    @Body('data') data: any,
  ) {
    const pdfBuffer = await this.userService.downloadResultPdf(data);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="analysis.pdf"`, // 👈 Fixed: removed extra brace and added proper extension
      'Content-Length': pdfBuffer.length.toString(),
    });

    // Send PDF buffer
    res.send(pdfBuffer);
  }

  @Get('forms')
  getForm(
    @Request() req: CustomRequest,
    @Query(new ValidationPipe({ transform: true })) formNameDto: FormNameDto,
  ) {
    return this.userService.findForms(formNameDto, req.platformid);
  }
}
