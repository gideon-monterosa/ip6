FROM ollama/ollama

RUN nohup bash -c "ollama serve &" && \
    until ollama list > /dev/null 2>&1; do sleep 1; done && \
    ollama pull llama3.1:8b && \
    pkill ollama

EXPOSE 11434