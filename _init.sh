#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
CLUSTER_NAME="${KIND_CLUSTER_NAME:-fullstack}"
KIND_CONTEXT="kind-${CLUSTER_NAME}"

require_command() {
    command -v "$1" >/dev/null 2>&1 || {
        echo "Erro: comando '$1' não encontrado." >&2
        exit 1
    }
}

require_command docker
require_command kind
require_command kubectl

cd "$ROOT_DIR"

if ! kind get clusters | grep -Fxq "$CLUSTER_NAME"; then
    echo "Criando cluster Kind '$CLUSTER_NAME'..."
    kind create cluster --name "$CLUSTER_NAME"
else
    echo "Cluster Kind '$CLUSTER_NAME' já existe."
fi

# Recreate the kubeconfig entry when a cluster was created from another shell
# or the local kubeconfig was removed.
kind export kubeconfig --name "$CLUSTER_NAME" >/dev/null
kubectl config use-context "$KIND_CONTEXT" >/dev/null

echo "Construindo imagens..."
docker build -t projeto-nginx:latest .
docker build -t projeto-backend:latest ./backend

echo "Carregando imagens no Kind..."
kind load docker-image projeto-nginx:latest --name "$CLUSTER_NAME"
kind load docker-image projeto-backend:latest --name "$CLUSTER_NAME"

echo "Instalando/atualizando Metrics Server..."
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

METRICS_ARGS="$(
    kubectl -n kube-system get deployment metrics-server \
        -o jsonpath='{.spec.template.spec.containers[0].args[*]}'
)"

if [[ "$METRICS_ARGS" != *"--kubelet-insecure-tls"* ]]; then
    echo "Configurando Metrics Server para Kind..."
    kubectl patch deployment metrics-server -n kube-system --type=json \
        -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
fi

echo "Aguardando Metrics Server..."
kubectl -n kube-system rollout status deployment/metrics-server --timeout=120s

echo "Aplicando manifests Kubernetes..."
kubectl apply -f "$ROOT_DIR/k8s/"

echo "Aguardando os deployments..."
kubectl rollout status deployment/postgres --timeout=180s
kubectl rollout status deployment/backend --timeout=180s
kubectl rollout status deployment/projeto-nginx --timeout=180s

echo
kubectl get pods

echo
kubectl get services

echo
echo "Aplicação disponível via:"
echo "  kubectl port-forward service/projeto-nginx 8080:80"
echo "  http://localhost:8080"
