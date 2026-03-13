package ch.fhnw.meeting.service.calendar;

import ch.fhnw.meeting.dto.calendar.EventDto;
import ch.fhnw.meeting.model.calendar.AuthProvider;
import ch.fhnw.meeting.model.calendar.Event;
import ch.fhnw.meeting.model.calendar.MeetingType;
import ch.fhnw.meeting.repository.EventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class MeetingCategorizationService {

    private final ObjectMapper objectMapper;
    private final WebClient ollamaWebClient;
    private final EventRepository eventRepository;

    @Value("${ollama.model:llama3.1:8b}")
    private String modelName;

    public MeetingCategorizationService(ObjectMapper objectMapper, WebClient ollamaWebClient, EventRepository eventRepository) {
        this.objectMapper = objectMapper;
        this.ollamaWebClient = ollamaWebClient;
        this.eventRepository = eventRepository;
    }

    public void categorizeEvents(List<EventDto> events) {
        if (events == null || events.isEmpty()) return;

        List<EventDto> eventsToCategorize = events.stream()
                .filter(e -> e.getCategorizedByAi() == null || !e.getCategorizedByAi())
                .filter(e -> e.getTitle() != null && !e.getTitle().trim().isEmpty())
                .collect(Collectors.toList());

        if (eventsToCategorize.isEmpty()) return;

        List<EventDto> firstBatch = eventsToCategorize.stream().limit(10).collect(Collectors.toList());
        List<String> titles = firstBatch.stream()
                .map(EventDto::getTitle)
                .distinct()
                .collect(Collectors.toList());

        Map<String, MeetingType> categoryMap = fetchCategoriesFromOllama(titles);

        int updatedCount = 0;
        for (EventDto event : firstBatch) {
            if (categoryMap.containsKey(event.getTitle())) {
                event.setMeetingType(categoryMap.get(event.getTitle()));
                event.setCategorizedByAi(true);
                updatedCount++;
            }
        }
        log.info("Categorized {}/{} events in initial batch", updatedCount, firstBatch.size());
    }

    @Async
    @Transactional
    public void categorizeRemainingEventsAsync(Long userId, AuthProvider provider) {
        log.info("Starting async categorization for user {} and provider {}", userId, provider);

        List<Event> uncategorizedEvents = eventRepository.findByUserIdAndProviderAndCategorizedByAiFalse(userId, provider);

        if (uncategorizedEvents.isEmpty()) {
            log.info("No more events to categorize for user {}", userId);
            return;
        }

        log.info("Found {} uncategorized events for user {}", uncategorizedEvents.size(), userId);

        for (int i = 0; i < uncategorizedEvents.size(); i += 10) {
            int end = Math.min(i + 10, uncategorizedEvents.size());
            List<Event> batch = uncategorizedEvents.subList(i, end);

            List<String> titles = batch.stream()
                    .map(Event::getTitle)
                    .distinct()
                    .collect(Collectors.toList());

            Map<String, MeetingType> categoryMap = fetchCategoriesFromOllama(titles);

            int updatedCount = 0;
            for (Event event : batch) {
                if (categoryMap.containsKey(event.getTitle())) {
                    event.setMeetingType(categoryMap.get(event.getTitle()));
                    event.setCategorizedByAi(true);
                    updatedCount++;
                }
            }

            eventRepository.saveAll(batch);
            log.info("Categorized {}/{} events in batch for user {}", updatedCount, batch.size(), userId);
        }
    }

    private Map<String, MeetingType> fetchCategoriesFromOllama(List<String> titles) {
        Map<String, MeetingType> result = new HashMap<>();
        if (titles.isEmpty()) return result;

        log.info("Fetching categories from Ollama for {} unique titles", titles.size());

        try {
            StringBuilder titleList = new StringBuilder();
            for (String title : titles) {
                titleList.append("- ").append(title).append("\n");
            }

            String prompt = String.format(
                    "You are an expert assistant. Categorize the following meeting titles.\n\n" +
                    "Categories: [STAND_UP, PLANNING, RETROSPECTIVE, ONE_ON_ONE, AD_HOC, OTHER].\n\n" +
                    "Rules:\n" +
                    "- \"Sync with [Name]\" or \"1:1\" is ONE_ON_ONE.\n" +
                    "- If a title is ambiguous, a private appointment, or you are unsure, strictly use OTHER.\n\n" +
                    "Output ONLY a valid JSON object where the keys are the EXACT meeting titles provided and the values are the categories.\n\n" +
                    "Example:\n" +
                    "{\n" +
                    "  \"Sync with Joe\": \"ONE_ON_ONE\",\n" +
                    "  \"Daily Standup\": \"STAND_UP\"\n" +
                    "}\n\n" +
                    "Meeting titles:\n%s",
                    titleList.toString());

            OllamaRequest request = new OllamaRequest();
            request.setModel(modelName);
            request.setPrompt(prompt);
            request.setStream(false);
            request.setFormat("json");
            request.setOptions(new Options(0.0));

            OllamaResponse response = ollamaWebClient.post()
                    .uri("/api/generate")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(OllamaResponse.class)
                    .block();

            if (response != null && response.getResponse() != null) {
                log.debug("Ollama Response: {}", response.getResponse());
                JsonNode rootNode = objectMapper.readTree(response.getResponse());
                
                if (rootNode.isArray()) {
                    for (JsonNode node : rootNode) {
                        parseEntry(node, result);
                    }
                } else if (rootNode.isObject()) {
                    if (rootNode.has("title") && rootNode.has("category")) {
                        parseEntry(rootNode, result);
                    } else {
                        java.util.Iterator<java.util.Map.Entry<String, JsonNode>> fields = rootNode.fields();
                        while (fields.hasNext()) {
                            java.util.Map.Entry<String, JsonNode> field = fields.next();
                            String title = field.getKey();
                            String category = field.getValue().asText();
                            addCategoryToResult(title, category, result);
                        }
                    }
                }
            }
            log.info("Ollama returned categories for {} titles", result.size());

        } catch (Exception e) {
            log.error("Failed to categorize meetings using Ollama", e);
        }

        return result;
    }

    private void parseEntry(JsonNode node, Map<String, MeetingType> result) {
        JsonNode titleNode = node.get("title");
        JsonNode categoryNode = node.get("category");
        
        if (titleNode != null && categoryNode != null) {
            addCategoryToResult(titleNode.asText(), categoryNode.asText(), result);
        }
    }

    private void addCategoryToResult(String title, String category, Map<String, MeetingType> result) {
        if (title != null && category != null) {
            try {
                result.put(title, MeetingType.valueOf(category.toUpperCase()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid category returned by Ollama: {}", category);
                result.put(title, MeetingType.OTHER);
            }
        }
    }

    @Data
    private static class OllamaRequest {
        private String model;
        private String prompt;
        private boolean stream;
        private String format;
        private Options options;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    private static class Options {
        private double temperature;
    }

    @Data
    private static class OllamaResponse {
        private String model;
        private String response;
        private boolean done;
    }
}
