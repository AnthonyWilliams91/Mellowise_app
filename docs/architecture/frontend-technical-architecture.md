# Frontend Technical Architecture

## Component Architecture Strategy

Based on Context7 research, Mellowise's frontend architecture leverages Next.js 14 App Router with React 18's concurrent features for optimal performance and user experience.

### Architecture Patterns
```typescript
// Context7-verified Next.js App Router structure
app/
├── (auth)/                    # Route groups for authentication
│   ├── login/
│   │   └── page.tsx          # Login page with server-side validation
│   └── register/
│       └── page.tsx          # Registration with social auth
├── (dashboard)/              # Protected route group
│   ├── layout.tsx           # Dashboard layout with navigation
│   ├── page.tsx             # Dashboard home with analytics
│   ├── survival/            # Survival mode game
│   │   ├── page.tsx        # Game lobby and session management
│   │   └── [sessionId]/    # Dynamic game session routes
│   │       └── page.tsx
│   ├── practice/           # Practice mode
│   │   └── page.tsx
│   └── analytics/          # Performance analytics
│       └── page.tsx
├── api/                    # API routes for client-side operations
│   ├── auth/
│   └── proxy/             # Proxy to FastAPI backend
├── globals.css            # Tailwind CSS imports
├── layout.tsx            # Root layout with providers
└── loading.tsx           # Global loading UI
```

### Component Hierarchy & State Management
```typescript
// Context7-verified Zustand store architecture
interface AppState {
  // Authentication state
  user: User | null
  isAuthenticated: boolean
  
  // Game state management
  currentGameSession: GameSession | null
  gameHistory: GameSession[]
  
  // Learning state
  userProgress: UserProgress
  reviewQueue: Question[]
  
  // UI state
  sidebarCollapsed: boolean
  currentTheme: 'light' | 'dark'
}

// Zustand slices pattern for modularity
const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        
        login: async (credentials) => {
          const user = await authService.login(credentials)
          set({ user, isAuthenticated: true })
        },
        
        logout: () => {
          set({ user: null, isAuthenticated: false })
          // Clear persisted state
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
      }
    )
  )
)

const useGameStore = create<GameState>()((set, get) => ({
  currentSession: null,
  lives: 3,
  score: 0,
  questionQueue: [],
  
  startSession: async () => {
    const session = await gameService.startSession()
    set({ 
      currentSession: session, 
      lives: 3, 
      score: 0,
      questionQueue: session.questions 
    })
  },
  
  answerQuestion: (questionId: string, answer: string) => {
    const { currentSession, lives, score } = get()
    const isCorrect = gameService.checkAnswer(questionId, answer)
    
    set({
      lives: isCorrect ? lives : lives - 1,
      score: isCorrect ? score + 10 : score,
      questionQueue: get().questionQueue.slice(1)
    })
    
    if (lives <= 1 && !isCorrect) {
      gameService.endSession(currentSession.id)
      set({ currentSession: null })
    }
  }
}))
```

## React 18 Concurrent Features Implementation

### Suspense Boundaries for Progressive Loading
```typescript
// Context7-verified streaming pattern for optimal UX
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardHeaderSkeleton />}>
        <DashboardHeader />
      </Suspense>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<PerformanceChartSkeleton />}>
            <PerformanceChart />
          </Suspense>
        </div>
        
        <div className="space-y-4">
          <Suspense fallback={<StudyStreakSkeleton />}>
            <StudyStreak />
          </Suspense>
          
          <Suspense fallback={<QuickActionsSkeleton />}>
            <QuickActions />
          </Suspense>
        </div>
      </div>
      
      <Suspense fallback={<RecentActivitySkeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  )
}

// Server component for data fetching
async function DashboardHeader() {
  // Context7 pattern: Server-side data fetching with caching
  const userStats = await fetch('/api/v1/analytics/dashboard', {
    next: { revalidate: 300 } // 5-minute cache
  }).then(res => res.json())
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Welcome back, {userStats.user.name}!
      </h1>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Study Streak" 
          value={userStats.studyStreak} 
          icon={FireIcon}
          trend="up" 
        />
        <StatCard 
          title="Questions Answered" 
          value={userStats.totalQuestions} 
          icon={BookOpenIcon}
          trend="up" 
        />
        <StatCard 
          title="Accuracy Rate" 
          value={`${userStats.accuracyRate}%`} 
          icon={ChartBarIcon}
          trend={userStats.accuracyTrend} 
        />
        <StatCard 
          title="Readiness Score" 
          value={userStats.readinessScore} 
          icon={TrophyIcon}
          trend="up" 
        />
      </div>
    </div>
  )
}
```

### Error Boundaries for Resilient UX
```typescript
// Context7-verified error boundary pattern
'use client'

import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
      <ExclamationTriangleIcon className="h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
      <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
        Something went wrong
      </h2>
      <p className="text-red-600 dark:text-red-400 text-center mb-4 max-w-md">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
      >
        Try again
      </button>
    </div>
  )
}

// Usage in layout components
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(error, errorInfo) => {
            console.error('Application error:', error, errorInfo)
            // Send to error tracking service
            if (typeof window !== 'undefined') {
              window.Sentry?.captureException(error)
            }
          }}
        >
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

## Tailwind CSS Component Architecture

### Design System Implementation
```typescript
// Context7-verified component architecture with Tailwind
// components/ui/button.tsx - Based on Shadcn/ui patterns
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
        destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90",
        outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
        ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        link: "text-slate-900 underline-offset-4 hover:underline dark:text-slate-50",
        // Mellowise-specific variants
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700",
        game: "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg transform hover:scale-105 transition-all duration-200"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Responsive Game Interface Components
```typescript
// Context7-verified responsive design patterns
// components/game/SurvivalModeInterface.tsx
'use client'

export function SurvivalModeInterface({ sessionId }: { sessionId: string }) {
  const { currentQuestion, lives, score, timeRemaining } = useGameStore()
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Game Header - Context7 responsive pattern */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Lives Display */}
            <div className="flex items-center space-x-2">
              <HeartIcon className="h-6 w-6 text-red-400" />
              <span className="text-white font-semibold">
                {Array.from({ length: lives }).map((_, i) => (
                  <HeartIcon key={i} className="inline h-5 w-5 text-red-500 fill-current" />
                ))}
                {Array.from({ length: 3 - lives }).map((_, i) => (
                  <HeartIcon key={i} className="inline h-5 w-5 text-gray-500" />
                ))}
              </span>
            </div>
            
            {/* Score Display */}
            <div className="flex items-center space-x-2">
              <TrophyIcon className="h-6 w-6 text-yellow-400" />
              <span className="text-white font-bold text-xl">{score.toLocaleString()}</span>
            </div>
            
            {/* Timer */}
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-6 w-6 text-blue-400" />
              <div className={cn(
                "px-3 py-1 rounded-full font-mono font-bold",
                timeRemaining <= 10 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "bg-blue-500 text-white"
              )}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Question Card - Mobile-first responsive design */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Question Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 md:p-6">
            <div className="flex items-center justify-between text-white">
              <h2 className="text-lg md:text-xl font-semibold">
                {currentQuestion?.type.replace('_', ' ').toUpperCase()}
              </h2>
              <div className="text-sm opacity-90">
                Question {currentQuestion?.number} of {currentQuestion?.total}
              </div>
            </div>
          </div>
          
          {/* Question Content */}
          <div className="p-6 md:p-8">
            <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                {currentQuestion?.content}
              </p>
            </div>
            
            {/* Answer Options - Context7 responsive grid pattern */}
            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(option.id)}
                  disabled={isSubmitting}
                  className={cn(
                    // Base styles
                    "w-full p-4 text-left rounded-lg border-2 transition-all duration-200",
                    "hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/20",
                    // Responsive text sizing
                    "text-sm md:text-base",
                    // State-based styling
                    selectedAnswer === option.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500",
                    // Disabled state
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      selectedAnswer === option.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex-1">{option.text}</div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Submit Button */}
            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer || isSubmitting}
                variant="game"
                size="lg"
                loading={isSubmitting}
                className="min-w-32"
              >
                Submit Answer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Performance Optimization Strategies

### Code Splitting & Lazy Loading
```typescript
// Context7-verified dynamic imports for optimal bundle splitting
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Lazy load heavy components
const GameEngine = dynamic(() => import('@/components/game/GameEngine'), {
  loading: () => <GameLoadingSkeleton />,
  ssr: false // Client-side only for game logic
})

const AnalyticsChart = dynamic(() => import('@/components/analytics/PerformanceChart'), {
  loading: () => <ChartSkeleton />
})

// Route-based code splitting
const SurvivalMode = dynamic(() => import('@/app/(dashboard)/survival/SurvivalMode'))
const PracticeMode = dynamic(() => import('@/app/(dashboard)/practice/PracticeMode'))

// Conditional loading based on user subscription
const PremiumFeatures = dynamic(() => import('@/components/premium/PremiumFeatures'), {
  loading: () => <FeatureLoadingSkeleton />
})

export function ConditionalPremiumFeatures({ user }: { user: User }) {
  if (user.subscriptionTier !== 'premium') {
    return <PremiumUpgradePrompt />
  }
  
  return (
    <Suspense fallback={<FeatureLoadingSkeleton />}>
      <PremiumFeatures />
    </Suspense>
  )
}
```

### Image Optimization & Asset Management
```typescript
// Context7-verified Next.js Image optimization
import Image from 'next/image'

// Optimized image component with responsive sizing
export function OptimizedAvatar({ user, size = 'md' }: AvatarProps) {
  const dimensions = {
    sm: { width: 32, height: 32, className: 'w-8 h-8' },
    md: { width: 48, height: 48, className: 'w-12 h-12' },
    lg: { width: 64, height: 64, className: 'w-16 h-16' },
    xl: { width: 96, height: 96, className: 'w-24 h-24' }
  }
  
  const { width, height, className } = dimensions[size]
  
  return (
    <div className={cn("relative rounded-full overflow-hidden", className)}>
      <Image
        src={user.avatar || '/images/default-avatar.png'}
        alt={`${user.name}'s avatar`}
        width={width}
        height={height}
        className="object-cover"
        priority={size === 'lg' || size === 'xl'} // Prioritize larger avatars
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        onError={() => {
          // Fallback to default avatar on error
          console.warn(`Failed to load avatar for user ${user.id}`)
        }}
      />
    </div>
  )
}
```

This frontend technical architecture leverages Next.js 14's App Router capabilities with React 18's concurrent features, providing a solid foundation for Mellowise's interactive learning experience. The implementation emphasizes performance, accessibility, and responsive design while maintaining the budget constraints and development timeline requirements.