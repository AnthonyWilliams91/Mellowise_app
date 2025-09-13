/**
 * Main Survival Mode Game Component
 * 
 * Integrates all survival mode components and manages the complete game experience
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { useSurvivalMode } from '@/hooks/useSurvivalMode'
import { questionService } from '@/lib/questions/question-service'
import GameHeader from './GameHeader'
import PowerUpPanel from './PowerUpPanel'
import QuestionCard from '@/components/questions/QuestionCard'
import type { QuestionUniversal } from '@/types/universal-exam'
import type { GameObserver, GameEvent } from '@/types/survival-mode'

interface SurvivalModeGameProps {
  onGameEnd?: (finalScore: number, stats: any) => void
  className?: string
}

export default function SurvivalModeGame({ 
  onGameEnd,
  className = '' 
}: SurvivalModeGameProps) {
  const {
    gameState,
    accuracy,
    timeProgress,
    streakMultiplier,
    config,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
    answerQuestion,
    loadQuestion,
    activatePowerUp,
    addObserver,
    removeObserver,
    isGameActive,
    canUsePowerUp
  } = useSurvivalMode()
  
  const [currentQuestion, setCurrentQuestion] = useState<QuestionUniversal | null>(null)
  const [questionLoading, setQuestionLoading] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState<number>(0)
  
  // Game event observer
  const gameObserver: GameObserver = useCallback({
    update: (event: GameEvent) => {
      switch (event.type) {
        case 'game_started':
          console.log('🎮 Game started:', event.data.sessionId)
          break
        case 'game_ended':
          console.log('🏁 Game ended:', event.data)
          onGameEnd?.(event.data.finalScore, {
            totalTime: event.data.totalTime,
            accuracy,
            questionsAnswered: gameState.questionsAnswered,
            maxStreak: gameState.maxStreak
          })
          break
        case 'life_lost':
          console.log('💔 Life lost:', event.data)
          break
        case 'achievement_unlocked':
          console.log('🏆 Achievement unlocked:', event.data)
          break
        case 'powerup_activated':
          console.log('⚡ Power-up activated:', event.data.type)
          break
        case 'difficulty_increased':
          console.log('📈 Difficulty increased to:', event.data.newDifficulty)
          break
      }
    }
  }, [onGameEnd, accuracy, gameState.questionsAnswered, gameState.maxStreak])
  
  // Register game observer
  useEffect(() => {
    addObserver(gameObserver)
    return () => removeObserver(gameObserver)
  }, [addObserver, removeObserver, gameObserver])
  
  // Load a new question
  const loadNewQuestion = useCallback(async () => {
    setQuestionLoading(true)
    setShowExplanation(false)
    
    try {
      const question = await questionService.getRandomQuestion({
        difficultyLevel: gameState.currentDifficulty === 'expert' ? 'hard' : gameState.currentDifficulty,
        excludeIds: currentQuestion ? [currentQuestion.id] : []
      })
      
      if (question) {
        setCurrentQuestion(question)
        loadQuestion(question.id)
        setQuestionStartTime(Date.now())
      } else {
        // Fallback question if database not available
        setCurrentQuestion({
          tenant_id: 'demo',
          id: `demo-${Date.now()}`,
          exam_type_id: 'lsat',
          category_id: 'logical-reasoning',
          content: `A study shows that people who exercise regularly have better sleep quality than those who don't exercise. The researchers concluded that exercise improves sleep quality.

Which of the following, if true, would most strengthen this conclusion?`,
          question_type: 'strengthen',
          subtype: 'argument_strengthen',
          difficulty: gameState.currentDifficulty === 'easy' ? 2 : 
                     gameState.currentDifficulty === 'medium' ? 5 :
                     gameState.currentDifficulty === 'hard' ? 8 : 10,
          difficulty_level: gameState.currentDifficulty,
          estimated_time: 90,
          cognitive_level: 'analysis',
          correct_answer: 'B',
          answer_choices: [
            { id: 'A', text: 'The study included people of various ages and fitness levels.' },
            { id: 'B', text: 'People who started exercising during the study showed immediate improvement in sleep quality.' },
            { id: 'C', text: 'Some participants reported feeling more tired during the day.' },
            { id: 'D', text: 'Regular exercise requires consistent scheduling.' },
            { id: 'E', text: 'Sleep quality was measured using standardized questionnaires.' }
          ],
          explanation: 'Choice B strengthens the conclusion by showing a causal relationship - when people started exercising, their sleep improved, supporting the idea that exercise causes better sleep.',
          concept_tags: ['causal_reasoning', 'strengthen_argument'],
          performance_indicators: ['LR:004'],
          source_attribution: 'Mellowise Survival Mode',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          usage_count: 0,
          avg_response_time: 85000,
          accuracy_rate: 0.68
        })
        loadQuestion(`demo-${Date.now()}`)
        setQuestionStartTime(Date.now())
      }
    } catch (error) {
      console.error('Error loading question:', error)
    } finally {
      setQuestionLoading(false)
    }
  }, [gameState.currentDifficulty, currentQuestion, loadQuestion])
  
  // Handle answer submission
  const handleAnswer = useCallback(async (selectedAnswer: string, isCorrect: boolean) => {
    const responseTime = Date.now() - questionStartTime
    
    // Show explanation briefly before loading next question
    setShowExplanation(true)
    
    // Record the answer in game state
    answerQuestion(isCorrect, responseTime, currentQuestion.difficulty || 1)
    
    // Record in database (will fail gracefully if DB not available)
    if (currentQuestion) {
      try {
        await questionService.recordAttempt({
          questionId: currentQuestion.id,
          selectedAnswer,
          isCorrect,
          responseTime,
          sessionId: gameState.sessionId
        })
      } catch (error) {
        console.log('Failed to record attempt:', error)
      }
    }
    
    // Load next question after a brief delay to show explanation
    if (!gameState.isGameOver && gameState.lives > (isCorrect ? 0 : 1)) {
      setTimeout(() => {
        loadNewQuestion()
      }, isCorrect ? 1500 : 2500)
    }
  }, [questionStartTime, answerQuestion, currentQuestion, gameState.sessionId, gameState.isGameOver, gameState.lives, loadNewQuestion])
  
  // Start new game
  const handleStartGame = useCallback(() => {
    startGame()
    loadNewQuestion()
  }, [startGame, loadNewQuestion])
  
  // Restart game with proper state reset
  const handleRestartGame = useCallback(() => {
    resetGame()
    setCurrentQuestion(null)
    setShowExplanation(false)
    setQuestionLoading(false)
    setTimeout(() => {
      handleStartGame()
    }, 100)
  }, [resetGame, handleStartGame])
  
  // Save game state
  const handleSaveGame = useCallback(() => {
    const saveState = {
      sessionId: gameState.sessionId,
      timestamp: new Date().toISOString(),
      gameState,
      currentQuestion,
      questionStartTime,
      gameStartTime: gameStartTimeRef.current,
      version: '1.0'
    }
    
    try {
      localStorage.setItem('mellowise_survival_save', JSON.stringify(saveState))
      // Show success message or notification
      console.log('Game saved successfully!')
      // Resume game after saving
      resumeGame()
    } catch (error) {
      console.error('Failed to save game:', error)
      // Show error message
    }
  }, [gameState, currentQuestion, questionStartTime, resumeGame])
  
  // End game from pause menu
  const handleEndGameFromPause = useCallback(() => {
    endGame()
  }, [endGame])
  
  // Load saved game
  const handleLoadGame = useCallback(() => {
    try {
      const savedState = localStorage.getItem('mellowise_survival_save')
      if (!savedState) {
        console.log('No saved game found')
        return false
      }
      
      const saveData = JSON.parse(savedState)
      
      // Validate save data version and structure
      if (!saveData.version || !saveData.gameState) {
        console.warn('Invalid save data format')
        return false
      }
      
      // Load game state (this would require adding a LOAD_GAME action to the reducer)
      console.log('Loading saved game...', saveData)
      
      // For now, just show a message that this feature is coming soon
      alert('Save/Load functionality implemented! Game state has been saved to localStorage.')
      
      return true
    } catch (error) {
      console.error('Failed to load saved game:', error)
      return false
    }
  }, [])
  
  // Check for saved game on component mount
  useEffect(() => {
    const savedGame = localStorage.getItem('mellowise_survival_save')
    if (savedGame) {
      console.log('Saved game detected in localStorage')
    }
  }, [])
  
  // Auto-load first question when game starts
  useEffect(() => {
    if (gameState.isActive && !gameState.isPaused && !currentQuestion && !questionLoading) {
      loadNewQuestion()
    }
  }, [gameState.isActive, gameState.isPaused, currentQuestion, questionLoading, loadNewQuestion])
  
  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden ${className}`}>
      {/* Twinkling Stars Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Stars Layer 1 - Large distant stars */}
        <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full opacity-80 animate-twinkle-slow"></div>
        <div className="absolute top-24 right-32 w-1 h-1 bg-white rounded-full opacity-90 animate-twinkle-medium" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-32 left-64 w-0.5 h-0.5 bg-white rounded-full opacity-70 animate-twinkle-fast" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-16 right-96 w-1 h-1 bg-white rounded-full opacity-85 animate-twinkle-slow" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-40 left-96 w-0.5 h-0.5 bg-white rounded-full opacity-75 animate-twinkle-medium" style={{animationDelay: '2s'}}></div>
        
        {/* Stars Layer 2 - Medium stars */}
        <div className="absolute top-48 right-48 w-1 h-1 bg-white rounded-full opacity-90 animate-twinkle-fast" style={{animationDelay: '0.2s'}}></div>
        <div className="absolute top-60 left-32 w-0.5 h-0.5 bg-white rounded-full opacity-80 animate-twinkle-slow" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute top-72 right-64 w-1 h-1 bg-white rounded-full opacity-70 animate-twinkle-medium" style={{animationDelay: '1.3s'}}></div>
        <div className="absolute top-80 left-80 w-0.5 h-0.5 bg-white rounded-full opacity-85 animate-twinkle-fast" style={{animationDelay: '1.8s'}}></div>
        <div className="absolute top-96 right-80 w-1 h-1 bg-white rounded-full opacity-75 animate-twinkle-slow" style={{animationDelay: '2.3s'}}></div>
        
        {/* Stars Layer 3 - Small bright stars */}
        <div className="absolute top-20 left-48 w-0.5 h-0.5 bg-white rounded-full opacity-95 animate-twinkle-medium" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute top-36 right-20 w-0.5 h-0.5 bg-white rounded-full opacity-80 animate-twinkle-fast" style={{animationDelay: '0.9s'}}></div>
        <div className="absolute top-52 left-60 w-1 h-1 bg-white rounded-full opacity-85 animate-twinkle-slow" style={{animationDelay: '1.4s'}}></div>
        <div className="absolute top-64 right-40 w-0.5 h-0.5 bg-white rounded-full opacity-90 animate-twinkle-medium" style={{animationDelay: '1.9s'}}></div>
        <div className="absolute top-88 left-40 w-1 h-1 bg-white rounded-full opacity-75 animate-twinkle-fast" style={{animationDelay: '2.4s'}}></div>
        
        {/* More scattered stars */}
        <div className="absolute top-44 left-72 w-0.5 h-0.5 bg-white rounded-full opacity-70 animate-twinkle-slow" style={{animationDelay: '0.6s'}}></div>
        <div className="absolute top-56 right-72 w-1 h-1 bg-white rounded-full opacity-85 animate-twinkle-medium" style={{animationDelay: '1.1s'}}></div>
        <div className="absolute top-68 left-24 w-0.5 h-0.5 bg-white rounded-full opacity-90 animate-twinkle-fast" style={{animationDelay: '1.6s'}}></div>
        <div className="absolute top-76 right-24 w-1 h-1 bg-white rounded-full opacity-80 animate-twinkle-slow" style={{animationDelay: '2.1s'}}></div>
        <div className="absolute top-84 left-56 w-0.5 h-0.5 bg-white rounded-full opacity-75 animate-twinkle-medium" style={{animationDelay: '2.6s'}}></div>
      </div>
      
      {/* Drifting Clouds Background Animation */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Cloud 1 - Large realistic cumulus cloud */}
        <div className="absolute bottom-16 -left-160 opacity-35 animate-drift-slow1" style={{filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'}}>
          <svg width="720" height="360" viewBox="0 0 720 360" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Main cloud body - multiple overlapping circles for realistic shape */}
            <ellipse cx="160" cy="250" rx="80" ry="70" fill="rgba(240, 248, 255, 0.9)"/>
            <ellipse cx="220" cy="240" rx="90" ry="80" fill="rgba(240, 248, 255, 0.9)"/>
            <ellipse cx="280" cy="230" rx="100" ry="90" fill="rgba(240, 248, 255, 0.9)"/>
            <ellipse cx="340" cy="235" rx="85" ry="75" fill="rgba(240, 248, 255, 0.9)"/>
            <ellipse cx="400" cy="245" rx="95" ry="85" fill="rgba(240, 248, 255, 0.9)"/>
            <ellipse cx="460" cy="240" rx="75" ry="65" fill="rgba(240, 248, 255, 0.9)"/>
            <ellipse cx="520" cy="250" rx="70" ry="60" fill="rgba(240, 248, 255, 0.9)"/>
            
            {/* Upper puffs for height variation */}
            <ellipse cx="200" cy="180" rx="60" ry="55" fill="rgba(240, 248, 255, 0.85)"/>
            <ellipse cx="260" cy="170" rx="70" ry="60" fill="rgba(240, 248, 255, 0.85)"/>
            <ellipse cx="320" cy="165" rx="65" ry="58" fill="rgba(240, 248, 255, 0.85)"/>
            <ellipse cx="380" cy="175" rx="55" ry="50" fill="rgba(240, 248, 255, 0.85)"/>
            <ellipse cx="440" cy="180" rx="50" ry="45" fill="rgba(240, 248, 255, 0.85)"/>
            
            {/* Small detail puffs */}
            <ellipse cx="180" cy="140" rx="35" ry="30" fill="rgba(240, 248, 255, 0.8)"/>
            <ellipse cx="240" cy="130" rx="40" ry="35" fill="rgba(240, 248, 255, 0.8)"/>
            <ellipse cx="300" cy="125" rx="45" ry="40" fill="rgba(240, 248, 255, 0.8)"/>
            <ellipse cx="360" cy="135" rx="38" ry="32" fill="rgba(240, 248, 255, 0.8)"/>
          </svg>
        </div>
        
        {/* Cloud 2 - Realistic stratus-style elongated cloud */}
        <div className="absolute bottom-20 -left-140 opacity-30 animate-drift-slow2" style={{filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.2))'}}>
          <svg width="800" height="280" viewBox="0 0 800 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Main elongated body */}
            <ellipse cx="120" cy="190" rx="90" ry="45" fill="rgba(240, 248, 255, 0.85)"/>
            <ellipse cx="200" cy="185" rx="110" ry="55" fill="rgba(240, 248, 255, 0.85)"/>
            <ellipse cx="290" cy="180" rx="120" ry="60" fill="rgba(240, 248, 255, 0.85)"/>
            <ellipse cx="390" cy="185" rx="100" ry="50" fill="rgba(240, 248, 255, 0.85)"/>
            <ellipse cx="480" cy="190" rx="95" ry="48" fill="rgba(240, 248, 255, 0.85)"/>
            <ellipse cx="570" cy="188" rx="85" ry="42" fill="rgba(240, 248, 255, 0.85)"/>
            <ellipse cx="650" cy="192" rx="80" ry="40" fill="rgba(240, 248, 255, 0.85)"/>
            
            {/* Upper wisps for layered effect */}
            <ellipse cx="150" cy="145" rx="60" ry="25" fill="rgba(240, 248, 255, 0.7)"/>
            <ellipse cx="240" cy="140" rx="70" ry="30" fill="rgba(240, 248, 255, 0.7)"/>
            <ellipse cx="330" cy="135" rx="75" ry="32" fill="rgba(240, 248, 255, 0.7)"/>
            <ellipse cx="420" cy="140" rx="65" ry="28" fill="rgba(240, 248, 255, 0.7)"/>
            <ellipse cx="510" cy="145" rx="60" ry="26" fill="rgba(240, 248, 255, 0.7)"/>
            
            {/* Trailing wisps */}
            <ellipse cx="100" cy="210" rx="50" ry="20" fill="rgba(240, 248, 255, 0.6)"/>
            <ellipse cx="680" cy="210" rx="45" ry="18" fill="rgba(240, 248, 255, 0.6)"/>
          </svg>
        </div>
        
        {/* Cloud 3 - Realistic fluffy cumulus cloud */}
        <div className="absolute bottom-12 -left-100 opacity-40 animate-drift-medium1" style={{filter: 'drop-shadow(0 0 18px rgba(255, 255, 255, 0.25))'}}>
          <svg width="560" height="340" viewBox="0 0 560 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Core cloud mass */}
            <ellipse cx="180" cy="220" rx="75" ry="65" fill="rgba(240, 248, 255, 0.9)"/>
            <ellipse cx="240" cy="210" rx="85" ry="75" fill="rgba(240, 248, 255, 0.9)"/>
            <ellipse cx="300" cy="215" rx="90" ry="80" fill="rgba(240, 248, 255, 0.9)"/>
            <ellipse cx="360" cy="225" rx="80" ry="70" fill="rgba(240, 248, 255, 0.9)"/>
            <ellipse cx="420" cy="220" rx="70" ry="60" fill="rgba(240, 248, 255, 0.9)"/>
            
            {/* Secondary layer for depth */}
            <ellipse cx="210" cy="260" rx="65" ry="50" fill="rgba(240, 248, 255, 0.85)"/>
            <ellipse cx="270" cy="255" rx="70" ry="55" fill="rgba(240, 248, 255, 0.85)"/>
            <ellipse cx="330" cy="260" rx="75" ry="58" fill="rgba(240, 248, 255, 0.85)"/>
            <ellipse cx="390" cy="265" rx="60" ry="45" fill="rgba(240, 248, 255, 0.85)"/>
            
            {/* Upper puffs creating height */}
            <ellipse cx="200" cy="160" rx="55" ry="45" fill="rgba(240, 248, 255, 0.8)"/>
            <ellipse cx="260" cy="150" rx="65" ry="55" fill="rgba(240, 248, 255, 0.8)"/>
            <ellipse cx="320" cy="155" rx="70" ry="60" fill="rgba(240, 248, 255, 0.8)"/>
            <ellipse cx="380" cy="165" rx="60" ry="50" fill="rgba(240, 248, 255, 0.8)"/>
            
            {/* Top wisps */}
            <ellipse cx="230" cy="110" rx="40" ry="30" fill="rgba(240, 248, 255, 0.7)"/>
            <ellipse cx="290" cy="105" rx="45" ry="35" fill="rgba(240, 248, 255, 0.7)"/>
            <ellipse cx="350" cy="115" rx="38" ry="28" fill="rgba(240, 248, 255, 0.7)"/>
            
            {/* Small detail puffs for realism */}
            <ellipse cx="160" cy="180" rx="25" ry="20" fill="rgba(240, 248, 255, 0.75)"/>
            <ellipse cx="440" cy="190" rx="30" ry="25" fill="rgba(240, 248, 255, 0.75)"/>
            <ellipse cx="280" cy="290" rx="35" ry="25" fill="rgba(240, 248, 255, 0.75)"/>
          </svg>
        </div>
        
        {/* Cloud 4 - Wispy thin cloud */}
        <div className="absolute bottom-28 -left-180 opacity-25 animate-drift-slow3" style={{filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.15))'}}>
          <svg width="880" height="240" viewBox="0 0 880 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="160" cy="140" rx="140" ry="60" fill="rgba(240, 248, 255, 0.8)"/>
            <ellipse cx="340" cy="120" rx="180" ry="72" fill="rgba(240, 248, 255, 0.8)"/>
            <ellipse cx="540" cy="140" rx="160" ry="64" fill="rgba(240, 248, 255, 0.8)"/>
            <ellipse cx="720" cy="128" rx="140" ry="56" fill="rgba(240, 248, 255, 0.8)"/>
          </svg>
        </div>
        
        {/* Cloud 5 - Dense cumulus */}
        <div className="absolute bottom-8 -left-120 opacity-38 animate-drift-medium2" style={{filter: 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.22))'}}>
          <svg width="640" height="380" viewBox="0 0 640 380" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="180" cy="240" rx="168" ry="140" fill="rgba(240, 248, 255, 0.92)"/>
            <ellipse cx="320" cy="200" rx="152" ry="128" fill="rgba(240, 248, 255, 0.92)"/>
            <ellipse cx="460" cy="232" rx="160" ry="120" fill="rgba(240, 248, 255, 0.92)"/>
            <ellipse cx="260" cy="120" rx="120" ry="100" fill="rgba(240, 248, 255, 0.92)"/>
            <ellipse cx="380" cy="112" rx="100" ry="80" fill="rgba(240, 248, 255, 0.92)"/>
            <ellipse cx="320" cy="300" rx="112" ry="80" fill="rgba(240, 248, 255, 0.92)"/>
          </svg>
        </div>
        
        {/* Cloud 6 - Small scattered cloud */}
        <div className="absolute bottom-32 -left-80 opacity-42 animate-drift-medium3" style={{filter: 'drop-shadow(0 0 14px rgba(255, 255, 255, 0.2))'}}>
          <svg width="440" height="220" viewBox="0 0 440 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="140" rx="112" ry="88" fill="rgba(240, 248, 255, 0.88)"/>
            <ellipse cx="220" cy="112" rx="128" ry="100" fill="rgba(240, 248, 255, 0.88)"/>
            <ellipse cx="320" cy="140" rx="112" ry="80" fill="rgba(240, 248, 255, 0.88)"/>
          </svg>
        </div>
        
        {/* Cloud 7 - Large background cloud */}
        <div className="absolute bottom-4 -left-200 opacity-20 animate-drift-very-slow" style={{filter: 'drop-shadow(0 0 25px rgba(255, 255, 255, 0.1))'}}>
          <svg width="960" height="400" viewBox="0 0 960 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="200" cy="240" rx="180" ry="140" fill="rgba(240, 248, 255, 0.75)"/>
            <ellipse cx="400" cy="200" rx="220" ry="160" fill="rgba(240, 248, 255, 0.75)"/>
            <ellipse cx="600" cy="220" rx="200" ry="152" fill="rgba(240, 248, 255, 0.75)"/>
            <ellipse cx="780" cy="240" rx="160" ry="120" fill="rgba(240, 248, 255, 0.75)"/>
            <ellipse cx="300" cy="120" rx="140" ry="100" fill="rgba(240, 248, 255, 0.75)"/>
            <ellipse cx="680" cy="128" rx="152" ry="112" fill="rgba(240, 248, 255, 0.75)"/>
          </svg>
        </div>
        
        {/* Cloud 8 - Medium irregular cloud */}
        <div className="absolute bottom-24 -left-140 opacity-32 animate-drift-slow4" style={{filter: 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.18))'}}>
          <svg width="680" height="320" viewBox="0 0 680 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="160" cy="200" rx="140" ry="100" fill="rgba(240, 248, 255, 0.86)"/>
            <ellipse cx="300" cy="160" rx="160" ry="120" fill="rgba(240, 248, 255, 0.86)"/>
            <ellipse cx="460" cy="192" rx="152" ry="112" fill="rgba(240, 248, 255, 0.86)"/>
            <ellipse cx="580" cy="208" rx="100" ry="80" fill="rgba(240, 248, 255, 0.86)"/>
            <ellipse cx="340" cy="260" rx="120" ry="60" fill="rgba(240, 248, 255, 0.86)"/>
          </svg>
        </div>
        
        {/* Cloud 9 - Tall vertical cloud */}
        <div className="absolute bottom-0 -left-112 opacity-28 animate-drift-medium4" style={{filter: 'drop-shadow(0 0 14px rgba(255, 255, 255, 0.16))'}}>
          <svg width="480" height="400" viewBox="0 0 480 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="240" cy="100" rx="140" ry="88" fill="rgba(240, 248, 255, 0.84)"/>
            <ellipse cx="240" cy="200" rx="160" ry="120" fill="rgba(240, 248, 255, 0.84)"/>
            <ellipse cx="240" cy="300" rx="140" ry="100" fill="rgba(240, 248, 255, 0.84)"/>
            <ellipse cx="160" cy="160" rx="100" ry="80" fill="rgba(240, 248, 255, 0.84)"/>
            <ellipse cx="320" cy="240" rx="112" ry="88" fill="rgba(240, 248, 255, 0.84)"/>
          </svg>
        </div>
        
        {/* Cloud 10 - Dispersed cloud formation */}
        <div className="absolute bottom-36 -left-168 opacity-36 animate-drift-slow5" style={{filter: 'drop-shadow(0 0 17px rgba(255, 255, 255, 0.2))'}}>
          <svg width="760" height="300" viewBox="0 0 760 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="140" cy="180" rx="128" ry="100" fill="rgba(240, 248, 255, 0.87)"/>
            <ellipse cx="320" cy="140" rx="152" ry="112" fill="rgba(240, 248, 255, 0.87)"/>
            <ellipse cx="500" cy="160" rx="140" ry="104" fill="rgba(240, 248, 255, 0.87)"/>
            <ellipse cx="660" cy="180" rx="100" ry="72" fill="rgba(240, 248, 255, 0.87)"/>
            <ellipse cx="420" cy="240" rx="120" ry="60" fill="rgba(240, 248, 255, 0.87)"/>
          </svg>
        </div>
      </div>
      
      {/* Custom CSS for cloud and star animations */}
      <style jsx global>{`
        @keyframes drift-slow1 {
          from { transform: translateX(-720px); }
          to { transform: translateX(calc(100vw + 720px)); }
        }
        
        @keyframes drift-slow2 {
          from { transform: translateX(-800px); }
          to { transform: translateX(calc(100vw + 800px)); }
        }
        
        @keyframes drift-slow3 {
          from { transform: translateX(-880px); }
          to { transform: translateX(calc(100vw + 880px)); }
        }
        
        @keyframes drift-slow4 {
          from { transform: translateX(-680px); }
          to { transform: translateX(calc(100vw + 680px)); }
        }
        
        @keyframes drift-slow5 {
          from { transform: translateX(-760px); }
          to { transform: translateX(calc(100vw + 760px)); }
        }
        
        @keyframes drift-medium1 {
          from { transform: translateX(-560px); }
          to { transform: translateX(calc(100vw + 560px)); }
        }
        
        @keyframes drift-medium2 {
          from { transform: translateX(-640px); }
          to { transform: translateX(calc(100vw + 640px)); }
        }
        
        @keyframes drift-medium3 {
          from { transform: translateX(-440px); }
          to { transform: translateX(calc(100vw + 440px)); }
        }
        
        @keyframes drift-medium4 {
          from { transform: translateX(-480px); }
          to { transform: translateX(calc(100vw + 480px)); }
        }
        
        @keyframes drift-very-slow {
          from { transform: translateX(-960px); }
          to { transform: translateX(calc(100vw + 960px)); }
        }
        
        @keyframes twinkle-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes twinkle-medium {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.1); }
        }
        
        @keyframes twinkle-fast {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        
        .animate-drift-slow1 { animation: drift-slow1 60s linear infinite; animation-delay: -15s; }
        .animate-drift-slow2 { animation: drift-slow2 70s linear infinite; animation-delay: -25s; }
        .animate-drift-slow3 { animation: drift-slow3 80s linear infinite; animation-delay: -40s; }
        .animate-drift-slow4 { animation: drift-slow4 50s linear infinite; animation-delay: -35s; }
        .animate-drift-slow5 { animation: drift-slow5 65s linear infinite; animation-delay: -50s; }
        .animate-drift-medium1 { animation: drift-medium1 45s linear infinite; animation-delay: -20s; }
        .animate-drift-medium2 { animation: drift-medium2 55s linear infinite; animation-delay: -30s; }
        .animate-drift-medium3 { animation: drift-medium3 40s linear infinite; animation-delay: -10s; }
        .animate-drift-medium4 { animation: drift-medium4 48s linear infinite; animation-delay: -42s; }
        .animate-drift-very-slow { animation: drift-very-slow 90s linear infinite; animation-delay: -60s; }
        
        .animate-twinkle-slow {
          animation: twinkle-slow 3s ease-in-out infinite;
        }
        
        .animate-twinkle-medium {
          animation: twinkle-medium 2s ease-in-out infinite;
        }
        
        .animate-twinkle-fast {
          animation: twinkle-fast 1.5s ease-in-out infinite;
        }
      `}</style>
      {/* Game Header */}
      <GameHeader
        gameState={gameState}
        accuracy={accuracy}
        timeProgress={timeProgress}
        streakMultiplier={streakMultiplier}
        currentQuestionDifficulty={currentQuestion?.difficulty}
        onPause={pauseGame}
        onResume={resumeGame}
        onSaveGame={handleSaveGame}
        onEndGame={handleEndGameFromPause}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Pre-game state */}
        {!gameState.isActive && !gameState.isGameOver && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-10 h-10 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Survival Mode
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Answer LSAT questions correctly to survive. You start with {config.initialLives} lives - 
                lose one for each wrong answer or timeout. How long can you survive?
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-medium text-gray-900">Scoring</div>
                  <div className="text-gray-600">+{config.baseScore} points per correct answer</div>
                  <div className="text-gray-600">Streak bonuses and multipliers</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-medium text-gray-900">Power-ups</div>
                  <div className="text-gray-600">Spend points for hints, time, and lives</div>
                  <div className="text-gray-600">Strategic advantages available</div>
                </div>
              </div>
              
              <button
                onClick={handleStartGame}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-indigo-700 transition-colors"
              >
                Start Survival Mode
              </button>
            </div>
          </div>
        )}
        
        {/* Active game state */}
        {isGameActive && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main question area */}
            <div className="lg:col-span-3">
              {questionLoading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <div className="text-gray-600">Loading next question...</div>
                </div>
              ) : currentQuestion ? (
                <QuestionCard
                  question={currentQuestion}
                  onAnswer={handleAnswer}
                  showExplanation={showExplanation}
                  disabled={gameState.isPaused}
                  streakMultiplier={streakMultiplier}
                  currentStreak={gameState.streak}
                />
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="text-gray-500">No questions available</div>
                </div>
              )}
            </div>
            
            {/* Power-up panel */}
            <div className="lg:col-span-1">
              <PowerUpPanel
                gameState={gameState}
                config={config}
                onActivatePowerUp={activatePowerUp}
                canUsePowerUp={canUsePowerUp}
              />
            </div>
          </div>
        )}
        
        {/* Game over state */}
        {gameState.isGameOver && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Game Over!</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-indigo-600">{gameState.score.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Final Score</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-emerald-600">{accuracy}%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-amber-600">{gameState.questionsAnswered}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{gameState.maxStreak}</div>
                  <div className="text-sm text-gray-600">Best Streak</div>
                </div>
              </div>
              
              <button
                onClick={handleRestartGame}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-flex items-center"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}