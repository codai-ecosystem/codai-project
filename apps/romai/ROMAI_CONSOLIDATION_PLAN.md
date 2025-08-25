# RomAI Project Consolidation Plan
# Microsoft-Compliant Modular Architecture

## CRITICAL ISSUE: 50+ Scattered Directories in apps/romai/src/
Current state shows massive file scatter that prevents efficient development and maintenance.

## Microsoft-Compliant Structure (Following Azure ML Patterns)

### Phase 1: Core Architecture Consolidation

```
apps/romai/src/
├── domains/                    # Keep - Well-organized AI domains
│   ├── mathematical/          # ✅ Enhanced with ultimate_mathematical_engine.py
│   ├── programming/
│   ├── multimodal/
│   ├── scientific/
│   ├── linguistic/
│   ├── romanian-cultural/
│   ├── creative/
│   └── autonomous/
├── core/                      # Keep - Essential AGI orchestration
│   ├── agi-engine/           # Multi-domain orchestrator
│   └── infrastructure/       # Core services
├── api/                       # Consolidate - REST/GraphQL endpoints
│   ├── endpoints/            # Individual API routes
│   ├── middleware/           # Authentication, validation
│   └── schemas/              # API schemas
├── ml/                        # Consolidate - Machine Learning components
│   ├── models/               # ML model definitions
│   ├── training/             # Training pipelines
│   ├── inference/            # Inference engines
│   └── serving/              # Model serving (current model_server.py location)
├── services/                  # Business logic services
├── utils/                     # Shared utilities
├── config/                    # Configuration management
├── types/                     # TypeScript type definitions
└── tests/                     # Comprehensive test suite
```

### Directories to Consolidate/Remove

#### Archive and Remove
- `.cache/` → Move to project root cache
- `archive/`, `__archive__/` → Consolidate to single archive
- `__pycache__/` → Auto-generated, remove

#### Consolidate into `api/`
- `app/` → Move components to api/endpoints/
- `pages/` → Move to api/endpoints/
- `components/` → Move to api/middleware/ or shared

#### Consolidate into `ml/`
- `ml_new/` → Consolidate with ml/
- `models/` → Move to ml/models/
- `training/` → Move to ml/training/
- `inference/` → Move to ml/inference/
- `preprocessing/` → Move to ml/preprocessing/

#### Consolidate into `tests/`
- `testing/` → Move to tests/
- `test_results/` → Move to tests/results/
- `validation/` → Move to tests/validation/
- All scattered test files → Move to tests/

#### Consolidate into `services/`
- `analytics/` → Move to services/analytics/
- `compliance/` → Move to services/compliance/
- `education/` → Move to services/education/
- `enterprise/` → Move to services/enterprise/
- `fabricai/` → Move to services/fabricai/
- `financial/` → Move to services/financial/
- `government/` → Move to services/government/
- `legal/` → Move to services/legal/
- `monitoring/` → Move to services/monitoring/
- `qa/`, `quality_assurance/` → Move to services/quality/

#### Consolidate into `utils/`
- `features/` → Move to utils/features/
- `hooks/` → Move to utils/hooks/
- `lib/` → Move to utils/lib/
- `shared/` → Move to utils/shared/
- `scripts/` → Move to utils/scripts/

#### Consolidate into `config/`
- `deployment/` → Move to config/deployment/
- `optimization/` → Move to config/optimization/
- `production/`, `production-excellence/` → Move to config/production/

#### Language-Specific Organization
- `python/` → Consolidate into appropriate directories
- `typescript/` → Move to appropriate api/ or types/ locations

## Implementation Priority

### Phase 1 (Immediate): Core Cleanup
1. Remove auto-generated directories (.cache/, __pycache__/)
2. Consolidate archives
3. Move scattered test files to tests/

### Phase 2: Service Consolidation  
1. Consolidate ml/ directories
2. Consolidate api/ components
3. Consolidate services/

### Phase 3: Final Organization
1. Move utils and config items
2. Validate all imports
3. Update documentation

## Benefits
- ✅ Microsoft-compliant modular architecture
- ✅ Clear separation of concerns
- ✅ Easier maintenance and development
- ✅ Better IDE navigation
- ✅ Simplified testing and deployment
- ✅ Professional enterprise structure

## Risk Mitigation
- Test imports after each consolidation step
- Keep backups of critical files
- Update all file references incrementally
- Validate API endpoints after moves