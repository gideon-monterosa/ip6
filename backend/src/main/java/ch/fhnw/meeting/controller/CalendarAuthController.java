package ch.fhnw.meeting.controller;

import ch.fhnw.meeting.service.calendar.GoogleCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarAuthController {

    private final GoogleCalendarService calendarService;

    @GetMapping("/connect")
    public ResponseEntity<?> connectToGoogle() {
        String url = calendarService.getAuthorizationUrl();
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/callback")
    public ResponseEntity<?> saveToken(@RequestBody Map<String, String> payload,
                                       @AuthenticationPrincipal UserDetails userDetails) {
        String code = payload.get("code");
        if (code == null) return ResponseEntity.badRequest().body("Code is missing");

        try {
            calendarService.exchangeCodeForToken(code, userDetails.getUsername());
            return ResponseEntity.ok("Calendar connected successfully");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Google OAuth Error: " + e.getMessage());
        }
    }
}