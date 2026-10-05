import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrioridadeChamado, StatusChamado } from '@prisma/client';

import { CategoriaDto } from '../../categorias/dto/categoria-resposta.dto';
import { UsuarioResumoDto } from '../../usuarios/dto/usuario-resposta.dto';

export class ComentarioDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    mensagem!: string;

    @ApiProperty()
    criadoEm!: Date;

    @ApiProperty()
    autor!: UsuarioResumoDto;
}

export class ChamadoDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    titulo!: string;

    @ApiProperty()
    descricao!: string;

    @ApiProperty({ enum: StatusChamado, enumName: 'StatusChamado' })
    status!: StatusChamado;

    @ApiProperty({ enum: PrioridadeChamado, enumName: 'PrioridadeChamado' })
    prioridade!: PrioridadeChamado;

    @ApiProperty()
    criadoEm!: Date;

    @ApiProperty()
    atualizadoEm!: Date;

    @ApiProperty({ type: CategoriaDto, nullable: true })
    categoria!: CategoriaDto | null;

    @ApiProperty()
    solicitante!: UsuarioResumoDto;

    @ApiProperty({ type: UsuarioResumoDto, nullable: true })
    responsavel!: UsuarioResumoDto | null;

    @ApiPropertyOptional({ type: [ComentarioDto] })
    comentarios?: ComentarioDto[];
}
