/**
 * MELLOWISE-016: Goal Dashboard Page
 * Main page for goal setting and progress tracking
 */

import { GoalDashboard } from '@/components/goals/GoalDashboard';

export default function GoalsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <GoalDashboard />
      </div>
    </div>
  );
}