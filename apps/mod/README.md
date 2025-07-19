# MOD - Modular Automation Builder 🔧

**Visual Workflow Builder & Automation Platform for CODAI Ecosystem**

MOD is a powerful modular automation builder that enables users to create, deploy, and manage complex workflows and automation processes across the CODAI ecosystem. With a visual drag-and-drop interface, users can build sophisticated automation without coding, connecting various services, APIs, and data sources.

## 🚀 Key Features

### Visual Workflow Builder
- **Drag-and-Drop Interface**: Intuitive visual workflow designer with node-based editor
- **Pre-built Modules**: Extensive library of ready-to-use automation modules and connectors
- **Custom Logic Blocks**: Create custom logic with conditional statements, loops, and branching
- **Real-time Preview**: Live workflow testing and debugging during design
- **Version Control**: Track changes and manage workflow versions

### Automation Engine
- **Multi-trigger Support**: Time-based, event-driven, and API-triggered workflows
- **Parallel Processing**: Execute multiple workflow branches simultaneously
- **Error Handling**: Robust error handling with retry mechanisms and fallback options
- **Monitoring & Logging**: Comprehensive workflow execution monitoring and logging
- **Scalable Execution**: Auto-scaling workflow execution based on demand

### Integration & Connectivity
- **CODAI Services Integration**: Native connectors for all CODAI ecosystem applications
- **External API Connectors**: Connect to thousands of external APIs and services
- **Database Connectors**: Direct integration with databases and data warehouses
- **File System Operations**: File upload, download, and processing capabilities
- **Webhook Support**: Incoming and outgoing webhook management

### Advanced Automation Features
- **AI-Powered Suggestions**: Intelligent workflow optimization and suggestions
- **Template Marketplace**: Share and discover automation templates
- **Conditional Logic**: Complex decision trees and conditional processing
- **Data Transformation**: Built-in data mapping, filtering, and transformation tools
- **Scheduling**: Advanced scheduling with cron expressions and timezone support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm package manager
- Access to CODAI ecosystem services
- API credentials for external integrations

### Installation
```bash
# Clone and navigate to MOD
cd apps/mod

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Development URLs
- **Workflow Builder**: http://localhost:3000
- **Automation Dashboard**: http://localhost:3000/dashboard
- **Template Library**: http://localhost:3000/templates
- **Connectors**: http://localhost:3000/connectors
- **Monitoring**: http://localhost:3000/monitoring

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15 + React 19
- **UI Framework**: Tailwind CSS + Lucide React Icons
- **Animation**: Framer Motion
- **Workflow Engine**: Custom workflow execution engine
- **State Management**: React Context + Reducers
- **Node Editor**: Custom drag-and-drop workflow editor
- **Testing**: Vitest + Playwright

### Core Components
```
mod/
├── app/                    # Next.js app directory
├── components/            # UI components and workflow editor
│   ├── workflow/         # Workflow editor components
│   ├── nodes/            # Workflow node components
│   ├── connectors/       # Integration connector components
│   └── shared/           # Shared UI components
├── lib/                  # Utility libraries and helpers
├── engine/               # Workflow execution engine
├── connectors/           # Service connectors and integrations
├── templates/            # Workflow templates and examples
├── hooks/                # Custom React hooks
├── types/                # TypeScript definitions
├── config/               # Configuration files
└── tests/                # Test suites
```

### Workflow Architecture
1. **Design Phase**: Visual workflow creation using drag-and-drop editor
2. **Validation**: Workflow validation and dependency checking
3. **Deployment**: Workflow compilation and deployment to execution engine
4. **Execution**: Real-time workflow execution with monitoring
5. **Monitoring**: Performance tracking and error reporting

## 🔧 Development

### Environment Setup
```bash
# Development environment
cp .env.example .env.local

# Required environment variables
NEXT_PUBLIC_API_URL=http://localhost:3000/api
WORKFLOW_ENGINE_URL=http://localhost:8080
DATABASE_URL=postgresql://user:password@localhost:5432/mod
REDIS_URL=redis://localhost:6379
WEBHOOK_BASE_URL=https://mod.codai.ro/webhooks
```

### Development Commands
```bash
# Start development server
pnpm dev

# Type checking
pnpm type-check

# Build production
pnpm build

# Lint code
pnpm lint

# Start workflow engine
pnpm start:engine
```

### Workflow Development
```bash
# Create new connector
npm run create:connector --service=external-api

# Test workflow execution
npm run test:workflow --id=workflow-123

# Deploy workflow template
npm run deploy:template --template=user-onboarding

# Monitor workflow performance
npm run monitor:workflows --live
```

## 🔗 Integration

### MOD Automation SDK
```typescript
// MOD workflow integration
import { ModClient } from '@codai/mod';

const mod = new ModClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://mod.codai.ro/api'
});

// Create and execute workflow
const workflow = await mod.createWorkflow({
  name: 'User Onboarding',
  trigger: {
    type: 'webhook',
    path: '/user-registered'
  },
  steps: [
    {
      type: 'codai.memorai.create_profile',
      config: {
        userId: '{{trigger.body.userId}}',
        plan: '{{trigger.body.plan}}'
      }
    },
    {
      type: 'codai.bancai.create_account',
      config: {
        userId: '{{step.1.profileId}}',
        initialBalance: 100
      }
    }
  ]
});

// Execute workflow
const execution = await mod.executeWorkflow(workflow.id, {
  userId: 'user123',
  plan: 'premium'
});
```

### Custom Connector Development
```typescript
// Custom connector definition
interface ConnectorDefinition {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  inputs: InputDefinition[];
  outputs: OutputDefinition[];
  configuration: ConfigurationSchema;
  execute: (inputs: any, config: any) => Promise<any>;
}

// Example custom connector
const customConnector: ConnectorDefinition = {
  id: 'custom.email.send',
  name: 'Send Email',
  category: 'Communication',
  icon: 'mail',
  description: 'Send email using SMTP',
  inputs: [
    { name: 'to', type: 'string', required: true },
    { name: 'subject', type: 'string', required: true },
    { name: 'body', type: 'string', required: true }
  ],
  outputs: [
    { name: 'messageId', type: 'string' },
    { name: 'status', type: 'string' }
  ],
  execute: async (inputs, config) => {
    // Implementation here
    return { messageId: 'msg123', status: 'sent' };
  }
};
```

### Workflow Template
```yaml
# Workflow template example
name: "E-commerce Order Processing"
description: "Automated order processing workflow"
version: "1.0.0"
category: "E-commerce"

trigger:
  type: "webhook"
  path: "/order-received"
  
variables:
  - name: "orderId"
    type: "string"
    source: "trigger.body.orderId"
  - name: "customerId"
    type: "string"
    source: "trigger.body.customerId"

steps:
  - id: "validate_order"
    type: "codai.validation.order"
    config:
      orderId: "{{variables.orderId}}"
    
  - id: "process_payment"
    type: "codai.bancai.charge"
    config:
      customerId: "{{variables.customerId}}"
      amount: "{{steps.validate_order.total}}"
    condition: "{{steps.validate_order.valid}} == true"
    
  - id: "send_confirmation"
    type: "codai.notification.email"
    config:
      to: "{{steps.validate_order.customerEmail}}"
      template: "order_confirmation"
      data:
        orderId: "{{variables.orderId}}"
        amount: "{{steps.process_payment.amount}}"
```

## 🛣️ Roadmap

### Phase 1: Core Platform (Q1 2025)
- ✅ Visual workflow builder
- ✅ Basic automation engine
- ✅ CODAI services integration
- ⏳ Template marketplace
- ⏳ Advanced monitoring dashboard

### Phase 2: Advanced Features (Q2 2025)
- 🔄 AI-powered workflow optimization
- 🔄 Advanced error handling and recovery
- 🔄 Multi-environment deployment
- ⏳ Real-time collaboration features
- ⏳ Advanced debugging tools

### Phase 3: Enterprise Features (Q3 2025)
- ⏳ Enterprise SSO integration
- ⏳ Advanced security and compliance
- ⏳ Multi-tenant automation platform
- ⏳ Advanced audit and governance
- ⏳ Custom connector marketplace

### Phase 4: AI Enhancement (Q4 2025)
- ⏳ Natural language workflow creation
- ⏳ Intelligent workflow suggestions
- ⏳ Automated workflow optimization
- ⏳ Predictive automation insights
- ⏳ Self-healing workflows

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../docs/CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Install dependencies: `pnpm install`
4. Set up local services (PostgreSQL, Redis)
5. Make your changes
6. Run tests: `pnpm test`
7. Submit a pull request

## 📞 Support

- **Documentation**: [docs.mod.codai.ro](https://docs.mod.codai.ro)
- **API Reference**: [api.mod.codai.ro](https://api.mod.codai.ro)
- **Community**: [Discord](https://discord.gg/codai-ecosystem)
- **Email Support**: support@mod.codai.ro
- **Enterprise**: enterprise@mod.codai.ro

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**MOD** - Modular Automation Builder for creating powerful workflows in the CODAI ecosystem.

*Part of the [CODAI Ecosystem](https://codai.ro) - Building the future of AI-native applications.*