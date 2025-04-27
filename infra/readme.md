1. run main.tf

```
export HCLOUD_TOKEN="hcloud_xxx…"

tofu init 
tofu plan
tofu apply

scp -o StrictHostKeyChecking=no root@<control_plane_id>:/etc/rancher/k3s/k3s.yaml ./k3s.yaml

export KUBECONFIG=./kubeconfig.yaml
```

