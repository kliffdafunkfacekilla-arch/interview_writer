import { useState, useEffect, useCallback } from 'react';
import { useCrudList } from '@/hooks/useCrudList';
import { supabase } from '@/lib/supabase';
import {
  WorldLocation,
  WorldLocationData,
  WorldLaw,
  WorldLawData,
  WorldRecord,
  WorldRecordData,
  WorldSnapshot,
  Project,
} from '@/lib/types';
import {
  LAW_TYPES,
  RECORD_TYPES,
  TRUTH_STATUSES,
  WORLD_PILLARS,
} from '@/lib/constants';
import { Field, Section, EmptyState, ConfirmDelete, Badge } from '@/components/ui/Field';
import {
  Globe,
  Plus,
  Trash2,
  MapPin,
  Scale,
  Scroll,
  Camera,
} from 'lucide-react';

interface WorldViewProps {
  projectId: string | null;
}

export function WorldView({ projectId }: WorldViewProps) {
  const [tab, setTab] = useState<'locations' | 'laws' | 'records' | 'snapshots'>('locations');
  const { items: locations, loading: locLoading, create: createLoc, update: updateLoc, remove: removeLoc } = useCrudList<WorldLocation>('world_locations', projectId);
  const { items: laws, loading: lawsLoading, create: createLaw, update: updateLaw, remove: removeLaw } = useCrudList<WorldLaw>('world_laws', projectId);
  const { items: records, loading: recsLoading, create: createRec, update: updateRec, remove: removeRec } = useCrudList<WorldRecord>('world_records', projectId);
  const { items: snapshots, loading: snapLoading, create: createSnap, update: updateSnap, remove: removeSnap } = useCrudList<WorldSnapshot>('world_snapshots', projectId);

  const [project, setProject] = useState<Project | null>(null);
  const [selectedLocId, setSelectedLocId] = useState<string | null>(null);
  const [selectedLawId, setSelectedLawId] = useState<string | null>(null);
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    const { data } = await supabase.from('projects').select('*').eq('id', projectId).maybeSingle();
    setProject(data as Project | null);
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const loading = locLoading || lawsLoading || recsLoading || snapLoading;
  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-pulse text-ink-400">Loading world...</div></div>;
  }

  const tabs = [
    { id: 'locations' as const, label: 'Locations', count: locations.length, icon: MapPin },
    { id: 'laws' as const, label: 'Laws', count: laws.length, icon: Scale },
    { id: 'records' as const, label: 'Records', count: records.length, icon: Scroll },
    { id: 'snapshots' as const, label: 'Snapshots', count: snapshots.length, icon: Camera },
  ];

  return (
    <div className="max-w-4xl mx-auto px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-3xl font-serif font-semibold text-ink-800 mb-1">World</h2>
        <p className="text-ink-400">The container everything lives inside — locations, laws, histories, and the truth/believed gap.</p>
      </div>

      <div className="flex gap-1 mb-6 bg-ink-100 rounded-lg p-1 w-fit">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                tab === t.id ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'
              }`}
              onClick={() => setTab(t.id)}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label} ({t.count})
            </button>
          );
        })}
      </div>

      {tab === 'locations' && (
        <LocationsTab
          locations={locations}
          createLoc={createLoc}
          updateLoc={updateLoc}
          removeLoc={removeLoc}
          selectedId={selectedLocId}
          setSelectedId={setSelectedLocId}
          showDelete={showDelete}
          setShowDelete={setShowDelete}
        />
      )}
      {tab === 'laws' && (
        <LawsTab
          laws={laws}
          createLaw={createLaw}
          updateLaw={updateLaw}
          removeLaw={removeLaw}
          selectedId={selectedLawId}
          setSelectedId={setSelectedLawId}
          showDelete={showDelete}
          setShowDelete={setShowDelete}
        />
      )}
      {tab === 'records' && (
        <RecordsTab
          records={records}
          createRec={createRec}
          updateRec={updateRec}
          removeRec={removeRec}
          selectedId={selectedRecId}
          setSelectedId={setSelectedRecId}
          showDelete={showDelete}
          setShowDelete={setShowDelete}
        />
      )}
      {tab === 'snapshots' && (
        <SnapshotsTab
          snapshots={snapshots}
          createSnap={createSnap}
          updateSnap={updateSnap}
          removeSnap={removeSnap}
          showDelete={showDelete}
          setShowDelete={setShowDelete}
        />
      )}
    </div>
  );
}

function LocationsTab({ locations, createLoc, updateLoc, removeLoc, selectedId, setSelectedId, showDelete, setShowDelete }: any) {
  const selected = locations.find((l: WorldLocation) => l.id === selectedId) || null;

  const updateData = (field: keyof WorldLocationData, value: string) => {
    if (!selected) return;
    updateLoc(selected.id, { data: { ...selected.data, [field]: value } });
  };

  if (locations.length === 0 && !selected) {
    return (
      <div className="card">
        <EmptyState
          icon={<MapPin className="w-full h-full" />}
          title="No locations yet"
          message="Locations have a truth/believed gap — what inhabitants believe about them vs. what's actually true. The gap is where dramatic irony lives."
          action={
            <button className="btn btn-primary" onClick={() => createLoc({ name: 'New Location', data: {} }).then((l: WorldLocation) => l && setSelectedId(l.id))}>
              <Plus className="w-4 h-4" /> Create Location
            </button>
          }
        />
      </div>
    );
  }

  if (!selected) {
    return (
      <>
        <button className="btn btn-primary mb-4" onClick={() => createLoc({ name: 'New Location', data: {} }).then((l: WorldLocation) => l && setSelectedId(l.id))}>
          <Plus className="w-4 h-4" /> New Location
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {locations.map((loc: WorldLocation) => (
            <button key={loc.id} onClick={() => setSelectedId(loc.id)} className="card card-hover p-4 text-left">
              <h3 className="font-serif font-semibold text-ink-800">{loc.name}</h3>
              {loc.data.emotionalRegister && <p className="text-xs text-ink-400 mt-1 line-clamp-1">{loc.data.emotionalRegister}</p>}
              {loc.data.storyFunction && <Badge color="teal">{loc.data.storyFunction}</Badge>}
            </button>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <button className="btn btn-ghost" onClick={() => setSelectedId(null)}><span className="text-sm">&larr; All Locations</span></button>
        <button className="btn btn-danger" onClick={() => setShowDelete(true)}><Trash2 className="w-4 h-4" /> Delete</button>
      </div>
      <div className="card p-6 mb-4">
        <Field label="Name" value={selected.name} onChange={(v) => updateLoc(selected.id, { name: v })} />
      </div>
      <Section title="Physical & Emotional" defaultOpen>
        <Field label="Physical Description" value={selected.data.physicalDescription || ''} onChange={(v) => updateData('physicalDescription', v)} type="textarea" placeholder="Defining sensory features" />
        <Field label="Emotional Register" value={selected.data.emotionalRegister || ''} onChange={(v) => updateData('emotionalRegister', v)} type="textarea" placeholder="What this place does to people who enter it" />
      </Section>
      <Section title="The Truth/Believed Gap" description="The most powerful atom in the world layer">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Official History" value={selected.data.officialHistory || ''} onChange={(v) => updateData('officialHistory', v)} type="textarea" placeholder="What people believe" />
          <Field label="True History" value={selected.data.trueHistory || ''} onChange={(v) => updateData('trueHistory', v)} type="textarea" placeholder="What actually happened" />
          <Field label="Truth Status" value={selected.data.truthStatus || ''} onChange={(v) => updateData('truthStatus', v)} type="select" options={TRUTH_STATUSES} />
          <Field label="Who Knows the Truth" value={selected.data.whoKnowsTruth || ''} onChange={(v) => updateData('whoKnowsTruth', v)} type="textarea" />
          <Field label="Who Benefits from the Lie" value={selected.data.whoBenefitsFromLie || ''} onChange={(v) => updateData('whoBenefitsFromLie', v)} type="textarea" />
        </div>
      </Section>
      <Section title="Rules & Function">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Location-Specific Rules" value={selected.data.locationRules || ''} onChange={(v) => updateData('locationRules', v)} type="textarea" placeholder="What's possible/impossible here that isn't elsewhere" />
          <Field label="Symbolic Weight" value={selected.data.symbolicWeight || ''} onChange={(v) => updateData('symbolicWeight', v)} placeholder="Cross-ref Theme" />
          <Field label="State at Story Open" value={selected.data.stateAtOpen || ''} onChange={(v) => updateData('stateAtOpen', v)} type="textarea" />
          <Field label="State at Story Close" value={selected.data.stateAtClose || ''} onChange={(v) => updateData('stateAtClose', v)} type="textarea" />
          <Field label="Story Function" value={selected.data.storyFunction || ''} onChange={(v) => updateData('storyFunction', v)} placeholder="Constrain / shelter / threaten / transform" />
        </div>
      </Section>
      <ConfirmDelete open={showDelete} onClose={() => setShowDelete(false)} onConfirm={() => { removeLoc(selected.id); setSelectedId(null); }} itemName={selected.name} />
    </>
  );
}

function LawsTab({ laws, createLaw, updateLaw, removeLaw, selectedId, setSelectedId, showDelete, setShowDelete }: any) {
  const selected = laws.find((l: WorldLaw) => l.id === selectedId) || null;
  const updateData = (field: keyof WorldLawData, value: string) => {
    if (!selected) return;
    updateLaw(selected.id, { data: { ...selected.data, [field]: value } });
  };

  if (laws.length === 0 && !selected) {
    return (
      <div className="card">
        <EmptyState
          icon={<Scale className="w-full h-full" />}
          title="No laws yet"
          message="A Law without a consequence for violation is not a Law — it's a suggestion. Exploitability is where plot lives."
          action={<button className="btn btn-primary" onClick={() => createLaw({ statement: 'New law', data: {} }).then((l: WorldLaw) => l && setSelectedId(l.id))}><Plus className="w-4 h-4" /> Create Law</button>}
        />
      </div>
    );
  }

  if (!selected) {
    return (
      <>
        <button className="btn btn-primary mb-4" onClick={() => createLaw({ statement: 'New law', data: {} }).then((l: WorldLaw) => l && setSelectedId(l.id))}><Plus className="w-4 h-4" /> New Law</button>
        <div className="space-y-3">
          {laws.map((law: WorldLaw) => (
            <button key={law.id} onClick={() => setSelectedId(law.id)} className="card card-hover p-4 text-left w-full">
              <p className="text-sm text-ink-700 line-clamp-2">{law.statement}</p>
              {law.data.lawType && <div className="mt-1.5"><Badge color="rust">{law.data.lawType}</Badge></div>}
            </button>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <button className="btn btn-ghost" onClick={() => setSelectedId(null)}><span className="text-sm">&larr; All Laws</span></button>
        <button className="btn btn-danger" onClick={() => setShowDelete(true)}><Trash2 className="w-4 h-4" /> Delete</button>
      </div>
      <div className="card p-6 mb-4">
        <Field label="Statement (plain language)" value={selected.statement} onChange={(v) => updateLaw(selected.id, { statement: v })} type="textarea" placeholder="The law in plain terms" />
      </div>
      <Section title="Law Details" defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Law Type" value={selected.data.lawType || ''} onChange={(v) => updateData('lawType', v)} type="select" options={LAW_TYPES} />
          <Field label="Scope" value={selected.data.scope || ''} onChange={(v) => updateData('scope', v)} placeholder="Universal / regional / cultural / specific characters" />
          <Field label="Consequence for Violation" value={selected.data.consequenceForViolation || ''} onChange={(v) => updateData('consequenceForViolation', v)} type="textarea" placeholder="MANDATORY — without this, it's not a law" hint="A Law without a consequence is a suggestion." />
          <Field label="Who Enforces It" value={selected.data.whoEnforces || ''} onChange={(v) => updateData('whoEnforces', v)} placeholder="Person / institution / natural force / world itself" />
          <Field label="Exploitability" value={selected.data.exploitability || ''} onChange={(v) => updateData('exploitability', v)} type="textarea" placeholder="Can it be bent/broken under specific conditions, at what cost?" hint="Exploitability is where plot lives." />
          <Field label="Known vs. True Operation" value={selected.data.knownVsTrue || ''} onChange={(v) => updateData('knownVsTrue', v)} type="textarea" placeholder="How characters believe it works vs. how it actually works" />
          <Field label="Origin" value={selected.data.origin || ''} onChange={(v) => updateData('origin', v)} type="textarea" placeholder="Where did it come from? Does anyone question it?" />
          <Field label="Story Function" value={selected.data.storyFunction || ''} onChange={(v) => updateData('storyFunction', v)} placeholder="Constrains protagonist / enables antagonist / generates pressure" />
        </div>
      </Section>
      <ConfirmDelete open={showDelete} onClose={() => setShowDelete(false)} onConfirm={() => { removeLaw(selected.id); setSelectedId(null); }} itemName={selected.statement.slice(0, 50)} />
    </>
  );
}

function RecordsTab({ records, createRec, updateRec, removeRec, selectedId, setSelectedId, showDelete, setShowDelete }: any) {
  const selected = records.find((r: WorldRecord) => r.id === selectedId) || null;
  const updateData = (field: keyof WorldRecordData, value: string) => {
    if (!selected) return;
    updateRec(selected.id, { data: { ...selected.data, [field]: value } });
  };

  if (records.length === 0 && !selected) {
    return (
      <div className="card">
        <EmptyState
          icon={<Scroll className="w-full h-full" />}
          title="No records yet"
          message="Histories and myths share one object type — the story may not know which is which. 'Who is invested in the lie' is where world-building becomes plot."
          action={<button className="btn btn-primary" onClick={() => createRec({ title: 'New Record', data: {} }).then((r: WorldRecord) => r && setSelectedId(r.id))}><Plus className="w-4 h-4" /> Create Record</button>}
        />
      </div>
    );
  }

  if (!selected) {
    return (
      <>
        <button className="btn btn-primary mb-4" onClick={() => createRec({ title: 'New Record', data: {} }).then((r: WorldRecord) => r && setSelectedId(r.id))}><Plus className="w-4 h-4" /> New Record</button>
        <div className="space-y-3">
          {records.map((rec: WorldRecord) => (
            <button key={rec.id} onClick={() => setSelectedId(rec.id)} className="card card-hover p-4 text-left w-full">
              <h3 className="font-serif font-semibold text-ink-800">{rec.title}</h3>
              {rec.data.type && <div className="mt-1"><Badge color="amber">{rec.data.type}</Badge></div>}
            </button>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <button className="btn btn-ghost" onClick={() => setSelectedId(null)}><span className="text-sm">&larr; All Records</span></button>
        <button className="btn btn-danger" onClick={() => setShowDelete(true)}><Trash2 className="w-4 h-4" /> Delete</button>
      </div>
      <div className="card p-6 mb-4">
        <Field label="Title" value={selected.title} onChange={(v) => updateRec(selected.id, { title: v })} />
      </div>
      <Section title="The Record" defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Type" value={selected.data.type || ''} onChange={(v) => updateData('type', v)} type="select" options={RECORD_TYPES} />
          <Field label="Truth Status" value={selected.data.truthStatus || ''} onChange={(v) => updateData('truthStatus', v)} type="select" options={TRUTH_STATUSES} />
          <Field label="The Told Version" value={selected.data.toldVersion || ''} onChange={(v) => updateData('toldVersion', v)} type="textarea" placeholder="What people believe happened" />
          <Field label="The True Version" value={selected.data.trueVersion || ''} onChange={(v) => updateData('trueVersion', v)} type="textarea" placeholder="What actually happened (can be 'unknown even to writer')" />
        </div>
      </Section>
      <Section title="Investment & Impact" description="Who is invested in the lie — where world-building becomes plot">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Who Knows the Truth" value={selected.data.whoKnowsTruth || ''} onChange={(v) => updateData('whoKnowsTruth', v)} type="textarea" placeholder="How, and whether they speak it" />
          <Field label="Who Is Invested in the Lie" value={selected.data.whoInvestedInLie || ''} onChange={(v) => updateData('whoInvestedInLie', v)} type="textarea" placeholder="Who benefits from the told version persisting" />
          <Field label="Investment Level" value={selected.data.investmentLevel || ''} onChange={(v) => updateData('investmentLevel', v)} placeholder="What they'd do to protect it" />
          <Field label="Living Impact" value={selected.data.livingImpact || ''} onChange={(v) => updateData('livingImpact', v)} type="textarea" placeholder="How this actively shapes present behavior/politics/belief/law" />
          <Field label="Revelation Potential" value={selected.data.revelationPotential || ''} onChange={(v) => updateData('revelationPotential', v)} type="textarea" placeholder="Plot point, theme point, or both? When/how might it surface?" />
          <Field label="Connected Locations" value={selected.data.connectedLocations || ''} onChange={(v) => updateData('connectedLocations', v)} type="textarea" />
          <Field label="Story Function" value={selected.data.storyFunction || ''} onChange={(v) => updateData('storyFunction', v)} placeholder="Explains a Law / justifies power / fuels a wound / sets up revelation" />
        </div>
      </Section>
      <ConfirmDelete open={showDelete} onClose={() => setShowDelete(false)} onConfirm={() => { removeRec(selected.id); setSelectedId(null); }} itemName={selected.title} />
    </>
  );
}

function SnapshotsTab({ snapshots, createSnap, updateSnap, removeSnap, showDelete, setShowDelete }: any) {
  const existingPillars = snapshots.map((s: WorldSnapshot) => s.pillar);

  const handleCreate = (pillar: string) => {
    createSnap({ pillar, description: '', data: {} });
  };

  return (
    <div>
      <p className="text-sm text-ink-500 mb-4">World state at each of the 5 structural pillars. The delta between world-open and world-close is the world's arc.</p>
      <div className="space-y-4">
        {WORLD_PILLARS.map((pillar) => {
          const snapshot = snapshots.find((s: WorldSnapshot) => s.pillar === pillar.value);
          if (!snapshot) {
            return (
              <div key={pillar.value} className="card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="section-title">{pillar.label}</h3>
                    <p className="text-xs text-ink-400 mt-0.5">No snapshot yet</p>
                  </div>
                  <button className="btn btn-secondary" onClick={() => handleCreate(pillar.value)}>
                    <Plus className="w-4 h-4" /> Add Snapshot
                  </button>
                </div>
              </div>
            );
          }
          return (
            <div key={snapshot.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="section-title">{pillar.label}</h3>
                <button className="btn btn-danger !py-1 !px-2" onClick={() => removeSnap(snapshot.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <Field
                label="World State Description"
                value={snapshot.description}
                onChange={(v) => updateSnap(snapshot.id, { description: v })}
                type="textarea"
                placeholder={`What does the world look like at ${pillar.label}?`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
