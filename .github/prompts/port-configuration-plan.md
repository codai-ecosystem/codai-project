# Codai Ecosystem Port Configuration Plan

## Issue Analysis

The Codai ecosystem contains 29 services/apps, all using Next.js with the default `next dev` command. This creates port conflicts as all services attempt to use port 3000. For successful parallel development and testing, each service needs a unique port assignment.

## Port Assignment Strategy

### Port Range: 3000-3029 (30 ports total)

- **Apps (11)**: 3000-3010 (Priority 1-3 based on business importance)
- **Services (18)**: 4011-4028 (Alphabetical order for consistency)
- **Reserved**: 3029 (Future expansion)

### Detailed Port Assignments

#### Core Apps (Priority 1-3)

```
3000 - codai          # Central Platform & AIDE Hub (Priority 1)
3001 - memorai        # AI Memory & Database Core (Priority 1)
3002 - logai          # Identity & Authentication (Priority 1)
3003 - bancai         # Financial Platform (Priority 2)
3004 - wallet         # Programmable Wallet (Priority 2)
3005 - fabricai       # AI Services Platform (Priority 2)
3006 - x              # AI Trading Platform (Priority 2)
3007 - studiai        # AI Education Platform (Priority 3)
3008 - sociai         # AI Social Platform (Priority 3)
3009 - cumparai       # AI Shopping Platform (Priority 3)
3010 - publicai       # Public AI Services
```

#### Extended Services (Alphabetical)

```
3011 - admin          # Admin Panel & Management
3012 - AIDE           # AI Development Environment
3013 - ajutai         # AI Support & Help Platform
3014 - analizai       # AI Analytics Platform
3015 - dash           # Analytics Dashboard
3016 - docs           # Documentation Platform
3017 - explorer       # AI Blockchain Explorer
3018 - hub            # Central Hub & Dashboard
3019 - id             # Identity Management System
3020 - jucai          # AI Gaming Platform
3021 - kodex          # Code Repository & Version Control
4022 - legalizai      # AI Legal Services Platform
4023 - marketai       # AI Marketing Platform
4024 - metu           # AI Metrics & Analytics
4025 - mod            # Modding & Extension Platform
4026 - stocai         # AI Stock Trading Platform
4027 - templates      # Shared Templates & Boilerplates
4028 - tools          # Development Tools & Utilities
```

## Implementation Plan

### Phase 1: Update Package.json Scripts

- Modify `dev` script in each service's package.json
- Update from `next dev` to `next dev -p <PORT>`
- Ensure consistency across all services

### Phase 2: Update Documentation

- Create PORT_ASSIGNMENTS.md
- Update README.md with port information
- Update DEVELOPMENT_GUIDE.md
- Add port info to projects.index.json

### Phase 3: Update Development Tools

- Update VS Code tasks for specific services
- Update Docker configurations if needed
- Update any proxy configurations

### Phase 4: Testing & Validation

- Test parallel service startup
- Validate browser tests can access correct ports
- Update test configurations with port mappings

## Benefits

1. **Parallel Development**: All services can run simultaneously
2. **Testing Reliability**: Browser tests can access specific services
3. **Developer Experience**: Clear port assignments reduce confusion
4. **Scalability**: Structured approach for future services
5. **Documentation**: Clear reference for new team members

## Breaking Changes

- Development URLs will change for all services
- Existing bookmarks/references need updating
- Test configurations require port updates
- Documentation needs comprehensive updates

## Migration Notes

- Existing services will need restart after port changes
- Browser tests need port mapping updates
- Any hardcoded localhost:3000 references need updates
- Team communication about new URLs required
