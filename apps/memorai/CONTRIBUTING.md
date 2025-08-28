# Contributing to MemorAI

Thank you for your interest in contributing to MemorAI! This document provides guidelines and information for contributors.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please read and follow our Code of Conduct (linked from main repository).

## Getting Started

### Prerequisites

- Node.js 20+ and PNPM 8+
- Docker and Docker Compose
- Git
- VS Code (recommended) with suggested extensions

### Development Setup

```bash
# Clone and install dependencies
git clone https://github.com/codai-ecosystem/codai-project
cd codai-project
pnpm install

# Start MemorAI in development mode
cd apps/memorai
pnpm dev

# In a separate terminal, start required services
docker-compose up -d postgres redis cbd-database memorai-mcp-service
```

### Project Structure

```
apps/memorai/
├── .arch/                 # Architecture Decision Records
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── services/         # Business logic services
│   ├── lib/              # Utility functions
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Helper utilities
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
├── BACKLOG.md            # Project backlog and issues
├── TEST_PLAN.md          # Testing strategy and plans
└── package.json          # Dependencies and scripts
```

## Development Workflow

### 1. Issue Assignment
- Browse the [BACKLOG.md](./BACKLOG.md) for available issues
- Comment on an issue to request assignment
- Wait for maintainer approval before starting work
- Issues are organized by epic and sprint

### 2. Branch Strategy
```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/issue-number-brief-description

# Example
git checkout -b feature/1.1-memory-service-foundation
```

### 3. Development Guidelines

#### Code Style
- Follow TypeScript strict mode guidelines
- Use ESLint and Prettier configurations (auto-formatting enabled)
- Write self-documenting code with clear variable names
- Add JSDoc comments for public APIs

#### Testing Requirements
- Write unit tests for all new functions and components
- Maintain ≥80% test coverage (≥90% for critical services)
- Add integration tests for API endpoints
- Include E2E tests for critical user flows

#### Commit Messages
Follow [Conventional Commits](https://conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Examples:**
```bash
feat(memory): add semantic search functionality
fix(api): resolve authentication token expiry issue
docs: update API documentation for memory endpoints
test: add unit tests for MemoryService
```

#### Performance Considerations
- All API responses must be <100ms for cached data
- Database queries should use proper indexing
- Implement pagination for large data sets
- Use React.memo() for expensive component renders
- Optimize bundle size and lazy load components

### 4. Pull Request Process

#### Before Submitting
```bash
# Run quality checks
pnpm lint           # ESLint checks
pnpm type-check     # TypeScript validation  
pnpm test:unit      # Unit tests
pnpm test:integration # Integration tests
pnpm build          # Build verification
```

#### PR Requirements
- Link to the issue being addressed
- Include comprehensive description of changes
- Add screenshots/videos for UI changes
- Update documentation if needed
- Ensure all CI/CD checks pass

#### PR Template
Use the provided PR template (automatically loaded):

```markdown
## Issue
Closes #[issue-number]

## Changes
- Brief description of changes made
- Any breaking changes
- Database schema changes

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing completed

## Screenshots/Videos
(For UI changes)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No performance regressions
```

### 5. Code Review Process

#### Review Criteria
- Code quality and maintainability
- Test coverage and quality
- Performance impact
- Security implications
- Documentation completeness

#### Review Timeline
- Initial review within 24 hours
- Address feedback within 48 hours
- Re-reviews within 24 hours
- Merge after 2+ approvals

## Architecture & Design

### Key Principles
- **Contract-First Development**: Define APIs before implementation
- **Security by Design**: Consider security at every layer
- **Performance First**: Optimize for speed and scalability
- **Accessibility**: WCAG 2.1 AA compliance required
- **Testability**: Write testable, modular code

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL, Redis, CBD (Custom Backend Database)
- **AI Integration**: Azure OpenAI, Vector embeddings
- **Testing**: Vitest, Playwright, Testing Library
- **Infrastructure**: Docker, Kubernetes, GitHub Actions

### API Design Standards
- RESTful API design with OpenAPI 3.1 documentation
- Consistent error handling and status codes
- Request/response validation with Zod schemas
- Rate limiting and authentication on all endpoints
- Comprehensive logging and monitoring

## Security Guidelines

### Security Requirements
- Input validation and sanitization for all user inputs
- SQL injection and XSS protection
- Secure authentication with JWT tokens
- Data encryption at rest and in transit
- Audit logging for all sensitive operations

### Reporting Security Issues
- **Do NOT** create public issues for security vulnerabilities
- Email security issues to: security@codai.dev
- Include detailed reproduction steps
- Allow reasonable time for fixes before disclosure

## Performance Guidelines

### Performance Targets
- Page load times: <2s for First Contentful Paint
- API responses: <100ms for cached, <500ms for uncached
- Database queries: <50ms for simple, <200ms for complex
- Search operations: <300ms including vector similarity

### Monitoring
- Use performance profiling tools during development
- Monitor Core Web Vitals in production
- Set up alerts for performance regressions
- Regular performance audits and optimization

## Documentation Standards

### Code Documentation
- JSDoc comments for all public APIs
- README files for complex modules
- Inline comments for complex business logic
- Architecture Decision Records (ADRs) for major decisions

### API Documentation
- OpenAPI 3.1 specifications for all endpoints
- Request/response examples
- Error handling documentation
- Authentication and authorization details

## Release Process

### Version Strategy
- Semantic versioning (semver)
- Feature releases every 2 weeks
- Hotfixes as needed for critical issues
- Major releases quarterly

### Deployment Pipeline
1. Development → Feature branch testing
2. Staging → Integration and E2E testing  
3. Production → Blue-green deployment
4. Monitoring → Post-deployment validation

## Getting Help

### Resources
- **Documentation**: [MemorAI Wiki](https://wiki.codai.dev/memorai)
- **API Reference**: [API Docs](https://api.memorai.codai.dev/docs)
- **Architecture**: See `.arch/` directory for ADRs

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat (link in main repository)
- **Email**: team@codai.dev for urgent matters

### Mentorship Program
- New contributors are paired with experienced maintainers
- Weekly office hours for Q&A sessions
- Code review sessions for learning opportunities
- Contribution path guidance and career development

## Recognition

### Contributor Levels
- **Contributor**: Merged PRs and active participation
- **Regular Contributor**: Consistent contributions over 3+ months
- **Maintainer**: Trusted with review permissions and technical decisions
- **Core Team**: Full project access and strategic input

### Recognition Programs
- Monthly contributor highlights
- Annual contributor awards
- Speaking opportunities at conferences
- Open source portfolio development

---

## Quick Reference

### Essential Commands
```bash
# Development
pnpm dev              # Start development server
pnpm build            # Production build
pnpm test             # Run all tests
pnpm lint             # Code linting
pnpm type-check       # TypeScript validation

# Testing
pnpm test:unit        # Unit tests only
pnpm test:integration # Integration tests only
pnpm test:e2e         # End-to-end tests
pnpm test:coverage    # Coverage report

# Quality
pnpm ci               # Full CI pipeline locally
pnpm preview          # Preview production build
```

### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or modifications
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks

Thank you for contributing to MemorAI! 🧠✨