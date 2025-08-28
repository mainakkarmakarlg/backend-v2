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

@Controller('vultr')
export class VultrController {
  constructor(private readonly vultrService: VultrService) {}

  @Get('generate-url/:filePath')
  generateUrl(@Param('filePath') filePath: string) {
    const proxyUrl = this.vultrService.generateProxyUrl(filePath);
    return { proxyUrl };
  }

  // @Get('proxy/:token')
  // async getFile(@Param('token') token: string, @Res() res: Response) {
  //   try {
  //     const cleanToken = token.replace('token=', '');
  //     console.log('Clean Token:', cleanToken);

  //     const filePath = this.vultrService.decryptFilePath(cleanToken);
  //     console.log('Decrypted File Path:', filePath);

  //     const fileData = await this.vultrService.fetchFileFromVultr(filePath);

  //     if (!fileData) {
  //       throw new Error('File not found');
  //     }

  //     if (fileData.contentType) {
  //       res.setHeader('Content-Type', fileData.contentType);
  //     }
  //     if (fileData.contentLength) {
  //       res.setHeader('Content-Length', fileData.contentLength);
  //     }

  //     res.send(fileData.buffer);
  //     console.log('File sent successfully');
  //   } catch (error) {
  //     console.error('Error fetching file from Vultr S3:', error.message);
  //     res.status(500).send('Error fetching file from Vultr S3');
  //   }
  // }

  /**
   * this for without guard
   */
  @UseGuards(checkimageaccess)
  @Post('proxy/:token')
  async getFile(
    @Param('token') token: string,
    @Body() body: { userId: string },
    @Res() res: Response,
  ) {
    try {
      const cleanToken = token.replace('token=', '');
      console.log('Clean Token:', cleanToken);
      const filePath = this.vultrService.decryptFilePath(cleanToken);
      console.log('Decrypted File Path:', filePath);
      const fileData = await this.vultrService.fetchFileFromVultr(filePath);
      console.log(fileData);

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

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const filename = file.originalname;

    await this.vultrService.uploadToVultr(filename, file);
    const proxyUrl = this.vultrService.generateProxyUrl(filename);
    return { proxyUrl };
  }
}
// vultr.controller.ts
// import { checkimageaccess } from 'src/auth/guards/checkimageaccess.guard';

// @Controller('vultr')
// export class VultrController {
//   private readonly logger = new Logger(VultrController.name);

//   constructor(private readonly vultrService: VultrService) {}

//   @Get('health')
//   healthCheck() {
//     this.logger.log('Health check called');
//     return { status: 'ok', timestamp: new Date().toISOString() };
//   }

//   // Endpoint to upload an image to S3
//   @Post('upload')
//   @UseInterceptors(FileInterceptor('file'))
//   async uploadFile(@UploadedFile() file: Express.Multer.File) {
//     this.logger.log('Upload endpoint called');

//     if (!file) {
//       throw new BadRequestException('No file uploaded');
//     }

//     try {
//       const filename = file.originalname;

//       await this.vultrService.uploadToVultr(filename, file);

//       const proxyUrl = this.vultrService.generateProxyUrl(filename);

//       this.logger.log(`File uploaded successfully: ${filename}`);
//       return { proxyUrl };
//     } catch (error) {
//       this.logger.error('Upload failed', error);
//       throw new InternalServerErrorException('Failed to upload file');
//     }
//   }

//   @Post('generate-link')
//   async generateUniqueLink(
//     @Body() body: { userId: string; imageLink: string },
//   ) {
//     const { userId, imageLink } = body;

//     try {
//       // Decrypt first, then generate token (same as validation)
//       const decryptedImagePath = this.vultrService.decryptFilePath(imageLink);
//       const token = this.vultrService.generateUniqueToken(
//         userId,
//         decryptedImagePath,
//       );

//       // Use the helper to construct URL properly
//       const secureUrl = this.vultrService.constructSecureUrl(
//         userId,
//         token,
//         imageLink,
//       );

//       console.log('Generated secure URL:', secureUrl);

//       return {
//         success: true,
//         data: {
//           userId,
//           token,
//           imageLink,
//           secureUrl,
//         },
//       };
//     } catch (error) {
//       console.error('Generate link failed:', error);
//       throw new InternalServerErrorException('Failed to generate link');
//     }
//   }

//   @UseGuards(checkimageaccess)
//   @Get('secure-image')
//   async getImage(
//     @Query('userId') userIdParam: string | string[],
//     @Query('token') tokenParam: string | string[],
//     @Query('imageLink') imageLinkParam: string | string[],
//     @Res() res: Response,
//   ) {
//     try {
//       // Extract single values from arrays if needed
//       const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
//       const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
//       const imageLink = Array.isArray(imageLinkParam)
//         ? imageLinkParam[0]
//         : imageLinkParam;

//       console.log('Parsed parameters:');
//       console.log('userId:', userId);
//       console.log('token:', token);
//       console.log('imageLink:', imageLink);

//       if (!userId || !token || !imageLink) {
//         return res.status(400).json({
//           error: 'Missing required parameters',
//           received: {
//             userId,
//             token: token ? 'present' : 'missing',
//             imageLink: imageLink ? 'present' : 'missing',
//           },
//         });
//       }

//       // Decrypt the image path
//       const decryptedImagePath = this.vultrService.decryptFilePath(imageLink);
//       console.log('Decrypted Image Path:', decryptedImagePath);

//       // Generate token for validation
//       const generatedToken = this.vultrService.generateUniqueToken(
//         userId,
//         decryptedImagePath,
//       );

//       console.log('Generated Token:', generatedToken);
//       console.log('Provided Token:', token);

//       if (generatedToken !== token) {
//         console.log('Token mismatch - Unauthorized access');
//         return res.status(403).json({ error: 'Unauthorized access' });
//       }

//       // Generate presigned URL
//       const presignedUrl =
//         await this.vultrService.generatePresignedUrl(decryptedImagePath);

//       return res.json({ presignedUrl });
//     } catch (error) {
//       console.error('Error in getImage:', error);
//       return res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// }
