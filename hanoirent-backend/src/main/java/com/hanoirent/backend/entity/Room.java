package com.hanoirent.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

import java.util.List;

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

    // --- CÁC THUỘC TÍNH CHI PHÍ MỞ RỘNG ---
    private BigDecimal electricityPrice; // VNĐ/kWh
    private BigDecimal waterPrice;       // VNĐ/m3 hoặc VNĐ/người
    private BigDecimal internetPrice;    // VNĐ/tháng
    private BigDecimal serviceFee;       // VNĐ/tháng

    // --- CÁC THUỘC TÍNH TIỆN ÍCH & QUY ĐỊNH ---
    private Integer parkingSlots;
    private Boolean hasElectricVehicleCharging;
    private Boolean allowPets;
    private Boolean freeHours;
    private Boolean airConditioner;
    private Boolean waterHeater;

    // --- DANH SÁCH ẢNH & VIDEO ---
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "room_images", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new java.util.ArrayList<>();

    private String videoUrl;

    @ManyToOne
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;      // Chủ trọ (Liên kết với bảng Users)
}