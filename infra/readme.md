1. setup nodes & k3s

```
op read "op://Private/Default/publicKey" > "$HOME/.ssh/id_rsa.pub" && chmod 644 "$HOME/.ssh/id_rsa.pub"

```

2. setup flux

```
flux bootstrap github \
  --components=source-controller,kustomize-controller,helm-controller,notification-controller \
  --components-extra=image-reflector-controller,image-automation-controller \
  --owner=$GITHUB_USER \
  --repository=project \
  --branch=main \
  --path=infra/prod \
  --read-write-key \
  --personal

```
