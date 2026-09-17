import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Project, ViewId } from '@/lib/types';
import { Field } from '@/components/ui/Field';
import {
  Users,
  Heart,
  GitBranch,
  Globe,
  Sparkles,
  Palette,
  AlertTriangle,
  FileText,
  Save,
  Plus,
  Trash2,
  FolderOpen,
  Upload,
  X,
  Compass,
  ArrowRight,
  CheckCircle2,
  Circle,
  Loader2,
  BookOpen,
  MessageCircle,
  TrendingUp,
  Lightbulb,
  Mountain,
} from 'lucide-react';

interface DashboardProps {
  project: Project | null;
  projects: Project[];
  onUpdateProject: (updates: Partial<Project>) => void;
  onSelectProject: (id: string) => void;
  onCreateProject: (title?: string) => Promise<Project | null>;
  onDeleteProject: (id: string) => Promise<void>;
  onNavigate: (view: ViewId) => void;
}

interface SectionCounts {
  characters: number;
  relationships: number;
  plotEvents: number;
  plotPillars: number;
  subplots: number;
  worldLocations: number;
  worldLaws: number;
  worldRecords: number;
  worldSnapshots: number;
  themes: number;
  styleConfigs: number;
  structuralGaps: number;
  outputJobs: number;
  storyChatMessages: number;
  worldChatMessages: number;
}

const GENRE_OPTIONS = [
  { value: 'literary', label: 'Literary Fiction', desc: 'Character-driven, psychologically rich' },
  { value: 'fantasy', label: 'Fantasy', desc: 'Magic systems, world-building, epic scope' },
  { value: 'scifi', label: 'Science Fiction', desc: 'What-if premises, technology, philosophy' },
  { value: 'mystery', label: 'Mystery / Crime', desc: 'Investigation, information asymmetry, reveals' },
  { value: 'romance', label: 'Romance', desc: 'Relationship arcs, emotional beats, connection' },
  { value: 'horror', label: 'Horror', desc: "Dread, the unknown, what shouldn't be" },
  { value: 'thriller', label: 'Thriller', desc: 'Ticking clock, escalating stakes, propulsion' },
  { value: 'pulp', label: 'Pulp / Action', desc: 'Fast, fun, set pieces, momentum' },
  { value: 'historical', label: 'Historical Fiction', desc: 'Period accuracy, social constraints, power' },
  { value: 'ya', label: 'Young Adult', desc: 'Identity, belonging, authority vs. self' },
  { value: 'memoir', label: 'Memoir / Narrative', desc: 'Retrospection, voice, truth through telling' },
  { value: 'screenplay', label: 'Screenplay / Film', desc: 'Visual storytelling, page-count structure' },
  { value: 'general', label: 'General / Not Sure Yet', desc: 'Flexible — let the AI adapt to your material' },
];

interface SectionProgress {
  id: string;
  label: string;
  icon: typeof Users;
  view: ViewId;
  color: string;
  bgColor: string;
  ringColor: string;
  percent: number;
  counts: string;
  status: 'empty' | 'started' | 'progressing' | 'developed';
}

export function DashboardView({
  project,
  projects,
  onUpdateProject,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onNavigate,
}: DashboardProps) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [logline, setLogline] = useState('');
  const [notes, setNotes] = useState('');
  const [counts, setCounts] = useState<SectionCounts | null>(null);
  const [saving, setSaving] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setGenre(project.genre);
      setLogline(project.logline);
      setNotes(project.notes);
    }
  }, [project]);

  const loadCounts = useCallback(async () => {
    if (!project) return;
    const [
      chars, rels, events, pillars, subs,
      locs, laws, recs, snaps,
      themes, styles, gaps, jobs,
      storyMsgs, worldMsgs,
    ] = await Promise.all([
      supabase.from('characters').select('id', { count: 'exact' }).eq('project_id', project.id),
      supabase.from('relationships').select('id', { count: 'exact' }).eq('project_id', project.id),
      supabase.from('plot_events').select('id', { count: 'exact' }).eq('project_id', project.id),
      supabase.from('plot_pillars').select('id', { count: 'exact' }).eq('project_id', project.id),
      supabase.from('subplots').select('id', { count: 'exact' }).eq('project_id', project.id),
      supabase.from('world_locations').select('id', { count: 'exact' }).eq('project_id', project.id),
      supabase.from('world_laws').select('id', { count: 'exact' }).eq('project_id', project.id),
      supabase.from('world_records').select('id', { count: 'exact' }).eq('project_id', project.id),
      supabase.from('world_snapshots').select('id', { count: 'exact' }).eq('project_id', project.id),
      supabase.from('themes').select('id', { count: 'exact' }).eq('project_id', project.id),
      supabase.from('style_config').select('id', { count: 'exact' }).eq('project_id', project.id),
      supabase.from('structural_gaps').select('id', { count: 'exact' }).eq('project_id', project.id).eq('resolved', false),
      supabase.from('output_jobs').select('id', { count: 'exact' }).eq('project_id', project.id),
      supabase.from('chat_messages').select('id', { count: 'exact' }).eq('project_id', project.id).eq('category', 'story'),
      supabase.from('chat_messages').select('id', { count: 'exact' }).eq('project_id', project.id).eq('category', 'world'),
    ]);

    setCounts({
      characters: chars.count || 0,
      relationships: rels.count || 0,
      plotEvents: events.count || 0,
      plotPillars: pillars.count || 0,
      subplots: subs.count || 0,
      worldLocations: locs.count || 0,
      worldLaws: laws.count || 0,
      worldRecords: recs.count || 0,
      worldSnapshots: snaps.count || 0,
      themes: themes.count || 0,
      styleConfigs: styles.count || 0,
      structuralGaps: gaps.count || 0,
      outputJobs: jobs.count || 0,
      storyChatMessages: storyMsgs.count || 0,
      worldChatMessages: worldMsgs.count || 0,
    });
  }, [project]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const handleSave = () => {
    setSaving(true);
    onUpdateProject({ title, genre, logline, notes });
    setTimeout(() => setSaving(false), 600);
  };

  const handleCreateProject = async () => {
    setCreating(true);
    const newProj = await onCreateProject(newProjectTitle.trim() || undefined);
    setCreating(false);
    if (newProj) {
      setNewProjectTitle('');
      setShowProjectManager(false);
    }
  };

  // Onboarding: is the project set up?
  const isSetup = !!(project && project.title && project.title !== 'Untitled Story' && project.genre);

  // Progress calculation per section
  const sections: SectionProgress[] = useMemo(() => {
    if (!counts) return [];
    const c = counts;

    const charPct = Math.min(100, (c.characters / 3) * 100);
    const relPct = Math.min(100, (c.relationships / 2) * 100);
    const plotPct = Math.min(100, ((c.plotPillars / 5) * 50 + (c.plotEvents / 5) * 30 + (c.subplots / 1) * 20));
    const worldPct = Math.min(100, ((c.worldLocations / 2) * 35 + (c.worldLaws / 2) * 30 + (c.worldRecords / 1) * 20 + (c.worldSnapshots / 3) * 15));
    const meaningPct = Math.min(100, (c.themes / 1) * 100);
    const stylePct = Math.min(100, (c.styleConfigs / 1) * 100);

    const getStatus = (pct: number): SectionProgress['status'] => {
      if (pct === 0) return 'empty';
      if (pct < 33) return 'started';
      if (pct < 80) return 'progressing';
      return 'developed';
    };

    return [
      {
        id: 'characters',
        label: 'Characters',
        icon: Users,
        view: 'characters',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        ringColor: 'stroke-amber-500',
        percent: Math.round(charPct),
        counts: `${c.characters} character${c.characters !== 1 ? 's' : ''}`,
        status: getStatus(charPct),
      },
      {
        id: 'relationships',
        label: 'Relationships',
        icon: Heart,
        view: 'relationships',
        color: 'text-rust-600',
        bgColor: 'bg-rust-100 dark:bg-rust-900/30',
        ringColor: 'stroke-rust-500',
        percent: Math.round(relPct),
        counts: `${c.relationships} relationship${c.relationships !== 1 ? 's' : ''}`,
        status: getStatus(relPct),
      },
      {
        id: 'plot',
        label: 'Plot',
        icon: GitBranch,
        view: 'plot',
        color: 'text-sage-600',
        bgColor: 'bg-sage-100 dark:bg-sage-900/30',
        ringColor: 'stroke-sage-500',
        percent: Math.round(plotPct),
        counts: `${c.plotPillars}/5 pillars, ${c.plotEvents} events`,
        status: getStatus(plotPct),
      },
      {
        id: 'world',
        label: 'World',
        icon: Globe,
        view: 'world',
        color: 'text-teal-600',
        bgColor: 'bg-teal-100 dark:bg-teal-900/30',
        ringColor: 'stroke-teal-500',
        percent: Math.round(worldPct),
        counts: `${c.worldLocations} locations, ${c.worldLaws} laws, ${c.worldRecords} records`,
        status: getStatus(worldPct),
      },
      {
        id: 'meaning',
        label: 'Meaning & Resonance',
        icon: Sparkles,
        view: 'meaning',
        color: 'text-violet-600',
        bgColor: 'bg-violet-100 dark:bg-violet-900/30',
        ringColor: 'stroke-violet-500',
        percent: Math.round(meaningPct),
        counts: c.themes > 0 ? 'Theme defined' : 'No theme yet',
        status: getStatus(meaningPct),
      },
      {
        id: 'style',
        label: 'Style & Prose',
        icon: Palette,
        view: 'style',
        color: 'text-sky-600',
        bgColor: 'bg-sky-100 dark:bg-sky-900/30',
        ringColor: 'stroke-sky-500',
        percent: Math.round(stylePct),
        counts: c.styleConfigs > 0 ? 'Style defined' : 'No style yet',
        status: getStatus(stylePct),
      },
    ];
  }, [counts]);

  const overallProgress = useMemo(() => {
    if (sections.length === 0) return 0;
    return Math.round(sections.reduce((sum, s) => sum + s.percent, 0) / sections.length);
  }, [sections]);

  // Smart suggestions based on progress
  const suggestions = useMemo(() => {
    if (!counts) return [];
    const c = counts;
    const tips: { title: string; description: string; action: string; view: ViewId; icon: typeof Users; color: string }[] = [];

    if (!isSetup) {
      tips.push({
        title: 'Set up your project',
        description: 'Give your story a title and pick a genre so the AI can ask the right questions.',
        action: 'Set up below',
        view: 'dashboard',
        icon: Compass,
        color: 'text-amber-500',
      });
    }

    if (c.storyChatMessages === 0 && isSetup) {
      tips.push({
        title: 'Start a Story Chat',
        description: 'The easiest way to begin — the AI asks you one question at a time and builds your story from your answers.',
        action: 'Open Story Chat',
        view: 'chat',
        icon: MessageCircle,
        color: 'text-amber-500',
      });
    }

    if (c.worldChatMessages === 0 && isSetup) {
      tips.push({
        title: 'Build your world',
        description: 'World Chat pulls locations, laws, and histories out of you through casual conversation.',
        action: 'Open World Chat',
        view: 'worldchat',
        icon: Mountain,
        color: 'text-teal-500',
      });
    }

    // Find the most neglected section
    if (isSetup && sections.length > 0) {
      const sorted = [...sections].sort((a, b) => a.percent - b.percent);
      const mostNeglected = sorted[0];
      if (mostNeglected && mostNeglected.percent < 50) {
        tips.push({
          title: `Focus on ${mostNeglected.label}`,
          description: `${mostNeglected.label} is at ${mostNeglected.percent}% — it's the most underdeveloped section. ${mostNeglected.counts}.`,
          action: `Open ${mostNeglected.label}`,
          view: mostNeglected.view,
          icon: mostNeglected.icon,
          color: mostNeglected.color,
        });
      }
    }

    // If characters exist but relationships don't
    if (c.characters >= 2 && c.relationships === 0) {
      tips.push({
        title: 'Add relationships',
        description: `You have ${c.characters} characters but no relationships defined. How do they connect?`,
        action: 'Open Relationships',
        view: 'relationships',
        icon: Heart,
        color: 'text-rust-500',
      });
    }

    // If plot pillars are incomplete
    if (c.plotPillars > 0 && c.plotPillars < 5) {
      tips.push({
        title: 'Complete your plot structure',
        description: `You have ${c.plotPillars} of 5 structural pillars. The missing ones are where your story might sag.`,
        action: 'Open Plot',
        view: 'plot',
        icon: GitBranch,
        color: 'text-sage-500',
      });
    }

    // If world is ignored in favor of other things
    if (isSetup && c.worldLocations === 0 && c.worldLaws === 0 && c.worldRecords === 0 && (c.characters > 0 || c.plotPillars > 0)) {
      tips.push({
        title: 'Your world is empty',
        description: 'You\'ve been building characters and plot, but the world they live in is still a blank page. Even a single location grounds everything.',
        action: 'Open World Chat',
        view: 'worldchat',
        icon: Globe,
        color: 'text-teal-500',
      });
    }

    // If everything is fairly developed, suggest output
    if (overallProgress >= 60 && c.outputJobs === 0) {
      tips.push({
        title: 'Generate output',
        description: 'Your story is well-developed. Time to turn it into an outline, timeline, or draft.',
        action: 'Open Output Pipeline',
        view: 'output',
        icon: FileText,
        color: 'text-ink-500',
      });
    }

    // If gaps exist
    if (c.structuralGaps > 0) {
      tips.push({
        title: 'Resolve structural gaps',
        description: `You have ${c.structuralGaps} open gap${c.structuralGaps !== 1 ? 's' : ''} that need attention before your story holds together.`,
        action: 'Open Gap Report',
        view: 'gaps',
        icon: AlertTriangle,
        color: 'text-error-500',
      });
    }

    return tips.slice(0, 4);
  }, [counts, isSetup, sections, overallProgress]);

  // No project at all
  if (!project) {
    return (
      <div className="max-w-2xl mx-auto px-8 py-16 animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-3xl font-serif font-semibold text-ink-800 dark:text-ink-100 mb-2">Welcome to Story Forge</h2>
          <p className="text-ink-400 dark:text-ink-500 max-w-md mx-auto">
            An AI story development partner that helps you build your story through conversation — one question at a time.
          </p>
        </div>

        <div className="card p-8">
          <h3 className="text-lg font-serif font-semibold text-ink-700 dark:text-ink-200 mb-4">Create your first project</h3>
          <p className="text-sm text-ink-400 dark:text-ink-500 mb-5">
            Every story starts with a title. You can change everything later.
          </p>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              type="text"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              placeholder="Your story's name..."
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
            />
            <button className="btn btn-primary" onClick={handleCreateProject} disabled={creating}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showOnboarding = !isSetup;

  return (
    <div className="max-w-5xl mx-auto px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-ink-800 dark:text-ink-100 mb-1">Story Dashboard</h2>
          <p className="text-ink-400 dark:text-ink-500">Track your story's development and get guidance on what to build next.</p>
        </div>
        <button
          onClick={() => setShowProjectManager(true)}
          className="btn btn-secondary"
        >
          <FolderOpen className="w-4 h-4" />
          Projects ({projects.length})
        </button>
      </div>

      {/* Onboarding / Setup */}
      {showOnboarding && (
        <div className="card p-6 mb-8 border-l-4 border-l-amber-400">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-semibold text-ink-800 dark:text-ink-100">Let's get you set up</h3>
              <p className="text-sm text-ink-400 dark:text-ink-500 mt-0.5">
                A title and genre are all you need to start. The AI uses your genre to ask the right questions.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Story Title" value={title} onChange={setTitle} placeholder="Your story's name" />
            <div>
              <label className="label">Genre</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {GENRE_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGenre(g.value)}
                    className={`text-left px-3 py-2.5 rounded-lg border transition-all duration-200 ${
                      genre === g.value
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-ink-200 dark:border-ink-700 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'
                    }`}
                  >
                    <div className="text-sm font-medium text-ink-700 dark:text-ink-200">{g.label}</div>
                    <div className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <Field
              label="Logline (optional)"
              value={logline}
              onChange={setLogline}
              type="textarea"
              placeholder="A one-sentence summary of your story's core conflict and stakes"
            />
          </div>

          <div className="flex justify-end mt-5">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Overall progress ring */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <h3 className="section-title mb-4">Overall Progress</h3>
          <ProgressRing percent={overallProgress} />
          <p className="text-sm text-ink-400 dark:text-ink-500 mt-3 text-center">
            {overallProgress === 0
              ? 'Your story is a blank page. Let\'s change that.'
              : overallProgress < 33
              ? 'You\'re in the early stages. Keep going.'
              : overallProgress < 66
              ? 'Good momentum — your story is taking shape.'
              : overallProgress < 100
              ? 'Almost there. A few sections need polish.'
              : 'Fully developed. Time to generate output.'}
          </p>
        </div>

        {/* Section breakdown */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="section-title mb-4">Section Progress</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => onNavigate(s.view)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-ink-200 dark:border-ink-700 hover:border-ink-300 dark:hover:border-ink-600 hover:bg-ink-50 dark:hover:bg-ink-800/40 transition-all duration-200 text-left group"
                >
                  <div className={`w-10 h-10 rounded-lg ${s.bgColor} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-ink-700 dark:text-ink-200">{s.label}</span>
                      <span className="text-xs font-semibold text-ink-500 dark:text-ink-400">{s.percent}%</span>
                    </div>
                    <ProgressBar percent={s.percent} color={s.ringColor} />
                    <p className="text-xs text-ink-400 dark:text-ink-500 mt-1 truncate">{s.counts}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="section-title">Suggested Next Steps</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((tip, i) => {
              const Icon = tip.icon;
              return (
                <button
                  key={i}
                  onClick={() => onNavigate(tip.view)}
                  className="card card-hover p-5 text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-ink-100 dark:bg-ink-800 flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${tip.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-1">{tip.title}</h4>
                      <p className="text-xs text-ink-400 dark:text-ink-500 leading-relaxed">{tip.description}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs font-medium text-amber-600 dark:text-amber-400 group-hover:gap-2 transition-all">
                        {tip.action}
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <QuickAction
          icon={MessageCircle}
          label="Story Chat"
          desc="Build your story through conversation"
          onClick={() => onNavigate('chat')}
          color="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <QuickAction
          icon={Mountain}
          label="World Chat"
          desc="Build your world through conversation"
          onClick={() => onNavigate('worldchat')}
          color="bg-teal-100 dark:bg-teal-900/30"
          iconColor="text-teal-600 dark:text-teal-400"
        />
        <QuickAction
          icon={Upload}
          label="Import Material"
          desc="Upload existing notes or outlines"
          onClick={() => onNavigate('chat')}
          color="bg-sage-100 dark:bg-sage-900/30"
          iconColor="text-sage-600 dark:text-sage-400"
        />
        <QuickAction
          icon={FileText}
          label="Generate Output"
          desc="Turn your story into an outline or draft"
          onClick={() => onNavigate('output')}
          color="bg-ink-100 dark:bg-ink-800"
          iconColor="text-ink-600 dark:text-ink-300"
        />
      </div>

      {/* Project Details (collapsible, always available) */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-ink-500" />
            <h3 className="section-title">Project Details</h3>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? 'Saved' : 'Save'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Story Title" value={title} onChange={setTitle} placeholder="Your story's name" />
          <div>
            <label className="label">Genre</label>
            <select
              className="select"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              <option value="">— Select —</option>
              {GENRE_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <Field
            label="Logline"
            value={logline}
            onChange={setLogline}
            type="textarea"
            placeholder="A one-sentence summary of your story's core conflict and stakes"
          />
        </div>
        <div className="mt-4">
          <Field
            label="Notes"
            value={notes}
            onChange={setNotes}
            type="textarea"
            placeholder="Free-form notes, ideas, themes you're exploring..."
          />
        </div>
      </div>

      {/* Stats summary */}
      {counts && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <StatChip icon={Users} label="Characters" value={counts.characters} />
          <StatChip icon={Heart} label="Relationships" value={counts.relationships} />
          <StatChip icon={GitBranch} label="Plot Events" value={counts.plotEvents} />
          <StatChip icon={Globe} label="World Items" value={counts.worldLocations + counts.worldLaws + counts.worldRecords} />
          <StatChip icon={MessageCircle} label="Story Chats" value={counts.storyChatMessages} />
          <StatChip icon={Mountain} label="World Chats" value={counts.worldChatMessages} />
          <StatChip icon={AlertTriangle} label="Open Gaps" value={counts.structuralGaps} />
          <StatChip icon={FileText} label="Output Jobs" value={counts.outputJobs} />
        </div>
      )}

      {/* Project Manager Modal */}
      {showProjectManager && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
          onClick={() => setShowProjectManager(false)}
        >
          <div
            className="card w-full max-w-lg mx-4 p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-5 h-5 text-ink-500" />
                <h3 className="text-lg font-serif font-semibold text-ink-800 dark:text-ink-100">Projects</h3>
              </div>
              <button onClick={() => setShowProjectManager(false)} className="btn-ghost btn !p-1.5 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Create new project */}
            <div className="flex gap-2 mb-4">
              <input
                className="input flex-1"
                type="text"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="New project title..."
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              />
              <button className="btn btn-primary shrink-0" onClick={handleCreateProject} disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                New
              </button>
            </div>

            {/* Project list */}
            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    p.id === project.id
                      ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700'
                      : 'border-ink-200 dark:border-ink-700 hover:border-ink-300 dark:hover:border-ink-600'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectProject(p.id);
                      setShowProjectManager(false);
                    }}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="text-sm font-medium text-ink-700 dark:text-ink-200 truncate">
                      {p.title || 'Untitled Story'}
                    </div>
                    <div className="text-xs text-ink-400 dark:text-ink-500 truncate">
                      {p.genre || 'No genre set'} {p.logline ? ` — ${p.logline}` : ''}
                    </div>
                  </button>
                  {p.id === project.id && (
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  {projects.length > 1 && (
                    <button
                      onClick={() => setConfirmDeleteId(p.id)}
                      className="btn-ghost btn !p-1 rounded shrink-0 text-ink-400 hover:text-error-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="card w-full max-w-sm mx-4 p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-error-50 dark:bg-error-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-error-500" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-semibold text-ink-800 dark:text-ink-100">Delete this project?</h3>
                <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">
                  All characters, relationships, plot, world data, and chat history will be permanently deleted. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn btn-secondary" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={async () => {
                  await onDeleteProject(confirmDeleteId);
                  setConfirmDeleteId(null);
                  setShowProjectManager(false);
                }}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="8"
          className="stroke-ink-100 dark:stroke-ink-800"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-amber-500 transition-all duration-700 ease-out"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-serif font-bold text-ink-800 dark:text-ink-100">{percent}%</span>
      </div>
    </div>
  );
}

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
      <div
        className={`h-full rounded-full ${color.replace('stroke-', 'bg-')} transition-all duration-700 ease-out`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  desc,
  onClick,
  color,
  iconColor,
}: {
  icon: typeof Users;
  label: string;
  desc: string;
  onClick: () => void;
  color: string;
  iconColor: string;
}) {
  return (
    <button
      onClick={onClick}
      className="card card-hover p-4 text-left group"
    >
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="text-sm font-medium text-ink-700 dark:text-ink-200 mb-0.5">{label}</div>
      <div className="text-xs text-ink-400 dark:text-ink-500">{desc}</div>
    </button>
  );
}

function StatChip({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ink-50 dark:bg-ink-900/40">
      <Icon className="w-4 h-4 text-ink-400 shrink-0" />
      <span className="text-sm font-semibold text-ink-700 dark:text-ink-300">{value}</span>
      <span className="text-xs text-ink-400 dark:text-ink-500 truncate">{label}</span>
    </div>
  );
}
