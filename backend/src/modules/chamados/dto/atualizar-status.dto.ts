import { IsEnum } from 'class-validator';
import { StatusChamado } from '@prisma/client';

export class AtualizarStatusDto {
    @IsEnum(StatusChamado)
    status!: StatusChamado;
}
