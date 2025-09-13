# Technology Stack Details

## Frontend Stack
| Component | Technology | Version | Justification |
|-----------|------------|---------|---------------|
| **Framework** | Next.js | 14.x | App Router for modern SSR/SSG, excellent developer experience, Vercel optimization |
| **UI Library** | React | 18.x | Industry standard, excellent ecosystem, concurrent features for performance |
| **Language** | TypeScript | 5.x | Type safety, better developer experience, reduced runtime errors |
| **Styling** | Tailwind CSS | 3.x | Rapid development, consistent design system, excellent mobile-first approach |
| **Components** | Shadcn/ui | Latest | High-quality accessible components, customizable, TypeScript-native |
| **State Management** | Zustand | 4.x | Lightweight, TypeScript-friendly, minimal boilerplate for MVP needs |
| **Data Fetching** | TanStack Query | 5.x | Excellent caching, background updates, optimistic updates for seamless UX |
| **Forms** | React Hook Form | 7.x | Performant, minimal re-renders, excellent validation integration |
| **Authentication** | NextAuth.js | 4.x | Secure, multiple provider support, seamless Next.js integration |

## Backend Stack
| Component | Technology | Version | Justification |
|-----------|------------|---------|---------------|
| **API Framework** | FastAPI | 0.104.x | High performance, automatic OpenAPI docs, excellent async support |
| **Language** | Python | 3.11+ | AI/ML ecosystem, rapid development, extensive libraries |
| **Database** | PostgreSQL | 15.x | ACID compliance, JSON support, excellent performance for analytics |
| **ORM** | SQLAlchemy | 2.x | Mature, flexible, excellent async support with FastAPI |
| **Authentication** | Supabase Auth | Latest | Integrated with database, social logins, secure token management |
| **Caching** | Redis | 7.x | Session storage, rate limiting, performance optimization |
| **Task Queue** | Celery + Redis | 5.x | Background processing for AI generation and analytics |
| **Monitoring** | Sentry | Latest | Error tracking, performance monitoring, essential for production |

## AI & External Services
| Service | Provider | Model/Plan | Purpose |
|---------|----------|------------|---------|
| **Primary AI** | Anthropic Claude | Claude-3 Haiku | Cost-effective question generation, explanations |
| **Premium AI** | Anthropic Claude | Claude Sonnet 4 | Advanced personalization, complex reasoning |
| **Backup AI** | OpenAI | GPT-3.5-turbo | Failover for availability, cost optimization |
| **Premium Backup** | OpenAI | GPT-4 | High-quality backup for premium features |
| **Payments** | Stripe | Standard | Secure payment processing, subscription management |
| **Database** | Supabase | Pro Plan | Managed PostgreSQL, auth, real-time, storage |
| **SMS** | Twilio | Pay-per-use | Reminder notifications, study streaks |
| **Hosting Frontend** | Vercel | Hobby → Pro | Next.js optimization, edge functions, CDN |
| **Hosting Backend** | Railway | Starter → Developer | Docker deployment, database, monitoring |

## Development & DevOps Tools
| Category | Tool | Purpose |
|----------|------|---------|
| **Version Control** | Git + GitHub | Code management, CI/CD |
| **Package Management** | npm/pnpm | Frontend dependencies |
| **Package Management** | Poetry | Python dependency management |
| **Code Quality** | ESLint + Prettier | Code formatting and linting |
| **Type Checking** | TypeScript + mypy | Static type checking |
| **Testing** | Jest + Pytest | Unit and integration testing |
| **Documentation** | Storybook | Component documentation |
| **Monitoring** | Sentry + Vercel Analytics | Error tracking and performance |