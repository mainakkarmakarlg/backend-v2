import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomRequest } from 'src/common/interface/custom-request.interface';

@Injectable()
export class checkimageaccess implements CanActivate {
  private readonly users = [
    { userId: '1234' },
    { userId: '5678' },
    { userId: '7890' },
  ];

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: CustomRequest = context.switchToHttp().getRequest();
    const userId = this.extractFromUser(req);

    if (!userId) {
      throw new UnauthorizedException('User ID not found in request body!');
    }

    const isValidUser = this.users.some((user) => user.userId === userId);
    if (!isValidUser) {
      throw new UnauthorizedException('Access denied: Invalid User ID');
    }

    return true;
  }

  private extractFromUser(req: CustomRequest): string | undefined {
    return req.body?.userId;
  }
}
