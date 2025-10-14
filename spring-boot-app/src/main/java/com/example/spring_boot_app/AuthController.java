package com.example.spring_boot_app;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.Map;

import java.io.IOException;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private SupabaseAuthService supabaseAuthService;

    /**
     * アカウント登録を行います
     * @param request アカウント情報
     * @param uriBuilder URI構築
     * @return 実行結果
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody AuthRequest request, UriComponentsBuilder uriBuilder) {
        String redirectTo = uriBuilder.replacePath("/").build().toUriString();
        Map<String, Object> result = supabaseAuthService.signUp(request.getEmail(), request.getPassword(), redirectTo);
        return result.containsKey("id") 
                ? ResponseEntity.ok(Map.of("message", "Registration successful. Please check your email for confirmation."))
                : ResponseEntity.badRequest().body(result);
    }

    /**
     * アカウント情報を取得します
     * @param authorizationHeader Authorizationヘッダ
     * @return アカウント情報
     */
    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> authUser(@RequestHeader("Authorization") String authorizationHeader) {
        Map<String, Object> user = supabaseAuthService.getUserByAccessToken(authorizationHeader.substring(7));
        return ResponseEntity.ok(Map.of("email", user.get("email")));
    }

        /**
     * ログインを行います
     * @param request アカウント情報
     * @return 実行結果
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthRequest request) {
        Map<String, Object> result = supabaseAuthService.loginWithPassword(request.getEmail(), request.getPassword());
        return result.containsKey("access_token")
                ? ResponseEntity.ok(result)
                : ResponseEntity.badRequest().body(result);
    }

        /**
     * ログアウトを行います
     * @param authorizationHeader Authorizationヘッダ
     * @return 実行結果
     */
    @PostMapping("/logout")
   public ResponseEntity<Map<String, Object>> logout(@RequestHeader("Authorization") String authorizationHeader) {
        supabaseAuthService.logout(authorizationHeader.substring(7));
        return ResponseEntity.ok(Map.of("message", "Logout successful."));
    }

        /**
     * Github認証にリダイレクトします
     * @param response HTTPレスポンス
     * @param uriBuilder URI構築
     */
    @GetMapping("/oauth2/github")
    public void redirectToGitHub(HttpServletResponse response, UriComponentsBuilder uriBuilder) throws IOException {
        String redirectTo = uriBuilder.replacePath("/").build().toUriString();
        String supabaseAuthGitHubUrl = supabaseAuthService.getGitHubSignInUrl(redirectTo);
        response.sendRedirect(supabaseAuthGitHubUrl);
    }

}