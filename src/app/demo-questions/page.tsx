'use client'

import { useState, useEffect } from 'react'
import QuestionCard from '@/components/questions/QuestionCard'
import { questionService } from '@/lib/questions/question-service'
import type { QuestionUniversal } from '@/types/universal-exam'

export default function DemoQuestionsPage() {
  const [question, setQuestion] = useState<QuestionUniversal | null>(null)
  const [loading, setLoading] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
    averageTime: 0
  })

  // Mock categories for demo
  const categories = [
    { slug: 'all', name: 'All Categories' },
    { slug: 'logical-reasoning', name: 'Logical Reasoning' },
    { slug: 'logic-games', name: 'Logic Games' },
    { slug: 'reading-comprehension', name: 'Reading Comprehension' }
  ]

  const loadNewQuestion = async () => {
    setLoading(true)
    setShowExplanation(false)
    
    try {
      const newQuestion = await questionService.getRandomQuestion({
        difficultyLevel: selectedDifficulty === 'all' ? undefined : selectedDifficulty,
        categorySlug: selectedCategory === 'all' ? undefined : selectedCategory
      })
      
      setQuestion(newQuestion)
    } catch (error) {
      console.error('Error loading question:', error)
      
      // Fallback to mock question for demo
      setQuestion({
        tenant_id: 'demo',
        id: 'demo-question-1',
        exam_type_id: 'lsat',
        category_id: 'logical-reasoning',
        content: `A recent study found that students who take handwritten notes perform better on conceptual questions than students who take notes on laptops. The researchers concluded that handwriting enhances learning compared to typing.

Which one of the following, if true, would most weaken the researchers' conclusion?`,
        question_type: 'weaken',
        subtype: 'argument_weaken',
        difficulty: 6,
        difficulty_level: 'medium',
        estimated_time: 90,
        cognitive_level: 'analysis',
        correct_answer: 'C',
        answer_choices: [
          { id: 'A', text: 'Students who handwrite notes tend to be more organized than students who type notes.' },
          { id: 'B', text: 'The study included both undergraduate and graduate students.' },
          { id: 'C', text: 'Students in the handwriting group were already higher-performing students before the study began.' },
          { id: 'D', text: 'Handwritten notes take longer to produce than typed notes.' },
          { id: 'E', text: 'The conceptual questions used in the study were particularly difficult.' }
        ],
        explanation: 'Choice C weakens the conclusion by suggesting an alternative explanation: the better performance might be due to the students being higher-performing to begin with, rather than the handwriting method itself. This attacks the causal relationship between handwriting and enhanced learning.',
        concept_tags: ['causal_reasoning', 'weaken_argument', 'alternative_explanation'],
        performance_indicators: ['LR:003'],
        source_attribution: 'Mellowise Demo Question',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        usage_count: 0,
        avg_response_time: 85000,
        accuracy_rate: 0.72
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (selectedAnswer: string, isCorrect: boolean, responseTime: number) => {
    setShowExplanation(true)
    
    // Update local stats
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      averageTime: Math.round((prev.averageTime * prev.total + responseTime) / (prev.total + 1))
    }))

    // Record attempt (will fail gracefully if DB not available)
    if (question) {
      try {
        await questionService.recordAttempt({
          questionId: question.id,
          selectedAnswer,
          isCorrect,
          responseTime,
          sessionId: 'demo-session'
        })
      } catch (error) {
        console.log('Demo mode: Question attempt not recorded')
      }
    }
  }

  useEffect(() => {
    loadNewQuestion()
  }, [selectedDifficulty, selectedCategory])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Mellowise Questions Demo</h1>
            <div className="text-sm text-gray-600">
              Score: {stats.correct}/{stats.total} ({stats.total > 0 ? Math.round((stats.correct/stats.total)*100) : 0}%)
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Question Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select 
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {categories.map(cat => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadNewQuestion}
                disabled={loading}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'New Question'}
              </button>
            </div>
          </div>
        </div>

        {/* Question */}
        {question ? (
          <QuestionCard
            question={question}
            onAnswer={handleAnswer}
            showExplanation={showExplanation}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-500">
              {loading ? 'Loading question...' : 'No questions available'}
            </div>
          </div>
        )}

        {/* Stats */}
        {stats.total > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Statistics</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
                <div className="text-sm text-gray-500">Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.total > 0 ? Math.round((stats.correct/stats.total)*100) : 0}%
                </div>
                <div className="text-sm text-gray-500">Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {Math.round(stats.averageTime/1000)}s
                </div>
                <div className="text-sm text-gray-500">Avg Time</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}