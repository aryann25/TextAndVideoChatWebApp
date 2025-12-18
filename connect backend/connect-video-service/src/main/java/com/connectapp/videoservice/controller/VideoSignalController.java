package com.connectapp.videoservice.controller;

import com.connectapp.videoservice.dto.CallEvent;
import com.connectapp.videoservice.dto.SignalMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class VideoSignalController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/call/start")
    public void startCall(CallEvent event) {
        log.info("Starting call from {} to {}", event.getFrom(), event.getTo());
        messagingTemplate.convertAndSendToUser(
                event.getTo(),
                "/queue/call",
                new CallEvent("INCOMING_CALL", event.getFrom(), event.getTo())
        );
    }

    @MessageMapping("/call/accept")
    public void acceptCall(CallEvent event) {
        log.info("Call accepted by {}", event.getTo());
        messagingTemplate.convertAndSendToUser(
                event.getFrom(),
                "/queue/call",
                new CallEvent("CALL_ACCEPTED", event.getTo(), event.getFrom())
        );
    }

    @MessageMapping("/call/end")
    public void endCall(CallEvent event) {
        log.info("Call ended between {} and {}", event.getFrom(), event.getTo());
        messagingTemplate.convertAndSendToUser(event.getTo(), "/queue/call", event);
        messagingTemplate.convertAndSendToUser(event.getFrom(), "/queue/call", event);
    }

    @MessageMapping("/signal")
    public void relaySignal(SignalMessage message) {
        log.debug("Relaying {} signal from {} to {}", message.getType(), message.getFrom(), message.getTo());
        messagingTemplate.convertAndSendToUser(
                message.getTo(),
                "/queue/signal",
                message
        );
    }
}