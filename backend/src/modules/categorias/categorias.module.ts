import { Module } from '@nestjs/common';
import { AutenticacaoModule } from '../auth/auth.module';
import { CategoriasController } from './categorias.controller';
import { CategoriasService } from './categorias.service';

@Module({ imports: [AutenticacaoModule], controllers: [CategoriasController], providers: [CategoriasService] })
export class CategoriasModule {}
