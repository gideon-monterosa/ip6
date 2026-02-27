export interface UserSettings {
  googleCalendarEnabled: boolean;
  googleFreeBusyEnabled: boolean;
  microsoftCalendarEnabled: boolean;
  pushNotificationsEnabled?: boolean;
  fcmToken?: string;
  workStartTime: string;
  workEndTime: string;
  workingDays: string[];
}
