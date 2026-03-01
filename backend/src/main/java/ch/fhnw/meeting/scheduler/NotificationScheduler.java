package ch.fhnw.meeting.scheduler;

import ch.fhnw.meeting.model.User;
import ch.fhnw.meeting.model.calendar.Event;
import ch.fhnw.meeting.model.feedback.FeedbackStatus;
import ch.fhnw.meeting.repository.EventRepository;
import ch.fhnw.meeting.repository.UserRepository;
import ch.fhnw.meeting.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private static final ZoneId ZONE = ZoneId.of("Europe/Zurich");
    private static final LocalTime DEFAULT_WORK_END_TIME = LocalTime.of(18, 0);
    private static final int TRIGGER_HOURS_BEFORE_END = 2;

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
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

    @Scheduled(fixedRate = 300000)
    @Transactional
    public void checkForEodFeedbacks() {
        LocalDateTime now = LocalDateTime.now(ZONE);
        LocalDate today = now.toLocalDate();
        log.info("EOD Notification check gestartet um {}", now);

        List<User> users = userRepository.findByPushNotificationsEnabledTrueAndFcmTokenIsNotNull();

        for (User user : users) {
            if (user.getFcmToken().isEmpty()) continue;

            if (user.getWorkingDays() != null && !user.getWorkingDays().contains(today.getDayOfWeek())) {
                continue;
            }

            LocalTime workEndTime = user.getWorkEndTime() != null ? user.getWorkEndTime() : DEFAULT_WORK_END_TIME;
            LocalTime triggerTime = workEndTime.minusHours(TRIGGER_HOURS_BEFORE_END);
            LocalDateTime triggerDateTime = today.atTime(triggerTime);

            boolean alreadySentToday = user.getLastEodNotificationSentAt() != null &&
                    user.getLastEodNotificationSentAt().toLocalDate().equals(today);

            if (now.isAfter(triggerDateTime) && !alreadySentToday) {
                try {
                    log.info("Sende EOD Notification an User: {}", user.getUsername());
                    notificationService.sendEodFeedbackReminder(user, today.toString());
                    user.setLastEodNotificationSentAt(now);
                    userRepository.save(user);
                } catch (Exception e) {
                    log.error("Fehler beim Senden der EOD Notification für User {}: {}", user.getUsername(), e.getMessage());
                }
            }
        }
    }
}
