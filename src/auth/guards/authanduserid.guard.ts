import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomRequest } from 'src/common/interface/custom-request.interface';
import { TokenPayload } from '../entities/tokenpayload.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthAndUserIdGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  private readonly users = [
    { userId: '1234' },
    { userId: '5678' },
    { userId: '7890' },
  ];

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: CustomRequest = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('Token not found!');
    }

    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.jwtSecret,
      });
      // req.userid = payload.userId;
      req.platformid = 9;
      if (payload.platformId !== req.platformid) {
        throw new UnauthorizedException('Invalid Token');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid Token', error.message);
    }

    const userIdFromBody = this.extractFromUser(req);
    if (!userIdFromBody) {
      throw new UnauthorizedException('User ID not found in request body!');
    }

    const isValidUser = this.users.some(
      (user) => user.userId === userIdFromBody,
    );
    if (!isValidUser) {
      throw new UnauthorizedException('Access denied: Invalid User ID');
    }

    return true;
  }

  private extractTokenFromHeader(req: CustomRequest): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractFromUser(req: CustomRequest): string | undefined {
    return req.body?.userId;
  }
}
