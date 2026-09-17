import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Theme, ThemeData } from '@/lib/types';
import { Field, Section, Badge } from '@/components/ui/Field';
import { Sparkles, Plus, Trash2, Palette } from 'lucide-react';
import { LayerShell } from '@/components/LayerShell';

interface MeaningViewProps {
  projectId: string | null;
}

const COLD_START = [
  "What's your story really about — not the plot, but the human question underneath?",
  "What question does your story ask about how people work?",
  "When someone finishes your story, what do you want them to be thinking about?",
  "Is there a question your story is arguing with itself about?",
];

export function MeaningView({ projectId }: MeaningViewProps) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const loadTheme = useCallback(async () => {
    if (!projectId) return;
    const { data } = await supabase.from('themes').select('*').eq('project_id', projectId).maybeSingle();
    setTheme(data as Theme | null);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { loadTheme(); }, [loadTheme, reloadKey]);

  const ensureTheme = useCallback(async (): Promise<Theme | null> => {
    if (theme) return theme;
    const { data } = await supabase.from('themes').insert({ project_id: projectId, data: {} }).select().maybeSingle();
    if (data) { setTheme(data as Theme); return data as Theme; }
    return null;
  }, [theme, projectId]);

  const updateData = useCallback(async (field: keyof ThemeData, value: unknown) => {
    const current = await ensureTheme();
    if (!current) return;
    const newData = { ...current.data, [field]: value };
    const { data } = await supabase.from('themes').update({ data: newData, updated_at: new Date().toISOString() }).eq('id', current.id).select().maybeSingle();
    if (data) setTheme(data as Theme);
  }, [ensureTheme]);

  const addSymbol = useCallback(async () => {
    const current = await ensureTheme();
    if (!current) return;
    const symbols = current.data.symbols || [];
    const newSymbol = { id: crypto.randomUUID(), description: '', type: 'visual object', inferredVsDeclared: 'declared', firstAppearance: '', recurrencePattern: '', meaning: '', evolution: '', connectionToTheme: '' };
    updateData('symbols', [...symbols, newSymbol]);
  }, [ensureTheme, updateData]);

  const updateSymbol = (idx: number, field: string, value: string) => {
    if (!theme?.data.symbols) return;
    const symbols = [...theme.data.symbols];
    symbols[idx] = { ...symbols[idx], [field]: value };
    updateData('symbols', symbols);
  };

  const removeSymbol = (idx: number) => {
    if (!theme?.data.symbols) return;
    updateData('symbols', theme.data.symbols.filter((_, i) => i !== idx));
  };

  if (loading || !projectId) return <div className="flex items-center justify-center h-full"><div className="animate-pulse text-ink-400">Loading...</div></div>;

  const data = theme?.data || {};

  const manualView = (
    <div className="max-w-4xl mx-auto px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-semibold text-ink-800 mb-1">Meaning & Resonance</h2>
        <p className="text-ink-400 text-sm">Theme is never asserted — it is noticed, named quietly, and offered.</p>
      </div>

      <div className="card p-4 mb-6 bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>The non-negotiable rule:</strong> Theme is offered, not asserted. The AI presents inferences as questions or gentle observations, then steps back. If the writer confirms, deepens, or corrects it, update accordingly.
        </p>
      </div>

      <Section title="Central Question" description="The single interrogative at the story's heart" defaultOpen>
        <Field label="Question Statement" value={data.centralQuestion || ''} onChange={(v) => updateData('centralQuestion', v)} type="textarea" placeholder="One sentence, plain language" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Inferred From" value={data.centralQuestionInferredFrom || ''} onChange={(v) => updateData('centralQuestionInferredFrom', v)} type="textarea" placeholder="Which character Lies, world wounds, relationship root conflicts point here" />
          <Field label="Confidence" value={data.centralQuestionConfidence || ''} onChange={(v) => updateData('centralQuestionConfidence', v)} type="select" options={['High', 'Medium', 'Tentative']} />
          <Field label="Writer Confirmed" value={data.centralQuestionConfirmed || ''} onChange={(v) => updateData('centralQuestionConfirmed', v)} type="select" options={['Unconfirmed', 'Confirmed', 'Revised', 'Prefers not to name']} />
          <Field label="Answer Stance" value={data.answerStance || ''} onChange={(v) => updateData('answerStance', v)} placeholder="Does story answer it, leave it open, or argue no answer exists?" />
          <Field label="Answer Delivered By" value={data.answerDeliveredBy || ''} onChange={(v) => updateData('answerDeliveredBy', v)} placeholder="Character transformation / world state / relationship resolution / withheld" />
        </div>
        <Field label="Alternative Readings" value={data.alternativeReadings || ''} onChange={(v) => updateData('alternativeReadings', v)} type="textarea" placeholder="Other questions the data could support" />
      </Section>

      <Section title="Moral Argument" description="What the story believes — its position on the central question">
        <Field label="Argument Statement" value={data.moralArgument || ''} onChange={(v) => updateData('moralArgument', v)} type="textarea" placeholder="This story argues that..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Inferred From" value={data.moralArgumentInferredFrom || ''} onChange={(v) => updateData('moralArgumentInferredFrom', v)} type="textarea" placeholder="What's rewarded/punished in plot, character resolutions" />
          <Field label="How It Is Proven" value={data.moralArgumentProven || ''} onChange={(v) => updateData('moralArgumentProven', v)} type="textarea" placeholder="Specific demonstrating events" />
          <Field label="How It Is Tested" value={data.moralArgumentTested || ''} onChange={(v) => updateData('moralArgumentTested', v)} type="textarea" placeholder="Moments of most serious challenge" />
          <Field label="Counterargument Weight" value={data.counterargumentWeight || ''} onChange={(v) => updateData('counterargumentWeight', v)} placeholder="Genuine dramatic weight, or dismissed?" />
          <Field label="Ambiguity Level" value={data.ambiguityLevel || ''} onChange={(v) => updateData('ambiguityLevel', v)} type="select" options={['Clear and resolved', 'Deliberately open', 'Intentionally unanswerable']} />
        </div>
      </Section>

      <Section title="Symbols & Motifs" description="Often unplanned — AI identifies patterns the writer didn't consciously create">
        <div className="space-y-3">
          {(data.symbols || []).map((symbol, idx) => (
            <div key={symbol.id} className="card p-4 bg-ink-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-ink-400" />
                  <span className="text-sm font-medium text-ink-600">Symbol {idx + 1}</span>
                  {symbol.inferredVsDeclared === 'inferred' && <Badge color="amber">AI-inferred</Badge>}
                </div>
                <button className="btn btn-danger !py-1 !px-2" onClick={() => removeSymbol(idx)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Description" value={symbol.description} onChange={(v) => updateSymbol(idx, 'description', v)} placeholder="What the motif is" />
                <Field label="Type" value={symbol.type} onChange={(v) => updateSymbol(idx, 'type', v)} type="select" options={['Visual object', 'Recurring situation', 'Verbal phrase', 'Color', 'Sound', 'Weather', 'Animal', 'Number', 'Gesture']} />
                <Field label="Inferred vs. Declared" value={symbol.inferredVsDeclared} onChange={(v) => updateSymbol(idx, 'inferredVsDeclared', v)} type="select" options={['Declared', 'Inferred']} />
                <Field label="First Appearance" value={symbol.firstAppearance} onChange={(v) => updateSymbol(idx, 'firstAppearance', v)} />
                <Field label="Recurrence Pattern" value={symbol.recurrencePattern} onChange={(v) => updateSymbol(idx, 'recurrencePattern', v)} type="textarea" />
                <Field label="Meaning Carried" value={symbol.meaning} onChange={(v) => updateSymbol(idx, 'meaning', v)} type="textarea" placeholder="What it accumulates across appearances" />
                <Field label="Evolution" value={symbol.evolution} onChange={(v) => updateSymbol(idx, 'evolution', v)} type="textarea" placeholder="Does meaning shift/invert across the arc?" />
                <Field label="Connection to Theme" value={symbol.connectionToTheme} onChange={(v) => updateSymbol(idx, 'connectionToTheme', v)} type="textarea" />
              </div>
            </div>
          ))}
          <button className="btn btn-secondary" onClick={addSymbol}>
            <Plus className="w-4 h-4" /> Add Symbol/Motif
          </button>
        </div>
      </Section>

      <Section title="Emotional Architecture" description="The overall felt shape, synthesized from individual curves">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Master Vonnegut Shape" value={data.masterVonnegutShape || ''} onChange={(v) => updateData('masterVonnegutShape', v)} placeholder="Overall fortune curve" />
          <Field label="Emotional Register at Open" value={data.emotionalRegisterAtOpen || ''} onChange={(v) => updateData('emotionalRegisterAtOpen', v)} placeholder="Baseline established in Act One" />
          <Field label="Intended Emotional Destination" value={data.intendedEmotionalDestination || ''} onChange={(v) => updateData('intendedEmotionalDestination', v)} type="textarea" placeholder="How writer wants reader to feel at close" />
          <Field label="Tension Rhythm" value={data.tensionRhythm || ''} onChange={(v) => updateData('tensionRhythm', v)} type="textarea" placeholder="Pacing of escalation/release" />
          <Field label="Dread-to-Hope Ratio" value={data.dreadToHopeRatio || ''} onChange={(v) => updateData('dreadToHopeRatio', v)} />
          <Field label="Emotional High Point" value={data.emotionalHighPoint || ''} onChange={(v) => updateData('emotionalHighPoint', v)} type="textarea" placeholder="Peak positive fortune, when/why" />
          <Field label="Emotional Low Point" value={data.emotionalLowPoint || ''} onChange={(v) => updateData('emotionalLowPoint', v)} type="textarea" placeholder="Darkest moment, when/why, how long before release" />
          <Field label="The Gut-Punch" value={data.theGutPunch || ''} onChange={(v) => updateData('theGutPunch', v)} type="textarea" placeholder="Single moment intended to hit hardest" />
          <Field label="The Exhale" value={data.theExhale || ''} onChange={(v) => updateData('theExhale', v)} type="textarea" placeholder="Where reader gets genuine release after sustained tension" />
          <Field label="Arc Harmony" value={data.arcHarmony || ''} onChange={(v) => updateData('arcHarmony', v)} type="textarea" placeholder="Do individual curves harmonize, or pull against each other?" />
        </div>
      </Section>

      <Section title="Resonance Mapping" description="How theme and emotional shape work together — or deliberately against each other">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Alignment Assessment" value={data.alignmentAssessment || ''} onChange={(v) => updateData('alignmentAssessment', v)} type="textarea" placeholder="Reinforce, productive tension, or accidental contradiction?" />
          <Field label="Emotional Proof of Theme" value={data.emotionalProofOfTheme || ''} onChange={(v) => updateData('emotionalProofOfTheme', v)} type="textarea" placeholder="The scene where reader feels the theme, not just understands it" />
          <Field label="Intentional Dissonance" value={data.intentionalDissonance || ''} onChange={(v) => updateData('intentionalDissonance', v)} type="textarea" placeholder="Places where felt experience complicates the argument" />
          <Field label="The Gap" value={data.resonanceGap || ''} onChange={(v) => updateData('resonanceGap', v)} type="textarea" placeholder="If theme and emotional shape diverge, is it intentional? What does it produce?" />
          <Field label="Resonance at Close" value={data.resonanceAtClose || ''} onChange={(v) => updateData('resonanceAtClose', v)} type="textarea" placeholder="Do intellectual argument and felt destination arrive at the same place?" />
        </div>
      </Section>
    </div>
  );

  return (
    <LayerShell
      projectId={projectId}
      mode="meaning"
      title="Meaning & Resonance"
      subtitle="Theme is offered, not asserted — let's discover what your story is really about"
      icon={<Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
      accentColor="bg-amber-100 dark:bg-amber-900/30"
      coldStartQuestions={COLD_START}
      manualView={manualView}
      onDataExtracted={() => setReloadKey((k) => k + 1)}
    />
  );
}
