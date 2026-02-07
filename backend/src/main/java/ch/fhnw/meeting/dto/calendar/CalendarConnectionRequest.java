package ch.fhnw.meeting.dto.calendar;

import ch.fhnw.meeting.model.calendar.AuthProvider;

import java.util.Optional;

public class CalendarConnectionRequest {
    private String code;
    private AuthProvider provider;

    public Optional<String> getCode() {
        return Optional.ofNullable(code);
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Optional<AuthProvider> getProvider() {
        return Optional.ofNullable(provider);
    }

    public void setProvider(AuthProvider provider) {
        this.provider = provider;
    }
}
