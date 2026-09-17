# Volume 2 — Relationships Layer

## Core Principle

A relationship is **not a property of either character** — it's an
independent object referencing two or more character objects. Character
profiles store relationship IDs; relationship objects live in their own
table/layer.

**Mutuality is not required.** A relationship object requires emotional
investment from at least one party. Asymmetry (in awareness, investment, or
power) is data, not an edge case. A character's obsession with a stranger,
grief over a dead parent, or relationship to their city — all are
relationship objects, same schema, same weight.

## Relationship Object Schema

### Identity
- Unique ID — independent object
- Parties — references to 2+ character objects (one party may be
  non-human: a place, memory, idea, addiction)
- Relationship type — romantic, familial, professional, mentorship,
  rivalry, adversarial, found family, parasocial, symbolic
- Origin — founding moment/condition
- Reciprocity level — fully mutual, asymmetric, entirely one-sided

### Narrative Function (can hold multiple)
| Function | Definition | Story Use |
|---|---|---|
| **Foil** | Contrasts directly with protagonist to highlight traits. Doesn't require enmity. | Makes protagonist's qualities visible by contrast |
| **Mirror** | Shares background/flaw/goal but makes a different moral choice | Externalizes protagonist's internal fork in the road |
| **Catalyst** | Pushes protagonist out of comfort zone, challenges their Lie | Drives inciting incident or major turning points |
| **Anchor** | Represents normal world / moral baseline | Stakes made human; cost of failure given a face |

### Dynamic
- Power balance — who holds leverage and why
- Visibility of imbalance — acknowledged by both, or invisible to one/both
- Emotional investment per party — intensity and nature
- What each party wants from the other (may be entirely different things)
- What each party believes the relationship is (may not match reality or each other)
- Background friction — constant low-level tension even during alliance

> **Design note**: The gap between what each party believes the
> relationship is and what it actually is may be the richest source of
> dramatic irony. Track and surface this gap actively.

### The Iceberg
| Level | Definition |
|---|---|
| Surface Conflict | Immediate, visible, plot-driven disagreement |
| Root Conflict | Ideological/emotional truth beneath the surface |
| The Unsaid Thing | What both parties know but neither speaks — often the most important atom in the object |
| Background Friction | Constant low-level tension even in harmonious moments |

### History
- Founding moment
- Defining moments — key scenes that shifted the dynamic
- The wound between them — specific damage/betrayal/unresolved rupture
- What has never been said
- Shared history assets — experiences, secrets, losses, triumphs unique to this relationship

### Arc
| Arc Type | Description | Classic Shape |
|---|---|---|
| Growth/Unification | Start at odds/strangers, build trust, end stronger together | Reluctant allies, enemies to lovers |
| Deterioration/Tragic | Start close, torn apart by competing goals/betrayal/ideology | Siblings on opposite sides of a conflict |
| Shifting Power | Bond remains, authority/capability flips | Apprentice surpassing the master |

Additional arc atoms:
- Emotional fortune curve — relationship's own Vonnegut shape
- Starting state, transformation points, end state (repaired/destroyed/transformed/open)
- Cost — what the arc takes from each party

### Asymmetry Tracking (high-priority for question generation)
- Awareness gap — does one party understand the relationship more clearly
- Investment gap — does one party care significantly more
- Information gap — something one party knows, other doesn't
- Power shift moments — specific leverage-change points
- Perception gap — what each believes the relationship is, vs each other, vs reality

> **Highest priority question in the system**: "What has never been said
> between these two characters?" — ask early, revisit after major story
> developments.

## Multi-Party Relationship Clusters

3+ interlocking characters = each bilateral pair stored as its own
relationship object (standard schema), PLUS a cluster object.

### Cluster Object Schema
- Member relationship IDs (all bilateral pairs in cluster)
- Cluster type — love triangle, alliance under strain, power struggle,
  family system, ensemble dynamic
- System-level tension — pressure from the combination, not present in any
  individual relationship
- Subplot/conflict designation — cluster is its own story object with a
  plot function
- Cluster arc — how the system evolves independent of any single relationship
- Resolution — how the cluster resolves

> A well-constructed cluster creates pressure none of the individual
> relationships can relieve. Characters can resolve bilateral relationships
> but still be trapped by the system.

## Non-Human Relationship Objects

Same schema applies. Non-human party = symbolic character object with no
arc of its own. The fact that it cannot respond/act/change is itself a
dramatic fact — track as an asymmetry atom.

| Non-Human Party Type | Dramatic Function |
|---|---|
| A dead person's memory | Cannot evolve from the other side. Grief/guilt/idealization = asymmetry atoms |
| A place | Cannot want anything back — projection IS the relationship |
| Addiction/compulsion | Has its own wants/costs/iceberg — treat as character with destructive function |
| Ideology/belief | Devotion to or loss of faith in — its arc is the character's arc |
| Their own creative work | Common in artist narratives — mirror, wound, catalyst simultaneously |

## Question Engine Notes (Relationship-Specific)

### Priority
- High — "What has never been said between these two?" (early, revisit often)
- High — Surface vs root conflict identification for every significant relationship
- High — Asymmetry detection (awareness/investment/information gaps)
- Medium — Narrative function assignment
- Medium — Arc type + transformation point mapping
- Lower — Origin/founding moment detail (fill in later)

### Contradiction triggers
- Emotionally closed-off character shows warmth/openness in a scenario
- Arc type contradicts stated end state
- Surface and root conflict are identical (relationship may lack depth)
- "Fully mutual" reciprocity but investment-gap data shows asymmetry

### Grounded scenario construction (progression example)
| Stage | Example |
|---|---|
| Early | "What's the thing that happened between X and Y that neither talks about?" |
| Mid | "When Marcus confronts X about the lie — angrier about the lie, or what it means X thinks of him?" |
| Late | "What's the exact moment one of them finally says the thing they've been not saying?" |

## Cross-Layer Connections

| System | How Relationship Data Is Used |
|---|---|
| Plot Layer | Relationship arcs become subplot structure; cluster tensions drive act-level conflict |
| Emotional Fingerprint | Relationship history = raw material for grounded scenarios |
| Voice Capture | Relationship dynamics inform how characters speak to each other specifically |
| Theme Layer | Root conflicts across relationships often reveal central moral question |
| Chapter Draft System | Iceberg/asymmetry data injected into scene prompts for automatic subtext |
| Contradiction Engine | Character behavior checked against relationship dynamics, not just individual profiles |
