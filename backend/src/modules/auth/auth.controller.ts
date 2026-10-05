import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';

import { AutenticacaoService } from './auth.service';
import { AuthRespostaDto } from './dto/auth-resposta.dto';
import { LoginDto } from './dto/login.dto';
import { RegistrarDto } from './dto/registrar.dto';

@Controller('auth')
export class AutenticacaoController {
    constructor(private readonly authService: AutenticacaoService) {}

    @Post('registrar')
    @ApiCreatedResponse({ type: AuthRespostaDto })
    registrar(@Body() dados: RegistrarDto) {
        return this.authService.registrar(dados);
    }

    @Post('login')
    @ApiCreatedResponse({ type: AuthRespostaDto })
    login(@Body() dados: LoginDto) {
        return this.authService.login(dados);
    }
}
