package com.hanoirent.backend.repository;

import com.hanoirent.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // Lấy toàn bộ tin nhắn trong một phòng chat theo thứ tự thời gian
    List<ChatMessage> findByChatRoomIdOrderByTimestampAsc(Long chatRoomId);

    // Đếm số tin nhắn chưa đọc gửi tới user này
    long countByRecipientIdAndIsReadFalse(Long recipientId);

    // Đếm số tin nhắn chưa đọc trong 1 phòng chat cụ thể (Tối ưu hiệu năng, không tải entity vào RAM)
    long countByChatRoomIdAndRecipientIdAndIsReadFalse(Long chatRoomId, Long recipientId);

    // Lấy tin nhắn cuối cùng của một phòng chat (Dùng Spring Data derived query chuẩn, bỏ LIMIT 1 không chuẩn JPQL)
    Optional<ChatMessage> findFirstByChatRoomIdOrderByTimestampDesc(Long chatRoomId);

    // Cập nhật trạng thái đã đọc hàng loạt bằng 1 câu lệnh UPDATE (Tối ưu cực lớn)
    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.chatRoom.id = :chatRoomId AND m.recipient.id = :recipientId AND m.isRead = false")
    void markAllMessagesAsRead(@Param("chatRoomId") Long chatRoomId, @Param("recipientId") Long recipientId);
}