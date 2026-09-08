package com.hanoirent.backend.dto;

import com.hanoirent.backend.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private Role role; // TENANT hoac LANDLORD
}