variable "environment" {
  type    = string
  default = "production"
}

variable "aws_region" {
  type    = string
  default = "eu-west-1"
}

variable "aws_account_suffix" {
  type        = string
  description = "Unique suffix for globally-unique S3 bucket names"
}

variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}

variable "eks_cluster_version" {
  type    = string
  default = "1.31"
}

variable "eks_instance_types" {
  type    = list(string)
  default = ["t3.large"]
}

variable "eks_node_desired_size" {
  type    = number
  default = 3
}

variable "eks_node_min_size" {
  type    = number
  default = 2
}

variable "eks_node_max_size" {
  type    = number
  default = 10
}

variable "rds_instance_class" {
  type    = string
  default = "db.r6g.large"
}

variable "redis_node_type" {
  type    = string
  default = "cache.r6g.large"
}

variable "web_url" {
  type    = string
  default = "https://susuflow.com"
}

variable "api_url" {
  type    = string
  default = "https://api.susuflow.com"
}
