import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';

import { AutenticacaoModule } from './modules/auth/auth.module';
import { CategoriasModule } from './modules/categorias/categorias.module';
import { ChamadosModule } from './modules/chamados/chamados.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        AutenticacaoModule,
        UsuariosModule,
        CategoriasModule,
        ChamadosModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
