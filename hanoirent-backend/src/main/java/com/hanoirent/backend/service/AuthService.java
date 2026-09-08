package com.hanoirent.backend.service;

import com.hanoirent.backend.dto.LoginRequest;
import com.hanoirent.backend.dto.RegisterRequest;
import com.hanoirent.backend.entity.User;
import com.hanoirent.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    // Xu ly Dang ky
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại trong hệ thống!");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(request.getPassword()) // Se ma hoa password sau khi config Security
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(request.getRole())
                .isVerified(false)
                .build();

        return userRepository.save(user);
    }

    // Xu ly Dang nhap
    public User login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại!"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Mật khẩu không chính xác!");
        }

        return user;
    }
}