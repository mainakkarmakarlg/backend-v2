import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VultrService } from './vultr.service';
import { Response } from 'express';

@Controller('vultr')
export class VultrController {
  constructor(private readonly vultrService: VultrService) {}

  /**
   * just ignore this generateUrl function
   */
  @Get('generate-url/:filePath')
  generateUrl(@Param('filePath') filePath: string) {
    const proxyUrl = this.vultrService.generateProxyUrl(filePath);
    return { proxyUrl };
  }

  @Get('proxy/:token')
  async getFile(@Param('token') token: string, @Res() res: Response) {
    try {
      const filePath = this.vultrService.decryptFilePath(token);

      const file = await this.vultrService.fetchFileFromVultr(filePath);

      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(file);
    } catch (error) {
      console.error('Error fetching file:', error);
      res.status(500).send('Error fetching file from Vultr S3');
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const filename = file.originalname;

    await this.vultrService.uploadToVultr(filename, file);
    const proxyUrl = this.vultrService.generateProxyUrl(filename);
    return { proxyUrl };
  }
}
