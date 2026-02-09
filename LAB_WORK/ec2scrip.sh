#!/bin/bash

set -e

# ======================
# CONFIGURATION
# ======================
REGION="us-east-1"
KEY_NAME="my-key"
SG_NAME="my-sg"
INSTANCE_TYPE="t2.micro"

echo "🚀 Starting EC2 setup..."

# ======================
# GET YOUR PUBLIC IP
# ======================
MY_IP=$(curl -s ifconfig.me)
echo "✔ Your IP: $MY_IP"

# ======================
# GET LATEST UBUNTU 24.04 AMI
# ======================
AMI_ID=$(aws ec2 describe-images \
  --region $REGION \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*" \
            "Name=state,Values=available" \
  --query "reverse(sort_by(Images, &CreationDate))[0].ImageId" \
  --output text)

echo "✔ Using AMI: $AMI_ID"

# ======================
# CREATE KEY PAIR (IF NOT EXISTS)
# ======================
if ! aws ec2 describe-key-pairs --key-names "$KEY_NAME" &>/dev/null; then
  echo "🔐 Creating key pair..."
  aws ec2 create-key-pair \
    --key-name "$KEY_NAME" \
    --query "KeyMaterial" \
    --output text > "$KEY_NAME.pem"
  chmod 400 "$KEY_NAME.pem"
else
  echo "✔ Key pair already exists"
fi

# ======================
# CREATE SECURITY GROUP
# ======================
SG_ID=$(aws ec2 describe-security-groups \
  --filters Name=group-name,Values="$SG_NAME" \
  --query "SecurityGroups[0].GroupId" \
  --output text)

if [ "$SG_ID" == "None" ]; then
  echo "🛡 Creating security group..."
  SG_ID=$(aws ec2 create-security-group \
    --group-name "$SG_NAME" \
    --description "Allow SSH and HTTP" \
    --query "GroupId" \
    --output text)
else
  echo "✔ Security group exists: $SG_ID"
fi

# ======================
# ADD SECURITY GROUP RULES
# ======================
echo "🔓 Configuring security group rules..."

# SSH (your IP only)
aws ec2 authorize-security-group-ingress \
  --group-id "$SG_ID" \
  --protocol tcp \
  --port 22 \
  --cidr "$MY_IP/32" 2>/dev/null || true

# HTTP (public)
aws ec2 authorize-security-group-ingress \
  --group-id "$SG_ID" \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0 2>/dev/null || true

# ======================
# LAUNCH EC2 INSTANCE
# ======================
echo "🚀 Launching EC2 instance..."

INSTANCE_ID=$(aws ec2 run-instances \
  --image-id "$AMI_ID" \
  --instance-type "$INSTANCE_TYPE" \
  --key-name "$KEY_NAME" \
  --security-group-ids "$SG_ID" \
  --count 1 \
  --query "Instances[0].InstanceId" \
  --output text)

echo "✔ Instance created: $INSTANCE_ID"

# ======================
# WAIT & FETCH PUBLIC IP
# ======================
echo "⏳ Waiting for instance to run..."

aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"

PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text)

echo ""
echo "🎉 EC2 READY!"
echo "Public IP: $PUBLIC_IP"
echo ""
echo "SSH command:"
echo "ssh -i $KEY_NAME.pem ubuntu@$PUBLIC_IP"
