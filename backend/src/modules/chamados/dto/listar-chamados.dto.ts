import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PrioridadeChamado, StatusChamado } from '@prisma/client';

export enum FiltroAtribuicao {
    MEUS = 'MEUS',
    SEM_RESPONSAVEL = 'SEM_RESPONSAVEL',
}

export class ListarChamadosDto {
    @ApiPropertyOptional({ enum: StatusChamado, enumName: 'StatusChamado' })
    @IsOptional()
    @IsEnum(StatusChamado)
    status?: StatusChamado;

    @ApiPropertyOptional({ enum: PrioridadeChamado, enumName: 'PrioridadeChamado' })
    @IsOptional()
    @IsEnum(PrioridadeChamado)
    prioridade?: PrioridadeChamado;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    categoriaId?: number;

    @ApiPropertyOptional({ description: 'Texto buscado no título ou na descrição' })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @MaxLength(150)
    busca?: string;

    @ApiPropertyOptional({
        enum: FiltroAtribuicao,
        enumName: 'FiltroAtribuicao',
        description: 'MEUS = sou o responsável; SEM_RESPONSAVEL = ninguém assumiu',
    })
    @IsOptional()
    @IsEnum(FiltroAtribuicao)
    atribuicao?: FiltroAtribuicao;
}
