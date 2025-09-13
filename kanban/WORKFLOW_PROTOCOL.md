# 🚨 MANDATORY WORKFLOW PROTOCOL 🚨

## Claude Development Agent - Standard Operating Procedure

### ⚠️ BEFORE IMPLEMENTING ANY CARD - ALWAYS:

1. **RUN WORKFLOW CHECK FIRST**
   ```bash
   ./kanban/workflow-check.sh CARD-ID
   ```

2. **FOLLOW STATUS INSTRUCTIONS**
   - BACKLOG → Move to in_progress.md first
   - IN_PROGRESS → Ready to implement
   - REVIEW → Test and validate only
   - DONE → No work needed

3. **COPY AGENT TEAM ASSIGNMENTS**
   - Always copy **Agent Team** and **Lead Responsibilities** sections from source README.md to destination README.md
   - Maintains perfect record of team coordination across all statuses
   - Enables accountability tracking for every card

4. **CREATE STATUS TRACKING TODOS**
   - Move card to proper status (with agent team info)
   - Track implementation progress
   - Move to next status when complete

5. **ONLY START CODING WHEN CARD IS IN_PROGRESS**

### ❌ NEVER:
- Skip workflow validation
- Start coding with card in BACKLOG
- Jump from BACKLOG → REVIEW
- Implement without proper todos

### ✅ ALWAYS:
- Validate card status first
- Follow proper workflow sequence
- Update progress during work
- Move cards through proper states

---

**This protocol prevents workflow violations and ensures proper project tracking.**