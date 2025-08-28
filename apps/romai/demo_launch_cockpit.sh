#!/bin/bash
# ROMAI AGI Launch Cockpit Demo Script
# Tests that LAUNCH.md contains all required AGI tracking elements

echo "🚀 Testing RomAI AGI Launch Cockpit..."
echo "======================================="

# Check if LAUNCH.md exists
if [ ! -f "apps/romai/LAUNCH.md" ]; then
    echo "❌ LAUNCH.md not found"
    exit 1
fi

echo "✅ LAUNCH.md exists"

# Test North Star definition
if grep -q "NORTH STAR" "apps/romai/LAUNCH.md"; then
    echo "✅ North Star defined"
else
    echo "❌ North Star missing"
    exit 1
fi

# Test MLP scope (7 capabilities)
mlp_count=$(grep -c "### [0-9]\." "apps/romai/LAUNCH.md")
if [ "$mlp_count" -eq 7 ]; then
    echo "✅ MLP scope frozen (7 capabilities)"
else
    echo "❌ MLP scope incorrect: found $mlp_count capabilities, expected 7"
    exit 1
fi

# Test demo scripts exist
if grep -q "demo_north_star.sh" "apps/romai/LAUNCH.md"; then
    echo "✅ North Star demo script defined"
else
    echo "❌ North Star demo script missing"
    exit 1
fi

# Test release schedule
if grep -q "Wednesday 18:00 EET" "apps/romai/LAUNCH.md"; then
    echo "✅ Release train schedule defined"
else
    echo "❌ Release schedule missing"
    exit 1
fi

# Test hardware constraints
if grep -q "8GB VRAM" "apps/romai/LAUNCH.md"; then
    echo "✅ Hardware constraints documented"
else
    echo "❌ Hardware constraints missing"
    exit 1
fi

# Test measurable success criteria
if grep -q "Success Criteria" "apps/romai/LAUNCH.md"; then
    echo "✅ Success criteria defined"
else
    echo "❌ Success criteria missing"
    exit 1
fi

echo ""
echo "🎯 AGI Launch Cockpit: ALL TESTS PASSED"
echo "📋 LAUNCH.md is ready to track AGI development progress"
echo ""
echo "Next Action: Run baseline measurement to establish starting capabilities"