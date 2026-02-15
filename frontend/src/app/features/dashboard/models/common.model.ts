export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface FilterState {
  dateRange: DateRange;
  meetingTypes: MeetingType[];
  timeOfDay: TimeOfDayBucket[];
}

export enum TimeOfDayBucket {
  Morning = 'Morning',
  Midday = 'Midday',
  Afternoon = 'Afternoon',
}

export enum MeetingType {
  StandUp = 'Stand-up',
  Planning = 'Planning',
  Retrospective = 'Retrospective',
  OneOnOne = '1:1',
  AdHoc = 'Ad-hoc',
  Other = 'Other',
}

export enum EmotionalState {
  Stressed = 'stressed',
  Neutral = 'neutral',
  Motivated = 'motivated',
}

export enum ExportFormat {
  CSV = 'CSV',
  JSON = 'JSON',
}
