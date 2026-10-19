import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

import { TAMANHO_MAXIMO_SENHA, TAMANHO_MINIMO_SENHA } from '../../../shared/seguranca/senha';

export class RegistrarDto {
    @ApiProperty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @MinLength(1, { message: 'nome é obrigatório' })
    @MaxLength(120)
    nome!: string;

    @ApiProperty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsEmail({}, { message: 'email inválido' })
    @MaxLength(160)
    email!: string;

    @ApiProperty({ minLength: TAMANHO_MINIMO_SENHA, maxLength: TAMANHO_MAXIMO_SENHA })
    @IsString()
    @MinLength(TAMANHO_MINIMO_SENHA, { message: `senha deve ter ao menos ${TAMANHO_MINIMO_SENHA} caracteres` })
    @MaxLength(TAMANHO_MAXIMO_SENHA)
    senha!: string;
}
