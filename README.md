# Projeto

Sistema de abertura de chamados (helpdesk) com 3 camadas, cada uma no seu
próprio container/pod:

- **nginx** — serve o front-end (SPA em Vue) e faz proxy reverso de `/api/*` para a API
- **backend** — API em Node.js/Express + TypeScript, com Prisma falando com o Postgres
- **postgres** — banco de dados

Deploy no Kubernetes com um `Deployment` por componente. `nginx` e `backend`
têm `HorizontalPodAutoscaler` (nginx: 3-10 réplicas, backend: 2-8 réplicas,
baseado em CPU/memória) — o `postgres` fica fixo em **1 réplica** (não escala
horizontalmente sem replicação de dados).

## Autenticação e papéis

A API usa autenticação por **JWT** (`Authorization: Bearer <token>`), emitido
em `POST /api/auth/registrar` e `POST /api/auth/login`. Todo usuário novo é
criado com o papel `USUARIO` — promover alguém a `AGENTE`/`ADMIN` hoje é feito
direto no banco (`UPDATE usuarios SET papel = 'ADMIN' WHERE id = ...`), não há
um fluxo de administração de usuários ainda.

| Papel | O que pode fazer |
|---|---|
| `USUARIO` | Abrir chamados, ver/comentar apenas os próprios chamados |
| `AGENTE` | Ver e comentar todos os chamados, mudar status, definir responsável |
| `ADMIN` | Tudo que `AGENTE` faz, além de listar usuários e criar categorias |

## Estrutura de pastas

```
projeto/
├── docker-compose.yml      # Ambiente de desenvolvimento local (nginx + backend + frontend + postgres)
├── Dockerfile              # Imagem de produção do nginx (builda o frontend e embute o dist/) — usada pelo k8s
├── devops/
│   └── nginx/
│       ├── Dockerfile          # Imagem de dev usada pelo docker-compose
│       ├── nginx.conf          # Configuração principal do Nginx
│       ├── conf.d.dev/
│       │   └── default.conf    # Dev: proxy de "/" pro Vite (com HMR) e de "/api/" pro backend
│       └── conf.d.prod/
│           └── default.conf    # Prod: serve o dist/ do frontend e faz proxy de "/api/" pro backend
├── backend/
│   ├── Dockerfile           # Multi-stage: dev (tsx watch), build e prod (compilado)
│   ├── docker-entrypoint.sh # Monta DATABASE_URL se necessário e roda `prisma migrate deploy` antes de subir
│   ├── prisma/
│   │   ├── schema.prisma    # Modelos Usuario, Categoria, Chamado, Comentario
│   │   └── migrations/      # Histórico de migrations (gerado via `prisma migrate dev`)
│   └── src/
│       ├── modules/         # auth/, usuarios/, categorias/, chamados/ — cada um com routes/controller/service
│       ├── shared/          # middlewares (erro, validação, async handler) e AppError
│       ├── config/          # env.ts e o singleton do PrismaClient
│       ├── app.ts
│       └── server.ts
├── frontend/
│   ├── Dockerfile           # Multi-stage: dev (servidor do Vite) e build (gera dist/)
│   └── src/
│       ├── views/           # Login, lista de chamados, novo chamado, detalhe do chamado
│       ├── stores/auth.ts   # Pinia — sessão (token + usuário logado)
│       ├── services/        # wrapper de fetch pra API e funções por domínio
│       └── router/          # rotas protegidas por autenticação
├── k8s/
│   ├── nginx-deployment.yaml
│   ├── nginx-service.yaml     # Service NodePort — expõe o site
│   ├── nginx-hpa.yaml         # HorizontalPodAutoscaler (3-10 réplicas)
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml   # Service ClusterIP — só acessível dentro do cluster
│   ├── backend-hpa.yaml       # HorizontalPodAutoscaler (2-8 réplicas)
│   ├── backend-secret.yaml    # JWT_SECRET (dev/local apenas)
│   ├── postgres-deployment.yaml
│   ├── postgres-service.yaml  # Service ClusterIP
│   ├── postgres-secret.yaml   # Credenciais (dev/local apenas)
│   └── postgres-pvc.yaml      # Armazenamento persistente do banco
```

> **Por que existem dois Dockerfiles de nginx (e duas pastas `conf.d`)?**
> `devops/nginx/Dockerfile` é a imagem de **dev** usada pelo `docker-compose`:
> nela o nginx só faz proxy — para o servidor de dev do Vite (porta 5173, com
> hot reload) e para a API — sem servir nenhum arquivo estático próprio. O
> `Dockerfile` da raiz é a imagem de **produção** usada pelo Kubernetes: ela
> builda o frontend (`npm run build`) em um estágio e copia o `dist/` gerado
> para dentro da imagem final do nginx, que aí sim serve arquivos estáticos
> (com fallback de SPA para o Vue Router).

---

## Prisma (schema, migrations e dados)

O schema do banco vive em `backend/prisma/schema.prisma`. Ao mudar um modelo:

```bash
# dentro do container do backend (docker compose exec backend sh), ou localmente
# com um Postgres acessível via DATABASE_URL:
npx prisma migrate dev --name <nome-da-mudanca>
```

Isso gera o SQL em `backend/prisma/migrations/` (deve ser commitado) e já
aplica no banco. Em produção/containers, quem aplica as migrations pendentes é
o `docker-entrypoint.sh`, que roda `npx prisma migrate deploy` automaticamente
antes de subir o servidor — seguro mesmo com múltiplas réplicas rodando em
paralelo (é o padrão que a própria Prisma recomenda para esse cenário).

Para inspecionar os dados visualmente:

```bash
docker compose exec backend npx prisma studio
# depois acesse http://localhost:5555 (é preciso publicar a porta do serviço
# backend no docker-compose.yml, ou rodar `prisma studio` localmente com
# DATABASE_URL apontando para localhost)
```

---

## Docker / Docker Compose (desenvolvimento local)

| Ação | Comando |
|---|---|
| Subir o ambiente | `docker compose up -d` |
| Subir e reconstruir as imagens | `docker compose up -d --build` |
| Ver containers rodando | `docker compose ps` |
| Ver logs (em tempo real) | `docker compose logs -f` |
| Parar os containers | `docker compose stop` |
| Parar e remover containers/rede | `docker compose down` |
| Entrar no container do backend | `docker compose exec backend sh` |

Comandos gerais de Docker que também são úteis:

| Ação | Comando |
|---|---|
| Listar containers rodando | `docker ps` |
| Listar todos os containers (incl. parados) | `docker ps -a` |
| Listar imagens locais | `docker images` |
| Remover um container | `docker rm <container>` |
| Remover uma imagem | `docker rmi <imagem>` |
| Ver logs de um container específico | `docker logs -f <container>` |
| Limpar containers/imagens/redes não usados | `docker system prune` |

Acesso local (tudo através do nginx, porta única):
- Site: **http://localhost:8080**
- API: **http://localhost:8080/api/health**, **http://localhost:8080/api/chamados**, etc.

> Em dev, o nginx faz proxy de `/` para o servidor do Vite (`frontend`,
> porta 5173) com suporte a WebSocket — então o hot reload funciona
> normalmente acessando só a porta 8080. Se preferir, também dá pra acessar o
> Vite direto em `http://localhost:5173` (o `docker-compose.yml` não publica
> essa porta por padrão; adicione `ports: ["5173:5173"]` ao serviço
> `frontend` se quiser isso).

---

## Kubernetes

### 1. Build das imagens de produção

O Deployment do nginx usa a imagem `projeto-nginx:latest` (`Dockerfile` da
raiz — builda o frontend e embute o `dist/`) e o Deployment da API usa
`projeto-backend:latest` (`backend/Dockerfile`, estágio `prod`). O Postgres
usa a imagem oficial `postgres:16-alpine`, não precisa de build.

```bash
docker build -t projeto-nginx:latest .
docker build -t projeto-backend:latest ./backend --target prod
```

### 2. Pré-requisito: metrics-server (necessário para o HPA)

O `HorizontalPodAutoscaler` só funciona com o `metrics-server` instalado no
cluster (ele que expõe uso de CPU/memória dos pods pra API do Kubernetes).
Clusters gerenciados (EKS/GKE/AKS) geralmente já vêm com um equivalente; em
Minikube/Kind precisa instalar manualmente:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Minikube
minikube addons enable metrics-server

# Kind (certificado do kubelet é self-signed, precisa dessa flag extra)
kubectl patch deployment metrics-server -n kube-system --type=json \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
```

Verifique com `kubectl top nodes` — se retornar números (não erro), está pronto.

### 3. Disponibilizar as imagens para o cluster local

Se o cluster roda em outro daemon Docker (Minikube, Kind), o `kubectl` não
enxerga as imagens construídas no seu Docker "normal" — é preciso carregá-las
no cluster. Use o comando referente ao ambiente que você tiver:

```bash
# Minikube
eval $(minikube docker-env)
docker build -t projeto-nginx:latest .
docker build -t projeto-backend:latest ./backend --target prod

# Kind
kind load docker-image projeto-nginx:latest
kind load docker-image projeto-backend:latest

# Docker Desktop (Kubernetes integrado) ou k3s com containerd local
# nenhum passo extra é necessário, o daemon já é compartilhado
```

### 4. Aplicar os manifests

```bash
# aplica tudo de uma vez (os probes cuidam da ordem de disponibilidade)
kubectl apply -f k8s/

# ou, se preferir subir na ordem lógica (banco → API → nginx, com os HPAs):
kubectl apply -f k8s/postgres-secret.yaml -f k8s/postgres-pvc.yaml -f k8s/postgres-deployment.yaml -f k8s/postgres-service.yaml
kubectl apply -f k8s/backend-secret.yaml -f k8s/backend-deployment.yaml -f k8s/backend-service.yaml -f k8s/backend-hpa.yaml
kubectl apply -f k8s/nginx-deployment.yaml -f k8s/nginx-service.yaml -f k8s/nginx-hpa.yaml
```

Acesso ao site publicado pelo Service (`NodePort` 30080):

```bash
# Minikube
minikube service projeto-nginx --url

# Kind / Docker Desktop / cluster local genérico
kubectl get nodes -o wide   # pegue o IP interno de um node
# depois acesse http://<IP-do-node>:30080
```

### 5. Comandos de gerenciamento do cluster

| Ação | Comando |
|---|---|
| Ver info do cluster | `kubectl cluster-info` |
| Listar nodes | `kubectl get nodes` |
| Ver contexto atual | `kubectl config current-context` |
| Listar contexts disponíveis | `kubectl config get-contexts` |
| Trocar de context | `kubectl config use-context <nome>` |

### 6. Comandos de gerenciamento de Deployments

| Ação | Comando |
|---|---|
| Listar deployments | `kubectl get deployments` |
| Detalhes do deployment | `kubectl describe deployment projeto-nginx` |
| Escalar réplicas manualmente | `kubectl scale deployment projeto-nginx --replicas=3` |
| Atualizar imagem (rolling update) | `kubectl set image deployment/projeto-nginx nginx=projeto-nginx:latest` |
| Ver histórico de rollout | `kubectl rollout history deployment/projeto-nginx` |
| Status do rollout | `kubectl rollout status deployment/projeto-nginx` |
| Desfazer último rollout | `kubectl rollout undo deployment/projeto-nginx` |
| Reiniciar todos os pods do deployment | `kubectl rollout restart deployment/projeto-nginx` |
| Remover o deployment | `kubectl delete -f k8s/nginx-deployment.yaml` |

> Os mesmos comandos valem para os outros dois componentes, trocando o nome
> do deployment: `backend` (`k8s/backend-deployment.yaml`) e `postgres`
> (`k8s/postgres-deployment.yaml`).
>
> **Atenção:** `nginx` e `backend` têm HPA — escalar manualmente com `kubectl
> scale` só tem efeito até o próximo ciclo de avaliação do HPA (a cada ~15s),
> que reajusta pro número de réplicas que a métrica de CPU/memória mandar. Pra
> mudar o comportamento de verdade, edite `minReplicas`/`maxReplicas` no
> `*-hpa.yaml`.

### 7. Comandos de gerenciamento do HPA (HorizontalPodAutoscaler)

| Ação | Comando |
|---|---|
| Listar HPAs (réplicas atuais/min/max, uso de CPU/memória) | `kubectl get hpa` |
| Acompanhar em tempo real | `kubectl get hpa -w` |
| Detalhes e eventos de scaling | `kubectl describe hpa backend` |
| Ver uso real de CPU/memória por pod | `kubectl top pods` |
| Remover o HPA (volta a réplicas fixas do Deployment) | `kubectl delete -f k8s/backend-hpa.yaml` |

Pra testar o scale-up na prática, gere carga contra o serviço `backend` de
dentro do cluster e acompanhe com `kubectl get hpa -w`:

```bash
kubectl run load-test --image=busybox --restart=Never -- /bin/sh -c \
  'for i in $(seq 1 40); do (while true; do wget -q -O- http://backend:3000/api/health >/dev/null; done) & done; sleep 180'

# em outro terminal
kubectl get hpa -w

# ao terminar o teste
kubectl delete pod load-test
```

Depois de parar a carga, o `scaleDown.stabilizationWindowSeconds: 300`
configurado nos HPAs faz o cluster esperar 5 minutos de métricas baixas antes
de remover réplicas — evita ficar oscilando (scale up/down) à toa.

### 8. Comandos de gerenciamento de Pods

| Ação | Comando |
|---|---|
| Listar pods | `kubectl get pods` |
| Listar pods com mais detalhes (nó, IP) | `kubectl get pods -o wide` |
| Ver pods em tempo real | `kubectl get pods -w` |
| Detalhes de um pod | `kubectl describe pod <nome-do-pod>` |
| Ver logs de um pod | `kubectl logs <nome-do-pod>` |
| Ver logs em tempo real | `kubectl logs -f <nome-do-pod>` |
| Entrar em um pod (shell) | `kubectl exec -it <nome-do-pod> -- sh` |
| Apagar um pod (o Deployment recria automaticamente) | `kubectl delete pod <nome-do-pod>` |

### 9. Comandos de gerenciamento de Services

| Ação | Comando |
|---|---|
| Listar services | `kubectl get svc` |
| Detalhes do service | `kubectl describe svc projeto-nginx` |
| Encaminhar porta local → service (alternativa ao NodePort) | `kubectl port-forward svc/projeto-nginx 8080:80` |
| Remover o service | `kubectl delete -f k8s/nginx-service.yaml` |

> `backend` e `postgres` são `ClusterIP` — não expostos fora do cluster. Para
> depurar diretamente: `kubectl port-forward svc/backend 3000:3000` ou
> `kubectl port-forward svc/postgres 5432:5432`.

### 10. Aplicar/remover tudo de uma vez

```bash
# aplicar todos os manifests da pasta k8s/
kubectl apply -f k8s/

# remover todos os manifests da pasta k8s/
kubectl delete -f k8s/
```

---

## Scripts de inicialização e encerramento

Os scripts da raiz automatizam o ciclo completo do ambiente Kubernetes local
com Kind. Antes de executar, confirme que `docker`, `kind` e `kubectl` estão
instalados e que o Docker está em execução.

### Inicializar o ambiente

```bash
./_init.sh
```

O script:

1. cria o cluster Kind `fullstack` caso ele ainda não exista;
2. configura o contexto do `kubectl`;
3. constrói as imagens `projeto-nginx:latest` e `projeto-backend:latest`;
4. carrega as imagens no cluster;
5. instala/configura o Metrics Server;
6. aplica os manifests de `k8s/` e aguarda os deployments.

Para usar outro nome de cluster:

```bash
KIND_CLUSTER_NAME=meu-cluster ./_init.sh
```

Ao final, acesse a aplicação com:

```bash
kubectl port-forward service/projeto-nginx 8080:80
```

### Encerrar o ambiente

```bash
./_down.sh
```

O script remove os recursos definidos em `k8s/` e destrói o cluster Kind,
incluindo o PVC do Postgres e os dados armazenados nele. Para selecionar outro
cluster, use a mesma variável:

```bash
KIND_CLUSTER_NAME=meu-cluster ./_down.sh
```

> Use `_down.sh` somente quando quiser recriar o ambiente do zero. Para apenas
> parar os containers do Docker Compose, use `docker compose stop` ou
> `docker compose down`, conforme a necessidade.

---

## Parar tudo (Docker Compose + Kubernetes + cluster Kind)

Guia rápido pra derrubar todo o ambiente de uma vez — útil ao final do dia ou
antes de liberar recursos da máquina.

### Docker Compose

| Ação | Comando |
|---|---|
| Parar e remover containers/rede do projeto | `docker compose down` |
| Idem, e também remover o volume do Postgres (apaga os dados!) | `docker compose down -v` |
| Só parar (sem remover containers) | `docker compose stop` |
| Matar na força bruta (SIGKILL, sem esperar shutdown gracioso) | `docker compose kill` |

### Kubernetes (dentro do cluster)

| Ação | Comando |
|---|---|
| Remover deployments + HPAs (mata os pods, mantém service/secret/pvc) | `kubectl delete -f k8s/nginx-deployment.yaml -f k8s/nginx-hpa.yaml -f k8s/backend-deployment.yaml -f k8s/backend-hpa.yaml -f k8s/postgres-deployment.yaml` |
| Remover **tudo** da pasta `k8s/` (inclui service, secret e o PVC — cuidado, apaga os dados do Postgres) | `kubectl delete -f k8s/` |
| Apagar todos os deployments do namespace default | `kubectl delete deployment --all -n default` |
| Apagar todos os pods do namespace default | `kubectl delete pod --all -n default` |
| Apagar um pod imediatamente, sem esperar o graceful shutdown | `kubectl delete pod <nome> --grace-period=0 --force` |

> Só rodar `kubectl delete -f k8s/` (ou remover o `postgres-pvc.yaml`) se
> realmente quiser perder os dados do banco — o `PersistentVolumeClaim` some
> junto. Pra só parar os pods e poder religar depois com `kubectl apply -f
> k8s/` sem perder nada, prefira apagar só deployments/HPAs.

### Cluster Kind (o "servidor" Kubernetes local)

O cluster Kind roda dentro de um único container Docker chamado
`<nome-do-cluster>-control-plane` (ex.: `fullstack-control-plane`). Descubra o
nome com `kind get clusters` ou `docker ps --filter "name=control-plane"`.

| Ação | Comando |
|---|---|
| **Pausar** o cluster (reversível — os dados internos ficam intactos) | `docker stop <cluster>-control-plane` |
| Religar o cluster pausado | `docker start <cluster>-control-plane` |
| **Destruir** o cluster de vez (apaga tudo: nodes, volumes, etcd) | `kind delete cluster --name <cluster>` |
| Listar clusters Kind existentes | `kind get clusters` |

### Docker em geral (matar tudo que estiver rodando na máquina)

| Ação | Comando |
|---|---|
| Listar containers em execução | `docker ps` |
| Parar todos os containers em execução (graceful) | `docker stop $(docker ps -q)` |
| Matar todos os containers em execução (SIGKILL imediato) | `docker kill $(docker ps -q)` |
| Remover todos os containers parados | `docker container prune` |
| Limpeza geral (containers parados, imagens/redes não usadas) | `docker system prune` |
| Limpeza geral incluindo volumes não usados (cuidado, apaga dados) | `docker system prune --volumes` |

> `docker stop $(docker ps -q)` afeta **todos** os containers Docker da
> máquina, não só os deste projeto — use com atenção se houver outros
> projetos rodando ao mesmo tempo.

---

## Fluxo resumido

```bash
# inicializar cluster, imagens, Metrics Server e manifests
./_init.sh

# acompanhar
kubectl get pods -w

# encerrar e destruir o cluster Kind
./_down.sh
```

---

## Teste de carga

O script de `k6` que existia (`loadtest/mural-recados.js`) foi removido junto
com a API de recados que ele exercitava. Um novo script para os endpoints de
chamados pode ser escrito seguindo o mesmo padrão (`k6 run
loadtest/chamados.js`, com `setup()` fazendo login e reaproveitando o token
JWT nas requisições) — ainda não foi feito.
