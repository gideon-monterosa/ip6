package ch.fhnw.meeting.dto.calendar;

import java.util.Optional;

public class CalendarUrlResponse {
    private String url;

    public CalendarUrlResponse(String url) {
        this.url = url;
    }

    public Optional<String> getUrl() {
        return Optional.ofNullable(url);
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
