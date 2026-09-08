package com.hanoirent.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;       // Ví dụ: Phòng trọ khép kín Cầu Giấy

    @Column(columnDefinition = "TEXT")
    private String description; // Mô tả chi tiết

    @Column(nullable = false)
    private BigDecimal price;   // Giá thuê (VNĐ/tháng)

    private Double area;        // Diện tích (m2)

    @Column(nullable = false)
    private String address;     // Địa chỉ chi tiết (VD: Số 12 ngõ 80)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private District district;  // Quận/Huyện (VD: Cầu Giấy, Đống Đa)

    private String ward;        // Phường/Xã

    @Column(name = "is_available")
    private Boolean isAvailable = true; // Còn trống hay đã cho thuê

    @ManyToOne
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;      // Chủ trọ (Liên kết với bảng Users)
}