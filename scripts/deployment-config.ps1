# 🚀 CODAI Cloud Deployment Environment Configuration
# Centralized environment variables and secrets management

# Frontend Applications
$frontendApps = @{
    "codai" = @{
        domain = "codai.dev"
        port = "4002"
        env = @{
            "NEXT_PUBLIC_API_URL" = "https://api.codai.dev"
            "NEXT_PUBLIC_CBD_URL" = "https://cbd.codai.dev"
            "NEXT_PUBLIC_MCP_URL" = "https://mcp.codai.dev"
            "NEXT_PUBLIC_MEMORAI_URL" = "https://memorai.app"
            "NEXTAUTH_URL" = "https://codai.dev"
            "NEXTAUTH_SECRET" = "codai-prod-secret-2025"
        }
    }
    "memorai" = @{
        domain = "memorai.app"
        port = "4006"
        env = @{
            "NEXT_PUBLIC_API_URL" = "https://api.memorai.app"
            "NEXT_PUBLIC_CBD_URL" = "https://cbd.memorai.app"
            "NEXT_PUBLIC_MCP_URL" = "https://mcp.memorai.app"
            "NEXTAUTH_URL" = "https://memorai.app"
        }
    }
    "bancai" = @{
        domain = "bancai.finance"
        port = "4005"
        env = @{
            "NEXT_PUBLIC_API_URL" = "https://api.bancai.finance"
            "NEXT_PUBLIC_GATEWAY_URL" = "https://gateway.codai.dev"
        }
    }
    "admin" = @{
        domain = "admin.codai.dev"
        port = "4007"
        env = @{
            "NEXT_PUBLIC_API_URL" = "https://api.codai.dev"
            "ADMIN_SECRET" = "admin-secret-2025"
        }
    }
    "docs" = @{
        domain = "docs.codai.dev"
        port = "4003"
        env = @{
            "NEXT_PUBLIC_API_URL" = "https://api.codai.dev"
        }
    }
    "wallet" = @{
        domain = "wallet.codai.dev"
        port = "4008"
        env = @{
            "NEXT_PUBLIC_API_URL" = "https://api.codai.dev"
            "NEXT_PUBLIC_BLOCKCHAIN_URL" = "https://blockchain.codai.dev"
        }
    }
    "conversai" = @{
        domain = "chat.codai.dev"
        port = "4009"
        env = @{
            "NEXT_PUBLIC_API_URL" = "https://api.codai.dev"
            "NEXT_PUBLIC_MEMORAI_URL" = "https://memorai.app"
        }
    }
}

# Backend Services
$backendServices = @{
    "gateway" = @{
        domain = "gateway.codai.dev"
        port = "8010"
        type = "api"
        env = @{
            "NODE_ENV" = "production"
            "DATABASE_URL" = $env:PROD_DATABASE_URL
            "REDIS_URL" = $env:PROD_REDIS_URL
        }
    }
    "identity" = @{
        domain = "id.codai.dev"
        port = "8100"
        type = "api"
        env = @{
            "NODE_ENV" = "production"
            "DATABASE_URL" = $env:PROD_AUTH_DATABASE_URL
            "JWT_SECRET" = "id-service-jwt-secret-2025"
        }
    }
    "hub" = @{
        domain = "api.codai.dev"
        port = "8110"
        type = "api"
        env = @{
            "NODE_ENV" = "production"
            "DATABASE_URL" = $env:PROD_DATABASE_URL
        }
    }
    "memorai-graphql" = @{
        domain = "graphql.memorai.app"
        port = "4500"
        type = "api"
        env = @{
            "NODE_ENV" = "production"
            "MEMORAI_API_KEY" = "memorai-prod-key-2025"
        }
    }
    "memorai-mcp" = @{
        domain = "mcp.memorai.app"
        port = "4950"
        type = "service"
        env = @{
            "MEMORAI_API_KEY" = "memorai-mcp-prod-key-2025"
            "CBD_BASE_URL" = "https://cbd.memorai.app"
        }
    }
    "cbd-database" = @{
        domain = "cbd.codai.dev"
        port = "8180"
        type = "database"
        env = @{
            "NODE_ENV" = "production"
            "CBD_SECRET" = "cbd-database-secret-2025"
        }
    }
}

# Cloud Infrastructure Configuration
$cloudConfig = @{
    "azure" = @{
        "resourceGroup" = "codai-production"
        "location" = "West Europe"
        "containerRegistry" = "codai.azurecr.io"
        "appServicePlan" = "codai-production-plan"
        "postgresql" = @{
            "server" = "codai-postgres-prod"
            "database" = "codai_ecosystem"
        }
        "redis" = @{
            "name" = "codai-redis-prod"
            "sku" = "Standard_C1"
        }
    }
    "vercel" = @{
        "team" = "codai-ecosystem"
        "projects" = @(
            "codai-main",
            "memorai-app",
            "bancai-finance",
            "admin-dashboard",
            "docs-site",
            "wallet-app",
            "conversai-chat"
        )
    }
}

# Export configuration for use in deployment scripts
Export-ModuleMember -Variable frontendApps, backendServices, cloudConfig