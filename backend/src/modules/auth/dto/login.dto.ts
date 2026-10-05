import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsEmail({}, { message: 'email inválido' })
    @MaxLength(160)
    email!: string;

    @IsString()
    @MinLength(1, { message: 'senha é obrigatória' })
    senha!: string;
}
