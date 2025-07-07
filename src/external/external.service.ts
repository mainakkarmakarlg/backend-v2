import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ExternalService {
  constructor(private readonly databaseService: DatabaseService) {}
  async addUser(responseBody: any) {
    let user = await this.databaseService.user.findFirst({
      where: {
        email: responseBody.email,
      },
    });
    if (!user) {
      user = await this.databaseService.user.create({
        data: {
          fname: responseBody.fname,
          lname: responseBody.lname,
          email: responseBody.email,
          password: responseBody.password,
          phone: responseBody.phone,
          countryCode: responseBody.countryCode,
        },
      });
      const source = await this.databaseService.userMetaHistory.create({
        data: {
          userId: user.id,
          valueText: responseBody.source,
          field: 'Source',
        },
      });
    }
    return user;
  }
}
