import { Module } from '@nestjs/common';
import { AutenticacaoModule } from '../auth/auth.module';
import { ChamadosController } from './chamados.controller';
import { ChamadosService } from './chamados.service';

@Module({ imports: [AutenticacaoModule], controllers: [ChamadosController], providers: [ChamadosService] })
export class ChamadosModule {}
