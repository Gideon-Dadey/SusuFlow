variable "bucket_name" {
  type = string
}

variable "enable_versioning" {
  type    = bool
  default = true
}

variable "lifecycle_days" {
  type    = number
  default = 0
}

variable "tags" {
  type    = map(string)
  default = {}
}
