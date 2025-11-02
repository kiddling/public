# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed - Lighthouse CI Configuration Improvements 🚀

#### Lighthouse CI Enhancements

- ✅ Migrated from `lighthouserc.js` to `.lighthouserc.json` for JSON-based configuration
- ✅ Updated performance budgets: Performance ≥90, SEO ≥95 (increased from 90)
- ✅ Added multiple critical route testing:
  - Home page (`/`)
  - Students page (`/students`)
  - Design Log (`/design-log`)
  - Downloads center (`/downloads`)
- ✅ Updated CI command to use `pnpm dlx @lhci/cli` to avoid global npm installs
- ✅ Improved CI artifact naming with branch, run number, and commit SHA
- ✅ Created comprehensive Lighthouse CI documentation (`docs/LIGHTHOUSE_CI.md`)
- ✅ Updated all documentation references from `lighthouserc.js` to `.lighthouserc.json`

### Added - Batch Optimization Release 🚀

#### Performance Monitoring & Testing

- ✅ Web Vitals integration for real-time performance metrics (LCP, FID, CLS, FCP, TTFB, INP)
- ✅ Lighthouse CI configuration for automated performance audits
- ✅ Health check endpoints for Frontend (`/api/health`) and CMS (`/_health`)
- ✅ Performance monitoring documentation

#### Docker Containerization

- ✅ Multi-stage Dockerfile for Nuxt frontend (3 stages: deps → builder → runner)
- ✅ Optimized Strapi Docker image (reduced from ~800MB to ~180MB)
- ✅ Docker Compose orchestration for complete stack (Frontend, CMS, PostgreSQL, Redis, Nginx)
- ✅ Development Docker Compose for local development with database services
- ✅ Nginx reverse proxy configuration with gzip, caching, and rate limiting
- ✅ Health checks for all Docker services
- ✅ Non-root user configuration for improved security
- ✅ Comprehensive Docker documentation

#### CI/CD Pipeline

- ✅ GitHub Actions CI/CD workflow with automated testing, building, and deployment
- ✅ Security audit workflow with npm audit, Snyk, and CodeQL analysis
- ✅ Automated Docker image building and pushing to container registry
- ✅ Lighthouse CI integration in GitHub Actions
- ✅ Code quality checks (lint, format, typecheck)

#### Design Tool Suite

- ✅ Design Template API with Strapi custom endpoints
  - RESTful API for template management
  - CRUD operations for design templates
- ✅ Design Log interactive form component
  - Project information management
  - Design process tracking
  - Results and reflection sections
  - Tags and categorization
- ✅ IndexedDB storage for offline-first design logs
  - Local data persistence
  - Search and filtering capabilities
  - Draft auto-save functionality
  - Import/export to JSON
- ✅ PDF export functionality for design logs
  - Professional document generation
  - Chinese font support
  - Single and batch export
- ✅ Design log management interface
  - Tab-based navigation (Create, List, Drafts)
  - Search and filter logs
  - Draft recovery system

#### Documentation

- ✅ Comprehensive deployment guide (`docs/DEPLOYMENT.md`)
  - System requirements
  - Development and production deployment
  - PM2, Docker, and Kubernetes deployment options
  - Backup and recovery procedures
  - ICP filing guide for China
- ✅ Monitoring and operations guide (`docs/MONITORING.md`)
  - Web Vitals monitoring
  - Lighthouse CI usage
  - Health checks
  - Log management
  - Prometheus + Grafana integration
  - Error tracking with Sentry
- ✅ Docker documentation (`docs/DOCKER.md`)
  - Docker architecture
  - Multi-stage build details
  - Usage scenarios
  - Security best practices
  - Troubleshooting guide
  - China-specific optimizations
- ✅ Design log system documentation (`docs/DESIGN_LOG_SYSTEM.md`)
  - Feature overview
  - Usage guide
  - API reference
  - Customization guide
- ✅ Optimization summary (`docs/OPTIMIZATION_SUMMARY.md`)
  - Complete task overview
  - Implementation details
  - Usage instructions

### Changed

#### Package Management

- Updated root `package.json` with new Docker and Lighthouse scripts
- Added `@lhci/cli` dev dependency for Lighthouse CI
- Added `idb`, `jspdf`, and `web-vitals` dependencies to frontend

#### Configuration

- Enhanced `.gitignore` to exclude Docker environment files and Lighthouse CI artifacts
- Updated README with new features and documentation links

### Performance Improvements

- 🚀 Docker image size reduction:
  - Frontend: ~1GB → ~150MB (85% reduction)
  - CMS: ~800MB → ~180MB (77% reduction)
- 🚀 Multi-stage builds for faster builds with layer caching
- 🚀 Optimized container startup time with health checks

### Security Enhancements

- 🔒 Non-root user configuration in all Docker containers
- 🔒 Automated security scanning with CodeQL and Snyk
- 🔒 Network isolation in Docker Compose
- 🔒 Rate limiting in Nginx configuration
- 🔒 Minimized attack surface with Alpine Linux base images

### Developer Experience

- 🛠️ Simplified Docker commands with npm/pnpm scripts
- 🛠️ Comprehensive documentation for all features
- 🛠️ Health check endpoints for easy monitoring
- 🛠️ CI/CD automation for faster deployment

## Project Information

- **Tech Stack**: Nuxt 3, Strapi CMS, PostgreSQL, Docker, GitHub Actions
- **Target**: Educational content management for Chinese students
- **License**: [Your License]
- **Repository**: [Your Repository URL]

---

For detailed information about any feature, please refer to the corresponding documentation in the `docs/` directory.
