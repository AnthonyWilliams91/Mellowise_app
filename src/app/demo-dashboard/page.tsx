export default function DemoDashboardPage() {
  // Mock user data for demonstration
  const mockUser = {
    email: 'demo@mellowise.com',
    user_metadata: { full_name: 'Demo Student' }
  }

  // Mock data for demonstration
  const mockStats = {
    streak: 7,
    questionsAnswered: 142,
    level: 3,
    accuracy: 78,
    studyTime: 24,
    targetScore: 165,
    currentScore: 155,
    daysUntilTest: 45
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Mellowise</h1>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#" className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Study
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Analytics
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  AI Tutor
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Account
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                Free Trial
              </span>
              <div className="text-sm text-gray-600">{mockUser.email}</div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {mockUser.user_metadata?.full_name}!
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Master the LSAT with confidence-building practice
          </p>
        </div>

        {/* Progress Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-8 mb-8 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-4">Your LSAT Journey</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{mockStats.streak}</div>
                  <div className="text-indigo-200 text-sm">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{mockStats.questionsAnswered}</div>
                  <div className="text-indigo-200 text-sm">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">Level {mockStats.level}</div>
                  <div className="text-indigo-200 text-sm">Current Level</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{mockStats.accuracy}%</div>
                  <div className="text-indigo-200 text-sm">Accuracy</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-center items-center lg:items-end">
              <div className="text-center lg:text-right">
                <div className="text-4xl font-bold mb-2">{mockStats.currentScore}</div>
                <div className="text-indigo-200 mb-1">Current Score</div>
                <div className="text-sm text-indigo-300">Target: {mockStats.targetScore}</div>
                <div className="text-sm text-indigo-300">{mockStats.daysUntilTest} days until test</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-emerald-600 group-hover:text-emerald-700 font-medium">Start →</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Survival Mode</h3>
            <p className="text-gray-600 text-sm">Test your skills in our signature game mode</p>
          </button>

          <button className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-amber-600 group-hover:text-amber-700 font-medium">Study →</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Practice Session</h3>
            <p className="text-gray-600 text-sm">Continue your focused LSAT preparation</p>
          </button>

          <button className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-indigo-600 group-hover:text-indigo-700 font-medium">View →</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Analytics</h3>
            <p className="text-gray-600 text-sm">Track your improvement and readiness</p>
          </button>
        </div>

        {/* Today's Recommendations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Recommendations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Focus Area: Logic Games</h3>
              <p className="text-blue-700 text-sm mb-3">
                Based on your recent performance, we recommend practicing sequencing games.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Start Practice
              </button>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Daily Goal: 25 Questions</h3>
              <div className="flex items-center mb-3">
                <div className="flex-1 bg-green-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <span className="ml-3 text-green-700 text-sm">15/25</span>
              </div>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                Continue
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-gray-900 text-sm">Completed 15 Logic Games questions</p>
                <p className="text-gray-500 text-xs">2 hours ago • 87% accuracy</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-gray-900 text-sm">Achieved 7-day study streak</p>
                <p className="text-gray-500 text-xs">Yesterday • Milestone unlocked</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-gray-900 text-sm">Survival Mode high score: 2,450 points</p>
                <p className="text-gray-500 text-xs">3 days ago • Personal best</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}