import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { CustomRequest } from 'src/common/interface/custom-request.interface';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class PlatformCheckMiddleware implements NestMiddleware {
  constructor(private readonly databaseService: DatabaseService) {}
  async use(req: CustomRequest, res: Response, next: NextFunction) {
    const platformorigin = req.headers.origin;
    const dauth = req.headers.dauth;
    if (!platformorigin && !dauth) {
      throw new HttpException('Cors Error', HttpStatus.NOT_ACCEPTABLE);
    }
    const platform = await this.databaseService.platform.findFirst({
      where: {
        OR: [
          {
            origin: platformorigin,
          },
          {
            auth: dauth,
          },
        ],
      },
    });
    if (!platform) {
      throw new HttpException('Cors Error', HttpStatus.NOT_ACCEPTABLE);
    }
    req.platformid = platform.id;
    next();
  }
}
