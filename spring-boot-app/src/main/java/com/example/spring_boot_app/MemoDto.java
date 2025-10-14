package com.example.spring_boot_app;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MemoDto {

    @NotBlank
    @Size(max = 50)
    private String title;
    @Size(max = 200)
    private String content;
}