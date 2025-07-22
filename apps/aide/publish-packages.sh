#!/bin/bash

# 🚀 NPM Package Publication Script for codai.ro

echo "📦 Publishing codai.ro NPM packages..."

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Check if we're logged into NPM
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ Not logged into NPM. Please run: npm login"
    exit 1
fi

# Create @codai organization if it doesn't exist
echo "🏢 Checking @codai organization..."
if ! npm org ls codai > /dev/null 2>&1; then
    echo "Creating @codai organization..."
    npm org create codai
fi

# Function to publish a package
publish_package() {
    local package_path=$1
    local package_name=$2

    echo "📦 Publishing $package_name..."

    cd "$package_path"

    # Build the package
    echo "🔨 Building $package_name..."
    npm run build

    if [ $? -ne 0 ]; then
        echo "❌ Build failed for $package_name"
        return 1
    fi

    # Publish to NPM
    echo "🚀 Publishing $package_name to NPM..."
    npm publish --access public

    if [ $? -eq 0 ]; then
        echo "✅ Successfully published $package_name"
    else
        echo "❌ Failed to publish $package_name"
        return 1
    fi

    cd - > /dev/null
}

# Publish packages in dependency order
echo "📚 Publishing packages in dependency order..."

# 1. Memory Graph (no dependencies)
publish_package "packages/memory-graph" "@codai/memory-graph"

# 2. Agent Runtime (depends on memory-graph)
publish_package "packages/agent-runtime" "@codai/agent-runtime"

# 3. UI Components (depends on both)
publish_package "packages/ui-components" "@codai/ui-components"

echo ""
echo "🎉 Publication complete!"
echo ""
echo "📦 Published packages:"
echo "   • @codai/memory-graph@1.0.0"
echo "   • @codai/agent-runtime@1.0.1"
echo "   • @codai/ui-components@1.0.0"
echo ""
echo "📚 View packages:"
echo "   • https://www.npmjs.com/package/@codai/memory-graph"
echo "   • https://www.npmjs.com/package/@codai/agent-runtime"
echo "   • https://www.npmjs.com/package/@codai/ui-components"
echo ""
echo "🔗 Usage:"
echo "   npm install @codai/memory-graph"
echo "   npm install @codai/agent-runtime"
echo "   npm install @codai/ui-components"
echo ""
echo "✅ All packages ready for production use!"
