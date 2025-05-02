```
kubeseal \                                                                                                                                                kirillsalykin@mac
  --fetch-cert \
  --controller-namespace kube-system \
  --controller-name sealed-secrets-controller \
  > pub-cert.pem
```

```
kubeseal \
  --format yaml \
  --cert pub-cert.pem \
  < plain-secret.yaml \
  > sealedsecret.yaml
```
