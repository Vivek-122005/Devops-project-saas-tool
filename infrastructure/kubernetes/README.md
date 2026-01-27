# Kubernetes Manifests

This directory contains Kubernetes manifests for deploying the SaaS platform.

## Structure

```
kubernetes/
├── base/                    # Base configurations
│   ├── namespace.yaml
│   ├── configmap.yaml
│   └── secrets.yaml
├── backend/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml             # Horizontal Pod Autoscaler
│   └── pdb.yaml             # Pod Disruption Budget
├── frontend/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   └── pdb.yaml
├── database/
│   ├── statefulset.yaml
│   ├── service.yaml
│   └── pvc.yaml             # Persistent Volume Claim
├── ingress/
│   ├── ingress.yaml
│   ├── certificate.yaml     # TLS certificate
│   └── issuer.yaml          # cert-manager issuer
└── monitoring/
    ├── prometheus.yaml
    ├── grafana.yaml
    └── servicemonitor.yaml
```

## Prerequisites

- Kubernetes cluster (v1.28+)
- kubectl configured
- Helm (optional, for package management)

## Deployment

### 1. Create namespace

```bash
kubectl apply -f base/namespace.yaml
```

### 2. Create secrets

```bash
# Create secrets from environment variables
kubectl create secret generic app-secrets \
  --from-literal=database-url=${DATABASE_URL} \
  --from-literal=jwt-secret=${JWT_SECRET} \
  --namespace=saas-production
```

### 3. Deploy database (if not using external DB)

```bash
kubectl apply -f database/
```

### 4. Deploy backend

```bash
kubectl apply -f backend/
```

### 5. Deploy frontend

```bash
kubectl apply -f frontend/
```

### 6. Deploy ingress

```bash
kubectl apply -f ingress/
```

## Monitoring Deployment

```bash
# Check pod status
kubectl get pods -n saas-production

# Check services
kubectl get svc -n saas-production

# Check ingress
kubectl get ingress -n saas-production

# View logs
kubectl logs -f deployment/backend-deployment -n saas-production
```

## Scaling

### Manual scaling

```bash
kubectl scale deployment backend-deployment --replicas=5 -n saas-production
```

### Auto-scaling (HPA)

The Horizontal Pod Autoscaler is configured to scale based on:
- CPU utilization (target: 70%)
- Memory utilization (target: 80%)

## Rolling Updates

```bash
# Update image
kubectl set image deployment/backend-deployment \
  backend=ghcr.io/username/backend:v2.0.0 \
  -n saas-production

# Check rollout status
kubectl rollout status deployment/backend-deployment -n saas-production

# Rollback if needed
kubectl rollout undo deployment/backend-deployment -n saas-production
```

## Health Checks

Liveness and readiness probes are configured:

- **Liveness**: Checks if the container is alive
- **Readiness**: Checks if the container is ready to serve traffic

## Resource Limits

All deployments have resource requests and limits:

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

## Security

- Run containers as non-root user
- Use read-only root filesystem
- Enable Pod Security Standards
- Network policies for pod communication
- RBAC for access control

## Backup and Disaster Recovery

- Database: Automated daily backups via StatefulSet
- PersistentVolumes: Snapshot schedule configured
- etcd: Cluster backup every 6 hours

## Troubleshooting

```bash
# Describe pod for detailed info
kubectl describe pod <pod-name> -n saas-production

# Get events
kubectl get events -n saas-production --sort-by='.lastTimestamp'

# Execute command in pod
kubectl exec -it <pod-name> -n saas-production -- /bin/sh

# Port forward for local testing
kubectl port-forward svc/backend-service 5000:5000 -n saas-production
```
