# Kanban Workflow Checklist

## Mandatory Steps for Story Development

### ✅ Before Starting Any Implementation
1. **Move card from backlog → in_progress**
   - Update status field to "in_progress"
   - Add started_date timestamp
   - Update progress field to indicate work has begun
   - Verify dependencies are met

### ✅ During Implementation
1. **Keep card in in_progress**
   - Update progress field regularly (10%, 25%, 50%, 75%)
   - Add implementation_notes as work progresses
   - Mark acceptance_criteria with ⏳ (in progress) or ✅ (complete)

### ✅ When Implementation Complete
1. **Move card from in_progress → review**
   - Update status field to "review"
   - Add completed_date timestamp
   - Update progress to "100% complete"
   - Mark all acceptance_criteria as ✅
   - Add comprehensive implementation_notes

### ✅ Never Skip States
- ❌ **NEVER**: backlog → review (skipping in_progress)
- ❌ **NEVER**: backlog → done (skipping in_progress + review)
- ✅ **ALWAYS**: backlog → in_progress → review → done

## Implementation Reminder Commands

Before starting any card implementation, always:

```bash
# 1. Check current card location
grep -r "CARD-ID" kanban/mellowise_dev/

# 2. Move to in_progress if in backlog
# Edit the appropriate kanban file

# 3. Verify move completed
grep -r "CARD-ID" kanban/mellowise_dev/in_progress.md
```

## Todo List Integration

Always include these todos when starting a card:
1. "Move CARD-ID from backlog to in_progress"
2. "Update CARD-ID progress during implementation"  
3. "Move CARD-ID from in_progress to review when complete"

## Red Flags to Watch For

🚨 **Warning Signs of Workflow Violations:**
- Implementing code without a card in in_progress
- Todo says "move to in_progress" but card already in review
- Multiple cards in in_progress simultaneously
- Card jumps status levels (backlog → review)

## Enforcement Rules

1. **No implementation without in_progress status**
2. **Update progress field regularly during work**
3. **Always validate current card location before starting**
4. **Use todos to track status transitions**