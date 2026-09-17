# Volume 7 — The Question Engine

## What This Volume Is

Volumes 1-6 specify what the system knows. This volume specifies **how it
behaves**. The Question Engine conducts every conversation, decides what to
ask, builds the database, and keeps the writer engaged session after
session. This is the platform's active intelligence.

## THE BEHAVIORAL CONSTITUTION (non-negotiable)

- One question per turn, always
- Ground every question in the writer's own story material once any exists
- Follow the answer before the queue
- Leapfrog between topics via associative bridges — no abrupt 180s
- Read writer energy and adjust depth accordingly
- Follow any writer override immediately and completely
- Feed creative flow states (tangents) rather than redirecting
- Raise contradictions as curiosity, once, at the right moment
- Never repeat a question already answered
- Never force an answer — every question skippable / "I don't know yet" is valid
- Stated is ground truth; inferred/speculative are hypotheses until confirmed
- Confirm naturally, woven into conversation, never as a list
- Theme is offered, not asserted (see Vol 5)

---

## 2. Data Confidence Tiers

| Level | Definition | How Set | How Used |
|---|---|---|---|
| **Stated** | Writer said it directly | Clear direct statement | Full trust — used everywhere, including output generation |
| **Inferred** | AI derived it from what was said | AI extracted a logical implication | Internal use only (gap prioritization). Requires confirmation to upgrade to stated. |
| **Speculative** | AI identified a pattern with no direct/implied support | AI detected recurring element, absence, or structural implication across multiple stated data points | Used only to generate confirmation questions. Never in output. Lowest queue priority. |

### Confirmation Protocol

| Writer Response | System Action |
|---|---|
| Confirms | Upgraded to stated; usable in all downstream operations |
| Corrects | Original inference deleted; correction stored as stated; original never revisited |
| Ignores/defers | Stays at current level; not re-asked this session; downgraded one tier if avoided across multiple sessions (inferred→speculative) |
| Explicitly declines | Marked writer-declined; removed from confirmation queue; not raised again unless writer reintroduces the topic |

> Confirmation example: "You mentioned earlier that X hasn't spoken to her
> father in years — I'm reading that as a wound she's been carrying a long
> time. Is that close, or something different for her?" — woven into
> conversation naturally, never a checklist.

### Confidence Degradation
- Stated → Inferred: new info directly contradicts a previously stated
  fact; original flagged (not deleted) until resolved
- Inferred → Speculative: unconfirmed across 2+ sessions, or new data makes
  it less certain
- Speculative → Deleted: explicitly contradicted/declined, or unconfirmed
  across 5+ sessions

---

## 3. Component One — The Session Manager

### Cold Start (First Session)
- Database is empty — goal is creative flow + first anchors, not comprehensive extraction
- AI introduces itself behaviorally (asks a question), not procedurally (no "here's what I'll do")
- Success threshold: at least one named character, one conflict/tension, one image/feeling
- Any answer is the right answer

Opening question types (select based on what feels natural, not a fixed script):
- "Tell me about the story you keep meaning to write."
- "Is there a character you've been thinking about for a long time?"
- "What's the image or moment your story starts from for you?"
- "What's the feeling you want someone to have when they finish reading it?"
- "Is there something you've always wanted to write about but haven't found the right way in yet?"

### Returning Writer
- Review database state since last session
- Open with something that feels like **memory**, not a log readout
  - e.g. "Last time you were working out what Marcus actually wants from X
    — did anything come to you on that?"
- If significant time has passed: open with re-engagement ("Where are you
  with the story right now?") before diving into gaps — gives writer space
  to redirect if their thinking shifted
- Surface unaddressed contradictions naturally via leapfrog if opportunity arises

### Session Close
- Never abrupt — close with a brief reflection or one thing the AI is
  curious about for next time (creates anticipation without pressure)
- Write session summary to DB: topics covered, data added per confidence
  tier, gaps opened/closed, contradictions flagged
- Log questions asked (prevent repetition next session)
- Save interrupted threads for natural return
- Note writer energy at close — informs next session's opening

### Session State Object
- Questions asked this session
- Topics touched this session
- Current thread
- Interrupted threads
- Writer energy signal (high/medium/low)
- Volunteer data queue
- Confirmation queue (priority-ordered)

---

## 4. Component Two — The Gap Analyzer

Continuously scans all 6 layers, scores gaps, maintains the dynamic queue.
Re-runs after every answer.

### Gap Types
| Type | Description |
|---|---|
| Empty atom | Required field, no data at any confidence |
| Thin atom | Data present but insufficient depth/specificity |
| Contradicted atom | Stated data conflicts with other stated data — highest urgency |
| Unconfirmed atom | Inferred/speculative data pending confirmation |
| Orphaned atom | References an object that doesn't exist yet |
| Inferred gap | Pattern-recognition gap (unresolved subplot, inconsistent motif, missing transformation point) |

### Gap Scoring — Priority Factors
| Factor | Logic |
|---|---|
| Layer criticality | Character/Plot > Style/Sensory in early/mid sessions; equalizes late |
| Downstream dependency | Gaps blocking many other atoms score higher |
| Contradiction flag | Max urgency, but surfaced at right conversational moment, not immediately |
| Session recency | Recently-touched topics score lower — give breathing room |
| Database density | Low density → broad gaps score higher; high density → specific gaps |
| Writer expressed interest | Volunteered topics score higher — follow energy over queue |
| Confidence level | Contradicted > empty > thin; unconfirmed scores per underlying layer criticality |

### The Gap Queue
- Dynamic — reordered after every answer
- Cross-layer — never locked to one layer
- Session-filtered — remove all questions asked this session
- Energy-adjusted — deprioritize deep/complex gaps when energy is low
- Confirmation-separated — unconfirmed items held in a parallel queue

---

## 5. Component Three — The Question Generator

### The Grounding Rule
Every question uses the writer's own story material once any stated data
exists. Generic questions ONLY during true cold start.

> Generic: "How does your protagonist handle conflict?"
> Grounded: "X has just found out Marcus has been lying to her for months —
> does she confront him immediately, or go quiet and wait?"

### Question Depth Calibration
| Database State | Question Type | Example |
|---|---|---|
| Empty | Broad and open | "Tell me about the story you keep meaning to write." |
| Sparse | General but anchored | "You mentioned X — what does she actually want?" |
| Moderate | Specific and targeted | "X wants the inheritance but also her father's approval — what happens when those conflict?" |
| Dense | Surgical | "When Marcus confronts X in Act 2, is he angrier about the lie, or what it tells him about how X sees him?" |

### Question Construction Rules
- One question per turn — absolute
- Never ask what can be inferred — confirm gently instead of asking from scratch
- Never ask for labels ("what genre is this?") — ask about effects instead
  ("does your world have rules most characters can't break?")
- Prefer "what happens when..." over "describe..."
- Prefer specific over abstract ("what does X do when scared?" not "how
  does X handle fear?")
- Broad questions are valid early
- Always leave room for "I don't know yet"
- Avoid binary "or" framing unless both options are genuinely equivalent paths

### Leapfrog Construction
Find an associative bridge in the previous answer; use it as the stepping
stone — never announce the jump.

| Bridge Type | How It Works |
|---|---|
| Character mention | Writer mentions someone in passing → AI follows to a question about that character |
| Emotional connection | An emotion expressed about one element bridges to a related layer |
| Implied detail | Answer implies something about a different part of the story |
| Contrast bridge | "She always stays calm" bridges to "what breaks that calm?" |
| Contradiction surface | New answer creates tension with existing data → leapfrog to gentle clarification |

---

## 6. Component Four — The Answer Processor

### Extraction Categories
| Category | Definition | Confidence Assigned |
|---|---|---|
| Direct data | Explicit statements | Stated |
| Implied data | Logically inferable facts | Inferred — needs confirmation |
| Pattern data | AI-identified pattern across multiple stated points | Speculative — needs confirmation |
| Emotional data | Writer's investment/feeling about what they describe | Not stored as story data — adjusts gap queue priority & energy signal |
| Volunteer data | Info offered beyond what was asked | Stated for direct content — high-priority follow-up flag |

### Volunteer Data Protocol
- Stored at stated confidence for direct content
- Immediately elevated to top of gap queue
- Next question follows the volunteer thread before returning to queue
- If multiple new gaps open, follow the one with the most energy, not
  highest priority score

### Contradiction Detection Protocol
| Severity | Handling |
|---|---|
| Minor | Stored and monitored; surfaced only if recurring or relevant downstream |
| Moderate | Stored as flagged contradiction; surfaced via leapfrog at a natural moment within the session |
| Critical | (core character atom, pillar connection, or cross-layer link — esp. PP2/Wound) Max urgency; surfaced as soon as a natural bridge appears, within 1-2 exchanges |

> Framing: "I want to make sure I've got this right — earlier you said X,
> but what you just described sounds more like Y. Which is closer?" If
> dismissed, store as intentional, never raise again.

### Gap Update After Answer
- Close gaps for filled atoms
- Open new gaps from new references/implications/structural positions
- Reprioritize via energy signal + volunteer data
- Update confirmation queue

---

## 7. Component Five — The Conversation Controller

### The Decision Loop (runs after every processed answer)

| Step | Check | If True |
|---|---|---|
| 1 | Volunteer data present? | Follow it immediately. Skip remaining steps. |
| 2 | Critical contradiction unaddressed? | If natural bridge exists, surface now; else defer one more exchange |
| 3 | Writer energy low? | Select broader/simpler question; skip leapfrog construction |
| 4 | Natural leapfrog available? | Construct leapfrog toward highest-priority accessible gap |
| 5 | No leapfrog available? | Find highest priority gap, construct best available bridge |
| 6 | Confirmation queue has high priority + good energy + no leapfrog? | Ask a confirmation question |

### Writer Energy Detection
| Signal | High Energy | Low Energy |
|---|---|---|
| Response length | Long, detailed, elaborated | Short, clipped, minimal |
| Spontaneous content | Adds unprompted detail/threads | Answers only what's asked |
| Language texture | Specific, vivid, engaged | "I'm not sure," "maybe," "haven't thought about this" |
| Story confidence | Speaks as if story is real | Speaks as if still hypothetical |

Response: High → deeper/specific questions, follow volunteer data
aggressively, don't close session. Medium → standard queue. Low → broader
simpler questions, more affirming framing, consider gentle close if
persists 3+ exchanges.

### Override Handling
- Current thread stored as interrupted (not lost)
- AI drops what it was building toward — no "we'll come back to that"
- Ask a good opening question in the new territory immediately
- Interrupted thread may return via natural leapfrog later — never forced/announced
- If new topic has no data, treat as a cold thread (broad first question)

### The Tangent Protocol
- A writer spontaneously describing a scene/moment in vivid detail = flow state
- Ask deepening/extending questions, not redirects
- Extract and store everything — tangent content is often the most valuable
- Return to queue only when tangent naturally exhausts itself
- Never interrupt a tangent for a queued question
