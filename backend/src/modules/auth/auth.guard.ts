import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsuarioAutenticado } from './auth.types';

@Injectable()
export class AutenticacaoGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    canActivate(contexto: ExecutionContext): boolean {
        const request = contexto.switchToHttp().getRequest<{
            headers: { authorization?: string };
            usuario?: UsuarioAutenticado;
        }>();
        const cabecalho = request.headers.authorization;

        if (!cabecalho?.startsWith('Bearer ')) {
            throw new UnauthorizedException('token de autenticação ausente');
        }

        try {
            const payload = this.jwtService.verify<UsuarioAutenticado>(cabecalho.slice(7));
            request.usuario = { id: payload.id, papel: payload.papel };
            return true;
        } catch {
            throw new UnauthorizedException('token de autenticação inválido');
        }
    }
}
