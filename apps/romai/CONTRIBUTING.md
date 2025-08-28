# Contributing to RomAI

Welcome to RomAI, the Romanian Artificial General Intelligence project! We're building the world's most culturally intelligent Romanian AI assistant.

## Quick Start for Contributors

1. **Fork & Clone**: Fork the repo and clone your fork
2. **Setup**: Run `pnpm install` in `/apps/romai`
3. **Cultural Context**: Familiarize yourself with Romanian cultural intelligence requirements
4. **Development**: Follow our Romanian-first development principles
5. **Testing**: Ensure 80%+ test coverage with Romanian cultural validation
6. **Submit**: Create PR with cultural accuracy confirmation

---

## Romanian Cultural Intelligence Principles

### Core Values
- **Acuratețe Culturală** (Cultural Accuracy): All Romanian content must be historically and culturally accurate
- **Sensibilitate Lingvistică** (Linguistic Sensitivity): Proper Romanian grammar, diacritics, and regional variations
- **Respectul Tradițiilor** (Respect for Traditions): Honor Romanian cultural traditions and values
- **Inovație Responsabilă** (Responsible Innovation): Advanced AI while preserving Romanian cultural identity

### Romanian Context Requirements
All contributions must consider Romanian cultural context:
- **Historical Accuracy**: Verify Romanian historical facts and figures
- **Linguistic Precision**: Use proper Romanian diacritics and grammar
- **Cultural Sensitivity**: Respect Romanian traditions and values
- **Regional Awareness**: Consider regional Romanian differences when relevant

---

## Development Process

### Getting Started

#### Prerequisites
- **Node.js** 18+ with pnpm 9.15.9+
- **Python** 3.11+ for ML backend
- **Docker** for local development environment
- **Basic Romanian** language understanding (recommended)

#### Local Setup
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/codai-project.git
cd codai-project/apps/romai

# Install dependencies
pnpm install

# Setup local environment
cp .env.example .env.local

# Start development server
pnpm dev

# Run tests
pnpm test
```

#### Romanian Development Environment
```bash
# Verify Romanian cultural data is loaded
pnpm run cultural:verify

# Test Romanian language processing
pnpm run test:romanian-lang

# Validate cultural intelligence
pnpm run test:cultural-accuracy
```

### Contribution Workflow

#### 1. Issue Creation
- **Feature Requests**: Must include Romanian cultural context justification
- **Bug Reports**: Specify impact on Romanian user experience
- **Cultural Issues**: Flag any Romanian cultural inaccuracies or sensitivities

#### 2. Branch Strategy
```bash
# Feature branches
feature/romanian-cultural-enhancement
feature/math-engine-romanian-terminology
feature/security-gdpr-compliance

# Bug fix branches  
bugfix/romanian-diacritics-display
bugfix/cultural-accuracy-validation

# Hotfix branches (production issues)
hotfix/critical-romanian-security-fix
```

#### 3. Development Standards

##### Code Quality Requirements
- **TypeScript Strict Mode**: All frontend code with strict typing
- **ESLint Security**: Security-focused linting with Romanian context validation
- **Prettier Formatting**: Consistent code style
- **Test Coverage**: >80% overall, >90% for Romanian cultural intelligence

##### Romanian Cultural Validation
```typescript
// Example: Romanian cultural intelligence validation
interface RomanianCulturalValidation {
  accuracy_score: number;           // 0-1, must be >0.9
  linguistic_quality: number;       // 0-1, must be >0.9
  cultural_sensitivity: 'appropriate' | 'caution' | 'inappropriate'; // Must be 'appropriate'
  historical_accuracy: boolean;     // Must be true
  expert_reviewed: boolean;         // Required for cultural content
}
```

##### Commit Standards
```bash
# Conventional Commits with Romanian context
feat(cultural): add Brâncuși historical context engine
fix(romanian): correct diacritic handling in math expressions
docs(cultural): update Romanian cultural validation guidelines

# Romanian-specific scopes
cultural, romanian, math, logical, reasoning, security, gdpr, ui
```

#### 4. Testing Requirements

##### Unit Tests (Required)
```typescript
// Romanian cultural intelligence tests
describe('RomanianCulturalEngine', () => {
  it('should validate Romanian historical accuracy', () => {
    const result = culturalEngine.validateHistoricalFact('Mihai Eminescu');
    expect(result.accuracy).toBeGreaterThan(0.9);
    expect(result.culturalSensitivity).toBe('appropriate');
  });
  
  it('should preserve Romanian diacritics', () => {
    const text = culturalEngine.processText('Bună ziua! Cum vă simțiți?');
    expect(text).toContain('ă');
    expect(text).toContain('î');
    expect(text).toContain('ș');
    expect(text).toContain('ț');
  });
});
```

##### Integration Tests
- **Romanian API Endpoints**: Full cultural intelligence pipeline testing
- **Cultural Data Persistence**: Romanian cultural knowledge storage validation
- **Performance**: Romanian query response time validation (<2s)

##### E2E Tests
- **Romanian User Journeys**: Complete user workflows in Romanian context
- **Cultural Expert Scenarios**: Romanian cultural expert validation workflows
- **Cross-browser**: Romanian language display across browsers

#### 5. Pull Request Process

##### PR Requirements Checklist
- [ ] **Romanian Cultural Review**: Cultural accuracy validated
- [ ] **Test Coverage**: >80% overall, >90% cultural intelligence
- [ ] **Performance**: Romanian query response times <2s
- [ ] **Security**: GDPR compliance maintained
- [ ] **Documentation**: Romanian context documented
- [ ] **Expert Review**: Romanian cultural expert approval (for cultural features)

---

## Code Standards

### Frontend Standards (Next.js + TypeScript)

#### File Structure
```
src/
├── components/
│   ├── cultural/           # Romanian cultural UI components
│   ├── math/              # Mathematical reasoning components  
│   ├── common/            # Shared components
│   └── ui/                # Base UI components
├── hooks/
│   ├── useCulturalContext # Romanian cultural context hook
│   ├── useRomanianMath    # Romanian mathematical processing
│   └── useLogicalReasoning # Logical reasoning hook
├── services/
│   ├── culturalIntelligence # Romanian cultural intelligence service
│   ├── mathEngine         # Mathematical reasoning service
│   └── api/               # API client services
└── types/
    ├── cultural.ts        # Romanian cultural type definitions
    ├── mathematical.ts    # Mathematical reasoning types
    └── api.ts             # API response types
```

#### TypeScript Standards
```typescript
// Strict typing with Romanian context
interface RomanianCulturalQuery {
  readonly query: string;
  readonly language: 'ro' | 'en';
  readonly region?: RomanianRegion;
  readonly cultural_context: CulturalContext;
  readonly user_preferences: RomanianUserPreferences;
}

// Romanian enum definitions
enum RomanianRegion {
  MOLDOVA = 'moldova',
  MUNTENIA = 'muntenia', 
  TRANSILVANIA = 'transilvania',
  OLTENIA = 'oltenia',
  BANAT = 'banat',
  CRISANA = 'crisana',
  MARAMURES = 'maramures',
  DOBROGEA = 'dobrogea'
}
```

---

## Community Guidelines

### Code of Conduct
- **Respectful Communication**: Respectful discussion of Romanian cultural topics
- **Inclusive Environment**: Welcome contributors from all Romanian regions
- **Cultural Sensitivity**: Mindful discussion of Romanian historical and cultural topics
- **Professional Collaboration**: Focus on technical excellence and cultural accuracy

### Romanian Cultural Community
- **Cultural Experts**: Romanian historians, linguists, and cultural experts welcome
- **Regional Representation**: Contributors from all Romanian regions encouraged
- **Educational Focus**: Share knowledge about Romanian culture and history
- **Quality Standards**: Maintain high standards for Romanian cultural accuracy

### Communication Channels
- **GitHub Issues**: Technical discussions and feature requests
- **Romanian Cultural Review**: Expert validation for cultural content
- **Performance Discussions**: Romanian query optimization and scaling
- **Security Forum**: GDPR and Romanian data protection topics

---

## Getting Help

### Technical Support
- **GitHub Issues**: Create issues for bugs and feature requests
- **Documentation**: Comprehensive guides for Romanian cultural features
- **Code Examples**: Romanian cultural intelligence implementation examples
- **Performance Guidelines**: Romanian query optimization best practices

### Romanian Cultural Support
- **Cultural Expert Network**: Access to Romanian cultural experts
- **Historical Validation**: Romanian historical fact verification
- **Linguistic Review**: Romanian language and grammar validation
- **Regional Context**: Understanding of Romanian regional differences

---

**Welcome to the RomAI community!** Together, we're building the most culturally intelligent Romanian AI assistant while maintaining the highest standards of technical excellence and cultural respect.

---

**Last Updated**: January 2025  
**Review Cycle**: Monthly  
**Cultural Expert Contact**: [cultural-expert@codai.ro](mailto:cultural-expert@codai.ro)  
**Technical Lead Contact**: [tech-lead@codai.ro](mailto:tech-lead@codai.ro)
