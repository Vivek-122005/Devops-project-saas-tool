variable "region" {
  type        = string
  description = "AWS region for the remote state bucket and lock table."
}

variable "name_prefix" {
  type        = string
  description = "Prefix for bootstrap resources."
  default     = "shopsmart"
}