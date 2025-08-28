# Contributing to CODAI Essential Services

Welcome to the CODAI project! This document provides comprehensive guidelines for contributing to our essential services ecosystem.

## 🚀 Quick Start

### Prerequisites
- **Node.js**: 18.x or higher
- **pnpm**: 8.15.6 or higher  
- **Docker**: 24.x or higher
- **Git**: 2.40 or higher

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/your-org/codai-project.git
cd codai-project

# Install dependencies
pnpm install

# Setup development environment
pnpm dev:setup

# Start essential services
pnpm dev:services
```

## 🏗️ Architecture Overview

### Essential Services
- **Identity API** (8100): Authentication & user management
- **API Gateway** (8010): Request routing & load balancing
- **Hub API** (8110): Service orchestration & health monitoring
- **MemorAI MCP** (4950): AI memory context management
- **MemorAI GraphQL** (4500): GraphQL API for memory operations
- **MemorAI Frontend** (8006): Memory management interface
- **BancAI** (8120): Financial services & transaction processing
- **CBD Database** (8180): Graph database for complex relationships
- **PostgreSQL** (4300): Primary relational database
- **Redis** (8020): Caching & session management

## 📋 Development Process

### Git Workflow
We follow the **GitFlow** model with these branch types:

```
main              # Production-ready code
├── develop       # Integration branch
├── feature/*     # New features
├── hotfix/*      # Critical production fixes
├── release/*     # Release preparation
└── bugfix/*      # Bug fixes for develop
```

All code changes must be linked to GitHub Issues:

```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/AUTH-123-oauth-integration

# Make changes following TDD approach
# 1. Write failing tests first
# 2. Implement minimum code to pass
# 3. Refactor and optimize

# Commit with conventional format
git add .
git commit -m "feat(auth): implement OAuth 2.0 integration

- Add Google OAuth provider
- Implement JWT token validation  
- Add user session management
- Include comprehensive test coverage

Closes #123"
```

### 3. Pull Request Process

#### PR Requirements Checklist

- [ ] **Linked Issue**: PR must reference a GitHub Issue
- [ ] **Descriptive Title**: Use conventional commit format
- [ ] **Comprehensive Description**: What, why, how, and testing notes
- [ ] **Test Coverage**: Minimum 80% coverage for new code
- [ ] **Documentation**: Update README, API docs, architecture docs
- [ ] **Breaking Changes**: Clearly documented with migration guide
- [ ] **Security Review**: Security checklist completed for sensitive changes

#### PR Template Usage

Use our PR template (`.github/pull_request_template.md`) which includes:

- **Change Summary**: Brief description of changes
- **Type of Change**: Feature, bugfix, hotfix, docs, refactor
- **Testing Strategy**: How changes were tested
- **Deployment Notes**: Any special deployment considerations
- **Breaking Changes**: Impact on existing functionality
- **Security Considerations**: Security implications and mitigations

#### Review Process

1. **Automated Checks**: All CI/CD checks must pass (<10 min)
2. **Code Review**: Minimum 2 approvals from CODEOWNERS
3. **Security Review**: Required for auth, API, database changes
4. **Integration Testing**: E2E tests must pass in staging environment
5. **Performance Testing**: No degradation in core performance metrics

## 🧪 Testing Standards

### Testing Pyramid

- **70% Unit Tests**: Fast, isolated, comprehensive coverage
- **20% Integration Tests**: API contracts, database interactions
- **10% E2E Tests**: Critical user journeys, cross-service flows

### Testing Requirements

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Generate coverage report
pnpm test:coverage
```

### Test Quality Standards

- **Minimum Coverage**: 80% overall, 90% for critical paths
- **Test Isolation**: No shared state between tests
- **Fast Execution**: Unit tests <5ms, integration tests <100ms
- **Reliable Tests**: No flaky tests, deterministic results
- **Clear Assertions**: Descriptive test names and error messages

## 🔒 Security Guidelines

### Security Checklist

- [ ] **Input Validation**: All user inputs sanitized and validated
- [ ] **Authentication**: Proper JWT token validation
- [ ] **Authorization**: RBAC implemented for sensitive operations  
- [ ] **Data Protection**: Encryption at rest and in transit
- [ ] **Dependency Security**: No high/critical vulnerabilities
- [ ] **API Security**: Rate limiting, CORS, security headers
- [ ] **Secrets Management**: No secrets in code, use environment variables

### Security Review Process

1. **Automated Scanning**: CodeQL, Snyk, and npm audit
2. **Manual Review**: Security team review for sensitive changes
3. **Penetration Testing**: For major security features
4. **Compliance Check**: GDPR, SOC2, EU AI Act requirements

## 📝 Code Standards

### TypeScript/JavaScript

- **Strict TypeScript**: `noImplicitAny`, `strictNullChecks` enabled
- **ESLint Configuration**: Extend from `@codai/eslint-config`
- **Prettier Formatting**: Automatic formatting on commit
- **Import Organization**: Absolute imports, grouped by type

```typescript
// Good example
interface UserCreateRequest {
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

export async function createUser(
  request: UserCreateRequest
): Promise<ApiResponse<User>> {
  const validation = await validateUserInput(request);
  if (!validation.isValid) {
    throw new ValidationError(validation.errors);
  }
  
  const user = await userRepository.create({
    ...request,
    id: generateUserId(),
    createdAt: new Date(),
  });
  
  return {
    success: true,
    data: user,
    message: 'User created successfully',
  };
}
```

### Python

- **Type Hints**: All functions must have complete type annotations
- **Black Formatting**: Consistent code formatting
- **Pylint**: Code quality and style enforcement
- **Docstrings**: Google-style docstrings for all public functions

```python
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class UserProfile:
    """User profile information.
    
    Attributes:
        user_id: Unique identifier for the user
        email: User's email address
        created_at: When the profile was created
        preferences: User preferences and settings
    """
    user_id: str
    email: str
    created_at: datetime
    preferences: Optional[Dict[str, Any]] = None

async def get_user_profile(user_id: str) -> Optional[UserProfile]:
    """Retrieve user profile by ID.
    
    Args:
        user_id: The unique identifier for the user
        
    Returns:
        User profile if found, None otherwise
        
    Raises:
        ValidationError: If user_id format is invalid
        DatabaseError: If database query fails
    """
    if not validate_user_id(user_id):
        raise ValidationError(f"Invalid user ID format: {user_id}")
        
    try:
        profile_data = await database.fetch_user_profile(user_id)
        return UserProfile(**profile_data) if profile_data else None
    except DatabaseException as e:
        logger.error(f"Failed to fetch user profile: {e}")
        raise DatabaseError("Unable to retrieve user profile")
```

## 📚 Documentation Standards

### Code Documentation

- **API Documentation**: OpenAPI 3.1 specifications for all endpoints
- **Function Documentation**: Comprehensive docstrings with examples
- **Architecture Documentation**: ADRs for all significant decisions
- **README Updates**: Keep project README current with latest changes

### Documentation Requirements

- **API Changes**: Update OpenAPI specs and generate client SDKs
- **Breaking Changes**: Provide migration guides and deprecation notices
- **New Features**: Include usage examples and integration guides
- **Architecture Changes**: Document with ADRs and system diagrams

## 🚀 Deployment & Release

### Release Process

1. **Feature Freeze**: No new features, bug fixes only
2. **Release Branch**: Create from develop (`release/v1.2.0`)
3. **QA Testing**: Comprehensive testing in staging environment
4. **Documentation**: Update changelog, migration guides
5. **Release Notes**: Detailed notes with breaking changes
6. **Production Deployment**: Blue-green deployment with rollback plan

### Deployment Checklist

- [ ] **All Tests Passing**: CI/CD pipeline successful
- [ ] **Security Scan**: No high/critical vulnerabilities
- [ ] **Performance Testing**: No degradation in key metrics
- [ ] **Database Migrations**: Tested and reversible
- [ ] **Configuration**: Environment variables updated
- [ ] **Monitoring**: Alerts configured for new features
- [ ] **Rollback Plan**: Documented rollback procedure

## 🤝 Community Guidelines

### Code of Conduct

- **Respectful Communication**: Professional and constructive feedback
- **Inclusive Environment**: Welcoming to all contributors
- **Collaborative Spirit**: Help others learn and grow
- **Quality Focus**: Maintain high standards for code and documentation

### Getting Help

- **GitHub Discussions**: General questions and community support
- **GitHub Issues**: Bug reports and feature requests
- **Slack/Discord**: Real-time collaboration and quick questions
- **Documentation**: Comprehensive guides and API references

### Recognition

We recognize contributors through:

- **Contributor Wall**: Featured in project README
- **Release Notes**: Attribution for significant contributions
- **Community Badges**: Special recognition for consistent contributors
- **Mentorship Program**: Opportunities to guide new contributors

## 📊 Performance Standards

### Code Performance

- **Bundle Size**: Monitor and optimize JavaScript bundle size
- **API Response Times**: <200ms for standard operations
- **Database Queries**: Optimized with proper indexing
- **Memory Usage**: Efficient memory management
- **Cache Strategy**: Implement caching for frequently accessed data

### CI/CD Performance

- **Pipeline Duration**: Target <10 minutes for complete pipeline
- **Test Execution**: Parallel execution for faster feedback
- **Build Optimization**: Layer caching and incremental builds
- **Deployment Speed**: Blue-green deployment with minimal downtime

## 🔧 Development Tools

### Required Tools

- **VS Code**: Recommended IDE with workspace settings
- **Docker Desktop**: Local container development
- **Postman/Insomnia**: API testing and documentation
- **Git Kraken/GitHub Desktop**: Git workflow management

### VS Code Extensions

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **GitLens**: Git integration and history
- **REST Client**: API testing within VS Code
- **Docker**: Container management
- **Python**: Python development support

## 📈 Continuous Improvement

### Metrics and KPIs

- **Code Quality**: Maintainability index, technical debt ratio
- **Test Coverage**: Unit, integration, and E2E coverage percentages
- **Security Posture**: Vulnerability count and resolution time
- **Performance Metrics**: Response times, throughput, error rates
- **Developer Experience**: Build times, deploy frequency, MTTR

### Retrospectives

- **Sprint Retrospectives**: Identify improvements in development process
- **Quarterly Reviews**: Assess architecture decisions and technical debt
- **Annual Planning**: Strategic technical roadmap and infrastructure
- **Continuous Learning**: Regular tech talks and knowledge sharing

---

## 🙋 Questions?

If you have questions about contributing, please:

1. Check existing [GitHub Discussions](https://github.com/organization/codai-project/discussions)
2. Review project [documentation](https://docs.codai.dev)
3. Create a new [GitHub Issue](https://github.com/organization/codai-project/issues/new) with the question label

Thank you for contributing to CODAI! 🚀✨