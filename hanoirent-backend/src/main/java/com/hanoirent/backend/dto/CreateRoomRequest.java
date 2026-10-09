package com.hanoirent.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class CreateRoomRequest {
    private Long recipientId;
}
