#!/bin/bash

# Backup script for SaaS Platform
# This script creates backups of the database and important files

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
BACKUP_DIR=${BACKUP_DIR:-/tmp/backups}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATABASE_CONTAINER=${DATABASE_CONTAINER:-saas_postgres}
DATABASE_NAME=${DATABASE_NAME:-saas_db}
DATABASE_USER=${DATABASE_USER:-user}

echo "💾 SaaS Platform Backup"
echo "=============================="
echo ""

# Create backup directory
mkdir -p $BACKUP_DIR
print_success "Backup directory: $BACKUP_DIR"

# Database backup
print_info "Backing up database..."
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

if docker ps | grep -q $DATABASE_CONTAINER; then
    docker exec $DATABASE_CONTAINER pg_dump -U $DATABASE_USER $DATABASE_NAME > $BACKUP_FILE
    print_success "Database backed up to: $BACKUP_FILE"
    
    # Compress backup
    gzip $BACKUP_FILE
    print_success "Backup compressed: $BACKUP_FILE.gz"
else
    print_error "Database container not found"
    exit 1
fi

# Upload to S3 (if configured)
if command -v aws >/dev/null 2>&1 && [ -n "$AWS_S3_BACKUP_BUCKET" ]; then
    print_info "Uploading to S3..."
    aws s3 cp $BACKUP_FILE.gz s3://$AWS_S3_BACKUP_BUCKET/backups/
    print_success "Backup uploaded to S3"
fi

# Clean old backups (keep last 7 days)
print_info "Cleaning old backups..."
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
print_success "Old backups cleaned"

echo ""
print_success "Backup completed successfully!"
echo ""
