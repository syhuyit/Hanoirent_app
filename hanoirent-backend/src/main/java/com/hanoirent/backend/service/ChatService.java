package com.hanoirent.backend.service;

import com.hanoirent.backend.dto.ChatMessageDTO;
import com.hanoirent.backend.dto.ChatRoomDTO;
import com.hanoirent.backend.entity.ChatMessage;
import com.hanoirent.backend.entity.ChatRoom;
import com.hanoirent.backend.entity.User;
import com.hanoirent.backend.repository.ChatMessageRepository;
import com.hanoirent.backend.repository.ChatRoomRepository;
import com.hanoirent.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    // Tạo hoặc lấy phòng chat đã tồn tại giữa 2 user
    @Transactional
    public ChatRoomDTO getOrCreateChatRoom(Long senderId, Long recipientId) {
        if (senderId.equals(recipientId)) {
            throw new RuntimeException("Không thể tạo cuộc trò chuyện với chính mình!");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        ChatRoom chatRoom = chatRoomRepository.findBySenderIdAndRecipientId(senderId, recipientId)
                .orElseGet(() -> {
                    ChatRoom newRoom = ChatRoom.builder()
                            .sender(sender)
                            .recipient(recipient)
                            .build();
                    return chatRoomRepository.save(newRoom);
                });

        return mapToChatRoomDTO(chatRoom, senderId);
    }

    // Lấy danh sách tất cả các cuộc hội thoại của 1 user
    public List<ChatRoomDTO> getUserChatRooms(Long userId) {
        List<ChatRoom> chatRooms = chatRoomRepository.findAllByUserId(userId);
        List<ChatRoomDTO> dtoList = new ArrayList<>();

        for (ChatRoom room : chatRooms) {
            dtoList.add(mapToChatRoomDTO(room, userId));
        }

        return dtoList;
    }

    // Lấy lịch sử tin nhắn của 1 phòng chat (Bảo mật: Phải là thành viên trong phòng)
    @Transactional
    public List<ChatMessageDTO> getChatMessages(Long chatRoomId, Long currentUserId) {
        ChatRoom room = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Phòng chat không tồn tại!"));

        // Kiểm tra quyền: Chỉ sender hoặc recipient của phòng này mới được xem
        if (!room.getSender().getId().equals(currentUserId) && !room.getRecipient().getId().equals(currentUserId)) {
            throw new RuntimeException("Bạn không có quyền truy cập vào cuộc hội thoại này!");
        }

        markMessagesAsRead(chatRoomId, currentUserId);

        List<ChatMessage> messages = chatMessageRepository.findByChatRoomIdOrderByTimestampAsc(chatRoomId);
        List<ChatMessageDTO> dtoList = new ArrayList<>();

        for (ChatMessage msg : messages) {
            dtoList.add(mapToChatMessageDTO(msg));
        }

        return dtoList;
    }

    // Lưu tin nhắn mới vào database
    @Transactional
    public ChatMessageDTO saveMessage(ChatMessageDTO messageDTO) {
        ChatRoom chatRoom = chatRoomRepository.findById(messageDTO.getChatRoomId())
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        User sender = userRepository.findById(messageDTO.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User recipient = userRepository.findById(messageDTO.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        ChatMessage message = ChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(sender)
                .recipient(recipient)
                .content(messageDTO.getContent())
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build();

        ChatMessage saved = chatMessageRepository.save(message);
        return mapToChatMessageDTO(saved);
    }

    // Đánh dấu tất cả tin nhắn trong phòng chat là đã đọc (Tối ưu bằng UPDATE query)
    @Transactional
    public void markMessagesAsRead(Long chatRoomId, Long recipientId) {
        chatMessageRepository.markAllMessagesAsRead(chatRoomId, recipientId);
    }

    // Đếm tổng số tin nhắn chưa đọc của user (để hiển thị badge trên Navbar)
    public long countTotalUnreadMessages(Long userId) {
        return chatMessageRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    // --- HELPER METHODS ---

    private ChatRoomDTO mapToChatRoomDTO(ChatRoom room, Long currentUserId) {
        User partner = room.getSender().getId().equals(currentUserId) ? room.getRecipient() : room.getSender();

        Optional<ChatMessage> lastMsgOpt = chatMessageRepository.findFirstByChatRoomIdOrderByTimestampDesc(room.getId());

        String lastMessage = lastMsgOpt.map(ChatMessage::getContent).orElse("Chưa có tin nhắn");
        LocalDateTime lastMessageTime = lastMsgOpt.map(ChatMessage::getTimestamp).orElse(room.getCreatedAt());

        // Đếm unread trực tiếp qua DB thay vì tải toàn bộ tin nhắn vào bộ nhớ RAM
        long unreadCount = chatMessageRepository.countByChatRoomIdAndRecipientIdAndIsReadFalse(room.getId(), currentUserId);

        String partnerName = (partner.getFullName() != null && !partner.getFullName().isBlank())
                ? partner.getFullName()
                : partner.getEmail();

        return ChatRoomDTO.builder()
                .id(room.getId())
                .partnerId(partner.getId())
                .partnerName(partnerName)
                .partnerAvatar(partner.getAvatar())
                .lastMessage(lastMessage)
                .lastMessageTime(lastMessageTime)
                .unreadCount(unreadCount)
                .build();
    }

    private ChatMessageDTO mapToChatMessageDTO(ChatMessage msg) {
        User sender = msg.getSender();
        String senderName = (sender.getFullName() != null && !sender.getFullName().isBlank())
                ? sender.getFullName()
                : sender.getEmail();

        return ChatMessageDTO.builder()
                .id(msg.getId())
                .chatRoomId(msg.getChatRoom().getId())
                .senderId(sender.getId())
                .senderName(senderName)
                .senderAvatar(sender.getAvatar())
                .recipientId(msg.getRecipient().getId())
                .content(msg.getContent())
                .timestamp(msg.getTimestamp())
                .isRead(msg.isRead())
                .build();
    }
}