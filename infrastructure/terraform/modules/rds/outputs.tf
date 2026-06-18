output "endpoint" {
  value = aws_db_instance.main.address
}

output "port" {
  value = aws_db_instance.main.port
}

output "database_name" {
  value = var.database_name
}

output "secret_arn" {
  value = aws_secretsmanager_secret.database.arn
}

output "instance_identifier" {
  value = aws_db_instance.main.id
}

output "security_group_id" {
  value = aws_security_group.main.id
}
