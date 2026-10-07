import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { Papel } from '@prisma/client';

import { Papeis, UsuarioAtual } from '../auth/auth.decorator';
import { AutenticacaoGuard } from '../auth/auth.guard';
import { PapeisGuard } from '../auth/papeis.guard';
import { UsuarioAutenticado } from '../auth/auth.types';
import { AtualizarChamadoDto } from './dto/atualizar-chamado.dto';
import { AtualizarResponsavelDto } from './dto/atualizar-responsavel.dto';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';
import { ChamadoDto } from './dto/chamado-resposta.dto';
import { CriarChamadoDto } from './dto/criar-chamado.dto';
import { CriarComentarioDto } from './dto/criar-comentario.dto';
import { ListarChamadosDto } from './dto/listar-chamados.dto';
import { ChamadosService } from './chamados.service';

@ApiTags('Chamados')
@Controller('chamados')
@UseGuards(AutenticacaoGuard, PapeisGuard)
@ApiBearerAuth()
export class ChamadosController {
    constructor(private readonly chamadosService: ChamadosService) {}

    @Post()
    @ApiOperation({ summary: 'Abre um chamado em nome do usuário autenticado' })
    @ApiCreatedResponse({ type: ChamadoDto })
    criar(@UsuarioAtual() usuario: UsuarioAutenticado, @Body() dados: CriarChamadoDto) {
        return this.chamadosService.criar(usuario, dados);
    }

    @Get()
    @ApiOperation({ summary: 'Lista chamados com filtros; USUARIO vê só os próprios' })
    @ApiOkResponse({ type: [ChamadoDto] })
    listar(@UsuarioAtual() usuario: UsuarioAutenticado, @Query() filtros: ListarChamadosDto) {
        return this.chamadosService.listar(usuario, filtros);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Detalhe do chamado com comentários' })
    @ApiOkResponse({ type: ChamadoDto })
    buscarPorId(@Param('id', ParseIntPipe) id: number, @UsuarioAtual() usuario: UsuarioAutenticado) {
        return this.chamadosService.buscarPorId(id, usuario);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Edita título, descrição, prioridade ou categoria (solicitante só enquanto aberto)' })
    @ApiOkResponse({ type: ChamadoDto })
    atualizar(
        @Param('id', ParseIntPipe) id: number,
        @UsuarioAtual() usuario: UsuarioAutenticado,
        @Body() dados: AtualizarChamadoDto,
    ) {
        return this.chamadosService.atualizar(id, usuario, dados);
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({ summary: 'Exclui o chamado (ADMIN, ou o solicitante enquanto aberto)' })
    @ApiNoContentResponse()
    excluir(@Param('id', ParseIntPipe) id: number, @UsuarioAtual() usuario: UsuarioAutenticado) {
        return this.chamadosService.excluir(id, usuario);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Altera o status (AGENTE/ADMIN)' })
    @ApiOkResponse({ type: ChamadoDto })
    @Papeis(Papel.AGENTE, Papel.ADMIN)
    atualizarStatus(
        @Param('id', ParseIntPipe) id: number,
        @UsuarioAtual() usuario: UsuarioAutenticado,
        @Body() dados: AtualizarStatusDto,
    ) {
        return this.chamadosService.atualizarStatus(id, usuario, dados);
    }

    @Patch(':id/responsavel')
    @ApiOperation({ summary: 'Define o responsável (AGENTE só assume para si; ADMIN atribui a qualquer atendente)' })
    @ApiOkResponse({ type: ChamadoDto })
    @Papeis(Papel.AGENTE, Papel.ADMIN)
    atualizarResponsavel(
        @Param('id', ParseIntPipe) id: number,
        @UsuarioAtual() usuario: UsuarioAutenticado,
        @Body() dados: AtualizarResponsavelDto,
    ) {
        return this.chamadosService.atualizarResponsavel(id, usuario, dados);
    }

    @Post(':id/comentarios')
    @ApiOperation({ summary: 'Adiciona um comentário e devolve o chamado atualizado' })
    @ApiCreatedResponse({ type: ChamadoDto })
    adicionarComentario(
        @Param('id', ParseIntPipe) id: number,
        @UsuarioAtual() usuario: UsuarioAutenticado,
        @Body() dados: CriarComentarioDto,
    ) {
        return this.chamadosService.adicionarComentario(id, usuario, dados);
    }
}
