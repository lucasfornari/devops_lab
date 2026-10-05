import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class AtualizarResponsavelDto {
    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    responsavelId!: number;
}
