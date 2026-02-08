package ch.fhnw.meeting.service.calendar;

import ch.fhnw.meeting.dto.calendar.CalendarStatusResponse;
import ch.fhnw.meeting.dto.calendar.EventDto;
import ch.fhnw.meeting.model.User;
import ch.fhnw.meeting.model.UserOAuthToken;
import ch.fhnw.meeting.model.calendar.AuthProvider;
import ch.fhnw.meeting.repository.UserOAuthTokenRepository;
import ch.fhnw.meeting.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class CalendarService {
    private final Map<AuthProvider, CalendarProvider> providers;
    private final UserOAuthTokenRepository tokenRepository;
    private final UserRepository userRepository;

    public CalendarService(List<CalendarProvider> providerList, UserOAuthTokenRepository tokenRepository, UserRepository userRepository) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;

        this.providers = providerList.stream()
            .collect(Collectors.toMap(CalendarProvider::getProvider, Function.identity()));
    }

    public List<EventDto> getUpcomingEvents(String username) {
        Optional<User> user = userRepository.findByUsername(username);

        if (user.isEmpty()) {
            System.out.println("Kein User gefunden!");
            return Collections.emptyList();
        }

        Optional<UserOAuthToken> token = tokenRepository.findByUserId(user.get().getId());

        if (token.isEmpty()) {
            System.out.println("Kein Kalender verknüpft!");
            return Collections.emptyList();

        }

        CalendarProvider provider = providers.get(token.get().getProvider());

        if (provider == null) {
            System.out.println("Provider Implementierung nicht gefunden für: " + token.get().getProvider());
            return Collections.emptyList();
        }

        try {
            return provider.getEvents(username);
        } catch (IOException e) {
            return Collections.emptyList();
        }
    }

    public String getAuthorizationUrl(AuthProvider providerType) {
        return providers.get(providerType).getAuthorizationUrl();
    }

    public void connect(AuthProvider providerType, String code, String username) throws IOException {
        providers.get(providerType).exchangeCodeForToken(code, username);
    }

    public CalendarStatusResponse getConnectionStatus(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isEmpty()) {
            return new CalendarStatusResponse(false, false);
        }

        boolean googleConnected = tokenRepository.findByUserIdAndProvider(user.get().getId(), AuthProvider.GOOGLE).isPresent();
        boolean microsoftConnected = tokenRepository.findByUserIdAndProvider(user.get().getId(), AuthProvider.MICROSOFT).isPresent();

        return new CalendarStatusResponse(googleConnected, microsoftConnected);
    }
}