package com.hanoirent.backend.dto;

import com.hanoirent.backend.entity.District;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreatePostRequest {
    private String title;
    private String description;
    private BigDecimal price;
    private Double area;
    private String address;
    private District district;
    private String ward;
    private Long landlordId; // ID của chủ trọ đang đăng bài
}