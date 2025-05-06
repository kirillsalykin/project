#!/usr/bin/env bash
set -euo pipefail

CERT_ID=$(hcloud certificate create \
   --type    managed \
   --name    "${DOMAIN}" \
   --domain  "${DOMAIN}" \
   --output  json \
   | jq -r '.certificate.id')

LB_NAME=$(hcloud load-balancer list \
  --output columns=name \
  --output noheader)

 hcloud load-balancer add-service $LB_NAME \
   --protocol https \
   --listen-port 443 \
   --destination-port 30080 \
   --http-certificates "${CERT_ID}"

