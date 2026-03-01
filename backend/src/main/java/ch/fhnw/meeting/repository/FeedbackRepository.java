package ch.fhnw.meeting.repository;

import ch.fhnw.meeting.model.feedback.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    @Query("SELECT f FROM Feedback f WHERE f.event.user.username = :username")
    List<Feedback> findAllByEventUserUsername(@Param("username") String username);
}