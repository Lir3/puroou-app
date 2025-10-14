package com.example.spring_boot_app;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Map;

import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.beans.factory.annotation.Value;

@Service
public class SupabaseAuthService {

    @Autowired
    private WebClient webClient;

    @Value("${supabase.url}")
    private String supabaseUrl;
    
    /**
     * Eメール/パスワードを使ってSupabase認証のアカウント登録を行います
     * @param email Eメール
     * @param password パスワード
     * @param redirectTo アカウント認証時にコールバックするリダイレクトURL
     * @return 登録結果
     */
    public Map<String, Object> signUp(String email, String password, String redirectTo) {
        return webClient.post()
                .uri("/auth/v1/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of("email", email, "password", password, "options", Map.of("email_redirect_to", redirectTo)))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();
    }

    /**
     * アクセストークンより Supabase のアカウント情報を取得する
     * @param accessToken アクセストークン
     * @return アカウント情報
     */
    public Map<String, Object> getUserByAccessToken(String accessToken) {
        return webClient.get()
                .uri("/auth/v1/user")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();
    }

        /**
     * Eメール/パスワードを使ってSupabase認証を行います
     * @param email Eメール
     * @param password パスワード
     * @return 認証結果
     */
    public Map<String, Object> loginWithPassword(String email, String password) {
        return webClient.post()
                .uri("/auth/v1/token?grant_type=password")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of("email", email, "password", password))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();
    }
    
        /**
     * アクセストークンよりログアウトを行います
     * @param accessToken アクセストークン
     */
    public void logout(String accessToken) {
        webClient.post()
            .uri("/auth/v1/logout")
            .header("Authorization", "Bearer " + accessToken)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
            .block();
    }

        /**
     * SupabaseのGitHub認証を開始するためのURLを取得する
     * @param redirectTo アカウント認証時にコールバックするリダイレクトURL
     * @return SupabaseのGitHub認証URL
     */
    public String getGitHubSignInUrl(String redirectTo) {
        return UriComponentsBuilder.fromHttpUrl(this.supabaseUrl)
                .path("/auth/v1/authorize")
                .queryParam("provider", "github")
                .queryParam("redirect_to", redirectTo)
                .queryParam("scopes", "user:email")
                .toUriString();
    }    

}