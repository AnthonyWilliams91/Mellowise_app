# Automated Workflow Enforcement Reminders

## Agent Activation Auto-Reminders

### Critical Workflow Protocol Messages

These messages are automatically triggered during agent activation to ensure workflow compliance:

#### **For All Agents:**
```
🚨 WORKFLOW PROTOCOL REMINDER:
Before working on any card, you MUST:
1. Run ./kanban/workflow-check.sh CARD-ID
2. Verify agent team assignments are copied to current status README.md
3. Follow your assigned Lead Responsibilities for this card
4. Coordinate with other assigned agents using *agent commands

⚠️ NEVER start implementation without workflow validation!
```

#### **For Dev Agent (James):**
```
💻 DEV AGENT WORKFLOW REMINDER:
- ALWAYS run ./kanban/workflow-check.sh CARD-ID before coding
- Check current status README.md for your assigned responsibilities
- Coordinate with Architect for technical decisions
- Work with UX Expert for implementation specifications
- Involve QA Agent for testing requirements
```

#### **For Architect Agent (Winston):**
```
🏗️ ARCHITECT AGENT WORKFLOW REMINDER:
- System design decisions must reference agent team assignments
- Review Lead Responsibilities in current status README.md
- Guide Dev Agent with technical architecture
- Coordinate with UX Expert on feasibility
- Ensure QA Agent can validate the architecture
```

#### **For UX Expert Agent (Sally):**
```
🎨 UX EXPERT AGENT WORKFLOW REMINDER:
- UI/UX decisions must align with agent team plan
- Check Lead Responsibilities in current status README.md
- Collaborate with Architect on technical constraints
- Work with Dev Agent on implementation details
- Support QA Agent with UI testing scenarios
```

#### **For QA Agent (Quinn):**
```
🧪 QA AGENT WORKFLOW REMINDER:
- Testing strategy must follow agent team assignments
- Review Lead Responsibilities in current status README.md
- Coordinate with all agents for comprehensive coverage
- Validate work meets agent team quality standards
- Document results with agent accountability
```

#### **For PM Agent (John):**
```
📋 PM AGENT WORKFLOW REMINDER:
- Product decisions must consider agent team coordination
- Reference Lead Responsibilities in current status README.md
- Ensure requirements enable agent collaboration
- Track progress across all assigned agents
- Facilitate cross-agent communication
```

#### **For PO Agent (Sarah):**
```
📝 PO AGENT WORKFLOW REMINDER:
- User stories must include agent team considerations
- Check Lead Responsibilities in current status README.md
- Validate acceptance criteria support agent workflow
- Ensure proper agent team info propagation during card moves
- Maintain agent accountability throughout development
```

#### **For Analyst Agent (Mary):**
```
📊 ANALYST AGENT WORKFLOW REMINDER:
- Research must support agent team decision-making
- Review Lead Responsibilities in current status README.md
- Provide insights that enable other agents' work
- Consider multi-agent perspectives in analysis
- Document findings for agent team consumption
```

## Auto-Trigger Conditions

These reminders are automatically displayed when:

1. **Agent Activation**: Every agent shows relevant reminder on startup
2. **Card Status Check**: Triggered by ./kanban/workflow-check.sh
3. **BMad Orchestrator**: Reminds user of agent workflow when switching agents
4. **Pre-Implementation**: Before any development task begins

## Enforcement Escalation

If workflow violations are detected:

1. **Warning**: Display violation message with fix instructions
2. **Blocking**: Prevent progression until agent team info is properly copied
3. **Guidance**: Show exact steps to resolve workflow violation
4. **Validation**: Re-run checks until compliance achieved

## Success Metrics

Track workflow compliance with:
- Agent team info propagation rate: 100%
- Workflow validation completion: 100%
- Agent coordination success: Measured by deliverable quality
- Zero cards moved without agent team info copying