/**
 * MELLOWISE-013: Question Generation Admin Page
 * Admin interface for generating and reviewing LSAT questions
 */

import { QuestionGenerationDashboard } from '@/components/admin/QuestionGenerationDashboard';

export default function QuestionGenerationAdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Question Generation Admin</h1>
          <p className="text-muted-foreground mt-2">
            Generate, review, and manage AI-powered LSAT questions
          </p>
        </div>
        <QuestionGenerationDashboard />
      </div>
    </div>
  );
}