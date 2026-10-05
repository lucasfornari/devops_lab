import { Body, Controller, Post } from '@nestjs/common';

import { AutenticacaoService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistrarDto } from './dto/registrar.dto';

@Controller('auth')
export class AutenticacaoController {
    constructor(private readonly authService: AutenticacaoService) {}

    @Post('registrar')
    registrar(@Body() dados: RegistrarDto) {
        return this.authService.registrar(dados);
    }

    @Post('login')
    login(@Body() dados: LoginDto) {
        return this.authService.login(dados);
    }
}
