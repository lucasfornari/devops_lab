import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class AppController {
    @Get()
    verificarSaude() {
        return { status: 'ok' };
    }
}
