# Technical Assumptions

## Repository Structure: Monorepo

Single repository structure containing both frontend and backend code to simplify development workflow, reduce complexity, and enable easier coordination between components during rapid MVP development. This approach minimizes overhead while maintaining clear separation of concerns through folder structure.

## Service Architecture

**Monolithic Web Application with Serverless Functions**: Core application deployed as a single unit with specific AI and processing-intensive tasks handled by serverless functions. This hybrid approach balances simplicity (monolith benefits) with scalability (serverless for expensive operations like AI question generation). Rationale: Reduces operational complexity while controlling costs through serverless auto-scaling for AI workloads.

## Testing Requirements

**Unit + Integration Testing**: Comprehensive unit testing for business logic and integration testing for API endpoints and database interactions. Given the bootstrap timeline, focus on critical path testing (authentication, payment processing, AI algorithms, progress tracking) rather than exhaustive coverage. Manual testing protocols for user workflows complement automated testing.

## Additional Technical Assumptions and Requests

**Frontend Technology Stack:**
- **Next.js 14** with React 18 for optimal mobile performance and SEO
- **Tailwind CSS** for rapid, consistent styling without custom CSS overhead
- **TypeScript** for type safety and better developer experience
- **Zustand** for lightweight state management over Redux complexity

**Backend Technology Stack:**
- **Supabase** for authentication, database (PostgreSQL), and real-time features - leverages generous free tier
- **FastAPI** (Python) for API development - rapid development with automatic API documentation
- **Anthropic Claude/OpenAI GPT APIs** for AI tutoring and question generation
- **Stripe** for payment processing with webhook handling

**Database Design:**
- **PostgreSQL** (via Supabase) for relational data integrity
- **Structured JSON** for flexible user progress and analytics storage
- **Indexed performance tracking** for efficient analytics queries

**Deployment and Infrastructure:**
- **Vercel** for frontend hosting (free tier, optimal Next.js integration)
- **Railway/Render** for backend API hosting (free tier with scaling options)
- **Cloudinary** for asset storage (PDFs, images) - free tier sufficient for MVP
- **GitHub Actions** for CI/CD pipeline automation

**AI Cost Optimization Strategy:**
- **Intelligent Caching**: Redis (Upstash free tier) for caching common AI responses
- **Response Templating**: Pre-generate common explanations to reduce API calls
- **Progressive Throttling**: Rate limiting based on budget thresholds
- **Model Selection**: Claude Haiku for simple tasks, GPT-3.5-turbo for medium complexity

**Security and Compliance:**
- **FERPA-compliant data handling** with encrypted storage and transmission
- **JWT-based authentication** with secure session management
- **Environment-based configuration** to protect API keys and sensitive data
- **Regular automated security scanning** integrated into CI/CD pipeline

**Performance Optimization:**
- **Code splitting** and lazy loading for optimal mobile performance
- **Progressive Web App** features for app-like experience
- **CDN optimization** for global content delivery
- **Database query optimization** with proper indexing strategy

**Development Workflow:**
- **Git-based version control** with feature branching strategy
- **Automated testing** on pull requests
- **Staging environment** for pre-production validation
- **Error monitoring** with Sentry (free tier) for production debugging