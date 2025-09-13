# Starting New Card - Template Checklist

## When User Says: "Let's start CARD-ID"

### ✅ Step 1: Workflow Validation
```bash
./kanban/workflow-check.sh CARD-ID
```

### ✅ Step 2: Status Response
Based on workflow check result:

**If BACKLOG:**
"I'll start CARD-ID. First, let me move it from backlog to in_progress, then begin implementation."

**If IN_PROGRESS:**
"I see CARD-ID is already in progress. Let me continue the implementation work."

**If REVIEW:**
"CARD-ID is in review status. Implementation should be complete. I'll focus on testing and validation."

**If DONE:**
"CARD-ID is already complete. No further work needed."

### ✅ Step 3: Create Todos
Always create todos for:
1. Card status management
2. Implementation tracking
3. Status transitions

### ✅ Step 4: Execute Workflow
- Move card if needed
- Set up implementation todos
- Begin work only when in IN_PROGRESS

## Example Response Template:

"I'll start CARD-ID. Let me first check its workflow status and then begin implementation.

[Run workflow check]

I see CARD-ID is currently in [STATUS]. [Follow appropriate action based on status]

[Create todos and begin work]"