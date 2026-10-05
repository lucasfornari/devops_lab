import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Papel } from '@prisma/client';

import { Papeis, UsuarioAtual } from '../auth/auth.decorator';
import { AutenticacaoGuard } from '../auth/auth.guard';
import { PapeisGuard } from '../auth/papeis.guard';
import { UsuarioAutenticado } from '../auth/auth.types';
import { AtualizarResponsavelDto } from './dto/atualizar-responsavel.dto';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';
import { CriarChamadoDto } from './dto/criar-chamado.dto';
import { CriarComentarioDto } from './dto/criar-comentario.dto';
import { ChamadosService } from './chamados.service';

@Controller('chamados')
@UseGuards(AutenticacaoGuard, PapeisGuard)
export class ChamadosController {
    constructor(private readonly chamadosService: ChamadosService) {}

    @Post()
    criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dados: CriarChamadoDto) {
        return this.chamadosService.criar(usuario, dados);
    }

    @Get()
    listar(@UsuarioAtual() usuario: UsuarioAutenticado) {
        return this.chamadosService.listar(usuario);
    }

    @Get(':id')
    buscarPorId(@Param('id', ParseIntPipe) id: number, @UsuarioAtual() usuario: UsuarioAutenticado) {
        return this.chamadosService.buscarPorId(id, usuario);
    }

    @Patch(':id/status')
    @Papeis(Papel.AGENTE, Papel.ADMIN)
    atualizarStatus(
        @Param('id', ParseIntPipe) id: number,
        @UsuarioAtual() usuario: UsuarioAutenticado,
        @Body() dados: AtualizarStatusDto,
    ) {
        return this.chamadosService.atualizarStatus(id, usuario, dados);
    }

    @Patch(':id/responsavel')
    @Papeis(Papel.AGENTE, Papel.ADMIN)
    atualizarResponsavel(
        @Param('id', ParseIntPipe) id: number,
        @UsuarioAtual() usuario: UsuarioAutenticado,
        @Body() dados: AtualizarResponsavelDto,
    ) {
        return this.chamadosService.atualizarResponsavel(id, usuario, dados);
    }

    @Post(':id/comentarios')
    adicionarComentario(
        @Param('id', ParseIntPipe) id: number,
        @UsuarioAtual() usuario: UsuarioAutenticado,
        @Body() dados: CriarComentarioDto,
    ) {
        return this.chamadosService.adicionarComentario(id, usuario, dados);
    }
}
