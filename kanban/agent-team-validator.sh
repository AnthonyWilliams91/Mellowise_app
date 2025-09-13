#!/bin/bash

# Agent Team Workflow Validator
# Ensures agent team assignments are properly copied when cards move between statuses
# Usage: ./agent-team-validator.sh CARD-ID [SOURCE-STATUS] [TARGET-STATUS]

CARD_ID="$1"
SOURCE_STATUS="$2"
TARGET_STATUS="$3"

KANBAN_DIR="kanban/mellowise_dev"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if agent team info exists in README
check_agent_team_in_readme() {
    local status_dir="$1"
    local readme_file="$KANBAN_DIR/$status_dir/README.md"

    if [ ! -f "$readme_file" ]; then
        return 1
    fi

    # Check for agent team assignments section
    if grep -q "Agent Team Assignments" "$readme_file" && grep -q "Agent Team.*:" "$readme_file"; then
        return 0
    else
        return 1
    fi
}

# Function to validate card has agent team info in backlog
validate_card_has_agent_team() {
    local card_id="$1"
    local backlog_readme="$KANBAN_DIR/backlog/README.md"

    # Extract the section for this specific card
    if grep -A 20 "**$card_id:" "$backlog_readme" | grep -q "Agent Team.*:"; then
        return 0
    else
        return 1
    fi
}

# Function to check if agent team was copied for a specific card
validate_agent_team_copied() {
    local card_id="$1"
    local source_status="$2"
    local target_status="$3"

    local source_readme="$KANBAN_DIR/$source_status/README.md"
    local target_readme="$KANBAN_DIR/$target_status/README.md"

    # Check if target README has agent team section for this card
    if grep -A 30 "**$card_id:" "$target_readme" | grep -q "Agent Team.*:"; then
        return 0
    else
        return 1
    fi
}

# Main validation logic
if [ -z "$CARD_ID" ]; then
    print_status $RED "❌ USAGE ERROR: Card ID required"
    echo "Usage: ./agent-team-validator.sh CARD-ID [SOURCE-STATUS] [TARGET-STATUS]"
    echo "Example: ./agent-team-validator.sh MELLOWISE-011 backlog in_progress"
    exit 1
fi

print_status $BLUE "🔍 Validating agent team workflow for $CARD_ID..."

# Step 1: Validate card has agent team assignments in backlog
if ! validate_card_has_agent_team "$CARD_ID"; then
    print_status $RED "❌ CRITICAL ERROR: $CARD_ID missing agent team assignments in backlog README.md"
    print_status $YELLOW "💡 FIX: Add agent team assignments to backlog README.md first"
    exit 1
fi

print_status $GREEN "✅ Card has agent team assignments in backlog"

# Step 2: If source and target provided, validate the move
if [ -n "$SOURCE_STATUS" ] && [ -n "$TARGET_STATUS" ]; then
    print_status $BLUE "🔄 Validating move from $SOURCE_STATUS to $TARGET_STATUS..."

    # Check if agent team was properly copied
    if ! validate_agent_team_copied "$CARD_ID" "$SOURCE_STATUS" "$TARGET_STATUS"; then
        print_status $RED "❌ WORKFLOW VIOLATION: Agent team not copied to $TARGET_STATUS README.md"
        print_status $YELLOW "💡 REQUIRED ACTION:"
        print_status $YELLOW "   1. Open $KANBAN_DIR/$SOURCE_STATUS/README.md"
        print_status $YELLOW "   2. Find the $CARD_ID agent team section"
        print_status $YELLOW "   3. Copy it to $KANBAN_DIR/$TARGET_STATUS/README.md"
        print_status $YELLOW "   4. Re-run this validator"
        exit 1
    fi

    print_status $GREEN "✅ Agent team properly copied to $TARGET_STATUS"
fi

# Step 3: General README validation for all statuses
for status in "backlog" "in_progress" "review" "done"; do
    if check_agent_team_in_readme "$status"; then
        print_status $GREEN "✅ $status README.md has agent team framework"
    else
        print_status $YELLOW "⚠️  $status README.md missing agent team framework"
    fi
done

print_status $GREEN "🎯 Agent team workflow validation complete!"
print_status $BLUE "📋 Remember: Always copy agent team assignments when moving cards!"

# Step 4: Show next steps based on current card location
echo ""
print_status $BLUE "🔄 Current workflow status for $CARD_ID:"

if [ -f "$KANBAN_DIR/backlog/$CARD_ID.md" ]; then
    print_status $YELLOW "📍 BACKLOG → Next: Move to in_progress AND copy agent team info"
elif [ -f "$KANBAN_DIR/in_progress/$CARD_ID.md" ]; then
    print_status $YELLOW "📍 IN_PROGRESS → Ready for implementation with agent coordination"
elif [ -f "$KANBAN_DIR/review/$CARD_ID.md" ]; then
    print_status $YELLOW "📍 REVIEW → Coordinate with assigned QA agents for testing"
elif [ -f "$KANBAN_DIR/done/$CARD_ID.md" ]; then
    print_status $YELLOW "📍 DONE → Agent team contribution recorded for history"
else
    print_status $RED "❌ Card not found in any status directory!"
fi