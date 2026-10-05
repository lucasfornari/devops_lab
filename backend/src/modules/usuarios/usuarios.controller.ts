import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Papel } from '@prisma/client';
import { Papeis, UsuarioAtual } from '../auth/auth.decorator';
import { AutenticacaoGuard } from '../auth/auth.guard';
import { PapeisGuard } from '../auth/papeis.guard';
import { UsuarioAutenticado } from '../auth/auth.types';
import { UsuarioDto } from './dto/usuario-resposta.dto';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
@UseGuards(AutenticacaoGuard, PapeisGuard)
@ApiBearerAuth()
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) {}

    @Get('me')
    @ApiOkResponse({ type: UsuarioDto })
    buscarAtual(@UsuarioAtual() usuario: UsuarioAutenticado) {
        return this.usuariosService.buscarPorId(usuario.id);
    }

    @Get()
    @ApiOkResponse({ type: [UsuarioDto] })
    @Papeis(Papel.ADMIN)
    listar() {
        return this.usuariosService.listar();
    }
}
