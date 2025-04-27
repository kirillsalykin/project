1. setup nodes & k3s

```
export HCLOUD_TOKEN="hcloud_xxx…"

tofu init 
tofu plan
tofu apply

scp -o StrictHostKeyChecking=no root@<control_plane_id>:/etc/rancher/k3s/k3s.yaml ./k3s.yaml

export KUBECONFIG=./kubeconfig.yaml
```

2. setup flux

```
export GITHUB_USER=...
export GITHUB_TOKEN=...

flux bootstrap github \
  --components-extra=image-reflector-controller,image-automation-controller \
  --owner=$GITHUB_USER \
  --repository=project \
  --branch=main \
  --path=infra/prod \
  --read-write-key \
  --personal

```
