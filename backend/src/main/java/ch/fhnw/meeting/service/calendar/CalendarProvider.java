package ch.fhnw.meeting.service.calendar;

import ch.fhnw.meeting.dto.calendar.EventDto;
import ch.fhnw.meeting.model.calendar.AuthProvider;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

public interface CalendarProvider {
    AuthProvider getProvider();
    String getAuthorizationUrl();
    void exchangeCodeForToken(String code, String username) throws IOException;
    List<EventDto> getEvents(String username) throws IOException;

    List<EventDto> getEventsInRange(String username, LocalDateTime start, LocalDateTime end) throws IOException;
}