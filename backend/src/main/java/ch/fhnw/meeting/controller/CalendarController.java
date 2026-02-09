package ch.fhnw.meeting.controller;

import ch.fhnw.meeting.dto.calendar.CalendarStatusResponse;
import ch.fhnw.meeting.dto.calendar.EventDto;
import ch.fhnw.meeting.model.User;
import ch.fhnw.meeting.repository.UserRepository;
import ch.fhnw.meeting.service.calendar.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;
    private final UserRepository userRepository;

    @GetMapping("/status")
    public ResponseEntity<CalendarStatusResponse> getStatus(@AuthenticationPrincipal UserDetails userDetails) {
        CalendarStatusResponse status = calendarService.getConnectionStatus(userDetails.getUsername());
        return ResponseEntity.ok(status);
    }

    @GetMapping("/events")
    public ResponseEntity<List<EventDto>> getEventsByRange(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
        @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        List<EventDto> events = calendarService.getEventsFromDb(
            userDetails.getUsername(),
            start,
            end
        );
        return ResponseEntity.ok(events);
    }

    @PostMapping("/sync")
    public ResponseEntity<?> triggerManualSync(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User nicht gefunden: " + userDetails.getUsername()));

        try {
            calendarService.syncNextMonth(user);

            return ResponseEntity.ok(Map.of("message", "Kalender erfolgreich synchronisiert."));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Sync fehlgeschlagen: " + e.getMessage()));
        }
    }
}