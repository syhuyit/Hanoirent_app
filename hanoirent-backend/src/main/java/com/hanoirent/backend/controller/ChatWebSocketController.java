package com.hanoirent.backend.controller;

import com.hanoirent.backend.dto.ChatMessageDTO;
import com.hanoirent.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    // Client gửi tin nhắn tới endpoint: /app/chat.sendMessage
    @MessageMapping("/chat.sendMessage")
    public void processMessage(@Payload ChatMessageDTO chatMessageDTO){
        // Lưu tin nhắn vào database
        ChatMessageDTO savedMessage = chatService.saveMessage(chatMessageDTO);

        // 1. Gửi tin nhắn tới toàn bộ thành viên đang mở phòng chat này
        messagingTemplate.convertAndSend(
                "/topic/room." + savedMessage.getChatRoomId(),
                savedMessage
        );

        // 2. Gửi thông báo tin nhắn mới tới kênh người nhận (để cập nhật unread badge / preview)
        messagingTemplate.convertAndSend(
                "/topic/user." + savedMessage.getRecipientId(),
                savedMessage
        );

        // 3. Hỗ trợ chuẩn STOMP convertAndSendToUser cho cả 2 phía
        try {
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(savedMessage.getRecipientId()),
                    "/queue/messages",
                    savedMessage
            );
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(savedMessage.getSenderId()),
                    "/queue/messages",
                    savedMessage
            );
        } catch (Exception ignored) {
            // Fallback an toàn nếu STOMP session không gắn User Principal
        }
    }
}
