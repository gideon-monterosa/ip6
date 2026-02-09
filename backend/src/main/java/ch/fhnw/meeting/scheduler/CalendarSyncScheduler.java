package ch.fhnw.meeting.scheduler;

import ch.fhnw.meeting.model.User;
import ch.fhnw.meeting.repository.UserRepository;
import ch.fhnw.meeting.service.calendar.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CalendarSyncScheduler {

    private final UserRepository userRepository;
    private final CalendarService calendarService;

    @Scheduled(fixedRate = 900000) // 15 Minuten = 900.000 ms
    public void syncAllCalendars() {
        List<User> users = userRepository.findAll();

        for (User user : users) {
            try {
                calendarService.syncNextMonth(user);
            } catch (Exception e) {
                // Fehler loggen, aber Loop nicht unterbrechen
                System.err.println("Failed to sync user " + user.getUsername());
            }
        }
    }
}