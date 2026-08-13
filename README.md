# Déploiement d'un site statique — NGINX + Kubernetes (k3s)

Ce projet déploie un site statique servi par NGINX sur un cluster Kubernetes (k3s), avec haute disponibilité via un ReplicaSet, exposition via un Service, routage via un Ingress NGINX, et sécurisation TLS avec un certificat auto-signé.

## Structure du projet

```
projet/
├── Dockerfile
├── manifest.yml
└── web/
    ├── Documentation/
    └── HTML/
```

---

## 1. Image Docker du site

Le site statique (`web/HTML/`) est packagé dans une image NGINX Alpine.

**Dockerfile**
```dockerfile
FROM nginx:1.27-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY web/HTML/ /usr/share/nginx/html/
EXPOSE 80
```

**Build**
```bash
docker build -t ghcr.io/tonuser/site-statique:v1.0.0 .
```

**Test local**
```bash
docker run --rm -p 8080:80 ghcr.io/tonuser/site-statique:v1.0.0
curl http://localhost:8080
```

---

## 2. Registre d'images — GHCR (GitHub Container Registry)

L'image est poussée sur GHCR pour être accessible par le cluster.

```bash
docker login ghcr.io
docker push ghcr.io/tonuser/site-statique:v1.0.0
```

Si le package est privé, créer le secret d'authentification dans le cluster :
```bash
kubectl create secret docker-registry ghcr-creds \
  --docker-server=ghcr.io \
  --docker-username=tonuser \
  --docker-password=<token> \
  --docker-email=ton@email.com
```

**Vérifications**
```bash
kubectl get secret ghcr-creds
kubectl describe pod <nom-du-pod>          # section Events : Successfully pulled image
kubectl get pod <nom-du-pod> -o jsonpath='{.status.containerStatuses[0].imageID}'
```

---

## 3. ReplicaSet — 4 instances du site

Garantit qu'un nombre fixe de Pods (4) tourne en permanence ; recrée automatiquement tout Pod supprimé.

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: site-statique-rs
  labels:
    app: site-statique
spec:
  replicas: 4
  selector:
    matchLabels:
      app: site-statique
  template:
    metadata:
      labels:
        app: site-statique
    spec:
      containers:
        - name: nginx
          image: ghcr.io/tonuser/site-statique:v1.0.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 80
      imagePullSecrets:
        - name: ghcr-creds
```

**Vérifications**
```bash
kubectl get rs
kubectl get pods -o wide

# Test d'auto-réparation
kubectl delete pod <nom-d-un-pod>
kubectl get pods -w   # un nouveau pod doit réapparaître automatiquement
```

---

## 4. Service — exposition interne et répartition de charge

Expose les 4 Pods derrière une seule IP stable au sein du cluster.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: site-statique-svc
spec:
  selector:
    app: site-statique
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP
```

**Vérifications**
```bash
kubectl get svc site-statique-svc
kubectl get endpoints site-statique-svc   # doit lister les 4 IPs de Pods
```

---

## 5. NGINX Ingress Controller (remplace Traefik)

k3s embarque Traefik par défaut ; il est désactivé au profit de NGINX Ingress Controller.

**Désactiver Traefik** (`/etc/rancher/k3s/config.yaml`)
```yaml
disable:
  - traefik
```
```bash
sudo systemctl restart k3s
kubectl get pods -n kube-system   # traefik ne doit plus apparaître
```

**Installer NGINX Ingress Controller (baremetal)**
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/baremetal/deploy.yaml
kubectl get pods -n ingress-nginx -w
kubectl get svc -n ingress-nginx   # noter les NodePort HTTP/HTTPS
```

---

## 6. Ingress — routage HTTP/HTTPS vers le Service

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: site-statique-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - site-statique.local
      secretName: site-statique-tls
  rules:
    - host: site-statique.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: site-statique-svc
                port:
                  number: 80
```

**Mapper le host en local**
```bash
echo "127.0.0.1 site-statique.local" | sudo tee -a /etc/hosts
```

**Vérifications**
```bash
kubectl get ingress
kubectl describe ingress site-statique-ingress
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller --tail=50
```

---

## 7. TLS — certificat auto-signé

**Génération du certificat et de la clé**
```bash
openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout site-statique.key \
  -out site-statique.crt \
  -subj "/CN=site-statique.local/O=site-statique" \
  -addext "subjectAltName=DNS:site-statique.local"
```

**Création du Secret TLS**
```bash
kubectl create secret tls site-statique-tls \
  --cert=site-statique.crt \
  --key=site-statique.key
```

> Le Secret doit être dans le même namespace que l'Ingress. Le `CN`/SAN du certificat doit correspondre au `host` déclaré dans l'Ingress.

**Vérifications**
```bash
kubectl get secret site-statique-tls
kubectl describe secret site-statique-tls   # Type: kubernetes.io/tls

# Test HTTPS via port-forward
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8443:443
curl -k -H "Host: site-statique.local" https://localhost:8443

# Test redirection HTTP -> HTTPS
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80
curl -I -H "Host: site-statique.local" http://localhost:8080   # attend 308

# Vérifier le certificat réellement servi
openssl s_client -connect localhost:8443 -servername site-statique.local </dev/null 2>/dev/null | openssl x509 -noout -subject -dates
```

---

## Déploiement complet

```bash
kubectl apply -f manifest.yml
kubectl get rs,svc,ingress,pods
```

## Nettoyage

```bash
kubectl delete -f manifest.yml
kubectl delete secret site-statique-tls ghcr-creds
```

---

## Dépannage rapide

| Symptôme | Cause probable |
|---|---|
| `ImagePullBackOff` | tag inexistant sur GHCR, ou secret d'authentification manquant |
| ReplicaSet ne crée pas de Pods | `matchLabels` ≠ `template.metadata.labels` |
| Ingress renvoie 404 | Traefik encore actif, ou `ingressClassName` manquant |
| `curl: SSL certificate problem` | normal pour un certificat auto-signé, utiliser `-k` |
| Pas de section TLS dans l'Ingress | `secretName` incorrect ou mauvais namespace |
