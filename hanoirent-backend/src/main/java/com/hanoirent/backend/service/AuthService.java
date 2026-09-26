package com.hanoirent.backend.service;

import com.hanoirent.backend.dto.AuthResponse;
import com.hanoirent.backend.dto.LoginRequest;
import com.hanoirent.backend.dto.RegisterRequest;
import com.hanoirent.backend.entity.User;
import com.hanoirent.backend.repository.UserRepository;
import com.hanoirent.backend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    // Xu ly Dang ky
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại trong hệ thống!");
        }

        if(userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Số điện thoại đã tồn tại trong hệ thống!");
        }

        User user = User.builder()
                .email(request.getEmail())
                // MÃ HÓA MẬT KHẨU BẰNG BCRYPT TRƯỚC KHI LƯU VÀO DB
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(request.getRole())
                .isVerified(false)
                .build();

        return userRepository.save(user);
    }

    // Xu ly Dang nhap
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại!"));

        Boolean isMatched = false;
        // Nếu mật khaair đã mà hóa thì xử lý bình thường
        if (user.getPassword().startsWith("$2a$") || user.getPassword().startsWith("$2b$")) {
            isMatched = passwordEncoder.matches(request.getPassword(), user.getPassword());
        }
        // Nếu chưa mã hóa thì so sánh mật khẩu cũ và tự động mã hóa
        else {
            if (request.getPassword().equals(user.getPassword())) {
                isMatched = true;
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                userRepository.save(user);
            }
        }

        if(!isMatched){
            throw new RuntimeException("Mật khẩu không chính xác!");
        }

        String token = jwtUtils.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}