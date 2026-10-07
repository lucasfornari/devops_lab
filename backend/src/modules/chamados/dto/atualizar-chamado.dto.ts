import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

import { CriarChamadoDto } from './criar-chamado.dto';

export class AtualizarChamadoDto extends PartialType(OmitType(CriarChamadoDto, ['categoriaId'])) {
    @ApiPropertyOptional({ type: Number, nullable: true, description: 'null remove a categoria' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    categoriaId?: number | null;
}
