import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class AtualizarResponsavelDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    responsavelId!: number;
}
