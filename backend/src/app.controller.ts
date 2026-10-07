import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Saúde')
@Controller('health')
export class AppController {
    @Get()
    @ApiOperation({ summary: 'Verifica se a API está no ar' })
    verificarSaude() {
        return { status: 'ok' };
    }
}
