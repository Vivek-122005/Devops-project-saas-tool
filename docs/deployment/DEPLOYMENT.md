# Deployment Guide

## Overview

This guide covers deploying the SaaS Platform to various environments.

## Prerequisites

- Docker and Docker Compose
- Kubernetes cluster (optional)
- Cloud provider account (AWS, GCP, or Azure)
- Domain name with DNS access
- SSL certificate (or Let's Encrypt)

## Deployment Options

### 1. Docker Compose (Simple Deployment)

Best for: Small teams, development, staging environments

```bash
# Clone repository
git clone https://github.com/Vivek-122005/Devops-project-saas-tool.git
cd Devops-project-saas-tool

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose ps
```

### 2. Kubernetes (Production Deployment)

Best for: Large scale, high availability, production environments

#### Step 1: Prepare Kubernetes Cluster

```bash
# AWS EKS
eksctl create cluster --name saas-cluster --region us-east-1

# Or use existing cluster
kubectl config use-context my-cluster
```

#### Step 2: Create Namespace

```bash
kubectl create namespace saas-production
kubectl config set-context --current --namespace=saas-production
```

#### Step 3: Create Secrets

```bash
kubectl create secret generic app-secrets \
  --from-literal=database-url=$DATABASE_URL \
  --from-literal=jwt-secret=$JWT_SECRET \
  --from-literal=redis-password=$REDIS_PASSWORD
```

#### Step 4: Deploy Application

```bash
# Deploy database (if not using external DB)
kubectl apply -f infrastructure/kubernetes/database/

# Deploy backend
kubectl apply -f infrastructure/kubernetes/backend/

# Deploy frontend
kubectl apply -f infrastructure/kubernetes/frontend/

# Deploy ingress
kubectl apply -f infrastructure/kubernetes/ingress/
```

#### Step 5: Verify Deployment

```bash
# Check pods
kubectl get pods

# Check services
kubectl get svc

# Check ingress
kubectl get ingress

# View logs
kubectl logs -f deployment/backend-deployment
```

### 3. AWS ECS/Fargate

Best for: AWS-native deployment, serverless containers

#### Step 1: Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name saas-production
```

#### Step 2: Create Task Definitions

```json
{
  "family": "saas-backend",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "ghcr.io/username/saas-backend:latest",
      "memory": 512,
      "cpu": 256,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ]
    }
  ]
}
```

#### Step 3: Create Services

```bash
aws ecs create-service \
  --cluster saas-production \
  --service-name backend-service \
  --task-definition saas-backend \
  --desired-count 2 \
  --launch-type FARGATE
```

## Infrastructure Setup

### Terraform Deployment

```bash
cd infrastructure/terraform

# Initialize
terraform init

# Plan
terraform plan -var-file="production.tfvars"

# Apply
terraform apply -var-file="production.tfvars"
```

### DNS Configuration

Point your domain to the load balancer:

```
app.yourapp.com -> CNAME -> load-balancer-url
api.yourapp.com -> CNAME -> load-balancer-url
```

### SSL/TLS Setup

#### Using Let's Encrypt with cert-manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f infrastructure/kubernetes/ingress/issuer.yaml
```

#### Manual Certificate

```bash
# Upload certificate to AWS ACM
aws acm import-certificate \
  --certificate fileb://certificate.pem \
  --private-key fileb://private-key.pem \
  --certificate-chain fileb://certificate-chain.pem
```

## Database Migration

### Run Migrations

```bash
# Docker Compose
docker-compose exec backend npm run migrate

# Kubernetes
kubectl exec -it deployment/backend-deployment -- npm run migrate
```

### Seed Initial Data

```bash
# Docker Compose
docker-compose exec backend npm run seed

# Kubernetes
kubectl exec -it deployment/backend-deployment -- npm run seed
```

## Environment Configuration

### Production Environment Variables

```env
# Application
NODE_ENV=production
APP_URL=https://api.yourapp.com
FRONTEND_URL=https://app.yourapp.com

# Database
DATABASE_URL=postgresql://user:password@db-host:5432/saas_db

# Redis
REDIS_HOST=redis-host
REDIS_PORT=6379
REDIS_PASSWORD=secure-password

# JWT
JWT_SECRET=your-very-secure-secret-key-here

# AWS (if using)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

## Monitoring Setup

### Prometheus & Grafana

```bash
# Install Prometheus
helm install prometheus prometheus-community/prometheus

# Install Grafana
helm install grafana grafana/grafana

# Access Grafana
kubectl port-forward svc/grafana 3000:80
```

### Application Monitoring

Configure Sentry for error tracking:

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## Scaling

### Horizontal Pod Autoscaling

```bash
# Enable HPA
kubectl autoscale deployment backend-deployment \
  --min=2 --max=10 \
  --cpu-percent=70
```

### Manual Scaling

```bash
# Scale to 5 replicas
kubectl scale deployment backend-deployment --replicas=5
```

## Backup & Restore

### Database Backup

```bash
# Manual backup
./scripts/backup.sh

# Automated backup (cron)
0 2 * * * /path/to/backup.sh
```

### Restore Database

```bash
# From backup file
docker exec -i saas_postgres psql -U user saas_db < backup.sql

# From S3
aws s3 cp s3://bucket/backup.sql.gz - | gunzip | docker exec -i saas_postgres psql -U user saas_db
```

## Rolling Updates

### Zero-Downtime Deployment

```bash
# Update image
kubectl set image deployment/backend-deployment \
  backend=ghcr.io/username/saas-backend:v2.0.0

# Monitor rollout
kubectl rollout status deployment/backend-deployment

# Rollback if needed
kubectl rollout undo deployment/backend-deployment
```

## Health Checks

### Application Health Endpoints

- Backend: `GET /health`
- Frontend: `GET /health`

### Kubernetes Health Probes

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 10
  periodSeconds: 5
```

## Troubleshooting

### Common Issues

#### Pods not starting

```bash
# Check pod status
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

#### Database connection issues

```bash
# Test database connectivity
kubectl run -it --rm debug --image=postgres:15 --restart=Never -- \
  psql -h postgres-service -U user -d saas_db
```

#### Out of memory

```bash
# Check resource usage
kubectl top pods

# Increase memory limit
kubectl set resources deployment backend-deployment \
  --limits=memory=1Gi --requests=memory=512Mi
```

## Security Checklist

- [ ] HTTPS enabled
- [ ] Secrets encrypted
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Container images scanned
- [ ] Network policies applied
- [ ] Access logs enabled

## Post-Deployment

### Verification Steps

1. Test all critical endpoints
2. Verify database migrations
3. Check monitoring dashboards
4. Test authentication flow
5. Verify email delivery
6. Test file uploads
7. Check error tracking
8. Verify backup jobs

### Performance Testing

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 https://api.yourapp.com/health

# Or use k6
k6 run load-test.js
```

## CI/CD Integration

GitHub Actions automatically deploys:
- `develop` branch → Staging
- `main` branch → Production

Manual deployment:

```bash
# Trigger deployment
git tag v1.0.0
git push origin v1.0.0
```

## Support

For deployment issues:
- Check documentation
- Review logs
- Contact DevOps team
- Create GitHub issue

## Additional Resources

- [AWS Deployment Guide](https://aws.amazon.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Terraform Documentation](https://www.terraform.io/docs/)
