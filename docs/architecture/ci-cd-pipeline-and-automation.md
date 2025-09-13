# CI/CD Pipeline and Automation

## Context7-Verified CI/CD Implementation

Based on Context7 research of GitHub Actions, Vercel, and Railway deployment patterns, Mellowise's CI/CD pipeline provides automated testing, building, and deployment with comprehensive quality gates.

### GitHub Actions Workflow Configuration
```yaml
# .github/workflows/ci.yml - Context7-verified CI/CD pipeline
name: Mellowise CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: 18
  PYTHON_VERSION: '3.11'

jobs:
  # Frontend testing and building
  frontend-test:
    name: Frontend Tests & Build
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for Vercel deployments
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Type checking
        run: npm run type-check
        
      - name: Lint code
        run: npm run lint
        
      - name: Run unit tests with coverage
        run: npm run test:coverage
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
          
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: |
            coverage/
            playwright-report/
            test-results/
          retention-days: 7
          
      - name: Build application
        run: npm run build
        
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: frontend-build
          path: .next/
          retention-days: 1

  # Backend testing
  backend-test:
    name: Backend Tests
    runs-on: ubuntu-latest
    timeout-minutes: 20
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: studybuddy_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
          
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
          
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
          cache: 'pip'
          
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
          
      - name: Run linting
        run: |
          ruff check .
          mypy .
          
      - name: Run unit tests with coverage
        run: pytest --cov=app --cov-report=xml --cov-report=term-missing tests/
        env:
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/studybuddy_test
          REDIS_URL: redis://localhost:6379/0
          TESTING: true
          
      - name: Upload coverage reports
        uses: actions/upload-artifact@v4
        with:
          name: backend-coverage
          path: coverage.xml
          retention-days: 7

  # Security scanning
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          ignore-unfixed: true
          format: 'sarif'
          output: 'trivy-results.sarif'
          
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

  # Deploy to Vercel (Frontend)
  deploy-frontend:
    name: Deploy Frontend
    needs: [frontend-test, backend-test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-args: '--prod'
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  # Deploy to Railway (Backend)
  deploy-backend:
    name: Deploy Backend
    needs: [frontend-test, backend-test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v1.2.1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: ${{ secrets.RAILWAY_SERVICE }}
          
  # Post-deployment verification
  post-deploy:
    name: Post-Deployment Tests
    needs: [deploy-frontend, deploy-backend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run production smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: https://studybuddy.vercel.app
          API_URL: https://studybuddy-api.up.railway.app
          
      - name: Notify Slack on deployment success
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: '✅ Mellowise deployed successfully to production'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          
      - name: Notify Slack on deployment failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: '❌ Mellowise deployment failed - please check logs'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Branch Protection and Quality Gates
```yaml
# GitHub branch protection settings
main_branch_protection:
  required_status_checks:
    strict: true
    contexts:
      - "Frontend Tests & Build"
      - "Backend Tests"
      - "Security Scan"
  enforce_admins: false
  required_pull_request_reviews:
    required_approving_review_count: 1
    dismiss_stale_reviews: true
    require_code_owner_reviews: true
  restrictions: null
  allow_force_pushes: false
  allow_deletions: false
```