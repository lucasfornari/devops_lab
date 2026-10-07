import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class SalvarCategoriaDto {
    @ApiProperty()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @MinLength(1, { message: 'nome é obrigatório' })
    @MaxLength(80)
    nome!: string;
}
