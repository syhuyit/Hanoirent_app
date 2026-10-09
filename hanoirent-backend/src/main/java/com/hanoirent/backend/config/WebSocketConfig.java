package com.hanoirent.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Tiền tố cho các destination mà Client đăng ký nhận dữ liệu (Subscribe)
        // /user dùng cho tin nhắn riêng tư giữa 2 người (Private Chat)
        registry.enableSimpleBroker("/topic", "/queue", "/user");

        // Tiền tố cho các request gửi từ Client lên Server (@MessageMapping)
        registry.setApplicationDestinationPrefixes("/app");

        // Định tuyến tin nhắn riêng cho từng người dùng (/user/{userId}/queue/messages)
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint để Client (React) kết nối Handshake ban đầu
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Cho phép React gọi sang
                .withSockJS(); // Bật SockJS fallback nếu browser không hỗ trợ WebSocket thuần
    }
}
