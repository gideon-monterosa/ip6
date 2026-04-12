package ch.fhnw.meeting.service.calendar;

import ch.fhnw.meeting.dto.calendar.EventDto;
import ch.fhnw.meeting.model.calendar.AuthProvider;
import ch.fhnw.meeting.model.User;
import ch.fhnw.meeting.model.UserOAuthToken;
import ch.fhnw.meeting.repository.EventRepository;
import ch.fhnw.meeting.repository.UserOAuthTokenRepository;
import ch.fhnw.meeting.repository.UserRepository;
import ch.fhnw.meeting.service.calendar.factory.GoogleEventFactory;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.Events;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GoogleCalendarService implements CalendarProvider{

    private final UserOAuthTokenRepository tokenRepository;
    private final UserRepository userRepository;

    @Value("${google.client.id}")
    private String clientId;

    @Value("${google.client.secret}")
    private String clientSecret;

    @Value("${google.redirect.uri}")
    private String redirectUri;

    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final NetHttpTransport HTTP_TRANSPORT = new NetHttpTransport();
    private static final String APPLICATION_NAME = "BachelorThesisApp";

    private final GoogleEventFactory factory;

    private final EventRepository eventRepository;

    public GoogleCalendarService(UserOAuthTokenRepository tokenRepository, UserRepository userRepository,
                                 GoogleEventFactory factory, EventRepository eventRepository) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.factory = factory;
        this.eventRepository = eventRepository;
    }

    private GoogleAuthorizationCodeFlow getFlow() {
        GoogleClientSecrets.Details web = new GoogleClientSecrets.Details();
        web.setClientId(clientId);
        web.setClientSecret(clientSecret);
        GoogleClientSecrets secrets = new GoogleClientSecrets().setWeb(web);

        return new GoogleAuthorizationCodeFlow.Builder(
            HTTP_TRANSPORT, JSON_FACTORY, secrets,
            Collections.singleton(CalendarScopes.CALENDAR_READONLY))
            .setAccessType("offline")
            .setApprovalPrompt("force")
            .build();
    }

    @Override
    public AuthProvider getProvider() {
        return AuthProvider.GOOGLE;
    }

    public String getAuthorizationUrl() {
        return getFlow().newAuthorizationUrl()
            .setRedirectUri(redirectUri)
            .build();
    }

    @Transactional
    public void exchangeCodeForToken(String code, String username) throws IOException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        GoogleTokenResponse response = getFlow().newTokenRequest(code)
            .setRedirectUri(redirectUri)
            .execute();

        UserOAuthToken tokenEntity = tokenRepository.findByUserIdAndProvider(user.getId(), AuthProvider.GOOGLE)
            .orElse(UserOAuthToken.builder()
                .user(user)
                .provider(AuthProvider.GOOGLE)
                .build());

        tokenEntity.setAccessToken(response.getAccessToken());
        if (response.getRefreshToken() != null) {
            tokenEntity.setRefreshToken(response.getRefreshToken());
        }
        tokenEntity.setExpirationTimeMillis(System.currentTimeMillis() + (response.getExpiresInSeconds() * 1000));

        tokenRepository.save(tokenEntity);
    }

    @Override
    public List<EventDto> getEvents(String username) throws IOException {
        return getUpcomingEvents(username);
    }

    public Calendar getCalendarClient(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserOAuthToken tokenEntity = tokenRepository.findByUserIdAndProvider(user.getId(), AuthProvider.GOOGLE)
            .orElseThrow(() -> new IllegalStateException("User hat noch keinen Google Kalender verknüpft."));

        Credential credential = createCredentialFromToken(tokenEntity);

        return new Calendar.Builder(HTTP_TRANSPORT, JSON_FACTORY, credential)
            .setApplicationName(APPLICATION_NAME)
            .build();
    }

    private Credential createCredentialFromToken(UserOAuthToken tokenEntity) {
        TokenResponse tokenResponse = new TokenResponse();
        tokenResponse.setAccessToken(tokenEntity.getAccessToken());
        tokenResponse.setRefreshToken(tokenEntity.getRefreshToken());

        long expiresSeconds = (tokenEntity.getExpirationTimeMillis() - System.currentTimeMillis()) / 1000;
        tokenResponse.setExpiresInSeconds(Math.max(expiresSeconds, 0));

        return new Credential.Builder(com.google.api.client.auth.oauth2.BearerToken.authorizationHeaderAccessMethod())
                .setTransport(HTTP_TRANSPORT)
                .setJsonFactory(JSON_FACTORY)
                .setTokenServerUrl(new com.google.api.client.http.GenericUrl("https://oauth2.googleapis.com/token"))
                .setClientAuthentication(new com.google.api.client.auth.oauth2.ClientParametersAuthentication(clientId, clientSecret))
                .addRefreshListener(new com.google.api.client.auth.oauth2.CredentialRefreshListener() {
                    @Override
                    public void onTokenResponse(Credential credential, TokenResponse response) {
                        updateAccessToken(tokenEntity.getUser().getId(), response);
                    }

                    @Override
                    public void onTokenErrorResponse(Credential credential, com.google.api.client.auth.oauth2.TokenErrorResponse tokenErrorResponse) {
                        System.err.println("Kritisch: Refresh Token ungültig. Fehler: " + tokenErrorResponse.getError());
                        if ("invalid_grant".equals(tokenErrorResponse.getError())) {
                            deleteInvalidToken(tokenEntity.getUser().getId());
                        }
                    }
                })
                .build()
                .setFromTokenResponse(tokenResponse);
    }

    private List<EventDto> getUpcomingEvents(String username) throws IOException {
        Calendar calendarClient = getCalendarClient(username);

        DateTime now = new DateTime(System.currentTimeMillis());

        Events events = calendarClient.events().list("primary")
            .setMaxResults(10)
            .setTimeMin(now)
            .setOrderBy("startTime")
            .setSingleEvents(true)
            .execute();

        List<Event> items = events.getItems();
        if (items.isEmpty()) {
            return Collections.emptyList();
        }

        return items.stream()
            .map(factory::create)
            .collect(Collectors.toList());
    }

    @Override
    public List<EventDto> getEventsInRange(String username, LocalDateTime start, LocalDateTime end) throws IOException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserOAuthToken tokenEntity = tokenRepository.findByUserIdAndProvider(user.getId(), AuthProvider.GOOGLE)
            .orElseThrow(() -> new IllegalStateException("No Google Calendar connected"));

        Calendar calendarClient = getCalendarClient(username);

        DateTime timeMin = new DateTime(java.util.Date.from(start.atZone(java.time.ZoneId.of("Europe/Zurich")).toInstant()));
        DateTime timeMax = new DateTime(java.util.Date.from(end.atZone(java.time.ZoneId.of("Europe/Zurich")).toInstant()));

        Events events = calendarClient.events().list("primary")
            .setMaxResults(500)
            .setTimeMin(timeMin)
            .setTimeMax(timeMax)
            .setOrderBy("startTime")
            .setSingleEvents(true)
            .execute();

        List<com.google.api.services.calendar.model.Event> items = events.getItems();
        if (items == null || items.isEmpty()) {
            return Collections.emptyList();
        }

        return items.stream()
            .map(factory::create)
            .collect(Collectors.toList());
    }

    @Transactional
    public void updateAccessToken(Long userId, TokenResponse tokenResponse) {
        tokenRepository.findByUserIdAndProvider(userId, AuthProvider.GOOGLE).ifPresent(token -> {
            token.setAccessToken(tokenResponse.getAccessToken());
            long expiresInSeconds = tokenResponse.getExpiresInSeconds();
            token.setExpirationTimeMillis(System.currentTimeMillis() + (expiresInSeconds * 1000));

            tokenRepository.save(token);
            System.out.println("Access Token für User " + userId + " aktualisiert.");
        });
    }

    @Transactional
    public void deleteInvalidToken(Long userId) {
        tokenRepository.findByUserIdAndProvider(userId, AuthProvider.GOOGLE)
                .ifPresent(token -> {
                    tokenRepository.delete(token);
                    System.err.println("Ungültiges Token für User " + userId + " aus der Datenbank entfernt.");
                });
    }
}