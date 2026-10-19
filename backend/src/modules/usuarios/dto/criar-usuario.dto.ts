import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Papel } from '@prisma/client';

import { RegistrarDto } from '../../autenticacao/dto/registrar.dto';

export class CriarUsuarioDto extends RegistrarDto {
    @ApiProperty({ enum: Papel, enumName: 'Papel' })
    @IsEnum(Papel)
    papel!: Papel;
}
