package ch.fhnw.meeting.scheduler;

import ch.fhnw.meeting.model.User;
import ch.fhnw.meeting.repository.UserRepository;
import ch.fhnw.meeting.service.calendar.CalendarService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CalendarSyncScheduler {

    private final UserRepository userRepository;
    private final CalendarService calendarService;

    @Scheduled(fixedRate = 600000) // Alle 10 Minuten
    public void syncAllCalendars() {
        log.info("Starte periodischen Kalender-Sync für alle User...");
        List<User> users = userRepository.findAll();

        int successCount = 0;
        for (User user : users) {
            try {
                calendarService.syncNextMonth(user);
                successCount++;
            } catch (Exception e) {
                log.error("Fehler beim Sync für User {}: {}", user.getUsername(), e.getMessage());
            }
        }
        log.info("Kalender-Sync abgeschlossen. {}/{} User erfolgreich synchronisiert.", successCount, users.size());
    }
}