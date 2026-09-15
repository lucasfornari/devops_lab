# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

Sistema de abertura de chamados (helpdesk) com 3 camadas, cada uma rodando no
seu próprio container/pod: **nginx** (front-end + proxy reverso de `/api/*`),
**backend** (API Node.js/Express + TypeScript + Prisma, com auth JWT) e
**postgres** (banco). O mesmo conjunto de imagens roda tanto via Docker
Compose (dev local) quanto via Kubernetes (com HPA em nginx e backend).

## Comandos comuns

### Backend (`backend/`)

```bash
cd backend
npm install
npx prisma generate              # regenera o client após mudar schema.prisma
npx prisma migrate dev --name x  # cria + aplica uma migration (precisa de Postgres acessível)
npm run dev                      # tsx watch — hot reload local, fora de container
npx tsc --noEmit                 # type-check
npm run build && npm start       # build de produção + rodar o compilado
docker compose exec backend npx prisma studio   # inspecionar dados (com a stack no ar)
```

### Frontend (`frontend/`)

```bash
cd frontend
npm install
npm run dev      # servidor do Vite com HMR
npm run build    # type-check (vue-tsc) + build de produção em dist/
npm run lint     # oxlint + eslint, ambos com --fix
```

### Docker Compose (desenvolvimento local)

```bash
docker compose up -d --build   # subir (reconstruindo imagens)
docker compose logs -f          # logs em tempo real
docker compose down             # parar e remover containers/rede
docker compose down -v          # idem, e apagar também o volume do Postgres
```

Acesso local, sempre pela porta única do nginx: site em `http://localhost:8080`,
API em `http://localhost:8080/api/...`. Em dev o nginx faz proxy de `/` para o
servidor do Vite (porta 5173, com HMR via WebSocket) — não serve estático
nenhum nesse modo.

### Kubernetes (via cluster Kind local)

```bash
./_init.sh   # cria/atualiza cluster Kind "fullstack", builda e carrega as imagens,
             # instala Metrics Server e aplica k8s/ (idempotente, pode rodar de novo)
./_down.sh   # remove os manifests de k8s/ e destrói o cluster Kind (apaga o Postgres)
```

Ambos aceitam `KIND_CLUSTER_NAME=<nome>` para usar outro cluster. Após `_init.sh`:
`kubectl port-forward service/projeto-nginx 8080:80`.

Build manual das imagens (usadas pelos manifests em `k8s/`):

```bash
docker build -t projeto-nginx:latest .                        # builda o frontend e embute o dist/
docker build -t projeto-backend:latest ./backend --target prod
```

Não há suíte de testes automatizados configurada no repositório — type-check
(`tsc`/`vue-tsc`), lint e a "aplicação em funcionamento" via Compose/k8s são a
forma de validação usada aqui.

## Arquitetura

### Backend — módulos por domínio, não por camada técnica

`backend/src/modules/{auth,usuarios,categorias,chamados}/`, cada um com
`*.routes.ts` → `*.controller.ts` → `*.service.ts` (e `*.schemas.ts` com os
schemas de validação em `zod`, quando a rota recebe corpo). Regras
transversais ficam em `backend/src/shared/`: `AppError` (erro com
`statusCode`), `errorHandler.ts` (converte `AppError` e erros conhecidos do
Prisma — `P2025`/`P2002` — em respostas `{ status: 'error', message }`) e
`asyncHandler.ts` (encaminha rejeições de controllers async para o
`errorHandler`, já que Express 4 não faz isso sozinho).

### Auth e papéis

JWT emitido em `POST /api/auth/registrar` (sempre cria papel `USUARIO`) e
`POST /api/auth/login`, verificado pelo middleware `autenticar` em
`modules/auth/auth.middleware.ts`, que popula `req.usuario = { id, papel }`.
`autorizar(...papeis)` barra por papel (`USUARIO` | `AGENTE` | `ADMIN`). Regra
de escopo dos chamados vive em `chamados.service.ts`: `USUARIO` só vê/comenta
os próprios chamados (filtro por `solicitanteId`); `AGENTE`/`ADMIN` veem
todos, e só eles podem mudar `status`/`responsavel`. Não existe rota para
promover usuário a `AGENTE`/`ADMIN` — hoje isso é feito direto no banco.

### Modelo de dados (`backend/prisma/schema.prisma`)

`Usuario` (papel, senhaHash), `Categoria`, `Chamado` (status, prioridade,
FKs para categoria/solicitante/responsavel) e `Comentario` (FK para chamado e
autor). Nomes de campo em camelCase no client Prisma, mapeados via
`@map`/`@@map` para colunas/tabelas em snake_case no Postgres (convenção
herdada do `server.js` original do mural de recados). Mudança de schema =
`npx prisma migrate dev --name <nome>`, o que gera SQL versionado em
`prisma/migrations/` — isso precisa ser commitado, não é gerado em build.

### Como as migrations chegam ao banco em cada ambiente

`backend/docker-entrypoint.sh` roda `npx prisma migrate deploy` toda vez que o
container sobe, antes de iniciar o servidor — inclusive em produção/k8s, com
múltiplas réplicas do `backend` subindo em paralelo (é seguro: é o padrão que
a própria Prisma recomenda para esse cenário, `migrate deploy` é idempotente).
Se `DATABASE_URL` não estiver definida, o entrypoint monta a partir de
`PGUSER`/`PGPASSWORD`/`PGHOST`/`PGPORT`/`PGDATABASE` (é assim que o k8s injeta
as credenciais do `postgres-secret`, já que Prisma exige uma URL única em vez
de variáveis separadas).

### nginx diverge entre dev e produção (por isso duas pastas `conf.d`)

`devops/nginx/conf.d.dev/default.conf` (copiado pela imagem de dev,
`devops/nginx/Dockerfile`, usada pelo `docker-compose`) só faz proxy: `/` vai
pro servidor de dev do Vite (`frontend:5173`, com headers de upgrade pra
WebSocket/HMR) e `/api/` vai pro `backend:3000`. `devops/nginx/conf.d.prod/default.conf`
(copiado pelo `Dockerfile` da raiz, usado pelo k8s) serve os arquivos
estáticos do `dist/` do frontend com fallback de SPA (`try_files $uri $uri/
/index.html`, necessário pro Vue Router em modo history não quebrar num
refresh de rota profunda tipo `/chamados/5`) e também faz proxy de `/api/`
pro `backend:3000`. O front-end nunca fala direto com a API sem passar pelo
nginx (ou pelo proxy do Vite em dev, que tem o mesmo efeito).

### Frontend (`frontend/src/`)

SPA em Vue 3 + TypeScript. `stores/auth.ts` (Pinia) guarda token/usuário e
persiste o token em `localStorage` via `services/token.ts`.
`services/api.ts` é o único ponto que fala com `/api` (injeta o Bearer token,
lança `Error` com a mensagem do backend em respostas não-OK).
`router/index.ts` tem um `beforeEach` que redireciona pra `/login` quando a
rota exige auth (`meta.requerAuth`) e não há sessão. Views: lista, formulário
de novo chamado, detalhe (com comentários e, só pra `AGENTE`/`ADMIN`, o
seletor de status).

### `k8s/`

Um manifest por recurso/componente. `nginx` (Service `NodePort` 30080, HPA
3–10 réplicas) e `backend` (Service `ClusterIP`, HPA 2–8 réplicas, baseado em
CPU/memória) escalam horizontalmente; `postgres` fica fixo em 1 réplica (sem
replicação de dados, usa PVC para persistência). `backend-secret.yaml` guarda
o `JWT_SECRET`; as credenciais do Postgres continuam em `postgres-secret.yaml`
e são reaproveitadas pelo `backend` (via `secretKeyRef`) pro entrypoint montar
a `DATABASE_URL`. HPA exige `metrics-server` no cluster — `_init.sh` já cuida
disso, incluindo o patch `--kubelet-insecure-tls` necessário em Kind.

## Coisas a observar ao editar

- Alterar `devops/nginx/conf.d.dev/` só afeta o comportamento em
  `docker-compose`; alterar `devops/nginx/conf.d.prod/` só afeta produção/k8s
  — são arquivos diferentes agora, não o mesmo copiado duas vezes.
- Ao mudar `backend/prisma/schema.prisma`, rode `npx prisma migrate dev
  --name <nome>` (com a stack no ar) e commite os arquivos gerados em
  `prisma/migrations/` — sem isso, `migrate deploy` no próximo boot não tem o
  que aplicar.
- Ao mudar algo em `backend/` ou `frontend/` ou no `Dockerfile` da raiz, lembre
  que as imagens usadas pelo Kubernetes precisam ser reconstruídas e
  recarregadas no cluster (`docker build` + `kind load docker-image`, ou
  simplesmente rodar `_init.sh` de novo) — `kubectl apply` sozinho não repuxa
  uma imagem `:latest` já cacheada no cluster.
- Credenciais do Postgres em `k8s/postgres-secret.yaml`, o `JWT_SECRET` em
  `k8s/backend-secret.yaml` e as credenciais no `docker-compose.yml` são fixas
  para dev/local — não representam prática de produção.
