import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError } from 'rxjs';

@Injectable()
export class WhatsappService {
  constructor(private readonly httpService: HttpService) {}

  async sendWhatsappMessage(
    phone: string,
    username: string,
    campaignName: string,
    parameters: string[],
    source?: string,
    media?: string,
    mediafilename?: string,
    buttons?: any[],
  ) {
    const url = 'https://backend.aisensy.com/campaign/t1/api/v2';
    const data = {
      apiKey: process.env.Api_Sensei,
      campaignName: campaignName,
      destination: phone,
      userName: username,
      templateParams: parameters,
      source: source,
      media: {
        url: media,
        filename: mediafilename,
      },
      buttons: buttons,
      carouselCards: [],
      location: {},
      paramsFallbackValue: {
        FirstName: 'User',
      },
    };
    if (process.env.NODE_ENV !== 'development') {
      this.httpService
        .post(url, data)
        .pipe(
          catchError((error: AxiosError) => {
            console.error('An Error Happened16', error.message, data);
            return [];
          }),
        )
        .subscribe({
          // next: (response) => console.log('whatsappResponse',response.data),
          error: (err) => console.error(err, data),
        });
    }
  }
}
