import {
  ObjectCannedACL,
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scrypt,
  scryptSync,
} from 'crypto';
import { Readable } from 'stream';

@Injectable()
export class VultrService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly secretKeyForS3Image: string =
    'hruigheruihgu9038r59348ifj34ju99j49vj';

  constructor() {
    this.s3Client = new S3Client({
      endpoint: process.env.VULTR_ENDPOINT,
      region: process.env.VULTR_REGION,
      credentials: {
        accessKeyId: process.env.VULTR_ACCESS_KEY,
        secretAccessKey: process.env.VULTR_SECRET_KEY,
      },
      forcePathStyle: true,
    });
    this.bucket = process.env.VULTR_BUCKET;
  }

  encryptFilePath(filePath: string): string {
    const salt = randomBytes(16);
    const iv = randomBytes(16);
    const key = scryptSync(this.secretKeyForS3Image, salt, 32);
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(filePath, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}`;
  }

  decryptFilePath(encryptedLink: string): string {
    const [saltHex, ivHex, encrypted] = encryptedLink.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const key = scryptSync(this.secretKeyForS3Image, salt, 32);

    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async uploadToVultr(
    filename: string,
    file: Express.Multer.File,
  ): Promise<any> {
    const params = {
      Bucket: this.bucket,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: ObjectCannedACL.public_read,
    };
    try {
      const upload = new Upload({
        client: this.s3Client,
        params,
      });

      const data = await upload.done();
      return data;
    } catch (err) {
      console.error('Error uploading to Vultr S3', err);
      throw err;
    }
  }

  async deleteFromVultr(filename: string) {
    const vultrBaseUrl =
      process.env.VULTR_ENDPOINT + '/' + process.env.VULTR_BUCKET + '/';
    const file = filename.replace(vultrBaseUrl, '');
    const params = {
      Bucket: this.bucket,
      Key: file,
    };
    try {
      const command = new DeleteObjectCommand(params);
      const data = await this.s3Client.send(command);
      return data;
    } catch (err) {
      console.error('Error deleting from Vultr S3:', err);
    }
  }

  /**
   * 
   * @param filePath take file path that is original file
   * @returns it return an proxy link 
   */
  generateProxyUrl(filePath: string): string {
    const encryptedLink = this.encryptFilePath(filePath);
    return encryptedLink;
  }

  /**
   * 
   * @param filename take file path that is original image
   * @returns return the original vulture link 
   */
  generateOriginalUrl(filename: string): string {
    return `${process.env.VULTR_ENDPOINT}/${this.bucket}/${filename}`;
  }

  /**
   * to convert a readable stream
   * @param stream recived a file
   * @returns store raw binary data in a []
   */
  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async fetchFileFromVultr(filePath: string): Promise<{
    buffer: Buffer;
    contentType?: string;
    contentLength?: number;
  }> {
    const params = {
      Bucket: this.bucket,
      Key: filePath,
    };
    try {
      const command = new GetObjectCommand(params);
      const data = await this.s3Client.send(command);

      if (!data.Body) {
        throw new Error('No file content received from S3');
      }

      const buffer = await this.streamToBuffer(data.Body as Readable);

      return {
        buffer,
        contentType: data.ContentType,
        contentLength: data.ContentLength,
      };
    } catch (err) {
      console.error('Error fetching file from Vultr S3:', err);
      throw new Error('Error fetching file from Vultr S3');
    }
  }
}

// import { Injectable } from '@nestjs/common';
// import {
//   S3Client,
//   GetObjectCommand,
//   ObjectCannedACL,
// } from '@aws-sdk/client-s3';
// import { Upload } from '@aws-sdk/lib-storage';
// import * as crypto from 'crypto';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// @Injectable()
// export class VultrService {
//   private readonly s3Client: S3Client;
//   private readonly bucket: string;

//   constructor() {
//     this.s3Client = new S3Client({
//       endpoint: process.env.VULTR_ENDPOINT,
//       region: process.env.VULTR_REGION,
//       credentials: {
//         accessKeyId: process.env.VULTR_ACCESS_KEY,
//         secretAccessKey: process.env.VULTR_SECRET_KEY,
//       },
//       forcePathStyle: true,
//     });
//     this.bucket = process.env.VULTR_BUCKET;
//   }

//   async uploadToVultr(
//     filename: string,
//     file: Express.Multer.File,
//   ): Promise<any> {
//     const params = {
//       Bucket: this.bucket,
//       Key: filename,
//       Body: file.buffer,
//       ContentType: file.mimetype,
//       ACL: ObjectCannedACL.public_read,
//     };

//     try {
//       const upload = new Upload({
//         client: this.s3Client,
//         params,
//       });

//       const data = await upload.done();
//       return data;
//     } catch (err) {
//       console.error('Error uploading to Vultr S3', err);
//       throw err;
//     }
//   }

//   generateUniqueToken(userId: string, imageLink: string): string {
//     return crypto
//       .createHash('sha256')
//       .update(userId + imageLink)
//       .digest('hex');
//   }

//   async generatePresignedUrl(imageLink: string): Promise<string> {
//     const params = {
//       Bucket: this.bucket,
//       Key: imageLink,
//       Expires: 60 * 5, // URL valid for 5 minutes
//     };

//     try {
//       const command = new GetObjectCommand(params);
//       const presignedUrl = await getSignedUrl(this.s3Client, command, {
//         expiresIn: 300,
//       });
//       return presignedUrl;
//     } catch (err) {
//       console.error('Error generating presigned URL for file:', err);
//       throw new Error('Error generating presigned URL');
//     }
//   }

//   decryptFilePath(encryptedLink: string): string {
//     const [saltHex, ivHex, encrypted] = encryptedLink.split(':');
//     const salt = Buffer.from(saltHex, 'hex');
//     const iv = Buffer.from(ivHex, 'hex');
//     const key = crypto.scryptSync('secret-key', salt, 32);

//     const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
//     let decrypted = decipher.update(encrypted, 'hex', 'utf8');
//     decrypted += decipher.final('utf8');
//     return decrypted;
//   }

//   generateProxyUrl(filePath: string): string {
//     const encryptedLink = this.encryptFilePath(filePath);
//     return encryptedLink; // Return the encrypted link
//   }

//   constructSecureUrl(
//     userId: string,
//     token: string,
//     imageLink: string,
//     baseUrl: string = '',
//   ): string {
//     const params = new URLSearchParams();
//     params.append('userId', userId);
//     params.append('token', token);
//     params.append('imageLink', imageLink);

//     return `${baseUrl}/api/vultr/secure-image?${params.toString()}`;
//   }

//   private encryptFilePath(filePath: string): string {
//     const salt = crypto.randomBytes(16);
//     const iv = crypto.randomBytes(16);
//     const key = crypto.scryptSync('secret-key', salt, 32);
//     const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
//     let encrypted = cipher.update(filePath, 'utf8', 'hex');
//     encrypted += cipher.final('hex');
//     return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}`;
//   }
// }
