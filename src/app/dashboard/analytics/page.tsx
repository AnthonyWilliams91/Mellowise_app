/**
 * Analytics Dashboard Page
 * 
 * Main analytics page for the user dashboard
 */

import { Metadata } from 'next'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

export const metadata: Metadata = {
  title: 'Analytics | Mellowise',
  description: 'Track your LSAT preparation progress and performance analytics',
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <AnalyticsDashboard />
    </div>
  )
}