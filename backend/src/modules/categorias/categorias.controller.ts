import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { Papel } from '@prisma/client';
import { Papeis } from '../auth/auth.decorator';
import { AutenticacaoGuard } from '../auth/auth.guard';
import { PapeisGuard } from '../auth/papeis.guard';
import { CategoriasService } from './categorias.service';
import { CategoriaDto } from './dto/categoria-resposta.dto';
import { CriarCategoriaDto } from './dto/criar-categoria.dto';

@Controller('categorias')
@UseGuards(AutenticacaoGuard, PapeisGuard)
@ApiBearerAuth()
export class CategoriasController {
    constructor(private readonly categoriasService: CategoriasService) {}

    @Get()
    @ApiOkResponse({ type: [CategoriaDto] })
    listar() { return this.categoriasService.listar(); }

    @Post()
    @ApiCreatedResponse({ type: CategoriaDto })
    @Papeis(Papel.ADMIN)
    criar(@Body() dados: CriarCategoriaDto) { return this.categoriasService.criar(dados); }
}
