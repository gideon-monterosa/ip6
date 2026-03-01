package ch.fhnw.meeting.controller;

import ch.fhnw.meeting.dto.dashboard.*;
import ch.fhnw.meeting.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/structure/meetings")
    public ResponseEntity<MeetingsResponseDto> getMeetings(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dashboardService.getMeetings(userDetails.getUsername()));
    }

    @GetMapping("/structure/focus-blocks")
    public ResponseEntity<FocusBlocksResponseDto> getFocusBlocks(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dashboardService.getFocusBlocks(userDetails.getUsername()));
    }

    @GetMapping("/structure/fragmentation-scores")
    public ResponseEntity<FragmentationResponseDto> getFragmentationScores(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dashboardService.getFragmentationScores(userDetails.getUsername()));
    }

    @GetMapping("/impact/feedback")
    public ResponseEntity<FeedbackResponseDto> getFeedback(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dashboardService.getFeedback(userDetails.getUsername()));
    }

    @GetMapping("/impact/focus-disruption")
    public ResponseEntity<DisruptionResponseDto> getFocusDisruption(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dashboardService.getFocusDisruption(userDetails.getUsername()));
    }
}