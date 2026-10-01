package com.hanoirent.backend.dto;

import com.hanoirent.backend.entity.District;
import com.hanoirent.backend.entity.PropertyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostFilterRequest {
    // Khu vực & loại hình
    private District district;
    private String ward;
    private PropertyType propertyType;

    // Khoảng giá thuê
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    // Giới hạn đơn giá dịch vụ tối đa
    private BigDecimal maxElectricityPrice;
    private BigDecimal maxWaterPrice;
    private BigDecimal maxInternetPrice;

    // Tiện ích & quy định
    private Integer minParkingSlots;
    private Boolean hasElectricVehicleCharging;
    private Boolean allowPets;
    private Boolean freeHours;
    private Boolean airConditioner;
    private Boolean waterHeater;

    // Phân trang
    private Integer page = 0;
    private Integer size = 10;
}