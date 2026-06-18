terraform {
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
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.name_prefix}-redis"
  subnet_ids = var.private_subnet_ids

  tags = var.tags
}

resource "aws_security_group" "main" {
  name        = "${var.name_prefix}-redis"
  description = "Redis access from EKS nodes"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = var.allowed_security_group_ids
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-redis-sg"
  })
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "${var.name_prefix}-redis"
  description          = "SusuFlow Redis for cache and BullMQ queues"

  engine               = "redis"
  engine_version       = var.engine_version
  node_type            = var.node_type
  port                 = 6379
  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.main.id]

  num_cache_clusters         = var.num_cache_nodes
  automatic_failover_enabled = var.num_cache_nodes > 1
  multi_az_enabled           = var.num_cache_nodes > 1

  at_rest_encryption_enabled = true
  transit_encryption_enabled = var.transit_encryption_enabled

  snapshot_retention_limit = var.snapshot_retention_days
  snapshot_window          = "02:00-03:00"

  tags = var.tags
}

resource "aws_secretsmanager_secret" "redis" {
  name = "${var.name_prefix}/redis"
  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "redis" {
  secret_id = aws_secretsmanager_secret.redis.id
  secret_string = jsonencode({
    host         = aws_elasticache_replication_group.main.primary_endpoint_address
    port         = 6379
    REDIS_URL    = "redis://${aws_elasticache_replication_group.main.primary_endpoint_address}:6379"
    REDIS_HOST   = aws_elasticache_replication_group.main.primary_endpoint_address
    REDIS_PORT   = "6379"
  })
}
