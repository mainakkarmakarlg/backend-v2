import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('razorpay')
  receiveRazorpayPayment(@Body() body: any) {
    this.paymentService.receiveRazorpayPayment(body);
  }

  @Post('fixissue')
  fixPayment(@Body() fixPaymentDto: { orderId: string }) {
    this.paymentService.fixPayment(fixPaymentDto.orderId);
  }

  @Post('someuser')
  receiveSomeUserPayment(@Body() body: any) {
    this.paymentService.addmissingUser(body.paymentId);
  }
}
