#!/bin/bash

# Deployment script for SaaS Platform
# This script automates the deployment process

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ $1${NC}"; }

# Configuration
ENVIRONMENT=${1:-staging}
REGISTRY=${REGISTRY:-ghcr.io}
IMAGE_TAG=${2:-latest}

echo "🚀 SaaS Platform Deployment"
echo "=============================="
echo ""
echo "Environment: $ENVIRONMENT"
echo "Image Tag: $IMAGE_TAG"
echo ""

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    print_error "Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

# Build Docker images
print_info "Building Docker images..."
docker-compose -f docker-compose.prod.yml build
print_success "Images built successfully"

# Tag images
print_info "Tagging images..."
docker tag saas-backend:latest $REGISTRY/saas-backend:$IMAGE_TAG
docker tag saas-frontend:latest $REGISTRY/saas-frontend:$IMAGE_TAG
print_success "Images tagged"

# Push images (if registry is configured)
if [ -n "$REGISTRY_USERNAME" ] && [ -n "$REGISTRY_PASSWORD" ]; then
    print_info "Pushing images to registry..."
    echo $REGISTRY_PASSWORD | docker login $REGISTRY -u $REGISTRY_USERNAME --password-stdin
    docker push $REGISTRY/saas-backend:$IMAGE_TAG
    docker push $REGISTRY/saas-frontend:$IMAGE_TAG
    print_success "Images pushed to registry"
else
    print_info "Skipping registry push (credentials not configured)"
fi

# Deploy to Kubernetes (if configured)
if command -v kubectl >/dev/null 2>&1; then
    print_info "Deploying to Kubernetes..."
    
    # Update image tags in deployments
    kubectl set image deployment/backend-deployment backend=$REGISTRY/saas-backend:$IMAGE_TAG -n saas-$ENVIRONMENT
    kubectl set image deployment/frontend-deployment frontend=$REGISTRY/saas-frontend:$IMAGE_TAG -n saas-$ENVIRONMENT
    
    # Wait for rollout
    kubectl rollout status deployment/backend-deployment -n saas-$ENVIRONMENT
    kubectl rollout status deployment/frontend-deployment -n saas-$ENVIRONMENT
    
    print_success "Deployment completed"
else
    print_info "kubectl not found. Skipping Kubernetes deployment"
fi

# Run health checks
print_info "Running health checks..."
sleep 10

if [ "$ENVIRONMENT" = "production" ]; then
    BACKEND_URL="https://api.yourapp.com"
    FRONTEND_URL="https://app.yourapp.com"
else
    BACKEND_URL="https://staging-api.yourapp.com"
    FRONTEND_URL="https://staging.yourapp.com"
fi

# Check backend health
if curl -f "$BACKEND_URL/health" >/dev/null 2>&1; then
    print_success "Backend health check passed"
else
    print_error "Backend health check failed"
fi

# Check frontend health
if curl -f "$FRONTEND_URL/health" >/dev/null 2>&1; then
    print_success "Frontend health check passed"
else
    print_error "Frontend health check failed"
fi

echo ""
echo "=============================="
print_success "Deployment completed!"
echo "=============================="
echo ""
echo "URLs:"
echo "  Frontend: $FRONTEND_URL"
echo "  Backend: $BACKEND_URL"
echo ""
