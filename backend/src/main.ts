import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { FiltroDeErros } from './shared/filtros/filtro-de-erros';

async function iniciarAplicacao(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );
    app.useGlobalFilters(new FiltroDeErros());

    const configSwagger = new DocumentBuilder().setTitle('API de Chamados').addBearerAuth().build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, configSwagger));

    await app.listen(process.env.PORT ?? 3000);
}

void iniciarAplicacao();
