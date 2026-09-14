#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
CLUSTER_NAME="${KIND_CLUSTER_NAME:-fullstack}"
KIND_CONTEXT="kind-${CLUSTER_NAME}"

command -v kubectl >/dev/null 2>&1 || {
    echo "Erro: comando 'kubectl' não encontrado." >&2
    exit 1
}

command -v kind >/dev/null 2>&1 || {
    echo "Erro: comando 'kind' não encontrado." >&2
    exit 1
}

cd "$ROOT_DIR"

if kind get clusters | grep -Fxq "$CLUSTER_NAME"; then
    kind export kubeconfig --name "$CLUSTER_NAME" >/dev/null
    kubectl config use-context "$KIND_CONTEXT" >/dev/null
    echo "Removendo deployments, services, HPAs, secrets e PVCs..."
    kubectl delete -f "$ROOT_DIR/k8s/" --ignore-not-found

    echo "Destruindo cluster Kind '$CLUSTER_NAME'..."
    kind delete cluster --name "$CLUSTER_NAME"
else
    echo "Cluster Kind '$CLUSTER_NAME' não existe."
fi
