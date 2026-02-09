# LifeOS Coach - Combined Product Requirements Document & System Architecture

**Version:** 1.0 (Consolidated from v1-v15)  
**Product Name:** LifeOS Coach  
**Classification:** Multi-tenant Edge-AI Life Coaching Platform  
**Document Date:** February 2026

---

## Version History & Evolution

| Version | Key Changes |
|---------|-------------|
| **v1** | Initial architecture: Moltbot orchestration, Qmd retrieval, PARA memory, browser-use action layer |
| **v2** | Multi-tenant edge-AI architecture, coach silos (vector + BM25 + graph), mobile sync |
| **v3** | Edge-first offline architecture, MTEB-optimized models, daily re-embedding cron, external notes integration |
| **v4** | QAD (Quantization-Aware Distillation) pipeline, 300MB memory budget, shared arena allocator |
| **v5** | LoRA adapter architecture for domain-specific retrieval, cost analysis ($26/coach) |
| **v6** | Three-layer cognitive memory (Facts/Daily Notes/Tacit), decay algorithm, no-deletion rule |
| **v7** | Reranker LoRA fine-tuning, PDF extraction pipeline (Marker/PyMuPDF), storage limits |
| **v8** | Hybrid cloud extraction stack, smart PDF routing, resource optimization |
| **v9** | Base extraction without LLM, LoRA RAM reduction (QLoRA), Gemini Flash 3 for charts |
| **v10** | Admin "Coach Training Studio" workflow, synthetic data generation UI, tiered generation |
| **v11** | Custom persona types, user-generated training data, 10k dataset feasibility |
| **v12** | Complete PRD with user stories, system architecture diagrams, backend workflows |
| **v13** | Time estimates, custom persona ontologies, personal coach fine-tuning on-device |
| **v14** | Resource-constrained architecture: DuckDB/LanceDB/KuzuDB, Vite admin, VictoriaMetrics |
| **v15** | Session management deep-dive, sandboxing strategy (Landlock/cgroups), heartbeat roles |

---

# 1. EXECUTIVE SUMMARY

## 1.1 Core Value Proposition

A privacy-first mobile application providing personalized AI life coaching through specialized agents. Each coach maintains isolated knowledge silos (LanceDB vector + SQLite FTS5 BM25 + KuzuDB graph) with domain-specific LoRA fine-tuning, while user data remains encrypted on-device following PARA methodology.

## 1.2 Key Differentiators

- **Offline-first coaching** with <300MB on-device footprint
- **Admin-created specialized coaches** with synthetic LoRA training ($26/coach)
- **PARA-native memory architecture** (Projects, Areas, Resources, Archives)
- **Zero-knowledge sync** (E2EE) via PowerSync
- **Proactive coaching interventions** via Moltbot heartbeat system
- **Three-layer cognitive memory** (Hot/Warm/Cold decay)
- **Lightweight embedded stack** (DuckDB/LanceDB/KuzuDB, no PostgreSQL/Redis)

---

# 2. USER PERSONAS

## 2.1 Persona A: End User (Coachee)

- **Demographics:** 25-45, urban professional, iOS/Android
- **Goals:** Personal development, career coaching, habit formation
- **Pain Points:** Privacy concerns with cloud AI, inconsistent advice, lacks longitudinal memory
- **Tech Savviness:** Moderate (uses Notion/Obsidian)
- **Devices:** Primary mobile, occasional tablet

## 2.2 Persona B: Admin/Coach Creator

- **Demographics:** 30-55, domain expert (author, therapist, exec coach)
- **Goals:** Monetize expertise via scalable AI coaches, maintain IP control
- **Pain Points:** Technical barriers to AI deployment, content piracy concerns
- **Tech Savviness:** Low-Moderate (uses WordPress, Canva)
- **Devices:** Desktop primarily

## 2.3 Persona C: Platform Operator

- **Demographics:** Technical founder
- **Goals:** SaaS revenue, marketplace network effects
- **Responsibilities:** Infrastructure, model serving, billing, content moderation

---

# 3. EPIC-LEVEL USER STORIES

## Epic 1: Authentication & Onboarding

### Story 1.1: User Registration
*As a new user, I want to sign up with my email or social accounts so that I can start using the app immediately.*

**Acceptance Criteria:**
- [ ] Support Google, Apple, Email magic link via Clerk
- [ ] Onboarding flow completes in <3 minutes
- [ ] User selects 1-2 interest areas for default coach recommendations
- [ ] Biometric lock (FaceID/Fingerprint) enabled by default after first session

### Story 1.2: Privacy-First Data Storage
*As a privacy-conscious user, I want my data encrypted on my device with optional cloud backup.*

**Acceptance Criteria:**
- [ ] SQLCipher encryption enabled for local SQLite databases (AES-256)
- [ ] Keys derived from device secure enclave + user passphrase
- [ ] Optional E2EE sync via PowerSync (off by default)
- [ ] Export all data (JSON/ZIP) from settings menu

---

## Epic 2: Coach Discovery & Subscription

### Story 2.1: Browse Coaches
*As a user, I want to browse available coaches by category.*

**Acceptance Criteria:**
- [ ] Grid view with avatar, specialty badges, rating
- [ ] Filter by: Domain (Health/Wealth/Wisdom), Availability, Language
- [ ] Preview mode: 3 free messages to test coach personality
- [ ] Download size displayed (e.g., "45MB download required")
- [ ] Background download progress indicator

### Story 2.2: Premium Subscription
*As a user, I want to subscribe to a Pro coach for offline access.*

**Acceptance Criteria:**
- [ ] In-app purchase integration (Stripe/RevenueCat)
- [ ] Tiered pricing: Free (3 coaches), Pro ($15/mo unlimited), Elite ($30/mo + custom)
- [ ] Download includes: Text chunks (compressed), LoRA adapters (20MB), graph index
- [ ] Local indexing build progress shown
- [ ] Unsubscribe retains offline data but blocks updates

---

## Epic 3: AI Coaching Conversations

### Story 3.1: Offline Chat
*As a user, I want to chat with my coach offline.*

**Acceptance Criteria:**
- [ ] Full chat functionality without network after initial download
- [ ] Response time <3 seconds on iPhone 14 equivalent (ONNX Runtime)
- [ ] Context window maintained across sessions (last 20 turns)
- [ ] Automatic sync when connectivity restored

### Story 3.2: Contextual Memory
*As a user, I want my coach to remember my specific situation.*

**Acceptance Criteria:**
- [ ] PARA entities displayed in sidebar (Active Projects, Key People)
- [ ] Coach proactively references user's projects from PARA
- [ ] User can @mention entities
- [ ] Suggestions surface based on Hot memory (accessed within 7 days)

### Story 3.3: Proactive Check-ins
*As a user, I want the coach to proactively check in for accountability.*

**Acceptance Criteria:**
- [ ] Moltbot heartbeat delivers local push notifications
- [ ] Proactive prompts from PARA project deadlines
- [ ] Frequency settings: Daily/Weekly/Bi-weekly per coach
- [ ] Smart timing: Learns user active hours from Tacit Knowledge

---

## Epic 4: PARA Memory Management

### Story 4.1: Quick Capture
*As a user, I want to capture notes during or after coaching sessions.*

**Acceptance Criteria:**
- [ ] Quick-capture widget from chat interface
- [ ] Auto-extraction: AI suggests Project, Area, or Resource
- [ ] Voice-to-text support
- [ ] Tagging with #project-name or @person auto-links to graph

### Story 4.2: Automated Archival
*As a user, I want old projects automatically archived.*

**Acceptance Criteria:**
- [ ] Weekly automated review via Moltbot cron
- [ ] Suggestion: "Project completed? Move to Archives?"
- [ ] Graceful decay: Cold facts (>30 days) hidden but searchable
- [ ] Graph view showing entity relationships

### Story 4.3: External Notes Import
*As a user, I want to import from Obsidian/Google Keep.*

**Acceptance Criteria:**
- [ ] Obsidian: File picker for .md vault
- [ ] Google Keep: OAuth → Takeout → incremental browser-use crawling
- [ ] Apple Notes: iCloud IMAP bridge
- [ ] Import wizard maps folders to PARA categories
- [ ] Deduplication check using vector similarity

---

## Epic 5: Admin Coach Creation (Web Dashboard)

### Story 5.1: Upload Source Material
*As an admin, I want to upload my book PDFs.*

**Acceptance Criteria:**
- [ ] Drag-drop interface for up to 50MB PDFs (max 10 files per coach)
- [ ] Extraction preview shows text sample before processing
- [ ] Chunk visualization with edit capability
- [ ] Charts/diagrams flagged for Gemini Flash 3 processing
- [ ] Content policy check for PII/copyright warnings

### Story 5.2: Define Personality
*As an admin, I want to define my coach's personality.*

**Acceptance Criteria:**
- [ ] WYSIWYG editor for soul.md (persona definition)
- [ ] Template library (Socratic, Cheerleader, Analyst, Mentor)
- [ ] Example conversation builder (3-5 few-shot examples)
- [ ] Live preview chat to test personality before training
- [ ] Agent.md editor for operational instructions (advanced mode)

### Story 5.3: LoRA Training
*As an admin, I want to generate LoRA adapters for improved retrieval.*

**Acceptance Criteria:**
- [ ] One-click "Train Specialized Model" button
- [ ] Cost calculator shows $23.60 estimate before execution
- [ ] Model tier selection: Fast ($13)/Balanced ($26)/Deep ($51)
- [ ] Progress dashboard with quality metrics
- [ ] Downloadable LoRA file for backup

### Story 5.4: Monetization
*As an admin, I want to set pricing for my coach.*

**Acceptance Criteria:**
- [ ] Price setting: Free/$5/$15/$30 one-time or subscription
- [ ] Revenue share: 70% admin / 30% platform
- [ ] Availability regions (EU data compliance)
- [ ] Version control (V1.0, V1.1...)
- [ ] Analytics dashboard: Downloads, active users, retention

---

# 4. SYSTEM ARCHITECTURE

## 4.1 High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────────────────┐ │
│  │   iOS App    │  │ Android App  │  │     Web Dashboard (Admin Only)      │ │
│  │ • SwiftUI    │  │ • Jetpack    │  │ • Vite + React + TanStack           │ │
│  │ • SQLite     │  │   Compose    │  │ • Coach creation UI                 │ │
│  │ • ONNX       │  │ • ONNX       │  │ • Analytics                         │ │
│  │   Runtime    │  │   Runtime    │  │ • Dataset generation                │ │
│  └──────────────┘  └──────────────┘  └─────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │ HTTPS / WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GATEWAY LAYER                                      │
│                      (Moltbot Gateway - Go/Rust)                            │
│  • Authentication (Clerk JWT validation)                                    │
│  • Rate Limiting                                                            │
│  • Request Routing (User vs Admin endpoints)                                │
│  • Agent State Machines, Session Management                                 │
│  • Heartbeat/Cron Scheduling                                                │
└────────────────────────────┬──────────────────────────────────────────────────┘
                             │
      ┌──────────────────────┼──────────────────────┐
      │                      │                      │
      ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  COACH CREATION  │  │   USER SYNC      │  │ CONTENT DELIVERY │
│  (Admin Flow)    │  │   (User Flow)    │  │ (CDN/Edge)       │
│                  │  │                  │  │                  │
│  PDF Ingestion   │  │  PowerSync       │  │  Cloudflare R2   │
│  ↓               │  │  E2EE Protocol   │  │  LoRA adapters   │
│  Text Extraction │  │                  │  │  Coach packages  │
│  ↓               │  │                  │  │                  │
│  Synthetic Data  │  └──────────────────┘  └──────────────────┘
│  ↓               │
│  LoRA Training   │
│  ↓               │
│  QAD Quantize    │
└──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE LAYER                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │ DuckDB (Primary) │  │ LanceDB (Vector) │  │ KuzuDB (Graph)   │          │
│  │ • User Auth      │  │ • Embeddings     │  │ • Relationships  │          │
│  │ • Subscriptions  │  │ • S3/R2 backed   │  │ • Cypher queries │          │
│  │ • Coach Metadata │  │ • Read-only      │  │ • Embedded       │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                                │
│  │ S3/R2 Storage    │  │ NATS (Queue)     │                                │
│  │ • PDFs           │  │ • Job queue      │                                │
│  │ • LoRA adapters  │  │ • KV cache       │                                │
│  └──────────────────┘  └──────────────────┘                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       MODEL SERVING CLUSTER                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │ QLoRA Training  │  │ LoRA Merge      │  │ Claude/Kimi API             │ │
│  │ (RTX 3090/A100) │  │ Service (CPU)   │  │ (Synthetic Data)            │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4.2 Mobile Client Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        iOS/Android APP                           │
├─────────────────────────────────────────────────────────────────┤
│  UI Layer (SwiftUI / Jetpack Compose)                           │
│  ├── CoachGalleryView (Browse/Subscribe)                        │
│  ├── ChatView (Core conversation)                               │
│  ├── PARAView (Projects/Areas/Resources/Archives)               │
│  └── DailyNotesView (Timeline)                                  │
├─────────────────────────────────────────────────────────────────┤
│  AI Engine Layer (Objective-C++/JNI bridge to C++)              │
│  ├── ONNX Runtime Mobile (Shared Arena Allocator - 200MB pool)  │
│  │   ├── Jina-v2-small Embedder + LoRA (45MB)                   │
│  │   ├── Zerank-1-small Reranker + LoRA (120MB)                 │
│  │   └── GLiNER-Small NER (20MB)                                │
│  └── Inference queue (async batching)                           │
├─────────────────────────────────────────────────────────────────┤
│  Memory & Storage Layer (C++ Core)                              │
│  ├── sqlite-vec (vector embeddings - 50MB typical)              │
│  ├── SQLite FTS5 (BM25 indices - 20MB)                          │
│  ├── LiteGraph (mobile knowledge graph - 30MB)                  │
│  └── SQLCipher (encryption wrapper)                             │
├─────────────────────────────────────────────────────────────────┤
│  Sync & Network Layer                                           │
│  ├── PowerSync Client (differential sync)                       │
│  └── Moltbot Gateway Client (heartbeat, proactive triggers)     │
└─────────────────────────────────────────────────────────────────┘

Total Mobile Footprint: ~298MB (fits <300MB budget)
```

## 4.3 Data Flow: Chat Query

```
User Query "How do I handle work stress?"
           │
           ▼
┌──────────────────────┐
│  Moltbot Agent Core  │
│ (agent.md + soul.md) │
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
Summary.md    Retrieve Context
(Hot/Warm)    │
              ├── Qmd Query (local retrieval)
              │   ├── BM25: SQLite FTS5 "work stress"
              │   ├── Vector: sqlite-vec semantic similarity
              │   └── Rerank: Zerank cross-encoder
              │
              └── LiteGraph Traverse (mobile) / KuzuDB (server)
                  (stress)-[symptom_of]->(anxiety)
                           │
                           ▼
            ┌──────────────────────────┐
            │  Kimi K2.5 API (Cloud)   │
            │  Reasoning + Synthesis   │
            └──────────┬───────────────┘
                       │
                       ▼
                Reply to User
                       │
                       ▼
            Write to Daily Notes
            Update accessCount
            (Periodic weekly decay)
```

---

# 5. MEMORY ARCHITECTURE

## 5.1 Three-Layer Cognitive Memory

| Layer | Purpose | Implementation | Storage |
|-------|---------|----------------|---------|
| **Knowledge Graph (PARA)** | Declarative memory (facts/entities) | `life/` directory with structured JSON | sqlite-vec + LiteGraph |
| **Daily Notes** | Episodic memory (timeline) | Raw dated markdown | sqlite-vec full-text |
| **Tacit Knowledge** | Procedural memory (user patterns) | Single markdown file | Local file, synced selectively |

## 5.2 Atomic Fact Schema

```json
{
  "content": "User is training for Berlin Marathon",
  "category": "milestone",
  "timestamp": "2026-01-15",
  "source": "daily_note_2026-01-15",
  "status": "active",
  "supersededBy": null,
  "relatedEntities": ["areas/health", "people/coach_alex"],
  "lastAccessed": "2026-02-01",
  "accessCount": 12
}
```

**No-Deletion Rule:** When facts change, old fact status becomes `superseded` with `supersededBy` pointing to new fact. This preserves memory lineage.

## 5.3 Memory Decay Algorithm

| Tier | Age | Behavior |
|------|-----|----------|
| **Hot** | 0-7 days | Included in entity `summary.md`, high vector boost |
| **Warm** | 8-30 days | Included in `summary.md` but lower priority |
| **Cold** | 30+ days | Omitted from `summary.md`, only discoverable via explicit search |

**Frequency Resistance:** Facts with high `accessCount` resist decay (e.g., "User has diabetes" accessed monthly stays Warm).

## 5.4 Two-Tier Retrieval

```
Entity (e.g., "Project_Marathon")/
├── summary.md          # Tier 1: Always loaded (Hot/Warm facts)
└── items.json          # Tier 2: Retrieved on demand
    ├── Atomic Fact 1   # With metadata: category, status
    ├── Atomic Fact 2   
    └── ...             # Cold facts omitted from summary
```

---

# 6. HEARTBEAT SYSTEM (Proactive Engine)

## 6.1 Role A: PARA Maintenance

```yaml
Schedule: "0 2 * * 0"  # Sunday 2 AM local
Action: weekly_synthesis()
Tasks:
  - Scan PARA databases for all entities
  - Apply decay algorithm: Hot → Warm → Cold
  - Rewrite summary.md files excluding Cold facts
  - Move completed Projects to Archive/
  - Rebuild sqlite-vec indices
```

## 6.2 Role B: Fact Extraction

```yaml
Schedule: "0 */6 * * *"  # Every 6 hours if charging + WiFi
Action: extract_durable_facts()
Tasks:
  - Parse Daily Notes (new entries since last run)
  - Run GLiNER NER to extract: People, Projects, Milestones
  - Generate atomic facts with metadata
  - Insert into PARA categories
  - Update LiteGraph edges
```

## 6.3 Role C: Proactive Coaching

```yaml
Schedule: Dynamic (learned from Tacit Knowledge)
Action: proactive_intervention()
Logic:
  - Scan Projects with approaching deadlines (48h)
  - Check Areas with stale access (>7 days)
  - Generate contextual prompt
  - Deliver via local push notification
  - Log to Daily Notes
```

## 6.4 Role D: Vector/Graph Refresh

```yaml
Schedule: "0 3 * * 0"  # Sunday 3 AM
Action: refresh_embeddings()
Tasks:
  - Re-embed Cold memories accessed this week (promoted to Warm)
  - Optimize sqlite-vec HNSW indices
  - Prune LiteGraph orphaned edges
  - Update tacit_knowledge.md if new patterns detected
```

---

# 7. COACH CREATION PIPELINE

## 7.1 Full Pipeline Overview

### Phase 1: Definition (5 min)
1. Form: Coach name, description, category tags
2. Upload: Up to 10 PDFs (max 50MB total)
3. Extraction via smart routing:
   - **Text pages (80%):** PyMuPDF direct extraction
   - **Image pages (20%):** Gemini Flash 3 API
   - **Tables:** Camelot/Marker local extraction
4. Preview: 5 sample chunks for quality check
5. Persona selection: Philosophical/Technical/Creative/Casual

### Phase 2: Personality Definition (10 min)
1. WYSIWYG soul.md editor with templates
2. agent.md editor (advanced)
3. Examples folder: 3-5 Q&A pairs

### Phase 3: Dataset Generation (20-40 min, async)
1. Select tier: Fast (5k)/Standard (10k)/Deep (20k)
2. Cost displayed: "$26.20 estimated" (10k tier)
3. Backend generates:
   - 10k embedding triplets (anchor/positive/hard_negative)
   - 10k reranker triplets (query/doc_pos/doc_neg)
4. Local verification with MiniLM filters

### Phase 4: LoRA Training (30 min, GPU)
1. Embedding LoRA (Unsloth QLoRA, 5GB VRAM)
   - Config: r=16, alpha=32
   - Export: 8MB adapter
2. Reranker LoRA (PEFT 4-bit, 8GB VRAM)
   - Config: r=8, alpha=16
   - Export: 12MB adapter

### Phase 5: Packaging & Deployment (5 min)
1. Compress text chunks (zstd)
2. Upload to CDN (R2)
3. Register in database
4. Admin sets pricing and publishes

## 7.2 Cost Breakdown

| Component | 10k Standard Tier |
|-----------|-------------------|
| Embedding Dataset (60/30/10 tier) | $12.60 |
| Reranker Dataset (80/20 tier) | $10.00 |
| LoRA Training Compute | $1.00 |
| **Total per Coach** | **$23.60** |

## 7.3 Custom Persona Types

Admins can define custom ontologies:

```yaml
Persona_Type_Definition:
  name: "Stoic_Military_Leadership"
  description: "Combines Stoic philosophy with command authority"
  
  attributes:
    communication_style: "Directive/Imperative"
    emotional_stance: "Detached/Objective"
    temporal_focus: "Present/Action"
    authority_level: "Expert/Mentor"
    
  synthetic_guidelines:
    hard_negative_strategy: "Confuse Stoic acceptance with passive resignation"
    vocabulary_domain: ["command", "discipline", "virtue", "duty", "logos"]
    avoid_concepts: ["self-care", "toxic positivity"]
    
  quality_gates:
    min_confidence_score: 0.85
    required_keyword_density: 0.15
```

---

# 8. SESSION MANAGEMENT & ISOLATION

## 8.1 Session Architecture

```
User A (Alice) ──► Session uuid-a1b2 ──► Memory: /data/users/alice/para.db
                         │
                         └──► Uses Coach "Stoic" definition (read-only)
                         └──► Accesses Stoic Knowledge Silo (shared, read-only)

User B (Bob) ────► Session uuid-c3d4 ──► Memory: /data/users/bob/para.db
                         │
                         └──► Uses Coach "Stoic" definition (same read-only)
                         └──► Accesses Stoic Knowledge Silo (same shared)
```

**Critical Isolation Principle:** Sessions share Agent Definition and Coach Knowledge Silo, but have strictly separated Working Memory.

## 8.2 Sandboxing Strategy (Layered)

| Layer | Method | Threat Addressed | Cost |
|-------|--------|------------------|------|
| 1 | chroot + overlayfs + Landlock | Filesystem escape | 0MB |
| 2 | seccomp-bpf + capability dropping | Privilege escalation | 0MB |
| 3 | cgroups v2 (100MB RAM, 10 PIDs) | Resource exhaustion | 0MB |
| 4 | CLONE_NEWNET + eBPF whitelist | Network exfiltration | 0MB |
| 5 | DuckDB RLS + file permissions | Data leakage (user A→B) | 0MB |

**Default:** Layers 1-4 (lightweight, sufficient for trusted coach definitions)
**Optional:** gVisor/Firecracker for untrusted admin Python scripts

---

# 9. COMPLETE TECH STACK

## 9.1 Mobile Client (Edge Layer)

| Component | Technology | Size |
|-----------|-----------|------|
| **Framework** | SwiftUI (iOS) / Jetpack Compose (Android) | ~5MB |
| **Database ORM** | GRDB.swift / SQLDelight | ~2MB |
| **Vector DB** | sqlite-vec (C extension) | ~5MB |
| **Knowledge Graph** | LiteGraph (mobile-only, lightweight JS) | ~30MB |
| **ML Runtime** | ONNX Runtime Mobile | ~20MB |
| **Embedding Model** | Jina-v2-small INT8 + LoRA | ~45MB |
| **Reranker** | Zerank-1-small 4-bit + LoRA | ~120MB |
| **NER** | GLiNER-Small ONNX INT8 | ~20MB |
| **Sync** | PowerSync client | ~8MB |
| **Auth** | Clerk SDK | ~10MB |
| **Crypto** | SQLCipher | ~2MB |
| **Total** | | **~268MB** |

## 9.2 Backend Services

| Function | Technology | Specs |
|----------|-----------|-------|
| **API Server** | Go (Fiber) or Rust (Axum) | 20MB binary |
| **Agent Engine** | Moltbot (imported library) | +15MB |
| **Queue/Cache** | NATS Server | 10MB binary |
| **Primary DB** | DuckDB (file-based) | Library |
| **Vector DB** | LanceDB (embedded, R2-backed) | Library |
| **Graph DB** | KuzuDB (embedded) | 10MB |

## 9.3 Admin Dashboard

| Component | Technology |
|-----------|-----------|
| **Build** | Vite 5.x |
| **Framework** | React 18 |
| **Routing** | TanStack Router |
| **State** | Zustand + TanStack Query |
| **UI** | Radix UI + Tailwind |
| **Editor** | Monaco (lazy loaded) |
| **Hosting** | Cloudflare Pages (free) |

## 9.4 ML/Processing Pipeline

| Component | Technology | Cost |
|-----------|-----------|------|
| **PDF Extract** | PyMuPDF (local) | $0 |
| **Charts** | Gemini Flash 3 API | $0.0015/image |
| **Tables** | Camelot-py (local) | $0 |
| **Synthetic Data** | Kimi K2.5/Claude 3.5 API | $0.50/M tokens |
| **Training** | Unsloth QLoRA | Compute only |

## 9.5 Monitoring

| Component | Technology | Cost |
|-----------|-----------|------|
| **Metrics** | VictoriaMetrics | $0 |
| **Logs** | Grafana Loki | S3 costs only |
| **Visualization** | Grafana OSS | $0 |
| **Alerting** | AlertManager | $0 |

---

# 10. TIME ESTIMATES

## 10.1 User Activities

| Activity | Time | Notes |
|----------|------|-------|
| **App Cold Start** | 1.2s | ONNX model loading dominates |
| **Login (Biometric)** | 550ms | Clerk validation |
| **Send Chat Message** | 2.5s | Local retrieval (3s+ with Kimi API) |
| **PARA Quick Capture** | 400ms | Local NER + write |
| **Search PARA** | 350ms | BM25 + vector |
| **Download Coach (50MB)** | 5-30s | WiFi vs 4G |
| **Build Local Indices** | 8s | Blocking with progress bar |
| **Personal LoRA Training** | 2-4h | Overnight, on-device |

## 10.2 Admin Activities

| Activity | Time | Cost |
|----------|------|------|
| **PDF Upload (50MB)** | 20s | $0 |
| **Text Extraction** | 45s | ~$0.01 |
| **Generate 10k Triplets** | 20 min | $25 |
| **Train Embed LoRA** | 15 min | $0.60 |
| **Train Reranker LoRA** | 25 min | $1.00 |
| **Total Coach Creation** | ~65 min | **$26.70** |

---

# 11. SERVER SPECIFICATIONS

## 11.1 1,000 Users (MVP)

| Component | Spec | Monthly Cost |
|-----------|------|--------------|
| **Server** | Hetzner AX42 (8c/16GB) | €20 (~$22) |
| **Object Storage** | R2/S3 (500GB) | $25 |
| **GPU Training** | Spot A100 | $300 (usage-based) |
| **Total** | | **~$350/month** |

## 11.2 10,000 Users

| Component | Spec | Monthly Cost |
|-----------|------|--------------|
| **Server** | Hetzner AX102 (16c/32GB) | €40 (~$44) |
| **Storage + CDN** | R2 + Cloudflare | $100 |
| **GPU** | Dedicated RTX 3090 | $400 |
| **Total** | | **~$550/month** |

## 11.3 100,000 Users

| Component | Spec | Monthly Cost |
|-----------|------|--------------|
| **Servers** | 3x AX42 + K8s (k3s) | $400 |
| **DB** | MotherDuck (serverless DuckDB) | $200 |
| **GPU Cluster** | 2x A100 | $800 |
| **Total** | | **~$1,400/month** |

---

# 12. NON-FUNCTIONAL REQUIREMENTS

## 12.1 Performance

- **Cold start:** <2 seconds
- **Chat latency:** <3 seconds (offline mode)
- **Sync speed:** <30 seconds for 1000 notes delta
- **Battery:** Background heartbeat <2% daily drain

## 12.2 Security & Privacy

- **Encryption:** AES-256-GCM at rest, TLS 1.3 in transit
- **E2EE Sync:** XChaCha20-Poly1305 with X25519 key exchange
- **Privacy:** Zero-knowledge architecture (platform cannot read user PARA)
- **Compliance:** GDPR (right to deletion), SOC2 Type II target

## 12.3 Reliability

- **Offline capability:** Core coaching 100% offline after download
- **Fallback:** If LoRA fails, use base model + RAG
- **Backup:** Automatic encrypted backup to iCloud/Google Drive

---

# 13. IMPLEMENTATION ROADMAP

## Phase 1: Core Infrastructure (Weeks 1-4)
- DuckDB/LanceDB/KuzuDB setup
- Clerk auth, basic API in Go/Rust
- Moltbot gateway basic routing
- Mobile app scaffolding

## Phase 2: PARA Memory (Weeks 5-8)
- sqlite-vec + LiteGraph integration
- Daily Notes + hot/warm/cold decay
- PowerSync for multi-device sync

## Phase 3: AI Engine (Weeks 9-12)
- ONNX Runtime with Shared Arena
- Jina + Zerank + LoRA loading
- Kimi K2.5 API integration

## Phase 4: Coach Marketplace (Weeks 13-16)
- Admin dashboard (Vite + React)
- PDF ingestion pipeline
- Synthetic data generation
- LoRA training pipeline

## Phase 5: Polish & Launch (Weeks 17-20)
- Security audit
- Load testing (10k concurrent)
- App store submission
- Documentation & support

**Total Timeline:** 20 weeks with 2 mobile devs, 1 backend, 1 ML engineer, 1 designer.

---

# 14. SYNC PROTOCOL SPECIFICATION

```yaml
Sync_Rules:
  - table: daily_notes
    filter: user_id = current_user_id()
    direction: bidirectional
    conflict: timestamp_wins
    
  - table: entities
    filter: user_id = current_user_id()
    direction: bidirectional
    conflict: server_wins
    
  - table: tacit_knowledge
    filter: user_id = current_user_id()
    direction: upload_only  # Never download to other devices
    
  - table: coach_manifests
    filter: is_public = true OR user_id = subscriber_id
    direction: download_only
```

---

# 15. ENCRYPTION SPECIFICATION

```yaml
At_Rest:
  Algorithm: AES-256-GCM
  Key_Derivation: Argon2id (user passphrase + device hardware key)
  Database: SQLCipher
  
In_Transit:
  Protocol: TLS 1.3
  Certificate: Let's Encrypt / Cloudflare Origin
  
E2EE_Sync:
  Algorithm: XChaCha20-Poly1305
  Key_Exchange: X25519 (ECDH)
  Perfect_Forward_Secrecy: Enabled
```

---

# 16. KEY TECHNOLOGY DECISIONS (v14 Consolidation)

The following technology decisions from v14 supersede earlier versions:

| Component | Previous (v1-v13) | Current (v14+) | Rationale |
|-----------|-------------------|----------------|----------|
| **Primary Database** | PostgreSQL | **DuckDB** (file-based) | Single binary, no daemon, $0 cost |
| **Vector Database** | Pinecone/Weaviate | **LanceDB** (embedded, R2-backed) | S3-compatible, no server |
| **Graph Database (Server)** | Neo4j | **KuzuDB** (embedded) | 10MB, Cypher-compatible |
| **Graph Database (Mobile)** | - | **LiteGraph** (JS) | 30MB, runs in WebView/React Native |
| **Queue/Cache** | Redis | **NATS** | 10MB binary, built-in KV |
| **Admin Dashboard** | Next.js | **Vite + React** | Faster builds, simpler deployment |
| **Monitoring** | Datadog/Sentry | **VictoriaMetrics + Loki** | Self-hosted, $0 SaaS cost |
| **Cloud Reasoning** | GPT-4/Claude | **Kimi K2.5** | Cost-effective, long context |

> [!IMPORTANT]
> All references to PostgreSQL, Redis, Neo4j, Pinecone, or Next.js in this document have been updated to their v14 replacements. The lightweight stack enables a $5/month VPS for MVP.

---

*This consolidated PRD represents the complete technical specification for LifeOS Coach, incorporating all refinements from versions 1-15. Components use their latest specifications per v14's lightweight architecture, with the version history preserved for traceability.*
