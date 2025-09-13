/**
 * Survival Mode Demo Page
 * 
 * Demonstrates the complete Survival Mode game experience with all features
 */

'use client'

import React from 'react'
import SurvivalModeGame from '@/components/survival-mode/SurvivalModeGame'

export default function DemoSurvivalPage() {
  const handleGameEnd = (finalScore: number, stats: any) => {
    console.log('Game ended with score:', finalScore, 'Stats:', stats)
    // In a real app, this would save to the database or update user stats
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              Mellowise Survival Mode Demo
            </h1>
            <div className="text-sm text-gray-600">
              Epic 1.5: Survival Mode Game Core Mechanics
            </div>
          </div>
        </div>
      </nav>

      {/* Main Game */}
      <SurvivalModeGame onGameEnd={handleGameEnd} />
    </div>
  )
}