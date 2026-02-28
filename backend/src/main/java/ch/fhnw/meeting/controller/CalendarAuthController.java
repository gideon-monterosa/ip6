package ch.fhnw.meeting.controller;

import ch.fhnw.meeting.dto.calendar.CalendarConnectionRequest;
import ch.fhnw.meeting.dto.calendar.CalendarUrlResponse;
import ch.fhnw.meeting.model.calendar.AuthProvider;
import ch.fhnw.meeting.service.calendar.CalendarService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/calendar")
public class CalendarAuthController {

    private final CalendarService calendarService;

    public CalendarAuthController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping("/connect")
    public ResponseEntity<?> connect(String provider) {
        try {
            AuthProvider authProvider = AuthProvider.valueOf(provider.toUpperCase());
            String url = calendarService.getAuthorizationUrl(authProvider);

            return ResponseEntity.ok(new CalendarUrlResponse(url));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Unbekannter Provider: " + provider);
        }
    }

    @PostMapping("/callback")
    public ResponseEntity<?> saveToken(@RequestBody CalendarConnectionRequest request,
                                       @AuthenticationPrincipal UserDetails userDetails) {

        if (request.getCode() == null || request.getCode().isBlank()) {
            return ResponseEntity.badRequest().body("Code is missing");
        }

        try {
            AuthProvider provider = request.getProvider() != null
                ? request.getProvider()
                : AuthProvider.FREE_BUSY;

            calendarService.connect(provider, request.getCode(), userDetails.getUsername());

            return ResponseEntity.ok(provider + " Calendar connected successfully");

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("OAuth Error: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid Provider");
        }
    }

}