# EXPLORER - Code Explorer & Navigation Platform 🔍

**Advanced Code Analysis & Development Navigation Platform for CODAI Ecosystem**

EXPLORER provides intelligent code exploration, analysis, and navigation capabilities for developers and teams working with complex codebases. Built with AI-powered insights, advanced search, and comprehensive visualization tools to enhance development productivity and code understanding.

## 🚀 Key Features

### Intelligent Code Analysis
- **AI-Powered Code Understanding**: Deep semantic analysis of code structure, patterns, and relationships
- **Smart Navigation**: Intelligent code navigation with context-aware suggestions
- **Dependency Mapping**: Visual dependency graphs and import/export relationship tracking
- **Code Complexity Analysis**: Automated complexity scoring and maintainability insights
- **Pattern Recognition**: Identify design patterns, anti-patterns, and architectural issues

### Advanced Search & Discovery
- **Semantic Code Search**: Natural language queries to find code by functionality and intent
- **Multi-Repository Search**: Search across multiple repositories and codebases simultaneously
- **Symbol Navigation**: Fast navigation to functions, classes, variables, and types
- **Reference Tracking**: Find all references and usages of code elements
- **Historical Analysis**: Track code evolution and changes over time

### Visualization & Insights
- **Interactive Code Maps**: Visual representation of codebase structure and architecture
- **Dependency Graphs**: Interactive dependency visualization with filtering and exploration
- **Metrics Dashboard**: Comprehensive code quality metrics and health indicators
- **Team Analytics**: Collaboration patterns and code ownership insights
- **Technical Debt Tracking**: Identify and track technical debt accumulation

### Development Tools Integration
- **IDE Integration**: Seamless integration with VS Code, IntelliJ, and other popular IDEs
- **Git Integration**: Deep integration with Git for change tracking and collaboration
- **CI/CD Pipeline Insights**: Integration with build systems and deployment pipelines
- **Code Review Assistant**: AI-powered code review suggestions and quality checks
- **Documentation Generation**: Automated documentation generation and maintenance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm package manager
- Git repository access
- IDE with LSP support (optional)

### Installation
```bash
# Clone and navigate to EXPLORER
cd apps/explorer

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Development URLs
- **Main Explorer**: http://localhost:3000
- **Code Analysis**: http://localhost:3000/analysis
- **Repository Browser**: http://localhost:3000/repositories
- **Metrics Dashboard**: http://localhost:3000/metrics
- **Team Insights**: http://localhost:3000/team

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15 + React 19
- **Backend**: Node.js + GraphQL
- **Database**: PostgreSQL + Neo4j (graph data)
- **Code Analysis**: Tree-sitter + Language servers
- **AI/ML**: OpenAI API + Custom models
- **UI Framework**: Radix UI + Tailwind CSS
- **Visualization**: D3.js + React Flow
- **State Management**: Zustand
- **Testing**: Vitest + Playwright

### Core Components
```
explorer/
├── app/                    # Next.js app directory
├── components/            # UI components and visualization tools
│   ├── analysis/         # Code analysis components
│   ├── navigation/       # Code navigation components
│   ├── visualization/    # Data visualization components
│   ├── search/           # Search interface components
│   └── shared/           # Shared UI components
├── lib/                  # Utility libraries and helpers
├── services/             # Code analysis and exploration services
├── analyzers/            # Language-specific code analyzers
├── api/                  # Backend API routes
├── hooks/                # Custom React hooks
├── stores/               # Zustand stores for state management
├── types/                # TypeScript definitions
├── config/               # Configuration files
└── tests/                # Test suites
```

### Code Analysis Architecture
1. **Parsing Layer**: Multi-language code parsing with Tree-sitter
2. **Analysis Engine**: Semantic analysis and pattern recognition
3. **Graph Database**: Relationship storage and querying with Neo4j
4. **AI Layer**: Machine learning for insights and recommendations
5. **Visualization Engine**: Interactive code visualization and exploration

## 🔧 Development

### Environment Setup
```bash
# Development environment
cp .env.example .env.local

# Required environment variables
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=postgresql://user:password@localhost:5432/explorer
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
OPENAI_API_KEY=your_openai_key
GITHUB_TOKEN=your_github_token
GITLAB_TOKEN=your_gitlab_token
```

### Development Commands
```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm type-check

# Build production
pnpm build

# Lint code
pnpm lint
```

### Code Analysis Development
```bash
# Analyze repository
npm run analyze:repo --url=https://github.com/user/repo

# Update language parsers
npm run update:parsers --languages=typescript,python,rust

# Generate code metrics
npm run metrics:generate --project=codai-ecosystem

# Export analysis data
npm run export:analysis --format=json --project=my-project
```

## 🔗 Integration

### EXPLORER Analysis SDK
```typescript
// EXPLORER platform integration
import { ExplorerClient } from '@codai/explorer';

const explorer = new ExplorerClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://explorer.codai.ro/api'
});

// Analyze codebase
const analysis = await explorer.analyzeRepository({
  url: 'https://github.com/user/repository',
  branch: 'main',
  includeMetrics: true,
  includeDependencies: true
});

// Search code semantically
const searchResults = await explorer.searchCode({
  query: 'function that handles user authentication',
  repositories: ['repo1', 'repo2'],
  languages: ['typescript', 'javascript'],
  includeContext: true
});

// Get code metrics
const metrics = await explorer.getMetrics({
  projectId: 'project-123',
  timeRange: '30d',
  includeTeamMetrics: true
});
```

### Navigation API
```typescript
// Code navigation and exploration
import { ExplorerNavigation } from '@codai/explorer-navigation';

const navigation = new ExplorerNavigation({
  projectId: 'project-123'
});

// Navigate to symbol definition
const definition = await navigation.goToDefinition({
  symbol: 'UserAuthService',
  file: 'src/auth/auth.service.ts',
  line: 42,
  column: 15
});

// Find all references
const references = await navigation.findReferences({
  symbol: 'validateUser',
  includeDeclaration: true,
  includeComments: false
});

// Get symbol information
const symbolInfo = await navigation.getSymbolInfo({
  symbol: 'ApiResponse',
  includeDocumentation: true,
  includeUsageExamples: true
});
```

### Visualization Integration
```typescript
// Code visualization and mapping
import { ExplorerVisualization } from '@codai/explorer-visualization';

const visualization = new ExplorerVisualization({
  containerId: 'code-map-container'
});

// Create dependency graph
const dependencyGraph = await visualization.createDependencyGraph({
  projectId: 'project-123',
  layout: 'hierarchical',
  filterCriteria: {
    minConnections: 2,
    excludeTestFiles: true
  }
});

// Generate architecture diagram
const architectureDiagram = await visualization.generateArchitectureDiagram({
  projectId: 'project-123',
  diagramType: 'layered',
  includeExternal: false
});

// Create code complexity heatmap
const complexityMap = await visualization.createComplexityHeatmap({
  projectId: 'project-123',
  metric: 'cyclomatic_complexity',
  threshold: 10
});
```

## 🛣️ Roadmap

### Phase 1: Core Platform (Q1 2025)
- ✅ Basic code analysis and navigation
- ✅ Multi-language parsing support
- ✅ Simple visualization tools
- ⏳ Advanced search capabilities
- ⏳ Team collaboration features

### Phase 2: AI Enhancement (Q2 2025)
- 🔄 AI-powered code understanding
- 🔄 Intelligent code suggestions
- 🔄 Automated documentation generation
- ⏳ Advanced pattern recognition
- ⏳ Predictive analysis features

### Phase 3: Advanced Features (Q3 2025)
- ⏳ Real-time collaboration tools
- ⏳ Advanced metrics and analytics
- ⏳ Integration marketplace
- ⏳ Custom analysis pipelines
- ⏳ Enterprise security features

### Phase 4: Enterprise & AI (Q4 2025)
- ⏳ Advanced AI code analysis
- ⏳ Automated refactoring suggestions
- ⏳ Code quality automation
- ⏳ Enterprise compliance tools
- ⏳ Advanced team insights

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../docs/CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Install dependencies: `pnpm install`
4. Set up local databases (PostgreSQL, Neo4j)
5. Make your changes
6. Run tests: `pnpm test`
7. Submit a pull request

## 📞 Support

- **Documentation**: [docs.explorer.codai.ro](https://docs.explorer.codai.ro)
- **API Reference**: [api.explorer.codai.ro](https://api.explorer.codai.ro)
- **Community**: [Discord](https://discord.gg/codai-ecosystem)
- **Email Support**: support@explorer.codai.ro
- **Enterprise**: enterprise@explorer.codai.ro

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**EXPLORER** - Code Explorer & Navigation Platform for enhanced development productivity.

*Part of the [CODAI Ecosystem](https://codai.ro) - Building the future of AI-native applications.*