#!/bin/bash

# ===== CONFIG =====
INSTANCE_ID="i-0179d1d24bcd23f63"

# ===== INPUT =====
ACTION=$1

if [ -z "$ACTION" ]; then
  echo "[ERROR] Usage: $0 {start|stop}"
  exit 1
fi

# ===== SCOUT =====
CURRENT_STATE=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --query "Reservations[0].Instances[0].State.Name" \
  --output text)

echo "[INFO] Current State: $CURRENT_STATE"

# ===== TRANSITION CHECK =====
if [ "$CURRENT_STATE" == "pending" ] || [ "$CURRENT_STATE" == "stopping" ]; then
  echo "[WAIT] Instance is transitioning. Try again later."
  exit 0
fi

# ===== ACTION LOGIC =====
if [ "$ACTION" == "start" ]; then
  if [ "$CURRENT_STATE" == "running" ]; then
    echo "[SKIP] Instance is already running."
  else
    echo "[ACTION] Starting instance $INSTANCE_ID..."
    aws ec2 start-instances --instance-ids "$INSTANCE_ID"
  fi

elif [ "$ACTION" == "stop" ]; then
  if [ "$CURRENT_STATE" == "stopped" ]; then
    echo "[SKIP] Instance is already stopped."
  else
    echo "[ACTION] Stopping instance $INSTANCE_ID..."
    aws ec2 stop-instances --instance-ids "$INSTANCE_ID"
  fi

else
  echo "[ERROR] Invalid action: $ACTION"
  echo "Usage: $0 {start|stop}"
  exit 1
fi

