# RomAI Project Reorganization Plan 2025

## Current Issues Analysis

### 1. Architecture Problems
- **Duplicate Servers**: Two separate AGI servers (development + production)
- **Massive Files**: model_server.py has 13,360 lines - violates single responsibility
- **Mixed Concerns**: API, ML logic, and infrastructure in same modules

### 2. Naming Convention Issues
- Overuse of marketing terms: "advanced", "comprehensive", "ultimate"  
- No consistent naming patterns
- Redundant file names and descriptions

### 3. Project Structure Issues
- Poor separation between domain logic and infrastructure
- No clear Clean Architecture implementation
- Mixed Python/TypeScript organization

## Proposed Clean Architecture Structure

```
romai/
├── domain/                     # Core business logic (Python)
│   ├── entities/              # Core entities and value objects
│   ├── repositories/          # Repository interfaces
│   ├── services/             # Domain services
│   └── events/               # Domain events
│
├── application/               # Use cases and orchestration
│   ├── commands/             # Command handlers (CQRS)
│   ├── queries/              # Query handlers (CQRS)
│   ├── services/             # Application services
│   └── interfaces/           # Application interfaces
│
├── infrastructure/           # External concerns
│   ├── persistence/          # Database implementations
│   ├── external/             # External service clients
│   ├── messaging/            # Message queues, events
│   └── monitoring/           # Logging, metrics
│
├── presentation/             # API and UI layers
│   ├── api/                  # FastAPI REST endpoints
│   ├── websocket/            # Real-time connections
│   └── cli/                  # Command line interfaces
│
├── ml/                       # Machine Learning specific
│   ├── models/               # ML model definitions
│   ├── training/             # Training pipelines
│   ├── inference/            # Inference engines
│   └── evaluation/           # Model evaluation
│
├── config/                   # Configuration management
├── tests/                    # All test files
├── docs/                     # Clean documentation
└── scripts/                  # Utility scripts
```

## Implementation Steps

### Phase 1: Server Consolidation
1. **Merge Duplicate Servers**: Combine model_server.py and production_agi_api.py
2. **Create Single Entry Point**: One configurable server for all environments
3. **Environment-Based Configuration**: Use env vars for dev/prod differences

### Phase 2: Clean Architecture Implementation
1. **Extract Domain Logic**: Move core AGI logic to domain layer
2. **Separate Infrastructure**: Move FastAPI, database, external services
3. **Create Application Services**: Implement use case orchestration

### Phase 3: Naming Standardization
1. **Remove Marketing Terms**: Replace "advanced", "comprehensive", etc.
2. **Implement Consistent Naming**: Use clear, descriptive names
3. **Update All Imports**: Fix all broken imports after renaming

### Phase 4: File Organization
1. **Split Large Files**: Break model_server.py into logical modules
2. **Group Related Functionality**: Organize by domain, not by type
3. **Remove Duplicates**: Eliminate redundant implementations

## Specific Actions

### Server Architecture Fix
```python
# NEW: Single configurable server
romai/
├── presentation/api/server.py        # Single FastAPI app
├── presentation/api/routes/          # Route modules
├── application/services/             # Business logic
└── infrastructure/ml/                # ML serving infrastructure
```

### VSCode Tasks Cleanup
- Remove emojis and special characters
- Use clear, professional task names
- Consolidate redundant tasks

### File Naming Conventions
- Use snake_case for Python files
- Use clear, descriptive names
- Remove marketing adjectives
- Group by functional area

## Benefits
1. **Maintainability**: Clear separation of concerns
2. **Scalability**: Modular, testable architecture  
3. **Professional**: Clean, enterprise-ready codebase
4. **Performance**: Single server reduces resource usage
5. **Development**: Easier to understand and modify

## Timeline
- **Week 1**: Server consolidation and core structure
- **Week 2**: Domain layer extraction and clean architecture
- **Week 3**: Infrastructure and presentation layer separation
- **Week 4**: Testing, documentation, and final cleanup

This plan transforms RomAI from a cluttered, marketing-heavy codebase into a clean, professional, enterprise-ready AGI system following Microsoft and industry best practices.