import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './common/utils/redis-server-adapter.utils';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE', 
    allowedHeaders: 'Content-Type, Authorization', 
  });
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.useWebSocketAdapter(redisIoAdapter);
  app.setGlobalPrefix('api');
  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Growth Command')
      .setDescription('Backend For Aswini Bajaj')
      .setVersion('1.0')
      .addTag('Growth Command')
      .build();
    const documentFacotry = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('apiname', app, documentFacotry);
  }
  await app.listen(process.env.port);
}
bootstrap();
