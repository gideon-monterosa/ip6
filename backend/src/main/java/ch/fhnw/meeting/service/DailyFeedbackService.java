package ch.fhnw.meeting.service;

import ch.fhnw.meeting.dto.feedback.DailyFeedbackDto;
import ch.fhnw.meeting.dto.feedback.DailyFeedbackSubmitRequest;
import ch.fhnw.meeting.model.User;
import ch.fhnw.meeting.model.feedback.DailyFeedback;
import ch.fhnw.meeting.model.feedback.DailyFeedbackDetails;
import ch.fhnw.meeting.model.feedback.FeedbackStatus;
import ch.fhnw.meeting.repository.DailyFeedbackRepository;
import ch.fhnw.meeting.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Set;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DailyFeedbackService {

    private static final ZoneId ZONE = ZoneId.of("Europe/Zurich");
    private static final LocalTime DEFAULT_WORK_END_TIME = LocalTime.of(18, 0);
    private static final int TRIGGER_HOURS_BEFORE_END = 2;

    private final DailyFeedbackRepository dailyFeedbackRepository;
    private final UserRepository userRepository;

    @Transactional
    public void submitDailyFeedback(LocalDate date, DailyFeedbackSubmitRequest request, String username) {
        User user = getUser(username);

        Optional<DailyFeedback> existing = dailyFeedbackRepository.findByUserIdAndFeedbackDate(user.getId(), date);

        DailyFeedback feedback = existing.orElseGet(() -> DailyFeedback.builder()
                .user(user)
                .feedbackDate(date)
                .build());

        feedback.setFeedbackStatus(FeedbackStatus.SUBMITTED);
        feedback.setDetails(request.getDetails());
        dailyFeedbackRepository.save(feedback);
    }

    @Transactional
    public void dismissDailyFeedback(LocalDate date, String username) {
        User user = getUser(username);

        Optional<DailyFeedback> existing = dailyFeedbackRepository.findByUserIdAndFeedbackDate(user.getId(), date);

        DailyFeedback feedback = existing.orElseGet(() -> DailyFeedback.builder()
                .user(user)
                .feedbackDate(date)
                .build());

        feedback.setFeedbackStatus(FeedbackStatus.DISMISSED);
        feedback.setDetails(null);
        dailyFeedbackRepository.save(feedback);
    }

    @Transactional
    public void undoDismissDailyFeedback(LocalDate date, String username) {
        User user = getUser(username);

        dailyFeedbackRepository.findByUserIdAndFeedbackDate(user.getId(), date)
                .ifPresent(feedback -> {
                    feedback.setFeedbackStatus(FeedbackStatus.PENDING);
                    dailyFeedbackRepository.save(feedback);
                });
    }

    @Transactional(readOnly = true)
    public List<DailyFeedbackDto> getDailyFeedbacksForRange(String username, LocalDate start, LocalDate end) {
        User user = getUser(username);

        List<DailyFeedback> existing = dailyFeedbackRepository
                .findByUserIdAndFeedbackDateBetweenOrderByFeedbackDateDesc(user.getId(), start, end);

        Map<LocalDate, DailyFeedback> byDate = existing.stream()
                .collect(Collectors.toMap(DailyFeedback::getFeedbackDate, Function.identity()));

        LocalDateTime now = LocalDateTime.now(ZONE);
        List<DailyFeedbackDto> result = new ArrayList<>();

        for (LocalDate date = end; !date.isBefore(start); date = date.minusDays(1)) {
            if (!isWorkingDay(date, user)) continue;

            DailyFeedback record = byDate.get(date);
            boolean eligible = !date.isAfter(LocalDate.now(ZONE));

            if (record != null) {
                result.add(toDto(record, eligible));
            } else if (eligible) {
                result.add(DailyFeedbackDto.builder()
                        .date(date)
                        .feedbackStatus(FeedbackStatus.PENDING)
                        .eligible(true)
                        .build());
            }
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<DailyFeedbackDto> getPendingDailyFeedbacks(String username) {
        User user = getUser(username);

        LocalDate userCreatedDate = user.getCreatedAt().toLocalDate();
        LocalDate today = LocalDate.now(ZONE);
        LocalTime workEndTime = user.getWorkEndTime() != null ? user.getWorkEndTime() : DEFAULT_WORK_END_TIME;
        LocalTime triggerTime = workEndTime.minusHours(TRIGGER_HOURS_BEFORE_END);

        LocalDateTime now = LocalDateTime.now(ZONE);

        List<DailyFeedback> existing = dailyFeedbackRepository
                .findByUserIdAndFeedbackDateBetweenOrderByFeedbackDateDesc(user.getId(), userCreatedDate, today);

        Map<LocalDate, DailyFeedback> byDate = existing.stream()
                .collect(Collectors.toMap(DailyFeedback::getFeedbackDate, Function.identity()));

        List<DailyFeedbackDto> result = new ArrayList<>();

        for (LocalDate date = today; !date.isBefore(userCreatedDate); date = date.minusDays(1)) {
            if (!isWorkingDay(date, user)) continue;

            LocalDateTime triggerDateTime = date.atTime(triggerTime).atZone(ZONE).toLocalDateTime();

            if (now.isBefore(triggerDateTime)) {
                continue; // Not yet eligible
            }

            DailyFeedback record = byDate.get(date);

            if (record == null) {
                result.add(DailyFeedbackDto.builder()
                        .date(date)
                        .feedbackStatus(FeedbackStatus.PENDING)
                        .eligible(true)
                        .build());
            } else if (record.getFeedbackStatus() == FeedbackStatus.PENDING) {
                result.add(toDto(record, true));
            }
            // SUBMITTED and DISMISSED records are excluded from the pending inbox
        }

        return result;
    }

    private DailyFeedbackDto toDto(DailyFeedback record, boolean eligible) {
        DailyFeedbackDetails details = null;
        if (record.getDetails() instanceof DailyFeedbackDetails d) {
            details = d;
        }
        return DailyFeedbackDto.builder()
                .date(record.getFeedbackDate())
                .feedbackStatus(record.getFeedbackStatus())
                .details(details)
                .eligible(eligible)
                .createdAt(record.getCreatedAt())
                .build();
    }

    private boolean isWorkingDay(LocalDate date, User user) {
        Set<DayOfWeek> workingDays = user.getWorkingDays();
        if (workingDays == null || workingDays.isEmpty()) {
            // Default: Monday–Friday
            DayOfWeek dow = date.getDayOfWeek();
            return dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY;
        }
        return workingDays.contains(date.getDayOfWeek());
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
}
