package ch.fhnw.meeting.controller;

import ch.fhnw.meeting.dto.user.UserSettingsDto;
import ch.fhnw.meeting.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/settings")
    public ResponseEntity<UserSettingsDto> getSettings(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getUserSettings(userDetails.getUsername()));
    }

    @PatchMapping("/settings")
    public ResponseEntity<UserSettingsDto> updateSettings(
            @RequestBody UserSettingsDto request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.updateUserSettings(userDetails.getUsername(), request));
    }
}