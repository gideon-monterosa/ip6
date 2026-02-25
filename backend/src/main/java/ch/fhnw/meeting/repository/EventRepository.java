package ch.fhnw.meeting.repository;

import ch.fhnw.meeting.model.calendar.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findAllByUserUsernameAndStartTimeBetweenOrderByStartTimeAsc(
        String username,
        LocalDateTime start,
        LocalDateTime end
    );

    Optional<Event> findByExternalIdAndProviderAndUserId(
        String externalId,
        ch.fhnw.meeting.model.calendar.AuthProvider provider,
        Long userId
    );

    Optional<Event> findByExternalIdIgnoreCaseAndUserId(
            String externalId,
            Long userId
    );

    void deleteByUserIdAndProviderAndStartTimeAfter(
        Long userId,
        ch.fhnw.meeting.model.calendar.AuthProvider provider,
        LocalDateTime startTime
    );
}