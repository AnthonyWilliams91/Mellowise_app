/**
 * Survival Mode Game Header Component
 * 
 * Displays game statistics, lives, timer, and score in a professional gaming interface
 */

import React from 'react'
import Image from 'next/image'
import { Clock, Heart, Trophy, Zap, Pause, Play, Save, X } from 'lucide-react'
import type { GameState } from '@/types/survival-mode'

interface GameHeaderProps {
  gameState: GameState
  accuracy: number
  timeProgress: number
  streakMultiplier: number
  currentQuestionDifficulty?: number
  onPause: () => void
  onResume: () => void
  onSaveGame?: () => void
  onEndGame?: () => void
  className?: string
}

export default function GameHeader({ 
  gameState, 
  accuracy, 
  timeProgress, 
  streakMultiplier,
  currentQuestionDifficulty,
  onPause, 
  onResume,
  onSaveGame,
  onEndGame,
  className = '' 
}: GameHeaderProps) {
  const isTimeWarning = gameState.timeRemaining <= 10
  const isTimeCritical = gameState.timeRemaining <= 5
  
  return (
    <div className={`bg-white border-b border-gray-200 shadow-sm relative z-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-28">
          {/* Left section - Logo, Game controls and status */}
          <div className="flex items-center space-x-6">
            {/* Mellowise Logo */}
            <div className="flex items-center">
              <Image
                src="/mellowise-logo-512.png"
                alt="Mellowise"
                width={112}
                height={112}
                className="rounded-lg"
              />
            </div>
            
            {/* Pause/Resume Button */}
            <button
              onClick={gameState.isPaused ? onResume : onPause}
              disabled={!gameState.isActive || gameState.isGameOver || (!gameState.isPaused && gameState.pausesRemaining === 0)}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative"
              title={gameState.pausesRemaining === 0 ? "No pauses remaining" : `${gameState.pausesRemaining} pauses left`}
            >
              {gameState.isPaused ? (
                <Play className="w-5 h-5 text-indigo-600" />
              ) : (
                <Pause className="w-5 h-5 text-indigo-600" />
              )}
              {!gameState.isPaused && gameState.pausesRemaining > 0 && (
                <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {gameState.pausesRemaining}
                </div>
              )}
            </button>
            
            {/* Game Status */}
            <div className="text-sm font-medium text-gray-600">
              {gameState.isPaused ? 'Paused' : 
               gameState.isGameOver ? 'Game Over' :
               gameState.isActive ? 'Playing' : 'Ready'}
            </div>
          </div>
          
          {/* Center section - Core game stats */}
          <div className="flex items-center space-x-8">
            {/* Lives */}
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <div className="flex space-x-1">
                {Array.from({ length: gameState.maxLives }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < gameState.lives 
                        ? 'bg-red-500' 
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {gameState.lives}/{gameState.maxLives}
              </span>
            </div>
            
            {/* Timer */}
            <div className="flex items-center space-x-2">
              <Clock className={`w-5 h-5 ${
                isTimeCritical ? 'text-red-600' :
                isTimeWarning ? 'text-amber-500' : 
                'text-blue-500'
              }`} />
              <div className="relative">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      isTimeCritical ? 'bg-red-500' :
                      isTimeWarning ? 'bg-amber-500' : 
                      'bg-blue-500'
                    }`}
                    style={{ width: `${timeProgress}%` }}
                  />
                </div>
                <span className={`text-sm font-mono font-bold ${
                  isTimeCritical ? 'text-red-600' :
                  isTimeWarning ? 'text-amber-600' : 
                  'text-gray-700'
                }`}>
                  {gameState.timeRemaining}s
                </span>
              </div>
            </div>
            
            {/* Score */}
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {gameState.score.toLocaleString()}
                </div>
              </div>
            </div>
            
            {/* Streak */}
            {gameState.streak > 0 && (
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-emerald-500" />
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-600">
                    {gameState.streak}
                  </div>
                  <div className="text-xs text-gray-500">
                    streak
                  </div>
                </div>
                {streakMultiplier > 1 && (
                  <div className="text-right">
                    <div className="text-xl font-black text-amber-600">
                      {streakMultiplier.toFixed(2)}x
                    </div>
                    <div className="text-xs text-amber-500 font-medium">
                      BONUS
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Right section - Progress stats */}
          <div className="flex items-center space-x-6">
            {/* Difficulty */}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 capitalize">
                {gameState.currentDifficulty}
              </div>
              <div className="text-xs text-gray-500">
                Level
              </div>
            </div>
            
            {/* Current Question Difficulty Level */}
            {currentQuestionDifficulty && (
              <div className="text-right">
                <div className="text-sm font-bold text-purple-600">
                  Level {currentQuestionDifficulty}
                </div>
                <div className="text-xs text-gray-500">
                  Difficulty
                </div>
              </div>
            )}
            
            {/* Accuracy */}
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">
                {accuracy}%
              </div>
              <div className="text-xs text-gray-500">
                Accuracy
              </div>
            </div>
            
            {/* Questions Progress */}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {gameState.correctAnswers}/{gameState.questionsAnswered}
              </div>
              <div className="text-xs text-gray-500">
                Correct
              </div>
            </div>
          </div>
        </div>
        
        {/* Game Over Overlay */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 text-center max-w-md mx-4">
              <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Game Over!</h2>
              <div className="space-y-2 text-gray-600">
                <p>Final Score: <span className="font-bold text-gray-900">{gameState.score.toLocaleString()}</span></p>
                <p>Questions Answered: <span className="font-bold text-gray-900">{gameState.questionsAnswered}</span></p>
                <p>Accuracy: <span className="font-bold text-gray-900">{accuracy}%</span></p>
                <p>Best Streak: <span className="font-bold text-gray-900">{gameState.maxStreak}</span></p>
              </div>
            </div>
          </div>
        )}
        
        {/* Pause Overlay */}
        {gameState.isPaused && !gameState.isGameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-4">
              <Pause className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Game Paused</h3>
              <p className="text-gray-600 mb-6">What would you like to do?</p>
              
              {/* Pause Menu Buttons */}
              <div className="space-y-3">
                <button
                  onClick={onResume}
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Resume Game
                </button>
                
                {onSaveGame && (
                  <button
                    onClick={onSaveGame}
                    className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save Game
                  </button>
                )}
                
                {onEndGame && (
                  <button
                    onClick={onEndGame}
                    className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <X className="w-5 h-5 mr-2" />
                    End Game
                  </button>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                Pauses remaining: {gameState.pausesRemaining}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}