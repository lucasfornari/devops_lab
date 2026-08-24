# Projeto

Aplicação com 3 camadas, cada uma no seu próprio container/pod:

- **nginx** — serve o site estático (`www/`) e faz proxy reverso de `/api/*` para a API
- **web** — API em Node.js/Express, conversa com o Postgres
- **postgres** — banco de dados

Deploy no Kubernetes com um `Deployment` por componente. `nginx` e `web` têm
`HorizontalPodAutoscaler` (nginx: 3-10 réplicas, web: 2-8 réplicas, baseado em
CPU/memória) — o `postgres` fica fixo em **1 réplica** (não escala horizontalmente
sem replicação de dados).

## Estrutura de pastas

```
projeto/
├── docker-compose.yml      # Ambiente de desenvolvimento local (nginx + web + postgres)
├── Dockerfile              # Imagem de produção do nginx (arquivos do www/ embutidos) — usada pelo k8s
├── devops/
│   └── nginx/
│       ├── Dockerfile      # Imagem de dev usada pelo docker-compose
│       ├── nginx.conf      # Configuração principal do Nginx
│       └── conf.d/
│           └── default.conf   # Serve www/ em "/" e faz proxy de "/api/" para o serviço web
├── web/
│   ├── Dockerfile           # Imagem da API
│   ├── package.json
│   └── server.js            # Express: /api/health e CRUD completo em /api/recados (mural de recados)
├── k8s/
│   ├── nginx-deployment.yaml
│   ├── nginx-service.yaml    # Service NodePort — expõe o site
│   ├── nginx-hpa.yaml        # HorizontalPodAutoscaler (3-10 réplicas)
│   ├── web-deployment.yaml
│   ├── web-service.yaml      # Service ClusterIP — só acessível dentro do cluster
│   ├── web-hpa.yaml          # HorizontalPodAutoscaler (2-8 réplicas)
│   ├── postgres-deployment.yaml
│   ├── postgres-service.yaml # Service ClusterIP
│   ├── postgres-secret.yaml  # Credenciais (dev/local apenas)
│   └── postgres-pvc.yaml     # Armazenamento persistente do banco
└── www/                    # Código do site (HTML, CSS, JS, imagens)
```

> **Por que existem dois Dockerfiles?** O `devops/nginx/Dockerfile` é usado
> pelo `docker-compose` em desenvolvimento, onde a pasta `www/` é montada
> como volume (edita o arquivo local e o navegador já reflete a mudança).
> O Kubernetes não tem esse bind mount com o seu host, então o
> `Dockerfile` da raiz copia o `www/` **para dentro da imagem** — é essa
> imagem que os pods do cluster vão rodar.

---

## Docker / Docker Compose (desenvolvimento local)

| Ação | Comando |
|---|---|
| Subir o ambiente | `docker compose up -d` |
| Subir e reconstruir a imagem | `docker compose up -d --build` |
| Ver containers rodando | `docker compose ps` |
| Ver logs (em tempo real) | `docker compose logs -f` |
| Parar os containers | `docker compose stop` |
| Parar e remover containers/rede | `docker compose down` |
| Entrar no container | `docker exec -it nginx-server sh` |

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

Acesso local:
- Site: **http://localhost:8080**
- API: **http://localhost:8080/api/health** e **http://localhost:8080/api/recados** (mural de recados, salvo no Postgres)

---

## Kubernetes

### 1. Build das imagens de produção

O Deployment do nginx usa a imagem `projeto-nginx:latest` (`Dockerfile` da
raiz, já inclui os arquivos do `www/`) e o Deployment da API usa
`projeto-web:latest` (`web/Dockerfile`). O Postgres usa a imagem oficial
`postgres:16-alpine`, não precisa de build.

```bash
docker build -t projeto-nginx:latest .
docker build -t projeto-web:latest ./web
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
docker build -t projeto-web:latest ./web

# Kind
kind load docker-image projeto-nginx:latest
kind load docker-image projeto-web:latest

# Docker Desktop (Kubernetes integrado) ou k3s com containerd local
# nenhum passo extra é necessário, o daemon já é compartilhado
```

### 4. Aplicar os manifests

```bash
# aplica tudo de uma vez (os probes cuidam da ordem de disponibilidade)
kubectl apply -f k8s/

# ou, se preferir subir na ordem lógica (banco → API → nginx, com os HPAs):
kubectl apply -f k8s/postgres-secret.yaml -f k8s/postgres-pvc.yaml -f k8s/postgres-deployment.yaml -f k8s/postgres-service.yaml
kubectl apply -f k8s/web-deployment.yaml -f k8s/web-service.yaml -f k8s/web-hpa.yaml
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
> do deployment: `web` (`k8s/web-deployment.yaml`) e `postgres`
> (`k8s/postgres-deployment.yaml`).
>
> **Atenção:** `nginx` e `web` têm HPA — escalar manualmente com `kubectl scale`
> só tem efeito até o próximo ciclo de avaliação do HPA (a cada ~15s), que
> reajusta pro número de réplicas que a métrica de CPU/memória mandar. Pra
> mudar o comportamento de verdade, edite `minReplicas`/`maxReplicas` no
> `*-hpa.yaml`.

### 7. Comandos de gerenciamento do HPA (HorizontalPodAutoscaler)

| Ação | Comando |
|---|---|
| Listar HPAs (réplicas atuais/min/max, uso de CPU/memória) | `kubectl get hpa` |
| Acompanhar em tempo real | `kubectl get hpa -w` |
| Detalhes e eventos de scaling | `kubectl describe hpa web` |
| Ver uso real de CPU/memória por pod | `kubectl top pods` |
| Remover o HPA (volta a réplicas fixas do Deployment) | `kubectl delete -f k8s/web-hpa.yaml` |

Pra testar o scale-up na prática, gere carga contra o serviço `web` de dentro
do cluster e acompanhe com `kubectl get hpa -w`:

```bash
kubectl run load-test --image=busybox --restart=Never -- /bin/sh -c \
  'for i in $(seq 1 40); do (while true; do wget -q -O- http://web:3000/api/health >/dev/null; done) & done; sleep 180'

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

> `web` e `postgres` são `ClusterIP` — não expostos fora do cluster. Para
> depurar diretamente: `kubectl port-forward svc/web 3000:3000` ou
> `kubectl port-forward svc/postgres 5432:5432`.

### 10. Aplicar/remover tudo de uma vez

```bash
# aplicar todos os manifests da pasta k8s/
kubectl apply -f k8s/

# remover todos os manifests da pasta k8s/
kubectl delete -f k8s/
```

---

## Fluxo resumido

```bash
# 1. build das imagens de produção
docker build -t projeto-nginx:latest .
docker build -t projeto-web:latest ./web

# 2. (se necessário) carregar as imagens no cluster local — ver seção Kubernetes acima

# 3. deploy no Kubernetes (nginx + web + postgres)
kubectl apply -f k8s/

# 4. acompanhar
kubectl get pods -w
```
