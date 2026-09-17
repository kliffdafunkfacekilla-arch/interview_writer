# Volume 3 — Plot Layer

## Core Principle

**Action without consequence is filler.** Every event is only structurally
meaningful if it alters the protagonist's goal, resources, or understanding.

### Three Consequence Types
- **Goal Shift** — what protagonist is trying to achieve changes direction/scope/motivation
- **Resource Shift** — allies, tools, knowledge, trust, time, safety gained or lost
- **Understanding Shift** — what protagonist believes about conflict/self/world changes

A scene that produces none of these is flagged.

## Two Operational Modes

| Mode | Behavior | Trigger |
|---|---|---|
| **Accumulation** | Stores events/consequences/actions without structural labels. No pillar assignments, no subplot ID. Listens and builds. | Default at session start |
| **Pattern Recognition** | Infers structure: pillar candidates, subplot threads, consequence chains, structural gap flags | Sufficient database density |

> Resist premature classification. Accumulate first, infer only when
> density justifies confidence.

## The Plot Event Object (base unit, accumulation mode)

- Event ID
- Description (plain language)
- Characters involved (refs)
- Consequence type — Goal/Resource/Understanding (multiple or none)
- Consequence description — what changed, for whom
- Emotional weight — low/medium/high
- Timeline position — approximate, refined later
- Pillar assignment — empty until Pattern Recognition; inferred not declared
- Subplot tag — unassigned until main spine identified
- Filler flag — raised if no consequence type present

## The Five Structural Pillars

Each pillar object references plot events functioning in that role. Each
pillar has a **backward check** (is the section leading in doing its job?)
and a **forward check** (does it set up what follows correctly?). A pillar
that passes backward but fails forward is correctly placed but pointed at
the wrong thing.

### 4.1 Inciting Incident
- Referenced plot event(s)
- Normal world description — what existed before
- Nature of disruption — external event / internal realization / arrival of
  a person / sudden loss
- Initial protagonist response — engagement or refusal
- Refusal period — exists? how long? what sustains it?
- Bridge to PP1 — what finally forces engagement
- Backward check: sufficient normal-world establishment?
- Forward check: introduces the conflict the Climax must resolve?

### 4.2 Plot Point 1 — Break into Act Two
- Nature of the choice — what protagonist commits to
- Point of no return marker
- Comfort zone left behind
- New world entered
- Reactive→proactive shift — how it manifests
- Backward check: was Refusal period sufficient, or too easy?
- Forward check: does new world create conditions for Midpoint?

### 4.3 Midpoint
- Type — revelation / false victory / false defeat / major loss / major gain
- Stakes escalation — specifically how stakes change
- Old coping mechanism retired
- New understanding gained
- Backward check (**sag detection**): Understanding Shift logged between
  PP1 and Midpoint? If not → sag flag.
- Forward check: does new understanding set up All Is Lost?

### 4.4 Plot Point 2 — All Is Lost
- What is lost — mentor/ally/tool/hope/identity
- **Connection to Ghost** — does this loss trace back to character's wound?
  (CRITICAL cross-layer link — see below)
- Lie confronted — false belief no longer sustainable
- Truth now available
- Dark Night texture — internal experience
- Backward check: is the loss proportional/earned?
- Forward check: does Truth-now-available provide what's needed for Climax?

> **CRITICAL CROSS-LAYER LINK**: If the thing lost at All Is Lost does not
> trace back to the character's Ghost (Vol 1), the emotional logic of the
> arc is broken. Check automatically and flag if absent.

### 4.5 Climax
- Antagonistic force confronted (ref)
- Truth applied — how the All Is Lost lesson is deployed
- Core conflict loop closed — confirms resolution of Inciting Incident's conflict
- Internal change proven
- Resolution type — victory / pyrrhic victory / tragic failure / ambiguous
- Backward check: does protagonist arrive with the right tools/understanding?
- Forward check: stable new status quo, or intentional unresolved tension?

## Consequence Tracking (scene-level)

- Scene ID reference
- Pre-scene state — goal/resources/understanding before
- Post-scene state — goal/resources/understanding after
- Delta — what changed, for whom
- **Filler flag** — raised when pre/post identical across all 3 types
- Escalation check — raising stakes vs previous scene?
- Consequence chain — links to next scene referencing same resource/goal/understanding

> The filler flag is one of the most immediately useful outputs — a writer
> who can see which scenes have zero consequence has actionable info.

## Subplot Objects

**Not declared by writer — inferred by system** from consequence patterns
once main spine is identified. Threads with most significant
goal/resource/understanding impact = main plot. Everything else orbits as
subplots, each running a compressed five-pillar structure.

- Subplot ID
- Characters driving it (refs)
- Relationship cluster reference (if applicable, see Vol 2)
- Inferred from — plot event IDs that triggered identification
- Compressed pillar map
- Intersection points — where it collides with/redirects/amplifies main plot
- Subplot arc type — Growth/Unification, Deterioration/Tragic, Shifting Power
- Resolution dependency — independent / dependent on main plot / deliberately open
- Weight classification — major (all 5 compressed pillars) / minor (≤3) / recurring motif

> Inference process: as consequence chains are mapped, threads emerge
> (same characters, same goal shifts, own escalation pattern). When dense
> enough, flag as subplot candidate and ask writer to confirm/dismiss.

## Structural Gap Flags

| Flag Type | Description / AI Behavior |
|---|---|
| Filler Scene | No consequence across all 3 types. Ask: cut, revise, or intentional breathing room? |
| Sag | No Understanding Shift between PP1 and Midpoint. Ask what's changing in this stretch. |
| Missing Refusal Period | Inciting Incident → PP1 with no resistance. Ask if intentional. |
| Disconnected All Is Lost | Loss doesn't trace to Ghost. **High priority**, cross-layer ref to Character. |
| Open Loop | Climax doesn't resolve Inciting Incident's conflict. Ask if intentional ambiguity. |
| Orphaned Subplot | Subplot building with no resolution point. Ask how/when it closes. |
| Misaligned Pillar | Passes backward check, fails forward. Present both setup and what it sets up; ask writer to assess. |

## Cross-Layer Connections

| Connection | Direction | What Is Shared |
|---|---|---|
| Character — Lie/Truth/Wound | Bidirectional | PP2 must connect to Ghost; Climax must deploy Truth — checked automatically |
| Character — Arc Type | Plot reads Character | Arc type constrains valid Climax resolution types |
| Relationships — Cluster Objects | Relationships → Plot | Cluster tensions surface as subplot drivers |
| Relationships — Iceberg | Relationships → Plot | Root conflicts often = true stakes of plot confrontations |
| Timeline Layer | Plot → Timeline | Pillar positions and event placements feed Timeline |
| Theme Layer | Plot → Theme | Inciting Incident nature + Climax lesson = primary theme raw material |
| Chapter Draft System | Plot → Output | Pillar positions, consequence chains, gap flags injected into chapter prompts |
