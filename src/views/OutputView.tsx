import { useState, useEffect, useCallback } from 'react';
import { useCrudList } from '@/hooks/useCrudList';
import { supabase } from '@/lib/supabase';
import { OutputJob, OutputJobData, Character, PlotEvent, PlotPillar, Relationship, WorldLocation, WorldLaw, WorldRecord, Theme, StyleConfig, WorldSnapshot, PILLAR_METAS } from '@/lib/types';
import { OUTPUT_STEPS } from '@/lib/constants';
import { Badge, EmptyState, ConfirmDelete, Modal, Field } from '@/components/ui/Field';
import {
  FileText,
  Plus,
  Trash2,
  ListTree,
  Clock,
  Layers,
  Building2,
  ClipboardList,
  PenLine,
  CheckCircle,
  Copy,
  Download,
} from 'lucide-react';

interface OutputViewProps {
  projectId: string | null;
}

const STEP_ICONS: Record<string, typeof ListTree> = {
  outline: ListTree,
  timeline: Clock,
  scene_list: Layers,
  scaffolding: Building2,
  briefs: ClipboardList,
  full_draft: PenLine,
};

export function OutputView({ projectId }: OutputViewProps) {
  const { items: jobs, loading, create, update, remove } = useCrudList<OutputJob>('output_jobs', projectId);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  // Data for density check
  const [density, setDensity] = useState({
    characters: 0,
    relationships: 0,
    plotEvents: 0,
    pillars: 0,
    worldObjects: 0,
  themes: 0,
    styleConfigs: 0,
  voiceSamples: 0,
    confirmedInnerWorld: 0,
  consequenceChains: 0,
  fillerCount: 0,
  subplots: 0,
  snapshots: 0,
  symbols: 0,
  voiceProfiles: 0,
  locations: 0,
    laws: 0,
    records: 0,
  recordsWithTruth: 0,
  locationsWithSensory: 0,
    relationshipsWithIceberg: 0,
  charactersWithVoice: 0,
  charactersWithFingerprint: 0,
  confirmedVoicePrompts: 0,
    confirmedLie: 0,
    confirmedNeed: 0,
    pp2GhostConnected: false,
    pp2Exists: false,
  climaxExists: false,
    povConfirmed: false,
    chapterStructure: false,
  sensoryPaletteConfirmed: false,
    masterVonnegutShape: false,
    centralQuestionConfirmed: false,
  moralArgumentStated: false,
  outlineComplete: false,
    timelineComplete: false,
    sceneListComplete: false,
    scaffoldingComplete: false,
    briefsComplete: false,
  });

  const scanDensity = useCallback(async () => {
    if (!projectId) return;
    const [chars, rels, events, pillars, locs, laws, recs, snaps, subplots, themes, styles, jobs2] = await Promise.all([
      supabase.from('characters').select('*').eq('project_id', projectId),
      supabase.from('relationships').select('*').eq('project_id', projectId),
      supabase.from('plot_events').select('*').eq('project_id', projectId),
      supabase.from('plot_pillars').select('*').eq('project_id', projectId),
      supabase.from('world_locations').select('*').eq('project_id', projectId),
      supabase.from('world_laws').select('*').eq('project_id', projectId),
      supabase.from('world_records').select('*').eq('project_id', projectId),
      supabase.from('world_snapshots').select('*').eq('project_id', projectId),
      supabase.from('subplots').select('*').eq('project_id', projectId),
      supabase.from('themes').select('*').eq('project_id', projectId),
      supabase.from('style_config').select('*').eq('project_id', projectId),
      supabase.from('output_jobs').select('*').eq('project_id', projectId),
    ]);

    const charData = (chars.data as Character[]) || [];
    const relData = (rels.data as Relationship[]) || [];
    const eventData = (events.data as PlotEvent[]) || [];
    const pillarData = (pillars.data as PlotPillar[]) || [];
    const locData = (locs.data as WorldLocation[]) || [];
    const lawData = (laws.data as WorldLaw[]) || [];
    const recData = (recs.data as WorldRecord[]) || [];
    const snapData = (snaps.data as WorldSnapshot[]) || [];
    const subplotData = (subplots.data as any[]) || [];
    const themeData = (themes.data as Theme[]) || [];
    const styleData = (styles.data as StyleConfig[]) || [];

    const confirmedInnerWorld = charData.filter((c) => c.data.theLie && c.data.theTruth && c.data.theWound).length;
    const consequenceChains = eventData.filter((e) => e.data.consequenceTypes && e.data.consequenceTypes.length > 0).length;
    const fillerCount = eventData.filter((e) => !e.data.consequenceTypes || e.data.consequenceTypes.length === 0).length;
    const relationshipsWithIceberg = relData.filter((r) => r.data.rootConflict && r.data.surfaceConflict).length;
    const charactersWithVoice = charData.filter((c) => c.data.voicePatterns && Object.keys(c.data.voicePatterns).length > 3).length;
    const confirmedLie = charData.filter((c) => c.data.theLie).length;
    const confirmedNeed = charData.filter((c) => c.data.need).length;
    const locationsWithSensory = locData.filter((l) => l.data.physicalDescription).length;
    const recordsWithTruth = recData.filter((r) => r.data.trueVersion).length;
    const symbols = themeData[0]?.data.symbols?.length || 0;
    const voiceSamples = styleData[0]?.data?.voiceSamples?.length || 0;
    const pp2 = pillarData.find((p) => p.pillar_type === 'plot_point_2');
    const climax = pillarData.find((p) => p.pillar_type === 'climax');
    const hasPov = styleData[0]?.data?.povApproach;
    const hasChapterStructure = styleData[0]?.data?.chapterStructure;
    const hasMasterShape = themeData[0]?.data?.masterVonnegutShape;
    const hasCentralQ = themeData[0]?.data?.centralQuestion;
    const hasMoralArg = themeData[0]?.data?.moralArgument;

    setDensity({
      characters: charData.length,
      relationships: relData.length,
      plotEvents: eventData.length,
      pillars: pillarData.filter((p) => Object.values(p.data).some((v) => v && typeof v === 'string' && v.length > 0)).length,
      worldObjects: locData.length + lawData.length + recData.length,
      themes: themeData.length,
      styleConfigs: styleData?.length || 0,
      voiceSamples,
      confirmedInnerWorld,
      consequenceChains,
      fillerCount,
      subplots: subplotData.length,
      snapshots: snapData.length,
      symbols,
      voiceProfiles: charactersWithVoice,
      locations: locData.length,
      laws: lawData.length,
      records: recData.length,
      recordsWithTruth,
      locationsWithSensory,
      relationshipsWithIceberg,
      charactersWithVoice,
      charactersWithFingerprint: 0,
      confirmedVoicePrompts: voiceSamples,
      confirmedLie,
      confirmedNeed,
      pp2GhostConnected: !!(pp2?.data?.connectionToGhost),
      pp2Exists: !!(pp2 && Object.values(pp2.data).some((v) => v && typeof v === 'string' && v.length > 0)),
      climaxExists: !!(climax && Object.values(climax.data).some((v) => v && typeof v === 'string' && v.length > 0)),
      povConfirmed: !!hasPov,
      chapterStructure: !!hasChapterStructure,
      sensoryPaletteConfirmed: !!(styleData[0]?.data?.visualPalette),
      masterVonnegutShape: !!hasMasterShape,
      centralQuestionConfirmed: !!hasCentralQ,
      moralArgumentStated: !!hasMoralArg,
      outlineComplete: false,
      timelineComplete: false,
      sceneListComplete: false,
      scaffoldingComplete: false,
      briefsComplete: false,
    });
  }, [projectId]);

  useEffect(() => { scanDensity(); }, [scanDensity]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || null;

  const generateOutline = useCallback(async () => {
    if (!projectId) return;
    const { data: pillars } = await supabase.from('plot_pillars').select('*').eq('project_id', projectId);
    const { data: events } = await supabase.from('plot_events').select('*').eq('project_id', projectId).order('sort_order');
    const { data: subplots } = await supabase.from('subplots').select('*').eq('project_id', projectId);
    const { data: chars } = await supabase.from('characters').select('*').eq('project_id', projectId);
    const { data: gaps } = await supabase.from('structural_gaps').select('*').eq('project_id', projectId).eq('resolved', false);

    const pillarData = (pillars as PlotPillar[]) || [];
    const eventData = (events as PlotEvent[]) || [];
    const subplotData = (subplots as any[]) || [];
    const charData = (chars as Character[]) || [];
    const gapData = (gaps as any[]) || [];

    let output = `# OUTLINE: ${density.characters > 0 ? 'Story' : 'Untitled'}\n\n`;

    output += `## Structural Pillars\n\n`;
    PILLAR_METAS.forEach((meta) => {
      const pillar = pillarData.find((p) => p.pillar_type === meta.type);
      output += `### ${meta.label}\n`;
      if (pillar) {
        const d = pillar.data;
        const fields = Object.entries(d).filter(([, v]) => v && typeof v === 'string' && (v as string).length > 0);
        if (fields.length === 0) {
          output += `*No data yet*\n\n`;
        } else {
          fields.forEach(([key, val]) => {
            output += `- **${key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}**: ${val}\n`;
          });
          output += `\n`;
        }
      } else {
        output += `*Not yet defined*\n\n`;
      }
    });

    output += `## Characters\n\n`;
    charData.forEach((c) => {
      output += `### ${c.name}\n`;
      if (c.data.archetype) output += `- Archetype: ${c.data.archetype}\n`;
      if (c.data.theLie) output += `- The Lie: ${c.data.theLie}\n`;
      if (c.data.theTruth) output += `- The Truth: ${c.data.theTruth}\n`;
      if (c.data.theWound) output += `- The Wound: ${c.data.theWound}\n`;
      if (c.data.want) output += `- Want: ${c.data.want}\n`;
      if (c.data.need) output += `- Need: ${c.data.need}\n`;
      if (c.data.arcType) output += `- Arc: ${c.data.arcType}\n`;
      output += `\n`;
    });

    output += `## Plot Events (${eventData.length})\n\n`;
    eventData.forEach((e, i) => {
      output += `${i + 1}. ${e.description}\n`;
      if (e.data.consequenceTypes?.length) {
        output += `   Consequences: ${e.data.consequenceTypes.join(', ')}\n`;
      } else {
        output += `   *No consequence — flagged as filler*\n`;
      }
    });

    output += `\n## Subplots (${subplotData.length})\n\n`;
    subplotData.forEach((s) => {
      output += `### ${s.label}\n`;
      if (s.data.charactersDriving) output += `- Characters: ${s.data.charactersDriving}\n`;
      if (s.data.subplotArcType) output += `- Arc: ${s.data.subplotArcType}\n`;
      if (s.data.intersectionPoints) output += `- Intersections: ${s.data.intersectionPoints}\n`;
      output += `\n`;
    });

    if (gapData.length > 0) {
      output += `## Open Gap Flags (${gapData.length})\n\n`;
      gapData.forEach((g) => {
        output += `- **${g.gap_type}**: ${g.description}\n`;
      });
    }

    return output;
  }, [projectId, density]);

  const handleGenerate = async (jobType: string) => {
    let output = '';
    if (jobType === 'outline') {
      output = await generateOutline();
    } else if (jobType === 'gap_report') {
      const { data: gaps } = await supabase.from('structural_gaps').select('*').eq('project_id', projectId).eq('resolved', false);
      output = `# GAP REPORT\n\n`;
      (gaps as any[])?.forEach((g) => {
        output += `- **${g.gap_type}** (${g.severity}): ${g.description}\n`;
      });
      if (!gaps || gaps.length === 0) output += `No open gaps detected.\n`;
    } else if (jobType === 'character_profile') {
      const { data: chars } = await supabase.from('characters').select('*').eq('project_id', projectId);
      output = `# CHARACTER PROFILES\n\n`;
      (chars as Character[])?.forEach((c) => {
        output += `## ${c.name}\n`;
        const d = c.data;
        if (d.aliases) output += `- Aliases: ${d.aliases}\n`;
        if (d.age) output += `- Age: ${d.age}\n`;
        if (d.socialRole) output += `- Social Role: ${d.socialRole}\n`;
        if (d.archetype) output += `- Archetype: ${d.archetype}\n`;
        if (d.theLie) output += `- The Lie: ${d.theLie}\n`;
        if (d.theTruth) output += `- The Truth: ${d.theTruth}\n`;
        if (d.theWound) output += `- The Wound: ${d.theWound}\n`;
        if (d.want) output += `- Want: ${d.want}\n`;
        if (d.need) output += `- Need: ${d.need}\n`;
        if (d.fear) output += `- Fear: ${d.fear}\n`;
        if (d.flaw) output += `- Flaw: ${d.flaw}\n`;
        if (d.strength) output += `- Strength: ${d.strength}\n`;
        if (d.arcType) output += `- Arc Type: ${d.arcType}\n`;
        output += `\n`;
      });
    } else if (jobType === 'relationship_map') {
      const { data: rels } = await supabase.from('relationships').select('*').eq('project_id', projectId);
      output = `# RELATIONSHIP MAP\n\n`;
      (rels as Relationship[])?.forEach((r) => {
        output += `## ${r.label}\n`;
        if (r.data.parties) output += `- Parties: ${r.data.parties}\n`;
        if (r.data.relationshipType) output += `- Type: ${r.data.relationshipType}\n`;
        if (r.data.powerBalance) output += `- Power: ${r.data.powerBalance}\n`;
        if (r.data.surfaceConflict) output += `- Surface Conflict: ${r.data.surfaceConflict}\n`;
        if (r.data.rootConflict) output += `- Root Conflict: ${r.data.rootConflict}\n`;
        if (r.data.theUnsaidThing) output += `- The Unsaid Thing: ${r.data.theUnsaidThing}\n`;
        if (r.data.arcType) output += `- Arc: ${r.data.arcType}\n`;
        output += `\n`;
      });
    } else if (jobType === 'world_reference') {
      const [locs, laws, recs] = await Promise.all([
        supabase.from('world_locations').select('*').eq('project_id', projectId),
        supabase.from('world_laws').select('*').eq('project_id', projectId),
        supabase.from('world_records').select('*').eq('project_id', projectId),
      ]);
      output = `# WORLD REFERENCE SHEET\n\n`;
      output += `## Locations\n\n`;
      (locs.data as WorldLocation[])?.forEach((l) => {
        output += `### ${l.name}\n`;
        if (l.data.physicalDescription) output += `- ${l.data.physicalDescription}\n`;
        if (l.data.officialHistory) output += `- Official History: ${l.data.officialHistory}\n`;
        if (l.data.trueHistory) output += `- True History: ${l.data.trueHistory}\n`;
        output += `\n`;
      });
      output += `## Laws\n\n`;
      (laws.data as WorldLaw[])?.forEach((l) => {
        output += `- ${l.statement}\n`;
        if (l.data.consequenceForViolation) output += `  Consequence: ${l.data.consequenceForViolation}\n`;
      });
      output += `\n## Records\n\n`;
      (recs.data as WorldRecord[])?.forEach((r) => {
        output += `### ${r.title}\n`;
        if (r.data.toldVersion) output += `- Told: ${r.data.toldVersion}\n`;
        if (r.data.trueVersion) output += `- True: ${r.data.trueVersion}\n`;
        output += `\n`;
      });
    } else if (jobType === 'meaning_summary') {
      const { data: themes } = await supabase.from('themes').select('*').eq('project_id', projectId).maybeSingle();
      output = `# MEANING SUMMARY\n\n`;
      const t = (themes as Theme | null)?.data;
      if (t) {
        if (t.centralQuestion) output += `## Central Question\n${t.centralQuestion}\n\n`;
        if (t.moralArgument) output += `## Moral Argument\n${t.moralArgument}\n\n`;
        if (t.symbols?.length) {
          output += `## Symbols & Motifs\n`;
          t.symbols.forEach((s) => output += `- ${s.description} (${s.type}) — ${s.meaning}\n`);
          output += `\n`;
        }
        if (t.masterVonnegutShape) output += `## Master Emotional Shape\n${t.masterVonnegutShape}\n\n`;
      } else {
        output += `No theme data yet.\n`;
      }
    } else {
      output = `*This output type requires more data. See the data gate requirements below.*\n`;
    }

    const created = await create({ job_type: jobType, status: 'generated', prompt: '', output, data: {} });
    if (created) setSelectedJobId(created.id);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-pulse text-ink-400">Loading...</div></div>;

  return (
    <div className="max-w-4xl mx-auto px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-3xl font-serif font-semibold text-ink-800 mb-1">Output Pipeline</h2>
        <p className="text-ink-400">Six-step pipeline from outline to full draft. Each step is a quality gate to the next. Never invent — always flag.</p>
      </div>

      {/* Pipeline Steps */}
      <div className="card p-6 mb-6">
        <h3 className="section-title mb-4">The Six-Step Pipeline</h3>
        <div className="space-y-2">
          {OUTPUT_STEPS.map((step, idx) => {
            const Icon = STEP_ICONS[step.id] || FileText;
            const existingJob = jobs.find((j) => j.job_type === step.id);
            return (
              <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border border-ink-200 hover:border-ink-300 transition-all">
                <div className="w-8 h-8 rounded-lg bg-ink-100 flex items-center justify-center shrink-0 text-sm font-serif font-semibold text-ink-500">
                  {idx + 1}
                </div>
                <Icon className="w-4 h-4 text-ink-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-700">{step.label}</p>
                  <p className="text-xs text-ink-400">{step.description}</p>
                </div>
                {existingJob ? (
                  <button className="btn btn-secondary !py-1 text-xs" onClick={() => setSelectedJobId(existingJob.id)}>
                    <Eye className="w-3 h-3" /> View
                  </button>
                ) : (
                  <button className="btn btn-primary !py-1 text-xs" onClick={() => handleGenerate(step.id)}>
                    <Plus className="w-3 h-3" /> Generate
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reference Outputs */}
      <div className="card p-6 mb-6">
        <h3 className="section-title mb-4">Reference Outputs (on-demand)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { id: 'character_profile', label: 'Character Profile' },
            { id: 'relationship_map', label: 'Relationship Map' },
            { id: 'world_reference', label: 'World Reference' },
            { id: 'meaning_summary', label: 'Meaning Summary' },
            { id: 'gap_report', label: 'Gap Report' },
          ].map((ref) => (
            <button
              key={ref.id}
              className="btn btn-secondary text-xs"
              onClick={() => handleGenerate(ref.id)}
            >
              {ref.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Density */}
      <div className="card p-6 mb-6">
        <h3 className="section-title mb-4">Data Density</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Characters', value: density.characters, min: 1 },
            { label: 'Inner World (full)', value: density.confirmedInnerWorld, min: 1 },
            { label: 'Relationships', value: density.relationships, min: 1 },
            { label: 'Iceberg data', value: density.relationshipsWithIceberg, min: 1 },
            { label: 'Plot Events', value: density.plotEvents, min: 10 },
            { label: 'Consequence chains', value: density.consequenceChains, min: 3 },
            { label: 'Pillars filled', value: density.pillars, min: 5 },
            { label: 'Subplots', value: density.subplots, min: 1 },
            { label: 'World objects', value: density.worldObjects, min: 5 },
            { label: 'Snapshots', value: density.snapshots, min: 5 },
            { label: 'Symbols', value: density.symbols, min: 1 },
            { label: 'Voice samples', value: density.voiceSamples, min: 4 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              {item.value >= item.min ? (
                <CheckCircle className="w-4 h-4 text-sage-600 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-ink-200 shrink-0" />
              )}
              <div>
                <p className="text-xs font-medium text-ink-600">{item.label}</p>
                <p className="text-xs text-ink-400">{item.value} / {item.min} min</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Jobs */}
      {jobs.length > 0 && !selectedJob && (
        <div>
          <h3 className="section-title mb-4">Generated Outputs ({jobs.length})</h3>
          <div className="space-y-2">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className="card card-hover p-4 text-left w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-ink-400" />
                    <span className="text-sm font-medium text-ink-700 capitalize">
                      {job.job_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <Badge color="success">{job.status}</Badge>
                </div>
                <p className="text-xs text-ink-400 mt-1">
                  {new Date(job.created_at).toLocaleDateString()} · {job.output.length} chars
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Job View */}
      {selectedJob && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <button className="btn btn-ghost" onClick={() => setSelectedJobId(null)}>
              <span className="text-sm">&larr; All Outputs</span>
            </button>
            <div className="flex items-center gap-2">
              <button className="btn btn-secondary !py-1.5" onClick={() => handleCopy(selectedJob.output)}>
                {copied ? <CheckCircle className="w-4 h-4 text-sage-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge color="success">{selectedJob.status}</Badge>
              <span className="text-sm text-ink-400 capitalize">{selectedJob.job_type.replace(/_/g, ' ')}</span>
            </div>
            <pre className="text-sm text-ink-700 whitespace-pre-wrap font-mono leading-relaxed bg-ink-50 rounded-lg p-4 overflow-x-auto scrollbar-thin">
              {selectedJob.output}
            </pre>
          </div>

          <ConfirmDelete
            open={showDelete}
            onClose={() => setShowDelete(false)}
            onConfirm={() => { remove(selectedJob.id); setSelectedJobId(null); }}
            itemName={selectedJob.job_type}
          />
        </div>
      )}
    </div>
  );
}
