
# Collaborative Whiteboard – Agent & Schema Summary

## Philosophy
This project is Codex-first and learning-oriented. All decisions favor explicit reasoning, minimal abstraction, and protocol clarity over convenience or vibes.

---

## Agent Model (Summary)

### Architecture Agent
Owns system boundaries, scaling strategy, and Yjs partitioning. Resolves cross-agent conflicts. Does not touch UI or rendering.

### Realtime Collaboration Agent
Owns Yjs schema usage, awareness protocol, and sync lifecycle. Responsible for correctness of CRDT updates and reconnect behavior.

### Frontend Canvas Agent
Owns rendering loop, cursor smoothing, and performance. Consumes Yjs updates but never mutates schema.

### Backend Systems Agent
Owns Express + WebSocket runtime, room lifecycle, and scaling. Implements transport only, not CRDT logic.

### Security Agent
Owns auth, rate limiting, payload validation, and abuse prevention. No influence over UX or schema.

### DX Agent
Owns repo structure, docs, scripts, and logging. Ensures clarity and learnability.

---

## Contracts (Condensed)

- Each agent has FINAL authority only in its domain.
- Agents may not cross-write decisions outside their contract.
- Schema changes require Architecture + Realtime approval.
- Rendering logic never mutates CRDT state.
- Backend never interprets canvas semantics.

---

## Yjs Canvas Schema (Authoritative)

Location:
src/collaboration/schema/yjs-canvas.schema.md

### Root
- meta: Y.Map
- layers: Y.Map
- strokes: Y.Map
- pixels: Y.Map

### Rules
- No UI or derived state in Yjs
- Awareness is ephemeral and never persisted
- Flat keys for hot paths (pixels)
- Batch updates for performance

---

## Learning Rules (Critical)

1. Codex writes protocol-heavy code.
2. You must read, rewrite, and annotate.
3. Every Codex file requires a human-written note.
4. If you cannot explain the file without looking, you are vibing.

---

## Repo Intent

This repository is designed to demonstrate:
- CRDT mastery
- Realtime system reasoning
- Explicit architectural ownership
- Learn-by-building discipline

This is not a demo.
This is a systems project.
