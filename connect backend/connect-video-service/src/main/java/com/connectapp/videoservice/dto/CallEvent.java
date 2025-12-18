package com.connectapp.videoservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CallEvent {
    private String type;   // INCOMING_CALL, CALL_ACCEPTED, CALL_ENDED
    private String from;
    private String to;
}
