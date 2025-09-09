import { Test, TestingModule } from '@nestjs/testing';
import { VultrController } from './vultr.controller';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { VultrService } from './vultr.service';

describe('VultrController', () => {
  let app: INestApplication;
  let vultrService: VultrService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VultrController],
      providers: [VultrService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    vultrService = module.get<VultrService>(VultrService);
  });

  it('should generate a proxy URL correctly', async () => {
    const filePath = 'sample/path/to/file.png';
    const expectedProxyUrl =
      'http://localhost:3000/api/vultr/proxy/someEncryptedToken';

    jest
      .spyOn(vultrService, 'generateProxyUrl')
      .mockReturnValueOnce(expectedProxyUrl);

    const response = await request(app.getHttpServer())
      .get(`/vultr/generate-url/${filePath}`)
      .expect(200); // Ensure HTTP 200 status

    expect(response.body).toEqual({ proxyUrl: expectedProxyUrl });

    expect(vultrService.generateProxyUrl).toHaveBeenCalledWith(filePath);
  });

  afterAll(async () => {
    await app.close();
  });
});
