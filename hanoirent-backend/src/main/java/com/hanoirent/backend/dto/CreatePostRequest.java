package com.hanoirent.backend.dto;

import com.hanoirent.backend.entity.District;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreatePostRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String description;

    @NotNull(message = "Giá thuê không được để trống")
    @Positive(message = "Giá thuê phải lớn hơn 0")
    private BigDecimal price;

    @Positive(message = "Diện tích phải lớn hơn 0")
    private Double area;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    @NotNull(message = "Quận/Huyện không được để trống")
    private District district;

    @NotBlank(message = "Phường/Xã không được để trống")
    private String ward;

    @NotNull(message = "ID chủ trọ không được để trống")
    private Long landlordId;

    // Chi phí mở rộng
    @Min(value = 0, message = "Giá điện không được âm")
    private BigDecimal electricityPrice;

    @Min(value = 0, message = "Giá nước không được âm")
    private BigDecimal waterPrice;

    @Min(value = 0, message = "Giá internet không được âm")
    private BigDecimal internetPrice;

    @Min(value = 0, message = "Phí dịch vụ không được âm")
    private BigDecimal serviceFee;

    // Tiện ích & quy định
    @Min(value = 0, message = "Số chỗ để xe không được âm")
    private Integer parkingSlots;
    private Boolean hasElectricVehicleCharging;
    private Boolean allowPets;
    private Boolean freeHours;
    private Boolean airConditioner;
    private Boolean waterHeater;

    // Mảng ảnh và video
    private List<String> images;
    private String videoUrl;
}