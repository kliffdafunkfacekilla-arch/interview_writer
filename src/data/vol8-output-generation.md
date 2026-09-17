# Volume 8 — Output Generation

## Core Principle

This is the payoff layer. Outputs are generated from **confirmed, stated
data only**. The system never generates ahead of what the writer has
actually built. Every output reflects the true current state of the
database — including its gaps, shown explicitly rather than papered over.

> **Pipeline Principle**: Each step is both a complete output in its own
> right AND a quality gate to the next step. The writer can stop at any
> stage. No step is mandatory. No step is offered until its data threshold
> is met. The AI never generates plausible-sounding content from thin
> data — that's worse than no output.

## The Six-Step Pipeline

| Step | Output | What It Gives the Writer | Primary Sources |
|---|---|---|---|
| 1 | Outline | Structural spine — pillars, subplots, consequence chains, gap flags | Plot, Character |
| 2 | Timeline | Chronological sequence — events, pillar positions, world state snapshots | Plot, World, Relationships |
| 3 | Chapter & Scene List | Story broken into scenes assigned to chapters with structural roles | Plot, Character, Relationships |
| 4 | Chapter Scaffolding | One page per chapter — what it does, what changes, whose interiority | All layers |
| 5 | Chapter Briefs | Scene-level beat maps — beats, subtext, sensory palette, voice notes | All layers (dense) |
| 6 | Full Draft | AI-assisted first-pass prose per chapter, in the writer's own voice | All layers (confirmed) |

## Living Documents

All outputs are living documents:
- **Stale flag** — any output section whose underlying data changed since
  generation is flagged
- **Dependency map** — each output knows exactly which atoms generated it;
  changes trigger stale flags on relevant sections only
- **Selective refresh** — refresh one stale section without regenerating the whole output
- **Version history** — retained so writer can see story evolution
- **Gap flags inline** — outputs show their own gaps explicitly (e.g. "X's
  Wound atom is empty — needed to strengthen this")

> **Never invent, always flag.** "X's motivation in this scene is unclear —
> need more on her Want atom" is useful. An invented motivation gives the
> writer something to react against that isn't their story.

---

## STEP 1 — The Outline

### Contains
- Five structural pillars, each with referenced plot events, backward
  check result, forward check result
- Subplot threads with compressed pillar maps and intersection points
- Main consequence chain (goal/resource/understanding shifts, full story)
- Gap flags inline at point of relevance
- Cross-layer alerts (esp. PP2/Character Wound connection)
- Framework overlay — which story frameworks the data maps to (reference, not constraint)

### Data Gate
**Brief mode**: ≥3 of 5 pillars identified · ≥1 named character with stated
Inner World data · ≥1 consequence chain with 3+ linked events · no
unresolved critical contradictions in Plot layer

**Full/Draft-track**: all 5 pillars identified+confirmed · main consequence
chain complete (Inciting Incident → Climax) · ≥1 subplot identified+mapped ·
protagonist arc type confirmed

### Format
Hierarchical doc. Main spine top-level, subplots as parallel collapsible
tracks. Gap flags inline, distinct visual treatment, link to the data needed
to resolve them.

---

## STEP 2 — The Timeline

### Contains
- All significant plot events in internal chronological order (not
  presentation order)
- Pillar positions marked
- Subplot threads as parallel tracks with intersections marked
- World state snapshots at each pillar
- Relationship arc transformation points placed on timeline
- Dual-track view (internal chronology vs presentation order) for non-linear stories
- Gap flags — timeline gaps, events without consequence data, orphaned refs

### Data Gate
**Brief**: Outline at brief standard · ≥10 plot events with timeline
positions · world state at story open stated · ≥2 subplot threads identified

**Full**: Outline at full standard · all pillar events have timeline
positions · world state snapshots at all 5 pillars stated · all subplot
intersections mapped

### Non-Linear Stories
Internal chronology built FIRST; presentation order is a layer applied on
top. System tracks what the reader knows at each point in presentation
order — enables dramatic irony / revelation mapping.

---

## STEP 3 — Chapter & Scene List

First time the story has actual pages. Every significant scene = discrete object.

### Contains (per scene)
- Scene ID and working title
- Chapter assignment
- Structural role — pillar/subplot beat, or connective tissue
- Characters present (refs)
- Consequence type (Goal/Resource/Understanding)
- Filler flag if no consequence identified
- POV character
- Timeline position
- Estimated length (short/medium/long, inferred from structural weight)

### Data Gate
**Brief**: Timeline at brief standard · ≥15 plot events with scene-level
detail · POV mode confirmed · chapter structure philosophy stated

**Full**: Timeline at full standard · all pillar scenes have full
consequence data · all characters per scene confirmed · no orphaned scene refs

---

## STEP 4 — Chapter Scaffolding

One page per chapter — what a writer reads before opening a blank document.

### Contains
- Chapter number/working title
- Opening condition (goal/resources/understanding at start)
- Closing condition (what changed by end)
- Structural role (pillar/subplot beat)
- POV character + narrative distance
- Emotional shape (this chapter's Vonnegut curve in isolation)
- Key scenes with consequence types
- Active relationship dynamics in this chapter
- World atmosphere of primary location
- Voice register notes
- **What this chapter must do** (single most important thing)
- **What this chapter must not do** (pitfalls given structural position)
- Unresolved gaps with links to fill them

### Data Gate
**Brief**: Chapter & Scene List complete · opening/closing conditions
derivable from consequence chain · POV character confirmed · primary
location has basic atmosphere data

**Full**: all scenes in chapter have full consequence data · voice profile
confirmed · all active relationship dynamics stated · emotional shape data
available for this chapter's arc segment

---

## STEP 5 — Chapter Briefs

Scene-level beat maps — "shot list" to the scaffold's "screenplay."

### Contains
- Scene-by-scene beat breakdown
- Subtext map (say vs mean, from relationship iceberg data)
- Sensory palette for this scene
- Active motifs (present or deliberately absent)
- Dialogue register notes per character present
- **The iceberg moment** — exchange where surface/root conflict diverge most
- The scene's single job
- Entry/exit beats at sentence level
- Transition note to next scene
- Data sourced from — transparency on which atoms fed this brief

### Data Gate
**Brief**: Chapter Scaffolding complete for this chapter · relationship
iceberg data stated for all active relationships in scene · location
sensory profile stated · voice profiles confirmed for all POV characters

**Full**: all beat-level consequence data stated · all active motifs
confirmed · dialogue register confirmed for all characters in scene ·
subtext map derivable from stated relationship root conflict data

---

## STEP 6 — Full Draft

AI-generated first-pass prose, one chapter at a time. NOT the writer's
prose — raw material built entirely from the writer's own data, in their
voice, for revision/reshaping/rejection.

> **The Draft Promise**: every sentence is traceable to something the
> writer built. Voice ← Voice Capture. Character behavior ← Inner World +
> Emotional Fingerprint. Dialogue ← Voice Profile + relationship dynamics.
> Sensory texture ← World + Visual layers. Nothing invented, everything derived.

### Data Gate — THE HIGHEST BAR IN THE SYSTEM

**All required:**
- Chapter Brief complete for this chapter
- Voice profile confirmed (stated confidence)
- POV mode + narrative distance confirmed
- All present characters have confirmed Inner World data
- All active relationship dynamics stated
- World atmosphere for primary location stated
- Sensory palette confirmed
- No unresolved critical contradictions touching this chapter

**Any of these disqualifies:**
- Any character in scene has unconfirmed Lie or Need
- Voice profile built from fewer than 4 confirmed voice prompts
- Relationship iceberg data for an active relationship is speculative
- Unresolved critical contradiction in PP2/Character Wound connection
- Primary location has no stated sensory data
- Scene consequence type unidentified

### When Gate Not Met
System tells writer exactly what's missing, offers:
1. **Fill the gaps** — targeted session on missing data, then re-evaluate
2. **Generate a Brief instead** — gives writer what they need to write it themselves

The gap report names each missing item specifically and links to the
question that would fill it. It's a map, not a wall.

### Draft Generation Protocol
- One chapter at a time, never the full manuscript in one pass
- Writer reviews each chapter before next is offered (accept / revise / reject)
- Revision notes processed as new data — improve subsequent chapters
- Rejected chapters trigger gap analysis → targeted questions before regenerating
- Accepted chapters locked — not regenerated unless explicitly requested
- Cross-chapter continuity checking against accepted previous chapters
  (voice, character behavior, world detail)

### Injection Map — what feeds each draft prompt
| Injected Data | Source Layer |
|---|---|
| Voice profile (register, sentence energy, density, emotional temperature) | Style & Prose — Voice Profile |
| POV mode, narrative distance, tense | Style & Prose — POV |
| Character Inner World data (all present) | Character — Inner World |
| Emotional Fingerprint responses (all present) | Character — Emotional Fingerprint |
| Active relationship dynamics + iceberg data | Relationships — Dynamic/Iceberg |
| Scene beat map + subtext map | Output — Chapter Brief |
| World atmosphere + location sensory profile | World — Locations + Visual |
| Active motifs | Meaning & Resonance — Symbols & Motifs |
| Emotional shape of this chapter | Meaning & Resonance — Emotional Architecture |
| Opening/closing conditions | Output — Chapter Scaffolding |
| Dialogue register per character | Style & Prose — Dialogue Register |
| Previously accepted chapter prose (continuity) | Output — Manuscript to date |

---

## Reference Outputs (on-demand, any stage)

| Output | Contents | Minimum Data |
|---|---|---|
| Character Profile | Full summary — Identity, Inner World, Transformation, Relationships, Voice, Visual Identity | Identity + ≥3 stated Inner World atoms |
| Relationship Map | All relationship objects — dynamics, arc types, iceberg, asymmetry | ≥3 relationship objects with stated dynamic data |
| World Reference Sheet | Laws, locations, historical records, power architecture | ≥5 world atoms across ≥2 object types |
| Meaning Summary | Central question, moral argument, confirmed motifs, master emotional shape | ≥1 confirmed theme inference + derivable master Vonnegut shape |
| Gap Report | Full prioritized gap list across all layers, with the question that fills each | Available anytime |

## Writer Control

- Any output requestable anytime regardless of gate — system generates what
  it can, flags what's missing
- Any atom manually editable directly — dependent outputs update accordingly
- Any output rejectable — not regenerated unprompted
- **Writer-lock** — mark any atom as locked; never asked about again, never flagged as gap
- Gap Report requestable anytime
- Reference outputs requestable anytime
- Output generation pauseable entirely — stay in conversation mode indefinitely

## The Complete Journey

| Phase | Stage | What's Happening |
|---|---|---|
| Early | First sessions | Cold start, broad questions, DB begins filling, characters emerge |
| Early | Accumulation | Question Engine builds Character/Relationship density; Voice Capture + Emotional Fingerprint begin |
| Mid | Pattern recognition | Gap Analyzer infers plot structure; pillar candidates surface; Outline available |
| Mid | Structural deepening | Timeline + Chapter List generated; full story shape visible; structural gaps addressable |
| Mid | Layer completion | World, Theme, Style fill in; reference outputs become rich |
| Late | Scaffolding | Chapter Scaffolding + Briefs generated chapter by chapter; some writers stop here |
| Late | Drafting | Draft gates met chapter by chapter; AI generates prose; writer revises |
| Final | First draft complete | All chapters accepted/revised, continuity checked |
