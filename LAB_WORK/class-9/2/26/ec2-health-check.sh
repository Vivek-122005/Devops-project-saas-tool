#!/bin/bash

# ===== CONFIG =====
INSTANCE_ID="i-0179d1d24bcd23f63"

# ===== FETCH INSTANCE STATE =====
STATE=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --query "Reservations[0].Instances[0].State.Name" \
  --output text)

# ===== FETCH HEALTH STATUS =====
SYSTEM_STATUS=$(aws ec2 describe-instance-status \
  --instance-ids "$INSTANCE_ID" \
  --query "InstanceStatuses[0].SystemStatus.Status" \
  --output text)

INSTANCE_STATUS=$(aws ec2 describe-instance-status \
  --instance-ids "$INSTANCE_ID" \
  --query "InstanceStatuses[0].InstanceStatus.Status" \
  --output text)

# ===== ANALYSIS =====
if [ "$SYSTEM_STATUS" == "ok" ] && [ "$INSTANCE_STATUS" == "ok" ]; then
  HEALTH="[OK] System Healthy"
else
  HEALTH="[ALERT] Check System!"
fi

# ===== OUTPUT =====
echo "---------------------------------"
echo "Instance ID: $INSTANCE_ID"
echo "State:       $STATE"
echo "Health:      $HEALTH"
echo "---------------------------------"
