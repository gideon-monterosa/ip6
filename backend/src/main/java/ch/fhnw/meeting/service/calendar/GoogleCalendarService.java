package ch.fhnw.meeting.service.calendar;

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
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class GoogleCalendarService {

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

        UserOAuthToken tokenEntity = tokenRepository.findByUserId(user.getId())
            .orElse(UserOAuthToken.builder().user(user).build());

        tokenEntity.setAccessToken(response.getAccessToken());
        if (response.getRefreshToken() != null) {
            tokenEntity.setRefreshToken(response.getRefreshToken());
        }
        tokenEntity.setExpirationTimeMillis(System.currentTimeMillis() + (response.getExpiresInSeconds() * 1000));

        tokenRepository.save(tokenEntity);
    }

    public Calendar getCalendarClient(String username) throws IOException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserOAuthToken tokenEntity = tokenRepository.findByUserId(user.getId())
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
        tokenResponse.setExpiresInSeconds((tokenEntity.getExpirationTimeMillis() - System.currentTimeMillis()) / 1000);

        return new Credential.Builder(com.google.api.client.auth.oauth2.BearerToken.authorizationHeaderAccessMethod())
            .setTransport(HTTP_TRANSPORT)
            .setJsonFactory(JSON_FACTORY)
            .setTokenServerUrl(new com.google.api.client.http.GenericUrl("https://oauth2.googleapis.com/token"))
            .setClientAuthentication(new com.google.api.client.auth.oauth2.ClientParametersAuthentication(clientId, clientSecret))
            .build()
            .setFromTokenResponse(tokenResponse);
    }
}