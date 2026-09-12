package com.hanoirent.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id //primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // id tự tăng
    private Long id;

    @Column(nullable = false, unique = true) // nullable = false: k đc để trống, unique = true: giá trị phải là duy nhất
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(unique = true)
    private String phone;

    private String avatar;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "is_verified")
    private Boolean isVerified = false; // xác minh danh tính chủ trọ

    @Column(name = "created_at") // thời gian tạo tài khoản
    private LocalDateTime createdAt = LocalDateTime.now();
}