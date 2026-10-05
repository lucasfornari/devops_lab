import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Papel } from '@prisma/client';
import { Papeis } from '../auth/auth.decorator';
import { AutenticacaoGuard } from '../auth/auth.guard';
import { PapeisGuard } from '../auth/papeis.guard';
import { CategoriasService } from './categorias.service';
import { CriarCategoriaDto } from './dto/criar-categoria.dto';

@Controller('categorias')
@UseGuards(AutenticacaoGuard, PapeisGuard)
export class CategoriasController {
    constructor(private readonly categoriasService: CategoriasService) {}

    @Get()
    listar() { return this.categoriasService.listar(); }

    @Post()
    @Papeis(Papel.ADMIN)
    criar(@Body() dados: CriarCategoriaDto) { return this.categoriasService.criar(dados); }
}
