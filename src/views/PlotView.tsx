import { useState, useEffect, useCallback } from 'react';
import { useCrudList } from '@/hooks/useCrudList';
import { supabase } from '@/lib/supabase';
import {
  PlotEvent,
  PlotPillar,
  PillarData,
  Subplot,
  PlotEventData,
  Character,
} from '@/lib/types';
import { CONSEQUENCE_TYPES, EMOTIONAL_WEIGHTS } from '@/lib/constants';
import { PILLAR_METAS } from '@/lib/types';
import { Field, Section, EmptyState, ConfirmDelete, Badge } from '@/components/ui/Field';
import {
  GitBranch,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  TrendingDown,
  Swords,
  Flag,
  Layers,
} from 'lucide-react';
import { LayerShell } from '@/components/LayerShell';

const COLD_START = [
  "What happens in your story — not the plot, the thing that changes everything?",
  "What's the moment your story pivots on?",
  "Where does your story start — what's the normal world before things change?",
  "What's the worst thing that happens — the moment everything falls apart?",
];

interface PlotViewProps {
  projectId: string | null;
}

const PILLAR_ICONS: Record<string, typeof Sparkles> = {
  inciting_incident: Sparkles,
  plot_point_1: ArrowRight,
  midpoint: RefreshCw,
  plot_point_2: TrendingDown,
  climax: Swords,
};

export function PlotView({ projectId }: PlotViewProps) {
  const { items: events, loading, create, update, remove, reload: reloadEvents } = useCrudList<PlotEvent>('plot_events', projectId);
  const { items: pillars, update: updatePillar, reload: reloadPillars } = useCrudList<PlotPillar>('plot_pillars', projectId);
  const { items: subplots, create: createSubplot, update: updateSubplot, remove: removeSubplot, reload: reloadSubplots } =
    useCrudList<Subplot>('subplots', projectId);
  const [tab, setTab] = useState<'pillars' | 'events' | 'subplots'>('pillars');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedSubplotId, setSelectedSubplotId] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);

  const loadCharacters = useCallback(async () => {
    if (!projectId) return;
    const { data } = await supabase.from('characters').select('*').eq('project_id', projectId).order('created_at');
    setCharacters((data as Character[]) || []);
  }, [projectId]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;
  const selectedSubplot = subplots.find((s) => s.id === selectedSubplotId) || null;

  const handleCreateEvent = async () => {
    const created = await create({
      description: 'New plot event',
      data: {},
      timeline_position: '',
      emotional_weight: 'medium',
      filler_flag: false,
      sort_order: events.length,
    });
    if (created) setSelectedEventId(created.id);
  };

  const updateEventData = (field: keyof PlotEventData, value: string | string[]) => {
    if (!selectedEvent) return;
    const newData = { ...selectedEvent.data, [field]: value };
    update(selectedEvent.id, { data: newData });
  };

  const toggleConsequence = (type: string) => {
    if (!selectedEvent) return;
    const current = selectedEvent.data.consequenceTypes || [];
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    updateEventData('consequenceTypes', next);
  };

  if (loading || !projectId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-ink-400">Loading plot...</div>
      </div>
    );
  }

  const manualView = (
    <div className="max-w-4xl mx-auto px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-semibold text-ink-800 mb-1">Plot</h2>
        <p className="text-ink-400 text-sm">Five structural pillars, plot events with consequence tracking, and inferred subplots.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-ink-100 rounded-lg p-1 w-fit">
        {(['pillars', 'events', 'subplots'] as const).map((t) => (
          <button
            key={t}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'
            }`}
            onClick={() => setTab(t)}
          >
            {t} ({t === 'pillars' ? pillars.length : t === 'events' ? events.length : subplots.length})
          </button>
        ))}
      </div>

      {/* PILLARS TAB */}
      {tab === 'pillars' && (
        <div className="space-y-4">
          {PILLAR_METAS.map((meta) => {
            const pillar = pillars.find((p) => p.pillar_type === meta.type);
            if (!pillar) return null;
            const Icon = PILLAR_ICONS[meta.type] || Sparkles;
            const data = pillar.data;
            const updateField = (field: string, value: string) => {
              const newData = { ...data, [field]: value };
              updatePillar(pillar.id, { data: newData });
            };

            return (
              <details key={pillar.id} className="card p-5" open={meta.type === 'inciting_incident'}>
                <summary className="cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-ink-100 flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5 text-ink-600" style={{ width: 18, height: 18 }} />
                    </div>
                    <div>
                      <h3 className="section-title">{meta.label}</h3>
                      <p className="text-xs text-ink-400">{meta.description}</p>
                    </div>
                  </div>
                </summary>
                <div className="mt-4 field-group">
                  {meta.type === 'inciting_incident' && (
                    <>
                      <Field label="Normal World" value={data.normalWorld || ''} onChange={(v) => updateField('normalWorld', v)} type="textarea" placeholder="What existed before" />
                      <Field label="Nature of Disruption" value={data.natureOfDisruption || ''} onChange={(v) => updateField('natureOfDisruption', v)} type="textarea" placeholder="External event / internal realization / arrival / loss" />
                      <Field label="Initial Protagonist Response" value={data.initialResponse || ''} onChange={(v) => updateField('initialResponse', v)} placeholder="Engagement or refusal" />
                      <Field label="Refusal Period" value={data.refusalPeriod || ''} onChange={(v) => updateField('refusalPeriod', v)} type="textarea" placeholder="Exists? How long? What sustains it?" />
                      <Field label="Bridge to PP1" value={data.bridgeToPP1 || ''} onChange={(v) => updateField('bridgeToPP1', v)} type="textarea" placeholder="What finally forces engagement" />
                    </>
                  )}
                  {meta.type === 'plot_point_1' && (
                    <>
                      <Field label="Nature of the Choice" value={data.natureOfChoice || ''} onChange={(v) => updateField('natureOfChoice', v)} type="textarea" placeholder="What protagonist commits to" />
                      <Field label="Point of No Return" value={data.pointOfNoReturn || ''} onChange={(v) => updateField('pointOfNoReturn', v)} type="textarea" />
                      <Field label="Comfort Zone Left Behind" value={data.comfortZoneLeft || ''} onChange={(v) => updateField('comfortZoneLeft', v)} type="textarea" />
                      <Field label="New World Entered" value={data.newWorldEntered || ''} onChange={(v) => updateField('newWorldEntered', v)} type="textarea" />
                      <Field label="Reactive → Proactive Shift" value={data.reactiveToProactive || ''} onChange={(v) => updateField('reactiveToProactive', v)} type="textarea" placeholder="How it manifests" />
                    </>
                  )}
                  {meta.type === 'midpoint' && (
                    <>
                      <Field label="Type" value={data.midpointType || ''} onChange={(v) => updateField('midpointType', v)} placeholder="Revelation / false victory / false defeat / major loss / major gain" />
                      <Field label="Stakes Escalation" value={data.stakesEscalation || ''} onChange={(v) => updateField('stakesEscalation', v)} type="textarea" placeholder="Specifically how stakes change" />
                      <Field label="Old Coping Mechanism Retired" value={data.oldCopingRetired || ''} onChange={(v) => updateField('oldCopingRetired', v)} type="textarea" />
                      <Field label="New Understanding Gained" value={data.newUnderstanding || ''} onChange={(v) => updateField('newUnderstanding', v)} type="textarea" />
                    </>
                  )}
                  {meta.type === 'plot_point_2' && (
                    <>
                      <Field label="What Is Lost" value={data.whatIsLost || ''} onChange={(v) => updateField('whatIsLost', v)} type="textarea" placeholder="Mentor/ally/tool/hope/identity" />
                      <Field
                        label="Connection to Ghost"
                        value={data.connectionToGhost || ''}
                        onChange={(v) => updateField('connectionToGhost', v)}
                        type="textarea"
                        placeholder="Does this loss trace back to the character's wound? CRITICAL cross-layer link."
                        hint="If the thing lost at All Is Lost does not trace back to the character's Ghost, the emotional logic of the arc is broken."
                      />
                      <Field label="Lie Confronted" value={data.lieConfronted || ''} onChange={(v) => updateField('lieConfronted', v)} type="textarea" placeholder="False belief no longer sustainable" />
                      <Field label="Truth Now Available" value={data.truthNowAvailable || ''} onChange={(v) => updateField('truthNowAvailable', v)} type="textarea" />
                      <Field label="Dark Night Texture" value={data.darkNightTexture || ''} onChange={(v) => updateField('darkNightTexture', v)} type="textarea" placeholder="Internal experience" />
                    </>
                  )}
                  {meta.type === 'climax' && (
                    <>
                      <Field label="Antagonistic Force" value={data.antagonisticForce || ''} onChange={(v) => updateField('antagonisticForce', v)} type="textarea" />
                      <Field label="Truth Applied" value={data.truthApplied || ''} onChange={(v) => updateField('truthApplied', v)} type="textarea" placeholder="How the All Is Lost lesson is deployed" />
                      <Field label="Core Conflict Loop Closed" value={data.coreConflictLoopClosed || ''} onChange={(v) => updateField('coreConflictLoopClosed', v)} type="textarea" placeholder="Confirms resolution of Inciting Incident's conflict" />
                      <Field label="Internal Change Proven" value={data.internalChangeProven || ''} onChange={(v) => updateField('internalChangeProven', v)} type="textarea" />
                      <Field label="Resolution Type" value={data.resolutionType || ''} onChange={(v) => updateField('resolutionType', v)} placeholder="Victory / pyrrhic victory / tragic failure / ambiguous" />
                    </>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-ink-100">
                    <Field label="Backward Check" value={data.backwardCheck || ''} onChange={(v) => updateField('backwardCheck', v)} type="textarea" placeholder="Is the section leading in doing its job?" />
                    <Field label="Forward Check" value={data.forwardCheck || ''} onChange={(v) => updateField('forwardCheck', v)} type="textarea" placeholder="Does it set up what follows correctly?" />
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}

      {/* EVENTS TAB */}
      {tab === 'events' && (
        <>
          {!selectedEvent ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-ink-500">
                  {events.length} event{events.length !== 1 ? 's' : ''} ·{' '}
                  {events.filter((e) => e.filler_flag).length} flagged as filler
                </p>
                <button className="btn btn-primary" onClick={handleCreateEvent}>
                  <Plus className="w-4 h-4" />
                  New Event
                </button>
              </div>
              {events.length === 0 ? (
                <div className="card">
                  <EmptyState
                    icon={<GitBranch className="w-full h-full" />}
                    title="No plot events yet"
                    message="Every event is only structurally meaningful if it alters the protagonist's goal, resources, or understanding. Events with no consequence are flagged as filler."
                    action={
                      <button className="btn btn-primary" onClick={handleCreateEvent}>
                        <Plus className="w-4 h-4" />
                        Create Event
                      </button>
                    }
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      className="card card-hover p-4 text-left w-full"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink-700 line-clamp-2">{event.description}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {event.data.consequenceTypes?.map((t) => (
                              <Badge key={t} color="sage">
                                {t}
                              </Badge>
                            ))}
                            {!event.data.consequenceTypes?.length && <Badge color="warning">No consequence</Badge>}
                            {event.filler_flag && <Badge color="error">Filler</Badge>}
                            <span className="text-xs text-ink-400">{event.emotional_weight}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <button className="btn btn-ghost" onClick={() => setSelectedEventId(null)}>
                  <span className="text-sm">&larr; All Events</span>
                </button>
                <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>

              <div className="card p-6 mb-4">
                <Field
                  label="Description"
                  value={selectedEvent.description}
                  onChange={(v) => update(selectedEvent.id, { description: v })}
                  type="textarea"
                  placeholder="What happens in this event (plain language)"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Field
                    label="Timeline Position"
                    value={selectedEvent.timeline_position}
                    onChange={(v) => update(selectedEvent.id, { timeline_position: v })}
                    placeholder="Approximate, refined later"
                  />
                  <div>
                    <label className="label">Emotional Weight</label>
                    <select
                      className="select"
                      value={selectedEvent.emotional_weight}
                      onChange={(e) => update(selectedEvent.id, { emotional_weight: e.target.value })}
                    >
                      {EMOTIONAL_WEIGHTS.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <Section title="Consequence Tracking" description="A scene that produces no consequence is flagged as filler" defaultOpen>
                <div>
                  <label className="label">Consequence Types</label>
                  <div className="flex flex-wrap gap-2">
                    {CONSEQUENCE_TYPES.map((type) => {
                      const active = selectedEvent.data.consequenceTypes?.includes(type);
                      return (
                        <button
                          key={type}
                          onClick={() => toggleConsequence(type)}
                          className={`tag cursor-pointer transition-all ${
                            active ? 'bg-sage-100 text-sage-700 ring-1 ring-sage-300' : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                  {!selectedEvent.data.consequenceTypes?.length && (
                    <p className="text-xs text-warning-600 mt-2 flex items-center gap-1">
                      <Flag className="w-3 h-3" />
                      No consequence type — this event will be flagged as filler.
                    </p>
                  )}
                </div>
                <Field label="Consequence Description" value={selectedEvent.data.consequenceDescription || ''} onChange={(v) => updateEventData('consequenceDescription', v)} type="textarea" placeholder="What changed, for whom" />
                <Field label="Characters Involved" value={selectedEvent.data.charactersInvolved || ''} onChange={(v) => updateEventData('charactersInvolved', v)} type="textarea" placeholder="Character names or refs" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Pre-Scene State" value={selectedEvent.data.preSceneState || ''} onChange={(v) => updateEventData('preSceneState', v)} type="textarea" placeholder="Goal/resources/understanding before" />
                  <Field label="Post-Scene State" value={selectedEvent.data.postSceneState || ''} onChange={(v) => updateEventData('postSceneState', v)} type="textarea" placeholder="Goal/resources/understanding after" />
                </div>
                <Field label="Escalation Check" value={selectedEvent.data.escalationCheck || ''} onChange={(v) => updateEventData('escalationCheck', v)} type="textarea" placeholder="Raising stakes vs previous scene?" />
                <Field label="Consequence Chain" value={selectedEvent.data.consequenceChain || ''} onChange={(v) => updateEventData('consequenceChain', v)} type="textarea" placeholder="Links to next scene referencing same resource/goal/understanding" />
              </Section>

              <Section title="Pillar & Subplot Assignment">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Structural Pillar</label>
                    <select
                      className="select"
                      value={selectedEvent.pillar_id || ''}
                      onChange={(e) => update(selectedEvent.id, { pillar_id: e.target.value || null })}
                    >
                      <option value="">— None —</option>
                      {pillars.map((p) => (
                        <option key={p.id} value={p.id}>
                          {PILLAR_METAS.find((m) => m.type === p.pillar_type)?.label || p.pillar_type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Subplot</label>
                    <select
                      className="select"
                      value={selectedEvent.subplot_id || ''}
                      onChange={(e) => update(selectedEvent.id, { subplot_id: e.target.value || null })}
                    >
                      <option value="">— None (main plot) —</option>
                      {subplots.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Section>

              <ConfirmDelete
                open={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={() => {
                  remove(selectedEvent.id);
                  setSelectedEventId(null);
                }}
                itemName={selectedEvent.description.slice(0, 50) || 'this event'}
              />
            </>
          )}
        </>
      )}

      {/* SUBPLOTS TAB */}
      {tab === 'subplots' && (
        <>
          {!selectedSubplot ? (
            <>
              <button
                className="btn btn-primary mb-4"
                onClick={() => createSubplot({ label: 'New Subplot', data: {} }).then((s) => s && setSelectedSubplotId(s.id))}
              >
                <Plus className="w-4 h-4" />
                New Subplot
              </button>
              {subplots.length === 0 ? (
                <div className="card">
                  <EmptyState
                    icon={<Layers className="w-full h-full" />}
                    title="No subplots yet"
                    message="Subplots are inferred from consequence patterns once the main spine is identified. Threads with the most significant goal/resource/understanding impact form the main plot; everything else orbits as subplots."
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {subplots.map((sp) => (
                    <button
                      key={sp.id}
                      onClick={() => setSelectedSubplotId(sp.id)}
                      className="card card-hover p-5 text-left w-full"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif font-semibold text-ink-800">{sp.label}</h3>
                        {sp.data.weightClassification && <Badge color="teal">{sp.data.weightClassification}</Badge>}
                      </div>
                      {sp.data.charactersDriving && (
                        <p className="text-sm text-ink-500 mt-1">{sp.data.charactersDriving}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <button className="btn btn-ghost" onClick={() => setSelectedSubplotId(null)}>
                  <span className="text-sm">&larr; All Subplots</span>
                </button>
                <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>

              <div className="card p-6 mb-4">
                <Field label="Label" value={selectedSubplot.label} onChange={(v) => updateSubplot(selectedSubplot.id, { label: v })} />
              </div>

              <Section title="Subplot Details" defaultOpen>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Characters Driving" value={selectedSubplot.data.charactersDriving || ''} onChange={(v) => updateSubplotData(selectedSubplot, updateSubplot, 'charactersDriving', v)} type="textarea" placeholder="Character refs" />
                  <Field label="Relationship Cluster Ref" value={selectedSubplot.data.relationshipClusterRef || ''} onChange={(v) => updateSubplotData(selectedSubplot, updateSubplot, 'relationshipClusterRef', v)} placeholder="If applicable" />
                  <Field label="Inferred From" value={selectedSubplot.data.inferredFrom || ''} onChange={(v) => updateSubplotData(selectedSubplot, updateSubplot, 'inferredFrom', v)} type="textarea" placeholder="Plot event IDs that triggered identification" />
                  <Field label="Weight Classification" value={selectedSubplot.data.weightClassification || ''} onChange={(v) => updateSubplotData(selectedSubplot, updateSubplot, 'weightClassification', v)} placeholder="Major / minor / recurring motif" />
                  <Field label="Subplot Arc Type" value={selectedSubplot.data.subplotArcType || ''} onChange={(v) => updateSubplotData(selectedSubplot, updateSubplot, 'subplotArcType', v)} placeholder="Growth/Unification, Deterioration/Tragic, Shifting Power" />
                  <Field label="Resolution Dependency" value={selectedSubplot.data.resolutionDependency || ''} onChange={(v) => updateSubplotData(selectedSubplot, updateSubplot, 'resolutionDependency', v)} placeholder="Independent / dependent on main plot / deliberately open" />
                </div>
                <Field label="Compressed Pillar Map" value={selectedSubplot.data.compressedPillarMap || ''} onChange={(v) => updateSubplotData(selectedSubplot, updateSubplot, 'compressedPillarMap', v)} type="textarea" />
                <Field label="Intersection Points" value={selectedSubplot.data.intersectionPoints || ''} onChange={(v) => updateSubplotData(selectedSubplot, updateSubplot, 'intersectionPoints', v)} type="textarea" placeholder="Where it collides with/redirects/amplifies main plot" />
              </Section>

              <ConfirmDelete
                open={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={() => {
                  removeSubplot(selectedSubplot.id);
                  setSelectedSubplotId(null);
                }}
                itemName={selectedSubplot.label}
              />
            </>
          )}
        </>
      )}
    </div>
  );

  return (
    <LayerShell
      projectId={projectId}
      mode="plot"
      title="Plot"
      subtitle="Build the structural spine — pillars, events, and subplots"
      icon={<GitBranch className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
      accentColor="bg-indigo-100 dark:bg-indigo-900/30"
      coldStartQuestions={COLD_START}
      manualView={manualView}
      onDataExtracted={() => { reloadEvents(); reloadPillars(); reloadSubplots(); }}
    />
  );
}

function updateSubplotData(
  subplot: Subplot,
  updateFn: (id: string, updates: Record<string, unknown>) => Promise<void>,
  field: string,
  value: string,
) {
  const newData = { ...subplot.data, [field]: value };
  updateFn(subplot.id, { data: newData });
}
