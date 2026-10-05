import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { StatusChamado } from '@prisma/client';

export class AtualizarStatusDto {
    @ApiProperty({ enum: StatusChamado, enumName: 'StatusChamado' })
    @IsEnum(StatusChamado)
    status!: StatusChamado;
}
