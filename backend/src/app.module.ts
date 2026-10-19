import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SaudeController } from './saude.controller';

import { AutenticacaoModule } from './modules/autenticacao/autenticacao.module';
import { CategoriasModule } from './modules/categorias/categorias.module';
import { ChamadosModule } from './modules/chamados/chamados.module';
import { validarVariaveisDeAmbiente } from './shared/configuracao/validar-variaveis-de-ambiente';
import { PrismaModule } from './shared/prisma/prisma.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validarVariaveisDeAmbiente }),
        PrismaModule,
        AutenticacaoModule,
        UsuariosModule,
        CategoriasModule,
        ChamadosModule,
    ],
    controllers: [SaudeController],
})
export class AppModule {}
