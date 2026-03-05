// ── Kept interfaces (still used by chart components) ──

export interface DayData {
  day: string;
  count: number;
}

export interface DurationData {
  label: string;
  count: number;
}

// ── New interfaces for week-based dashboard ──

/** Week selector state */
export interface WeekRange {
  start: Date;  // Monday 00:00
  end: Date;    // Sunday 23:59:59
}

/** Replaces WeekData for the daily overview chart */
export interface DailyOverviewData {
  day: string;       // "Mon 2/2", "Tue 2/3", etc.
  meetings: number;
  hours: number;
}

/** For the "Meetings This Week" table */
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

/** Raw meeting from meetings.json (for client-side filtering) */
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

/** Raw feedback from feedback.json */
export interface RawFeedback {
  meeting_id: string;
  perceived_efficiency: number;
  emotional_impact: string;      // "motivated" | "neutral" | "stressed"
  energy_after_meeting: number;
  perceived_value: boolean;
  perceived_focus_disruption: number;
  free_text_comment: string;
  time_of_day_bucket: string;
  meeting_type: string;
  feedback_timestamp: string;
  themes?: string[];
}

/** Structure summary computed for a week */
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

/** Impact summary computed for a week */
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

export interface FocusBlockDay {
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

export interface ThemeFrequency {
  theme: string;
  frequency: number;
}

export interface DisruptionDay {
  date: string;
  avgDisruption: number;
}
