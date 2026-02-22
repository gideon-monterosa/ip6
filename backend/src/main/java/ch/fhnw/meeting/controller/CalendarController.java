package ch.fhnw.meeting.controller;

import ch.fhnw.meeting.dto.calendar.CalendarStatusResponse;
import ch.fhnw.meeting.dto.calendar.EventDto;
import ch.fhnw.meeting.dto.calendar.MeetingCategoryUpdateRequest;
import ch.fhnw.meeting.model.User;
import ch.fhnw.meeting.model.calendar.AuthProvider;
import ch.fhnw.meeting.model.calendar.Event;
import ch.fhnw.meeting.repository.EventRepository;
import ch.fhnw.meeting.repository.UserRepository;
import ch.fhnw.meeting.service.calendar.CalendarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

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

        } catch (IllegalArgumentException e) {
            if ("KALENDER_GETRENNT".equals(e.getMessage())) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "KALENDER_GETRENNT"));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Sync fehlgeschlagen: " + e.getMessage()));
        }
    }

    @PatchMapping("/events/{externalId}/category")
    public ResponseEntity<?> updateCategory(
            @PathVariable String externalId,
            @Valid @RequestBody MeetingCategoryUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User nicht gefunden"));

        Optional<Event> eventOpt = eventRepository.findByExternalIdAndProviderAndUserId(
                externalId,
                AuthProvider.GOOGLE,
                user.getId()
        );

        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();
            event.setMeetingType(request.getMeetingType());
            eventRepository.save(event);
            return ResponseEntity.ok(event);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}