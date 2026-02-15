import { EmotionalState, MeetingType, TimeOfDayBucket } from './common.model';

export interface MeetingFeedback {
  meeting_id: string;
  perceived_efficiency: number;
  emotional_impact: EmotionalState;
  energy_after_meeting: number;
  perceived_value: boolean;
  perceived_focus_disruption: number;
  free_text_comment: string;
  time_of_day_bucket: TimeOfDayBucket;
  meeting_type: MeetingType;
  feedback_timestamp: string;
}

export interface ImpactSummary {
  avgEfficiency: number;
  avgEmotionalScore: number;
  avgEnergyAfter: number;
  percentageValuable: number;
  avgEfficiencyLastWeek: number;
  avgEmotionalScoreLastWeek: number;
  avgEnergyAfterLastWeek: number;
  percentageValuableLastWeek: number;
}

export interface SentimentCount {
  sentiment: EmotionalState;
  count: number;
  percentage: number;
}

export interface EfficiencyDistribution {
  scale: number;
  count: number;
  percentage: number;
}

export interface MeetingTypeImpact {
  type: MeetingType;
  avgEfficiency: number;
  avgEmotional: number;
  avgEnergy: number;
  avgDisruption: number;
}

export interface TimeOfDayImpact {
  timeOfDay: TimeOfDayBucket;
  avgEfficiency: number;
  avgEmotional: number;
  avgDisruption: number;
}

export interface FocusDisruptionData {
  date: string;
  avgDisruption: number;
}

export interface QualitativeTheme {
  theme: string;
  frequency: number;
}

export interface FeedbackResponse {
  feedback: MeetingFeedback[];
}

export interface ImpactSummaryResponse {
  summary: ImpactSummary;
}

export interface SentimentDistributionResponse {
  distribution: SentimentCount[];
}

export interface EfficiencyDistributionResponse {
  distribution: EfficiencyDistribution[];
}

export interface ImpactByTypeResponse {
  impacts: MeetingTypeImpact[];
}

export interface ImpactByTimeResponse {
  impacts: TimeOfDayImpact[];
}

export interface FocusDisruptionResponse {
  disruption: FocusDisruptionData[];
}

export interface QualitativeThemesResponse {
  themes: QualitativeTheme[];
}
