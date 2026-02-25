package ch.fhnw.meeting.service.calendar;

import ch.fhnw.meeting.dto.calendar.EventDto;
import ch.fhnw.meeting.model.calendar.AuthProvider;
import ch.fhnw.meeting.model.User;
import ch.fhnw.meeting.model.UserOAuthToken;
import ch.fhnw.meeting.repository.UserOAuthTokenRepository;
import ch.fhnw.meeting.repository.UserRepository;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.FreeBusyRequest;
import com.google.api.services.calendar.model.FreeBusyRequestItem;
import com.google.api.services.calendar.model.FreeBusyResponse;
import com.google.api.services.calendar.model.TimePeriod;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GoogleFreeBusyService implements CalendarProvider{
    private final UserOAuthTokenRepository tokenRepository;
    private final UserRepository userRepository;

    @Value("${google.free.busy.client.id}")
    private String clientId;

    @Value("${google.free.busy.client.secret}")
    private String clientSecret;

    @Value("${google.redirect.uri}")
    private String redirectUri;

    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final NetHttpTransport HTTP_TRANSPORT = new NetHttpTransport();
    private static final String APPLICATION_NAME = "BachelorThesisApp";

    public GoogleFreeBusyService(UserOAuthTokenRepository tokenRepository, UserRepository userRepository) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
    }

    private GoogleAuthorizationCodeFlow getFlow() {
        GoogleClientSecrets.Details web = new GoogleClientSecrets.Details();
        web.setClientId(clientId);
        web.setClientSecret(clientSecret);
        GoogleClientSecrets secrets = new GoogleClientSecrets().setWeb(web);

        return new GoogleAuthorizationCodeFlow.Builder(
                HTTP_TRANSPORT, JSON_FACTORY, secrets,
                Collections.singleton("https://www.googleapis.com/auth/calendar.freebusy"))
                .setAccessType("offline")
                .setApprovalPrompt("force")
                .build();
    }

    @Override
    public AuthProvider getProvider() {
        return AuthProvider.FREE_BUSY;
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

        UserOAuthToken tokenEntity = tokenRepository.findByUserIdAndProvider(user.getId(), AuthProvider.FREE_BUSY)
                .orElse(UserOAuthToken.builder()
                        .user(user)
                        .provider(AuthProvider.FREE_BUSY)
                        .build());

        tokenEntity.setAccessToken(response.getAccessToken());
        if (response.getRefreshToken() != null) {
            tokenEntity.setRefreshToken(response.getRefreshToken());
        }
        tokenEntity.setExpirationTimeMillis(System.currentTimeMillis() + (response.getExpiresInSeconds() * 1000));

        tokenRepository.save(tokenEntity);
    }

    public Calendar getCalendarClient(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserOAuthToken tokenEntity = tokenRepository.findByUserIdAndProvider(user.getId(), AuthProvider.FREE_BUSY)
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

    @Override
    public List<EventDto> getEvents(String username) throws IOException {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime inThirtyDays = now.plusDays(30);

        List<EventDto> upcomingBusyPeriods = getEventsInRange(username, now, inThirtyDays);

        return upcomingBusyPeriods.stream()
                .limit(10)
                .collect(Collectors.toList());
    }

    @Override
    public List<EventDto> getEventsInRange(String username, LocalDateTime start, LocalDateTime end) throws IOException {
        Calendar calendarClient = getCalendarClient(username);

        DateTime timeMin = new DateTime(java.util.Date.from(start.atZone(ZoneId.systemDefault()).toInstant()));
        DateTime timeMax = new DateTime(java.util.Date.from(end.atZone(ZoneId.systemDefault()).toInstant()));

        FreeBusyRequest request = new FreeBusyRequest()
                .setTimeMin(timeMin)
                .setTimeMax(timeMax)
                .setItems(Collections.singletonList(new FreeBusyRequestItem().setId("primary")));

        FreeBusyResponse response = calendarClient.freebusy().query(request).execute();

        List<TimePeriod> busyPeriods = response.getCalendars().get("primary").getBusy();

        if (busyPeriods == null || busyPeriods.isEmpty()) {
            return Collections.emptyList();
        }

        return busyPeriods.stream()
                .map(this::mapTimePeriodToDto)
                .collect(Collectors.toList());
    }

    private EventDto mapTimePeriodToDto(TimePeriod period) {
        LocalDateTime startTime = LocalDateTime.ofInstant(
                Instant.ofEpochMilli(period.getStart().getValue()), ZoneId.systemDefault());
        LocalDateTime endTime = LocalDateTime.ofInstant(
                Instant.ofEpochMilli(period.getEnd().getValue()), ZoneId.systemDefault());

        return EventDto.builder()
                .id(java.util.UUID.randomUUID().toString())
                .title("Busy")
                .description("")
                .start(startTime)
                .end(endTime)
                .build();
    }

    @Transactional
    public void updateAccessToken(Long userId, TokenResponse tokenResponse) {
        tokenRepository.findByUserIdAndProvider(userId, AuthProvider.FREE_BUSY).ifPresent(token -> {
            token.setAccessToken(tokenResponse.getAccessToken());
            long expiresInSeconds = tokenResponse.getExpiresInSeconds();
            token.setExpirationTimeMillis(System.currentTimeMillis() + (expiresInSeconds * 1000));

            tokenRepository.save(token);
            System.out.println("Access Token für User " + userId + " aktualisiert.");
        });
    }

    @Transactional
    public void deleteInvalidToken(Long userId) {
        tokenRepository.findByUserIdAndProvider(userId, AuthProvider.FREE_BUSY)
                .ifPresent(token -> {
                    tokenRepository.delete(token);
                    System.err.println("Ungültiges Token für User " + userId + " aus der Datenbank entfernt.");
                });
    }
}
