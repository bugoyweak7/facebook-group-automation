# AI Group Poster — System Architecture

This document describes the technical architecture, design patterns, data flow, and security boundaries of the **AI Group Poster** Chrome/Edge extension.

---

## 1. System Overview

AI Group Poster is built on **Manifest V3** using modern **TypeScript**, **React 18**, **Tailwind CSS**, and **Vite**.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        AI Group Poster Extension                       │
│                                                                        │
│  ┌───────────────────────┐             ┌───────────────────────────┐   │
│  │   Extension Popup     │             │   Dashboard Tab (SaaS)    │   │
│  │   (Quick controls)    │             │   (Full CRM & Management) │   │
│  └──────────┬────────────┘             └─────────────┬─────────────┘   │
│             │                                        │                 │
│             └───────────────────┬────────────────────┘                 │
│                                 │ chrome.runtime messages               │
│                                 ▼                                      │
│               ┌───────────────────────────────────┐                    │
│               │     Background Service Worker     │                    │
│               │  - Queue State Machine            │                    │
│               │  - Tab Navigation Coordinator     │                    │
│               │  - Pacing Delay Runner            │                    │
│               │  - Notifications Dispatcher       │                    │
│               └─────────────────┬─────────────────┘                    │
│                                 │                                      │
│                                 │ chrome.tabs & messages               │
│                                 ▼                                      │
│               ┌───────────────────────────────────┐                    │
│               │     Facebook Content Script       │                    │
│               │  - Group Page Detection           │                    │
│               │  - Isolated Shadow DOM Helper     │                    │
│               │  - Clipboard Copy Handlers        │                    │
│               └───────────────────────────────────┘                    │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Chrome Storage (Local)                        │  │
│  │  Groups | Posts | Templates | Queue | History | Logs | Settings  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```text
src/
├── types/                     # Strict TypeScript interfaces
│   ├── group.ts               # Group data model & validation
│   ├── post.ts                # Post fields & template types
│   ├── queue.ts               # Queue item & state machine states
│   ├── ai.ts                  # Provider interfaces & prompt payloads
│   ├── history.ts             # Permanent history records
│   ├── log.ts                 # Diagnostic log records
│   ├── settings.ts            # Extension configurations & backup payload
│   └── messages.ts            # Runtime messaging contracts
│
├── services/                  # Business logic (isolated from UI)
│   ├── storage/               # Typed chrome.storage.local wrapper
│   │   └── chrome-storage.ts  # Fallback to in-memory/localStorage for preview
│   ├── queue/                 # State machine & queue engine
│   │   ├── state-machine.ts   # Deterministic transitions & validation
│   │   └── queue-engine.ts    # Queue ordering, history syncing, stats
│   ├── ai/                    # Multi-provider AI engine
│   │   ├── provider-interface.ts
│   │   ├── openai-provider.ts # OpenAI & compatible endpoints (Groq, Ollama)
│   │   ├── gemini-provider.ts # Google Gemini REST API
│   │   ├── custom-provider.ts # User-defined HTTP API
│   │   └── ai-service.ts      # Facade and dispatcher
│   ├── facebook/              # Isolated DOM selector abstraction
│   │   ├── selectors/         # Resilient Facebook DOM selectors
│   │   ├── detectors/         # Page readiness & Group URL/ID extractor
│   │   └── adapters/          # Non-invasive UI helpers
│   ├── template/              # Variable replacement engine
│   │   └── template-engine.ts # {product_name}, {price}, etc.
│   ├── csv/                   # CSV tokenizer, parser, and exporter
│   ├── backup/                # JSON backup exporter and reconciler
│   ├── webhook/               # Optional outbound webhooks
│   └── logger/                # Structured diagnostic logging
│
├── components/                # Modular React components
│   ├── common/                # Button, Card, Badge, Modal, Toast, ConfirmModal
│   ├── layout/                # Sidebar, Header, DashboardLayout
│   ├── Dashboard/             # Metric cards, active queue progress, history feed
│   ├── Groups/                # Groups table, single/bulk modals, CSV import preview
│   ├── Composer/              # Post form, template selector, image gallery
│   ├── AI/                    # Tone/style tuner, quick transforms, streaming
│   ├── Queue/                 # Queue table, reordering, status indicators
│   ├── History/               # Filterable audit log, CSV/JSON export
│   ├── Logs/                  # Diagnostic console stream
│   ├── Templates/             # Reusable post templates with variable pills
│   ├── Settings/              # Tabbed configurations (AI, Queue, Facebook, Storage)
│   └── Onboarding/            # First-launch wizard & demo data loader
│
├── pages/                     # Extension entry points
│   ├── dashboard/             # Full SaaS tab application
│   ├── popup/                 # Compact browser toolbar popup
│   └── options/               # Options redirect to dashboard
│
├── background/                # Service Worker
│   └── service-worker.ts      # Queue coordination, tab management, notifications
│
└── content/                   # Content Script
    └── facebook-content.ts    # Group page detector & Shadow DOM floating dock
```

---

## 3. Queue State Machine Architecture

The posting queue is governed by an immutable state machine ([`src/services/queue/state-machine.ts`](file:///d:/facboock%20grup%20atumaition/src/services/queue/state-machine.ts)) to prevent inconsistent or out-of-order state transitions:

```text
              ┌─────────┐
              │ PENDING │
              └────┬────┘
                   │
                   ▼
              ┌─────────┐
              │  READY  │
              └────┬────┘
                   │
                   ▼
           ┌──────────────┐
           │ IN_PROGRESS  │◄────────────┐
           └───────┬──────┘             │
                   │                    │ Retry
                   ▼                    │
        ┌───────────────────┐           │
        │ WAITING_FOR_USER  │           │
        └───┬───────────┬───┘           │
            │           │               │
  User posts│           │ User skips    │
            ▼           ▼               │
       ┌─────────┐ ┌─────────┐     ┌────┴───┐
       │ POSTED  │ │ SKIPPED │     │ FAILED │
       └─────────┘ └─────────┘     └────────┘
```

- **Atomic Storage Updates**: Each state transition updates both the queue list and records a corresponding `HistoryRecord` in `chrome.storage.local`.
- **Zero Race Conditions**: Reordering and state transitions return new immutable copies of the queue collection before persistence.

---

## 4. Modular AI Provider Abstraction

The AI engine implements the `IAIProvider` interface:

```typescript
export interface IAIProvider {
  name: string;
  generateCaption(context: AIPromptContext, config: AIProviderConfig): Promise<AICompletionResult>;
  transformCaption(
    operation: AIOperation,
    currentCaption: string,
    context: AIPromptContext,
    config: AIProviderConfig
  ): Promise<AICompletionResult>;
}
```

- **OpenAI Provider**: Standard `/chat/completions` protocol. Works with official OpenAI API, Groq, OpenRouter, Together AI, or local Ollama.
- **Gemini Provider**: Google Generative Language REST API (`/v1beta/models/{model}:generateContent`).
- **Custom Provider**: Standard POST payload with customizable authorization headers.

---

## 5. Facebook Content Script & Shadow DOM Encapsulation

To guarantee that Facebook's high-frequency DOM mutations and aggressive global CSS stylesheets do not break the extension:
1. **Isolated Shadow DOM**: The helper panel is mounted into a ShadowRoot (`mode: "open"`).
2. **Zero Global CSS Leakage**: All styling for the helper dock is scoped strictly within the shadow container.
3. **Clipboard API with Legacy Fallback**: Text copy operations use `navigator.clipboard.writeText` with an in-page `document.execCommand('copy')` fallback for restrictive iframe or security boundaries.
4. **Resilient Selectors**: Does not rely on fragile randomized CSS classes (`x1n2onr6`, etc.). Extracts group identifiers from canonical OpenGraph meta tags, `h1` semantic containers, and URL paths.

---

## 6. Runtime Messaging Protocol

All extension layers communicate via typed messages defined in [`src/types/messages.ts`](file:///d:/facboock%20grup%20atumaition/src/types/messages.ts):

| Message Type | Direction | Purpose |
| :--- | :--- | :--- |
| `START_QUEUE` | UI → Background | Starts queue runner from first ready item. |
| `PAUSE_QUEUE` | UI / Content → Background | Pauses the active queue session. |
| `RESUME_QUEUE` | UI → Background | Resumes execution of the paused queue. |
| `STOP_QUEUE` | UI → Background | Halts queue and resets active indicators. |
| `MARK_AS_POSTED` | Content / UI → Background | Confirms user manual post, logs history, runs pacing delay, opens next tab. |
| `SKIP_CURRENT_ITEM` | Content / UI → Background | Marks item as skipped and advances queue. |
| `FB_PAGE_DETECTED` | Content → Background | Notifies background that a Facebook group page is ready. |
| `GET_ACTIVE_POST_FOR_TAB` | Content → Background | Requests prepared post details and queue progress for the open group. |
| `OPEN_DASHBOARD` | Popup / Content → Background | Opens or focuses the full SaaS dashboard tab. |
Working