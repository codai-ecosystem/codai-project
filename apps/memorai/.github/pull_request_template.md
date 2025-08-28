# Pull Request Template

## Issue Reference
**Issue:** Closes #[issue-number]
**Epic:** [Epic name from BACKLOG.md]
**Sprint:** [Sprint number if applicable]

## Summary
<!-- Brief description of what this PR accomplishes -->

### What changed?
- 
- 
- 

### Why was this change needed?
<!-- Explain the business/technical justification -->

## Type of Change
<!-- Mark with [x] all that apply -->

- [ ] 🚀 **feat**: New feature implementation
- [ ] 🐛 **fix**: Bug fix or issue resolution
- [ ] 📚 **docs**: Documentation updates
- [ ] 🎨 **style**: Code formatting/style changes
- [ ] ♻️ **refactor**: Code refactoring without behavior change
- [ ] ⚡ **perf**: Performance improvements
- [ ] ✅ **test**: Test additions or improvements
- [ ] 🔧 **build**: Build system or dependency changes
- [ ] 💚 **ci**: CI/CD pipeline changes
- [ ] 🧹 **chore**: Maintenance or tooling updates

## Technical Details

### Architecture Impact
<!-- Describe any architectural changes or implications -->
- **Services affected**: 
- **Database changes**: 
- **API changes**: 
- **Breaking changes**: 

### Implementation Approach
<!-- Explain key technical decisions and patterns used -->

### Performance Considerations
- **Performance impact**: <!-- None/Positive/Negative/Unknown -->
- **Load testing results**: <!-- If applicable -->
- **Memory usage**: <!-- If applicable -->

## Testing

### Test Coverage
<!-- Mark with [x] completed items -->

- [ ] **Unit Tests**: New/updated unit tests added
- [ ] **Integration Tests**: API integration tests added
- [ ] **E2E Tests**: End-to-end scenarios covered
- [ ] **Manual Testing**: All functionality manually verified
- [ ] **Regression Testing**: No existing features broken

### Test Results
```
# Paste test results here
pnpm test
```

### Critical Paths Tested
<!-- List the main user flows/API endpoints tested -->
- [ ] User can [describe critical functionality]
- [ ] System handles [edge case/error condition]
- [ ] Performance meets requirements ([specific metrics])

## Security Review

### Security Considerations
<!-- Mark with [x] all that have been considered -->

- [ ] **Input Validation**: All user inputs properly validated
- [ ] **Authentication**: Proper auth checks implemented
- [ ] **Authorization**: RBAC/permissions correctly applied
- [ ] **Data Sanitization**: XSS/injection prevention measures
- [ ] **Sensitive Data**: No secrets/credentials exposed
- [ ] **OWASP Compliance**: Common vulnerabilities addressed

### Security Testing
- [ ] Security scan passed
- [ ] Penetration testing completed (if applicable)
- [ ] Data flow analysis reviewed

## Database Changes

### Schema Changes
<!-- If applicable, describe database schema modifications -->

```sql
-- Paste migration SQL here
```

### Data Migration
- [ ] **Migration script created**: 
- [ ] **Rollback plan documented**: 
- [ ] **Data backup plan**: 
- [ ] **Performance impact assessed**: 

## API Changes

### OpenAPI Specification
- [ ] **OpenAPI spec updated**: Contract-first approach followed
- [ ] **Backward compatibility**: Maintained/Breaking changes documented
- [ ] **Response schemas**: Validated with Zod
- [ ] **Error handling**: Comprehensive error responses

### Endpoints Modified
<!-- List new/modified API endpoints -->

| Method | Endpoint | Description | Breaking Change |
|--------|----------|-------------|----------------|
| GET    | `/api/...` | ... | ❌ |

## UI/UX Changes

### Visual Changes
<!-- Include screenshots/videos for UI modifications -->

#### Before
<!-- Screenshot of UI before changes -->

#### After  
<!-- Screenshot of UI after changes -->

### Accessibility
- [ ] **WCAG 2.1 AA**: Accessibility standards met
- [ ] **Screen reader**: Compatible with assistive technologies
- [ ] **Keyboard navigation**: Full keyboard accessibility
- [ ] **Color contrast**: Meets minimum contrast requirements
- [ ] **Focus management**: Proper focus indicators and flow

### Responsive Design
- [ ] **Mobile**: Tested on mobile devices
- [ ] **Tablet**: Tested on tablet devices
- [ ] **Desktop**: Tested on desktop browsers
- [ ] **Cross-browser**: Chrome, Firefox, Safari, Edge

## Documentation

### Documentation Updates
- [ ] **API Documentation**: OpenAPI specs updated
- [ ] **Component Documentation**: Storybook/JSDoc updated
- [ ] **README**: Installation/usage instructions updated
- [ ] **ADRs**: Architecture decisions documented
- [ ] **CHANGELOG**: User-facing changes documented

### Code Comments
- [ ] **Complex logic**: Documented with clear comments
- [ ] **Public APIs**: JSDoc documentation added
- [ ] **Configuration**: Environment variables documented

## Deployment

### Environment Configuration
- [ ] **Environment variables**: New variables documented
- [ ] **Feature flags**: Configuration requirements noted
- [ ] **Infrastructure**: Resource requirements assessed

### Deployment Strategy
- [ ] **Zero-downtime**: Deployment strategy planned
- [ ] **Rollback plan**: Rollback procedure documented
- [ ] **Monitoring**: Health checks and metrics planned

## Quality Assurance

### Code Quality
```
# ESLint Results
pnpm lint

# TypeScript Check
pnpm type-check

# Build Verification
pnpm build
```

### Performance Metrics
<!-- Include before/after performance measurements -->

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Bundle Size | - | - | - |
| Load Time | - | - | - |
| API Response | - | - | - |

## Checklist

### Pre-submission Checklist
- [ ] **Code Review**: Self-reviewed all changes
- [ ] **Testing**: All tests pass locally
- [ ] **Linting**: No linting errors
- [ ] **TypeScript**: No type errors
- [ ] **Build**: Production build successful
- [ ] **Documentation**: All documentation updated
- [ ] **Performance**: No performance regressions
- [ ] **Security**: Security considerations addressed

### CI/CD Pipeline
- [ ] **GitHub Actions**: All CI checks passing
- [ ] **Test Coverage**: Meets minimum coverage requirements (80%)
- [ ] **Security Scan**: Security checks passed
- [ ] **Bundle Analysis**: Bundle size within limits
- [ ] **Performance Budget**: Performance metrics acceptable

## Additional Context

### Related PRs/Issues
<!-- Link to related work -->
- Related to #[issue-number]
- Depends on #[pr-number]
- Blocks #[issue-number]

### Special Considerations
<!-- Any special notes for reviewers -->

### Migration Guide
<!-- If this introduces breaking changes, provide migration instructions -->

### Future Improvements
<!-- List potential improvements or technical debt created -->

---

## For Reviewers

### Focus Areas
<!-- Highlight specific areas that need careful review -->
- [ ] **Algorithm correctness**: 
- [ ] **Error handling**: 
- [ ] **Performance impact**: 
- [ ] **Security implications**: 

### Testing Instructions
<!-- Specific steps for reviewers to test this change -->
1. 
2. 
3. 

### Review Checklist
- [ ] **Code Quality**: Clean, readable, maintainable code
- [ ] **Architecture**: Follows established patterns and principles  
- [ ] **Testing**: Adequate test coverage and quality
- [ ] **Documentation**: Clear and comprehensive documentation
- [ ] **Performance**: No negative performance impact
- [ ] **Security**: No security vulnerabilities introduced
- [ ] **Accessibility**: UI changes meet accessibility standards