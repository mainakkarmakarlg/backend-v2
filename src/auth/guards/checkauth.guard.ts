import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { CustomRequest } from 'src/common/interface/custom-request.interface';
import { TokenPayload } from '../entities/tokenpayload.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CheckAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: CustomRequest = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      req.userid = 0;
    }
    try {
      const payload: TokenPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.jwtSecret,
      });
      if (payload.platformId !== req.platformid) {
        req.userid = 0;
      }
      req.userid = payload.userId;
    } catch (error) {
      req.userid = 0;
    }
    return true;
  }

  private extractTokenFromHeader(req: CustomRequest): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
