import { Module } from '@nestjs/common';
import { AutenticacaoModule } from '../auth/auth.module';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

@Module({ imports: [AutenticacaoModule], controllers: [UsuariosController], providers: [UsuariosService] })
export class UsuariosModule {}
