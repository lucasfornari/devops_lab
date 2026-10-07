import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Papel } from '@prisma/client';

export class ListarUsuariosDto {
    @ApiPropertyOptional({ enum: Papel, enumName: 'Papel' })
    @IsOptional()
    @IsEnum(Papel)
    papel?: Papel;

    @ApiPropertyOptional({ description: 'Texto buscado no nome ou no email' })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @MaxLength(160)
    busca?: string;
}
