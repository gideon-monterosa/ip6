package ch.fhnw.meeting.controller;

import ch.fhnw.meeting.dto.feedback.DailyFeedbackDto;
import ch.fhnw.meeting.dto.feedback.DailyFeedbackSubmitRequest;
import ch.fhnw.meeting.service.DailyFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/daily-feedback")
@RequiredArgsConstructor
public class DailyFeedbackController {

    private final DailyFeedbackService dailyFeedbackService;

    @PostMapping("/{date}/submit")
    public ResponseEntity<Void> submitFeedback(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestBody DailyFeedbackSubmitRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        dailyFeedbackService.submitDailyFeedback(date, request, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{date}/dismiss")
    public ResponseEntity<Void> dismiss(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal UserDetails userDetails) {

        dailyFeedbackService.dismissDailyFeedback(date, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{date}/undo-dismiss")
    public ResponseEntity<Void> undoDismiss(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal UserDetails userDetails) {

        dailyFeedbackService.undoDismissDailyFeedback(date, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/range")
    public ResponseEntity<List<DailyFeedbackDto>> getRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<DailyFeedbackDto> feedbacks = dailyFeedbackService.getDailyFeedbacksForRange(
                userDetails.getUsername(), start, end);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<DailyFeedbackDto>> getPending(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<DailyFeedbackDto> feedbacks = dailyFeedbackService.getPendingDailyFeedbacks(
                userDetails.getUsername());
        return ResponseEntity.ok(feedbacks);
    }
}
