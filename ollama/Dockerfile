FROM ollama/ollama

COPY meeting-classifier.mf /tmp/meeting-classifier.mf

RUN nohup bash -c "ollama serve &" && \
    until ollama list > /dev/null 2>&1; do sleep 1; done && \
    ollama pull llama3.2:1b && \
    ollama create meeting-bot -f /tmp/meeting-classifier.mf && \
    pkill ollama

EXPOSE 11434