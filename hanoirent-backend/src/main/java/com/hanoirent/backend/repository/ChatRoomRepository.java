package com.hanoirent.backend.repository;

import com.hanoirent.backend.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    // Tìm phòng chat giữa 2 user (không phân biệt ai là sender hay recipient)
    @Query("SELECT c FROM ChatRoom c WHERE (c.sender.id = :user1Id AND c.recipient.id = :user2Id) OR (c.sender.id = :user2Id AND c.recipient.id = :user1Id)")
    Optional<ChatRoom> findBySenderIdAndRecipientId(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);

    // Lấy tất cả các phòng chat mà một user tham gia
    @Query("SELECT c FROM ChatRoom c WHERE c.sender.id = :userId OR c.recipient.id = :userId ORDER BY c.createdAt DESC")
    List<ChatRoom> findAllByUserId(@Param("userId") Long userId);
}