# AIDE Documentation

Welcome to the AIDE project documentation. This directory contains all technical documentation, reports, and guides for the AI-native development environment.

## 📁 Directory Structure

### `/deployment/`
Deployment guides and production setup documentation:
- Production deployment checklists
- Quick start deployment guides
- Infrastructure setup guides

### `/reports/`
Project completion reports and status documents:
- Final completion reports
- Project status summaries
- Implementation progress reports

### `/compatibility/`
Environment compatibility and technical issues:
- Node.js compatibility reports
- Environment setup guides
- Technical debt documentation

### `/existing-docs/`
Legacy documentation from the original structure:
- Architecture guides
- Development setup
- API documentation

## 🚀 Quick Links

### Getting Started
- [Main README](../README.md) - Project overview and setup
- [Development Setup](./existing-docs/DEVELOPMENT.md) - Local development

### Deployment
- [Production Deployment](./deployment/) - Production setup
- [Docker Setup](./existing-docs/DOCKER.md) - Container deployment
- [Cloud Deployment](./existing-docs/DEPLOYMENT.md) - Cloud platform setup

### Current Status
- [Latest Completion Report](./reports/) - Current project status
- [Compatibility Issues](./compatibility/) - Known technical issues

## 📋 Project Status Summary

**Status:** ✅ Architecturally Complete (98%)
**Ready for:** Production deployment with Node.js 20.x LTS
**Main Blocker:** Node.js 24.x compatibility (environmental issue)

### Key Features Implemented
- ✅ Multi-agent AI system (Planner, Builder, Designer, Tester, Deployer, History)
- ✅ Admin dashboard (`aide-control`) with user/billing management
- ✅ Marketing website (`aide-landing`) with responsive design
- ✅ VS Code extension (`aide-core`) with conversational interface
- ✅ Memory graph engine for persistent context
- ✅ Stripe Connect payment system for user earnings
- ✅ Firebase Auth and Firestore integration
- ✅ Dynamic backend configuration system
- ✅ Comprehensive REST API

## 🔧 Development

This project uses:
- **Node.js 20.x LTS** (required for compatibility)
- **pnpm** for package management
- **Monorepo** structure with workspaces
- **TypeScript** with strict configuration
- **Next.js** for web applications
- **VS Code** as the base platform

## 📞 Support

For technical questions or issues, refer to:
1. [Compatibility Reports](./compatibility/) for environment issues
2. [Deployment Guides](./deployment/) for setup problems
3. [Project Reports](./reports/) for implementation status

---

**Last Updated:** June 8, 2025
**Documentation Version:** 1.0.0
