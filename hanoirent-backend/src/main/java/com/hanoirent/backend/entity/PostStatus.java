package com.hanoirent.backend.entity;

public enum PostStatus {
    PENDING,   // Chờ Admin duyệt
    APPROVED,  // Đã duyệt (hiển thị lên trang chủ)
    REJECTED,  // Bị từ chối
    HIDDEN     // Chủ trọ ẩn bài (khi đã cho thuê)
}