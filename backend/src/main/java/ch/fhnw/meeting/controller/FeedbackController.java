package ch.fhnw.meeting.controller;

import ch.fhnw.meeting.dto.feedback.FeedbackSubmitRequest;
import ch.fhnw.meeting.model.feedback.FeedbackStatus;
import ch.fhnw.meeting.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping("/{externalId}/feedback")
    public ResponseEntity<Void> submitFeedback(
            @PathVariable String externalId,
            @RequestBody FeedbackSubmitRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        feedbackService.submitFeedback(externalId, request, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{externalId}/dismiss")
    public ResponseEntity<Void> dismissFeedback(
            @PathVariable String externalId,
            @AuthenticationPrincipal UserDetails userDetails) {

        feedbackService.setFeedbackStatus(externalId, userDetails.getUsername(), FeedbackStatus.DISMISSED);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{externalId}/undo-dismiss")
    public ResponseEntity<Void> undoDismissFeedback(
            @PathVariable String externalId,
            @AuthenticationPrincipal UserDetails userDetails) {

        feedbackService.setFeedbackStatus(externalId, userDetails.getUsername(), FeedbackStatus.PENDING);
        return ResponseEntity.ok().build();
    }
}