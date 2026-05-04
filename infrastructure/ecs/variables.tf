variable "aws_region" {
  type        = string
  description = "AWS region for ECS and ECR."
}

variable "project_name" {
  type        = string
  description = "Resource name prefix."
  default     = "shopsmart"
}

variable "backend_port" {
  type        = number
  description = "Application port inside the container."
  default     = 5001
}

variable "container_image" {
  type        = string
  description = "Container image URI for the ECS task definition."
  default     = "public.ecr.aws/docker/library/node:20-alpine"
}

variable "desired_count" {
  type        = number
  description = "Desired ECS task count."
  default     = 0
}