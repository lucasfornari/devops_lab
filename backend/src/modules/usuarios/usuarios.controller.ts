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
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto';
import { UsuarioDto } from './dto/usuario-resposta.dto';
import { UsuariosService } from './usuarios.service';

@ApiTags('Usuários')
@Controller('usuarios')
@UseGuards(AutenticacaoGuard, PapeisGuard)
@ApiBearerAuth()
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) {}

    @Get('me')
    @ApiOperation({ summary: 'Dados do usuário autenticado' })
    @ApiOkResponse({ type: UsuarioDto })
    buscarAtual(@UsuarioAtual() usuario: UsuarioAutenticado) {
        return this.usuariosService.buscarPorId(usuario.id);
    }

    @Get()
    @ApiOperation({ summary: 'Lista usuários, com filtro por papel e busca por nome/email (ADMIN)' })
    @ApiOkResponse({ type: [UsuarioDto] })
    @Papeis(Papel.ADMIN)
    listar(@Query() filtros: ListarUsuariosDto) {
        return this.usuariosService.listar(filtros);
    }

    @Post()
    @ApiOperation({ summary: 'Cria um usuário com qualquer papel (ADMIN)' })
    @ApiCreatedResponse({ type: UsuarioDto })
    @Papeis(Papel.ADMIN)
    criar(@Body() dados: CriarUsuarioDto) {
        return this.usuariosService.criar(dados);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Altera nome, email, papel ou senha de um usuário (ADMIN)' })
    @ApiOkResponse({ type: UsuarioDto })
    @Papeis(Papel.ADMIN)
    atualizar(
        @Param('id', ParseIntPipe) id: number,
        @UsuarioAtual() admin: UsuarioAutenticado,
        @Body() dados: AtualizarUsuarioDto,
    ) {
        return this.usuariosService.atualizar(id, dados, admin);
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({ summary: 'Exclui um usuário sem chamados nem comentários (ADMIN)' })
    @ApiNoContentResponse()
    @Papeis(Papel.ADMIN)
    excluir(@Param('id', ParseIntPipe) id: number, @UsuarioAtual() admin: UsuarioAutenticado) {
        return this.usuariosService.excluir(id, admin);
    }
}
