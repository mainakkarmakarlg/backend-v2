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
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: CustomRequest = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('Token not found!');
    }
    try {
      const payload: TokenPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.jwtSecret,
      });
      req.userid = payload.userId;
      if (payload.platformId !== req.platformid) {
        throw new UnauthorizedException('Invalid Token');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid Token', error.message);
    }
    return true;
  }

  private extractTokenFromHeader(req: CustomRequest): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
