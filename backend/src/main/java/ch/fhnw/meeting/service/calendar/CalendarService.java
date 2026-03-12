package ch.fhnw.meeting.service.calendar;

import ch.fhnw.meeting.dto.calendar.CalendarStatusResponse;
import ch.fhnw.meeting.dto.calendar.EventDto;
import ch.fhnw.meeting.model.User;
import ch.fhnw.meeting.model.UserOAuthToken;
import ch.fhnw.meeting.model.calendar.AuthProvider;
import ch.fhnw.meeting.model.calendar.Event;
import ch.fhnw.meeting.model.calendar.MeetingType;
import ch.fhnw.meeting.repository.EventRepository;
import ch.fhnw.meeting.repository.UserOAuthTokenRepository;
import ch.fhnw.meeting.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
public class CalendarService {
    private final Map<AuthProvider, CalendarProvider> providers;
    private final UserOAuthTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final MeetingCategorizationService categorizationService;


    public CalendarService(List<CalendarProvider> providerList,
                           UserOAuthTokenRepository tokenRepository,
                           UserRepository userRepository,
                           EventRepository eventRepository,
                           MeetingCategorizationService categorizationService) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.categorizationService = categorizationService;
        this.providers = providerList.stream()
            .collect(Collectors.toMap(CalendarProvider::getProvider, Function.identity()));
    }

    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public void syncNextMonth(User user) {
        Optional<UserOAuthToken> tokenOpt = tokenRepository.findByUserId(user.getId());
        if (tokenOpt.isEmpty()) return;

        UserOAuthToken token = tokenOpt.get();
        CalendarProvider provider = providers.get(token.getProvider());

        if (provider == null) return;

        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusMonths(1);

        try {
            log.info("Starte Sync für User {} mit Provider {}", user.getUsername(), token.getProvider());

            List<EventDto> remoteEvents = provider.getEventsInRange(user.getUsername(), start, end);

            // Bestehende Daten aus der DB in remoteEvents übernehmen
            for (EventDto remoteEvent : remoteEvents) {
                eventRepository.findByExternalIdAndProviderAndUserId(remoteEvent.getId(), token.getProvider(), user.getId())
                        .ifPresent(existing -> {
                            remoteEvent.setMeetingType(existing.getMeetingType());
                            remoteEvent.setCategorizedByAi(existing.getCategorizedByAi());
                            remoteEvent.setFeedbackStatus(existing.getFeedbackStatus());
                            remoteEvent.setNotificationSent(existing.getNotificationSent());
                        });
            }

            eventRepository.deleteByUserIdAndProviderAndStartTimeAfter(
                    user.getId(),
                    token.getProvider(),
                    start
            );

            for (EventDto dto : remoteEvents) {
                saveEvent(dto, user, token.getProvider());
            }

            token.setUpdatedAt(LocalDateTime.now());
            tokenRepository.save(token);

            log.info("Sync erfolgreich. {} Events gespeichert.", remoteEvents.size());

        } catch (IOException e) {
            log.error("Fehler beim Sync für User {}", user.getUsername(), e);

            if (e.getMessage() != null && e.getMessage().contains("invalid_grant")) {
                log.warn("Token für User {} ist abgelaufen oder wurde widerrufen. Token wird gelöscht.", user.getUsername());
                tokenRepository.delete(token);
                throw new IllegalArgumentException("KALENDER_GETRENNT");
            }

            throw new RuntimeException("Sync failed for " + user.getUsername(), e);
        }
    }

    public List<EventDto> getEventsFromDb(String username, LocalDateTime start, LocalDateTime end) {
        return eventRepository.findAllByUserUsernameAndStartTimeBetweenOrderByStartTimeAsc(username, start, end)
            .stream()
            .map(this::mapEntityToDto)
            .collect(Collectors.toList());
    }

    private void saveEvent(EventDto dto, User user, AuthProvider provider) {
        if (dto.getStart() == null) return;

        try {
            LocalDateTime startTime = dto.getStart();
            LocalDateTime endTime = dto.getEnd() != null ? dto.getEnd() : startTime.plusHours(1);

            Optional<Event> existingEventOpt = eventRepository.findByExternalIdAndProviderAndUserId(
                    dto.getId(),
                    provider,
                    user.getId()
            );

            if (existingEventOpt.isPresent()) {
                Event event = existingEventOpt.get();
                event.setTitle(dto.getTitle());
                event.setDescription(dto.getDescription());
                event.setLink(dto.getLink());
                event.setStartTime(startTime);
                event.setEndTime(endTime);
                event.setLocation(dto.getLocation());
                event.setOrganizer(dto.getOrganizer());
                event.setAttendeesCount(dto.getAttendeesCount() != null ? dto.getAttendeesCount() : 0);
                event.setMeetingType(dto.getMeetingType());
                event.setCategorizedByAi(dto.getCategorizedByAi() != null ? dto.getCategorizedByAi() : false);
                event.setNotificationSent(dto.getNotificationSent() != null ? dto.getNotificationSent() : false);
                event.setFeedbackStatus(dto.getFeedbackStatus() != null ? dto.getFeedbackStatus() : ch.fhnw.meeting.model.feedback.FeedbackStatus.PENDING);
            } else {
                Event event = Event.builder()
                        .externalId(dto.getId())
                        .title(dto.getTitle())
                        .description(dto.getDescription())
                        .link(dto.getLink())
                        .provider(provider)
                        .user(user)
                        .startTime(startTime)
                        .endTime(endTime)
                        .meetingType(dto.getMeetingType())
                        .location(dto.getLocation())
                        .organizer(dto.getOrganizer())
                        .attendeesCount(dto.getAttendeesCount())
                        .notificationSent(dto.getNotificationSent() != null ? dto.getNotificationSent() : false)
                        .feedbackStatus(dto.getFeedbackStatus() != null ? dto.getFeedbackStatus() : ch.fhnw.meeting.model.feedback.FeedbackStatus.PENDING)
                        .categorizedByAi(dto.getCategorizedByAi() != null ? dto.getCategorizedByAi() : false)
                        .build();
                eventRepository.save(event);
            }

        } catch (Exception e) {
            log.warn("Konnte Event {} nicht speichern: {}", dto.getTitle(), e.getMessage());
        }
    }

    private EventDto mapEntityToDto(Event event) {
        EventDto dto = new EventDto();
        dto.setId(event.getExternalId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setLink(event.getLink());
        dto.setStart(event.getStartTime());
        dto.setEnd(event.getEndTime());
        dto.setMeetingType(event.getMeetingType());
        dto.setLocation(event.getLocation());
        dto.setOrganizer(event.getOrganizer());
        dto.setAttendeesCount(event.getAttendeesCount());
        dto.setFeedbackStatus(event.getFeedbackStatus());
        dto.setMeetingType(event.getMeetingType());
        dto.setCategorizedByAi(event.getCategorizedByAi());
        dto.setNotificationSent(event.getNotificationSent());
        return dto;
    }

    private LocalDateTime parseDate(String dateStr) {
        if (dateStr == null) return null;

        ZoneId targetZone = ZoneId.of("Europe/Zurich");

        if (dateStr.length() <= 10) {
            return LocalDate.parse(dateStr).atStartOfDay();
        }

        try {
            ZonedDateTime sourceTime = ZonedDateTime.parse(dateStr, DateTimeFormatter.ISO_DATE_TIME);

            ZonedDateTime targetTime = sourceTime.withZoneSameInstant(targetZone);

            return targetTime.toLocalDateTime();

        } catch (Exception e) {
            throw new RuntimeException("Konnte Datum nicht parsen: " + dateStr, e);
        }
    }
    public String getAuthorizationUrl(AuthProvider providerType) {
        CalendarProvider provider = providers.get(providerType);
        if (provider == null) throw new IllegalArgumentException("Provider nicht unterstützt");
        return provider.getAuthorizationUrl();
    }

    @Transactional
    public void connect(AuthProvider providerType, String code, String username) throws IOException {
        CalendarProvider provider = providers.get(providerType);
        if (provider == null) {
            throw new IllegalArgumentException("Provider nicht unterstützt");
        }
        provider.exchangeCodeForToken(code, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User nicht gefunden: " + username));

        log.info("Verbindung erfolgreich. Starte initialen Sync für {}", username);
        syncNextMonth(user);
    }

    public CalendarStatusResponse getConnectionStatus(String username) {
        Optional<User> user = userRepository.findByUsername(username);

        if (user.isEmpty()) return new CalendarStatusResponse(false, false, false);

        Long userId = user.get().getId();

        boolean google = tokenRepository.findByUserIdAndProvider(userId, AuthProvider.GOOGLE).isPresent();
        boolean ms = tokenRepository.findByUserIdAndProvider(userId, AuthProvider.MICROSOFT).isPresent();
        boolean freeBusy = tokenRepository.findByUserIdAndProvider(userId, AuthProvider.FREE_BUSY).isPresent();

        return new CalendarStatusResponse(google, ms, freeBusy);
    }

    @Transactional
    public EventDto createInternalEvent(EventDto dto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User nicht gefunden: " + username));

        Event event = Event.builder()
                .externalId(java.util.UUID.randomUUID().toString())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .startTime(dto.getStart())
                .endTime(dto.getEnd())
                .link(dto.getLink())
                .provider(AuthProvider.INTERNAL)
                .user(user)
                .meetingType(dto.getMeetingType() != null ? dto.getMeetingType() : MeetingType.OTHER)
                .location(dto.getLocation())
                .organizer(dto.getOrganizer())
                .attendeesCount(dto.getAttendeesCount() != null ? dto.getAttendeesCount() : 0)
                .notificationSent(false)
                .build();

        return mapEntityToDto(eventRepository.save(event));
    }

    @Transactional
    public EventDto updateInternalEvent(String externalId, EventDto dto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User nicht gefunden: " + username));

        Event event = eventRepository.findByExternalIdIgnoreCaseAndUserId(externalId, user.getId())
                .orElseThrow(() -> new RuntimeException("Event nicht gefunden"));

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setStartTime(dto.getStart());
        event.setEndTime(dto.getEnd());
        event.setLink(dto.getLink());
        event.setMeetingType(dto.getMeetingType() != null ? dto.getMeetingType() : MeetingType.OTHER);
        event.setLocation(dto.getLocation());
        event.setOrganizer(dto.getOrganizer());
        event.setAttendeesCount(dto.getAttendeesCount() != null ? dto.getAttendeesCount() : 0);

        return mapEntityToDto(eventRepository.save(event));
    }

    @Transactional
    public void deleteInternalEvent(String externalId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User nicht gefunden: " + username));

        Event event = eventRepository.findByExternalIdIgnoreCaseAndUserId(externalId, user.getId())
                .orElseThrow(() -> new RuntimeException("Event nicht gefunden"));

        eventRepository.delete(event);
    }

    @Transactional
    public List<EventDto> createInternalEvents(List<EventDto> dtos, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User nicht gefunden: " + username));

        List<Event> events = dtos.stream().map(dto -> Event.builder()
                .externalId(java.util.UUID.randomUUID().toString())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .startTime(dto.getStart())
                .endTime(dto.getEnd())
                .link(dto.getLink())
                .provider(AuthProvider.INTERNAL)
                .user(user)
                .meetingType(dto.getMeetingType() != null ? dto.getMeetingType() : MeetingType.OTHER)
                .location(dto.getLocation())
                .organizer(dto.getOrganizer())
                .attendeesCount(dto.getAttendeesCount() != null ? dto.getAttendeesCount() : 0)
                .notificationSent(false)
                .build()).toList();

        return eventRepository.saveAll(events).stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }
}