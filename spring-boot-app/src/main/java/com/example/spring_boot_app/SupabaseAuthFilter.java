package com.example.spring_boot_app;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;
import java.util.Map;

@Slf4j
@Component
public class SupabaseAuthFilter extends OncePerRequestFilter {

    @Autowired
    private SupabaseAuthService supabaseAuthService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
    
        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        final String supabaseToken = authHeader.substring(7);
        try {
            // Supabaseに問い合わせてトークンを検証（同期的に実行）
            Map<String, Object> user = supabaseAuthService.getUserByAccessToken(supabaseToken);
            if (user != null && user.containsKey("id")) {
                String userId = (String) user.get("id");
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        null
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            // トークンが無効な場合は何もしない（後続のフィルターで弾かれる）
        }
        filterChain.doFilter(request, response);
    }
}