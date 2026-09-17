import { useState, useCallback } from 'react';
import { useCrudList } from '@/hooks/useCrudList';
import { supabase } from '@/lib/supabase';
import { StructuralGap, QuestionState, Character, Relationship, PlotEvent, WorldLocation, WorldLaw, WorldRecord } from '@/lib/types';
import { GAP_TYPES, QUESTION_LAYERS, QUESTION_STATUSES } from '@/lib/constants';
import { Badge, EmptyState, ConfirmDelete, Modal, Field } from '@/components/ui/Field';
import { AlertTriangle, Plus, Trash2, CheckCircle, HelpCircle, Filter } from 'lucide-react';

interface GapsViewProps {
  projectId: string | null;
}

export function GapsView({ projectId }: GapsViewProps) {
  const { items: gaps, loading, create, update, remove } = useCrudList<StructuralGap>('structural_gaps', projectId);
  const { items: questions, create: createQ, update: updateQ, remove: removeQ } = useCrudList<QuestionState>('question_state', projectId);
  const [tab, setTab] = useState<'gaps' | 'questions'>('gaps');
  const [filter, setFilter] = useState<string>('all');
  const [showAddGap, setShowAddGap] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Data density scan
  const [characters, setCharacters] = useState<Character[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [plotEvents, setPlotEvents] = useState<PlotEvent[]>([]);
  const [locations, setLocations] = useState<WorldLocation[]>([]);
  const [laws, setLaws] = useState<WorldLaw[]>([]);
  const [records, setRecords] = useState<WorldRecord[]>([]);

  const scanDensity = useCallback(async () => {
    if (!projectId) return;
    const [chars, rels, events, locs, lws, recs] = await Promise.all([
      supabase.from('characters').select('*').eq('project_id', projectId),
      supabase.from('relationships').select('*').eq('project_id', projectId),
      supabase.from('plot_events').select('*').eq('project_id', projectId),
      supabase.from('world_locations').select('*').eq('project_id', projectId),
      supabase.from('world_laws').select('*').eq('project_id', projectId),
      supabase.from('world_records').select('*').eq('project_id', projectId),
    ]);
    setCharacters((chars.data as Character[]) || []);
    setRelationships((rels.data as Relationship[]) || []);
    setPlotEvents((events.data as PlotEvent[]) || []);
    setLocations((locs.data as WorldLocation[]) || []);
    setLaws((lws.data as WorldLaw[]) || []);
    setRecords((recs.data as WorldRecord[]) || []);
  }, [projectId]);

  const autoDetectGaps = useCallback(async () => {
    if (!projectId) return;
    await scanDensity();
    const newGaps: { gap_type: string; description: string; severity: string; data: Record<string, unknown> }[] = [];

    // Filler scenes
    plotEvents.forEach((event) => {
      if (!event.data.consequenceTypes || event.data.consequenceTypes.length === 0) {
        newGaps.push({
          gap_type: 'filler_scene',
          description: `Event "${event.description.slice(0, 60)}" has no consequence type — produces no goal/resource/understanding shift.`,
          severity: 'medium',
          data: { event_id: event.id },
        });
      }
    });

    // Empty character atoms
    characters.forEach((char) => {
      const d = char.data;
      if (!d.theLie && !d.theTruth && !d.theWound) {
        newGaps.push({
          gap_type: 'empty_atom',
          description: `Character "${char.name}" has no Lie/Truth/Wound data — the core emotional architecture is empty.`,
          severity: 'high',
          data: { character_id: char.id, layer: 'character' },
        });
      }
    });

    // Missing refusal period
    const pillars = await supabase.from('plot_pillars').select('*').eq('project_id', projectId);
    const inciting = (pillars.data as any[])?.find((p) => p.pillar_type === 'inciting_incident');
    const pp1 = (pillars.data as any[])?.find((p) => p.pillar_type === 'plot_point_1');
    if (inciting && pp1 && !inciting.data?.refusalPeriod) {
      newGaps.push({
        gap_type: 'missing_refusal',
        description: 'Inciting Incident has no refusal period — protagonist may go from disruption to commitment too easily.',
        severity: 'medium',
        data: {},
      });
    }

    // Sag detection
    const midpoint = (pillars.data as any[])?.find((p) => p.pillar_type === 'midpoint');
    if (pp1 && midpoint) {
      const eventsBetween = plotEvents.filter((e) => e.pillar_id);
      const hasUnderstandingShift = eventsBetween.some(
        (e) => e.data.consequenceTypes?.includes('Understanding Shift'),
      );
      if (!hasUnderstandingShift && plotEvents.length > 3) {
        newGaps.push({
          gap_type: 'sag',
          description: 'No Understanding Shift logged between PP1 and Midpoint — risk of a sag in Act Two.',
          severity: 'medium',
          data: {},
        });
      }
    }

    // Disconnected All Is Lost
    const pp2 = (pillars.data as any[])?.find((p) => p.pillar_type === 'plot_point_2');
    if (pp2 && !pp2.data?.connectionToGhost) {
      newGaps.push({
        gap_type: 'disconnected_all_is_lost',
        description: 'All Is Lost does not connect to character Ghost — the emotional logic of the arc may be broken.',
        severity: 'high',
        data: {},
      });
    }

    // Empty world
    if (locations.length === 0 && laws.length === 0 && records.length === 0) {
      newGaps.push({
        gap_type: 'empty_atom',
        description: 'No world objects created — locations, laws, and records are all empty.',
        severity: 'medium',
        data: { layer: 'world' },
      });
    }

    // Insert new gaps (avoid duplicates)
    for (const gap of newGaps) {
      const exists = gaps.some((g) => g.description === gap.description && !g.resolved);
      if (!exists) {
        await create(gap);
      }
    }
  }, [projectId, scanDensity, plotEvents, characters, locations, laws, records, gaps, create]);

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-pulse text-ink-400">Loading...</div></div>;

  const filteredGaps = filter === 'all' ? gaps : gaps.filter((g) => g.gap_type === filter);
  const openGaps = gaps.filter((g) => !g.resolved);
  const resolvedGaps = gaps.filter((g) => g.resolved);

  return (
    <div className="max-w-4xl mx-auto px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-ink-800 mb-1">Gap Report</h2>
          <p className="text-ink-400">Continuously scans all layers, scores gaps, and tracks the question queue.</p>
        </div>
        <button className="btn btn-primary" onClick={autoDetectGaps}>
          <AlertTriangle className="w-4 h-4" />
          Auto-Detect Gaps
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-ink-100 rounded-lg p-1 w-fit">
        <button
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === 'gaps' ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}
          onClick={() => setTab('gaps')}
        >
          Gaps ({openGaps.length})
        </button>
        <button
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === 'questions' ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}
          onClick={() => setTab('questions')}
        >
          Questions ({questions.filter((q) => q.status === 'pending').length})
        </button>
      </div>

      {tab === 'gaps' && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-ink-400" />
            <select className="select !w-auto !py-1.5 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All types ({gaps.length})</option>
              {GAP_TYPES.map((gt) => {
                const count = gaps.filter((g) => g.gap_type === gt.value).length;
                return count > 0 ? <option key={gt.value} value={gt.value}>{gt.label} ({count})</option> : null;
              })}
            </select>
          </div>

          <button className="btn btn-secondary mb-4" onClick={() => setShowAddGap(true)}>
            <Plus className="w-4 h-4" /> Add Gap Manually
          </button>

          {filteredGaps.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<CheckCircle className="w-full h-full" />}
                title={openGaps.length === 0 ? "No open gaps" : "No gaps match this filter"}
                message={openGaps.length === 0 ? "Run auto-detect to scan all layers for structural issues, or add a gap manually." : "Try a different filter."}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGaps.map((gap) => {
                const gapMeta = GAP_TYPES.find((gt) => gt.value === gap.gap_type);
                return (
                  <div key={gap.id} className={`card p-4 ${gap.resolved ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          {gapMeta && <Badge color={gapMeta.color}>{gapMeta.label}</Badge>}
                          <Badge color={gap.severity === 'high' ? 'error' : gap.severity === 'medium' ? 'warning' : 'ink'}>
                            {gap.severity}
                          </Badge>
                          {gap.resolved && <Badge color="success">Resolved</Badge>}
                        </div>
                        <p className="text-sm text-ink-600">{gap.description}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!gap.resolved && (
                          <button
                            className="btn btn-ghost !p-1.5"
                            title="Mark resolved"
                            onClick={() => update(gap.id, { resolved: true })}
                          >
                            <CheckCircle className="w-4 h-4 text-sage-600" />
                          </button>
                        )}
                        <button
                          className="btn btn-ghost !p-1.5"
                          title="Delete"
                          onClick={() => { setDeleteId(gap.id); setShowDelete(true); }}
                        >
                          <Trash2 className="w-4 h-4 text-error-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Modal
            open={showAddGap}
            onClose={() => setShowAddGap(false)}
            title="Add Gap"
            footer={
              <>
                <button className="btn btn-secondary" onClick={() => setShowAddGap(false)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const sel = document.getElementById('gap-type-select') as HTMLSelectElement;
                    const desc = document.getElementById('gap-desc') as HTMLTextAreaElement;
                    const sev = document.getElementById('gap-sev') as HTMLSelectElement;
                    if (sel && desc && desc.value) {
                      create({ gap_type: sel.value, description: desc.value, severity: sev.value, data: {} });
                      setShowAddGap(false);
                    }
                  }}
                >
                  Add
                </button>
              </>
            }
          >
            <div>
              <label className="label">Gap Type</label>
              <select id="gap-type-select" className="select">
                {GAP_TYPES.map((gt) => <option key={gt.value} value={gt.value}>{gt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea id="gap-desc" className="textarea" rows={3} placeholder="Describe the gap..." />
            </div>
            <div>
              <label className="label">Severity</label>
              <select id="gap-sev" className="select">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </Modal>
        </>
      )}

      {tab === 'questions' && (
        <>
          <button className="btn btn-secondary mb-4" onClick={() => setShowAddQuestion(true)}>
            <Plus className="w-4 h-4" /> Add Question
          </button>

          {questions.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<HelpCircle className="w-full h-full" />}
                title="No questions queued"
                message="The question engine asks one question per turn, grounded in your story material. Add questions you want to track or answer."
              />
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge color="ink">{QUESTION_LAYERS.find((l) => l.value === q.layer)?.label || q.layer}</Badge>
                      <Badge color={q.status === 'answered' ? 'success' : q.status === 'pending' ? 'warning' : 'ink'}>
                        {q.status}
                      </Badge>
                    </div>
                    <button
                      className="btn btn-ghost !p-1"
                      onClick={() => { setDeleteId(q.id); setShowDelete(true); }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-error-500" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-ink-700 mb-2">{q.question_text}</p>
                  {q.answer && <p className="text-sm text-ink-500 bg-ink-50 rounded-lg p-3 mt-2">{q.answer}</p>}
                  <div className="flex items-center gap-2 mt-3">
                    <select
                      className="select !w-auto !py-1 text-xs"
                      value={q.status}
                      onChange={(e) => updateQ(q.id, { status: e.target.value })}
                    >
                      {QUESTION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input
                      className="input !py-1 text-xs flex-1"
                      placeholder="Quick answer..."
                      defaultValue={q.answer}
                      onBlur={(e) => updateQ(q.id, { answer: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <Modal
            open={showAddQuestion}
            onClose={() => setShowAddQuestion(false)}
            title="Add Question"
            footer={
              <>
                <button className="btn btn-secondary" onClick={() => setShowAddQuestion(false)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const layer = document.getElementById('q-layer') as HTMLSelectElement;
                    const text = document.getElementById('q-text') as HTMLTextAreaElement;
                    if (text && text.value) {
                      createQ({ layer: layer.value, question_id: crypto.randomUUID(), question_text: text.value, status: 'pending', answer: '', data: {} });
                      setShowAddQuestion(false);
                    }
                  }}
                >
                  Add
                </button>
              </>
            }
          >
            <div>
              <label className="label">Layer</label>
              <select id="q-layer" className="select">
                {QUESTION_LAYERS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Question</label>
              <textarea id="q-text" className="textarea" rows={3} placeholder="What do you want to explore?" />
            </div>
          </Modal>
        </>
      )}

      <ConfirmDelete
        open={showDelete}
        onClose={() => { setShowDelete(false); setDeleteId(null); }}
        onConfirm={() => { if (deleteId) remove(deleteId); }}
        itemName="this item"
      />
    </div>
  );
}
