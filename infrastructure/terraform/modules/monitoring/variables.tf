variable "name_prefix" {
  type = string
}

variable "alarm_email" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
