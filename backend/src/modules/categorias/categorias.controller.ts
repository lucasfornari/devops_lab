import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { Papel } from '@prisma/client';

import { Papeis } from '../auth/auth.decorator';
import { AutenticacaoGuard } from '../auth/auth.guard';
import { PapeisGuard } from '../auth/papeis.guard';
import { CategoriasService } from './categorias.service';
import { CategoriaDto } from './dto/categoria-resposta.dto';
import { SalvarCategoriaDto } from './dto/salvar-categoria.dto';

@ApiTags('Categorias')
@Controller('categorias')
@UseGuards(AutenticacaoGuard, PapeisGuard)
@ApiBearerAuth()
export class CategoriasController {
    constructor(private readonly categoriasService: CategoriasService) {}

    @Get()
    @ApiOperation({ summary: 'Lista as categorias em ordem alfabética' })
    @ApiOkResponse({ type: [CategoriaDto] })
    listar() {
        return this.categoriasService.listar();
    }

    @Post()
    @ApiOperation({ summary: 'Cria uma categoria (ADMIN)' })
    @ApiCreatedResponse({ type: CategoriaDto })
    @Papeis(Papel.ADMIN)
    criar(@Body() dados: SalvarCategoriaDto) {
        return this.categoriasService.criar(dados);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Renomeia uma categoria (ADMIN)' })
    @ApiOkResponse({ type: CategoriaDto })
    @Papeis(Papel.ADMIN)
    atualizar(@Param('id', ParseIntPipe) id: number, @Body() dados: SalvarCategoriaDto) {
        return this.categoriasService.atualizar(id, dados);
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({ summary: 'Exclui uma categoria; os chamados dela ficam sem categoria (ADMIN)' })
    @ApiNoContentResponse()
    @Papeis(Papel.ADMIN)
    excluir(@Param('id', ParseIntPipe) id: number) {
        return this.categoriasService.excluir(id);
    }
}
