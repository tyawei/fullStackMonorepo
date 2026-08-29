import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/httpException.filter';
import { LoggingAndFmtResInterceptor } from './interceptors/loggingAndFmtRes.interceptor';
import cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService)
  const PORT = configService.get<number>('PORT') || 3001
  
  const cookieSecret = configService.get('COOKIE_SECRET') || ''
  app.use(cookieParser(cookieSecret))

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  )

  app.useGlobalFilters(new HttpExceptionFilter())

  app.useGlobalInterceptors(new LoggingAndFmtResInterceptor())

  if (configService.get('NODE_ENV') === 'development') {
    app.enableCors({ 
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://172.20.112.1:3000'], 
      credentials: true,
      // // 以上两项跨域设置必须
      // allowedHeaders: ['Content-Type', 'Authorization'],
      // methods: ['GET', 'POST']
    })
  }

  await app.listen(PORT);
}
bootstrap();
