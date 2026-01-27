# Terraform Infrastructure Configuration

This directory contains Terraform configurations for provisioning cloud infrastructure.

## Structure

```
terraform/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── production/
├── modules/
│   ├── vpc/
│   ├── eks/
│   ├── rds/
│   ├── elasticache/
│   └── s3/
├── main.tf
├── variables.tf
├── outputs.tf
└── versions.tf
```

## Prerequisites

- Terraform >= 1.0
- AWS CLI configured
- Appropriate IAM permissions

## Usage

### Initialize Terraform

```bash
cd terraform/environments/production
terraform init
```

### Plan Changes

```bash
terraform plan -var-file="terraform.tfvars"
```

### Apply Changes

```bash
terraform apply -var-file="terraform.tfvars"
```

### Destroy Infrastructure

```bash
terraform destroy -var-file="terraform.tfvars"
```

## Environment Variables

Copy `terraform.tfvars.example` to `terraform.tfvars` and configure:

```hcl
aws_region = "us-east-1"
environment = "production"
vpc_cidr = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]
```

## Modules

### VPC Module
Creates VPC with public and private subnets across multiple AZs.

### EKS Module
Sets up Kubernetes cluster with managed node groups.

### RDS Module
Creates PostgreSQL database with Multi-AZ deployment.

### ElastiCache Module
Sets up Redis cluster for caching.

### S3 Module
Creates S3 buckets for static assets and backups.

## Best Practices

1. Always use workspaces for different environments
2. Store state in S3 with DynamoDB locking
3. Use modules for reusable components
4. Tag all resources appropriately
5. Enable versioning on state bucket
6. Use separate AWS accounts for production

## Security

- Enable encryption at rest for all resources
- Use security groups with least privilege
- Enable CloudTrail for audit logging
- Rotate IAM credentials regularly
- Use AWS Secrets Manager for sensitive data
