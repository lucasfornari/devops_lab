import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

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

    @ApiProperty({ minLength: 6 })
    @IsString()
    @MinLength(6, { message: 'senha deve ter ao menos 6 caracteres' })
    @MaxLength(72)
    senha!: string;
}
