# Source Tree Structure

## Project Root Structure

```
mellowise-app/
├── .bmad-core/                 # BMad agent system core files
├── .github/                    # GitHub workflows and configurations
├── .husky/                     # Git hooks configuration
├── docs/                       # Project documentation
│   ├── api/                    # API documentation
│   ├── architecture/           # Technical architecture docs
│   ├── database/               # Database design and migration docs
│   ├── deployment/             # Deployment configuration docs
│   ├── infrastructure/         # Infrastructure setup docs
│   ├── prd/                    # Product requirements (sharded)
│   ├── qa/                     # QA testing documentation
│   └── templates/              # Document templates
├── kanban/                     # Local kanban project management
├── pages/                      # Next.js pages (legacy, migrating to app/)
├── public/                     # Static assets (images, icons, etc.)
├── src/                        # Source code
│   ├── app/                    # Next.js 13+ app directory
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # Dashboard pages
│   │   └── global-error.tsx    # Global error boundary
│   ├── components/             # React components
│   │   ├── questions/          # Question-related components
│   │   └── survival-mode/      # Survival mode game components
│   ├── constants/              # Application constants
│   ├── lib/                    # Utility libraries and configurations
│   └── utils/                  # Utility functions
├── supabase/                   # Supabase configuration and migrations
└── tests/                      # Test files
```

## Key Source Directories

### `/src/app/` - Next.js App Router
- Modern Next.js 13+ app directory structure
- Route-based organization with page.tsx, layout.tsx, loading.tsx patterns
- Co-located route groups and nested layouts

### `/src/components/` - React Components
- Organized by feature/domain (questions, survival-mode, etc.)
- Each component directory contains related components and sub-components
- Follows atomic design principles where applicable

### `/src/lib/` - Shared Libraries
- Database configurations
- Authentication setup
- External service integrations (Supabase, Cloudinary, etc.)
- Shared utility functions and helpers

### `/src/utils/` - Utility Functions
- Pure utility functions
- Type definitions and interfaces
- Helper functions for data transformation

### `/supabase/` - Database Layer
- Database migrations
- Schema definitions
- Seed data scripts
- Supabase configuration

## File Naming Conventions

### Components
- PascalCase for component files: `QuestionCard.tsx`
- kebab-case for directories: `survival-mode/`
- Co-located types, styles, and tests

### Pages (App Router)
- `page.tsx` - Route component
- `layout.tsx` - Layout wrapper
- `loading.tsx` - Loading UI
- `error.tsx` - Error boundary
- `not-found.tsx` - 404 page

### Utilities and Libraries
- camelCase for utility files: `questionService.ts`
- kebab-case for configuration files: `auth-config.ts`
- PascalCase for type definition files: `SurvivalMode.ts`

## Import Patterns

### Absolute Imports
```typescript
import { Component } from '@/components/ui/Component'
import { utility } from '@/lib/utilities'
import type { GameState } from '@/types/survival-mode'
```

### Relative Imports
- Used only within the same feature directory
- Prefer absolute imports for cross-feature dependencies

## Asset Organization

### `/public/`
- Static assets accessible via URL
- Images, icons, fonts, manifests
- Organized by type: `/public/images/`, `/public/icons/`

### Component Assets
- Co-located with components when component-specific
- Shared assets in `/public/` with descriptive naming