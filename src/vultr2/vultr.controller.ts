import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Get,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VultrService } from './vultr.service';
import { Response } from 'express';
import { checkimageaccess } from 'src/auth/guards/checkimageaccess.guard';
import { ImageAuthGuard } from 'src/auth/guards/imagegetauth.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('vultr')
export class VultrController {
  constructor(private readonly vultrService: VultrService) {}

  /**
   * ignore this for now
   */
  @Get('generate-url/:userId/:filePath')
  generateUrl(
    @Param('userId') userId: number,
    @Param('filePath') filePath: string,
  ) {
    const proxyUrl = this.vultrService.generateProxyUrl(filePath, userId);
    return { proxyUrl };
  }

  /**
   *
   * @param token token is really not needed because i am using useguard here in future will think of
   * @param body userid for who can access
   * @param res return an image/jpeg
   */

  // @UseGuards(checkimageaccess)
  // @Post('proxy/:token')
  // async getFile(
  //   @Param('token') token: string,
  //   @Body() body: { userId: string },
  //   @Res() res: Response,
  // ) {
  //   try {
  //     const cleanToken = token.replace('token=', '');
  //     const filePath = this.vultrService.decryptFilePath(cleanToken);
  //     const fileData = await this.vultrService.fetchFileFromVultr(filePath);
  //     console.log(fileData);

  //     res.setHeader('Content-Type', fileData.contentType || 'image/jpeg');
  //     res.setHeader('Content-Length', fileData.contentLength);

  //     if (!fileData) {
  //       throw new Error('File not found');
  //     }

  //     res.send(fileData.buffer);
  //   } catch (error) {
  //     console.error('Error fetching file from Vultr S3:', error.message);
  //     res.status(500).send('Error fetching file from Vultr S3');
  //   }
  // }

  // for reference
  @UseGuards(ImageAuthGuard)
  @Get('proxy/:token')
  async getFile(
    @Param('token') token: string,
    @Body() body: { userId: string },
    @Res() res: Response,
  ) {
    try {
      const cleanToken = token.replace('token=', '');
      const filePath = this.vultrService.decryptFilePath(
        cleanToken,
        Number(body.userId),
      );
      const fileData = await this.vultrService.fetchFileFromVultr(filePath);

      res.setHeader('Content-Type', fileData.contentType || 'image/jpeg');
      res.setHeader('Content-Length', fileData.contentLength);

      if (!fileData) {
        throw new Error('File not found');
      }

      res.send(fileData.buffer);
    } catch (error) {
      console.error('Error fetching file from Vultr S3:', error.message);
      res.status(500).send('Error fetching file from Vultr S3');
    }
  }

  /**
   *
   * @param file send original file
   * @returns will return proxy url which can give it to someone for access and the original url that is for store in the database
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const filename = file.originalname;

    await this.vultrService.uploadToVultr(filename, file);
    const proxyUrl = this.vultrService.generateProxyUrl(filename);
    const originalUrl = this.vultrService.generateOriginalUrl(filename);
    return { proxyUrl, originalUrl };
  }
}
