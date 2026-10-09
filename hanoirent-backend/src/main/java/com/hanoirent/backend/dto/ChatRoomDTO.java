package com.hanoirent.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomDTO {
    private Long id;
    private Long partnerId; // Id của người chat cùng
    private String partnerName; // Tên của người chat cùng
    private String partnerAvatar; // Avatar của người chat cùng
    private String lastMessage; // Tin nhắn cuối cùng
    private LocalDateTime lastMessageTime; // Thời gian của tin nhắn cuối cùng
    private long unreadCount; // Số tin nhắn chưa đọc trong phòng này
}
