import { MeetingType, TimeOfDayBucket } from './common.model';

export interface Meeting {
  meeting_id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  recurring: boolean;
  meeting_type: MeetingType;
  organizer: string;
  number_of_participants: number;
  day_of_week: string;
  time_of_day_bucket: TimeOfDayBucket;
}

export interface StructureSummary {
  totalMeetings: number;
  totalHours: number;
  avgDuration: number;
  avgMeetingsPerDay: number;
  totalMeetingsLastWeek: number;
  totalHoursLastWeek: number;
  avgDurationLastWeek: number;
  avgMeetingsPerDayLastWeek: number;
}

export interface MeetingTypeCount {
  type: MeetingType;
  count: number;
  percentage: number;
}

export interface TimingData {
  timeOfDay: TimeOfDayBucket;
  count: number;
  percentage: number;
}

export interface FocusBlock {
  date: string;
  blocks60min: number;
  blocks90min: number;
  blocks120min: number;
}

export interface FragmentationScore {
  date: string;
  score: number;
  meetingsContribution: number;
  gapsContribution: number;
  fragmentationContribution: number;
}

export interface RecurringRatio {
  recurringCount: number;
  adHocCount: number;
  recurringPercentage: number;
}

export interface MeetingsResponse {
  meetings: Meeting[];
}

export interface StructureSummaryResponse {
  summary: StructureSummary;
}

export interface MeetingTypeDistributionResponse {
  distribution: MeetingTypeCount[];
}

export interface TimingAnalysisResponse {
  timing: TimingData[];
}

export interface FocusBlocksResponse {
  focusBlocks: FocusBlock[];
}

export interface FragmentationScoresResponse {
  scores: FragmentationScore[];
}

export interface RecurringRatioResponse {
  ratio: RecurringRatio;
}
