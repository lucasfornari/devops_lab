import { ApiProperty } from '@nestjs/swagger';

export class CategoriaDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    nome!: string;
}
