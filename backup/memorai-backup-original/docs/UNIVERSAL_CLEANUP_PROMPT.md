# 🧹 Universal Project Cleanup Prompt

## Complete Prompt for Careful Project Organization

```
I want you to carefully clean and organize this project structure. Please follow these guidelines:

## 🎯 ANALYSIS PHASE (Required First)
1. **Examine the current project structure** - List all files in root directory
2. **Identify project type** (Next.js, React, Node.js, Python, etc.) and tech stack
3. **Check for existing organization patterns** (docs/, scripts/, deployment/, etc.)
4. **Analyze file relationships** - Don't break dependencies or imports

## 🔍 SAFE IDENTIFICATION (What to Clean)

### Files to REMOVE (Only if truly unnecessary):
- **Test artifacts**: `test-*.js`, `demo-*.js`, `quick-test.*`, `verify-*.js`
- **Build artifacts**: `*.log`, `*.tmp`, `*.cache`, `output.*`
- **Backup files**: `*.bak`, `*.old`, `*.disabled`, `*.backup`
- **Duplicate configs**: Multiple ESLint configs, PostCSS configs, etc.
- **Lock file duplicates**: Keep project's primary lock file (yarn.lock vs package-lock.json vs pnpm-lock.yaml)
- **Temporary reports**: Auto-generated status files, validation reports
- **Environment duplicates**: Multiple `.env.*` files (keep .env.example, .env.production)

### Files to ORGANIZE (Move to proper directories):
- **Documentation**: `*_REPORT.md`, `*_STATUS.md`, `*_GUIDE.md` → `docs/reports/`
- **Deployment configs**: `k8s-*.yaml`, `docker-compose.*`, `*.dockerfile` → `deployment/`
- **Scripts**: Deployment scripts, startup scripts → `deployment/` or `scripts/`
- **System docs**: Recovery plans, architecture docs → `docs/`

### Files to NEVER TOUCH:
- **Core configs**: `package.json`, `tsconfig.json`, `next.config.js`, `vite.config.js`
- **Framework files**: `app/`, `src/`, `components/`, `pages/`
- **Git files**: `.gitignore`, `.github/`
- **License & README**: `LICENSE`, `README.md`, `CHANGELOG.md`
- **Active dependencies**: `node_modules/`, `.next/`, `dist/`, `build/`

## 📁 ORGANIZATION STRATEGY

### Create logical directory structure:
```
📁 project-root/
├── 📁 docs/
│   ├── 📁 reports/        # Status reports, guides
│   ├── 📁 architecture/   # System design docs
│   └── 📁 guides/         # User guides, API docs
├── 📁 deployment/
│   ├── 📁 k8s/           # Kubernetes configs
│   ├── 📁 docker/        # Docker files
│   └── 📁 scripts/       # Deployment scripts
├── 📁 tools/             # Development tools
└── 📁 configs/           # Additional configurations
```

## ⚠️ SAFETY RULES

### Before removing ANY file:
1. **Check imports/references** - Search codebase for file usage
2. **Verify it's not in package.json scripts**
3. **Confirm it's not imported by other files**
4. **Check if it's referenced in configs** (tsconfig, eslint, etc.)

### Before moving ANY file:
1. **Check relative path references**
2. **Update import statements if needed**
3. **Verify build/deployment scripts still work**

## 🎯 EXECUTION STEPS

1. **List current structure**: Show me what's in the root directory
2. **Categorize files**: Group files by type and purpose
3. **Safety check**: Verify each file's usage before action
4. **Create directories**: Make organized folder structure
5. **Move files**: Relocate files to proper directories
6. **Remove safely**: Only delete confirmed unnecessary files
7. **Update references**: Fix any broken imports/paths
8. **Verify**: Test that project still builds/runs
9. **Document**: Create cleanup summary

## 📋 VALIDATION CHECKLIST

After cleanup, verify:
- [ ] Project still builds successfully
- [ ] All imports resolve correctly
- [ ] Package.json scripts still work
- [ ] Tests still run (if applicable)
- [ ] Development server starts
- [ ] No broken references in configs

## 🚫 RED FLAGS - STOP AND ASK

If you encounter:
- **Custom build tools** or unusual project structure
- **Monorepo setup** with complex dependencies
- **Files with unclear purposes** - ask before removing
- **Legacy codebase** with old patterns
- **Active development** with recent commits to questionable files

## 📊 PROVIDE SUMMARY

Create a summary showing:
- Files removed (with count)
- Files moved (from → to)
- Directories created
- Safety checks performed
- Any remaining concerns or recommendations

Please be EXTREMELY careful - only remove/move files you're 100% certain are safe to change. When in doubt, ask me first.
```

## 🎯 Example Usage

Just copy and paste this prompt, then add:
"Please clean and organize the project at [PROJECT_PATH] following these guidelines."
