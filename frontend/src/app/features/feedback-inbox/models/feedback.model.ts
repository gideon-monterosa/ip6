export enum FeedbackStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  DISMISSED = 'DISMISSED',
}

export enum DismissReason {
  NOT_RELEVANT = 'NOT_RELEVANT',
  TOO_BUSY = 'TOO_BUSY',
  PRIVATE = 'PRIVATE',
  DONT_REMEMBER = 'DONT_REMEMBER',
  OTHER = 'OTHER',
}

export enum MoodType {
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL',
  POSITIVE = 'POSITIVE',
}

export enum IssueTag {
  NO_CLEAR_AGENDA = 'NO_CLEAR_AGENDA',
  TOO_LONG = 'TOO_LONG',
  TOO_MANY_PARTICIPANTS = 'TOO_MANY_PARTICIPANTS',
  NOT_RELEVANT_FOR_ME = 'NOT_RELEVANT_FOR_ME',
  COULD_HAVE_BEEN_ASYNC = 'COULD_HAVE_BEEN_ASYNC',
  NO_DECISIONS_OR_NEXT_STEPS = 'NO_DECISIONS_OR_NEXT_STEPS',
  POOR_PREPARATION = 'POOR_PREPARATION',
  SCOPE_TOO_BROAD = 'SCOPE_TOO_BROAD',
  DOMINATED_BY_FEW = 'DOMINATED_BY_FEW',
  TECHNICAL_ISSUES = 'TECHNICAL_ISSUES',
}

export const ISSUE_TAG_LABELS: Record<IssueTag, string> = {
  [IssueTag.NO_CLEAR_AGENDA]: 'No clear agenda',
  [IssueTag.TOO_LONG]: 'Too long',
  [IssueTag.TOO_MANY_PARTICIPANTS]: 'Too many participants',
  [IssueTag.NOT_RELEVANT_FOR_ME]: 'Not relevant for me',
  [IssueTag.COULD_HAVE_BEEN_ASYNC]: 'Could have been async',
  [IssueTag.NO_DECISIONS_OR_NEXT_STEPS]: 'No decisions or next steps',
  [IssueTag.POOR_PREPARATION]: 'Poor preparation',
  [IssueTag.SCOPE_TOO_BROAD]: 'Scope too broad',
  [IssueTag.DOMINATED_BY_FEW]: 'Dominated by few',
  [IssueTag.TECHNICAL_ISSUES]: 'Technical issues',
};

export type MeetingType =
  | 'Stand-up'
  | 'Planning'
  | 'Retrospective'
  | '1:1'
  | 'Ad-hoc'
  | 'Other';

export interface FeedbackableMeeting {
  meeting_id: string;
  title: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  meeting_type: MeetingType;
  feedback_status: FeedbackStatus;
}

export interface FeedbackRecord {
  meeting_id: string;
  user_id: string;
  status: FeedbackStatus;
  created_at: string;
  submitted_at?: string;
  dismissed_at?: string;
  dismiss_reason?: DismissReason;
}

export const MEETING_TYPES: MeetingType[] = [
  'Stand-up',
  'Planning',
  'Retrospective',
  '1:1',
  'Ad-hoc',
  'Other',
];

export interface MeetingFeedback {
  meeting_id: string;
  roti_score: number;
  mood: MoodType;
  energy_after: number;
  meeting_type_override?: MeetingType;
  issue_tags: IssueTag[];
  comment?: string;
}
