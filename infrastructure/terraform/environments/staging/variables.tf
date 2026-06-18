variable "environment" {
  type    = string
  default = "staging"
}

variable "aws_region" {
  type    = string
  default = "eu-west-1"
}

variable "aws_account_suffix" {
  type        = string
  description = "Unique suffix for globally-unique S3 bucket names (e.g. account ID last 8 digits)"
}

variable "vpc_cidr" {
  type    = string
  default = "10.10.0.0/16"
}

variable "eks_cluster_version" {
  type    = string
  default = "1.31"
}

variable "eks_instance_types" {
  type    = list(string)
  default = ["t3.medium"]
}

variable "eks_node_desired_size" {
  type    = number
  default = 2
}

variable "eks_node_min_size" {
  type    = number
  default = 1
}

variable "eks_node_max_size" {
  type    = number
  default = 3
}

variable "rds_instance_class" {
  type    = string
  default = "db.t4g.medium"
}

variable "redis_node_type" {
  type    = string
  default = "cache.t4g.micro"
}

variable "web_url" {
  type    = string
  default = "https://staging.susuflow.com"
}

variable "api_url" {
  type    = string
  default = "https://api-staging.susuflow.com"
}
