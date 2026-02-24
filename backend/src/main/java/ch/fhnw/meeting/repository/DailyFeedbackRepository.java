package ch.fhnw.meeting.repository;

import ch.fhnw.meeting.model.feedback.DailyFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyFeedbackRepository extends JpaRepository<DailyFeedback, Long> {

    Optional<DailyFeedback> findByUserIdAndFeedbackDate(Long userId, LocalDate date);

    List<DailyFeedback> findByUserIdAndFeedbackDateBetweenOrderByFeedbackDateDesc(
            Long userId, LocalDate start, LocalDate end
    );
}
