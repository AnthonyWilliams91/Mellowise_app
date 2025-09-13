#!/bin/bash

# Simple Kanban Workflow Check
# Usage: ./workflow-check.sh CARD-ID

CARD_ID="$1"

if [ -z "$CARD_ID" ]; then
    echo "Usage: ./workflow-check.sh CARD-ID"
    echo "Example: ./workflow-check.sh MELLOWISE-005"
    exit 1
fi

echo "Checking workflow status for $CARD_ID..."

# Check each directory for the card file
KANBAN_DIR="kanban/mellowise_dev"

if [ -f "$KANBAN_DIR/backlog/$CARD_ID.md" ]; then
    echo "✅ Found in BACKLOG - Ready to move to IN_PROGRESS"
    echo "💡 Next: Move to in_progress/ before starting implementation"
elif [ -f "$KANBAN_DIR/in_progress/$CARD_ID.md" ]; then
    echo "✅ Found in IN_PROGRESS - Ready for implementation work"
    echo "💡 Remember: Update progress regularly during work"
elif [ -f "$KANBAN_DIR/review/$CARD_ID.md" ]; then
    echo "✅ Found in REVIEW - Implementation should be complete"
    echo "💡 Next: Review and test, then move to done/"
elif [ -f "$KANBAN_DIR/done/$CARD_ID.md" ]; then
    echo "✅ Found in DONE - Card is complete"
else
    echo "❌ Card not found in any kanban directory!"
    exit 1
fi

echo ""
echo "📋 Workflow reminder: BACKLOG → IN_PROGRESS → REVIEW → DONE"
echo ""

# Run agent team validation
echo "🤖 Running automatic agent team workflow validation..."
./kanban/agent-team-validator.sh "$CARD_ID"