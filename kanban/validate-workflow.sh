#!/bin/bash

# Kanban Workflow Validation Script
# Run this before starting work on any card

set -e

CARD_ID="$1"

if [ -z "$CARD_ID" ]; then
    echo "❌ Usage: ./validate-workflow.sh CARD-ID"
    echo "   Example: ./validate-workflow.sh MELLOWISE-005"
    exit 1
fi

echo "🔍 Validating workflow for $CARD_ID..."

# Check where the card currently exists
KANBAN_DIR="kanban/mellowise_dev"

# Check each status file (look for "id": "CARD_ID" pattern to be precise)
BACKLOG_MATCH=$(grep -c "\"id\": \"$CARD_ID\"" "$KANBAN_DIR/backlog.md" 2>/dev/null || echo 0)
IN_PROGRESS_MATCH=$(grep -c "\"id\": \"$CARD_ID\"" "$KANBAN_DIR/in_progress.md" 2>/dev/null || echo 0)
REVIEW_MATCH=$(grep -c "\"id\": \"$CARD_ID\"" "$KANBAN_DIR/review.md" 2>/dev/null || echo 0)
DONE_MATCH=$(grep -c "\"id\": \"$CARD_ID\"" "$KANBAN_DIR/done.md" 2>/dev/null || echo 0)

TOTAL_MATCHES=$((BACKLOG_MATCH + IN_PROGRESS_MATCH + REVIEW_MATCH + DONE_MATCH))

echo "📍 Card location status:"
echo "   Backlog: $BACKLOG_MATCH"
echo "   In Progress: $IN_PROGRESS_MATCH" 
echo "   Review: $REVIEW_MATCH"
echo "   Done: $DONE_MATCH"

# Validation rules
if [ "$TOTAL_MATCHES" -eq 0 ]; then
    echo "❌ ERROR: Card $CARD_ID not found in any kanban file!"
    exit 1
elif [ "$TOTAL_MATCHES" -gt 1 ]; then
    echo "❌ ERROR: Card $CARD_ID exists in multiple files! Clean up required."
    exit 1
fi

# Determine current status and next action
if [ "$BACKLOG_MATCH" -eq 1 ]; then
    echo "✅ Card is in BACKLOG"
    echo "📋 Next action: Move to IN_PROGRESS before starting implementation"
    echo "💡 Command: Edit kanban/mellowise_dev/backlog.md and kanban/mellowise_dev/in_progress.md"
elif [ "$IN_PROGRESS_MATCH" -eq 1 ]; then
    echo "✅ Card is in IN_PROGRESS - Ready for implementation!"
    echo "📋 Remember to update progress regularly"
elif [ "$REVIEW_MATCH" -eq 1 ]; then
    echo "⚠️  Card is in REVIEW - Implementation should be complete"
    echo "📋 Next action: Review and test, then move to DONE"
elif [ "$DONE_MATCH" -eq 1 ]; then
    echo "✅ Card is DONE - No further work needed"
fi

echo ""
echo "🔄 Proper workflow: BACKLOG → IN_PROGRESS → REVIEW → DONE"
echo "📖 See kanban/workflow-checklist.md for detailed guidelines"