// Alexsander Xavier - 4338139
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Porta dinâmica para ambientes cloud
  const port = process.env.PORT || 3000;

  // CORS Configuration - Permitir comunicação global para deploy cloud
  app.enableCors({ origin: '*' });

  // Validation Pipe para validar DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  await app.listen(port);
  console.log(`Servidor rodando na porta ${port}`);
}
bootstrap();
