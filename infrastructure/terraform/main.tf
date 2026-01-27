terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }

  # Backend configuration for storing state
  backend "s3" {
    bucket         = "saas-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "SaaS Platform"
      ManagedBy   = "Terraform"
    }
  }
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  environment        = var.environment
  vpc_cidr          = var.vpc_cidr
  availability_zones = var.availability_zones
  
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

# EKS Cluster Module
module "eks" {
  source = "./modules/eks"

  cluster_name    = "${var.environment}-saas-cluster"
  cluster_version = var.eks_version
  
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  
  node_groups = {
    general = {
      desired_size = 2
      min_size     = 1
      max_size     = 4
      instance_types = ["t3.medium"]
    }
  }
}

# RDS Database Module
module "rds" {
  source = "./modules/rds"

  identifier          = "${var.environment}-saas-db"
  engine_version      = "15.4"
  instance_class      = var.db_instance_class
  allocated_storage   = 100
  
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  
  database_name      = "saas_db"
  master_username    = var.db_master_username
  master_password    = var.db_master_password
  
  backup_retention_period = 7
  multi_az               = var.environment == "production"
}

# ElastiCache Redis Module
module "elasticache" {
  source = "./modules/elasticache"

  cluster_id         = "${var.environment}-saas-redis"
  node_type         = "cache.t3.micro"
  num_cache_nodes   = var.environment == "production" ? 2 : 1
  
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnet_ids
}

# S3 Buckets Module
module "s3" {
  source = "./modules/s3"

  environment = var.environment
  
  buckets = {
    assets = {
      name = "${var.environment}-saas-assets"
      versioning = true
    }
    backups = {
      name = "${var.environment}-saas-backups"
      versioning = true
    }
  }
}
