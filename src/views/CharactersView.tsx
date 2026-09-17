import { useState, useCallback } from 'react';
import { useCrudList } from '@/hooks/useCrudList';
import { Character, CharacterData } from '@/lib/types';
import { ARCHETYPES, ARC_TYPES } from '@/lib/constants';
import { Field, Section, EmptyState, ConfirmDelete, Badge } from '@/components/ui/Field';
import { supabase } from '@/lib/supabase';
import { Users, Plus, Trash2, User } from 'lucide-react';
import { LayerShell } from '@/components/LayerShell';

interface CharactersViewProps {
  projectId: string | null;
}

const EMPTY_DATA: CharacterData = {};

const COLD_START = [
  "Who's the person this story is really about?",
  "Is there a character you've been thinking about for a long time?",
  "Tell me about someone who walks into your story and changes everything.",
  "Who's the most interesting person in your story — not the most powerful, the most interesting?",
];

export function CharactersView({ projectId }: CharactersViewProps) {
  const { items: characters, loading, create, update, remove, reload } = useCrudList<Character>(
    'characters',
    projectId,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);

  const selected = characters.find((c) => c.id === selectedId) || null;

  const loadAllCharacters = useCallback(async () => {
    if (!projectId) return;
    const { data } = await supabase
      .from('characters')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');
    setAllCharacters((data as Character[]) || []);
  }, [projectId]);

  const handleCreate = async () => {
    const created = await create({ name: 'New Character', data: EMPTY_DATA });
    if (created) {
      setSelectedId(created.id);
      loadAllCharacters();
    }
  };

  const updateData = (field: keyof CharacterData, value: string) => {
    if (!selected) return;
    const newData = { ...selected.data, [field]: value };
    update(selected.id, { data: newData });
  };

  const updateVoice = (field: string, value: string) => {
    if (!selected) return;
    const voice = { ...selected.data.voicePatterns, [field]: value };
    updateData('voicePatterns', voice as unknown as string);
  };

  const updateName = (value: string) => {
    if (!selected) return;
    update(selected.id, { name: value });
  };

  if (loading || !projectId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-ink-400">Loading characters...</div>
      </div>
    );
  }

  const manualView = (
    <div className="max-w-4xl mx-auto px-8 py-8 animate-fade-in">
      {characters.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Users className="w-full h-full" />}
            title="No characters yet"
            message="Start by creating your first character. You'll define their identity, inner world (the Lie/truth/wound trinity), transformation arc, visual identity, and voice."
            action={
              <button className="btn btn-primary" onClick={handleCreate}>
                <Plus className="w-4 h-4" />
                Create Character
              </button>
            }
          />
        </div>
      ) : !selected ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-serif font-semibold text-ink-800 mb-1">Characters</h2>
              <p className="text-ink-400 text-sm">{characters.length} character{characters.length !== 1 ? 's' : ''} in your story</p>
            </div>
            <button className="btn btn-primary" onClick={handleCreate}>
              <Plus className="w-4 h-4" />
              New Character
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((char) => {
              const data = char.data;
              const filledAtoms = Object.values(data).filter((v) => v && typeof v === 'string' && v.length > 0).length;
              return (
                <button
                  key={char.id}
                  onClick={() => setSelectedId(char.id)}
                  className="card card-hover p-5 text-left"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-ink-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif font-semibold text-ink-800 truncate">{char.name}</h3>
                      {data.archetype && <Badge color="amber">{data.archetype}</Badge>}
                    </div>
                  </div>
                  {data.theLie && (
                    <p className="text-xs text-ink-500 line-clamp-2 mb-2">
                      <span className="font-medium">The Lie:</span> {data.theLie}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-ink-400">
                    <span>{filledAtoms} atoms filled</span>
                    {data.arcType && <Badge color="sage">{data.arcType}</Badge>}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <CharacterDetail
          selected={selected}
          onBack={() => setSelectedId(null)}
          onDelete={() => setShowDelete(true)}
          onUpdateName={updateName}
          onUpdateData={updateData}
          onUpdateVoice={updateVoice}
        />
      )}

      <ConfirmDelete
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => {
          remove(selected!.id);
          setSelectedId(null);
        }}
        itemName={selected?.name || 'this character'}
      />
    </div>
  );

  return (
    <LayerShell
      projectId={projectId}
      mode="characters"
      title="Characters"
      subtitle="Build the people who drive your story — identity, inner world, transformation, voice"
      icon={<Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
      accentColor="bg-amber-100 dark:bg-amber-900/30"
      coldStartQuestions={COLD_START}
      manualView={manualView}
      onDataExtracted={reload}
    />
  );
}

function CharacterDetail({
  selected,
  onBack,
  onDelete,
  onUpdateName,
  onUpdateData,
  onUpdateVoice,
}: {
  selected: Character;
  onBack: () => void;
  onDelete: () => void;
  onUpdateName: (v: string) => void;
  onUpdateData: (field: keyof CharacterData, value: string) => void;
  onUpdateVoice: (field: string, value: string) => void;
}) {
  const data = selected.data;
  const voice = data.voicePatterns || {};

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <button className="btn btn-ghost" onClick={onBack}>
          <span className="text-sm">&larr; All Characters</span>
        </button>
        <button className="btn btn-danger" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      <div className="card p-6 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name" value={selected.name} onChange={onUpdateName} placeholder="Character name" />
          <Field
            label="Archetype"
            value={data.archetype || ''}
            onChange={(v) => onUpdateData('archetype', v)}
            type="select"
            options={ARCHETYPES}
          />
        </div>
      </div>

      <Section title="Identity" description="Who they are in the world" defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Aliases" value={data.aliases || ''} onChange={(v) => onUpdateData('aliases', v)} placeholder="Other names, nicknames" />
          <Field label="Age / Life Stage" value={data.age || ''} onChange={(v) => onUpdateData('age', v)} placeholder="e.g. Mid-thirties, adolescent" />
          <Field label="Physical Appearance" value={data.appearance || ''} onChange={(v) => onUpdateData('appearance', v)} type="textarea" placeholder="Defining features, not exhaustive" />
          <Field label="Gender / Sexuality" value={data.gender || ''} onChange={(v) => onUpdateData('gender', v)} placeholder="Where narratively relevant" />
          <Field label="Social Role" value={data.socialRole || ''} onChange={(v) => onUpdateData('socialRole', v)} placeholder="Occupation, class, position" />
          <Field label="Perceived vs. Actual" value={data.perceivedVsActual || ''} onChange={(v) => onUpdateData('perceivedVsActual', v)} type="textarea" placeholder="How others see them vs. how they actually are" />
        </div>
      </Section>

      <Section title="Inner World — The Lie/Truth/Wound Trinity" description="The core emotional architecture of the character" defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="The Lie" value={data.theLie || ''} onChange={(v) => onUpdateData('theLie', v)} type="textarea" placeholder="False belief held about self or world" />
          <Field label="The Truth" value={data.theTruth || ''} onChange={(v) => onUpdateData('theTruth', v)} type="textarea" placeholder="What they must accept (may never arrive in tragic arcs)" />
          <Field label="The Wound" value={data.theWound || ''} onChange={(v) => onUpdateData('theWound', v)} type="textarea" placeholder="Past event that created the Lie" />
          <Field label="The Ghost" value={data.theGhost || ''} onChange={(v) => onUpdateData('theGhost', v)} type="textarea" placeholder="How the wound haunts present behavior, unrecognized" />
          <Field label="Want" value={data.want || ''} onChange={(v) => onUpdateData('want', v)} type="textarea" placeholder="Conscious goal being pursued" />
          <Field label="Need" value={data.need || ''} onChange={(v) => onUpdateData('need', v)} type="textarea" placeholder="What's actually required to be whole" />
          <Field label="Fear" value={data.fear || ''} onChange={(v) => onUpdateData('fear', v)} type="textarea" placeholder="What they're running from" />
          <Field label="Flaw" value={data.flaw || ''} onChange={(v) => onUpdateData('flaw', v)} type="textarea" placeholder="Behavioral expression of the Lie" />
          <Field label="Strength" value={data.strength || ''} onChange={(v) => onUpdateData('strength', v)} type="textarea" placeholder="What makes them capable/compelling" />
          <Field label="Moral Code" value={data.moralCode || ''} onChange={(v) => onUpdateData('moralCode', v)} type="textarea" placeholder="What they will/won't do, where the line bends under pressure" />
        </div>
      </Section>

      <Section title="Transformation" description="How the character changes across the arc">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Arc Type" value={data.arcType || ''} onChange={(v) => onUpdateData('arcType', v)} type="select" options={ARC_TYPES} />
          <Field label="Personal Emotional Shape" value={data.emotionalShape || ''} onChange={(v) => onUpdateData('emotionalShape', v)} placeholder="Own Vonnegut fortune curve" />
          <Field label="Catalyst" value={data.catalyst || ''} onChange={(v) => onUpdateData('catalyst', v)} type="textarea" placeholder="What first cracks the Lie" />
          <Field label="Resistance" value={data.resistance || ''} onChange={(v) => onUpdateData('resistance', v)} type="textarea" placeholder="How they fight the incoming truth" />
          <Field label="Turning Point" value={data.turningPoint || ''} onChange={(v) => onUpdateData('turningPoint', v)} type="textarea" placeholder="Moment they can no longer avoid confronting it" />
          <Field label="Resolution" value={data.resolution || ''} onChange={(v) => onUpdateData('resolution', v)} type="textarea" placeholder="Who they are at the end" />
          <Field label="Cost" value={data.cost || ''} onChange={(v) => onUpdateData('cost', v)} type="textarea" placeholder="What transformation takes from them" />
        </div>
      </Section>

      <Section title="Visual Identity" description="How they exist in visual space">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Signature Visual Element" value={data.signatureVisual || ''} onChange={(v) => onUpdateData('signatureVisual', v)} placeholder="Color/object/recurring image" />
          <Field label="Physical Transformation" value={data.physicalTransformation || ''} onChange={(v) => onUpdateData('physicalTransformation', v)} type="textarea" placeholder="How appearance changes across arc" />
          <Field label="Symbolic Objects" value={data.symbolicObjects || ''} onChange={(v) => onUpdateData('symbolicObjects', v)} type="textarea" placeholder="Objects carried, lost, or gained" />
          <Field label="Physical Presence" value={data.physicalPresence || ''} onChange={(v) => onUpdateData('physicalPresence', v)} type="textarea" placeholder="Expansive, small, still, restless — how they occupy space" />
        </div>
      </Section>

      <Section title="Sub-Arc Tracking" description="For significant secondary characters">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Personal Arc Shape" value={data.subArcShape || ''} onChange={(v) => onUpdateData('subArcShape', v)} placeholder="Independent of main plot" />
          <Field label="Entry Point" value={data.subArcEntry || ''} onChange={(v) => onUpdateData('subArcEntry', v)} placeholder="Where personal arc begins" />
          <Field label="Exit Point" value={data.subArcExit || ''} onChange={(v) => onUpdateData('subArcExit', v)} placeholder="Resolved, unresolved, or deliberately ambiguous" />
          <Field label="Intersection Points" value={data.subArcIntersections || ''} onChange={(v) => onUpdateData('subArcIntersections', v)} type="textarea" placeholder="Where this arc collides with/redirects the protagonist's" />
        </div>
      </Section>

      <Section title="Voice Capture" description="Extracted patterns from the character's speech behavior">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Vocabulary Register" value={voice.vocabularyRegister || ''} onChange={(v) => onUpdateVoice('vocabularyRegister', v)} placeholder="Formal/casual/clipped/expansive" />
          <Field label="Emotional Directness" value={voice.emotionalDirectness || ''} onChange={(v) => onUpdateVoice('emotionalDirectness', v)} placeholder="Says what they feel / deflects / masks" />
          <Field label="Humor as Defense" value={voice.humorDefense || ''} onChange={(v) => onUpdateVoice('humorDefense', v)} placeholder="Yes / no / situational" />
          <Field label="Default Mode Under Pressure" value={voice.pressureMode || ''} onChange={(v) => onUpdateVoice('pressureMode', v)} placeholder="Control/collapse/deflect/attack" />
          <Field label="Vulnerability Handling" value={voice.vulnerabilityHandling || ''} onChange={(v) => onUpdateVoice('vulnerabilityHandling', v)} placeholder="Lean in/shut down/humor/anger" />
          <Field label="Subtext Patterns" value={voice.subtextPatterns || ''} onChange={(v) => onUpdateVoice('subtextPatterns', v)} type="textarea" placeholder="What they consistently don't say" />
          <Field label="Signature Phrases" value={voice.signaturePhrases || ''} onChange={(v) => onUpdateVoice('signaturePhrases', v)} type="textarea" placeholder="Constructions/phrases unique to them" />
        </div>
      </Section>
    </>
  );
}
