# Contributing to ROMAI

Thank you for your interest in contributing to ROMAI! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a professional environment

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Git
- Azure OpenAI access (for testing)

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/yourusername/romai.git
   cd romai
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   # Configure your Azure OpenAI credentials
   ```

4. **Build and Test**
   ```bash
   pnpm build
   pnpm test
   ```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature development
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Making Changes

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow code standards
   - Write tests
   - Update documentation

3. **Test Changes**

   ```bash
   pnpm build
   pnpm test
   pnpm lint
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Build/tool changes

**Examples:**

```
feat(mcp): add Romanian expert tool
fix(core): resolve Azure OpenAI connection issue
docs(readme): update installation instructions
```

## Code Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer interfaces over types for objects
- Use explicit return types for functions
- Avoid `any` type usage

```typescript
// Good
interface UserRequest {
  query: string;
  language: 'ro' | 'en';
}

async function processRequest(request: UserRequest): Promise<string> {
  // implementation
}

// Avoid
function processRequest(request: any): any {
  // implementation
}
```

### Code Style

- Use Prettier for formatting
- Follow ESLint rules
- Use meaningful variable names
- Add JSDoc comments for public APIs

```typescript
/**
 * Processes an intelligence request using ROMAI core engine
 * @param request - The intelligence request with query and context
 * @returns Promise resolving to the AI response
 */
async function processIntelligenceRequest(
  request: IntelligenceRequest
): Promise<IntelligenceResponse> {
  // implementation
}
```

### Package Structure

```
packages/package-name/
├── src/
│   ├── index.ts          # Main export
│   ├── types.ts          # Type definitions
│   └── utils/            # Utility functions
├── tests/
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
├── package.json
├── tsconfig.json
└── README.md
```

## Testing

### Test Types

1. **Unit Tests** - Test individual functions/classes
2. **Integration Tests** - Test package interactions
3. **End-to-End Tests** - Test complete workflows

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { RomaiCore } from '../src/index';

describe('RomaiCore', () => {
  it('should initialize with valid config', () => {
    const config = {
      azure: {
        apiKey: 'test-key',
        endpoint: 'https://test.openai.azure.com/',
        deploymentName: 'gpt-4',
      },
    };

    const core = new RomaiCore(config);
    expect(core).toBeDefined();
  });
});
```

### Running Tests

```bash
# All tests
pnpm test

# Specific package
cd packages/romai-core
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## Documentation

### Documentation Standards

- Use clear, concise language
- Include code examples
- Document all public APIs
- Keep README files updated

### API Documentation

Use JSDoc for TypeScript:

````typescript
/**
 * ROMAI Core Intelligence Engine
 *
 * Provides Romanian AI capabilities with Azure OpenAI integration
 *
 * @example
 * ```typescript
 * const romai = new RomaiCore(config);
 * const response = await romai.processIntelligenceRequest({
 *   query: "Explică-mi despre istoria României",
 *   language: "ro"
 * });
 * ```
 */
export class RomaiCore {
  // implementation
}
````

### README Structure

Each package should have:

1. Purpose and overview
2. Installation instructions
3. Usage examples
4. API reference
5. Contributing guidelines

## Submitting Changes

### Pull Request Process

1. **Pre-submission Checklist**
   - [ ] Code builds successfully
   - [ ] All tests pass
   - [ ] Linting passes
   - [ ] Documentation updated
   - [ ] CHANGELOG updated (if applicable)

2. **Create Pull Request**
   - Use descriptive title
   - Reference related issues
   - Include screenshots if UI changes
   - Add reviewers

3. **Pull Request Template**

   ```markdown
   ## Description

   Brief description of changes

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing

   - [ ] Unit tests added/updated
   - [ ] Integration tests pass
   - [ ] Manual testing completed

   ## Checklist

   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No merge conflicts
   ```

### Review Process

1. **Automated Checks**
   - Build status
   - Test results
   - Code quality metrics
   - Security scans

2. **Code Review**
   - Architecture feedback
   - Code quality review
   - Performance considerations
   - Security review

3. **Approval and Merge**
   - Minimum 2 approvals for major changes
   - Squash and merge for feature branches
   - Update related documentation

## Package-Specific Guidelines

### @romai/types

- Central type definitions
- No runtime dependencies
- Comprehensive JSDoc comments
- Semantic versioning critical

### @romai/core

- Core AI engine
- Performance-critical code
- Extensive testing required
- Azure OpenAI integration

### @romai/mcp

- MCP server implementation
- Tool definitions and handlers
- Integration testing with MCP clients
- Romanian language optimization

### Apps

- Standalone applications
- End-to-end testing
- Performance monitoring
- Production readiness

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- `MAJOR.MINOR.PATCH`
- Breaking changes = MAJOR
- New features = MINOR
- Bug fixes = PATCH

### Release Steps

1. **Preparation**

   ```bash
   pnpm changeset
   pnpm changeset:version
   ```

2. **Testing**

   ```bash
   pnpm build
   pnpm test
   pnpm lint
   ```

3. **Publication**
   ```bash
   pnpm changeset:publish
   ```

## Getting Help

### Resources

- [Project Documentation](docs/)
- [API Reference](docs/api/)
- [Examples](examples/)
- [Troubleshooting](docs/troubleshooting.md)

### Support Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and community discussions
- **Discord** - Real-time chat (CodAI Discord server)
- **Email** - team@codai.ro for private matters

### Common Issues

1. **Build Errors**
   - Check Node.js version (>=20)
   - Verify pnpm version (>=9)
   - Clear cache: `pnpm clean`

2. **Test Failures**
   - Update dependencies
   - Check environment variables
   - Review test logs

3. **TypeScript Errors**
   - Check tsconfig inheritance
   - Verify package imports
   - Update type definitions

## Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes
- Project documentation
- Annual contributor awards

Thank you for contributing to ROMAI! 🇷🇴 🧠
