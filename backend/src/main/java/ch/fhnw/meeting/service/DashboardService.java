package ch.fhnw.meeting.service;

import ch.fhnw.meeting.dto.dashboard.*;
import ch.fhnw.meeting.model.calendar.Event;
import ch.fhnw.meeting.model.feedback.Feedback;
import ch.fhnw.meeting.repository.EventRepository;
import ch.fhnw.meeting.repository.FeedbackRepository;
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

    public MeetingsResponseDto getMeetings(String username) {
        // Fetch last 3 months of events for dashboard
        LocalDateTime start = LocalDateTime.now().minusMonths(3);
        LocalDateTime end = LocalDateTime.now().plusMonths(3);
        
        List<Event> events = eventRepository.findAllByUserUsernameAndStartTimeBetweenOrderByStartTimeAsc(
                username, start, end);
                
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
        
        // Convert to Capitalized case e.g., "Mon", "Tue"
        dayOfWeek = dayOfWeek.substring(0, 1).toUpperCase() + dayOfWeek.substring(1).toLowerCase();

        return RawMeetingDto.builder()
                .meetingId(event.getId().toString())
                .startTime(event.getStartTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "Z")
                .endTime(event.getEndTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "Z")
                .durationMinutes(durationMinutes)
                .recurring(false) // Not supported in Event model currently
                .meetingType(event.getMeetingType() != null ? mapMeetingType(event.getMeetingType().name()) : "Other")
                .organizer(event.getOrganizer() != null ? event.getOrganizer() : "Unknown")
                .numberOfParticipants(event.getAttendeesCount() != null ? event.getAttendeesCount() : 1)
                .dayOfWeek(dayOfWeek)
                .timeOfDayBucket(getTimeOfDayBucket(event.getStartTime()))
                .build();
    }

    private String mapMeetingType(String type) {
        if ("ONE_ON_ONE".equals(type)) return "1:1";
        if ("STANDUP".equals(type)) return "Stand-up";
        if ("PLANNING".equals(type)) return "Planning";
        if ("RETROSPECTIVE".equals(type)) return "Retrospective";
        if ("ADHOC".equals(type)) return "Ad-hoc";
        return "Other";
    }

    private RawFeedbackDto mapToRawFeedbackDto(Feedback feedback) {
        Event event = feedback.getEvent();
        Map<String, Object> details = feedback.getDetails();

        Integer perceivedEfficiency = getIntegerFromMap(details, "rotiScore", 3);
        String mood = getStringFromMap(details, "mood", "neutral").toLowerCase();
        
        // Map mood to emotional impact (motivated, neutral, stressed)
        String emotionalImpact = "neutral";
        if (mood.contains("good") || mood.contains("great") || mood.contains("motivated")) {
            emotionalImpact = "motivated";
        } else if (mood.contains("bad") || mood.contains("terrible") || mood.contains("stressed")) {
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

    // For now, return empty lists for computed structures, or dummy data if you like.
    // Real implementation would calculate focus blocks from the user's events.
    public FocusBlocksResponseDto getFocusBlocks(String username) {
        return new FocusBlocksResponseDto(new ArrayList<>());
    }

    public FragmentationResponseDto getFragmentationScores(String username) {
        return new FragmentationResponseDto(new ArrayList<>());
    }

    public DisruptionResponseDto getFocusDisruption(String username) {
        // Average focus disruption per day based on feedback
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