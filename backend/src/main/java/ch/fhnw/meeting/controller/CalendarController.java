package ch.fhnw.meeting.controller;

import ch.fhnw.meeting.dto.EventDto;
import ch.fhnw.meeting.service.calendar.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/events")
    public ResponseEntity<?> getMyEvents(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<EventDto> events = calendarService.getUpcomingEvents(userDetails.getUsername());
            return ResponseEntity.ok(events);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Fehler beim Abrufen der Kalenderdaten: " + e.getMessage());
        }
    }
}