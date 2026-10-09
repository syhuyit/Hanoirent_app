package com.hanoirent.backend.controller;

import com.hanoirent.backend.dto.ChatMessageDTO;
import com.hanoirent.backend.dto.ChatRoomDTO;
import com.hanoirent.backend.dto.CreateRoomRequest;
import com.hanoirent.backend.entity.User;
import com.hanoirent.backend.repository.UserRepository;
import com.hanoirent.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRESTController {
    private final ChatService chatService;
    private final UserRepository userRepository;

    // Helper lấy user đang đăng nhập từ JWT Token
    private User getAuthenticateUser(Authentication authentication){
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Yêu cầu xác thực đăng nhập!");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        if (principal instanceof String) {
            return userRepository.findByEmail((String) principal)
                    .orElseThrow(() -> new RuntimeException("User not found: " + principal));
        }
        throw new RuntimeException("Không tìm thấy thông tin người dùng xác thực!");
    }

    // Tạo hoặc lấy phòng chat với 1 người dùng khác
    @PostMapping("/rooms")
    public ResponseEntity<ChatRoomDTO> createOrGetRoom(@RequestBody CreateRoomRequest request, Authentication authentication) {
        User currentUser = getAuthenticateUser(authentication);
        ChatRoomDTO room = chatService.getOrCreateChatRoom(currentUser.getId(), request.getRecipientId());
        return ResponseEntity.ok(room);
    }

    // Lấy danh sách tất cả phòng chat của người dùng hiện tại
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomDTO>> getUserRooms(Authentication authentication) {
        User currentUser = getAuthenticateUser(authentication);
        List<ChatRoomDTO> rooms = chatService.getUserChatRooms(currentUser.getId());
        return ResponseEntity.ok(rooms);
    }

    // Lấy lịch sử tin nhắn của 1 phòng chat cụ thể
    @GetMapping("/messages/{roomId}")
    public ResponseEntity<List<ChatMessageDTO>> getRoomMessages(@PathVariable Long roomId, Authentication authentication) {
        User currentUser = getAuthenticateUser(authentication);
        List<ChatMessageDTO> messages = chatService.getChatMessages(roomId, currentUser.getId());
        return ResponseEntity.ok(messages);
    }

    // Lấy tổng số tin nhắn chưa đọc của người dùng hiện tại
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        User currentUser = getAuthenticateUser(authentication);
        Long count = chatService.countTotalUnreadMessages(currentUser.getId());
        return ResponseEntity.ok(count);
    }
}
