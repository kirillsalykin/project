terraform {
  required_version = ">= 1.4.0"
  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.50.1"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.4.0"
    }
  }
}

provider "hcloud" {
  token = var.hcloud_token
}

variable "hcloud_token" {
  type      = string
  sensitive = true
}

variable "ssh_public_key" {
  type        = string
  description = "1Password path for SSH public key"
}

variable "cluster_name" {
  type    = string
  default = "prod"
}

variable "location" {
  type        = string
  description = "Hetzner Cloud location/zone (e.g., nbg1, fsn1, hel1, ash, hil, sin)"
  default     = "ash"
}

variable "node_type" {
  type        = string
  description = "Hetzner server flavor for k3s nodes"
  default     = "cpx11"
}

variable "private_network_zone" {
  type        = string
  description = "Network zone for the private subnet (must match location, e.g. 'eu-central', 'us-west')"
  default     = "us-east"
}

resource "random_password" "k3s_token" {
  length  = 16
  lower   = true
  upper   = true
  numeric = true
  special = false
}

locals {
  nodes = [
    { name = "node-1", ip = "10.10.0.10", init = true  },
    { name = "node-2", ip = "10.10.0.11", init = false },
  ]
  control_plane_ip = local.nodes[0].ip
}

resource "hcloud_network" "private_net" {
  name     = "net"
  ip_range =  "10.10.0.0/16"
}

resource "hcloud_network_subnet" "private_subnet" {
  network_id   = hcloud_network.private_net.id
  type         = "server"
  ip_range     = "10.10.0.0/16"
  network_zone = var.private_network_zone
}

data "external" "ssh_key" {
  program = [
    "sh", "-c",
    <<-EOT
      PUBLIC=$(op read "${var.ssh_public_key}")
      jq -n --arg k "$PUBLIC" '{public_key: $k}'
    EOT
  ]
}

resource "hcloud_ssh_key" "deployer" {
  name       = "${var.cluster_name}-deployer-key"
  public_key = data.external.ssh_key.result.public_key
}

resource "hcloud_server" "node" {
  for_each    = { for n in local.nodes : n.name => n }
  name        = each.key
  server_type = var.node_type
  image       = "ubuntu-22.04"
  location    = var.location
  ssh_keys    = [hcloud_ssh_key.deployer.id]

  depends_on = [
    hcloud_network_subnet.private_subnet
  ]

  network {
    network_id = hcloud_network.private_net.id
    ip         = each.value.ip
  }

  user_data = <<EOF
#!/bin/bash
set -e
TOKEN="${random_password.k3s_token.result}"
CONTROL_PLANE_IP="${local.control_plane_ip}"

if ${each.value.init}; then
  curl -sfL https://get.k3s.io | \
    K3S_TOKEN="$TOKEN" \
    INSTALL_K3S_EXEC="--cluster-init --tls-san $CONTROL_PLANE_IP --disable servicelb --disable traefik" \
    sh -

  echo "Waiting for k3s API..."
  until k3s kubectl get --raw /healthz > /dev/null; do
    sleep 1
  done

  echo "Setting the secret"
  cat <<SECRET | k3s kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: hcloud
  namespace: kube-system
stringData:
  token: "${var.hcloud_token}"
  network: "${hcloud_network.private_net.id}"
SECRET

else
  curl -sfL https://get.k3s.io | \
    K3S_TOKEN="$TOKEN" \
    K3S_URL="https://$CONTROL_PLANE_IP:6443" \
    INSTALL_K3S_EXEC="--tls-san $CONTROL_PLANE_IP --disable servicelb --disable traefik" \
    sh -
fi
EOF
}
