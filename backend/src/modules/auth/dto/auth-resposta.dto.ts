import { ApiProperty } from '@nestjs/swagger';

import { UsuarioDto } from '../../usuarios/dto/usuario-resposta.dto';

export class AuthRespostaDto {
    @ApiProperty()
    token!: string;

    @ApiProperty()
    usuario!: UsuarioDto;
}
