package ch.fhnw.meeting.dto.calendar;

import ch.fhnw.meeting.model.calendar.AuthProvider;

public class CalendarConnectionRequest {
    private String code;
    private AuthProvider provider;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public AuthProvider getProvider() {
        return provider;
    }

    public void setProvider(AuthProvider provider) {
        this.provider = provider;
    }
}