import { FeedbackStatus, MeetingType } from '../../../shared/models/meeting.model';

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
  UNCLEAR_PURPOSE = 'UNCLEAR_PURPOSE',
  NO_CLEAR_OUTCOME = 'NO_CLEAR_OUTCOME',
  COULD_HAVE_BEEN_EMAIL = 'COULD_HAVE_BEEN_EMAIL',
  TOO_LONG = 'TOO_LONG',
  TOO_MANY_PARTICIPANTS = 'TOO_MANY_PARTICIPANTS',
  INTERRUPTED_FOCUS = 'INTERRUPTED_FOCUS',
  TOO_CLOSE_TO_ANOTHER = 'TOO_CLOSE_TO_ANOTHER',
  BAD_TIME = 'BAD_TIME',
  NO_RELEVANCE = 'NO_RELEVANCE',
  MENTALLY_DRAINING = 'MENTALLY_DRAINING',
  FRUSTRATING_DISCUSSION = 'FRUSTRATING_DISCUSSION',
}

export const ISSUE_TAG_LABELS: Record<IssueTag, string> = {
  [IssueTag.NO_CLEAR_AGENDA]: 'No clear agenda',
  [IssueTag.UNCLEAR_PURPOSE]: 'Unclear purpose',
  [IssueTag.NO_CLEAR_OUTCOME]: 'No clear outcome or decision',
  [IssueTag.COULD_HAVE_BEEN_EMAIL]: 'Meeting could have been an email',
  [IssueTag.TOO_LONG]: 'Too long',
  [IssueTag.TOO_MANY_PARTICIPANTS]: 'Too many participants',
  [IssueTag.INTERRUPTED_FOCUS]: 'Interrupted an important focus block',
  [IssueTag.TOO_CLOSE_TO_ANOTHER]: 'Too close to another meeting',
  [IssueTag.BAD_TIME]: 'Scheduled at a bad time',
  [IssueTag.NO_RELEVANCE]: 'No relevance to my work',
  [IssueTag.MENTALLY_DRAINING]: 'Mentally draining',
  [IssueTag.FRUSTRATING_DISCUSSION]: 'Frustrating discussion',
};

export enum PositiveTag {
  CLEAR_AGENDA = 'CLEAR_AGENDA',
  CLEAR_PURPOSE = 'CLEAR_PURPOSE',
  CLEAR_DECISIONS = 'CLEAR_DECISIONS',
  EFFICIENT_STRUCTURED = 'EFFICIENT_STRUCTURED',
  HELPED_PROGRESS = 'HELPED_PROGRESS',
  PROVIDED_INFO = 'PROVIDED_INFO',
  CLARIFIED_NEXT_STEPS = 'CLARIFIED_NEXT_STEPS',
  GOOD_TIME = 'GOOD_TIME',
  ENERGIZING_DISCUSSION = 'ENERGIZING_DISCUSSION',
  MOTIVATING = 'MOTIVATING',
  STRENGTHENED_ALIGNMENT = 'STRENGTHENED_ALIGNMENT',
}

export const POSITIVE_TAG_LABELS: Record<PositiveTag, string> = {
  [PositiveTag.CLEAR_AGENDA]: 'Clear agenda',
  [PositiveTag.CLEAR_PURPOSE]: 'Clear purpose',
  [PositiveTag.CLEAR_DECISIONS]: 'Clear decisions made',
  [PositiveTag.EFFICIENT_STRUCTURED]: 'Efficient and well structured',
  [PositiveTag.HELPED_PROGRESS]: 'Helped me make progress',
  [PositiveTag.PROVIDED_INFO]: 'Provided important information',
  [PositiveTag.CLARIFIED_NEXT_STEPS]: 'Clarified next steps',
  [PositiveTag.GOOD_TIME]: 'Scheduled at a good time',
  [PositiveTag.ENERGIZING_DISCUSSION]: 'Energizing discussion',
  [PositiveTag.MOTIVATING]: 'Motivating',
  [PositiveTag.STRENGTHENED_ALIGNMENT]: 'Strengthened team alignment',
};

export interface MeetingFeedback {
  meeting_id: string;
  focus_disruption: number;
  roti_score: number;
  mood: MoodType;
  energy_after: number;
  meeting_type_override?: MeetingType;
  issue_tags: IssueTag[];
  positive_tags: PositiveTag[];
  comment?: string;
  started_at: string;
  submitted_at: string;
}

// ... Keep existing DailyFeedback interfaces ...
export interface DailyFeedbackDetails {
  productivityScore: number;
  deepWorkScore: number;
  energyScore: number;
  meetingLoadScore: number;
}

export interface DailyFeedback {
  date: string;
  feedbackStatus: FeedbackStatus;
  details?: DailyFeedbackDetails;
  eligible: boolean;
}

export interface DailyFeedbackSubmission {
  date: string;
  details: DailyFeedbackDetails & { type: 'DAILY' };
}
