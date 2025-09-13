# High-Level Architecture Overview

## Architecture Philosophy
Mellowise employs a **hybrid monolithic + serverless functions** approach, optimized for rapid MVP development within the $150-200 budget constraint while maintaining scalability for future growth.

## Component Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Next.js 14 App Router Frontend                                    │
│  ├─ React 18 + TypeScript                                          │
│  ├─ Tailwind CSS + Shadcn/ui                                       │
│  ├─ Zustand State Management                                        │
│  └─ TanStack Query (Data Fetching)                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTPS/WSS
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     API GATEWAY LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│  Next.js API Routes + FastAPI Backend                              │
│  ├─ Authentication & Authorization                                  │
│  ├─ Rate Limiting & Request Validation                             │
│  ├─ API Documentation (OpenAPI)                                    │
│  └─ Error Handling & Logging                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                            │
├─────────────────────────────────────────────────────────────────────┤
│  FastAPI Python Services                                           │
│  ├─ AI Question Generation Engine                                  │
│  ├─ Survival Mode Game Logic                                       │
│  ├─ Spaced Repetition Algorithm                                    │
│  ├─ Performance Analytics Engine                                   │
│  └─ AI Tutoring & Explanation Generator                           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DATA PERSISTENCE LAYER                         │
├─────────────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL Database                                      │
│  ├─ User Profiles & Authentication                                 │
│  ├─ Question Bank & Performance Data                               │
│  ├─ Game Sessions & Progress Tracking                             │
│  └─ Analytics & Learning Pattern Storage                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                           │
├─────────────────────────────────────────────────────────────────────┤
│  Third-Party Services                                               │
│  ├─ Anthropic Claude APIs (AI Generation)                         │
│  ├─ OpenAI GPT APIs (Backup AI)                                   │
│  ├─ Stripe (Payment Processing)                                    │
│  ├─ Twilio (SMS Notifications)                                     │
│  └─ Supabase Realtime (Live Updates)                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   MONITORING & OBSERVABILITY                      │
├─────────────────────────────────────────────────────────────────────┤
│  Health Monitoring                                                 │
│  ├─ Application Health Endpoints (/api/health/status)             │
│  ├─ Database Health Checks (/api/health/ready)                    │
│  ├─ External Service Health Monitoring                            │
│  └─ Automated Alerting (Performance & Availability)               │
│                                                                    │
│  Performance Monitoring                                            │
│  ├─ Core Web Vitals Tracking (LCP: 1.2s, FID: 30ms, CLS: 0.03)  │
│  ├─ API Response Time Monitoring (< 200ms target)                 │
│  ├─ Database Query Performance (< 100ms target)                   │
│  └─ Real User Monitoring (RUM) with Web Vitals API                │
│                                                                    │
│  Error Tracking & Logging                                         │
│  ├─ Structured Error Logging with Context                         │
│  ├─ User-Friendly Error Messages (Multilingual Support)           │
│  ├─ Error Rate Monitoring (< 1% target)                          │
│  └─ Automatic Error Recovery & Fallback Mechanisms               │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Overview
1. **User Interaction**: React components capture user inputs and interactions
2. **State Management**: Zustand manages local state with TanStack Query handling server state
3. **API Communication**: RESTful APIs with real-time WebSocket connections for live features
4. **Business Logic**: FastAPI processes requests, generates AI content, and manages game logic
5. **Data Persistence**: Supabase handles all data operations with real-time subscriptions
6. **External Processing**: AI services generate content while payment systems handle subscriptions