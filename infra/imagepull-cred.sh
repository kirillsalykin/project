#!/usr/bin/env bash
set -euo pipefail

: "${DOCKERHUB_USER:?Need to set DOCKERHUB_USER}"
: "${DOCKERHUB_TOKEN:?Need to set DOCKERHUB_TOKEN}"

AUTH=$(printf "%s:%s" "$DOCKERHUB_USER" "$DOCKERHUB_TOKEN" | base64 -w0)
DOCKER_CFG_JSON=$(printf '{"auths":{"https://index.docker.io/v1/":{"auth":"%s"}}}' "$AUTH")

kubectl create secret generic "imagepull-cred" \
  --namespace "default" \
  --type=kubernetes.io/dockerconfigjson \
  --from-literal=.dockerconfigjson="$DOCKER_CFG_JSON" \
  --dry-run=client -o yaml \
| kubectl apply -f -

kubectl create secret generic "imagepull-cred" \
  --namespace "flux-system" \
  --type=kubernetes.io/dockerconfigjson \
  --from-literal=.dockerconfigjson="$DOCKER_CFG_JSON" \
  --dry-run=client -o yaml \
| kubectl apply -f -

