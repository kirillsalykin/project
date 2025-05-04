#!/usr/bin/env bash
set -euo pipefail

NAMESPACE=default
BASE_NAME=imagepull-cred
SEALED_CERT=../pub-cert.pem

: "${DOCKERHUB_USER:?Need to set DOCKERHUB_USER}"
: "${DOCKERHUB_TOKEN:?Need to set DOCKERHUB_PASS}"

AUTH=$(printf "%s:%s" "$DOCKERHUB_USER" "$DOCKERHUB_TOKEN" | base64 -w0)
DOCKER_CFG_JSON=$(printf '{"auths":{"https://index.docker.io/v1/":{"auth":"%s"}}}' "$AUTH")
HASH=$(printf '%s' "$DOCKER_CFG_JSON" \
  | sha256sum \
  | awk '{print substr($1,1,8)}')

SECRET_NAME="${BASE_NAME}-${HASH}"

kubectl create secret generic "$SECRET_NAME" \
  --namespace="$NAMESPACE" \
  --type=kubernetes.io/dockerconfigjson \
  --from-literal=.dockerconfigjson="$DOCKER_CFG_JSON" \
  --dry-run=client -o yaml \
| kubeseal --format=yaml --cert "$SEALED_CERT" \
> "${SECRET_NAME}.yaml"

echo "${SECRET_NAME}.yaml"
