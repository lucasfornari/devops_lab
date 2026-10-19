import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RotaPublica } from './autenticacao.decorators';
import { AutenticacaoService } from './autenticacao.service';
import { AutenticacaoRespostaDto } from './dto/autenticacao-resposta.dto';
import { LoginDto } from './dto/login.dto';
import { RegistrarDto } from './dto/registrar.dto';

@ApiTags('Autenticação')
@Controller('auth')
@RotaPublica()
export class AutenticacaoController {
    constructor(private readonly authService: AutenticacaoService) {}

    @Post('registrar')
    @ApiOperation({ summary: 'Cria uma conta com papel USUARIO e devolve o token' })
    @ApiCreatedResponse({ type: AutenticacaoRespostaDto })
    registrar(@Body() dados: RegistrarDto) {
        return this.authService.registrar(dados);
    }

    @Post('login')
    @ApiOperation({ summary: 'Autentica com email e senha e devolve o token' })
    @ApiCreatedResponse({ type: AutenticacaoRespostaDto })
    login(@Body() dados: LoginDto) {
        return this.authService.login(dados);
    }
}
