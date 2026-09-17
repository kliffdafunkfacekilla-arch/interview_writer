import { useState, useEffect, useCallback } from 'react';
import { useCrudList } from '@/hooks/useCrudList';
import { supabase } from '@/lib/supabase';
import { Relationship, RelationshipData, RelationshipCluster, ClusterData, Character } from '@/lib/types';
import {
  RELATIONSHIP_TYPES,
  RECIPROCITY_LEVELS,
  NARRATIVE_FUNCTIONS,
  RELATIONSHIP_ARC_TYPES,
} from '@/lib/constants';
import { Field, Section, EmptyState, ConfirmDelete, Badge } from '@/components/ui/Field';
import { Heart, Plus, Trash2, Users, Link2 } from 'lucide-react';
import { LayerShell } from '@/components/LayerShell';

const COLD_START = [
  "Which two characters in your story have the most charged connection?",
  "Who in your story has a relationship that changes everything?",
  "Is there a relationship that's not what it seems on the surface?",
];

interface RelationshipsViewProps {
  projectId: string | null;
}

export function RelationshipsView({ projectId }: RelationshipsViewProps) {
  const { items: relationships, loading, create, update, remove, reload: reloadRels } = useCrudList<Relationship>(
    'relationships',
    projectId,
  );
  const { items: clusters, create: createCluster, update: updateCluster, remove: removeCluster } =
    useCrudList<RelationshipCluster>('relationship_clusters', projectId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'relationships' | 'clusters'>('relationships');
  const [showDelete, setShowDelete] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);

  const selected = relationships.find((r) => r.id === selectedId) || null;

  const loadCharacters = useCallback(async () => {
    if (!projectId) return;
    const { data } = await supabase
      .from('characters')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');
    setCharacters((data as Character[]) || []);
  }, [projectId]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const handleCreate = async () => {
    const created = await create({ label: 'New Relationship', data: {} });
    if (created) setSelectedId(created.id);
  };

  const updateData = (field: keyof RelationshipData, value: string) => {
    if (!selected) return;
    const newData = { ...selected.data, [field]: value };
    update(selected.id, { data: newData });
  };

  const updateLabel = (value: string) => {
    if (!selected) return;
    update(selected.id, { label: value });
  };

  const toggleFunction = (fn: string) => {
    if (!selected) return;
    const current = selected.data.narrativeFunctions || [];
    const next = current.includes(fn) ? current.filter((f) => f !== fn) : [...current, fn];
    updateData('narrativeFunctions', next as unknown as string);
  };

  if (loading || !projectId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-ink-400">Loading relationships...</div>
      </div>
    );
  }

  const manualView = (
    <div className="max-w-4xl mx-auto px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-ink-800 mb-1">Relationships</h2>
          <p className="text-ink-400 text-sm">Dynamics, iceberg, arc, asymmetry tracking.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-ink-100 rounded-lg p-1 w-fit">
        <button
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            tab === 'relationships' ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'
          }`}
          onClick={() => setTab('relationships')}
        >
          Relationships ({relationships.length})
        </button>
        <button
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            tab === 'clusters' ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'
          }`}
          onClick={() => setTab('clusters')}
        >
          Clusters ({clusters.length})
        </button>
      </div>

      {tab === 'relationships' && (
        <>
          {!selected && (
            <>
              {relationships.length === 0 ? (
                <div className="card">
                  <EmptyState
                    icon={<Heart className="w-full h-full" />}
                    title="No relationships yet"
                    message="Relationships are independent objects — not properties of either character. Create one to track dynamics, the iceberg, arcs, and asymmetry."
                    action={
                      <button className="btn btn-primary" onClick={handleCreate}>
                        <Plus className="w-4 h-4" />
                        Create Relationship
                      </button>
                    }
                  />
                </div>
              ) : (
                <>
                  <button className="btn btn-primary mb-4" onClick={handleCreate}>
                    <Plus className="w-4 h-4" />
                    New Relationship
                  </button>
                  <div className="space-y-3">
                    {relationships.map((rel) => (
                      <button
                        key={rel.id}
                        onClick={() => setSelectedId(rel.id)}
                        className="card card-hover p-5 text-left w-full"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif font-semibold text-ink-800">{rel.label}</h3>
                          {rel.data.relationshipType && <Badge color="rust">{rel.data.relationshipType}</Badge>}
                        </div>
                        {rel.data.parties && (
                          <p className="text-sm text-ink-500 mt-1">{rel.data.parties}</p>
                        )}
                        {rel.data.rootConflict && (
                          <p className="text-xs text-ink-400 mt-2 line-clamp-2">
                            <span className="font-medium">Root conflict:</span> {rel.data.rootConflict}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {selected && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button className="btn btn-ghost" onClick={() => setSelectedId(null)}>
                  <span className="text-sm">&larr; All Relationships</span>
                </button>
                <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>

              <div className="card p-6 mb-4">
                <Field label="Label" value={selected.label} onChange={updateLabel} placeholder="e.g. Marcus & Elena" />
              </div>

              <Section title="Identity" description="Parties, type, origin, reciprocity" defaultOpen>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Parties" value={selected.data.parties || ''} onChange={(v) => updateData('parties', v)} type="textarea" placeholder="The characters involved (names or refs)" />
                  <Field label="Relationship Type" value={selected.data.relationshipType || ''} onChange={(v) => updateData('relationshipType', v)} type="select" options={RELATIONSHIP_TYPES} />
                  <Field label="Origin" value={selected.data.origin || ''} onChange={(v) => updateData('origin', v)} type="textarea" placeholder="Founding moment/condition" />
                  <Field label="Reciprocity Level" value={selected.data.reciprocityLevel || ''} onChange={(v) => updateData('reciprocityLevel', v)} type="select" options={RECIPROCITY_LEVELS} />
                </div>
              </Section>

              <Section title="Narrative Function" description="Can hold multiple — foil, mirror, catalyst, anchor">
                <div className="flex flex-wrap gap-2">
                  {NARRATIVE_FUNCTIONS.map((fn) => {
                    const active = selected.data.narrativeFunctions?.includes(fn);
                    return (
                      <button
                        key={fn}
                        onClick={() => toggleFunction(fn)}
                        className={`tag cursor-pointer transition-all ${
                          active ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300' : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                        }`}
                      >
                        {fn}
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section title="Dynamic" description="Power, investment, wants, beliefs, friction" defaultOpen>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Power Balance" value={selected.data.powerBalance || ''} onChange={(v) => updateData('powerBalance', v)} type="textarea" placeholder="Who holds leverage and why" />
                  <Field label="Visibility of Imbalance" value={selected.data.visibilityImbalance || ''} onChange={(v) => updateData('visibilityImbalance', v)} placeholder="Acknowledged by both, or invisible to one/both" />
                  <Field label="Emotional Investment" value={selected.data.emotionalInvestment || ''} onChange={(v) => updateData('emotionalInvestment', v)} type="textarea" placeholder="Intensity and nature per party" />
                  <Field label="Background Friction" value={selected.data.backgroundFriction || ''} onChange={(v) => updateData('backgroundFriction', v)} type="textarea" placeholder="Constant low-level tension even during alliance" />
                  <Field label="Party A Wants" value={selected.data.partyAWants || ''} onChange={(v) => updateData('partyAWants', v)} type="textarea" placeholder="What one party wants from the other" />
                  <Field label="Party B Wants" value={selected.data.partyBWants || ''} onChange={(v) => updateData('partyBWants', v)} type="textarea" placeholder="What the other wants (may differ entirely)" />
                  <Field label="Party A Believes" value={selected.data.partyABelieves || ''} onChange={(v) => updateData('partyABelieves', v)} type="textarea" placeholder="What A believes the relationship is" />
                  <Field label="Party B Believes" value={selected.data.partyBBelieves || ''} onChange={(v) => updateData('partyBBelieves', v)} type="textarea" placeholder="What B believes the relationship is" />
                </div>
              </Section>

              <Section title="The Iceberg" description="Surface vs. root conflict — and the unsaid thing" defaultOpen>
                <Field label="Surface Conflict" value={selected.data.surfaceConflict || ''} onChange={(v) => updateData('surfaceConflict', v)} type="textarea" placeholder="Immediate, visible, plot-driven disagreement" />
                <Field label="Root Conflict" value={selected.data.rootConflict || ''} onChange={(v) => updateData('rootConflict', v)} type="textarea" placeholder="Ideological/emotional truth beneath the surface" />
                <Field
                  label="The Unsaid Thing"
                  value={selected.data.theUnsaidThing || ''}
                  onChange={(v) => updateData('theUnsaidThing', v)}
                  type="textarea"
                  placeholder="What both parties know but neither speaks — often the most important atom"
                  hint="Highest priority question in the system: What has never been said between these two?"
                />
                <Field label="Iceberg Friction" value={selected.data.icebergFriction || ''} onChange={(v) => updateData('icebergFriction', v)} type="textarea" placeholder="Constant low-level tension even in harmonious moments" />
              </Section>

              <Section title="History" description="Founding, defining moments, the wound between them">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Founding Moment" value={selected.data.foundingMoment || ''} onChange={(v) => updateData('foundingMoment', v)} type="textarea" />
                  <Field label="Defining Moments" value={selected.data.definingMoments || ''} onChange={(v) => updateData('definingMoments', v)} type="textarea" placeholder="Key scenes that shifted the dynamic" />
                  <Field label="The Wound Between Them" value={selected.data.woundBetweenThem || ''} onChange={(v) => updateData('woundBetweenThem', v)} type="textarea" placeholder="Specific damage/betrayal/unresolved rupture" />
                  <Field label="What Has Never Been Said" value={selected.data.neverSaid || ''} onChange={(v) => updateData('neverSaid', v)} type="textarea" placeholder="Revisit after major story developments" />
                  <Field label="Shared History Assets" value={selected.data.sharedHistoryAssets || ''} onChange={(v) => updateData('sharedHistoryAssets', v)} type="textarea" placeholder="Experiences, secrets, losses, triumphs unique to this relationship" />
                </div>
              </Section>

              <Section title="Arc" description="How the relationship evolves">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Arc Type" value={selected.data.arcType || ''} onChange={(v) => updateData('arcType', v)} type="select" options={RELATIONSHIP_ARC_TYPES} />
                  <Field label="Emotional Fortune Curve" value={selected.data.emotionalFortuneCurve || ''} onChange={(v) => updateData('emotionalFortuneCurve', v)} placeholder="Relationship's own Vonnegut shape" />
                  <Field label="Starting State" value={selected.data.startingState || ''} onChange={(v) => updateData('startingState', v)} type="textarea" />
                  <Field label="Transformation Points" value={selected.data.transformationPoints || ''} onChange={(v) => updateData('transformationPoints', v)} type="textarea" />
                  <Field label="End State" value={selected.data.endState || ''} onChange={(v) => updateData('endState', v)} placeholder="Repaired/destroyed/transformed/open" />
                  <Field label="Cost" value={selected.data.arcCost || ''} onChange={(v) => updateData('arcCost', v)} type="textarea" placeholder="What the arc takes from each party" />
                </div>
              </Section>

              <Section title="Asymmetry Tracking" description="High-priority for question generation" defaultOpen>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Awareness Gap" value={selected.data.awarenessGap || ''} onChange={(v) => updateData('awarenessGap', v)} type="textarea" placeholder="Does one party understand the relationship more clearly" />
                  <Field label="Investment Gap" value={selected.data.investmentGap || ''} onChange={(v) => updateData('investmentGap', v)} type="textarea" placeholder="Does one party care significantly more" />
                  <Field label="Information Gap" value={selected.data.informationGap || ''} onChange={(v) => updateData('informationGap', v)} type="textarea" placeholder="Something one party knows, other doesn't" />
                  <Field label="Power Shift Moments" value={selected.data.powerShiftMoments || ''} onChange={(v) => updateData('powerShiftMoments', v)} type="textarea" placeholder="Specific leverage-change points" />
                  <Field label="Perception Gap" value={selected.data.perceptionGap || ''} onChange={(v) => updateData('perceptionGap', v)} type="textarea" placeholder="What each believes the relationship is vs. reality" />
                </div>
              </Section>

              <ConfirmDelete
                open={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={() => {
                  remove(selected.id);
                  setSelectedId(null);
                }}
                itemName={selected.label}
              />
            </>
          )}
        </>
      )}

      {tab === 'clusters' && (
        <ClustersTab
          clusters={clusters}
          relationships={relationships}
          characters={characters}
          createCluster={createCluster}
          updateCluster={updateCluster}
          removeCluster={removeCluster}
        />
      )}
    </div>
  );

  return (
    <LayerShell
      projectId={projectId}
      mode="relationships"
      title="Relationships"
      subtitle="Build the connections between characters — dynamics, tensions, and arcs"
      icon={<Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
      accentColor="bg-rose-100 dark:bg-rose-900/30"
      coldStartQuestions={COLD_START}
      manualView={manualView}
      onDataExtracted={reloadRels}
    />
  );
}

function ClustersTab({
  clusters,
  relationships,
  createCluster,
  updateCluster,
  removeCluster,
}: {
  clusters: RelationshipCluster[];
  relationships: Relationship[];
  characters: Character[];
  createCluster: (payload: Record<string, unknown>) => Promise<RelationshipCluster | null>;
  updateCluster: (id: string, updates: Record<string, unknown>) => Promise<void>;
  removeCluster: (id: string) => Promise<void>;
}) {
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const selected = clusters.find((c) => c.id === selectedClusterId) || null;

  const updateData = (field: keyof ClusterData, value: string) => {
    if (!selected) return;
    const newData = { ...selected.data, [field]: value };
    updateCluster(selected.id, { data: newData });
  };

  if (clusters.length === 0 && !selected) {
    return (
      <div className="card">
        <EmptyState
          icon={<Users className="w-full h-full" />}
          title="No clusters yet"
          message="When 3+ characters interlock, create a cluster to track system-level tension that no individual relationship can relieve."
          action={
            <button
              className="btn btn-primary"
              onClick={() => createCluster({ label: 'New Cluster', data: {} }).then((c) => c && setSelectedClusterId(c.id))}
            >
              <Plus className="w-4 h-4" />
              Create Cluster
            </button>
          }
        />
      </div>
    );
  }

  if (!selected) {
    return (
      <>
        <button
          className="btn btn-primary mb-4"
          onClick={() => createCluster({ label: 'New Cluster', data: {} }).then((c) => c && setSelectedClusterId(c.id))}
        >
          <Plus className="w-4 h-4" />
          New Cluster
        </button>
        <div className="space-y-3">
          {clusters.map((cluster) => (
            <button
              key={cluster.id}
              onClick={() => setSelectedClusterId(cluster.id)}
              className="card card-hover p-5 text-left w-full"
            >
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-ink-400" />
                <h3 className="font-serif font-semibold text-ink-800">{cluster.label}</h3>
                {cluster.data.clusterType && <Badge color="teal">{cluster.data.clusterType}</Badge>}
              </div>
              {cluster.data.systemLevelTension && (
                <p className="text-xs text-ink-400 mt-2 line-clamp-2">{cluster.data.systemLevelTension}</p>
              )}
            </button>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <button className="btn btn-ghost" onClick={() => setSelectedClusterId(null)}>
          <span className="text-sm">&larr; All Clusters</span>
        </button>
        <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      <div className="card p-6 mb-4">
        <Field label="Label" value={selected.label} onChange={(v) => updateCluster(selected.id, { label: v })} />
      </div>

      <Section title="Cluster Details" defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Cluster Type" value={selected.data.clusterType || ''} onChange={(v) => updateData('clusterType', v)} placeholder="Love triangle, alliance under strain, power struggle, family system, ensemble" />
          <Field label="Subplot Designation" value={selected.data.subplotDesignation || ''} onChange={(v) => updateData('subplotDesignation', v)} placeholder="Cluster as its own story object" />
          <Field label="Member Relationships" value={selected.data.memberRelationshipIds?.join(', ') || ''} onChange={(v) => updateData('memberRelationshipIds', v as unknown as string)} type="textarea" placeholder="Relationship labels or IDs in this cluster" />
          <Field label="Resolution" value={selected.data.resolution || ''} onChange={(v) => updateData('resolution', v)} type="textarea" placeholder="How the cluster resolves" />
        </div>
        <Field label="System-Level Tension" value={selected.data.systemLevelTension || ''} onChange={(v) => updateData('systemLevelTension', v)} type="textarea" placeholder="Pressure from the combination, not present in any individual relationship" />
        <Field label="Cluster Arc" value={selected.data.clusterArc || ''} onChange={(v) => updateData('clusterArc', v)} type="textarea" placeholder="How the system evolves independent of any single relationship" />
      </Section>

      <ConfirmDelete
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => {
          removeCluster(selected.id);
          setSelectedClusterId(null);
        }}
        itemName={selected.label}
      />
    </>
  );
}
