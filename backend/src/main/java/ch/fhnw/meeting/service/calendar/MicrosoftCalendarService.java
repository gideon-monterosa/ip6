package ch.fhnw.meeting.service.calendar;

import ch.fhnw.meeting.dto.calendar.EventDto;
import ch.fhnw.meeting.model.calendar.AuthProvider;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MicrosoftCalendarService implements CalendarProvider {

    @Override
    public AuthProvider getProvider() {
        return null;
    }

    @Override
    public String getAuthorizationUrl() {
        return "";
    }

    @Override
    public void exchangeCodeForToken(String code, String username) throws IOException {

    }

    @Override
    public List<EventDto> getEvents(String username) throws IOException {
        return List.of();
    }

    @Override
    public List<EventDto> getEventsInRange(String username, LocalDateTime start, LocalDateTime end) throws IOException {
        return List.of();
    }
}