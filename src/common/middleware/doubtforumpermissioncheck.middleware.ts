import {
  Injectable,
  MethodNotAllowedException,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { CustomRequest } from 'src/common/interface/custom-request.interface';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class DoubtForumPermissionCheckMiddleware implements NestMiddleware {
  constructor(private readonly databaseService: DatabaseService) {}
  async use(req: CustomRequest, res: Response, next: NextFunction) {
    const canUsePractice = await this.databaseService.platformOptions.findFirst(
      {
        where: {
          platformId: req.platformid,
          key: 'canUseDoubtForum',
        },
      },
    );
    if (!canUsePractice) {
      throw new MethodNotAllowedException(
        'Doubt Forum is not allowed on this platform',
      );
    }
    next();
  }
}
