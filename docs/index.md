# Documentation Index

**Last Updated**: October 1, 2025 at 12:00 AM EST

This index catalogs all documentation for the Mellowise AI-powered LSAT test preparation platform.

---

## Root Documents

### [Architecture Summary](./architecture-summary.md)

Executive overview of Mellowise's production-ready technical architecture with quality metrics, technology stack, and architecture readiness assessment.

### [Architecture Waitlist System](./architecture-waitlist-system.md)

Complete technical architecture for the Mellowise waitlist system including tiered pricing, referral tracking, email automation, and anti-fraud measures.

### [Brainstorming Session Results](./brainstorming-session-results.md)

Initial brainstorming session documentation covering AI-powered tutoring application concepts, target exams, constraints, and feature exploration.

### [Competitor Analysis](./competitor-analysis.md)

Comprehensive market analysis of AI-powered LSAT test prep competitors, market insights, and strategic positioning opportunities.

### [Front-end Spec](./front-end-spec.md)

UI/UX specifications for the main Mellowise application including user personas, information architecture, and visual design specifications.

### [Front-end Spec - Landing Page](./front-end-spec-landing-page.md)

Dedicated UI/UX specification for the waitlist landing page with conversion-optimized design patterns inspired by modern AI product launches.

### [Full Stack Architecture](./full-stack-architecture.md)

Comprehensive full-stack architecture document covering project vision, core value propositions, technology stack, and system design.

### [Implementation Plan - Waitlist](./IMPLEMENTATION-PLAN-WAITLIST.md)

Master implementation plan for the waitlist system with 3-week timeline, reference documents, and production-ready feature roadmap.

### [Implementation Summary](./implementation-summary.md)

Implementation summary report covering all completed phases, key achievements, production-ready infrastructure, and quality assurance metrics.

### [Market Research](./market-research.md)

Market research analysis for AI-powered test prep platform covering market size, opportunity assessment, pricing strategy, and LSAT market focus.

### [Marketing Copy - Landing Page](./marketing-copy-landing-page.md)

All finalized marketing copy, conversion strategy, and messaging for the waitlist landing page with tiered pricing and referral incentives.

### [ML Development Workflow](./ml-development-workflow.md)

Guide for ML development workflow using M1 MacBook for development and Windows RTX 3090 for training, with integrated Git-based sync.

### [Operational Cost Analysis](./operational-cost-analysis.md)

Comprehensive multi-agent cost assessment for 1000 users covering infrastructure, AI services, operational costs, and financial modeling.

### [Product Requirements Document (PRD)](./prd.md)

Main product requirements document (sharded version - see prd/ folder for complete documentation).

### [Project Brief](./project-brief.md)

Executive project brief covering project vision, mission statement, key success metrics, investment overview, and development timeline.

### [Setup - Google OAuth](./setup-google-oauth.md)

Step-by-step guide for setting up Google OAuth authentication for the waitlist landing page "Continue with Google" functionality.

---

## API

Documents within the `api/` directory:

### [API Overview](./api/README.md)

API documentation overview including endpoint specifications, data models, integration examples, authentication, and rate limiting.

---

## Architecture

Documents within the `architecture/` directory. This is a sharded documentation structure - see the index for navigation.

### [Architecture Index](./architecture/index.md)

Master index for all architecture documentation components including introduction, high-level overview, technology stack, and system design.

### [Accessibility Implementation Standards](./architecture/accessibility-implementation-standards.md)

Comprehensive accessibility standards and implementation guidelines ensuring WCAG compliance across the platform.

### [API Design and Integration Patterns](./architecture/api-design-and-integration-patterns.md)

RESTful API endpoint specifications, Context7-verified integration patterns, and authentication/security implementations.

### [CI/CD Pipeline and Automation](./architecture/ci-cd-pipeline-and-automation.md)

Continuous integration and deployment pipeline architecture with automated testing, builds, and deployment workflows.

### [Coding Standards and Development Practices](./architecture/coding-standards-and-development-practices.md)

Development standards, code style guidelines, best practices, and quality assurance requirements for the codebase.

### [Database Migration and Data Management](./architecture/database-migration-and-data-management.md)

Database schema evolution strategies, migration workflows, and data management best practices.

### [Deployment and Infrastructure](./architecture/deployment-and-infrastructure.md)

Infrastructure architecture, deployment strategies, hosting configuration, and production environment setup.

### [Dynamic Difficulty Architecture](./architecture/dynamic-difficulty-architecture.md)

FSRS-inspired adaptive learning system architecture for maintaining optimal challenge levels in question delivery.

### [Frontend Technical Architecture](./architecture/frontend-technical-architecture.md)

Frontend architecture including Next.js configuration, component patterns, state management, and performance optimization.

### [High-Level Architecture Overview](./architecture/high-level-architecture-overview.md)

Architecture philosophy, design principles, component diagrams, and system interaction patterns.

### [Introduction and Project Overview](./architecture/introduction-and-project-overview.md)

Project vision, core value propositions, target metrics, business goals, and market positioning.

### [Local GPU Training Setup](./architecture/local-gpu-training-setup.md)

Configuration guide for local GPU training environment setup for ML model development and training.

### [Recommendation Systems Analysis](./architecture/recommendation-systems-analysis.md)

Analysis of recommendation system approaches, algorithms, and implementation strategies for personalized learning.

### [Source Tree](./architecture/source-tree.md)

Project directory structure documentation explaining the organization and purpose of each major folder.

### [System Architecture and Database Design](./architecture/system-architecture-and-database-design.md)

Database schema, entity relationships, performance optimization strategies, and scalability considerations.

### [Technology Stack Details](./architecture/technology-stack-details.md)

Comprehensive technology stack documentation covering frontend, backend, external services, AI integrations, and DevOps toolchain.

### [Testing Strategy and Quality Assurance](./architecture/testing-strategy-and-quality-assurance.md)

Testing strategy, quality assurance processes, test coverage requirements, and automated testing frameworks.

---

## Cost Modeling

Documents within the `cost-modeling/` directory:

### [Cost Category Breakdown](./cost-modeling/2-cost-category-breakdown.md)

Detailed breakdown of infrastructure, technical, operational, and variable costs for 1000-user scale.

### [Scaling Sensitivities and Breakpoints](./cost-modeling/3-scaling-sensitivities-breakpoints.md)

Analysis of cost scaling patterns, sensitivity analysis, and breakpoint identification for growth planning.

### [Industry Benchmarks](./cost-modeling/4-industry-benchmarks.md)

Comparison of operational costs against industry benchmarks for similar SaaS platforms and educational technology.

### [Stress Test Assumptions](./cost-modeling/5-stress-test-assumptions.md)

Stress testing scenarios for cost modeling under various usage patterns and growth trajectories.

### [Optimization Opportunities](./cost-modeling/6-optimization-opportunities.md)

Identified cost optimization opportunities for reducing operational expenses while maintaining quality.

### [Challenge Assumptions](./cost-modeling/7-challenge-assumptions.md)

Critical analysis of cost modeling assumptions with recommendations for validation and adjustment.

### [Scenario Projections](./cost-modeling/8-scenario-projections.md)

Financial projections across multiple growth scenarios with best-case, base-case, and worst-case modeling.

---

## Database

Documents within the `database/` directory:

### [Migration Automation Guide](./database/migration-automation-guide.md)

Automated migration strategies from development to production environments including CI/CD pipeline setup.

### [Migration Workflow](./database/migration-workflow.md)

Step-by-step workflow for database schema migrations, testing, and production deployment processes.

---

## Deployment

Documents within the `deployment/` directory:

### [Production Checklist](./deployment/production-checklist.md)

Comprehensive pre-deployment and post-deployment checklist ensuring proper configuration, testing, and monitoring.

---

## Features

Documents within the `features/` directory:

### [Post-Epic 4 Enhancement Backlog](./features/post-epic-4-enhancement-backlog.md)

Strategic planning document tracking enhancement features intentionally deferred until after Epic 4 completion.

### [Push Notifications](./features/push-notifications.md)

Design and implementation specifications for push notification system across web and mobile platforms.

---

## Implementation

Documents within the `implementation/` directory:

### [MELLOWISE-010 Integration Guide](./implementation/mellowise-010-integration-guide.md)

Complete integration guide for Dynamic Difficulty Adjustment system with FSRS-inspired adaptive learning algorithm.

---

## Infrastructure

Documents within the `infrastructure/` directory:

### [Cross-Platform ML Connection Guide](./infrastructure/cross-platform-ml-connection-guide.md)

Setup guide for seamless ML development workflow with M1 MacBook development and Windows RTX 3090 GPU training.

### [Dependency Conflicts](./infrastructure/dependency-conflicts.md)

Documentation of known dependency conflicts, resolution strategies, and compatibility notes.

### [SSH Remote File Access Setup](./infrastructure/ssh-remote-file-access-setup.md)

Configuration guide for SSH-based remote file access and development workflow across multiple machines.

### [Twilio SMS Setup](./infrastructure/twilio-sms-setup.md)

Setup and configuration guide for Twilio SMS integration for notifications and verification workflows.

### [WSL2 GPU ML Setup](./infrastructure/wsl2-gpu-ml-setup.md)

Comprehensive setup guide for WSL2 with GPU support for machine learning development on Windows.

---

## Marketing (mktg)

Documents within the `mktg/` directory:

### [Comprehensive Marketing Strategy](./mktg/comprehensive-marketing-strategy.md)

Complete 12-month marketing roadmap including strategic positioning, channel tactics, and user acquisition strategy.

### [Cost Per User Analysis](./mktg/cost-per-user-analysis.md)

Detailed analysis of customer acquisition costs across different marketing channels and strategies.

### [Forever 50 Discount Sales Copy](./mktg/forever-50-discount-sales-copy.md)

Sales copy and messaging for the Forever 50% discount promotional campaign.

### [Lifetime Access Enhanced Features](./mktg/lifetime-access-enhanced-features.md)

Feature specifications and messaging for lifetime access tier with enhanced platform capabilities.

### [Lifetime Access Sales Copy](./mktg/lifetime-access-sales-copy.md)

Marketing copy and conversion strategy for lifetime access subscription tier.

### [Pricing Strategy](./mktg/pricing-strategy.md)

Comprehensive pricing strategy analysis covering tier structure, competitive positioning, and revenue optimization.

### [Value Proposition Messaging](./mktg/value-proposition-messaging.md)

Core value proposition messaging framework for consistent brand communication across channels.

---

## Product Requirements (prd)

Documents within the `prd/` directory. This is a sharded documentation structure - see the index for navigation.

### [PRD Index](./prd/index.md)

Master index for product requirements documentation organized into focused sections.

### [Checklist Results Report](./prd/checklist-results-report.md)

Product Owner validation checklist results with readiness assessment and approval status.

### [Epic 1: Foundation & Core Infrastructure](./prd/epic-1-foundation-core-infrastructure.md)

Complete Epic 1 requirements covering authentication, database, UI foundation, and deployment infrastructure.

### [Epic 2: AI-Powered Personalization Engine](./prd/epic-2-ai-powered-personalization-engine.md)

Epic 2 requirements for AI-powered personalization including learning style detection and adaptive content delivery.

### [Epic 3: Comprehensive LSAT Question System](./prd/epic-3-comprehensive-lsat-question-system.md)

Epic 3 requirements covering complete LSAT question system with spaced repetition and performance analytics.

### [Epic 4: Advanced Learning Features & Optimization](./prd/epic-4-advanced-learning-features-optimization.md)

Epic 4 requirements for advanced learning features including AI tutoring, community features, and mobile optimization.

### [Epic 5: Advanced Intelligence](./prd/epic-5-advanced-intelligence.md)

Future epic planning for advanced AI intelligence features and platform capabilities.

### [Epic List](./prd/epic-list.md)

Complete list of all epics with story point totals and development phase organization.

### [Goals and Background Context](./prd/goals-and-background-context.md)

Product goals, market context, competitive landscape, and business objectives.

### [Requirements](./prd/requirements.md)

Functional and non-functional requirements for the complete Mellowise platform.

### [Technical Assumptions](./prd/technical-assumptions.md)

Technical assumptions, constraints, and dependencies for architecture and implementation decisions.

### [User Interface Design Goals](./prd/user-interface-design-goals.md)

UI/UX design principles, user personas, and interface design objectives.

---

## Quality Assurance (qa)

Documents within the `qa/` directory:

### [Mellowise Test Architecture Executive Summary](./qa/mellowise-test-architecture-executive-summary.md)

Executive summary of comprehensive test architecture including risk profile, quality gates, and test strategy.

### [Refined User Stories - Secure](./qa/refined-user-stories-secure.md)

Refined user stories with security considerations and acceptance criteria.

### [Session Handoff (2025-09-09)](./qa/session-handoff-20250909.md)

QA session handoff documentation from September 9, 2025 test architecture session.

### [Story Test Validation Matrix](./qa/story-test-validation-matrix.md)

Traceability matrix mapping user stories to test cases and validation criteria.

---

## QA Assessments (qa/assessments)

Documents within the `qa/assessments/` directory:

### [Comprehensive Test Design (2025-09-09)](./qa/assessments/mellowise-comprehensive-test-design-20250909.md)

Comprehensive test design documentation covering test strategy, test cases, and quality metrics.

### [Critical Components Risk Assessment (2025-09-09)](./qa/assessments/mellowise-critical-components-risk-20250909.md)

Risk assessment of critical platform components with mitigation strategies and monitoring requirements.

### [Requirements Traceability Matrix (2025-09-09)](./qa/assessments/requirements-traceability-matrix-20250909.md)

Requirements traceability matrix linking requirements to implementation and test coverage.

---

## QA Gates (qa/gates)

Documents within the `qa/gates/` directory:

### [Quality Gates & Acceptance Criteria](./qa/gates/quality-gates-acceptance-criteria.md)

Quality gate definitions (L0-L3) with acceptance criteria for code review, integration, staging, and production.

---

## Templates

Documents within the `templates/` directory:

### [API Documentation Template](./templates/api-documentation.md)

Standardized template for documenting API endpoints with examples, error handling, and performance specifications.

### [Component Documentation Template](./templates/component-documentation.md)

Template for documenting React components with props, usage examples, and accessibility considerations.

---

## Summary

- **Total Documents**: 83
- **Root Documents**: 16
- **Subdirectories**: 12
  - api (1 document)
  - architecture (18 documents)
  - cost-modeling (7 documents)
  - database (2 documents)
  - deployment (1 document)
  - features (2 documents)
  - implementation (1 document)
  - infrastructure (5 documents)
  - mktg (7 documents)
  - prd (12 documents)
  - qa (8 documents)
  - templates (2 documents)

---

**Note**: This index is automatically maintained by the `/BMad:tasks:index-docs` task. All documentation files should be properly indexed with descriptions to ensure discoverability.
