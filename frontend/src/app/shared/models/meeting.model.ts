export enum FeedbackStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  DISMISSED = 'DISMISSED',
}

export type MeetingType =
  | 'Stand-up'
  | 'Planning'
  | 'Retrospective'
  | '1:1'
  | 'Ad-hoc'
  | 'Other';

export const MEETING_TYPES: MeetingType[] = [
  'Stand-up', 'Planning', 'Retrospective', '1:1', 'Ad-hoc', 'Other',
];

export interface Meeting {
  id: string;
  title: string;
  start: string;
  end: string;
  durationMinutes: number;
  meetingType: MeetingType,
  feedbackStatus: FeedbackStatus;

  description?: string;
  link?: string;
  provider?: string;
  externalId?: string;
  color?: string;
}
