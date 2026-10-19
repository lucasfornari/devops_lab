import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from './modules/auth/auth.decorator';

@ApiTags('Saúde')
@Controller('health')
@Public()
export class AppController {
    @Get()
    @ApiOperation({ summary: 'Verifica se a API está no ar' })
    verificarSaude() {
        return { status: 'ok' };
    }
}
