export interface DayData {
  day: string;
  count: number;
}

export interface DurationData {
  label: string;
  count: number;
}


export interface WeekRange {
  start: Date
  end: Date;
}

export interface DailyOverviewData {
  day: string;
  meetings: number;
  hours: number;
}

export interface WeekMeeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  meetingType: string;
  organizer: string;
  participants: number;
  recurring: boolean;
  dayOfWeek: string;
  timeOfDayBucket: string;
}

export interface RawMeeting {
  meeting_id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  recurring: boolean;
  meeting_type: string;
  organizer: string;
  number_of_participants: number;
  day_of_week: string;
  time_of_day_bucket: string;
}

export interface RawFeedback {
  meeting_id: string;
  perceived_efficiency: number;
  emotional_impact: string;
  energy_after_meeting: number;
  perceived_value: boolean;
  perceived_focus_disruption: number;
  free_text_comment: string;
  time_of_day_bucket: string;
  meeting_type: string;
  meeting_start_time: string;
  feedback_timestamp: string;
  themes?: string[];
}

export interface StructureSummaryWeek {
  totalMeetings: number;
  totalHours: number;
  avgDuration: number;
  avgMeetingsPerDay: number;
  prevTotalMeetings: number;
  prevTotalHours: number;
  prevAvgDuration: number;
  prevAvgMeetingsPerDay: number;
}

export interface ImpactSummaryWeek {
  avgEfficiency: number;
  avgEmotionalScore: number;
  avgEnergyAfter: number;
  percentageValuable: number;
  prevAvgEfficiency: number;
  prevAvgEmotionalScore: number;
  prevAvgEnergyAfter: number;
  prevPercentageValuable: number;
}

export interface TypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface TimingBucket {
  timeOfDay: string;
  count: number;
  percentage: number;
}

export interface FlowBlockDay {
  date: string;
  blocks60min: number;
  blocks90min: number;
  blocks120min: number;
}

export interface FragmentationDay {
  date: string;
  scorePercentage: number;
  totalMeetingMinutes: number;
  fragmentedMinutes: number;
  flowBlocksCount: number;
}

export interface ImpactByType {
  type: string;
  avgEfficiency: number;
  avgEmotional: number;
  avgEnergy: number;
  avgDisruption: number;
}

export interface ImpactByTime {
  timeOfDay: string;
  avgEfficiency: number;
  avgEmotional: number;
  avgDisruption: number;
}

export interface ImpactTimelineHour {
  hour: string;
  avgEfficiency: number | null;
  avgEmotional: number | null;
  avgEnergy: number | null;
  avgDisruption: number | null;
}

export interface EfficiencyBucket {
  scale: number;
  count: number;
  percentage: number;
}

export interface SentimentBucket {
  sentiment: string;
  count: number;
  percentage: number;
}

export interface DurationEfficiency {
  duration: number;
  efficiency: number;
}

export interface ThemeFrequency {
  theme: string;
  frequency: number;
}

export interface DisruptionDay {
  date: string;
  avgDisruption: number;
}

export interface DailyFlowScore {
  date: string;
  score: number;
  totalWorkingMinutes: number;
  effectiveFlowMinutes: number;
  potentialScore: number;
  blocks: FlowBlock[];
}

export interface FlowBlock {
  type: 'MEETING' | 'GAP_FRAGMENTED' | 'GAP_SHORT' | 'GAP_MEDIUM' | 'GAP_LARGE';
  startTime: string;
  endTime: string;
  durationMinutes: number;
  factor: number;
  effectiveMinutes: number;
  costMinutes: number;
}
