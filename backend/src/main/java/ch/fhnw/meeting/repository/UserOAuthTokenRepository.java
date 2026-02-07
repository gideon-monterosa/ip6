package ch.fhnw.meeting.repository;

import ch.fhnw.meeting.model.calendar.AuthProvider;
import ch.fhnw.meeting.model.UserOAuthToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserOAuthTokenRepository extends JpaRepository<UserOAuthToken, Long> {
    Optional<UserOAuthToken> findByUserId(Long userId);

    Optional<UserOAuthToken> findByUserIdAndProvider(Long userId, AuthProvider provider);
}