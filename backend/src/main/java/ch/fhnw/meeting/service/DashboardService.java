package ch.fhnw.meeting.service;

import ch.fhnw.meeting.dto.dashboard.*;
import ch.fhnw.meeting.model.calendar.Event;
import ch.fhnw.meeting.model.feedback.Feedback;
import ch.fhnw.meeting.repository.EventRepository;
import ch.fhnw.meeting.repository.FeedbackRepository;
import ch.fhnw.meeting.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EventRepository eventRepository;
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public MeetingsResponseDto getMeetings(String username) {
        LocalDateTime start = LocalDateTime.now().minusMonths(3);
        LocalDateTime end = LocalDateTime.now().plusMonths(3);
        
        List<Event> events = eventRepository.findAllByUserUsernameAndStartTimeBetweenOrderByStartTimeAsc(
                username, start, end).stream()
                .filter(e -> e.getFeedbackStatus() != ch.fhnw.meeting.model.feedback.FeedbackStatus.DISMISSED)
                .collect(Collectors.toList());
                
        List<RawMeetingDto> dtos = events.stream().map(this::mapToRawMeetingDto).collect(Collectors.toList());
        return new MeetingsResponseDto(dtos);
    }

    public FeedbackResponseDto getFeedback(String username) {
        List<Feedback> feedbacks = feedbackRepository.findAllByEventUserUsername(username);
        List<RawFeedbackDto> dtos = feedbacks.stream().map(this::mapToRawFeedbackDto).collect(Collectors.toList());
        return new FeedbackResponseDto(dtos);
    }

    private RawMeetingDto mapToRawMeetingDto(Event event) {
        int durationMinutes = (int) Duration.between(event.getStartTime(), event.getEndTime()).toMinutes();
        String dayOfWeek = event.getStartTime().getDayOfWeek().name().substring(0, 3); // "MON", "TUE"

        dayOfWeek = dayOfWeek.substring(0, 1).toUpperCase() + dayOfWeek.substring(1).toLowerCase();

        return RawMeetingDto.builder()
                .meetingId(event.getId().toString())
                .startTime(event.getStartTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "Z")
                .endTime(event.getEndTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "Z")
                .durationMinutes(durationMinutes)
                .recurring(event.getMeetingType() != null && event.getMeetingType() != ch.fhnw.meeting.model.calendar.MeetingType.AD_HOC)
                .meetingType(event.getMeetingType() != null ? mapMeetingType(event.getMeetingType().name()) : "Other")
                .organizer(event.getOrganizer() != null ? event.getOrganizer() : "Unknown")
                .numberOfParticipants(event.getAttendeesCount() != null ? event.getAttendeesCount() : 1)
                .dayOfWeek(dayOfWeek)
                .timeOfDayBucket(getTimeOfDayBucket(event.getStartTime()))
                .build();
    }

    private String mapMeetingType(String type) {
        if ("ONE_ON_ONE".equals(type)) return "1:1";
        if ("STAND_UP".equals(type)) return "Stand-up";
        if ("PLANNING".equals(type)) return "Planning";
        if ("RETROSPECTIVE".equals(type)) return "Retrospective";
        if ("AD_HOC".equals(type)) return "Ad-hoc";
        return "Other";
    }

    private RawFeedbackDto mapToRawFeedbackDto(Feedback feedback) {
        Event event = feedback.getEvent();
        Map<String, Object> details = feedback.getDetails();

        Integer perceivedEfficiency = getIntegerFromMap(details, "rotiScore", 3);
        String mood = getStringFromMap(details, "mood", "NEUTRAL").toUpperCase();

        String emotionalImpact = "neutral";
        if ("POSITIVE".equals(mood)) {
            emotionalImpact = "motivated";
        } else if ("NEGATIVE".equals(mood)) {
            emotionalImpact = "stressed";
        }

        Integer energyAfterMeeting = getIntegerFromMap(details, "energyAfter", 3);
        Integer focusDisruption = getIntegerFromMap(details, "focusDisruption", 3);
        String freeTextComment = getStringFromMap(details, "comment", "");
        
        List<String> themes = new ArrayList<>();
        if (details.containsKey("positiveTags")) {
            Object tags = details.get("positiveTags");
            if (tags instanceof List) {
                themes.addAll((List<String>) tags);
            }
        }
        if (details.containsKey("issueTags")) {
            Object tags = details.get("issueTags");
            if (tags instanceof List) {
                themes.addAll((List<String>) tags);
            }
        }

        return RawFeedbackDto.builder()
                .meetingId(event.getId().toString())
                .perceivedEfficiency(perceivedEfficiency)
                .emotionalImpact(emotionalImpact)
                .energyAfterMeeting(energyAfterMeeting)
                .perceivedValue(perceivedEfficiency >= 3)
                .perceivedFocusDisruption(focusDisruption)
                .freeTextComment(freeTextComment)
                .timeOfDayBucket(getTimeOfDayBucket(event.getStartTime()))
                .meetingType(event.getMeetingType() != null ? mapMeetingType(event.getMeetingType().name()) : "Other")
                .meetingStartTime(event.getStartTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "Z")
                .feedbackTimestamp(feedback.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "Z")
                .themes(themes)
                .build();
    }

    private Integer getIntegerFromMap(Map<String, Object> map, String key, Integer defaultValue) {
        if (map != null && map.containsKey(key) && map.get(key) != null) {
            try {
                return Integer.parseInt(map.get(key).toString());
            } catch (NumberFormatException e) {
                return defaultValue;
            }
        }
        return defaultValue;
    }

    private String getStringFromMap(Map<String, Object> map, String key, String defaultValue) {
        if (map != null && map.containsKey(key) && map.get(key) != null) {
            return map.get(key).toString();
        }
        return defaultValue;
    }

    private String getTimeOfDayBucket(LocalDateTime time) {
        int hour = time.getHour();
        if (hour < 12) {
            return "Morning";
        } else if (hour < 14) {
            return "Midday";
        } else {
            return "Afternoon";
        }
    }

    public FocusBlocksResponseDto getFocusBlocks(String username) {
        ch.fhnw.meeting.model.User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return new FocusBlocksResponseDto(new ArrayList<>());

        LocalDateTime start = LocalDateTime.now().minusWeeks(4).with(java.time.LocalTime.MIN);
        LocalDateTime end = LocalDateTime.now().plusWeeks(1).with(java.time.LocalTime.MAX);
        
        List<Event> allEvents = eventRepository.findAllByUserUsernameAndStartTimeBetweenOrderByStartTimeAsc(
                username, start, end).stream()
                .filter(e -> e.getFeedbackStatus() != ch.fhnw.meeting.model.feedback.FeedbackStatus.DISMISSED)
                .collect(Collectors.toList());

        List<FocusBlockDayDto> results = new ArrayList<>();
        java.time.LocalDate current = start.toLocalDate();
        while (!current.isAfter(end.toLocalDate())) {
            java.time.LocalDate finalCurrent = current;
            List<Event> dayEvents = allEvents.stream()
                    .filter(e -> e.getStartTime().toLocalDate().equals(finalCurrent))
                    .collect(Collectors.toList());
            
            FragmentationResult frag = calculateFragmentation(dayEvents, user, finalCurrent, 60);
            
            results.add(FocusBlockDayDto.builder()
                    .date(finalCurrent.toString())
                    .blocks60min(frag.blocks60min)
                    .blocks90min(frag.blocks90min)
                    .blocks120min(frag.blocks120min)
                    .build());
            
            current = current.plusDays(1);
        }

        return new FocusBlocksResponseDto(results);
    }

    public FragmentationResponseDto getFragmentationScores(String username) {
        ch.fhnw.meeting.model.User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return new FragmentationResponseDto(new ArrayList<>());

        LocalDateTime start = LocalDateTime.now().minusWeeks(4).with(java.time.LocalTime.MIN);
        LocalDateTime end = LocalDateTime.now().plusWeeks(1).with(java.time.LocalTime.MAX);
        
        List<Event> allEvents = eventRepository.findAllByUserUsernameAndStartTimeBetweenOrderByStartTimeAsc(
                username, start, end).stream()
                .filter(e -> e.getFeedbackStatus() != ch.fhnw.meeting.model.feedback.FeedbackStatus.DISMISSED)
                .collect(Collectors.toList());

        List<FragmentationDayDto> results = new ArrayList<>();
        java.time.LocalDate current = start.toLocalDate();
        while (!current.isAfter(end.toLocalDate())) {
            java.time.LocalDate finalCurrent = current;
            List<Event> dayEvents = allEvents.stream()
                    .filter(e -> e.getStartTime().toLocalDate().equals(finalCurrent))
                    .collect(Collectors.toList());
            
            FragmentationResult frag = calculateFragmentation(dayEvents, user, finalCurrent, 60);
            
            results.add(FragmentationDayDto.builder()
                    .date(finalCurrent.toString())
                    .scorePercentage(frag.scorePercentage)
                    .totalMeetingMinutes(frag.totalMeetingMinutes)
                    .fragmentedMinutes(frag.fragmentedMinutes)
                    .flowBlocksCount(frag.flowBlocksCount)
                    .build());
            
            current = current.plusDays(1);
        }

        return new FragmentationResponseDto(results);
    }

    private static class FragmentationResult {
        double scorePercentage;
        int totalMeetingMinutes;
        int fragmentedMinutes;
        int flowBlocksCount;
        int blocks60min;
        int blocks90min;
        int blocks120min;
    }

    private FragmentationResult calculateFragmentation(List<Event> events, ch.fhnw.meeting.model.User user, java.time.LocalDate date, int flowThresholdMinutes) {
        java.time.LocalTime workStart = user.getWorkStartTime() != null ? user.getWorkStartTime() : java.time.LocalTime.of(8, 0);
        java.time.LocalTime workEnd = user.getWorkEndTime() != null ? user.getWorkEndTime() : java.time.LocalTime.of(17, 0);
        
        LocalDateTime workdayStart = LocalDateTime.of(date, workStart);
        LocalDateTime workdayEnd = LocalDateTime.of(date, workEnd);
        
        // 1. Filter and crop events
        List<long[]> periods = events.stream()
                .map(e -> {
                    LocalDateTime start = e.getStartTime().isBefore(workdayStart) ? workdayStart : e.getStartTime();
                    LocalDateTime end = e.getEndTime().isAfter(workdayEnd) ? workdayEnd : e.getEndTime();
                    if (start.isAfter(end) || start.equals(end)) return null;
                    return new long[]{
                        start.atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli(),
                        end.atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()
                    };
                })
                .filter(java.util.Objects::nonNull)
                .sorted(java.util.Comparator.comparingLong(a -> a[0]))
                .collect(Collectors.toList());
        
        // 2. Merge overlapping events
        List<long[]> merged = new ArrayList<>();
        if (!periods.isEmpty()) {
            long[] current = periods.get(0);
            for (int i = 1; i < periods.size(); i++) {
                long[] next = periods.get(i);
                if (next[0] <= current[1]) {
                    current[1] = Math.max(current[1], next[1]);
                } else {
                    merged.add(current);
                    current = next;
                }
            }
            merged.add(current);
        }
        
        // 3. Calculate gaps
        List<Long> gaps = new ArrayList<>();
        long lastEnd = workdayStart.atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli();
        long totalMeetingMillis = 0;
        
        for (long[] m : merged) {
            long gap = m[0] - lastEnd;
            if (gap > 0) gaps.add(gap);
            totalMeetingMillis += (m[1] - m[0]);
            lastEnd = m[1];
        }
        long finalGap = workdayEnd.atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() - lastEnd;
        if (finalGap > 0) gaps.add(finalGap);
        
        // 4. Categorize gaps
        int fragmentedMinutes = 0;
        int flowBlocksCount = 0;
        int blocks60min = 0;
        int blocks90min = 0;
        int blocks120min = 0;
        
        for (Long gapMillis : gaps) {
            int gapMinutes = (int) (gapMillis / (1000 * 60));
            if (gapMinutes >= flowThresholdMinutes) {
                flowBlocksCount++;
                blocks60min++;
                if (gapMinutes >= 90) blocks90min++;
                if (gapMinutes >= 120) blocks120min++;
            } else if (gapMinutes > 0) {
                fragmentedMinutes += gapMinutes;
            }
        }
        
        int totalWorkdayMinutes = (int) Duration.between(workdayStart, workdayEnd).toMinutes();
        int totalMeetingMinutes = (int) (totalMeetingMillis / (1000 * 60));
        int freeTime = totalWorkdayMinutes - totalMeetingMinutes;
        
        double scorePercentage = 0;
        if (freeTime > 0) {
            scorePercentage = (fragmentedMinutes * 100.0) / freeTime;
        }
        
        FragmentationResult res = new FragmentationResult();
        res.scorePercentage = Math.round(scorePercentage * 10.0) / 10.0;
        res.totalMeetingMinutes = totalMeetingMinutes;
        res.fragmentedMinutes = fragmentedMinutes;
        res.flowBlocksCount = flowBlocksCount;
        res.blocks60min = blocks60min;
        res.blocks90min = blocks90min;
        res.blocks120min = blocks120min;
        return res;
    }

    public DisruptionResponseDto getFocusDisruption(String username) {
        List<Feedback> feedbacks = feedbackRepository.findAllByEventUserUsername(username);
        
        Map<String, Double> disruptionPerDay = feedbacks.stream()
            .collect(Collectors.groupingBy(
                f -> f.getEvent().getStartTime().toLocalDate().toString(),
                Collectors.averagingInt(f -> getIntegerFromMap(f.getDetails(), "focusDisruption", 1))
            ));
            
        List<DisruptionDayDto> list = disruptionPerDay.entrySet().stream()
            .map(e -> DisruptionDayDto.builder().date(e.getKey()).avgDisruption(Math.round(e.getValue() * 10.0) / 10.0).build())
            .collect(Collectors.toList());
            
        return new DisruptionResponseDto(list);
    }
}