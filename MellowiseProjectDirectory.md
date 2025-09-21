# Mellowise Project Directory Structure

## 📁 **Project Overview**
**Mellowise** - Universal AI-powered exam prep platform with gamified learning experience
- **Platform**: Next.js 15.5.2 with TypeScript, Tailwind CSS
- **Architecture**: Multi-tenant, FERPA-compliant educational platform
- **Database**: Supabase PostgreSQL with multi-tenant isolation
- **Status**: Epic 1 Complete (47/47), Epic 2 85.5% Complete (47/55)

---

## 🗂️ **Root Directory Structure**

```
Mellowise_app/
├── 📋 CLAUDE.md                      # Development context & workflow protocols
├── 📋 README.md                      # Project overview and setup instructions
├── 📋 LICENSE                        # MIT License
├── 📋 MellowiseProjectDirectory.md   # This file - project structure guide
│
├── 🔧 Configuration Files
│   ├── package.json                  # Dependencies and npm scripts
│   ├── package-lock.json            # Locked dependency versions
│   ├── tsconfig.json                # TypeScript configuration
│   ├── next.config.ts               # Next.js configuration
│   ├── next-env.d.ts                # Next.js TypeScript declarations
│   ├── tailwind.config.ts           # Tailwind CSS configuration
│   ├── postcss.config.mjs           # PostCSS configuration
│   ├── eslint.config.mjs            # ESLint configuration
│   ├── jest.config.js               # Jest testing configuration
│   ├── jest.setup.js                # Jest setup and global mocks
│   ├── playwright.config.ts         # Playwright e2e testing config
│   ├── vercel.json                  # Vercel deployment configuration
│   └── middleware.ts                # Next.js middleware for auth/routing
│
├── 🔒 Environment & Security
│   ├── .env.local                   # Local environment variables (git-ignored)
│   ├── .gitignore                   # Git ignore patterns
│   ├── instrumentation.ts           # Next.js instrumentation
│   ├── sentry.client.config.ts     # Sentry error tracking (client)
│   ├── sentry.server.config.ts     # Sentry error tracking (server)
│   └── sentry.edge.config.ts       # Sentry error tracking (edge)
│
└── 📂 Major Directory Structure (detailed below)
```

---

## 🎯 **Core Application Directories**

### **📱 `/src` - Main Application Source**
```
src/
├── 🏠 app/                          # Next.js App Router pages and API routes
├── 🧩 components/                   # React components organized by feature
├── 📚 lib/                          # Core business logic and utilities
├── 🔧 hooks/                        # Custom React hooks
├── 📝 types/                        # TypeScript type definitions
├── ⚙️ constants/                    # Application constants
├── 🛠️ utils/                        # Pure utility functions
└── 🧪 __tests__/                    # Unit and integration tests
```

### **🗄️ `/supabase` - Database & Schema**
```
supabase/
├── migrations/                      # Database migration files
│   ├── 001_initial_schema.sql      # Initial multi-tenant schema
│   ├── 002_question_system.sql     # Question and exam system
│   ├── 003_analytics_system.sql    # Analytics and performance tracking
│   ├── 004_ai_features.sql         # AI personalization features
│   └── 005_goal_tracking.sql       # Goal setting and progress tracking
└── config.toml                     # Supabase configuration
```

### **📋 `/kanban` - Project Management**
```
kanban/
├── mellowise_dev/                   # Main project kanban board
│   ├── backlog/                     # Cards awaiting implementation
│   ├── in_progress/                 # Currently active cards
│   ├── review/                      # Completed cards under review
│   └── done/                        # Fully completed cards
├── workflow-check.sh               # Card status validation script
├── agent-team-validator.sh         # Agent team assignment validator
└── WORKFLOW_PROTOCOL.md            # Detailed workflow documentation
```

---

## 🏗️ **Application Architecture Deep Dive**

### **🏠 `/src/app` - Next.js App Router**
```
app/
├── 🌐 Root Routes
│   ├── layout.tsx                   # Root layout with providers
│   ├── page.tsx                     # Homepage
│   ├── globals.css                  # Global styles
│   └── loading.tsx                  # Global loading component
│
├── 🔐 Authentication
│   └── auth/
│       ├── callback/page.tsx        # Supabase auth callback
│       └── layout.tsx               # Auth layout
│
├── 📊 User Dashboard
│   └── dashboard/
│       ├── page.tsx                 # Main dashboard
│       ├── layout.tsx               # Dashboard layout
│       ├── analytics/page.tsx       # Performance analytics
│       ├── learning-style/page.tsx  # Learning style assessment
│       └── practice/page.tsx        # Practice mode
│
├── 🎯 Goals & Planning
│   └── goals/
│       ├── page.tsx                 # Goal setting interface
│       └── layout.tsx               # Goals layout
│
├── 💳 Payment System
│   ├── pricing/page.tsx             # Pricing plans page
│   └── payment/
│       ├── page.tsx                 # Payment processing
│       └── success/page.tsx         # Payment success
│
├── 🎮 Demo Areas
│   ├── demo-dashboard/page.tsx      # Demo dashboard
│   ├── demo-questions/page.tsx      # Demo questions
│   └── demo-survival/page.tsx       # Demo survival mode
│
├── 👨‍💼 Admin Interface
│   └── admin/
│       └── question-generation/
│           └── page.tsx             # AI question generation dashboard
│
└── 🔌 API Routes
    └── api/                         # Backend API endpoints (detailed below)
```

### **🔌 `/src/app/api` - Backend API**
```
api/
├── 📊 Analytics System
│   └── analytics/
│       ├── dashboard/route.ts       # Dashboard data aggregation
│       ├── export/route.ts          # Data export functionality
│       ├── insights/route.ts        # Performance insights
│       ├── session/route.ts         # Session analytics
│       └── streaks/route.ts         # Streak tracking
│
├── 🧠 AI & Learning Features
│   ├── learning-style/
│   │   ├── diagnostic/route.ts      # Learning style diagnostic quiz
│   │   └── profile/route.ts         # Learning profile management
│   ├── practice/
│   │   ├── difficulty/route.ts      # Dynamic difficulty adjustment
│   │   └── sessions/
│   │       ├── route.ts             # Practice session management
│   │       └── start/route.ts       # Session initialization
│   ├── recommendations/route.ts     # Content recommendations
│   └── study-plans/route.ts         # Personalized study plans
│
├── 🎯 Goal Management
│   └── goals/
│       ├── create/route.ts          # Goal creation
│       └── current/route.ts         # Current goal status
│
├── 💳 Payment Processing
│   └── stripe/
│       ├── checkout/route.ts        # Stripe checkout sessions
│       ├── portal/route.ts          # Customer portal
│       └── webhook/route.ts         # Stripe webhooks
│
└── 👨‍💼 Admin Features
    └── admin/
        └── questions/
            ├── generate/route.ts    # AI question generation
            ├── import/route.ts      # Question import
            └── validate/route.ts    # Question validation
```

---

## 🧩 **Component Architecture**

### **🧩 `/src/components` - React Components**
```
components/
├── 🔐 auth/                         # Authentication components
│   ├── AuthButton.tsx              # Login/logout button
│   ├── AuthForm.tsx                # Login/signup forms
│   └── ProtectedRoute.tsx          # Route protection wrapper
│
├── 📊 analytics/                    # Analytics & insights components
│   ├── PerformanceChart.tsx        # Performance visualization
│   ├── InsightCard.tsx             # Individual insight display
│   ├── StreakDisplay.tsx           # Streak visualization
│   └── ExportButton.tsx            # Data export functionality
│
├── 🧠 learning-style/               # Learning style assessment
│   ├── DiagnosticQuiz.tsx          # Assessment quiz component
│   ├── StyleProfile.tsx            # Learning style display
│   ├── RecommendationCard.tsx      # Style-based recommendations
│   └── ProgressIndicator.tsx       # Assessment progress
│
├── 🎯 goals/                        # Goal setting and tracking
│   ├── GoalCreator.tsx             # Goal creation interface
│   ├── GoalCard.tsx                # Individual goal display
│   ├── ProgressTracker.tsx         # Goal progress visualization
│   └── MilestoneIndicator.tsx      # Milestone tracking
│
├── 🎮 practice/                     # Practice mode components
│   ├── QuestionCard.tsx            # Question display component
│   ├── AnswerChoice.tsx            # Answer option component
│   ├── DifficultySelector.tsx      # Difficulty adjustment
│   ├── SessionTimer.tsx            # Practice session timer
│   └── ResultsPanel.tsx            # Session results display
│
├── 🎲 survival-mode/                # Survival mode game components
│   ├── GameHeader.tsx              # Game status display
│   ├── PowerUpPanel.tsx            # Power-up management
│   ├── QuestionDisplay.tsx         # Game question display
│   ├── ScoreBoard.tsx              # Score and streak display
│   └── GameOverModal.tsx           # Game end modal
│
├── ❓ questions/                    # Question system components
│   ├── QuestionRenderer.tsx        # Generic question display
│   ├── ExplanationPanel.tsx        # Answer explanations
│   ├── QuestionStats.tsx           # Question statistics
│   └── QuestionFilter.tsx          # Question filtering
│
├── 🔮 recommendations/              # Content recommendation components
│   ├── RecommendationList.tsx      # Recommended content list
│   ├── StudyPlanCard.tsx           # Study plan display
│   ├── ContentSuggestion.tsx       # Individual suggestions
│   └── AdaptiveRecommendations.tsx # AI-powered recommendations
│
├── 💳 payments/                     # Payment system components
│   ├── PricingCard.tsx             # Pricing plan display
│   ├── CheckoutButton.tsx          # Stripe checkout integration
│   ├── PaymentStatus.tsx           # Payment status display
│   └── SubscriptionManager.tsx     # Subscription management
│
├── 👨‍💼 admin/                        # Admin interface components
│   ├── QuestionGenerationDashboard.tsx # AI question generation interface
│   ├── GenerationControls.tsx      # Generation parameter controls
│   ├── QualityReview.tsx           # Question quality review
│   └── AnalyticsDashboard.tsx      # Admin analytics
│
└── 🎨 ui/                           # Reusable UI components
    ├── button.tsx                   # Button component
    ├── input.tsx                    # Input component
    ├── card.tsx                     # Card component
    ├── modal.tsx                    # Modal component
    ├── toast.tsx                    # Toast notifications
    ├── progress.tsx                 # Progress bar
    ├── tabs.tsx                     # Tab component
    ├── select.tsx                   # Select dropdown
    ├── slider.tsx                   # Slider component
    ├── radio-group.tsx             # Radio group component
    ├── scroll-area.tsx             # Scroll area component
    ├── alert.tsx                    # Alert component
    ├── separator.tsx               # Visual separator
    ├── label.tsx                    # Form label
    └── textarea.tsx                 # Text area component
```

---

## 📚 **Business Logic Layer**

### **📚 `/src/lib` - Core Libraries**
```
lib/
├── 🔐 auth/                         # Authentication logic
│   ├── config.ts                   # Auth configuration
│   ├── middleware.ts               # Auth middleware
│   └── utils.ts                     # Auth utilities
│
├── 🗄️ database/                     # Database operations
│   ├── client.ts                   # Database client setup
│   ├── queries.ts                  # Common database queries
│   ├── migrations.ts               # Migration utilities
│   └── types.ts                     # Database type definitions
│
├── 🏢 tenant/                       # Multi-tenant functionality
│   ├── isolation.ts                # Tenant data isolation
│   ├── context.ts                  # Tenant context management
│   └── utils.ts                     # Tenant utilities
│
├── 🔒 ferpa/                        # FERPA compliance
│   ├── encryption.ts               # Data encryption
│   ├── audit.ts                    # Audit logging
│   ├── retention.ts                # Data retention policies
│   └── compliance.ts               # Compliance validation
│
├── 📝 exam/                         # Exam system logic
│   ├── types.ts                    # Exam type definitions
│   ├── scoring.ts                  # Scoring algorithms
│   ├── validation.ts               # Exam validation
│   └── config.ts                   # Exam configuration
│
├── ❓ questions/                    # Question management
│   ├── loader.ts                   # Question loading logic
│   ├── formatter.ts                # Question formatting
│   ├── validation.ts               # Question validation
│   └── categories.ts               # Question categorization
│
├── 🧠 learning-style/               # Learning style assessment
│   ├── diagnostic.ts               # Diagnostic algorithm
│   ├── classification.ts           # Style classification
│   ├── recommendations.ts          # Style-based recommendations
│   └── types.ts                     # Learning style types
│
├── 🎯 practice/                     # Practice mode logic
│   ├── session.ts                  # Session management
│   ├── difficulty.ts               # Difficulty adjustment (FSRS algorithm)
│   ├── tracking.ts                 # Progress tracking
│   └── adaptive.ts                 # Adaptive learning logic
│
├── 🔮 recommendations/              # Recommendation engine
│   ├── content.ts                  # Content recommendations
│   ├── study-plans.ts              # Study plan generation
│   ├── personalization.ts          # Personalization logic
│   └── ai-integration.ts           # AI model integration
│
├── 🤖 question-generation/          # AI question generation
│   ├── claude-service.ts           # Claude AI integration
│   ├── templates.ts                # Question templates
│   ├── quality-assurance.ts        # Quality validation
│   ├── difficulty-integration.ts   # Difficulty calibration
│   └── types.ts                     # Generation type definitions
│
├── 📊 insights/                     # Performance insights
│   ├── patterns.ts                 # Pattern recognition
│   ├── analytics.ts                # Analytics processing
│   ├── reporting.ts                # Report generation
│   └── recommendations.ts          # Insight-based recommendations
│
└── 🔧 supabase/                     # Supabase integration
    ├── client.ts                   # Supabase client configuration
    ├── auth.ts                     # Supabase auth helpers
    ├── database.ts                 # Database helpers
    └── storage.ts                   # File storage helpers
```

---

## 🧪 **Testing Infrastructure**

### **🧪 `/src/__tests__` - Test Suites**
```
__tests__/
├── learning-style/                  # Learning style feature tests
│   ├── diagnostic.test.ts          # Diagnostic algorithm tests
│   ├── classification.test.ts      # Classification logic tests
│   └── integration.test.ts         # Integration tests
│
├── practice/                       # Practice mode tests
│   ├── difficulty.test.ts          # Difficulty adjustment tests
│   ├── session.test.ts             # Session management tests
│   └── adaptive.test.ts            # Adaptive learning tests
│
└── question-generation/             # AI question generation tests
    ├── claude-service.test.ts      # Claude AI integration tests
    ├── quality-assurance.test.ts   # Quality validation tests
    └── system-integration.test.ts   # System integration tests
```

### **🧪 `/tests` - Additional Testing**
```
tests/
├── __mocks__/                      # Test mocks
│   └── fileMock.js                 # File mock for testing
└── utils/                          # Test utilities
    └── accessibility.ts            # Accessibility testing helpers
```

---

## 🛠️ **Development & Deployment**

### **🔧 Configuration & Tools**
```
├── .bmad-core/                     # BMad agent system
│   ├── agents/                     # Specialist agent definitions
│   ├── tasks/                      # Automated task definitions
│   ├── templates/                  # Document templates
│   ├── workflows/                  # Workflow definitions
│   └── data/                       # Agent knowledge base
│
├── .claude/                        # Claude Code IDE integration
│   ├── settings.local.json         # Claude IDE settings
│   └── commands/                   # Custom Claude commands
│
├── .github/                        # GitHub configuration
│   └── workflows/                  # GitHub Actions workflows
│
├── .husky/                         # Git hooks
│   └── pre-commit                  # Pre-commit hook
│
├── .vscode/                        # VS Code configuration
│   └── settings.json               # IDE settings
│
└── coverage/                       # Test coverage reports
    ├── lcov-report/                # HTML coverage reports
    └── coverage.json               # Coverage data
```

### **🗂️ Documentation**
```
docs/
├── 📋 prd/                         # Product Requirements Documents
│   ├── epic-1-foundation.md        # Epic 1 requirements
│   ├── epic-2-ai-personalization.md # Epic 2 requirements
│   └── overall-platform-vision.md  # Platform vision
│
├── 🏗️ architecture/                # Technical architecture docs
│   ├── database-design.md          # Database architecture
│   ├── multi-tenant-architecture.md # Multi-tenant design
│   ├── ai-integration.md           # AI system architecture
│   └── security-compliance.md      # Security & FERPA compliance
│
├── 🔌 api/                         # API documentation
│   ├── authentication.md           # Auth API docs
│   ├── analytics.md                # Analytics API docs
│   └── practice-mode.md            # Practice mode API docs
│
├── 🚀 deployment/                  # Deployment documentation
│   ├── vercel-setup.md             # Vercel deployment
│   ├── supabase-setup.md           # Database setup
│   └── environment-config.md       # Environment configuration
│
└── 🧪 qa/                          # Quality assurance
    ├── assessments/                # QA assessments
    └── gates/                      # Quality gates
```

### **🤖 Machine Learning Pipeline**
```
ml/
├── 📊 data/                        # ML data management
│   ├── raw/                       # Raw data files
│   └── processed/                 # Processed datasets
│
├── 🧪 experiments/                 # ML experiments
├── 📓 notebooks/                   # Jupyter notebooks
├── 🏋️ training/                    # Model training scripts
├── 🎯 models/                      # Trained model artifacts
├── 🚀 serving/                     # Model serving infrastructure
├── ⚙️ configs/                     # ML configuration files
├── 📝 logs/                        # Training and inference logs
├── 🧪 tests/                       # ML testing
└── 📜 scripts/                     # Utility scripts
```

---

## 📦 **Archive Directories**

### **📚 Documentation_Archives**
- `CLAUDE_Archive_20250918_151144.md` - Previous CLAUDE.md version
- `DEVELOPER_HANDOFF.md` - Developer handoff documentation

### **💾 Data_Archives**
- Database migration SQL files (batch-1 through batch-6)
- Question import and validation scripts
- Data verification and diagnostic queries

### **📜 Script_Archives**
- Python migration scripts (`migrate-questions-to-db.py`, etc.)
- Shell scripts for database operations
- Migration utilities and generators

---

## 🎯 **Current Development Status**

### **✅ Epic 1: Foundation Complete (47/47 story points)**
- Multi-tenant architecture operational
- FERPA-compliant data encryption
- Stripe payment integration
- Basic analytics and performance tracking

### **🔄 Epic 2: AI Personalization 85.5% Complete (47/55 story points)**
**Completed Features:**
- AI Learning Style Assessment (MELLOWISE-009)
- Dynamic Difficulty Adjustment (MELLOWISE-010)
- Personalized Study Plans (MELLOWISE-011)
- Session Handoff System (MELLOWISE-011A)
- Smart Performance Insights (MELLOWISE-012)
- AI-Powered Question Generation (MELLOWISE-013)
- Goal Setting & Progress Tracking (MELLOWISE-016)

**Remaining Cards:**
- MELLOWISE-014: Enhanced Performance Analytics (5 pts)
- MELLOWISE-015: AI-Powered Study Recommendations (3 pts)

### **⏳ Epic 3 & 4: Planned**
- Advanced learning features
- Enterprise and institutional tools

---

**Generated**: January 18, 2025
**Platform Status**: Revenue-generating, multi-tenant, FERPA-compliant educational platform with AI personalization
**Next Phase**: Complete Epic 2 (8 story points remaining)