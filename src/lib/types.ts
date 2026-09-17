export interface Project {
  id: string;
  title: string;
  genre: string;
  logline: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  project_id: string;
  name: string;
  data: CharacterData;
  created_at: string;
  updated_at: string;
}

export interface CharacterData {
  // 4.1 Identity
  aliases?: string;
  age?: string;
  appearance?: string;
  gender?: string;
  socialRole?: string;
  archetype?: string;
  perceivedVsActual?: string;

  // 4.2 Inner World
  theLie?: string;
  theTruth?: string;
  theWound?: string;
  theGhost?: string;
  want?: string;
  need?: string;
  fear?: string;
  flaw?: string;
  strength?: string;
  moralCode?: string;

  // 4.3 Transformation
  arcType?: string;
  emotionalShape?: string;
  catalyst?: string;
  resistance?: string;
  turningPoint?: string;
  resolution?: string;
  cost?: string;

  // 4.4 Key Relationships (refs)
  relationshipRefs?: string;

  // 4.5 Visual Identity
  signatureVisual?: string;
  physicalTransformation?: string;
  symbolicObjects?: string;
  physicalPresence?: string;

  // 4.6 Sub-Arc Tracking
  subArcShape?: string;
  subArcEntry?: string;
  subArcExit?: string;
  subArcIntersections?: string;

  // Voice Capture
  voicePatterns?: {
    vocabularyRegister?: string;
    emotionalDirectness?: string;
    humorDefense?: string;
    pressureMode?: string;
    vulnerabilityHandling?: string;
    subtextPatterns?: string;
    signaturePhrases?: string;
  };

  // Emotional Fingerprint
  emotionalFingerprint?: Array<{
    scenario: string;
    internalFeeling: string;
    externalBehavior: string;
  }>;
}

export interface Relationship {
  id: string;
  project_id: string;
  label: string;
  data: RelationshipData;
  created_at: string;
  updated_at: string;
}

export interface RelationshipData {
  // Identity
  parties?: string;
  relationshipType?: string;
  origin?: string;
  reciprocityLevel?: string;

  // Narrative Function
  narrativeFunctions?: string[];

  // Dynamic
  powerBalance?: string;
  visibilityImbalance?: string;
  emotionalInvestment?: string;
  partyAWants?: string;
  partyBWants?: string;
  partyABelieves?: string;
  partyBBelieves?: string;
  backgroundFriction?: string;

  // The Iceberg
  surfaceConflict?: string;
  rootConflict?: string;
  theUnsaidThing?: string;
  icebergFriction?: string;

  // History
  foundingMoment?: string;
  definingMoments?: string;
  woundBetweenThem?: string;
  neverSaid?: string;
  sharedHistoryAssets?: string;

  // Arc
  arcType?: string;
  emotionalFortuneCurve?: string;
  startingState?: string;
  transformationPoints?: string;
  endState?: string;
  arcCost?: string;

  // Asymmetry Tracking
  awarenessGap?: string;
  investmentGap?: string;
  informationGap?: string;
  powerShiftMoments?: string;
  perceptionGap?: string;
}

export interface RelationshipCluster {
  id: string;
  project_id: string;
  label: string;
  data: ClusterData;
  created_at: string;
  updated_at: string;
}

export interface ClusterData {
  memberRelationshipIds?: string[];
  clusterType?: string;
  systemLevelTension?: string;
  subplotDesignation?: string;
  clusterArc?: string;
  resolution?: string;
}

export interface PlotEvent {
  id: string;
  project_id: string;
  description: string;
  data: PlotEventData;
  pillar_id: string | null;
  subplot_id: string | null;
  timeline_position: string;
  emotional_weight: string;
  filler_flag: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PlotEventData {
  charactersInvolved?: string;
  consequenceTypes?: string[];
  consequenceDescription?: string;
  preSceneState?: string;
  postSceneState?: string;
  escalationCheck?: string;
  consequenceChain?: string;
}

export interface PlotPillar {
  id: string;
  project_id: string;
  pillar_type: string;
  data: PillarData;
  created_at: string;
  updated_at: string;
}

export interface PillarData {
  [key: string]: string | string[] | undefined;
  normalWorld?: string;
  natureOfDisruption?: string;
  initialResponse?: string;
  refusalPeriod?: string;
  bridgeToPP1?: string;
  backwardCheck?: string;
  forwardCheck?: string;
  natureOfChoice?: string;
  pointOfNoReturn?: string;
  comfortZoneLeft?: string;
  newWorldEntered?: string;
  reactiveToProactive?: string;
  midpointType?: string;
  stakesEscalation?: string;
  oldCopingRetired?: string;
  newUnderstanding?: string;
  whatIsLost?: string;
  connectionToGhost?: string;
  lieConfronted?: string;
  truthNowAvailable?: string;
  darkNightTexture?: string;
  antagonisticForce?: string;
  truthApplied?: string;
  coreConflictLoopClosed?: string;
  internalChangeProven?: string;
  resolutionType?: string;
}

export interface Subplot {
  id: string;
  project_id: string;
  label: string;
  data: SubplotData;
  created_at: string;
  updated_at: string;
}

export interface SubplotData {
  charactersDriving?: string;
  relationshipClusterRef?: string;
  inferredFrom?: string;
  compressedPillarMap?: string;
  intersectionPoints?: string;
  subplotArcType?: string;
  resolutionDependency?: string;
  weightClassification?: string;
}

export interface StructuralGap {
  id: string;
  project_id: string;
  gap_type: string;
  description: string;
  severity: string;
  resolved: boolean;
  data: Record<string, unknown>;
  created_at: string;
}

export interface WorldLocation {
  id: string;
  project_id: string;
  name: string;
  data: WorldLocationData;
  created_at: string;
  updated_at: string;
}

export interface WorldLocationData {
  physicalDescription?: string;
  emotionalRegister?: string;
  officialHistory?: string;
  trueHistory?: string;
  truthStatus?: string;
  whoKnowsTruth?: string;
  whoBenefitsFromLie?: string;
  locationRules?: string;
  symbolicWeight?: string;
  stateAtOpen?: string;
  stateAtClose?: string;
  storyFunction?: string;
}

export interface WorldLaw {
  id: string;
  project_id: string;
  statement: string;
  data: WorldLawData;
  created_at: string;
  updated_at: string;
}

export interface WorldLawData {
  lawType?: string;
  scope?: string;
  consequenceForViolation?: string;
  whoEnforces?: string;
  exploitability?: string;
  knownVsTrue?: string;
  origin?: string;
  storyFunction?: string;
}

export interface WorldRecord {
  id: string;
  project_id: string;
  title: string;
  data: WorldRecordData;
  created_at: string;
  updated_at: string;
}

export interface WorldRecordData {
  type?: string;
  toldVersion?: string;
  trueVersion?: string;
  truthStatus?: string;
  whoKnowsTruth?: string;
  whoInvestedInLie?: string;
  investmentLevel?: string;
  livingImpact?: string;
  revelationPotential?: string;
  connectedLocations?: string;
  storyFunction?: string;
}

export interface WorldSnapshot {
  id: string;
  project_id: string;
  pillar: string;
  description: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  project_id: string;
  data: ThemeData;
  created_at: string;
  updated_at: string;
}

export interface ThemeData {
  centralQuestion?: string;
  centralQuestionInferredFrom?: string;
  centralQuestionConfidence?: string;
  centralQuestionConfirmed?: string;
  answerStance?: string;
  answerDeliveredBy?: string;
  alternativeReadings?: string;

  moralArgument?: string;
  moralArgumentInferredFrom?: string;
  moralArgumentProven?: string;
  moralArgumentTested?: string;
  counterargumentWeight?: string;
  ambiguityLevel?: string;

  symbols?: Array<{
    id: string;
    description: string;
    type: string;
    inferredVsDeclared: string;
    firstAppearance: string;
    recurrencePattern: string;
    meaning: string;
    evolution: string;
    connectionToTheme: string;
  }>;

  masterVonnegutShape?: string;
  emotionalRegisterAtOpen?: string;
  intendedEmotionalDestination?: string;
  tensionRhythm?: string;
  dreadToHopeRatio?: string;
  emotionalHighPoint?: string;
  emotionalLowPoint?: string;
  theGutPunch?: string;
  theExhale?: string;
  arcHarmony?: string;

  alignmentAssessment?: string;
  emotionalProofOfTheme?: string;
  intentionalDissonance?: string;
  resonanceGap?: string;
  resonanceAtClose?: string;
}

export interface StyleConfig {
  id: string;
  project_id: string;
  data: StyleConfigData;
  created_at: string;
  updated_at: string;
}

export interface StyleConfigData {
  // Visual Style
  visualPalette?: string;
  dominantColors?: string;
  colorPsychology?: string;
  lightingTendencies?: string;
  spatialComposition?: string;
  recurringVisualMotifs?: string;
  visualContrast?: string;
  atmosphereTone?: string;

  // Prose Voice
  proseRegister?: string;
  sentenceRhythm?: string;
  paragraphFlow?: string;
  dialogueStyle?: string;
  dialogueTags?: string;
  interiorityMode?: string;
  descriptionDensity?: string;
  sensoryPriority?: string;
  figurativeLanguage?: string;
  pacingTendency?: string;
  chapterStructure?: string;
  sceneTransitions?: string;
  povApproach?: string;
  tenseApproach?: string;

  // Voice samples
  voiceSamples?: Array<{
    id: string;
    label: string;
    text: string;
  analysis?: string;
  }>;
}

export interface QuestionState {
  id: string;
  project_id: string;
  layer: string;
  question_id: string;
  question_text: string;
  status: string;
  answer: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OutputJob {
  id: string;
  project_id: string;
  job_type: string;
  status: string;
  prompt: string;
  output: string;
  data: OutputJobData;
  created_at: string;
  updated_at: string;
}

export interface OutputJobData {
  sceneContext?: string;
  charactersInvolved?: string;
  pillarPosition?: string;
  wordCount?: string;
  toneNotes?: string;
  styleNotes?: string;
  worldContext?: string;
  relationshipContext?: string;
  consequenceFocus?: string;
  injectedData?: string;
}

export interface ChatMessage {
  id: string;
  project_id: string;
  role: 'user' | 'assistant';
  content: string;
  data: ChatMessageData;
  created_at: string;
}

export interface ChatMessageData {
  extracted?: ExtractedEntity[];
  nextQuestion?: string;
  energy?: 'high' | 'medium' | 'low';
  sessionSummary?: string;
}

export interface ExtractedEntity {
  table: string;
  operation: 'create' | 'update';
  matchField?: string;
  matchValue?: string;
  name?: string;
  label?: string;
  pillarType?: string;
  data: Record<string, unknown>;
  confidence: 'stated' | 'inferred' | 'speculative';
}

export type ViewId =
  | 'chat'
  | 'worldchat'
  | 'dashboard'
  | 'characters'
  | 'relationships'
  | 'plot'
  | 'world'
  | 'meaning'
  | 'style'
  | 'gaps'
  | 'output';

export interface PillarMeta {
  type: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
}

export const PILLAR_METAS: PillarMeta[] = [
  {
    type: 'inciting_incident',
    label: 'Inciting Incident',
    shortLabel: 'Inciting',
    description: 'The disruption that begins the story',
    icon: 'Sparkles',
  },
  {
    type: 'plot_point_1',
    label: 'Plot Point 1 — Break into Act Two',
    shortLabel: 'PP1',
    description: 'The protagonist commits to the journey',
    icon: 'ArrowRight',
  },
  {
    type: 'midpoint',
    label: 'Midpoint',
    shortLabel: 'Midpoint',
    description: 'Revelation or reversal that raises stakes',
    icon: 'RefreshCw',
  },
  {
    type: 'plot_point_2',
    label: 'Plot Point 2 — All Is Lost',
    shortLabel: 'All Is Lost',
    description: 'The lowest point — the Lie is no longer sustainable',
    icon: 'TrendingDown',
  },
  {
    type: 'climax',
    label: 'Climax',
    shortLabel: 'Climax',
    description: 'The truth is deployed against the antagonistic force',
    icon: 'Swords',
  },
];

export const PILLAR_TYPES = PILLAR_METAS.map((p) => p.type);
