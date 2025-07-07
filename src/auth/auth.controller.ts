import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  Request,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { CustomRequest } from 'src/common/interface/custom-request.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { LoginOtpDto } from './dto/login-otp.dto';
import { ChangeVerficationDTO } from './dto/change-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseInterceptors(AnyFilesInterceptor())
  login(
    @Body(new ValidationPipe()) loginAuthDto: LoginAuthDto,
    @Request() req: CustomRequest,
  ) {
    return this.authService.login(loginAuthDto, req);
  }

  @Post('register')
  @UseInterceptors(AnyFilesInterceptor())
  register(
    @Body(ValidationPipe) registerAuthDto: RegisterAuthDto,
    @Request() req: CustomRequest,
  ) {
    return this.authService.register(registerAuthDto, req);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refreshtoken')
  @UseInterceptors(AnyFilesInterceptor())
  refreshtoken(
    @Body(ValidationPipe) refreshTokenDto: RefreshTokenDto,
    @Request() req: CustomRequest,
  ) {
    return this.authService.refreshtoken(refreshTokenDto, req);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verifytoken')
  @UseInterceptors(AnyFilesInterceptor())
  verifyToken(
    @Body(ValidationPipe) verifyTokenDto: VerifyTokenDto,
    @Request() req: CustomRequest,
  ) {
    return this.authService.verifyuser(verifyTokenDto, req);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('oauth')
  @UseInterceptors(AnyFilesInterceptor())
  oauth(
    @Request() req: CustomRequest,
    @Body(ValidationPipe) oauthDto: { platform: string },
  ) {
    if (!oauthDto.platform) {
      throw new BadRequestException('Platform is required for OAuth');
    }
    return this.authService.oauth(
      req.platformid,
      req.userid,
      oauthDto.platform,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('resendtoken')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'The token to be verified.',
          example: '12345abcde',
        },
      },
      required: ['token'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token resent successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token or missing parameters.',
  })
  resendVerifyToken(
    @Body('token', ValidationPipe) token: string,
    @Request() req: CustomRequest,
  ) {
    return this.authService.resendtoken(token, req.platformid);
  }

  @HttpCode(HttpStatus.OK)
  @Post('loginotp')
  @UseInterceptors(AnyFilesInterceptor())
  sendOTPForLogin(
    @Body(ValidationPipe) loginOtpDto: LoginOtpDto,
    @Request() req: CustomRequest,
  ) {
    return this.authService.loginOTP(loginOtpDto, req.platformid);
  }

  @HttpCode(HttpStatus.OK)
  @Post('changeverification')
  @UseInterceptors(AnyFilesInterceptor())
  changeVerificationMethod(
    @Body(ValidationPipe) changeVerificationDto: ChangeVerficationDTO,
    @Request() req: CustomRequest,
  ) {
    return this.authService.changeVerification(
      changeVerificationDto,
      req.platformid,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('checkuser')
  @UseInterceptors(AnyFilesInterceptor())
  checkUser(
    @Request() req: CustomRequest,
    @Body(ValidationPipe) loginOtpDto: LoginOtpDto,
  ) {
    return this.authService.checkuser(req.platformid, loginOtpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgotpassword')
  @UseInterceptors(AnyFilesInterceptor())
  forgotPassword(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) loginOtpDto: LoginOtpDto,
  ) {
    return this.authService.forgotPassword(req.platformid, loginOtpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('resendforgotpassword')
  @UseInterceptors(AnyFilesInterceptor())
  resendForgotPassword(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) verifyTokenDto: VerifyTokenDto,
  ) {
    return this.authService.resendForgotPassword(
      req.platformid,
      verifyTokenDto,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('verifyforgotpassword')
  @UseInterceptors(AnyFilesInterceptor())
  verifyForgotPassword(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) verifyTokenDto: VerifyTokenDto,
  ) {
    return this.authService.verifyForgotPassword(
      req.platformid,
      verifyTokenDto,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('resetpassword')
  @UseInterceptors(AnyFilesInterceptor())
  resetPassword(
    @Request() req: CustomRequest,
    @Body(new ValidationPipe()) resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(req.platformid, resetPasswordDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('lmslogin')
  lmslogin(
    @Body(new ValidationPipe()) loginAuthDto: LoginOtpDto,
    @Request() req: CustomRequest,
  ) {
    return this.authService.lmslogin(loginAuthDto, req.platformid);
  }
}
