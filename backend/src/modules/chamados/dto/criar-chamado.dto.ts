import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, MinLength, Min } from 'class-validator';
import { PrioridadeChamado } from '@prisma/client';

export class CriarChamadoDto {
    @ApiProperty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @MinLength(1, { message: 'título é obrigatório' })
    @MaxLength(150)
    titulo!: string;

    @ApiProperty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @MinLength(1, { message: 'descrição é obrigatória' })
    @MaxLength(4000)
    descricao!: string;

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
}
