output "vpc_id" {
  value = module.vpc.vpc_id
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "rds_endpoint" {
  value = module.rds.endpoint
}

output "redis_endpoint" {
  value = module.elasticache.primary_endpoint
}

output "s3_bucket" {
  value = module.assets.bucket_name
}

output "database_secret_arn" {
  value = module.rds.secret_arn
}

output "redis_secret_arn" {
  value = module.elasticache.secret_arn
}

output "app_secret_arn" {
  value = aws_secretsmanager_secret.app.arn
}

output "configure_kubectl" {
  value = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}
