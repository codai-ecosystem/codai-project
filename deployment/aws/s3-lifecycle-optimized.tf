# S3 Lifecycle Configuration - Cost Optimized
resource "aws_s3_bucket_lifecycle_configuration" "codai_lifecycle" {
  bucket = aws_s3_bucket.codai_storage.id

  rule {
    id     = "deployment_artifacts"
    status = "Enabled"

    filter {
      prefix = "deployment/"
    }

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }

  rule {
    id     = "application_backups"
    status = "Enabled"

    filter {
      prefix = "backups/"
    }

    transition {
      days          = 1
      storage_class = "GLACIER_IR"
    }

    expiration {
      days = 90
    }
  }
}
