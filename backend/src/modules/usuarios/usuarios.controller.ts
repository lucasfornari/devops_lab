import { Controller, Get, UseGuards } from '@nestjs/common';
import { Papel } from '@prisma/client';
import { Papeis, UsuarioAtual } from '../auth/auth.decorator';
import { AutenticacaoGuard } from '../auth/auth.guard';
import { PapeisGuard } from '../auth/papeis.guard';
import { UsuarioAutenticado } from '../auth/auth.types';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
@UseGuards(AutenticacaoGuard, PapeisGuard)
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) {}

    @Get('me')
    buscarAtual(@UsuarioAtual() usuario: UsuarioAutenticado) {
        return this.usuariosService.buscarPorId(usuario.id);
    }

    @Get()
    @Papeis(Papel.ADMIN)
    listar() {
        return this.usuariosService.listar();
    }
}
