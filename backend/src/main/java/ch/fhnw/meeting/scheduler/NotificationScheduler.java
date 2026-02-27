package ch.fhnw.meeting.scheduler;

import ch.fhnw.meeting.model.calendar.Event;
import ch.fhnw.meeting.model.feedback.FeedbackStatus;
import ch.fhnw.meeting.repository.EventRepository;
import ch.fhnw.meeting.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final EventRepository eventRepository;
    private final NotificationService notificationService;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkForFinishedEvents() {
        LocalDateTime now = LocalDateTime.now();
        log.info("NotificationScheduler check gestartet um {}", now);

        List<Event> finishedEvents = eventRepository.findByEndTimeBeforeAndFeedbackStatusAndNotificationSentFalse(
                now, FeedbackStatus.PENDING);

        if (!finishedEvents.isEmpty()) {
            log.info("Sende Notifications für {} beendete Events", finishedEvents.size());
            for (Event event : finishedEvents) {
                try {
                    log.info("Verarbeite Notification für Event: {} (User: {})", event.getTitle(), event.getUser().getUsername());
                    notificationService.sendFeedbackReminder(event.getUser(), event.getTitle(), event.getExternalId());
                    event.setNotificationSent(true);
                    eventRepository.save(event);
                } catch (Exception e) {
                    log.error("Fehler beim Senden der Notification für Event {}: {}", event.getId(), e.getMessage());
                }
            }
        } else {
            log.info("Keine neuen beendeten Events für Notifications gefunden.");
        }
    }
}
