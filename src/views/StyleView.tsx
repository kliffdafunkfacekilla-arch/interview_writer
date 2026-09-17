import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { StyleConfig, StyleConfigData } from '@/lib/types';
import { Field, Section, Badge } from '@/components/ui/Field';
import { Palette, Plus, Trash2, Eye, Mic } from 'lucide-react';
import { LayerShell } from '@/components/LayerShell';

interface StyleViewProps {
  projectId: string | null;
}

const COLD_START = [
  "When you imagine reading your story, what does the prose feel like?",
  "Is the writing spare and stripped, or rich and layered?",
  "Do the sentences move fast or slow? Does it vary?",
  "What's a writer whose prose feels like what you're going for?",
];

export function StyleView({ projectId }: StyleViewProps) {
  const [config, setConfig] = useState<StyleConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    if (!projectId) return;
    const { data } = await supabase.from('style_config').select('*').eq('project_id', projectId).maybeSingle();
    setConfig(data as StyleConfig | null);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load, reloadKey]);

  const ensureConfig = useCallback(async (): Promise<StyleConfig | null> => {
    if (config) return config;
    const { data } = await supabase.from('style_config').insert({ project_id: projectId, data: {} }).select().maybeSingle();
    if (data) { setConfig(data as StyleConfig); return data as StyleConfig; }
    return null;
  }, [config, projectId]);

  const updateData = useCallback(async (field: keyof StyleConfigData, value: unknown) => {
    const current = await ensureConfig();
    if (!current) return;
    const newData = { ...current.data, [field]: value };
    const { data } = await supabase.from('style_config').update({ data: newData, updated_at: new Date().toISOString() }).eq('id', current.id).select().maybeSingle();
    if (data) setConfig(data as StyleConfig);
  }, [ensureConfig]);

  const addSample = useCallback(async () => {
    const current = await ensureConfig();
    if (!current) return;
    const samples = current.data.voiceSamples || [];
    updateData('voiceSamples', [...samples, { id: crypto.randomUUID(), label: '', text: '', analysis: '' }]);
  }, [ensureConfig, updateData]);

  const updateSample = (idx: number, field: string, value: string) => {
    if (!config?.data.voiceSamples) return;
    const samples = [...config.data.voiceSamples];
    samples[idx] = { ...samples[idx], [field]: value };
    updateData('voiceSamples', samples);
  };

  const removeSample = (idx: number) => {
    if (!config?.data.voiceSamples) return;
    updateData('voiceSamples', config.data.voiceSamples.filter((_, i) => i !== idx));
  };

  if (loading || !projectId) return <div className="flex items-center justify-center h-full"><div className="animate-pulse text-ink-400">Loading...</div></div>;

  const data = config?.data || {};

  const manualView = (
    <div className="max-w-4xl mx-auto px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-semibold text-ink-800 mb-1">Style & Prose</h2>
        <p className="text-ink-400 text-sm">How the story is perceived — through senses and through language.</p>
      </div>

      <div className="card p-4 mb-6 bg-sage-50 border-sage-200">
        <p className="text-sm text-sage-800">
          <strong>Declared vs. Natural:</strong> Writers often think they write one way and naturally do another. The AI holds both without privileging either, and surfaces the gap as useful information.
        </p>
      </div>

      <Section title="Sensory Palette" description="How the story engages the senses" defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Primary Sense" value={data.visualPalette || ''} onChange={(v) => updateData('visualPalette', v)} placeholder="Sight (default) / sound / smell / touch / taste" />
          <Field label="Sensory Hierarchy" value={data.dominantColors || ''} onChange={(v) => updateData('dominantColors', v)} type="textarea" placeholder="Ranked frequency of sense use" />
          <Field label="Sensory Gaps" value={data.colorPsychology || ''} onChange={(v) => updateData('colorPsychology', v)} type="textarea" placeholder="Senses consistently ignored (deliberate or default)" />
          <Field label="Detail Density" value={data.lightingTendencies || ''} onChange={(v) => updateData('lightingTendencies', v)} placeholder="Granular close focus / impressionistic broad strokes / varies" />
          <Field label="Subjective vs. Objective" value={data.spatialComposition || ''} onChange={(v) => updateData('spatialComposition', v)} type="textarea" placeholder="Filtered through character perception, or neutral?" />
        </div>
      </Section>

      <Section title="Visual Grammar" description="How the story sees">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Camera Distance" value={data.recurringVisualMotifs || ''} onChange={(v) => updateData('recurringVisualMotifs', v)} type="textarea" placeholder="Extreme close-up / mid-range / wide — does it shift with intent?" />
          <Field label="Movement Style" value={data.visualContrast || ''} onChange={(v) => updateData('visualContrast', v)} placeholder="Static/contemplative, kinetic/action-driven, or deliberate shifts" />
          <Field label="Light and Shadow" value={data.atmosphereTone || ''} onChange={(v) => updateData('atmosphereTone', v)} type="textarea" placeholder="Descriptive and emotional tool usage" />
          <Field label="Color Vocabulary" value={data.colorPsychology || ''} onChange={(v) => updateData('colorPsychology', v)} type="textarea" placeholder="Frequent/avoided colors, consistent symbolic weight?" />
        </div>
      </Section>

      <Section title="Voice Profile" description="The most important atom — fed by Voice Capture" defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Register" value={data.proseRegister || ''} onChange={(v) => updateData('proseRegister', v)} placeholder="Formal / literary / colloquial / vernacular / genre-inflected / hybrid" />
          <Field label="Sentence Energy" value={data.sentenceRhythm || ''} onChange={(v) => updateData('sentenceRhythm', v)} placeholder="Long/complex, short/percussive, or varied with pattern" />
          <Field label="Prose Density" value={data.paragraphFlow || ''} onChange={(v) => updateData('paragraphFlow', v)} placeholder="Spare/stripped, richly layered, or calibrated to scene type" />
          <Field label="Emotional Temperature" value={data.dialogueStyle || ''} onChange={(v) => updateData('dialogueStyle', v)} placeholder="Cool/observational, warm/immersed, or variable" />
          <Field label="Trust Level" value={data.dialogueTags || ''} onChange={(v) => updateData('dialogueTags', v)} placeholder="How much prose trusts reader to infer (explain vs imply)" />
        </div>
      </Section>

      <Section title="POV & Narrative Distance">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="POV Mode" value={data.povApproach || ''} onChange={(v) => updateData('povApproach', v)} placeholder="First / close third / distant third / second / omniscient / shifting" />
          <Field label="Narrative Distance" value={data.interiorityMode || ''} onChange={(v) => updateData('interiorityMode', v)} placeholder="Inside the body / slightly outside / removed" />
          <Field label="Reliability" value={data.descriptionDensity || ''} onChange={(v) => updateData('descriptionDensity', v)} placeholder="Trustworthy / unreliable / self-deceived / spectrum" />
          <Field label="Distance Shifts" value={data.sensoryPriority || ''} onChange={(v) => updateData('sensoryPriority', v)} type="textarea" placeholder="Deliberate pull-back/move-closer — what triggers?" />
          <Field label="Tense" value={data.tenseApproach || ''} onChange={(v) => updateData('tenseApproach', v)} placeholder="Past / present / shifting (what governs?)" />
        </div>
      </Section>

      <Section title="Dialogue Register" description="How speech is rendered in prose">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Dialogue Density" value={data.figurativeLanguage || ''} onChange={(v) => updateData('figurativeLanguage', v)} placeholder="How much of story is dialogue vs narration" />
          <Field label="Dialect/Idiolect" value={data.pacingTendency || ''} onChange={(v) => updateData('pacingTendency', v)} type="textarea" placeholder="Individual speech patterns rendered on page, how far committed" />
          <Field label="Subtext Rendering" value={data.chapterStructure || ''} onChange={(v) => updateData('chapterStructure', v)} type="textarea" placeholder="How much unsaid meaning is surfaced in prose vs left to inference" />
          <Field label="Tag Style" value={data.sceneTransitions || ''} onChange={(v) => updateData('sceneTransitions', v)} placeholder="Plain attribution / action beats / mix" />
        </div>
      </Section>

      <Section title="Rhythm & Pacing">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Scene Pacing Modes" value={data.pacingTendency || ''} onChange={(v) => updateData('pacingTendency', v)} type="textarea" placeholder="How action/emotional/transitional scenes are rhythmically distinguished" />
          <Field label="White Space Philosophy" value={data.chapterStructure || ''} onChange={(v) => updateData('chapterStructure', v)} type="textarea" placeholder="Paragraph/section/chapter breaks as pacing tools" />
          <Field label="Chapter Length Philosophy" value={data.sceneTransitions || ''} onChange={(v) => updateData('sceneTransitions', v)} placeholder="Long immersive vs short punchy vs varied" />
        </div>
      </Section>

      <Section title="Voice Samples" description="Actual prose samples for voice calibration">
        <div className="space-y-3">
          {(data.voiceSamples || []).map((sample, idx) => (
            <div key={sample.id} className="card p-4 bg-ink-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-ink-400" />
                  <span className="text-sm font-medium text-ink-600">Sample {idx + 1}</span>
                </div>
                <button className="btn btn-danger !py-1 !px-2" onClick={() => removeSample(idx)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                <Field label="Label" value={sample.label} onChange={(v) => updateSample(idx, 'label', v)} placeholder="e.g. Marcus in conversation, narration opening" />
                <Field label="Text" value={sample.text} onChange={(v) => updateSample(idx, 'text', v)} type="textarea" placeholder="Paste a sample of prose here" />
                <Field label="Analysis" value={sample.analysis || ''} onChange={(v) => updateSample(idx, 'analysis', v)} type="textarea" placeholder="What this sample reveals about voice" />
              </div>
            </div>
          ))}
          <button className="btn btn-secondary" onClick={addSample}>
            <Plus className="w-4 h-4" /> Add Voice Sample
          </button>
        </div>
      </Section>
    </div>
  );

  return (
    <LayerShell
      projectId={projectId}
      mode="style"
      title="Style & Prose"
      subtitle="Discover how your story sounds — sensory palette, voice, rhythm, and pacing"
      icon={<Palette className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
      accentColor="bg-teal-100 dark:bg-teal-900/30"
      coldStartQuestions={COLD_START}
      manualView={manualView}
      onDataExtracted={() => setReloadKey((k) => k + 1)}
    />
  );
}
