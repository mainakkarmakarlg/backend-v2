import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';
import { CustomRequest } from 'src/common/interface/custom-request.interface';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { GenerateOtp } from 'src/common/utils/generate-otp.utils';
import { LoginOtpDto } from './dto/login-otp.dto';
import { ChangeVerficationDTO } from './dto/change-verification.dto';
import { EmailsService } from 'src/email/email.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { HttpService } from '@nestjs/axios';
import { catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { CustomUserSocketClient } from 'src/common/interface/custom-socket-user-client.interface';
import { LeadService } from 'src/lead/lead.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly emailService: EmailsService,
    private readonly whatsappService: WhatsappService,
    private readonly httpService: HttpService,
    private readonly leadService: LeadService,
  ) {}

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

  async lmslogin(loginAuthDto: LoginOtpDto, platformid: number) {
    const platform = await this.databaseService.platform.findFirst({
      where: {
        id: platformid,
      },
    });
    const canTakeLoginBynumber =
      await this.databaseService.platformOptions.findFirst({
        where: {
          platformId: platformid,
          key: 'AllowLoginByNumber',
        },
      });
    if (!canTakeLoginBynumber) {
      throw new UnauthorizedException(
        'This platform does not allow login by number',
      );
    }
    let user = await this.databaseService.user.findFirst({
      where: {
        OR: [{ email: loginAuthDto.email }, { phone: loginAuthDto.phone }],
      },
    });
    if (!user) {
      const softwareId = await this.databaseService.solutionNumber.findFirst({
        where: {
          number: loginAuthDto.phone,
        },
        include: {
          User: true,
        },
      });
      if (!softwareId) {
        throw new NotFoundException('User Not Found!');
      }
      user = softwareId.User;
    }
    const userresponse = await this.giveUser(user.id, platformid);
    return userresponse;
  }

  async login(loginAuthDto: LoginAuthDto, req: CustomRequest) {
    const user = await this.databaseService.user.findFirst({
      where: {
        OR: [
          { email: { equals: loginAuthDto.email, mode: 'insensitive' } },
          { phone: loginAuthDto.phone },
        ],
      },
      include: {
        UnverifiedFields: true,
        Meta: true,
      },
    });
    if (!user) {
      const userNotFoundMessage =
        await this.databaseService.platformOptions.findFirst({
          where: {
            platformId: req.platformid,
            key: 'UserNotFoundMessage',
          },
        });
      throw new NotFoundException({
        message: 'User Not Found!',
        helpNumbers: userNotFoundMessage?.valueJson,
      });
    }
    if (loginAuthDto.password) {
      if (loginAuthDto.password !== user.password) {
        const passwordIncorrectMessage =
          await this.databaseService.platformOptions.findFirst({
            where: {
              platformId: req.platformid,
              key: 'PasswordIncorrectMessage',
            },
          });
        throw new UnauthorizedException({
          message: 'password is incorrect!',
          helpNumbers: passwordIncorrectMessage?.valueJson,
        });
      }
    }
    if (loginAuthDto.otp) {
      const OtpCache: any = await this.cacheManager.get(
        `user_login_otp_${user.email}`,
      );
      if (!OtpCache) {
        const otpExpiredMessage =
          await this.databaseService.platformOptions.findFirst({
            where: {
              platformId: req.platformid,
              key: 'OtpExpiredMessage',
            },
          });
        throw new UnauthorizedException({
          message: 'OTP expired!',
          helpNumbers: otpExpiredMessage?.valueJson,
        });
      }
      if (OtpCache.otp !== loginAuthDto.otp) {
        const otpInvalidMessage =
          await this.databaseService.platformOptions.findFirst({
            where: {
              platformId: req.platformid,
              key: 'OtpInvalidMessage',
            },
          });
        throw new UnauthorizedException({
          message: 'Invalid OTP!',
          helpNumbers: otpInvalidMessage?.valueJson,
        });
      }
      await this.cacheManager.del(`user_login_otp_${user.email}`);
    }
    if (user.UnverifiedFields.length > 0) {
      const platform = await this.databaseService.platform.findFirst({
        where: {
          id: req.platformid,
        },
      });
      let resend_token;
      switch (user.UnverifiedFields[0].field) {
        case 'email':
          if (platform.origin !== null) {
            resend_token = uuidv4();

            const emailToken = uuidv4();
            const isVerify: any = await this.cacheManager.get(
              `verify_user_${user.id}`,
            );
            if (isVerify) {
              if (isVerify.resend_token) {
                await this.cacheManager.del(isVerify.resend_token);
              }
              if (isVerify.email_token) {
                await this.cacheManager.del(isVerify.email_token);
              }
            }
            await this.cacheManager.set(
              `verify_user_${user.id}`,
              {
                resend_token: resend_token,
                email_token: emailToken,
              },
              900000,
            );
            await this.cacheManager.set(
              resend_token,
              {
                userId: user.id,
                email_token: emailToken,
                platformid: req.platformid,
                path: 'email_resend',
              },
              900000,
            );
            await this.cacheManager.set(
              emailToken,
              { userId: user.id, platformid: req.platformid, path: 'email' },
              900000,
            );
            const verifcationTemplate =
              await this.databaseService.platformTemplate.findFirst({
                where: {
                  platformId: req.platformid,
                  name: 'Email Verification',
                },
                include: {
                  Platform: true,
                },
              });
            if (verifcationTemplate) {
              if (verifcationTemplate.Platform.origin !== null) {
                const token =
                  verifcationTemplate.Platform.origin +
                  '/verify-email?student=' +
                  emailToken;
                await this.emailService.sendVefificationEmail(
                  user.email,
                  'Verify Your Email',
                  token,
                  user.fname,
                  Number(verifcationTemplate.templateId),
                  verifcationTemplate.senderName,
                  verifcationTemplate.senderEmail,
                );
              }
            }
          } else {
            resend_token = uuidv4();
            const generator = new GenerateOtp();
            const emailToken = generator.generate().toString();
            const isVerify: any = await this.cacheManager.get(
              `verify_user_${user.id}`,
            );
            if (isVerify) {
              if (isVerify.resend_token) {
                await this.cacheManager.del(isVerify.resend_token);
              }
              if (isVerify.email_token) {
                await this.cacheManager.del(isVerify.email_token);
              }
            }
            await this.cacheManager.set(
              `verify_user_${user.id}`,
              {
                resend_token: resend_token,
              },
              900000,
            );
            await this.cacheManager.set(
              resend_token,
              {
                userId: user.id,
                otp: emailToken,
                platformid: req.platformid,
                path: 'whatsapp',
              },
              900000,
            );
            const verifcationTemplate =
              await this.databaseService.platformTemplate.findFirst({
                where: {
                  platformId: req.platformid,
                  name: 'Email Verification',
                },
                include: {
                  Platform: true,
                },
              });
            if (verifcationTemplate) {
              if (verifcationTemplate.Platform.origin !== null) {
                const token =
                  verifcationTemplate.Platform.origin +
                  '/verify-email?student=' +
                  emailToken;
                await this.emailService.sendVefificationEmail(
                  user.email,
                  'Verify Your Email',
                  token,
                  user.fname,
                  Number(verifcationTemplate.templateId),
                  verifcationTemplate.senderName,
                  verifcationTemplate.senderEmail,
                );
              }
            }
          }
          break;
        case 'phone':
          resend_token = uuidv4();
          const generator = new GenerateOtp();
          const userOTP = generator.generate();

          await this.cacheManager.set(
            `verify_user_${user.id}`,
            {
              resend_token: resend_token,
            },
            900000,
          );
          await this.cacheManager.set(
            resend_token,
            {
              userId: user.id,
              otp: userOTP,
              platformid: req.platformid,
              path: 'phone',
            },
            900000,
          );
          break;
        case 'whatsapp':
          resend_token = uuidv4();
          const whatsappgenerator = new GenerateOtp();
          const whatsappOTP = whatsappgenerator.generate();
          const isVerify: any = await this.cacheManager.get(
            `verify_user_${user.id}`,
          );
          if (isVerify) {
            if (isVerify.resend_token) {
              await this.cacheManager.del(isVerify.resend_token);
            }
            if (isVerify.email_token) {
              await this.cacheManager.del(isVerify.email_token);
            }
          }
          await this.cacheManager.set(
            `verify_user_${user.id}`,
            {
              resend_token: resend_token,
            },
            900000,
          );
          await this.cacheManager.set(
            resend_token,
            {
              userId: user.id,
              otp: whatsappOTP,
              platformid: req.platformid,
              path: 'whatsapp',
            },
            900000,
          );
          const whatsappTemplate =
            await this.databaseService.platformTemplate.findFirst({
              where: {
                platformId: req.platformid,
                name: 'Whatsapp Verification',
              },
            });
          const whatsappNumber = user?.Meta?.whatsappNumber
            ? (user.Meta.whatsappCountryCode ?? user.countryCode) +
              user.Meta.whatsappNumber
            : user.countryCode + user.phone;

          if (whatsappTemplate) {
            this.whatsappService.sendWhatsappMessage(
              whatsappNumber,
              user.fname + ' ' + user.lname,
              whatsappTemplate.templateId,
              [whatsappOTP.toString()],
              undefined,
              undefined,
              undefined,
              [
                {
                  type: 'button',
                  sub_type: 'url',
                  index: 0,
                  parameters: [
                    {
                      type: 'text',
                      text: whatsappOTP.toString(),
                    },
                  ],
                },
              ],
            );
          }
          break;
        case 'undefined':
          resend_token = uuidv4();
          await this.cacheManager.set(
            `verify_user_${user.id}`,
            {
              resend_token: resend_token,
            },
            900000,
          );
          await this.cacheManager.set(
            resend_token,
            {
              platformid: req.platformid,
              path: 'undefined',
              userId: user.id,
            },
            900000,
          );
          break;
      }
      const fieldNotVerifiedMessage =
        await this.databaseService.platformOptions.findFirst({
          where: {
            platformId: req.platformid,
            key: 'FieldNotVerifiedMessage',
          },
        });
      throw new ForbiddenException({
        message: `${user.UnverifiedFields[0].field} is not verified!`,
        resend_token,
        helpNumbers: fieldNotVerifiedMessage?.valueJson,
      });
    }

    const response = await this.giveUser(
      user.id,
      req.platformid,
      loginAuthDto.deviceId,
    );
    return response;
  }

  toProperCase = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // async attachUserToMessages(userId: number) {
  //   const user = await this.databaseService.user.findFirst({
  //     where: {
  //       id: userId,
  //     },
  //   });
  //   const leadSource = await this.databaseService.leadSource.findFirst({
  //     where: {
  //       name: 'NewSignup',
  //     },
  //   });
  //   let lead = await this.databaseService.userLead.findFirst({
  //     where: {
  //       status: {
  //         notIn: ['converted', 'abuse', 'fake'],
  //       },
  //       OR: [
  //         {
  //           email: user.email,
  //         },
  //         {
  //           phone: user.phone,
  //         },
  //         {
  //           ContactForm: {
  //             some: {
  //               OR: [
  //                 {
  //                   email: user.email,
  //                 },
  //                 {
  //                   phone: user.phone,
  //                 },
  //               ],
  //             },
  //           },
  //           User: {
  //             OR: [
  //               {
  //                 email: user.email,
  //               },
  //               {
  //                 phone: user.phone,
  //               },
  //             ],
  //           },
  //         },
  //       ],
  //     },
  //   });
  //   if (!lead) {
  //     lead = await this.databaseService.userLead.create({
  //       data: {
  //         email: user.email,
  //         phone: user.phone,
  //         fname: user.fname,
  //         lname: user.lname,
  //         countryCode: user.countryCode,
  //         status: 'new',
  //         sourceId: leadSource.id,
  //         userId: userId,
  //       },
  //     });
  //   } else {
  //     lead = await this.databaseService.userLead.update({
  //       where: {
  //         id: lead.id,
  //       },
  //       data: {
  //         userId: userId,
  //         action: 'call',
  //         sourceId: leadSource.id,
  //       },
  //     });
  //   }

  //   const messages = await this.databaseService.userContactForm.updateMany({
  //     where: {
  //       OR: [
  //         {
  //           email: user.email,
  //         },
  //         {
  //           phone: user.phone,
  //         },
  //       ],
  //     },
  //     data: {
  //       userId: userId,
  //     },
  //   });
  // }

  generatePassword(): string {
    const length = 8;
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_-+=<>?/';

    const allCharacters = lowercase + uppercase + numbers + specialChars;

    let password = '';
    // Ensure at least one uppercase, one number, and one special character
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill the remaining characters randomly
    for (let i = password.length; i < length; i++) {
      password +=
        allCharacters[Math.floor(Math.random() * allCharacters.length)];
    }

    // Shuffle the password to ensure randomness
    password = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    return password;
  }

  async register(registerAuthDto: RegisterAuthDto, req: CustomRequest) {
    const existinguser = await this.databaseService.user.findFirst({
      where: {
        OR: [
          { email: registerAuthDto.email },
          { phone: registerAuthDto.phone },
        ],
      },
    });
    if (existinguser) {
      throw new ConflictException('User already exists!');
    }
    try {
      const platform = await this.databaseService.platform.findFirst({
        where: {
          id: req.platformid,
        },
      });
      const user = await this.databaseService.user.create({
        data: {
          fname: this.toProperCase(registerAuthDto.fname),
          lname: this.toProperCase(registerAuthDto.lname),
          email: registerAuthDto.email.toLowerCase(),
          password: registerAuthDto.password
            ? registerAuthDto.password
            : this.generatePassword(),
          phone: registerAuthDto.phone,
          countryCode: registerAuthDto.countryCode,
          Meta: {
            create: {
              whatsappNumber: registerAuthDto.whatsappNumber,
              whatsappCountryCode: registerAuthDto.whatsappCountryCode,
            },
          },
        },
        select: {
          id: true,
          fname: true,
          lname: true,
          email: true,
          password: true,
          phone: true,
          countryCode: true,
          Meta: true,
          UnverifiedFields: {
            select: {
              field: true,
            },
          },
        },
      });
      if (!registerAuthDto.password) {
        await this.databaseService.userMetaHistory.create({
          data: {
            userId: user.id,
            field: 'password',
          },
        });
      }
      await this.databaseService.userToPlatform.create({
        data: {
          userId: user.id,
          platformId: req.platformid,
        },
      });

      await this.sendDataToCRM(user.id);
      if (process.env.NODE_ENV !== 'development') {
        if (platform.id === 1) {
          const formattedDate = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).format(new Date());
          this.httpService
            .post(process.env.sheetLink, {
              section: 'register',
              date: formattedDate,
              email: user.email,
              phone: user.phone,
              countryCode: user.countryCode,
              fname: user.fname,
              lname: user.lname,
              whatsappCountryCode: user.Meta[0]?.whatsappCountryCode,
              whatsappNumber: user.Meta[0]?.whatsappNumber,
              verification: registerAuthDto.verificationMode,
            })
            .pipe(
              catchError((error: AxiosError) => {
                console.error('An Error Happened1', error.message);
                return []; // Handle error, optionally return an empty observable
              }),
            )
            .subscribe({
              next: (response) => response,
              error: (err) => console.error('HTTP request failed:', err),
            });
        } else {
          const formattedDate = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).format(new Date());
          this.httpService
            .post(process.env.sheetLink, {
              section: 'competition',
              date: formattedDate,
              email: user.email,
              phone: user.phone,
              countryCode: user.countryCode,
              fname: user.fname,
              lname: user.lname,
              whatsappCountryCode: user.Meta[0]?.whatsappCountryCode,
              whatsappNumber: user.Meta[0]?.whatsappNumber,
              verification: registerAuthDto.verificationMode,
            })
            .pipe(
              catchError((error: AxiosError) => {
                console.error('An Error Happened1', error.message);
                return [];
              }),
            )
            .subscribe({
              next: (response) => response,
              error: (err) => console.error('HTTP request failed:', err),
            });
        }
      }
      let unverified;
      let resend_token: string;
      switch (registerAuthDto.verificationMode) {
        case 'email':
          unverified = await this.databaseService.userUnverified.create({
            data: {
              field: 'email',
              userId: user.id,
            },
            select: {
              field: true,
            },
          });
          if (platform.origin !== null) {
            resend_token = uuidv4();

            const emailToken = uuidv4();
            const isVerify: any = await this.cacheManager.get(
              `verify_user_${user.id}`,
            );
            if (isVerify) {
              if (isVerify.resend_token) {
                await this.cacheManager.del(isVerify.resend_token);
              }
              if (isVerify.email_token) {
                await this.cacheManager.del(isVerify.email_token);
              }
            }
            await this.cacheManager.set(
              `verify_user_${user.id}`,
              {
                resend_token: resend_token,
                email_token: emailToken,
              },
              900000,
            );
            await this.cacheManager.set(
              resend_token,
              {
                userId: user.id,
                email_token: emailToken,
                platformid: req.platformid,
                path: 'email_resend',
              },
              900000,
            );
            await this.cacheManager.set(
              emailToken,
              { userId: user.id, platformid: req.platformid, path: 'email' },
              900000,
            );
            const verifcationTemplate =
              await this.databaseService.platformTemplate.findFirst({
                where: {
                  platformId: req.platformid,
                  name: 'Email Verification',
                },
                include: {
                  Platform: true,
                },
              });
            if (verifcationTemplate) {
              if (verifcationTemplate.Platform.origin !== null) {
                const token =
                  verifcationTemplate.Platform.origin +
                  '/verify-email?student=' +
                  emailToken;
                await this.emailService.sendVefificationEmail(
                  user.email,
                  'Verify Your Email',
                  token,
                  user.fname,
                  Number(verifcationTemplate.templateId),
                  verifcationTemplate.senderName,
                  verifcationTemplate.senderEmail,
                );
              }
            }
          } else {
            resend_token = uuidv4();
            const generator = new GenerateOtp();
            const emailToken = generator.generate().toString();
            const isVerify: any = await this.cacheManager.get(
              `verify_user_${user.id}`,
            );
            if (isVerify) {
              if (isVerify.resend_token) {
                await this.cacheManager.del(isVerify.resend_token);
              }
              if (isVerify.email_token) {
                await this.cacheManager.del(isVerify.email_token);
              }
            }
            await this.cacheManager.set(
              `verify_user_${user.id}`,
              {
                resend_token: resend_token,
              },
              900000,
            );
            await this.cacheManager.set(
              resend_token,
              {
                userId: user.id,
                otp: emailToken,
                platformid: req.platformid,
                path: 'whatsapp',
              },
              900000,
            );
            const verifcationTemplate =
              await this.databaseService.platformTemplate.findFirst({
                where: {
                  platformId: req.platformid,
                  name: 'Email Verification',
                },
                include: {
                  Platform: true,
                },
              });
            if (verifcationTemplate) {
              if (verifcationTemplate.Platform.origin !== null) {
                const token = emailToken;
                await this.emailService.sendVefificationEmail(
                  user.email,
                  'Verify Your Email',
                  token,
                  user.fname,
                  Number(verifcationTemplate.templateId),
                  verifcationTemplate.senderName,
                  verifcationTemplate.senderEmail,
                );
              }
            }
          }
          user.UnverifiedFields.push(unverified);
          break;
        case 'phone':
          unverified = await this.databaseService.userUnverified.create({
            data: {
              field: 'phone',
              userId: user.id,
            },
            select: {
              field: true,
            },
          });
          resend_token = uuidv4();
          const generator = new GenerateOtp();
          const userOTP = generator.generate();

          await this.cacheManager.set(
            `verify_user_${user.id}`,
            {
              resend_token: resend_token,
            },
            900000,
          );
          await this.cacheManager.set(
            resend_token,
            {
              userId: user.id,
              otp: userOTP,
              platformid: req.platformid,
              path: 'phone',
            },
            900000,
          );
          user.UnverifiedFields.push(unverified);
          break;
        case 'whatsapp':
          unverified = await this.databaseService.userUnverified.create({
            data: {
              field: 'whatsapp',
              userId: user.id,
            },
            select: {
              field: true,
            },
          });
          resend_token = uuidv4();
          const whatsappgenerator = new GenerateOtp();
          const whatsappOTP = whatsappgenerator.generate();

          await this.cacheManager.set(
            `verify_user_${user.id}`,
            {
              resend_token: resend_token,
            },
            900000,
          );
          await this.cacheManager.set(
            resend_token,
            {
              userId: user.id,
              otp: whatsappOTP,
              platformid: req.platformid,
              path: 'whatsapp',
            },
            900000,
          );
          const whatsappTemplate =
            await this.databaseService.platformTemplate.findFirst({
              where: {
                platformId: req.platformid,
                name: 'Whatsapp Verification',
              },
            });
          const whatsappNumber = user?.Meta?.whatsappNumber
            ? (user.Meta.whatsappCountryCode ?? user.countryCode) +
              user.Meta.whatsappNumber
            : user.countryCode + user.phone;

          if (whatsappTemplate) {
            this.whatsappService.sendWhatsappMessage(
              whatsappNumber,
              user.fname + ' ' + user.lname,
              whatsappTemplate.templateId,
              [whatsappOTP.toString()],
              undefined,
              undefined,
              undefined,
              [
                {
                  type: 'button',
                  sub_type: 'url',
                  index: 0,
                  parameters: [
                    {
                      type: 'text',
                      text: whatsappOTP.toString(),
                    },
                  ],
                },
              ],
            );
          }
          user.UnverifiedFields.push(unverified);
          break;
      }
      this.leadService.checkNewSignup(user.id, req.platformid);
      return { user, resend_token };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async checkVerification(userId: number, plaformId: number) {
    const user = await this.databaseService.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        UnverifiedFields: true,
        Meta: true,
      },
    });
    if (user.UnverifiedFields.length > 0) {
      const platform = await this.databaseService.platform.findFirst({
        where: {
          id: plaformId,
        },
      });
      let resend_token;
      switch (user.UnverifiedFields[0].field) {
        case 'email':
          if (platform.origin !== null) {
            resend_token = uuidv4();

            const emailToken = uuidv4();
            const isVerify: any = await this.cacheManager.get(
              `verify_user_${user.id}`,
            );
            if (isVerify) {
              if (isVerify.resend_token) {
                await this.cacheManager.del(isVerify.resend_token);
              }
              if (isVerify.email_token) {
                await this.cacheManager.del(isVerify.email_token);
              }
            }
            await this.cacheManager.set(
              `verify_user_${user.id}`,
              {
                resend_token: resend_token,
                email_token: emailToken,
              },
              900000,
            );
            await this.cacheManager.set(
              resend_token,
              {
                userId: user.id,
                email_token: emailToken,
                platformid: plaformId,
                path: 'email_resend',
              },
              900000,
            );
            await this.cacheManager.set(
              emailToken,
              { userId: user.id, platformid: plaformId, path: 'email' },
              900000,
            );
            const verifcationTemplate =
              await this.databaseService.platformTemplate.findFirst({
                where: {
                  platformId: plaformId,
                  name: 'Email Verification',
                },
                include: {
                  Platform: true,
                },
              });
            if (verifcationTemplate) {
              if (verifcationTemplate.Platform.origin !== null) {
                const token =
                  verifcationTemplate.Platform.origin +
                  '/verify-email?student=' +
                  emailToken;
                await this.emailService.sendVefificationEmail(
                  user.email,
                  'Verify Your Email',
                  token,
                  user.fname,
                  Number(verifcationTemplate.templateId),
                  verifcationTemplate.senderName,
                  verifcationTemplate.senderEmail,
                );
              }
            }
          } else {
            resend_token = uuidv4();
            const generator = new GenerateOtp();
            const emailToken = generator.generate().toString();
            const isVerify: any = await this.cacheManager.get(
              `verify_user_${user.id}`,
            );
            if (isVerify) {
              if (isVerify.resend_token) {
                await this.cacheManager.del(isVerify.resend_token);
              }
              if (isVerify.email_token) {
                await this.cacheManager.del(isVerify.email_token);
              }
            }
            await this.cacheManager.set(
              `verify_user_${user.id}`,
              {
                resend_token: resend_token,
              },
              900000,
            );
            await this.cacheManager.set(
              resend_token,
              {
                userId: user.id,
                otp: emailToken,
                platformid: plaformId,
                path: 'whatsapp',
              },
              900000,
            );
            const verifcationTemplate =
              await this.databaseService.platformTemplate.findFirst({
                where: {
                  platformId: plaformId,
                  name: 'Email Verification',
                },
                include: {
                  Platform: true,
                },
              });
            if (verifcationTemplate) {
              if (verifcationTemplate.Platform.origin !== null) {
                const token =
                  verifcationTemplate.Platform.origin +
                  '/verify-email?student=' +
                  emailToken;
                await this.emailService.sendVefificationEmail(
                  user.email,
                  'Verify Your Email',
                  token,
                  user.fname,
                  Number(verifcationTemplate.templateId),
                  verifcationTemplate.senderName,
                  verifcationTemplate.senderEmail,
                );
              }
            }
          }
          break;
        case 'phone':
          resend_token = uuidv4();
          const generator = new GenerateOtp();
          const userOTP = generator.generate();

          await this.cacheManager.set(
            `verify_user_${user.id}`,
            {
              resend_token: resend_token,
            },
            900000,
          );
          await this.cacheManager.set(
            resend_token,
            {
              userId: user.id,
              otp: userOTP,
              platformid: plaformId,
              path: 'phone',
            },
            900000,
          );
          break;
        case 'whatsapp':
          resend_token = uuidv4();
          const whatsappgenerator = new GenerateOtp();
          const whatsappOTP = whatsappgenerator.generate();
          const isVerify: any = await this.cacheManager.get(
            `verify_user_${user.id}`,
          );
          if (isVerify) {
            if (isVerify.resend_token) {
              await this.cacheManager.del(isVerify.resend_token);
            }
            if (isVerify.email_token) {
              await this.cacheManager.del(isVerify.email_token);
            }
          }
          await this.cacheManager.set(
            `verify_user_${user.id}`,
            {
              resend_token: resend_token,
            },
            900000,
          );
          await this.cacheManager.set(
            resend_token,
            {
              userId: user.id,
              otp: whatsappOTP,
              platformid: plaformId,
              path: 'whatsapp',
            },
            900000,
          );
          const whatsappTemplate =
            await this.databaseService.platformTemplate.findFirst({
              where: {
                platformId: plaformId,
                name: 'Whatsapp Verification',
              },
            });
          const whatsappNumber = user?.Meta?.whatsappNumber
            ? (user.Meta.whatsappCountryCode ?? user.countryCode) +
              user.Meta.whatsappNumber
            : user.countryCode + user.phone;

          if (whatsappTemplate) {
            this.whatsappService.sendWhatsappMessage(
              whatsappNumber,
              user.fname + ' ' + user.lname,
              whatsappTemplate.templateId,
              [whatsappOTP.toString()],
              undefined,
              undefined,
              undefined,
              [
                {
                  type: 'button',
                  sub_type: 'url',
                  index: 0,
                  parameters: [
                    {
                      type: 'text',
                      text: whatsappOTP.toString(),
                    },
                  ],
                },
              ],
            );
          }
          break;
        case 'undefined':
          resend_token = uuidv4();
          await this.cacheManager.set(
            `verify_user_${user.id}`,
            {
              resend_token: resend_token,
            },
            900000,
          );
          await this.cacheManager.set(
            resend_token,
            {
              platformid: plaformId,
              path: 'undefined',
              userId: user.id,
            },
            900000,
          );
          break;
      }

      throw new ForbiddenException({
        message: `${user.UnverifiedFields[0].field} is not verified!`,
        resend_token,
      });
    }
    return true;
  }

  async loginOTP(loginOtpDto: LoginOtpDto, platformid: number) {
    const user = await this.databaseService.user.findFirst({
      where: {
        OR: [{ email: loginOtpDto.email }, { phone: loginOtpDto.phone }],
      },
      include: {
        UnverifiedFields: true,
      },
    });
    if (!user) {
      return new NotFoundException('User not found');
    }

    const generator = new GenerateOtp();
    const userOTP = generator.generate();

    await this.cacheManager.set(
      `user_login_otp_${user.email}`,
      {
        otp: userOTP,
      },
      900000,
    );
    return { message: 'otp sent succesfully' };
  }

  async giveUser(userId: number, platformId: number, deviceId?: string) {
    const platfromHaveMultipleLogins =
      await this.databaseService.platformOptions.findFirst({
        where: {
          platformId: platformId,
          key: 'AllowMultipleLogin',
        },
      });
    const user = await this.databaseService.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        fname: true,
        lname: true,
        email: true,
        phone: true,
        countryCode: true,
        profile: true,
        Meta: true,
      },
    });
    const doesNeedDeviceId =
      await this.databaseService.platformOptions.findFirst({
        where: {
          platformId: platformId,
          key: 'isDevice',
        },
      });
    if (doesNeedDeviceId) {
      if (!deviceId) {
        const deviceIdRequiredMessage =
          await this.databaseService.platformOptions.findFirst({
            where: {
              platformId: platformId,
              key: 'DeviceIdRequiredMessage',
            },
          });
        throw new BadRequestException({
          message: 'Device Id is required!',
          helpNumbers: deviceIdRequiredMessage?.valueJson,
        });
      }
      const userDevice = await this.databaseService.userDevice.findFirst({
        where: {
          deviceId: deviceId,
        },
      });
      if (!userDevice) {
        const deviceNotRegisteredMessage =
          await this.databaseService.platformOptions.findFirst({
            where: {
              platformId: platformId,
              key: 'DeviceNotRegisteredMessage',
            },
          });
        throw new NotFoundException({
          message: 'Device not registered',
          helpNumbers: deviceNotRegisteredMessage?.valueJson,
        });
      }
      const userToDevice = await this.databaseService.userToDevice.findFirst({
        where: {
          userId: user.id,
          UserDevice: {
            platformId: platformId,
          },
        },
        include: {
          UserDevice: true,
        },
      });
      if (userToDevice) {
        if (userToDevice.UserDevice.deviceId !== deviceId) {
          const deviceAllowedMessage =
            await this.databaseService.platformOptions.findFirst({
              where: {
                platformId: platformId,
                key: 'DeviceNotAllowedMessage',
              },
            });
          throw new UnauthorizedException({
            message: 'Already logged in from another device!',
            helpNumbers: deviceAllowedMessage?.valueJson,
          });
        }
      } else {
        await this.databaseService.userToDevice.create({
          data: {
            userId: user.id,
            deviceId: userDevice.id,
          },
        });
      }
    }
    const payload = {
      userId: userId,
      platformId: platformId,
    };
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = uuidv4();
    let refreshTokenInDatabase;
    if (!platfromHaveMultipleLogins) {
      refreshTokenInDatabase =
        await this.databaseService.userRefreshToken.findFirst({
          where: {
            userId: user.id,
            platformId: platformId,
          },
        });
      if (refreshTokenInDatabase) {
        refreshTokenInDatabase =
          await this.databaseService.userRefreshToken.delete({
            where: {
              token: refreshTokenInDatabase.token,
            },
          });
      }
    }
    refreshTokenInDatabase = await this.databaseService.userRefreshToken.create(
      {
        data: {
          token: refresh_token,
          userId: user.id,
          platformId: platformId,
        },
      },
    );
    const usertoCourseArrayIds = await this.userCourseArray(
      user.id,
      platformId,
    );
    await this.cacheManager.set(
      `courses_${user.id}_${platformId}`,
      usertoCourseArrayIds,
      259200000,
    );
    return { access_token, user, refresh_token };
  }

  async oauth(platformId: number, userId: number, platformName: string) {
    const canGiveAuth = await this.databaseService.platformOptions.findFirst({
      where: {
        platformId: platformId,
        key: 'AllowGiveOauth',
      },
    });
    if (!canGiveAuth) {
      throw new ForbiddenException('Oauth is not allowed for this platform');
    }
    const canRecieveAuth = await this.databaseService.platformOptions.findFirst(
      {
        where: {
          Platform: {
            name: platformName,
          },
          key: 'AllowRecieveOauth',
        },
        include: {
          Platform: true,
        },
      },
    );
    if (!canRecieveAuth) {
      throw new ForbiddenException('Oauth is not allowed for this platform');
    }
    const giveUser = await this.giveUser(userId, canRecieveAuth.platformId);
    if (!giveUser) {
      throw new NotFoundException('User not found');
    }
    return { giveUser, redirect: canRecieveAuth.Platform.origin };
  }

  async userCourseArray(userId: number, plaformId: number): Promise<number[]> {
    const userToCourse = await this.databaseService.userToCourse.findMany({
      where: {
        userId: userId,
        Course: {
          OR: [
            {
              Platform: {
                some: {
                  platformId: plaformId,
                },
              },
            },
            {
              Course: {
                OR: [
                  {
                    Platform: {
                      some: {
                        platformId: plaformId,
                      },
                    },
                  },
                  {
                    Course: {
                      OR: [
                        {
                          Platform: {
                            some: {
                              platformId: plaformId,
                            },
                          },
                        },
                        {
                          Course: {
                            OR: [
                              {
                                Platform: {
                                  some: {
                                    platformId: plaformId,
                                  },
                                },
                              },
                              {
                                Course: {
                                  Platform: {
                                    some: {
                                      platformId: plaformId,
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
        Course: {
          include: {
            Options: {
              where: {
                key: 'isEnrollable',
              },
            },
          },
        },
      },
    });
    const courseIdArray = [];
    for (const userCourse of userToCourse) {
      const courseResult = await this.getCourse(userCourse.courseId);
      const hasIsEnrollableOption = userCourse.Course.Options.length > 0;
      if (hasIsEnrollableOption) {
        courseIdArray.push(courseResult ? courseResult : userCourse.courseId);
      } else {
        courseIdArray.push(courseResult ? -courseResult : -userCourse.courseId);
      }
    }
    return courseIdArray;
  }

  async getCourse(courseId: number) {
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
      return await this.getCourse(course.Course.id);
    }
  }

  async checkuser(platformid: number, loginOtpDto: LoginOtpDto) {
    const isDeviceIdRequired =
      await this.databaseService.platformOptions.findFirst({
        where: {
          key: 'DeviceIdRequired',
          platformId: platformid,
        },
      });
    if (isDeviceIdRequired) {
      if (!loginOtpDto.deviceId) {
        throw new BadRequestException('Device Id is required!');
      }
      const user = await this.databaseService.user.findFirst({
        where: {
          OR: [{ email: loginOtpDto.email }, { phone: loginOtpDto.phone }],
        },
        include: {
          UnverifiedFields: true,
        },
      });
      if (!user) {
        const userNotFoundMessage =
          await this.databaseService.platformOptions.findFirst({
            where: {
              platformId: platformid,
              key: 'UserNotFoundMessage',
            },
          });
        throw new NotFoundException({
          message: 'User not found',
          helpNumbers: userNotFoundMessage?.valueJson,
        });
      }
      const userDevice = await this.databaseService.userDevice.findFirst({
        where: {
          deviceId: loginOtpDto.deviceId,
        },
      });
      if (!userDevice) {
        throw new NotFoundException('Device not registered');
      }
      const userToDevice = await this.databaseService.userToDevice.findFirst({
        where: {
          userId: user.id,
          UserDevice: {
            platformId: platformid,
          },
        },
        include: {
          UserDevice: true,
        },
      });
      if (userToDevice) {
        if (userToDevice.UserDevice.deviceId !== loginOtpDto.deviceId) {
          throw new UnauthorizedException(
            'Already logged in from another device!',
          );
        }
      }
      return {
        message: 'User exists within our database',
        phone: user.phone,
        email: user.email,
      };
    }
    const user = await this.databaseService.user.findFirst({
      where: {
        OR: [{ email: loginOtpDto.email }, { phone: loginOtpDto.phone }],
      },
      include: {
        UnverifiedFields: true,
      },
    });
    if (!user) {
      const userNotFoundMessage =
        await this.databaseService.platformOptions.findFirst({
          where: {
            platformId: platformid,
            key: 'UserNotFoundMessage',
          },
        });
      throw new NotFoundException({
        message: 'User not found',
        helpNumbers: userNotFoundMessage?.valueJson,
      });
    }
    return {
      message: 'User exists within our database',
      phone: user.phone,
      email: user.email,
    };
  }

  async refreshtoken(refreshTokenDto: RefreshTokenDto, req: CustomRequest) {
    let token = await this.databaseService.userRefreshToken.findFirst({
      where: {
        token: refreshTokenDto.token,
        platformId: req.platformid,
      },
    });

    console.log('token', token);
    console.log('refreshTokenDto', refreshTokenDto.token);

    if (!token) {
      throw new UnauthorizedException('Invalid Token!');
    }
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    token = await this.databaseService.userRefreshToken.delete({
      where: {
        token: refreshTokenDto.token,
      },
    });
    if (token.createdAt < oneMonthAgo) {
      throw new UnauthorizedException('Token has expired!');
    }
    const response = await this.giveUser(
      token.userId,
      req.platformid,
      refreshTokenDto.deviceId,
    );
    return response;
  }

  //#region Verification
  async verifyuser(verifyTokenDto: VerifyTokenDto, req: CustomRequest) {
    const token: any = await this.cacheManager.get(verifyTokenDto.token);

    if (!token) {
      throw new UnauthorizedException('Invalid token!');
    }
    if (token.platformid != req.platformid) {
      throw new UnauthorizedException('Invalid token!');
    }
    if (token.path === 'email') {
      const isVerify: any = await this.cacheManager.get(
        `verify_user_${token.userId}`,
      );
      if (isVerify) {
        if (isVerify.resend_token) {
          await this.cacheManager.del(isVerify.resend_token);
        }
        if (isVerify.email_token) {
          await this.cacheManager.del(isVerify.email_token);
        }
      }
      await this.cacheManager.del(`verify_user_${token.userId}`);
      await this.databaseService.userUnverified.deleteMany({
        where: {
          userId: Number(token.userId),
        },
      });
    } else if (token.path === 'phone') {
      if (verifyTokenDto.otp !== token.otp) {
        throw new UnauthorizedException('OTP is incorrect!');
      }
      const isVerify: any = await this.cacheManager.get(
        `verify_user_${token.userId}`,
      );
      if (isVerify) {
        if (isVerify.resend_token) {
          await this.cacheManager.del(isVerify.resend_token);
        }
        if (isVerify.email_token) {
          await this.cacheManager.del(isVerify.email_token);
        }
      }
      await this.cacheManager.del(`verify_user_${token.userId}`);
      await this.databaseService.userUnverified.deleteMany({
        where: {
          userId: Number(token.userId),
        },
      });
    } else if (token.path === 'whatsapp') {
      if (verifyTokenDto.otp !== token.otp) {
        throw new UnauthorizedException('OTP is incorrect!');
      }
      const isVerify: any = await this.cacheManager.get(
        `verify_user_${token.userId}`,
      );
      if (isVerify) {
        if (isVerify.resend_token) {
          await this.cacheManager.del(isVerify.resend_token);
        }
        if (isVerify.email_token) {
          await this.cacheManager.del(isVerify.email_token);
        }
      }
      await this.cacheManager.del(`verify_user_${token.userId}`);
      await this.databaseService.userUnverified.deleteMany({
        where: {
          userId: Number(token.userId),
        },
      });
    } else {
      throw new UnauthorizedException('Invalid token!');
    }
    const response = await this.giveUser(
      token.userId,
      req.platformid,
      verifyTokenDto.deviceId,
    );
    const user = response.user;
    const platformTemplate =
      await this.databaseService.platformTemplate.findFirst({
        where: {
          platformId: req.platformid,
          name: 'Welcome Mail',
        },
        include: {
          Platform: true,
        },
      });
    if (platformTemplate) {
      this.emailService.sendWelcomeEmail(
        user.email,
        user.fname,
        Number(platformTemplate.templateId),
        platformTemplate.senderName,
        platformTemplate.senderEmail,
      );
    }
    const whatsappTemplate =
      await this.databaseService.platformTemplate.findFirst({
        where: {
          platformId: req.platformid,
          name: 'Welcome Whatsapp',
        },
      });
    const whatsappNumber = user?.Meta?.whatsappNumber
      ? (user.Meta.whatsappCountryCode ?? user.countryCode) +
        user.Meta.whatsappNumber
      : user.countryCode + user.phone;

    if (whatsappTemplate) {
      this.whatsappService.sendWhatsappMessage(
        whatsappNumber,
        user.fname + ' ' + user.lname,
        whatsappTemplate.templateId,
        [user.fname],
      );
    }
    const userMetaPassword =
      await this.databaseService.userMetaHistory.findFirst({
        where: {
          userId: user.id,
          field: 'password',
        },
      });
    if (userMetaPassword) {
      await this.databaseService.userMetaHistory.delete({
        where: {
          id: userMetaPassword.id,
        },
      });
      //todo: Mail Send Flow
    }
    return response;
  }

  async resendtoken(token: any, platformid: number) {
    if (!token) {
      throw new BadRequestException('Token is required!');
    }
    const Token: any = await this.cacheManager.get(token);
    const resend_token = uuidv4();
    const emailToken = uuidv4();
    if (!Token) {
      throw new UnauthorizedException('Invalid Token!');
    }
    if (Token.platformid !== platformid) {
      throw new UnauthorizedException('Invalid Token');
    }
    const user = await this.databaseService.user.findFirst({
      where: {
        id: Token.userId,
      },
      include: {
        Meta: true,
      },
    });
    if (Token.path === 'email_resend') {
      const isVerify: any = await this.cacheManager.get(
        `verify_user_${Token.userId}`,
      );
      if (isVerify) {
        if (isVerify.resend_token) {
          await this.cacheManager.del(isVerify.resend_token);
        }
        if (isVerify.email_token) {
          await this.cacheManager.del(isVerify.email_token);
        }
      }
      await this.cacheManager.set(
        `verify_user_${Token.userId}`,
        {
          resend_token: resend_token,
          email_token: emailToken,
        },
        900000,
      );
      await this.cacheManager.set(
        resend_token,
        {
          userId: Token.userId,
          email_token: emailToken,
          platformid: platformid,
          path: 'email_resend',
        },
        900000,
      );
      await this.cacheManager.set(
        emailToken,
        { userId: Token.userId, platformid: platformid, path: 'email' },
        900000,
      );
      const verifcationTemplate =
        await this.databaseService.platformTemplate.findFirst({
          where: {
            platformId: platformid,
            name: 'Email Verification',
          },
          include: {
            Platform: true,
          },
        });
      if (verifcationTemplate) {
        if (verifcationTemplate.Platform.origin !== null) {
          const token =
            verifcationTemplate.Platform.origin +
            '/verify-email?student=' +
            emailToken;
          await this.emailService.sendVefificationEmail(
            user.email,
            'Verify Your Email',
            token,
            user.fname,
            Number(verifcationTemplate.templateId),
            verifcationTemplate.senderName,
            verifcationTemplate.senderEmail,
          );
        }
      }
      return { message: 'email resent succesfully', resend_token };
    } else if (Token.path === 'phone') {
      const isVerify: any = await this.cacheManager.get(
        `verify_user_${Token.userId}`,
      );
      if (isVerify) {
        if (isVerify.resend_token) {
          await this.cacheManager.del(isVerify.resend_token);
        }
        if (isVerify.email_token) {
          await this.cacheManager.del(isVerify.email_token);
        }
      }
      await this.cacheManager.set(
        `verify_user_${Token.userId}`,
        {
          resend_token: resend_token,
        },
        900000,
      );
      const generator = new GenerateOtp();
      const userOTP = generator.generate();
      await this.cacheManager.set(
        resend_token,
        {
          userId: Token.userId,
          otp: userOTP,
          platformid: platformid,
          path: 'phone',
        },
        900000,
      );
      return { message: 'OTP sent succesfully', resend_token };
    } else if (Token.path === 'whatsapp') {
      const isVerify: any = await this.cacheManager.get(
        `verify_user_${Token.userId}`,
      );
      if (isVerify) {
        if (isVerify.resend_token) {
          await this.cacheManager.del(isVerify.resend_token);
        }
        if (isVerify.email_token) {
          await this.cacheManager.del(isVerify.email_token);
        }
      }
      await this.cacheManager.set(
        `verify_user_${Token.userId}`,
        {
          resend_token: resend_token,
        },
        900000,
      );
      const generator = new GenerateOtp();
      const userOTP = generator.generate();
      await this.cacheManager.set(
        resend_token,
        {
          userId: Token.userId,
          otp: userOTP,
          platformid: platformid,
        },
        900000,
      );
      const whatsappTemplate =
        await this.databaseService.platformTemplate.findFirst({
          where: {
            platformId: platformid,
            name: 'Whatsapp Verification',
          },
        });
      const whatsappNumber = user?.Meta?.whatsappNumber
        ? (user.Meta.whatsappCountryCode ?? user.countryCode) +
          user.Meta.whatsappNumber
        : user.countryCode + user.phone;

      if (whatsappTemplate) {
        this.whatsappService.sendWhatsappMessage(
          whatsappNumber,
          user.fname + ' ' + user.lname,
          whatsappTemplate.templateId,
          [userOTP.toString()],
          undefined,
          undefined,
          undefined,
          [
            {
              type: 'button',
              sub_type: 'url',
              index: 0,
              parameters: [
                {
                  type: 'text',
                  text: userOTP.toString(),
                },
              ],
            },
          ],
        );
      }
      return { message: 'OTP sent succesfully', resend_token };
    }
  }

  async changeVerification(
    changeVerificationDto: ChangeVerficationDTO,
    plaformId: number,
  ) {
    const token: any = await this.cacheManager.get(changeVerificationDto.token);
    if (!token) {
      throw new UnauthorizedException('Invalid Token!');
    }
    if (
      token.path != 'phone' &&
      token.path != 'whatsapp' &&
      token.path != 'email_resend' &&
      token.path != 'undefined'
    ) {
      throw new UnauthorizedException('Invalid Token!');
    }
    if (token.platformid !== plaformId) {
      throw new UnauthorizedException('Invalid Token!');
    }

    const user = await this.databaseService.user.findFirst({
      where: {
        id: token.userId,
      },
      include: {
        UnverifiedFields: true,
        Meta: true,
      },
    });
    const verifyusertokn: any = await this.cacheManager.get(
      `verify_user_${user.id}`,
    );
    if (verifyusertokn) {
      if (verifyusertokn.resend_token) {
        await this.cacheManager.del(verifyusertokn.resend_token);
      }
      if (verifyusertokn.email_token) {
        await this.cacheManager.del(verifyusertokn.email_token);
      }
    }
    await this.databaseService.userUnverified.deleteMany({
      where: {
        userId: user.id,
      },
    });
    let resend_token;
    switch (changeVerificationDto.verificationmode) {
      case 'email':
        await this.databaseService.userUnverified.create({
          data: {
            field: 'email',
            userId: user.id,
          },
          select: {
            field: true,
          },
        });
        resend_token = uuidv4();
        const emailToken = uuidv4();
        await this.cacheManager.set(
          `verify_user_${user.id}`,
          {
            resend_token: resend_token,
            email_token: emailToken,
          },
          900000,
        );
        await this.cacheManager.set(
          resend_token,
          {
            userId: user.id,
            email_token: emailToken,
            platformid: plaformId,
            path: 'email_resend',
          },
          900000,
        );
        await this.cacheManager.set(
          emailToken,
          { userId: user.id, platformid: plaformId, path: 'email' },
          900000,
        );
        const verifcationTemplate =
          await this.databaseService.platformTemplate.findFirst({
            where: {
              platformId: plaformId,
              name: 'Email Verification',
            },
            include: {
              Platform: true,
            },
          });
        if (verifcationTemplate) {
          if (verifcationTemplate.Platform.origin !== null) {
            const token =
              verifcationTemplate.Platform.origin +
              '/verify-email?student=' +
              emailToken;
            await this.emailService.sendVefificationEmail(
              user.email,
              'Verify Your Email',
              token,
              user.fname,
              Number(verifcationTemplate.templateId),
              verifcationTemplate.senderName,
              verifcationTemplate.senderEmail,
            );
          }
        }
        break;
      case 'phone':
        await this.databaseService.userUnverified.create({
          data: {
            field: 'phone',
            userId: user.id,
          },
          select: {
            field: true,
          },
        });
        resend_token = uuidv4();
        const generator = new GenerateOtp();
        const userOTP = generator.generate();

        await this.cacheManager.set(
          `verify_user_${user.id}`,
          {
            resend_token: resend_token,
          },
          900000,
        );
        await this.cacheManager.set(
          resend_token,
          {
            userId: user.id,
            otp: userOTP,
            platformid: plaformId,
            path: 'phone',
          },
          900000,
        );
        break;
      case 'whatsapp':
        const isVerify: any = await this.cacheManager.get(
          `verify_user_${token.userId}`,
        );
        if (isVerify) {
          if (isVerify.resend_token) {
            await this.cacheManager.del(isVerify.resend_token);
          }
          if (isVerify.email_token) {
            await this.cacheManager.del(isVerify.email_token);
          }
        }
        await this.cacheManager.set(
          `verify_user_${token.userId}`,
          {
            resend_token: resend_token,
          },
          900000,
        );
        const whatsappgenerator = new GenerateOtp();
        const whatsappOTP = whatsappgenerator.generate();
        await this.cacheManager.set(
          resend_token,
          {
            userId: token.userId,
            otp: whatsappOTP,
            platformid: plaformId,
          },
          900000,
        );
        const whatsappTemplate =
          await this.databaseService.platformTemplate.findFirst({
            where: {
              platformId: plaformId,
              name: 'Whatsapp Verification',
            },
          });
        const whatsappNumber = user?.Meta?.whatsappNumber
          ? (user.Meta.whatsappCountryCode ?? user.countryCode) +
            user.Meta.whatsappNumber
          : user.countryCode + user.phone;

        if (whatsappTemplate) {
          this.whatsappService.sendWhatsappMessage(
            whatsappNumber,
            user.fname + ' ' + user.lname,
            whatsappTemplate.templateId,
            [whatsappOTP.toString()],
            undefined,
            undefined,
            undefined,
            [
              {
                type: 'button',
                sub_type: 'url',
                index: 0,
                parameters: [
                  {
                    type: 'text',
                    text: userOTP.toString(),
                  },
                ],
              },
            ],
          );
        }
    }
    user.UnverifiedFields.push();
    return {
      message: `${user.UnverifiedFields[0].field} is not verified!`,
      resend_token,
    };
  }
  //#endregion

  //#region Forgot Password
  async resetPassword(platformId: number, resetPasswordDto: ResetPasswordDto) {
    const token: any = await this.cacheManager.get(resetPasswordDto.token);
    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }
    if (token.platformId !== platformId) {
      throw new UnauthorizedException('Invalid token');
    }
    if (token.path !== 'reset_password') {
      throw new UnauthorizedException('Invalid token');
    }
    const user = await this.databaseService.user.findFirst({
      where: {
        id: token.userId,
      },
      include: {
        UnverifiedFields: true,
        Meta: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.UnverifiedFields.length > 0) {
      let resend_token;
      switch (user.UnverifiedFields[0].field) {
        case 'email':
          resend_token = uuidv4();
          const emailToken = uuidv4();
          const isVerify: any = await this.cacheManager.get(
            `verify_user_${user.id}`,
          );
          if (isVerify) {
            if (isVerify.resend_token) {
              await this.cacheManager.del(isVerify.resend_token);
            }
            if (isVerify.email_token) {
              await this.cacheManager.del(isVerify.email_token);
            }
          }
          await this.cacheManager.set(
            `verify_user_${user.id}`,
            {
              resend_token: resend_token,
              email_token: emailToken,
            },
            900000,
          );
          await this.cacheManager.set(
            resend_token,
            {
              userId: user.id,
              email_token: emailToken,
              platformid: platformId,
              path: 'email_resend',
            },
            900000,
          );
          await this.cacheManager.set(
            emailToken,
            { userId: user.id, platformid: platformId, path: 'email' },
            900000,
          );
          const verifcationTemplate =
            await this.databaseService.platformTemplate.findFirst({
              where: {
                platformId: platformId,
                name: 'Email Verification',
              },
              include: {
                Platform: true,
              },
            });
          if (verifcationTemplate) {
            if (verifcationTemplate.Platform.origin !== null) {
              const token =
                verifcationTemplate.Platform.origin +
                '/verify-email?student=' +
                emailToken;
              await this.emailService.sendVefificationEmail(
                user.email,
                'Reset Your Password',
                token,
                user.fname,
                Number(verifcationTemplate.templateId),
                verifcationTemplate.senderName,
                verifcationTemplate.senderEmail,
              );
            }
          }
          break;
        case 'phone':
          resend_token = uuidv4();
          const generator = new GenerateOtp();
          const userOTP = generator.generate();

          await this.cacheManager.set(
            `verify_user_${user.id}`,
            {
              resend_token: resend_token,
            },
            900000,
          );
          await this.cacheManager.set(
            resend_token,
            {
              userId: user.id,
              otp: userOTP,
              platformid: platformId,
              path: 'phone',
            },
            900000,
          );
          break;
        case 'whatsapp':
          resend_token = uuidv4();
          const whatsappgenerator = new GenerateOtp();
          const whatsappOTP = whatsappgenerator.generate();

          await this.cacheManager.set(
            `verify_user_${user.id}`,
            {
              resend_token: resend_token,
            },
            900000,
          );
          await this.cacheManager.set(
            resend_token,
            {
              userId: user.id,
              otp: whatsappOTP,
              platformid: platformId,
              path: 'whatsapp',
            },
            900000,
          );
          const whatsappTemplate =
            await this.databaseService.platformTemplate.findFirst({
              where: {
                platformId: platformId,
                name: 'Whatsapp Verification',
              },
            });
          const whatsappNumber = user?.Meta?.whatsappNumber
            ? (user.Meta.whatsappCountryCode ?? user.countryCode) +
              user.Meta.whatsappNumber
            : user.countryCode + user.phone;

          if (whatsappTemplate) {
            this.whatsappService.sendWhatsappMessage(
              whatsappNumber,
              user.fname + ' ' + user.lname,
              whatsappTemplate.templateId,
              [whatsappOTP.toString()],
              undefined,
              undefined,
              undefined,
              [
                {
                  type: 'button',
                  sub_type: 'url',
                  index: 0,
                  parameters: [
                    {
                      type: 'text',
                      text: whatsappOTP.toString(),
                    },
                  ],
                },
              ],
            );
          }
          break;
        case 'undefined':
          resend_token = uuidv4();
          await this.cacheManager.set(
            `verify_user_${user.id}`,
            {
              resend_token: resend_token,
            },
            900000,
          );
          await this.cacheManager.set(
            resend_token,
            {
              platformid: platformId,
              path: 'undefined',
              userId: user.id,
            },
            900000,
          );
          break;
      }

      throw new ForbiddenException({
        message: `${user.UnverifiedFields[0].field} is not verified!`,
        resend_token,
      });
    }
    if (user.password === resetPasswordDto.password) {
      throw new BadRequestException(
        'New Password Should be different from old password',
      );
    }
    await this.databaseService.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: resetPasswordDto.password,
      },
    });
    await this.cacheManager.del(`reset_password_${user.id}`);
    await this.cacheManager.del(resetPasswordDto.token);
    const response = await this.giveUser(
      user.id,
      platformId,
      resetPasswordDto.deviceId,
    );
    return { message: 'Password reset successfully', response };
  }

  async verifyForgotPassword(
    platformId: number,
    verifyTokenDto: VerifyTokenDto,
  ) {
    const platform = await this.databaseService.platform.findFirst({
      where: {
        id: platformId,
      },
    });
    if (platform.origin !== null) {
      const token: any = await this.cacheManager.get(verifyTokenDto.token);
      if (!token) {
        throw new UnauthorizedException('Invalid token');
      }
      if (token.platformId !== platformId) {
        throw new UnauthorizedException('Invalid token');
      }
      if (token.path !== 'forgot_password') {
        throw new UnauthorizedException('Invalid token');
      }
      const user = await this.databaseService.user.findFirst({
        where: {
          id: token.userId,
        },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const verifyUserToken: any = await this.cacheManager.get(
        `forgot_password_user_${user.id}`,
      );
      if (!verifyUserToken) {
        throw new UnauthorizedException('Invalid token');
      }
      if (verifyUserToken.resend_token) {
        await this.cacheManager.del(verifyUserToken.resend_token);
      }
      if (verifyUserToken.email_token) {
        await this.cacheManager.del(verifyUserToken.email_token);
      }
      const resetTokenCache: any = await this.cacheManager.get(
        `reset_password_${user.id}`,
      );
      if (resetTokenCache) {
        await this.cacheManager.del(resetTokenCache.reset_token);
      }
      const resetToken = uuidv4();
      await this.cacheManager.set(
        `reset_password_${user.id}`,
        {
          reset_token: resetToken,
        },
        900000,
      );
      await this.cacheManager.set(
        resetToken,
        { userId: user.id, path: 'reset_password', platformId: platformId },
        900000,
      );
      return { message: 'Token verified successfully', resetToken: resetToken };
    } else {
      const token: any = await this.cacheManager.get(verifyTokenDto.token);
      if (!token) {
        throw new UnauthorizedException('Invalid token');
      }
      if (token.platformId !== platformId) {
        throw new UnauthorizedException('Invalid token');
      }
      if (token.path !== 'forgot_password_resend') {
        throw new UnauthorizedException('Invalid token');
      }
      if (verifyTokenDto.otp !== token.otp) {
        throw new UnauthorizedException('Invalid OTP');
      }
      const user = await this.databaseService.user.findFirst({
        where: {
          id: token.userId,
        },
      });
      const verifyUserToken: any = await this.cacheManager.get(
        `forgot_password_user_${user.id}`,
      );
      if (!verifyUserToken) {
        throw new UnauthorizedException('Invalid token');
      }
      if (verifyUserToken.resend_token) {
        await this.cacheManager.del(verifyUserToken.resend_token);
      }
      if (verifyUserToken.email_token) {
        await this.cacheManager.del(verifyUserToken.email_token);
      }
      const resetTokenCache: any = await this.cacheManager.get(
        `reset_password_${user.id}`,
      );
      if (resetTokenCache) {
        await this.cacheManager.del(resetTokenCache.reset_token);
      }
      const resetToken = uuidv4();
      await this.cacheManager.set(
        `reset_password_${user.id}`,
        {
          reset_token: resetToken,
        },
        900000,
      );
      await this.cacheManager.set(
        resetToken,
        { userId: user.id, path: 'reset_password', platformId: platformId },
        900000,
      );
      return { message: 'Token verified successfully', resetToken: resetToken };
    }
  }

  async forgotPassword(platformId: number, loginOtpDto: LoginOtpDto) {
    const user = await this.databaseService.user.findFirst({
      where: {
        OR: [
          {
            email: {
              equals: loginOtpDto.email,
              mode: 'insensitive',
            },
          },
          { phone: loginOtpDto.phone },
        ],
      },
      include: {
        Meta: true,
        UnverifiedFields: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.UnverifiedFields.length > 0) {
      let resend_token;
      switch (user.UnverifiedFields[0].field) {
        case 'email':
          resend_token = uuidv4();
          const emailToken = uuidv4();
          const isVerify: any = await this.cacheManager.get(
            `verify_user_${user.id}`,
          );
          if (isVerify) {
            if (isVerify.resend_token) {
              await this.cacheManager.del(isVerify.resend_token);
            }
            if (isVerify.email_token) {
              await this.cacheManager.del(isVerify.email_token);
            }
          }
          await this.cacheManager.set(
            `verify_user_${user.id}`,
            {
              resend_token: resend_token,
              email_token: emailToken,
            },
            900000,
          );
          await this.cacheManager.set(
            resend_token,
            {
              userId: user.id,
              email_token: emailToken,
              platformid: platformId,
              path: 'email_resend',
            },
            900000,
          );
          await this.cacheManager.set(
            emailToken,
            { userId: user.id, platformid: platformId, path: 'email' },
            900000,
          );
          const verifcationTemplate =
            await this.databaseService.platformTemplate.findFirst({
              where: {
                platformId: platformId,
                name: 'Email Forget Password',
              },
              include: {
                Platform: true,
              },
            });
          if (verifcationTemplate) {
            if (verifcationTemplate.Platform.origin !== null) {
              const token =
                verifcationTemplate.Platform.origin +
                '/verify-email?student=' +
                emailToken;
              await this.emailService.sendVefificationEmail(
                user.email,
                'Reset Your Password',
                token,
                user.fname,
                Number(verifcationTemplate.templateId),
                verifcationTemplate.senderName,
                verifcationTemplate.senderEmail,
              );
            }
          }
          break;
        case 'phone':
          resend_token = uuidv4();
          const generator = new GenerateOtp();
          const userOTP = generator.generate();

          await this.cacheManager.set(
            `verify_user_${user.id}`,
            {
              resend_token: resend_token,
            },
            900000,
          );
          await this.cacheManager.set(
            resend_token,
            {
              userId: user.id,
              otp: userOTP,
              platformid: platformId,
              path: 'phone',
            },
            900000,
          );
          break;
        case 'whatsapp':
          resend_token = uuidv4();
          const whatsappgenerator = new GenerateOtp();
          const whatsappOTP = whatsappgenerator.generate();

          await this.cacheManager.set(
            `verify_user_${user.id}`,
            {
              resend_token: resend_token,
            },
            900000,
          );
          await this.cacheManager.set(
            resend_token,
            {
              userId: user.id,
              otp: whatsappOTP,
              platformid: platformId,
              path: 'whatsapp',
            },
            900000,
          );
          const whatsappTemplate =
            await this.databaseService.platformTemplate.findFirst({
              where: {
                platformId: platformId,
                name: 'Whatsapp Verification',
              },
            });
          const whatsappNumber = user?.Meta?.whatsappNumber
            ? (user.Meta.whatsappCountryCode ?? user.countryCode) +
              user.Meta.whatsappNumber
            : user.countryCode + user.phone;

          if (whatsappTemplate) {
            this.whatsappService.sendWhatsappMessage(
              whatsappNumber,
              user.fname + ' ' + user.lname,
              whatsappTemplate.templateId,
              [whatsappOTP.toString()],
              undefined,
              undefined,
              undefined,
              [
                {
                  type: 'button',
                  sub_type: 'url',
                  index: 0,
                  parameters: [
                    {
                      type: 'text',
                      text: whatsappOTP.toString(),
                    },
                  ],
                },
              ],
            );
          }
          break;
        case 'undefined':
          resend_token = uuidv4();
          await this.cacheManager.set(
            `verify_user_${user.id}`,
            {
              resend_token: resend_token,
            },
            900000,
          );
          await this.cacheManager.set(
            resend_token,
            {
              platformid: platformId,
              path: 'undefined',
              userId: user.id,
            },
            900000,
          );
          break;
      }

      throw new ForbiddenException({
        message: `${user.UnverifiedFields[0].field} is not verified!`,
        resend_token,
      });
    }
    const userForgotPassword: any = await this.cacheManager.get(
      `forgot_password_user_${user.id}`,
    );
    if (userForgotPassword) {
      if (userForgotPassword.resend_token) {
        await this.cacheManager.del(userForgotPassword.resend_token);
      }
      if (userForgotPassword.email_token) {
        await this.cacheManager.del(userForgotPassword.email_token);
      }
      await this.cacheManager.del(`forgot_password_user_${user.id}`);
    }
    const resend_token = uuidv4();
    const platform = await this.databaseService.platform.findFirst({
      where: {
        id: platformId,
      },
    });
    if (platform.origin !== null) {
      const emailToken = uuidv4();
      await this.cacheManager.set(
        `forgot_password_user_${user.id}`,
        {
          resend_token: resend_token,
          email_token: emailToken,
        },
        900000,
      );
      await this.cacheManager.set(
        resend_token,
        {
          userId: user.id,
          email_token: emailToken,
          platformId: platformId,
          path: 'forgot_password_resend',
        },
        900000,
      );
      await this.cacheManager.set(
        emailToken,
        { userId: user.id, platformId: platformId, path: 'forgot_password' },
        900000,
      );
      const forgotPassword =
        await this.databaseService.platformTemplate.findFirst({
          where: {
            platformId: platformId,
            name: 'Email Forget Password',
          },
        });
      if (forgotPassword) {
        const emailLandingAddress =
          platform.origin + '/resetpassword?student=' + emailToken;
        this.emailService.sendVefificationEmail(
          user.email,
          'Reset Your Password',
          emailLandingAddress,
          user.fname,
          Number(forgotPassword.templateId),
          forgotPassword.senderName,
          forgotPassword.senderEmail,
        );
      }
      const censored_email = this.censorEmail(user.email);
      return {
        message: 'Email sent successfully',
        resend_token,
        sentTo: censored_email,
      };
    } else {
      const generateOTP = new GenerateOtp();
      const otp = generateOTP.generate();
      await this.cacheManager.set(
        `forgot_password_user_${user.id}`,
        {
          resend_token: resend_token,
          otp: otp,
        },
        900000,
      );
      await this.cacheManager.set(
        resend_token,
        {
          userId: user.id,
          otp: otp,
          platformId: platformId,
          path: 'forgot_password_resend',
        },
        900000,
      );
      return { message: 'OTP sent successfully', resend_token };
    }
  }

  censorEmail(email: string): string {
    const emailParts = email.split('@');
    const localPart = emailParts[0];
    const domainPart = emailParts[1];
    if (localPart.length > 4) {
      const visiblePart = localPart.substring(0, 4);
      const censoredPart = '*'.repeat(localPart.length - 4);
      return visiblePart + censoredPart + '@' + domainPart;
    } else {
      return '*'.repeat(localPart.length) + '@' + domainPart;
    }
  }

  async resendForgotPassword(
    platformId: number,
    verifyTokenDto: VerifyTokenDto,
  ) {
    const token: any = await this.cacheManager.get(verifyTokenDto.token);
    if (!token) {
      throw new NotFoundException('Token Not Found');
    }
    if (
      token.path !== 'forgot_password_resend' ||
      token.platformId !== platformId ||
      token.userId === undefined
    ) {
      throw new BadRequestException('Invalid Token Given');
    }
    const userForgotPassword: any = await this.cacheManager.get(
      `forgot_password_user_${token.userId}`,
    );
    if (userForgotPassword) {
      if (userForgotPassword.resend_token) {
        await this.cacheManager.del(userForgotPassword.resend_token);
      }
      if (userForgotPassword.email_token) {
        await this.cacheManager.del(userForgotPassword.email_token);
      }
      await this.cacheManager.del(`forgot_password_user_${token.userId}`);
    }
    const user = await this.databaseService.user.findFirst({
      where: {
        id: token.userId,
      },
    });
    const resend_token = uuidv4();
    const platform = await this.databaseService.platform.findFirst({
      where: {
        id: platformId,
      },
    });
    if (platform.origin !== null) {
      const emailToken = uuidv4();
      await this.cacheManager.set(
        `forgot_password_user_${token.userId}`,
        {
          resend_token: resend_token,
          email_token: emailToken,
        },
        900000,
      );
      await this.cacheManager.set(
        resend_token,
        {
          userId: token.userId,
          email_token: emailToken,
          platformId: platformId,
          path: 'forgot_password_resend',
        },
        900000,
      );
      await this.cacheManager.set(
        emailToken,
        {
          userId: token.userId,
          platformId: platformId,
          path: 'forgot_password',
        },
        900000,
      );
      const forgotPassword =
        await this.databaseService.platformTemplate.findFirst({
          where: {
            platformId: platformId,
            name: 'Email Forget Password',
          },
        });
      const emailLandingAddress =
        platform.origin + '/resetpassword?student=' + emailToken;
      this.emailService.sendVefificationEmail(
        user.email,
        'Reset Your Password',
        emailLandingAddress,
        user.fname,
        Number(forgotPassword.templateId),
        forgotPassword.senderName,
        forgotPassword.senderEmail,
      );
    } else {
      const generateOTP = new GenerateOtp();
      const otp = generateOTP.generate();
      await this.cacheManager.set(
        `forgot_password_user_${user.id}`,
        {
          resend_token: resend_token,
          otp: otp,
        },
        900000,
      );
      await this.cacheManager.set(
        resend_token,
        {
          userId: user.id,
          otp: otp,
          platformId: platformId,
          path: 'forgot_password_resend',
        },
        900000,
      );
    }
    return { message: 'Email sent successfully', resend_token };
  }
  //#endregion

  //#region websocket
  async wsLogin(client: CustomUserSocketClient, token: string) {
    if (!token) {
      client.emit('loginError', 'Token is required');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.jwtSecret,
      });
      if (payload.platformId !== client.platformId) {
        return client.emit('login-error', 'Invalid Token');
      } else {
        client.userId = payload.userId;
        client.platformId = payload.platformId;
        const platformHasCourse =
          await this.databaseService.platformOptions.findFirst({
            where: {
              platformId: payload.platformId,
              key: 'hasCourse',
            },
          });
        if (platformHasCourse) {
          const coursesIds: number[] = await this.cacheManager.get(
            `courses_${client.userId}_${client.platformId}`,
          );
          const activeCourse = await this.cacheManager.get(
            `watching_course_${client.userId}_${client.platformId}`,
          );
          const userToCourse = await this.databaseService.userToCourse.findMany(
            {
              where: {
                userId: client.userId,
                Course: {
                  OR: [
                    {
                      Platform: {
                        some: {
                          platformId: client.platformId,
                        },
                      },
                    },
                    {
                      Course: {
                        OR: [
                          {
                            Platform: {
                              some: {
                                platformId: client.platformId,
                              },
                            },
                          },
                          {
                            Course: {
                              OR: [
                                {
                                  Platform: {
                                    some: {
                                      platformId: client.platformId,
                                    },
                                  },
                                },
                                {
                                  Course: {
                                    OR: [
                                      {
                                        Platform: {
                                          some: {
                                            platformId: client.platformId,
                                          },
                                        },
                                      },
                                      {
                                        Course: {
                                          Platform: {
                                            some: {
                                              platformId: client.platformId,
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
            },
          );
          client.emit('session', {
            userToCourse,
            coursesIds,
            activeCourse: activeCourse ? activeCourse : null,
          });
        }
        await this.databaseService.userRefreshToken.updateMany({
          where: {
            userId: client.userId,
            platformId: client.platformId,
          },
          data: {
            isOnline: true,
          },
        });
        return client.emit('login-success', 'Login Successful');
      }
    } catch (error) {
      client.emit('login-error', 'Invalid Token');
    }
  }

  async wsLogout(client: CustomUserSocketClient) {
    if (!client.userId || !client.platformId) {
      return client.emit('logout-error', 'User not logged in');
    }
    await this.databaseService.userRefreshToken.updateMany({
      where: {
        userId: client.userId,
        platformId: client.platformId,
      },
      data: {
        isOnline: false,
      },
    });
    client.userId = null;
    client.platformId = null;
    return client.emit('logout-success', 'Logout Successful');
  }
  //#endregion
}
