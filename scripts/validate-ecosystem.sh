#!/bin/bash
# CODAI Ecosystem Validation Script
# Tests if module resolution fix worked for all Next.js applications

echo "🚀 CODAI ECOSYSTEM VALIDATION SCRIPT"
echo "Date: $(date)"
echo "Testing module resolution fix across all applications..."
echo ""

# Test function for each application
test_app() {
    local app_name=$1
    local app_path=$2
    echo "🔍 Testing $app_name..."
    
    cd "$app_path" || {
        echo "❌ Failed to navigate to $app_path"
        return 1
    }
    
    # Test build command
    if pnpm run build --silent 2>/dev/null; then
        echo "✅ $app_name: BUILD SUCCESSFUL"
        return 0
    else
        echo "❌ $app_name: Build failed"
        return 1
    fi
}

# Navigate to project root
cd "$(dirname "$0")"

echo "=== TIER 1: CORE INFRASTRUCTURE ==="
test_app "CODAI (Core Platform)" "apps/codai"
test_app "MEMORAI (Memory Core)" "apps/memorai"

echo ""
echo "=== TIER 2: PRIMARY SERVICES ==="
test_app "ANALIZAI (Analytics Leader)" "apps/analizai"
test_app "STOCAI (Storage Service)" "apps/stocai"

echo ""
echo "=== TIER 3: BUSINESS APPLICATIONS ==="
test_app "BANCAI (Banking Platform)" "apps/bancai"
test_app "TalentAI (Talent Acquisition)" "apps/talentai"

echo ""
echo "=== TIER 4: SUPPORT APPLICATIONS ==="
test_app "PREZENTAI (Portfolio Platform)" "apps/prezentai"
test_app "AIDE (Development Environment)" "apps/aide"

echo ""
echo "🎯 VALIDATION COMPLETE"
echo "Check above for any failed builds"
