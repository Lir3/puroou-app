package com.example.spring_boot_app;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
}