'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react'

interface PaymentLoadingProps {
  message?: string
  showSteps?: boolean
}

export default function PaymentLoading({ 
  message = 'Processing your payment...',
  showSteps = true 
}: PaymentLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="text-center py-12">
          <div className="mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {message}
            </h2>
            <p className="text-gray-600">
              Please don't close this window
            </p>
          </div>

          {showSteps && (
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-800">Payment details verified</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                </div>
                <span className="text-sm text-blue-800">Processing transaction</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg opacity-50">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-600">Activating subscription</span>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Secured by Stripe</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}