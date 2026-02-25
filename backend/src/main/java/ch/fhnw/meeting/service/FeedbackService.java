package ch.fhnw.meeting.service;

import ch.fhnw.meeting.dto.feedback.FeedbackSubmitRequest;
import ch.fhnw.meeting.model.User;
import ch.fhnw.meeting.model.calendar.AuthProvider;
import ch.fhnw.meeting.model.calendar.Event;
import ch.fhnw.meeting.model.feedback.Feedback;
import ch.fhnw.meeting.model.feedback.FeedbackStatus;
import ch.fhnw.meeting.repository.EventRepository;
import ch.fhnw.meeting.repository.FeedbackRepository;
import ch.fhnw.meeting.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final EventRepository eventRepository;
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    @Transactional
    public void submitFeedback(String externalId, FeedbackSubmitRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User nicht gefunden"));

        Event event = eventRepository.findByExternalIdIgnoreCaseAndUserId(externalId, user.getId())
                .orElseThrow(() -> new RuntimeException("Event nicht gefunden"));

        event.setFeedbackStatus(FeedbackStatus.SUBMITTED);
        eventRepository.save(event);

        Feedback feedback = Feedback.builder()
                .event(event)
                .feedbackType("MEETING")
                .details(request.getDetails())
                .build();

        feedbackRepository.save(feedback);
    }

    @Transactional
    public void setFeedbackStatus(String externalId, String username, FeedbackStatus status) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User nicht gefunden"));

        Event event = eventRepository.findByExternalIdIgnoreCaseAndUserId(externalId, user.getId())
                .orElseThrow(() -> new RuntimeException("Event nicht gefunden"));

        event.setFeedbackStatus(status);
        eventRepository.save(event);
    }
}