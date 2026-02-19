export enum AuthProvider {
  GOOGLE = 'GOOGLE',
  MICROSOFT = 'MICROSOFT'
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
}
