package com.example.spring_boot_app;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import static org.springframework.security.config.Customizer.withDefaults;

import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private SupabaseAuthFilter supabaseAuthFilter;
    /**
     * アプリケーション全体のセキュリティ設定を行います
     * - CORS（クロスオリジンリソースシェアリング:他オリジンからのアクセス）を有効化
     * - CSRF（クロスサイトリクエストフォージェリ:Cookie認証）を無効化
     * - 認証不要なエンドポイント許可
     * - それ以外のリクエストは認証必須
     *
     * @param http HttpSecurity設定オブジェクト
     * @return SecurityFilterChain
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(withDefaults())
            .csrf(csrf -> csrf.disable())            
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(
                        "/", "/*.html", "/*.css", "/*.js", "/favicon.ico", "/api/auth/**"
                    ).permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(supabaseAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /**
     * CORS（クロスオリジンリソースシェアリング:他オリジンからのアクセス）の設定を行います
     * - setAllowedOrigins : 許可するオリジン設定
     * - setAllowedMethods : 許可するHTTPメソッド設定
     * - setAllowedHeaders : 許可するリクエストヘッダー設定 ( * は全て許可)
     * - setAllowCredentials : 認証情報（Cookieや認証ヘッダー）の送信設定
     * - これらの設定を全てのパス（/**）に適用
     * 
     * @return CorsConfigurationSource
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:8080", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
 