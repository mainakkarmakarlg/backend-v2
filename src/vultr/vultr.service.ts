import {
  ObjectCannedACL,
  S3Client,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VultrService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;

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
}
