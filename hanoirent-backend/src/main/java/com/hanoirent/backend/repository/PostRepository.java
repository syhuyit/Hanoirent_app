package com.hanoirent.backend.repository;

import com.hanoirent.backend.entity.District;
import com.hanoirent.backend.entity.Post;
import com.hanoirent.backend.entity.PostStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // Lấy các bài đăng theo trạng thái (Dành cho Admin lấy danh sách PENDING)
    List<Post> findByStatus(PostStatus status);

    // Lấy các bài đăng đã duyệt và còn trống để hiển thị trang chủ cho Người thuê
    List<Post> findByStatusAndRoomIsAvailableTrue(PostStatus status);

    // Lọc bài đăng theo Quận/Huyện, trạng thái đã duyệt và còn trống
    List<Post> findByStatusAndRoomDistrictAndRoomIsAvailableTrue(PostStatus status, District district);

    // Lấy danh sách bài đăng của 1 chủ trọ cụ thể
    List<Post> findByRoomLandlordId(Long landlordId);
}