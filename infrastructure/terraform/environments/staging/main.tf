terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.0"
    }
  }

  # Uncomment and configure for remote state:
  # backend "s3" {
  #   bucket         = "susuflow-terraform-state"
  #   key            = "staging/terraform.tfstate"
  #   region         = "eu-west-1"
  #   encrypt        = true
  #   dynamodb_table = "susuflow-terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "susuflow"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

locals {
  name_prefix = "susuflow-${var.environment}"
  tags = {
    Project     = "susuflow"
    Environment = var.environment
  }
}

module "vpc" {
  source = "../../modules/vpc"

  name_prefix        = local.name_prefix
  cidr_block         = var.vpc_cidr
  az_count           = 2
  enable_nat_gateway = true
  tags               = local.tags
}

module "eks" {
  source = "../../modules/eks"

  name_prefix          = local.name_prefix
  vpc_id               = module.vpc.vpc_id
  private_subnet_ids   = module.vpc.private_subnet_ids
  public_subnet_ids    = module.vpc.public_subnet_ids
  cluster_version      = var.eks_cluster_version
  instance_types       = var.eks_instance_types
  node_desired_size    = var.eks_node_desired_size
  node_min_size        = var.eks_node_min_size
  node_max_size        = var.eks_node_max_size
  endpoint_public_access = true
  tags                 = local.tags
}

module "rds" {
  source = "../../modules/rds"

  name_prefix                = local.name_prefix
  vpc_id                     = module.vpc.vpc_id
  private_subnet_ids         = module.vpc.private_subnet_ids
  allowed_security_group_ids = [module.eks.node_security_group_id]
  instance_class             = var.rds_instance_class
  multi_az                   = false
  backup_retention_days      = 7
  deletion_protection        = false
  skip_final_snapshot        = true
  performance_insights_enabled = false
  tags                       = local.tags
}

module "elasticache" {
  source = "../../modules/elasticache"

  name_prefix                = local.name_prefix
  vpc_id                     = module.vpc.vpc_id
  private_subnet_ids         = module.vpc.private_subnet_ids
  allowed_security_group_ids = [module.eks.node_security_group_id]
  node_type                  = var.redis_node_type
  num_cache_nodes            = 1
  transit_encryption_enabled = false
  snapshot_retention_days    = 1
  tags                       = local.tags
}

module "assets" {
  source = "../../modules/s3"

  bucket_name        = "${local.name_prefix}-assets-${var.aws_account_suffix}"
  enable_versioning  = false
  lifecycle_days     = 90
  tags               = local.tags
}

module "monitoring" {
  source = "../../modules/monitoring"

  name_prefix = local.name_prefix
  alarm_email = var.alarm_email
  tags        = local.tags
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

resource "random_password" "encryption_key" {
  length  = 32
  special = false
}

resource "aws_secretsmanager_secret" "app" {
  name = "${local.name_prefix}/app"
  tags = local.tags
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id
  secret_string = jsonencode({
    JWT_SECRET     = random_password.jwt_secret.result
    ENCRYPTION_KEY = random_password.encryption_key.result
    WEB_URL        = var.web_url
    API_URL        = var.api_url
    AWS_S3_BUCKET  = module.assets.bucket_name
    AWS_REGION     = var.aws_region
  })
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/susuflow/${var.environment}/api"
  retention_in_days = 30
  tags              = local.tags
}

resource "aws_cloudwatch_log_group" "worker" {
  name              = "/susuflow/${var.environment}/worker"
  retention_in_days = 30
  tags              = local.tags
}

resource "aws_cloudwatch_metric_alarm" "api_5xx" {
  alarm_name          = "${local.name_prefix}-api-5xx-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "API 5xx error rate elevated"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [module.monitoring.sns_topic_arn]
  tags                = local.tags
}
