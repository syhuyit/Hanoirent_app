package com.hanoirent.backend.repository;

import com.hanoirent.backend.entity.District;
import com.hanoirent.backend.entity.Post;
import com.hanoirent.backend.entity.PostStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // Lấy các bài đăng đã duyệt để hiển thị trang chủ
    List<Post> findByStatus(PostStatus status);

    // Lọc bài đăng theo Quận/Huyện và trạng thái đã duyệt
    List<Post> findByStatusAndRoomDistrict(PostStatus status, District district);

    // Lấy danh sách bài đăng của 1 chủ trọ cụ thể
    List<Post> findByRoomLandlordId(Long landlordId);
}