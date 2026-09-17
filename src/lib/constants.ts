import {
  Users,
  Heart,
  GitBranch,
  Globe,
  Sparkles,
  Palette,
  AlertTriangle,
  FileText,
  LayoutDashboard,
} from 'lucide-react';
import { ViewId } from './types';

export const VIEW_CONFIG: {
  id: ViewId;
  label: string;
  icon: typeof Users;
  description: string;
  volume: string;
}[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview of your story',
    volume: '',
  },
  {
    id: 'characters',
    label: 'Characters',
    icon: Users,
    description: 'Identity, inner world, transformation, voice',
    volume: 'Vol 1',
  },
  {
    id: 'relationships',
    label: 'Relationships',
    icon: Heart,
    description: 'Dynamics, iceberg, arc, asymmetry',
    volume: 'Vol 2',
  },
  {
    id: 'plot',
    label: 'Plot',
    icon: GitBranch,
    description: 'Pillars, events, subplots, consequence chains',
    volume: 'Vol 3',
  },
  {
    id: 'world',
    label: 'World',
    icon: Globe,
    description: 'Locations, laws, histories, power architecture',
    volume: 'Vol 4',
  },
  {
    id: 'meaning',
    label: 'Meaning & Resonance',
    icon: Sparkles,
    description: 'Theme, symbols, emotional architecture',
    volume: 'Vol 5',
  },
  {
    id: 'style',
    label: 'Style & Prose',
    icon: Palette,
    description: 'Visual palette, prose voice, dialogue register',
    volume: 'Vol 6',
  },
  {
    id: 'gaps',
    label: 'Gap Report',
    icon: AlertTriangle,
    description: 'Structural gaps, contradictions, question queue',
    volume: 'Vol 7',
  },
  {
    id: 'output',
    label: 'Output Pipeline',
    icon: FileText,
    description: 'Outline, timeline, chapters, drafts',
    volume: 'Vol 8',
  },
];

export const ARCHETYPES = [
  'Hero',
  'Mentor',
  'Trickster',
  'Shadow',
  'Threshold Guardian',
  'Foil',
  'Catalyst',
  'Shapeshifter',
  'Herald',
  'Ally',
];

export const ARC_TYPES = ['Positive (Change)', 'Negative (Fall/Tragedy)', 'Flat (Steadfast)'];

export const RELATIONSHIP_TYPES = [
  'Romantic',
  'Familial',
  'Professional',
  'Mentorship',
  'Rivalry',
  'Adversarial',
  'Found Family',
  'Parasocial',
  'Symbolic',
];

export const RECIPROCITY_LEVELS = ['Fully mutual', 'Asymmetric', 'Entirely one-sided'];

export const NARRATIVE_FUNCTIONS = ['Foil', 'Mirror', 'Catalyst', 'Anchor'];

export const RELATIONSHIP_ARC_TYPES = [
  'Growth/Unification',
  'Deterioration/Tragic',
  'Shifting Power',
];

export const PILLAR_LABELS: Record<string, string> = {
  inciting_incident: 'Inciting Incident',
  plot_point_1: 'Plot Point 1',
  midpoint: 'Midpoint',
  plot_point_2: 'All Is Lost',
  climax: 'Climax',
};

export const CONSEQUENCE_TYPES = ['Goal Shift', 'Resource Shift', 'Understanding Shift'];

export const EMOTIONAL_WEIGHTS = ['low', 'medium', 'high'];

export const GAP_TYPES = [
  { value: 'filler_scene', label: 'Filler Scene', color: 'warning' as const },
  { value: 'sag', label: 'Sag', color: 'warning' as const },
  { value: 'missing_refusal', label: 'Missing Refusal Period', color: 'warning' as const },
  { value: 'disconnected_all_is_lost', label: 'Disconnected All Is Lost', color: 'error' as const },
  { value: 'open_loop', label: 'Open Loop', color: 'warning' as const },
  { value: 'orphaned_subplot', label: 'Orphaned Subplot', color: 'warning' as const },
  { value: 'misaligned_pillar', label: 'Misaligned Pillar', color: 'warning' as const },
  { value: 'empty_atom', label: 'Empty Atom', color: 'ink' as const },
  { value: 'thin_atom', label: 'Thin Atom', color: 'ink' as const },
  { value: 'contradicted_atom', label: 'Contradicted Atom', color: 'error' as const },
  { value: 'unconfirmed_atom', label: 'Unconfirmed Atom', color: 'ink' as const },
  { value: 'orphaned_atom', label: 'Orphaned Atom', color: 'ink' as const },
  { value: 'theme_drift', label: 'Theme Drift', color: 'warning' as const },
  { value: 'motif_inconsistency', label: 'Motif Inconsistency', color: 'warning' as const },
  { value: 'emotional_shape_mismatch', label: 'Emotional Shape Mismatch', color: 'warning' as const },
  { value: 'unanswered_central_question', label: 'Unanswered Central Question', color: 'warning' as const },
  { value: 'argument_without_proof', label: 'Argument Without Proof', color: 'warning' as const },
  { value: 'emotional_destination_gap', label: 'Emotional Destination Gap', color: 'warning' as const },
  { value: 'register_drift', label: 'Register Drift', color: 'warning' as const },
  { value: 'dialogue_mismatch', label: 'Dialogue Register Mismatch', color: 'error' as const },
];

export const SEVERITY_LEVELS = ['low', 'medium', 'high'];

export const WORLD_PILLARS = [
  { value: 'story_open', label: 'Story Open' },
  { value: 'inciting_incident', label: 'Inciting Incident' },
  { value: 'plot_point_1', label: 'Plot Point 1' },
  { value: 'midpoint', label: 'Midpoint' },
  { value: 'plot_point_2', label: 'All Is Lost' },
  { value: 'climax', label: 'Climax/Close' },
];

export const LAW_TYPES = [
  'Physical',
  'Social',
  'Political',
  'Technological',
  'Supernatural',
  'Economic',
  'Institutional',
];

export const RECORD_TYPES = [
  'Historical event',
  'Founding myth',
  'Religious narrative',
  'Folk legend',
  'Institutional origin story',
  'Cultural memory',
];

export const TRUTH_STATUSES = [
  'Verified true',
  'Verified false',
  'Deliberately ambiguous',
  'Unknown even to writer yet',
];

export const OUTPUT_STEPS = [
  {
    id: 'outline',
    label: 'Outline',
    description: 'Structural spine — pillars, subplots, consequence chains',
    icon: 'ListTree',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    description: 'Chronological sequence with world state snapshots',
    icon: 'Clock',
  },
  {
    id: 'scene_list',
    label: 'Chapter & Scene List',
    description: 'Story broken into scenes assigned to chapters',
    icon: 'Layers',
  },
  {
    id: 'scaffolding',
    label: 'Chapter Scaffolding',
    description: 'One page per chapter — what it does, what changes',
    icon: 'Building2',
  },
  {
    id: 'briefs',
    label: 'Chapter Briefs',
    description: 'Scene-level beat maps with subtext and sensory notes',
    icon: 'ClipboardList',
  },
  {
    id: 'full_draft',
    label: 'Full Draft',
    description: 'AI-assisted first-pass prose in the writer\'s voice',
    icon: 'PenLine',
  },
];

export const OUTPUT_JOB_TYPES = [
  'outline',
  'timeline',
  'scene_list',
  'scaffolding',
  'briefs',
  'full_draft',
  'character_profile',
  'relationship_map',
  'world_reference',
  'meaning_summary',
  'gap_report',
];

export const QUESTION_LAYERS = [
  { value: 'character', label: 'Character' },
  { value: 'relationship', label: 'Relationship' },
  { value: 'plot', label: 'Plot' },
  { value: 'world', label: 'World' },
  { value: 'meaning', label: 'Meaning & Resonance' },
  { value: 'style', label: 'Style & Prose' },
];

export const QUESTION_STATUSES = ['pending', 'answered', 'skipped', 'declined'];
