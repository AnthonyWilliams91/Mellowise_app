# Mellowise Development Context & Status

## 🚀 **Project Overview**

**Mellowise** - Universal AI-powered exam prep platform with gamified learning experience

- **Product Focus**: Desktop-first design with mobile optimization
- **Core Feature**: Survival Mode game with authentic standardized test questions
- **Target Market**: Students preparing for LSAT, GRE, MCAT, SAT, and other standardized tests
- **Architecture**: Multi-tenant platform serving educational institutions globally

## 📚 **Context Management & Development Logging**

### **Claude Dev Log System**

**Location**: `/claude_dev_log/` - Comprehensive development history and context preservation system

**Purpose**: Maintain detailed development context across sessions to prevent context loss and enable seamless development handoffs between agents and sessions.

#### **Directory Structure**

```
claude_dev_log/
├── README.md                    # Master index and navigation
└── mvp_initial/                 # MVP Initial Phase (Epic 1-4)
    ├── mvp_initial_dashboard.md # Epic 1-4 progress summary
    └── [24 timestamped dev logs] # Individual card implementations
```

\*\*mvp_initial_dashboard.md - updated each time a task is completed with a description of work done and the current day date and time.

#### **Development Log Coverage**

- **Complete Platform History**: Cards MELLOWISE-001 through MELLOWISE-032
- **Epic Organization**: Logs grouped by Epic 1-4 development phases
- **Agent Attribution**: Documents which agents contributed to each card
- **Technical Implementation**: Detailed code changes, files created, and achievements
- **Chronological Tracking**: ISO 8601 UTC timestamps for development timeline

#### **Context Preservation Features**

- **Session Handoffs**: Detailed context for agent transitions
- **Development History**: Complete technical implementation details
- **Agent Coordination**: Tracks specialist agent contributions and lead responsibilities
- **Status Tracking**: Links to kanban workflow status and transitions
- **Achievement Documentation**: Key milestones and technical accomplishments

#### **Usage in Development Workflows**

1. **Before Starting Cards**: Review relevant dev logs for context and dependencies
2. **During Implementation**: Reference agent attribution and technical patterns from similar cards
3. **After Completion**: Update dev logs with new implementations and lessons learned
4. **Context Handoffs**: Use dev logs to brief new agents on project history and decisions

**Integration**: The dev log system complements the kanban workflow and BMad agent coordination for comprehensive project management.

#### **Date Stamping Requirements**
**MANDATORY**: Before making ANY additions to .md files:
1. **Check Today's Date**: Always verify the current date from system environment
2. **Date Stamp Placement**: Add timestamp on the line ABOVE any new content being added
3. **Format**: Use format `**Updated**: [Current Date] at [Current Time] [Timezone]`
4. **Examples**:
   ```markdown
   **Updated**: January 20, 2025 at 3:45 PM EST
   ## New Section Being Added
   ```

**Critical**: Never assume or guess dates - always check the actual current date before adding timestamps.

---

## 🎭 **BMad Orchestrator Integration**

### **Agent Coordination Protocol**

**Activation**: Use `/BMad:agents:bmad-orchestrator` for multi-agent coordination

#### **BMad Orchestrator Commands** (All commands require \* prefix)

- **`*help`**: Display available commands and specialist agents
- **`*agent [name]`**: Transform into specialized agent (AI Specialist, Dev Agent, UX Expert, etc.)
- **`*workflow [name]`**: Start specific workflows for card implementation
- **`*status`**: Show current context and active agent state
- **`*plan`**: Create detailed workflow plans before implementation

#### **Agent Selection Guidelines**

- **AI/ML Cards**: AI Specialist + Data Scientist
- **Backend/API Cards**: Dev Agent + Architect Agent
- **Frontend/UI Cards**: UX Expert + Dev Agent
- **Analytics Cards**: QA Agent + AI Specialist
- **Infrastructure Cards**: Architect Agent + Dev Agent

#### **Orchestrator Usage Patterns**

1. **Pre-Implementation**: Use `*agent` to select appropriate specialists
2. **Complex Cards**: Use `*workflow` for structured multi-step processes
3. **Context Reviews**: Use `*status` to understand current project state
4. **Agent Handoffs**: Document agent transitions in dev logs and kanban READMEs

**Critical Integration**: The BMad Orchestrator works with claude_dev_log system and kanban workflow to provide comprehensive development coordination.

---

## 🚨 **Automated Workflow Enforcement**

### **Pre-Implementation Protocol (MANDATORY)**

Before starting ANY card implementation:

1. **Context Review & BMad Agent Coordination**:

   ```bash
   # Review development history for context and dependencies
   # Check /claude_dev_log/mvp_initial/ for similar card patterns

   # Activate BMad Orchestrator for team coordination
   /BMad:agents:bmad-orchestrator
   *agent [specialist-type]  # Based on card requirements
   ```

2. **Workflow Validation & Context Preparation**:

   ```bash
   ./kanban/workflow-check.sh CARD-ID
   ```

3. **Agent Team Assignment & Context Documentation**:
   - Copy **Agent Team** + **Lead Responsibilities** sections from source to destination README.md
   - Reference relevant dev logs for agent coordination patterns
   - Validate agent team info is properly copied using:

   ```bash
   ./kanban/agent-team-validator.sh CARD-ID source_status target_status
   ```

4. **Status Transition & Development Logging Requirements**:
   - Cards MUST follow: `backlog → in_progress → review → done`
   - Agent team assignments must be copied during ALL status transitions
   - Create todos for status tracking before beginning implementation
   - Update relevant dev logs with implementation progress and agent contributions

### **BMad Agent Coordination Requirements**

**CRITICAL**: Before beginning any new card, use the BMad Orchestrator (`@.bmad-core/agents/bmad-orchestrator.md`) to:

- **Review Past Work**: Call on relevant specialist agents to assess completed implementations
- **Identify Issues**: Have agents review dependencies and integration points
- **Determine Execution Order**: Get agent recommendations for remaining Epic 2 cards
- **Resource Assessment**: Validate what might need to be added or removed for consideration

**Required Agent Consultation Process**:

1. Activate BMad Orchestrator: `/BMad:agents:bmad-orchestrator`
2. Call relevant specialists based on card type:
   - **AI/ML Cards**: AI Specialist + Data Scientist
   - **Backend/API**: Dev Agent + Architect Agent
   - **Frontend/UI**: UX Expert + Dev Agent
   - **Analytics**: QA Agent + AI Specialist
3. Have agents assess current state and provide implementation guidance
4. Document agent recommendations in card's **Agent Team** section

### **Enforcement Layers**

- **Layer 1**: Automated scripts block progression without proper workflow compliance
- **Layer 2**: BMad agents display workflow reminders on activation
- **Layer 3**: Status transitions require copying agent team assignments
- **Layer 4**: Automatic compliance checking via validation scripts

---

## 🔧 **Development Standards**

### **Workflow Validation Commands**

```bash
# Quick card status check
./kanban/workflow-check.sh CARD-ID

# Agent team validation
./kanban/agent-team-validator.sh CARD-ID source_status target_status

# Comprehensive workflow validation
./kanban/validate-workflow.sh
```

### **Required Steps for Any Card**

1. ✅ Review development history in `/claude_dev_log/mvp_initial/` for context and patterns
2. ✅ Run workflow-check.sh CARD-ID
3. ✅ Activate BMad Orchestrator for agent coordination (`/BMad:agents:bmad-orchestrator`)
4. ✅ Move card to in_progress status if needed
5. ✅ Copy agent team assignments to current status README.md
6. ✅ Create todos for progress tracking
7. ✅ Begin implementation only after card is IN_PROGRESS
8. ✅ Update dev logs with agent contributions and technical achievements

### **Context Preservation Best Practices**

#### **Session Handoffs**

- **Pre-Session**: Review latest dev logs and kanban status for current context
- **During Sessions**: Document agent decisions and technical rationale
- **Post-Session**: Update dev logs with implementation details and next steps
- **Agent Transitions**: Include agent handoff notes in kanban README.md files

#### **Development Continuity**

- **Epic Patterns**: Reference similar cards within the same epic for consistency
- **Agent Expertise**: Leverage documented agent specializations from previous cards
- **Technical Decisions**: Maintain architectural consistency using dev log documentation
- **Dependency Tracking**: Use dev logs to understand card interdependencies

#### **Context Documentation Standards**

- **Implementation Details**: Document key technical decisions and code patterns
- **Agent Attribution**: Track which agents contributed to specific features
- **Achievement Tracking**: Record story points, lines of code, and feature completions
- **Integration Points**: Note how cards integrate with existing platform components
- **Date Stamp Protocol**: Always check current date and add timestamp ABOVE any new .md content

**Usage**: These practices ensure seamless development across sessions and prevent context loss during agent handoffs.

### **Key Files & Directories**

- **Context Management**: `/claude_dev_log/` - Development history and session context
- **Kanban Management**: `/kanban/mellowise_dev/` - Card workflow and status tracking
- **BMad Agents**: `/.bmad-core/agents/` - Specialist agent coordination system
- **Architecture Docs**: `/docs/architecture/` - Technical architecture documentation
- **Database Schema**: `/supabase/migrations/` - Database structure and changes

### **Development Workflow Integration**

- **Pre-Implementation**: Review dev logs → Activate BMad Orchestrator → Validate workflow
- **During Implementation**: Document agent contributions → Update todos → Track progress
- **Post-Implementation**: Update dev logs → Transition kanban status → Prepare handoffs
- **Session Continuity**: Context preservation through dev logs and agent documentation

---

## 📊 **Epic Progress Dashboard**

### **Epic 1: Foundation & Core Infrastructure**
**█████████████████████████ 100%** ✅ **COMPLETE** (47/47 story points)
- Status: All foundation cards delivered and operational
- Platform: Revenue-generating, multi-tenant, FERPA-compliant

### **Epic 2: AI-Powered Personalization Engine**
**█████████████████████████ 100%** ✅ **COMPLETE** (63/63 story points)
- Status: All AI personalization cards delivered and operational
- Platform: Complete AI-powered personalization engine with adaptive learning
- Completed: All 7 Epic 2 cards (009-016) successfully delivered

### **Epic 3: Advanced Learning Features**
**█████████████████████████ 100%** ✅ **COMPLETE** (40/40 story points)
- Status: All advanced learning features delivered and operational
- Platform: Complete LSAT question system with spaced repetition and performance analytics
- Completed: All 8 Epic 3 cards (017-024) successfully delivered

### **Epic 4: Advanced Learning Features & Optimization**
**█████████████████████████ 100%** ✅ **COMPLETE** (55/55 story points)
- Status: All Epic 4 features delivered successfully
- Platform: Complete advanced learning ecosystem with AI tutoring, community, mobile optimization, and spaced repetition

---

## 📚 **Documentation Archive System**

### **Archive Location**: `/Documentation_Archives/`
Development progress and implementation details are archived for historical reference:

- **CLAUDE_Archive_20250925_151702.md** - Epic progress tracking and detailed implementation records
- **Complete Development History** - Available in `/claude_dev_log/mvp_initial/` for context preservation

**Updated**: September 30, 2025 at 11:50 PM EST

### **Current Focus**: Viral Waitlist Landing Page Development

**Active Project:** Waitlist Landing Page with Tiered Pricing & Referral System
- **Status:** Planning Complete - Implementation Starting
- **Timeline:** 3-week sprint (Oct 1-22, 2025)
- **Goal:** Collect 500+ beta signups with viral referral mechanics
- **Dev Log:** `claude_dev_log/20250930_waitlist_landing_page_planning.md`

**Recent Development Sessions:**
- **Sept 30, 2025:** Multi-agent planning session completed
  - 🎨 **UX Expert (Sally):** Front-end specifications created
  - 📣 **Marketing (Alex):** Copy & conversion strategy finalized
  - 🏗️ **Architect (Winston):** Technical architecture designed
  - 💻 **Dev Agent (James):** Implementation plan created
  - **Deliverables:** 4 comprehensive specification documents (100+ pages)
  - **Full Details:** See `claude_dev_log/20250930_waitlist_landing_page_planning.md`

### **Platform Maintenance & Enhancement**
All major epic development phases (Epic 1-4) are complete. Core platform features:
- Performance optimization
- User experience refinements
- Enterprise feature requests
- Technical debt resolution

---

**Platform Status**: Revenue-generating, multi-tenant, FERPA-compliant educational platform with complete AI personalization engine

**Development Phase**: Post-MVP Enhancement & New Feature Development (Waitlist System)

**Last Updated**: September 30, 2025 at 11:50 PM EST
