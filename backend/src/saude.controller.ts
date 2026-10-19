import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { RotaPublica } from './modules/autenticacao/autenticacao.decorators';

@ApiTags('Saúde')
@Controller('health')
@RotaPublica()
export class SaudeController {
    @Get()
    @ApiOperation({ summary: 'Verifica se a API está no ar' })
    verificarSaude() {
        return { status: 'ok' };
    }
}
