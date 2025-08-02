# ROMAI Kibana Dashboard Setup Script
# Comprehensive dashboard import and ML job deployment

#!/bin/bash

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIBANA_URL="${KIBANA_URL:-http://localhost:5601}"
ELASTICSEARCH_URL="${ELASTICSEARCH_URL:-http://localhost:9200}"
ELASTIC_USERNAME="${ELASTIC_USERNAME:-elastic}"
ELASTIC_PASSWORD="${ELASTIC_PASSWORD:-changeme}"

# Color coding for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Wait for services to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    log "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            success "$service_name is ready!"
            return 0
        fi
        
        log "Attempt $attempt/$max_attempts: $service_name not ready yet..."
        sleep 10
        ((attempt++))
    done
    
    error "$service_name failed to start within $(($max_attempts * 10)) seconds"
    return 1
}

# Check if Elasticsearch is ready
check_elasticsearch() {
    log "Checking Elasticsearch health..."
    local health_response=$(curl -s -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" \
        "$ELASTICSEARCH_URL/_cluster/health?wait_for_status=yellow&timeout=30s")
    
    if echo "$health_response" | grep -q '"status":"green"\|"status":"yellow"'; then
        success "Elasticsearch cluster is healthy"
        return 0
    else
        error "Elasticsearch cluster is not healthy"
        echo "$health_response"
        return 1
    fi
}

# Create index templates
create_index_templates() {
    log "Creating Elasticsearch index templates..."
    
    # ROMAI logs template
    curl -X PUT "$ELASTICSEARCH_URL/_index_template/romai-logs-template" \
        -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" \
        -H "Content-Type: application/json" \
        -d '{
            "index_patterns": ["romai-logs-*"],
            "template": {
                "settings": {
                    "number_of_shards": 2,
                    "number_of_replicas": 1,
                    "index.refresh_interval": "5s",
                    "index.codec": "best_compression"
                },
                "mappings": {
                    "properties": {
                        "@timestamp": {"type": "date"},
                        "service": {"type": "keyword"},
                        "severity": {"type": "keyword"},
                        "message": {"type": "text", "analyzer": "standard"},
                        "response_time": {"type": "float"},
                        "cpu_usage_percent": {"type": "float"},
                        "memory_used_mb": {"type": "float"},
                        "correlation_id": {"type": "keyword"},
                        "user_id": {"type": "keyword"},
                        "client_ip": {"type": "ip"},
                        "geoip": {
                            "properties": {
                                "location": {"type": "geo_point"},
                                "country_name": {"type": "keyword"},
                                "city_name": {"type": "keyword"}
                            }
                        },
                        "threat_score": {"type": "integer"},
                        "auth_event": {"type": "keyword"},
                        "endpoint": {"type": "keyword"},
                        "error_code": {"type": "keyword"}
                    }
                }
            },
            "priority": 100,
            "version": 1
        }'
    
    if [ $? -eq 0 ]; then
        success "Index template created successfully"
    else
        error "Failed to create index template"
        return 1
    fi
}

# Import Kibana dashboards
import_kibana_dashboards() {
    log "Importing Kibana dashboards..."
    
    local dashboard_files=(
        "$SCRIPT_DIR/../dashboards/romai-log-analysis.ndjson"
        "$SCRIPT_DIR/../dashboards/romai-security-dashboard.ndjson"
        "$SCRIPT_DIR/../dashboards/romai-performance-dashboard.ndjson"
    )
    
    for dashboard_file in "${dashboard_files[@]}"; do
        if [ -f "$dashboard_file" ]; then
            log "Importing dashboard: $(basename "$dashboard_file")"
            
            curl -X POST "$KIBANA_URL/api/saved_objects/_import" \
                -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" \
                -H "kbn-xsrf: true" \
                -H "Content-Type: application/json" \
                --form file=@"$dashboard_file"
            
            if [ $? -eq 0 ]; then
                success "Dashboard imported: $(basename "$dashboard_file")"
            else
                warning "Failed to import dashboard: $(basename "$dashboard_file")"
            fi
        else
            warning "Dashboard file not found: $dashboard_file"
        fi
    done
}

# Deploy ML jobs
deploy_ml_jobs() {
    log "Deploying Machine Learning jobs..."
    
    local ml_config_file="$SCRIPT_DIR/../ml-jobs/romai-ml-config.json"
    
    if [ ! -f "$ml_config_file" ]; then
        error "ML configuration file not found: $ml_config_file"
        return 1
    fi
    
    # Parse and deploy ML jobs
    local jobs=$(cat "$ml_config_file" | jq -r '.ml_jobs | keys[]')
    
    for job_name in $jobs; do
        log "Creating ML job: $job_name"
        
        local job_config=$(cat "$ml_config_file" | jq ".ml_jobs[\"$job_name\"]")
        
        curl -X PUT "$ELASTICSEARCH_URL/_ml/anomaly_detectors/$job_name" \
            -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" \
            -H "Content-Type: application/json" \
            -d "$job_config"
        
        if [ $? -eq 0 ]; then
            success "ML job created: $job_name"
            
            # Open the job
            curl -X POST "$ELASTICSEARCH_URL/_ml/anomaly_detectors/$job_name/_open" \
                -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD"
            
            if [ $? -eq 0 ]; then
                success "ML job opened: $job_name"
            else
                warning "Failed to open ML job: $job_name"
            fi
        else
            warning "Failed to create ML job: $job_name"
        fi
    done
    
    # Deploy datafeeds
    log "Deploying ML datafeeds..."
    local datafeeds=$(cat "$ml_config_file" | jq -r '.datafeeds | keys[]')
    
    for datafeed_name in $datafeeds; do
        log "Creating ML datafeed: $datafeed_name"
        
        local datafeed_config=$(cat "$ml_config_file" | jq ".datafeeds[\"$datafeed_name\"]")
        
        curl -X PUT "$ELASTICSEARCH_URL/_ml/datafeeds/$datafeed_name" \
            -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" \
            -H "Content-Type: application/json" \
            -d "$datafeed_config"
        
        if [ $? -eq 0 ]; then
            success "ML datafeed created: $datafeed_name"
            
            # Start the datafeed
            curl -X POST "$ELASTICSEARCH_URL/_ml/datafeeds/$datafeed_name/_start" \
                -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" \
                -d '{"start": "now-7d"}'
            
            if [ $? -eq 0 ]; then
                success "ML datafeed started: $datafeed_name"
            else
                warning "Failed to start ML datafeed: $datafeed_name"
            fi
        else
            warning "Failed to create ML datafeed: $datafeed_name"
        fi
    done
}

# Create default index pattern
create_index_pattern() {
    log "Creating default index pattern..."
    
    curl -X POST "$KIBANA_URL/api/saved_objects/index-pattern/romai-logs-*" \
        -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" \
        -H "kbn-xsrf: true" \
        -H "Content-Type: application/json" \
        -d '{
            "attributes": {
                "title": "romai-logs-*",
                "timeFieldName": "@timestamp",
                "fields": "[]"
            }
        }'
    
    if [ $? -eq 0 ]; then
        success "Index pattern created successfully"
    else
        warning "Failed to create index pattern (may already exist)"
    fi
}

# Set default index pattern
set_default_index_pattern() {
    log "Setting default index pattern..."
    
    curl -X POST "$KIBANA_URL/api/kibana/settings/defaultIndex" \
        -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" \
        -H "kbn-xsrf: true" \
        -H "Content-Type: application/json" \
        -d '{"value": "romai-logs-*"}'
    
    if [ $? -eq 0 ]; then
        success "Default index pattern set successfully"
    else
        warning "Failed to set default index pattern"
    fi
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check ML jobs status
    local ml_jobs_response=$(curl -s -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" \
        "$ELASTICSEARCH_URL/_ml/anomaly_detectors/_stats")
    
    local open_jobs=$(echo "$ml_jobs_response" | jq -r '.jobs[] | select(.state == "opened") | .job_id' | wc -l)
    log "Active ML jobs: $open_jobs"
    
    # Check dashboards
    local dashboards_response=$(curl -s -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" \
        "$KIBANA_URL/api/saved_objects/_find?type=dashboard")
    
    local dashboard_count=$(echo "$dashboards_response" | jq -r '.saved_objects | length')
    log "Imported dashboards: $dashboard_count"
    
    # Check index templates
    local templates_response=$(curl -s -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" \
        "$ELASTICSEARCH_URL/_index_template/romai-logs-template")
    
    if echo "$templates_response" | grep -q "romai-logs-template"; then
        success "Index template verified"
    else
        warning "Index template verification failed"
    fi
}

# Generate sample data for testing
generate_sample_data() {
    if [ "$1" = "--with-sample-data" ]; then
        log "Generating sample data for testing..."
        
        local current_date=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
        
        # Sample log entry
        curl -X POST "$ELASTICSEARCH_URL/romai-logs-$(date +%Y.%m.%d)/_doc" \
            -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" \
            -H "Content-Type: application/json" \
            -d "{
                \"@timestamp\": \"$current_date\",
                \"service\": \"romai-api\",
                \"severity\": \"info\",
                \"message\": \"User authentication successful\",
                \"response_time\": 245.5,
                \"cpu_usage_percent\": 65.2,
                \"memory_used_mb\": 512.8,
                \"correlation_id\": \"req-$(uuidgen)\",
                \"user_id\": \"user-12345\",
                \"client_ip\": \"192.168.1.100\",
                \"endpoint\": \"/api/auth/login\",
                \"auth_event\": \"login_success\"
            }"
        
        success "Sample data generated"
    fi
}

# Main execution
main() {
    log "Starting ROMAI Kibana Dashboard Setup..."
    log "Kibana URL: $KIBANA_URL"
    log "Elasticsearch URL: $ELASTICSEARCH_URL"
    
    # Check prerequisites
    if ! command -v curl &> /dev/null; then
        error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        error "jq is required but not installed"
        exit 1
    fi
    
    # Wait for services
    wait_for_service "$ELASTICSEARCH_URL" "Elasticsearch" || exit 1
    wait_for_service "$KIBANA_URL/api/status" "Kibana" || exit 1
    
    # Execute setup steps
    check_elasticsearch || exit 1
    create_index_templates || exit 1
    create_index_pattern
    import_kibana_dashboards
    deploy_ml_jobs
    set_default_index_pattern
    verify_deployment
    generate_sample_data "$1"
    
    success "ROMAI Kibana Dashboard Setup completed successfully!"
    log "Access Kibana at: $KIBANA_URL"
    log "Default credentials: $ELASTIC_USERNAME / [password from environment]"
    
    log "Available dashboards:"
    log "  - ROMAI Log Analysis: $KIBANA_URL/app/dashboards#/view/romai-log-analysis-dashboard"
    log "  - Security Monitoring: $KIBANA_URL/app/dashboards#/view/romai-security-dashboard"
    log "  - Performance Analytics: $KIBANA_URL/app/dashboards#/view/romai-performance-dashboard"
    
    log "ML Jobs Management: $KIBANA_URL/app/ml/jobs"
}

# Execute main function with all arguments
main "$@"
