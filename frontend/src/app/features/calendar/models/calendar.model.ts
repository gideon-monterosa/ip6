export enum AuthProvider {
  GOOGLE = 'GOOGLE',
  MICROSOFT = 'MICROSOFT',
  FREE_BUSY = 'FREE_BUSY'
}

export interface CalendarUrlResponse {
  url: string;
}

export interface CalendarConnectionRequest {
  code: string;
  provider: AuthProvider;
}

export interface CalendarStatusResponse {
  googleConnected: boolean;
  microsoftConnected: boolean;
  googleFreeBusyConnected: boolean;
}
