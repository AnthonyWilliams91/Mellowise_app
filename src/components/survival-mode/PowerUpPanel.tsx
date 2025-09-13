/**
 * Power-Up Panel Component
 * 
 * Displays available power-ups with costs, cooldowns, and activation states
 */

import React from 'react'
import { 
  Lightbulb, 
  Clock, 
  Zap, 
  Heart, 
  Target, 
  Snowflake,
  Coins,
  Lock
} from 'lucide-react'
import type { PowerUpType, GameState, GameConfig } from '@/types/survival-mode'

interface PowerUpPanelProps {
  gameState: GameState
  config: GameConfig
  onActivatePowerUp: (type: PowerUpType) => void
  canUsePowerUp: (type: PowerUpType) => boolean
  className?: string
}

const powerUpIcons: Record<PowerUpType, React.ComponentType<any>> = {
  hint: Lightbulb,
  time_extension: Clock,
  fifty_fifty: Target,
  life_restore: Heart,
  freeze: Snowflake
}

const powerUpNames: Record<PowerUpType, string> = {
  hint: 'Hint',
  time_extension: 'Time Boost',
  fifty_fifty: '50/50',
  life_restore: 'Life Restore',
  freeze: 'Time Freeze'
}

const powerUpDescriptions: Record<PowerUpType, string> = {
  hint: 'Reveals a helpful hint for the current question',
  time_extension: 'Adds 30 seconds to the timer',
  fifty_fifty: 'Eliminates 2 incorrect answer choices',
  life_restore: 'Restores 1 lost life',
  freeze: 'Freezes the timer for 15 seconds'
}

export default function PowerUpPanel({ 
  gameState, 
  config, 
  onActivatePowerUp, 
  canUsePowerUp,
  className = '' 
}: PowerUpPanelProps) {
  const powerUpTypes: PowerUpType[] = [
    'hint',
    'time_extension', 
    'fifty_fifty',
    'life_restore',
    'freeze'
  ]
  
  if (!gameState.isActive || gameState.isGameOver || gameState.isPaused) {
    return null
  }
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Zap className="w-5 h-5 text-amber-500 mr-2" />
          Power-Ups
        </h3>
        <div className="flex items-center text-sm text-gray-600">
          <Coins className="w-4 h-4 mr-1" />
          {gameState.score} points
        </div>
      </div>
      
      {/* Power-up grid */}
      <div className="grid grid-cols-1 gap-2">
        {powerUpTypes.map((type) => {
          const Icon = powerUpIcons[type]
          const cost = gameState.powerUpCosts[type]
          const canUse = canUsePowerUp(type)
          const isActive = gameState.activePowerUps.some(p => p.type === type)
          const cooldownTime = gameState.powerUpCooldowns[type]
          const isOnCooldown = cooldownTime > 0
          
          return (
            <button
              key={type}
              onClick={() => canUse && onActivatePowerUp(type)}
              disabled={!canUse || isActive}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left flex items-center justify-between w-full h-16 ${
                isActive
                  ? 'border-emerald-500 bg-emerald-50'
                  : canUse
                  ? 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 hover:scale-[1.02]'
                  : 'border-gray-200 bg-white cursor-not-allowed'
              }`}
              title={powerUpDescriptions[type]}
            >
              {/* Left side: Icon and name */}
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 flex-shrink-0 ${
                  isActive
                    ? 'bg-emerald-100'
                    : canUse
                    ? 'bg-indigo-100'
                    : 'bg-gray-100'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    isActive
                      ? 'text-emerald-600'
                      : canUse
                      ? 'text-indigo-600'
                      : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className={`font-medium text-sm ${
                    isActive
                      ? 'text-emerald-900'
                      : canUse
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  }`}>
                    {powerUpNames[type]}
                  </div>
                  <div className={`text-xs ${
                    canUse ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {powerUpDescriptions[type]}
                  </div>
                </div>
              </div>
              
              {/* Right side: Cost and status */}
              <div className="flex items-center gap-3">
                <div className={`text-sm flex items-center ${
                  canUse ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  <Coins className="w-4 h-4 mr-1" />
                  {cost}
                </div>
                
                {isActive && (
                  <div className="text-sm text-emerald-600 font-medium bg-emerald-100 px-2 py-1 rounded">
                    Active
                  </div>
                )}
              </div>
              
              {/* Lock overlay for insufficient points or cooldown - top right corner */}
              {(!canUse && !isActive) && (
                <div className="absolute top-2 right-2 rounded-full p-1.5 shadow-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.3)' }}>
                  {isOnCooldown ? (
                    <div className="text-xs font-bold text-white bg-red-600 rounded-full w-6 h-6 flex items-center justify-center">
                      {Math.ceil(cooldownTime / 1000)}
                    </div>
                  ) : (
                    <Lock className="w-3 h-3" style={{ color: 'rgba(239, 68, 68, 0.8)' }} />
                  )}
                </div>
              )}
              
              {/* Active power-up timer */}
              {isActive && (
                <div className="absolute inset-0 border-2 border-emerald-400 rounded-lg pointer-events-none">
                  <div className="absolute inset-0 bg-emerald-100 opacity-20 rounded-lg animate-pulse" />
                </div>
              )}
            </button>
          )
        })}
      </div>
      
      {/* Active power-ups status */}
      {gameState.activePowerUps.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Active Effects:
          </div>
          <div className="space-y-1">
            {gameState.activePowerUps.map((powerUp, index) => {
              const Icon = powerUpIcons[powerUp.type]
              const timeLeft = Math.ceil(powerUp.remainingTime / 1000)
              
              return (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 text-emerald-600 mr-2" />
                    <span className="text-gray-700">{powerUpNames[powerUp.type]}</span>
                  </div>
                  <span className="text-emerald-600 font-medium">
                    {timeLeft}s
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Help text */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Earn points by answering questions correctly to unlock power-ups. 
          Each power-up has a cooldown period after use.
        </p>
      </div>
    </div>
  )
}