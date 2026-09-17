# Volume 1 — Character Layer

## Core Principle

A story fact is only meaningful in relation to a framework slot it fills —
or conspicuously doesn't fill. The database stores answers tagged to
positions/atoms, with empty slots surfacing as question triggers.

## 4.1 Identity

- Name and aliases
- Age / life stage
- Physical appearance — defining features, not exhaustive
- Gender / sexuality, where narratively relevant
- Social role — occupation, class, position in world
- Archetype — hero, mentor, trickster, shadow, threshold guardian, foil, catalyst
- Perceived-vs-actual — how others see them vs how they actually are

## 4.2 Inner World — The Lie/Truth/Wound Trinity

These three are stored and queried as a **linked cluster**. Inconsistency
between them is flagged.

- **The Lie** — false belief held about self or world
- **The Truth** — what they must accept (may never arrive in tragic arcs)
- **The Wound** — past event that created the Lie
- **The Ghost** — how the wound haunts present behavior, unrecognized
- **Want** — conscious goal being pursued
- **Need** — what's actually required to be whole
- **Fear** — what they're running from
- **Flaw** — behavioral expression of the Lie
- **Strength** — what makes them capable/compelling
- **Moral code** — what they will/won't do, where the line bends under pressure

## 4.3 Transformation

- Arc type — Positive (Change), Negative (Fall/Tragedy), or Flat (Steadfast)
- Personal emotional shape — own Vonnegut fortune curve, independent of main plot
- Catalyst — what first cracks the Lie
- Resistance — how they fight the incoming truth
- Turning point — moment they can no longer avoid confronting it
- Resolution — who they are at the end
- Cost — what transformation takes from them

## 4.4 Key Relationships (references only)

Full relationship objects live in Vol 2. This layer stores references:

- Role in protagonist's journey — ally, antagonist, mirror, foil, catalyst
- Dynamic — power balance, emotional tone, shared history
- Tension/unresolved conflict
- How relationship changes across arc
- What each party wants from the other

## 4.5 Visual Identity

- Signature visual element — color/object/recurring image
- Physical transformation across arc
- Symbolic objects carried, lost, or gained
- How they occupy physical space — expansive, small, still, restless

## 4.6 Sub-Arc Tracking

For significant secondary characters:

- Personal Vonnegut shape, independent of main plot
- Entry point — where personal arc begins
- Exit point — resolved, unresolved, or deliberately ambiguous
- Intersection points — where this arc collides with/redirects the protagonist's

## Voice Capture System

Voice is demonstrated, not described. AI presents **grounded situational
prompts** (using the writer's own characters/world, not generic
hypotheticals) and the writer responds as the character or describes their
behavior.

### Prompt categories
- **Conflict** — told they're wrong; needs something from someone with power
  over them; must deliver bad news to someone they care about
- **Casual/Unguarded** — killing time alone; making a stranger comfortable;
  genuinely excited — how do they show it
- **Under Pressure** — scared but must appear calm; furious but can't show
  it; caught off guard, needs to recover
- **Intimate** — trying to say something vulnerable; someone they love is
  hurting; alone with guard fully down

### Extracted patterns (stored as character data)
- Vocabulary register (formal/casual/clipped/expansive)
- Emotional directness (says what they feel / deflects / masks)
- Humor as defense mechanism (yes/no/situational)
- Default mode under pressure (control/collapse/deflect/attack)
- Vulnerability handling (lean in/shut down/humor/anger)
- Subtext patterns — what they consistently don't say
- Signature constructions/phrases

These feed: contradiction detection (character acting "off-voice") and the
chapter draft generation layer.

## Emotional Fingerprint System

Builds a behavioral map via **grounded scenarios constructed from the
writer's own story material** — not generic hypotheticals. Cannot run until
sufficient world/character data exists to construct grounded scenarios.
Presented 4-5 at a time, conversationally.

### Response format — two-part
Every response captured as: **internal feeling** → **external behavior**
(e.g., "fear and shame" → "makes themselves scarce, becomes invisible").
The gap between feeling and behavior IS the character — this is subtext.

### Scenario template categories (populate with real story data before presenting)
- **Social** — surprise party, public praise, witnessing humiliation,
  meeting someone more successful, being ignored, unexpected confidence
- **Pressure & Conflict** — authority figure furious nearby, asked to act
  against values, caught in a small lie, two loved ones fighting, about to
  fail someone depending on them
- **Intimate & Vulnerable** — alone after exhausting event, unexpected "I
  love you", compliment about an insecurity, can't answer a direct
  question, façade seen through
- **Loss & Joy** — finds object from painful past, public failure of hard
  work, sudden pure happiness, respected person reveals a flaw
- **Moral & Edge** — could get away with dishonesty for gain, helping
  someone vulnerable costs them personally, witnessing injustice with risk
  to intervene, given credit for something they didn't do

### Contradiction detection
When a response contradicts an established pattern, raise as soft curiosity:
"That response felt different from what I'd expect from X — is this a side
of them only [Y] brings out, or should I update how I understand them?"
