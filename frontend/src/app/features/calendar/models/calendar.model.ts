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

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  link?: string;
  provider?: AuthProvider;
  externalId?: string;
  color?: string;
}
