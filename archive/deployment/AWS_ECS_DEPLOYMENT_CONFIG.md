# 🚀 RomAI AGI AWS ECS Deployment Configuration
# Production-ready containerized deployment with auto-scaling

## ECS Task Definition
```json
{
  "family": "romai-agi-task",
  "networkMode": "awsvpc",
  "requiresCompatibility": ["FARGATE"],
  "cpu": "4096",
  "memory": "8192",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "romai-agi-server",
      "image": "codai/romai-agi:latest",
      "cpu": 4096,
      "memory": 8192,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "PYTHONPATH",
          "value": "/app"
        },
        {
          "name": "LOG_LEVEL",
          "value": "INFO"
        },
        {
          "name": "WORKERS",
          "value": "1"
        }
      ],
      "secrets": [
        {
          "name": "REDIS_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:romai/redis-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/romai-agi",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:8000/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 120
      }
    }
  ]
}
```

## ECS Service Configuration
```json
{
  "serviceName": "romai-agi-service",
  "cluster": "romai-cluster",
  "taskDefinition": "romai-agi-task",
  "desiredCount": 2,
  "launchType": "FARGATE",
  "platformVersion": "LATEST",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": [
        "subnet-private-1a",
        "subnet-private-1b"
      ],
      "securityGroups": [
        "sg-romai-agi"
      ],
      "assignPublicIp": "DISABLED"
    }
  },
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:region:account:targetgroup/romai-agi-tg",
      "containerName": "romai-agi-server",
      "containerPort": 8000
    }
  ],
  "healthCheckGracePeriodSeconds": 300
}
```

## Auto Scaling Configuration
```json
{
  "serviceNamespace": "ecs",
  "resourceId": "service/romai-cluster/romai-agi-service",
  "scalableDimension": "ecs:service:DesiredCount",
  "roleArn": "arn:aws:iam::ACCOUNT:role/aws-ecs-autoscaling-role",
  "minCapacity": 2,
  "maxCapacity": 10,
  "targetTrackingScalingPolicies": [
    {
      "policyName": "RomAI-AGI-CPU-Scaling",
      "policyType": "TargetTrackingScaling",
      "targetTrackingScalingPolicyConfiguration": {
        "targetValue": 70.0,
        "predefinedMetricSpecification": {
          "predefinedMetricType": "ECSServiceAverageCPUUtilization"
        },
        "scaleOutCooldown": 300,
        "scaleInCooldown": 300
      }
    },
    {
      "policyName": "RomAI-AGI-Memory-Scaling",
      "policyType": "TargetTrackingScaling",
      "targetTrackingScalingPolicyConfiguration": {
        "targetValue": 80.0,
        "predefinedMetricSpecification": {
          "predefinedMetricType": "ECSServiceAverageMemoryUtilization"
        },
        "scaleOutCooldown": 300,
        "scaleInCooldown": 300
      }
    }
  ]
}
```

## Application Load Balancer
```json
{
  "name": "romai-agi-alb",
  "scheme": "internet-facing",
  "type": "application",
  "ipAddressType": "ipv4",
  "subnets": [
    "subnet-public-1a",
    "subnet-public-1b"
  ],
  "securityGroups": [
    "sg-romai-alb"
  ],
  "listeners": [
    {
      "port": 443,
      "protocol": "HTTPS",
      "sslPolicy": "ELBSecurityPolicy-TLS-1-2-2017-01",
      "certificates": [
        {
          "certificateArn": "arn:aws:acm:region:account:certificate/cert-id"
        }
      ],
      "defaultActions": [
        {
          "type": "forward",
          "targetGroupArn": "arn:aws:elasticloadbalancing:region:account:targetgroup/romai-agi-tg"
        }
      ]
    },
    {
      "port": 80,
      "protocol": "HTTP",
      "defaultActions": [
        {
          "type": "redirect",
          "redirectConfig": {
            "protocol": "HTTPS",
            "port": "443",
            "statusCode": "HTTP_301"
          }
        }
      ]
    }
  ]
}
```

## Target Group Configuration
```json
{
  "name": "romai-agi-tg",
  "protocol": "HTTP",
  "port": 8000,
  "vpcId": "vpc-romai",
  "targetType": "ip",
  "healthCheckEnabled": true,
  "healthCheckPath": "/health",
  "healthCheckProtocol": "HTTP",
  "healthCheckIntervalSeconds": 30,
  "healthCheckTimeoutSeconds": 5,
  "healthyThresholdCount": 2,
  "unhealthyThresholdCount": 3,
  "matcher": {
    "httpCode": "200"
  }
}
```

## CloudWatch Configuration
```json
{
  "logGroups": [
    {
      "logGroupName": "/ecs/romai-agi",
      "retentionInDays": 7
    }
  ],
  "metricFilters": [
    {
      "filterName": "RomAI-AGI-Errors",
      "filterPattern": "[timestamp, request_id, level=\"ERROR\", ...]",
      "logGroupName": "/ecs/romai-agi"
    }
  ],
  "alarms": [
    {
      "alarmName": "RomAI-AGI-HighErrorRate",
      "comparisonOperator": "GreaterThanThreshold",
      "evaluationPeriods": 2,
      "metricName": "HTTPCode_Target_5XX_Count",
      "namespace": "AWS/ApplicationELB",
      "period": 300,
      "statistic": "Sum",
      "threshold": 10,
      "actionsEnabled": true,
      "alarmActions": [
        "arn:aws:sns:region:account:romai-alerts"
      ]
    }
  ]
}
```

## Security Configuration

### VPC Security Groups
```json
{
  "securityGroups": [
    {
      "groupName": "sg-romai-alb",
      "description": "ALB security group for RomAI AGI",
      "rules": [
        {
          "type": "ingress",
          "protocol": "tcp",
          "port": 443,
          "source": "0.0.0.0/0"
        },
        {
          "type": "ingress",
          "protocol": "tcp",
          "port": 80,
          "source": "0.0.0.0/0"
        }
      ]
    },
    {
      "groupName": "sg-romai-agi",
      "description": "ECS tasks security group",
      "rules": [
        {
          "type": "ingress",
          "protocol": "tcp",
          "port": 8000,
          "source": "sg-romai-alb"
        }
      ]
    }
  ]
}
```

### IAM Roles
```json
{
  "roles": [
    {
      "roleName": "ecsTaskExecutionRole",
      "assumeRolePolicyDocument": {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": {
              "Service": "ecs-tasks.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
          }
        ]
      },
      "policies": [
        "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
      ]
    },
    {
      "roleName": "ecsTaskRole",
      "assumeRolePolicyDocument": {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": {
              "Service": "ecs-tasks.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
          }
        ]
      },
      "policies": [
        {
          "policyName": "RomAI-AGI-Task-Policy",
          "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
              {
                "Effect": "Allow",
                "Action": [
                  "s3:GetObject",
                  "s3:PutObject",
                  "secretsmanager:GetSecretValue",
                  "cloudwatch:PutMetricData"
                ],
                "Resource": "*"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

## Deployment Pipeline
```yaml
# .github/workflows/deploy-agi.yml
name: Deploy RomAI AGI to AWS ECS

on:
  push:
    branches: [main]
    paths: ['apps/romai/src/ml/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
        
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: romai-agi
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -f apps/romai/Dockerfile.agi -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster romai-cluster \
            --service romai-agi-service \
            --task-definition romai-agi-task:${{ github.run_number }} \
            --force-new-deployment
```

## Cost Optimization
- **Fargate Spot**: Use spot pricing for non-critical workloads (50-70% savings)
- **Reserved Capacity**: Reserve baseline capacity for predictable workloads
- **Auto Scaling**: Optimize scaling policies to prevent over-provisioning
- **S3 Intelligent Tiering**: For model artifacts and logs

## Monitoring & Observability
- **CloudWatch Dashboards**: Real-time metrics and alarms
- **X-Ray Tracing**: Distributed tracing for performance analysis
- **Container Insights**: ECS container-level monitoring
- **Custom Metrics**: ML-specific metrics (inference time, accuracy)

---

**Status**: Cloud deployment configuration ready
**Next Steps**: 
1. Set up AWS infrastructure with Terraform/CloudFormation
2. Configure CI/CD pipeline
3. Deploy and validate production environment
