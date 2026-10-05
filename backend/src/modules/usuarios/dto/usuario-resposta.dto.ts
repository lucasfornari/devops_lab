import { ApiProperty } from '@nestjs/swagger';
import { Papel } from '@prisma/client';

export class UsuarioResumoDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    nome!: string;

    @ApiProperty()
    email!: string;
}

export class UsuarioDto extends UsuarioResumoDto {
    @ApiProperty({ enum: Papel, enumName: 'Papel' })
    papel!: Papel;
}
